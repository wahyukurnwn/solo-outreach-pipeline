import { afterEach, describe, expect, it, vi } from "vitest";
import { app } from "../../app";
import { env } from "../../config/env";
import {
	cleanupUser,
	createProspect,
	createTestUser,
} from "../../test/helpers";

function draftFor(prospectId: string, authHeaders: Record<string, string>) {
	return app.request(`/api/prospects/${prospectId}/draft`, {
		method: "POST",
		headers: authHeaders,
	});
}

// SDK OpenRouter asli tetap dipakai (ikut memvalidasi bentuk respons) — yang
// di-stub cuma fetch global di bawahnya, jadi tidak ada request keluar.
function mockOpenRouterResponse(text: string) {
	return vi.fn().mockImplementation(
		async () =>
			new Response(
				JSON.stringify({
					id: "gen-test",
					object: "chat.completion",
					created: 1,
					model: "nvidia/nemotron-3-ultra-550b-a55b:free",
					system_fingerprint: "fp_test",
					choices: [
						{
							index: 0,
							finish_reason: "stop",
							message: { role: "assistant", content: text },
						},
					],
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } },
			),
	);
}

describe("draft", () => {
	const createdUserIds: string[] = [];
	const originalOpenRouterApiKey = env.openRouterApiKey;

	afterEach(async () => {
		await Promise.all(createdUserIds.splice(0).map(cleanupUser));
		Object.assign(env, { openRouterApiKey: originalOpenRouterApiKey });
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it("rejects requests without a token", async () => {
		const res = await draftFor("00000000-0000-0000-0000-000000000000", {});

		expect(res.status).toBe(401);
	});

	it("returns 503 when OPENROUTER_API_KEY is not configured", async () => {
		Object.assign(env, { openRouterApiKey: undefined });
		const { id, authHeaders } = await createTestUser();
		createdUserIds.push(id);
		const prospect = await createProspect(authHeaders, {
			name: "Budi Santoso",
		});

		const res = await draftFor(prospect.id, authHeaders);

		expect(res.status).toBe(503);
	});

	it("returns 404 for a prospect that doesn't belong to the user", async () => {
		Object.assign(env, { openRouterApiKey: "test-key" });
		vi.stubGlobal("fetch", mockOpenRouterResponse("draft"));

		const owner = await createTestUser();
		const other = await createTestUser();
		createdUserIds.push(owner.id, other.id);
		const prospect = await createProspect(owner.authHeaders);

		const res = await draftFor(prospect.id, other.authHeaders);

		expect(res.status).toBe(404);
	});

	it("generates a draft from the prospect's own data", async () => {
		Object.assign(env, { openRouterApiKey: "test-key" });
		const fetchMock = mockOpenRouterResponse(
			"Halo Budi, senang ngobrol soal jasa foto produk kemarin!",
		);
		vi.stubGlobal("fetch", fetchMock);

		const { id, authHeaders } = await createTestUser();
		createdUserIds.push(id);
		const prospect = await createProspect(authHeaders, {
			name: "Budi Santoso",
			company: "Toko Kue Nusantara",
			notes: "Ketemu di pameran UMKM, tertarik jasa foto produk.",
		});

		const res = await draftFor(prospect.id, authHeaders);
		const json = await res.json();

		expect(res.status).toBe(200);
		expect(json.draft).toContain("Budi");

		expect(fetchMock).toHaveBeenCalledOnce();
		// SDK memanggil fetch dengan objek Request, bukan (url, init).
		const [request] = fetchMock.mock.calls[0] as [Request];
		expect(request.url).toBe("https://openrouter.ai/api/v1/chat/completions");
		expect(request.headers.get("Authorization")).toBe("Bearer test-key");
		const body = await request.json();
		expect(body.model).toBe(env.openRouterModel);
		expect(body.messages[0].content).toContain("Budi Santoso");
		expect(body.messages[0].content).toContain("Toko Kue Nusantara");
		expect(body.messages[0].content).toContain("pameran UMKM");
	});

	it("propagates an error when the OpenRouter API fails", async () => {
		Object.assign(env, { openRouterApiKey: "test-key" });
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(new Response("bad request", { status: 422 })),
		);

		const { id, authHeaders } = await createTestUser();
		createdUserIds.push(id);
		const prospect = await createProspect(authHeaders);

		const res = await draftFor(prospect.id, authHeaders);

		expect(res.status).toBe(500);
	});
	it("returns 503 with a retryable message when OpenRouter times out", async () => {
		Object.assign(env, { openRouterApiKey: "test-key" });
		// Fetch native menolak dengan TimeoutError saat AbortSignal.timeout habis
		// — SDK memetakannya ke RequestTimeoutError, tanpa menunggu 30s sungguhan.
		vi.stubGlobal(
			"fetch",
			vi.fn().mockRejectedValue(new DOMException("timed out", "TimeoutError")),
		);

		const { id, authHeaders } = await createTestUser();
		createdUserIds.push(id);
		const prospect = await createProspect(authHeaders);

		const res = await draftFor(prospect.id, authHeaders);
		const json = await res.json();

		expect(res.status).toBe(503);
		expect(json.error.code).toBe("AI_DRAFTING_TIMEOUT");
	});
	// Balasan error OpenRouter yang sebenarnya (key dicabut) — dulu berakhir
	// sebagai "Terjadi kesalahan pada server" generik.
	it.each([
		[401, "AI_DRAFTING_UNAVAILABLE"],
		[402, "AI_DRAFTING_UNAVAILABLE"],
		[503, "AI_DRAFTING_UNAVAILABLE"],
		[429, "AI_DRAFTING_QUOTA_EXCEEDED"],
	])(
		"maps an OpenRouter %i response to a clear %s error",
		async (status, code) => {
			Object.assign(env, { openRouterApiKey: "test-key" });
			vi.spyOn(console, "error").mockImplementation(() => {});
			vi.stubGlobal(
				"fetch",
				vi
					.fn()
					.mockResolvedValue(
						new Response(
							JSON.stringify({ error: { message: "upstream", code: status } }),
							{ status, headers: { "Content-Type": "application/json" } },
						),
					),
			);

			const { id, authHeaders } = await createTestUser();
			createdUserIds.push(id);
			const prospect = await createProspect(authHeaders);

			const res = await draftFor(prospect.id, authHeaders);
			const json = await res.json();

			expect(res.status).toBe(503);
			expect(json.error.code).toBe(code);
		},
	);
});
