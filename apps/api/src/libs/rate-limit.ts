import { getConnInfo } from "@hono/node-server/conninfo";
import type { Context } from "hono";
import { createMiddleware } from "hono/factory";
import { TooManyRequestsError } from "../exceptions";

interface RateLimitOptions {
	windowMs: number;
	max: number;
	keyPrefix: string;
}

const buckets = new Map<string, { count: number; resetAt: number }>();

function getClientIp(c: Context) {
	// X-Forwarded-For diprioritaskan karena API ini didesain jalan di belakang
	// reverse proxy — tanpa itu semua request akan terlihat datang dari IP
	// proxy yang sama. getConnInfo cuma fallback buat koneksi langsung (dev
	// lokal), dan dibungkus try/catch karena tidak tersedia sama sekali saat
	// test: app.request() tidak lewat @hono/node-server, jadi c.env.incoming
	// yang dibutuhkannya kosong.
	const forwardedFor = c.req.header("x-forwarded-for");
	if (forwardedFor) return forwardedFor.split(",")[0].trim();

	try {
		return getConnInfo(c).remote.address ?? "unknown";
	} catch {
		return "unknown";
	}
}

export function rateLimit({ windowMs, max, keyPrefix }: RateLimitOptions) {
	return createMiddleware(async (c, next) => {
		const key = `${keyPrefix}:${getClientIp(c)}`;
		const now = Date.now();
		const bucket = buckets.get(key);

		if (!bucket || bucket.resetAt <= now) {
			buckets.set(key, { count: 1, resetAt: now + windowMs });
			await next();
			return;
		}

		if (bucket.count >= max)
			throw new TooManyRequestsError(Math.ceil((bucket.resetAt - now) / 1000));

		bucket.count += 1;
		await next();
	});
}

export function resetRateLimits() {
	buckets.clear();
}

// Volume request dari test suite tidak merepresentasikan traffic asli — semua
// request lewat app.request() datang tanpa koneksi TCP nyata, jadi kalau tidak
// diberi header x-forwarded-for eksplisit, semuanya jatuh ke bucket "unknown"
// yang sama dan bisa saling memicu 429 antar test yang tidak berhubungan.
// rateLimit() sendiri tetap diuji langsung (lihat rate-limit.test.ts); yang
// dimatikan di sini cuma pemasangannya ke route auth yang sesungguhnya.
const isTestEnv = process.env.VITEST === "true";
const noopMiddleware = createMiddleware(async (_c, next) => next());

export function authRateLimit(options: RateLimitOptions) {
	return isTestEnv ? noopMiddleware : rateLimit(options);
}
