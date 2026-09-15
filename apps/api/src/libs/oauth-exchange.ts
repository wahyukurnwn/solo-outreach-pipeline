import { randomUUID } from "node:crypto";
import type { AuthUser } from "../types";

// Kode sekali-pakai berumur sangat pendek buat nukar hasil redirect OAuth
// jadi accessToken — supaya JWT tidak pernah muncul di query string URL
// (browser history, referrer header, access log). In-memory cukup karena
// TTL-nya cuma 60 detik dan API ini masih single-process.
const CODE_TTL_MS = 60_000;

const pendingExchanges = new Map<
	string,
	{ user: AuthUser; expiresAt: number }
>();

export function createExchangeCode(user: AuthUser) {
	const code = randomUUID();
	pendingExchanges.set(code, { user, expiresAt: Date.now() + CODE_TTL_MS });

	return code;
}

export function consumeExchangeCode(code: string): AuthUser | null {
	const entry = pendingExchanges.get(code);
	pendingExchanges.delete(code);

	if (!entry || entry.expiresAt < Date.now()) return null;

	return entry.user;
}
