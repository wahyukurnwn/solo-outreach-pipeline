import { Hono } from "hono";
import { afterEach, describe, expect, it } from "vitest";
import { AppError } from "../exceptions";
import { rateLimit, resetRateLimits } from "./rate-limit";

// Menguji rateLimit() langsung (bukan authRateLimit) di aplikasi Hono kecil
// sendiri — authRateLimit sengaja jadi no-op di bawah Vitest (lihat komentar
// di rate-limit.ts), jadi mengetes lewat auth.route.ts tidak akan pernah
// benar-benar memicu limit-nya.
function buildApp(max: number) {
	const app = new Hono().get(
		"/ping",
		rateLimit({ windowMs: 60_000, max, keyPrefix: "test" }),
		(c) => c.json({ ok: true }),
	);

	// app.ts (aplikasi sesungguhnya) yang punya onError ini — app percobaan di
	// sini butuh salinannya sendiri supaya TooManyRequestsError balik sebagai
	// JSON, bukan plain-text message bawaan HTTPException.
	app.onError((err, c) => {
		if (err instanceof AppError) return c.json(err.toBody(), err.status);
		throw err;
	});

	return app;
}

describe("rateLimit middleware", () => {
	afterEach(resetRateLimits);

	it("allows requests up to the limit and blocks the next one", async () => {
		const app = buildApp(3);
		const headers = { "x-forwarded-for": "203.0.113.10" };

		for (let i = 0; i < 3; i++) {
			const res = await app.request("/ping", { headers });
			expect(res.status).toBe(200);
		}

		const blockedRes = await app.request("/ping", { headers });
		const json = await blockedRes.json();

		expect(blockedRes.status).toBe(429);
		expect(json.error.code).toBe("TOO_MANY_REQUESTS");
		expect(json.error.details.retryAfterSeconds).toBeGreaterThan(0);
	});

	it("tracks each client ip separately", async () => {
		const app = buildApp(1);

		const first = await app.request("/ping", {
			headers: { "x-forwarded-for": "203.0.113.1" },
		});
		const second = await app.request("/ping", {
			headers: { "x-forwarded-for": "203.0.113.2" },
		});

		expect(first.status).toBe(200);
		expect(second.status).toBe(200);
	});

	it("uses only the first address when x-forwarded-for has a proxy chain", async () => {
		const app = buildApp(1);
		const headers = { "x-forwarded-for": "203.0.113.5, 10.0.0.1" };

		const first = await app.request("/ping", { headers });
		const second = await app.request("/ping", { headers });

		expect(first.status).toBe(200);
		expect(second.status).toBe(429);
	});

	it("falls back to a shared bucket when no ip can be determined", async () => {
		const app = buildApp(1);

		const first = await app.request("/ping");
		const second = await app.request("/ping");

		expect(first.status).toBe(200);
		expect(second.status).toBe(429);
	});
});
