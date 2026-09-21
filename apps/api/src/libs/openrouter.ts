import { OpenRouter } from "@openrouter/sdk";
import {
	OpenRouterError,
	RequestTimeoutError,
} from "@openrouter/sdk/models/errors";
import { env } from "../config/env";
import { ServiceUnavailableError } from "../exceptions";

// Model gratis latensinya tidak stabil (terukur 16s–77s untuk prompt yang
// sama) — tanpa batas, tombol "Draft dengan AI" bisa menggantung lebih dari
// satu menit. 30s cukup untuk kasus normal dan memutus kasus antrean panjang.
const DRAFT_TIMEOUT_MS = 30_000;

// Default SDK: retry backoff tanpa henti sampai 1 jam untuk timeout/error
// koneksi/5XX — itu membuat timeout di atas tidak pernah benar-benar memutus,
// dan tiap retry menghabiskan jatah request gratis. Cukup gagal cepat: user
// tinggal klik lagi.
const NO_RETRY = { strategy: "none" } as const;

// Error dari provider (key salah/dicabut, kuota habis, provider down) bukan
// salah user dan bukan bug kita — user cukup diberi pesan yang jelas, bukan
// "kesalahan pada server" generik. Penyebab aslinya tetap dicetak ke log
// karena error jenis ini (mis. key dicabut) harus diketahui developer.
//
// Provider gratis yang kewalahan kadang dibalas OpenRouter dengan HTTP 200
// yang isinya `{"error":{"code":503,...}}` — SDK gagal memvalidasinya sebagai
// hasil chat dan melaporkan statusCode 200, jadi kode error yang sebenarnya
// harus dibaca dari body.
function effectiveStatus(err: OpenRouterError) {
	try {
		const code = JSON.parse(err.body)?.error?.code;
		if (typeof code === "number") return code;
	} catch {
		// body bukan JSON — pakai status HTTP apa adanya
	}

	return err.statusCode;
}

function toUserFacingError(err: OpenRouterError) {
	const status = effectiveStatus(err);
	console.error(`[openrouter] ${status}: ${err.message} ${err.body ?? ""}`);

	if (status === 429)
		return new ServiceUnavailableError(
			"AI quota is currently full, please try again later",
			"AI_DRAFTING_QUOTA_EXCEEDED",
		);

	if (status === 401 || status === 402 || status === 403 || status >= 500)
		return new ServiceUnavailableError(
			"The AI service is currently unavailable, please try again later",
			"AI_DRAFTING_UNAVAILABLE",
		);

	return err;
}

// Timeout bisa datang dalam dua bentuk: RequestTimeoutError (saat koneksi/
// header) atau DOMException TimeoutError mentah (saat SDK sedang membaca body
// balasan) — model gratis yang lambat sering kena bentuk kedua.
function isTimeout(err: unknown) {
	return (
		err instanceof RequestTimeoutError ||
		(err instanceof Error && err.name === "TimeoutError")
	);
}

export async function generateDraftMessage(prompt: string): Promise<string> {
	if (!env.openRouterApiKey)
		throw new ServiceUnavailableError(
			"AI drafting is not configured",
			"AI_DRAFTING_NOT_CONFIGURED",
		);

	// Client dibuat per panggilan (bukan singleton modul) supaya selalu membaca
	// API key terkini dari env — murah, cuma objek konfigurasi tanpa koneksi.
	const client = new OpenRouter({ apiKey: env.openRouterApiKey });

	const result = await client.chat
		.send(
			{
				chatRequest: {
					model: env.openRouterModel,
					messages: [{ role: "user", content: prompt }],
					// Model reasoning (mis. Nemotron) memakai sebagian budget token untuk
					// "berpikir" sebelum jawaban — terlalu kecil bikin content kosong.
					maxCompletionTokens: 1500,
					stream: false,
				},
			},
			{ timeoutMs: DRAFT_TIMEOUT_MS, retries: NO_RETRY },
		)
		.catch((err: unknown) => {
			if (isTimeout(err))
				throw new ServiceUnavailableError(
					"Drafting took too long, please try again in a moment",
					"AI_DRAFTING_TIMEOUT",
				);
			if (err instanceof OpenRouterError) throw toUserFacingError(err);
			throw err;
		});

	// Tipe balikan SDK gabungan ChatResult | EventStream; stream:false selalu
	// menghasilkan ChatResult, guard ini cuma menyempitkan tipenya.
	if (!("choices" in result))
		throw new Error("OpenRouter returned an unexpected streaming response");

	const content = result.choices[0]?.message.content;
	const text =
		typeof content === "string"
			? content
			: content?.map((part) => ("text" in part ? part.text : "")).join("");

	if (!text?.trim()) throw new Error("OpenRouter returned no text content");

	return text.trim();
}
