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
function toUserFacingError(err: OpenRouterError) {
	console.error(
		`[openrouter] ${err.statusCode}: ${err.message} ${err.body ?? ""}`,
	);

	if (err.statusCode === 429)
		return new ServiceUnavailableError(
			"Kuota AI sedang penuh, coba lagi nanti",
			"AI_DRAFTING_QUOTA_EXCEEDED",
		);

	if (
		err.statusCode === 401 ||
		err.statusCode === 402 ||
		err.statusCode === 403 ||
		err.statusCode >= 500
	)
		return new ServiceUnavailableError(
			"Layanan AI sedang tidak tersedia, coba lagi nanti",
			"AI_DRAFTING_UNAVAILABLE",
		);

	return err;
}

export async function generateDraftMessage(prompt: string): Promise<string> {
	if (!env.openRouterApiKey)
		throw new ServiceUnavailableError(
			"Fitur draft AI belum dikonfigurasi",
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
			if (err instanceof RequestTimeoutError)
				throw new ServiceUnavailableError(
					"Pembuatan draft terlalu lama, coba lagi sebentar lagi",
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
