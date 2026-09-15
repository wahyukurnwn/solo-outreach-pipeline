import { randomUUID } from "node:crypto";
import { app } from "../app";
import { signToken } from "../libs/jwt";
import { prisma } from "../libs/prisma";

export const TEST_PASSWORD = "password123";

export function uniqueEmail() {
	return `test-${randomUUID()}@example.com`;
}

export function signup(email: string, password = TEST_PASSWORD) {
	return app.request("/api/auth/signup", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password }),
	});
}

export async function signin(email: string, password = TEST_PASSWORD) {
	const res = await app.request("/api/auth/signin", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password }),
	});

	return res.json() as Promise<{
		id: string;
		email: string;
		accessToken: string;
	}>;
}

export async function createTestUser(password = TEST_PASSWORD) {
	const email = uniqueEmail();

	await signup(email, password);
	const { id, accessToken } = await signin(email, password);

	return {
		id,
		email,
		accessToken,
		authHeaders: { Authorization: `Bearer ${accessToken}` },
	};
}

export async function promoteToAdmin(userId: string) {
	await prisma.user.update({ where: { id: userId }, data: { role: "ADMIN" } });
}

export async function linkGoogleId(userId: string, googleId = randomUUID()) {
	await prisma.user.update({ where: { id: userId }, data: { googleId } });
}

export async function markAsDemo(userId: string) {
	await prisma.user.update({ where: { id: userId }, data: { isDemo: true } });
}

// Invariant is_demo (paling banyak satu row true) tidak dijaga oleh DB —
// dipakai test /api/demo/* supaya findDemoUser() tidak kejegal user demo lain
// yang kebetulan masih ada dari test/dev sebelumnya.
export async function clearDemoUsers() {
	await prisma.user.updateMany({
		where: { isDemo: true },
		data: { isDemo: false },
	});
}

export async function createGoogleOnlyTestUser() {
	const email = uniqueEmail();
	const user = await prisma.user.create({
		data: { email, googleId: randomUUID() },
	});
	const accessToken = signToken({
		id: user.id,
		email: user.email,
		role: user.role,
	});

	return {
		id: user.id,
		email: user.email,
		accessToken,
		authHeaders: { Authorization: `Bearer ${accessToken}` },
	};
}

export async function createTestAdmin(password = TEST_PASSWORD) {
	const user = await createTestUser(password);
	await promoteToAdmin(user.id);

	// Role diverifikasi dari payload JWT, bukan lookup DB per-request — token lama
	// yang diterbitkan sebelum promosi masih membawa role USER, jadi harus signin ulang.
	const { accessToken } = await signin(user.email, password);

	return {
		...user,
		accessToken,
		authHeaders: { Authorization: `Bearer ${accessToken}` },
	};
}

export async function createProspect(
	authHeaders: Record<string, string>,
	overrides: Record<string, unknown> = {},
) {
	const res = await app.request("/api/prospects", {
		method: "POST",
		headers: { "Content-Type": "application/json", ...authHeaders },
		body: JSON.stringify({ name: "Test Prospect", ...overrides }),
	});

	return res.json() as Promise<{ id: string }>;
}

export async function cleanupUser(userId: string) {
	await prisma.activity.deleteMany({ where: { userId } });
	await prisma.prospect.deleteMany({ where: { userId } });
	await prisma.passwordResetToken.deleteMany({ where: { userId } });
	await prisma.user.delete({ where: { id: userId } }).catch(() => {});
}
