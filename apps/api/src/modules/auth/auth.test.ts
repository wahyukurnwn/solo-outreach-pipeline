import { afterEach, describe, expect, it } from "vitest";
import { app } from "../../app";
import { createExchangeCode } from "../../libs/oauth-exchange";
import {
	cleanupUser,
	createTestUser,
	signin,
	signup,
	uniqueEmail,
} from "../../test/helpers";

describe("auth", () => {
	const createdUserIds: string[] = [];

	afterEach(async () => {
		await Promise.all(createdUserIds.splice(0).map(cleanupUser));
	});

	it("signs up a new user with email and password", async () => {
		const email = uniqueEmail();

		const res = await signup(email);
		expect(res.status).toBe(201);

		const { id } = await signin(email);
		createdUserIds.push(id);
	});

	it("rejects signup with an email that is already registered", async () => {
		const { id, email } = await createTestUser();
		createdUserIds.push(id);

		const res = await signup(email);
		const json = await res.json();

		expect(res.status).toBe(409);
		expect(json.error.code).toBe("CONFLICT");
	});

	it("rejects signup with a password shorter than 8 characters", async () => {
		const res = await signup(uniqueEmail(), "short");
		const json = await res.json();

		expect(res.status).toBe(422);
		expect(json.error.code).toBe("VALIDATION_ERROR");
	});

	it("signs in with correct credentials and returns an access token", async () => {
		const { id, accessToken } = await createTestUser();
		createdUserIds.push(id);

		expect(accessToken).toBeTypeOf("string");
	});

	it("rejects signin with the wrong password", async () => {
		const { id, email } = await createTestUser();
		createdUserIds.push(id);

		const res = await app.request("/api/auth/signin", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password: "wrong-password" }),
		});

		expect(res.status).toBe(401);
	});

	it("rejects signin with an email that was never registered", async () => {
		const res = await app.request("/api/auth/signin", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email: uniqueEmail(), password: "password123" }),
		});

		expect(res.status).toBe(401);
	});

	it("returns the current user on /me with a valid token", async () => {
		const { id, email, authHeaders } = await createTestUser();
		createdUserIds.push(id);

		const res = await app.request("/api/auth/me", { headers: authHeaders });
		const json = await res.json();

		expect(res.status).toBe(200);
		expect(json.email).toBe(email);
	});

	it("rejects /me without a token", async () => {
		const res = await app.request("/api/auth/me");

		expect(res.status).toBe(401);
	});

	it("exchanges a valid one-time code for an access token", async () => {
		const { id, email } = await createTestUser();
		createdUserIds.push(id);

		const code = createExchangeCode({ id, email, role: "USER" });

		const res = await app.request("/api/auth/google/exchange", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ code }),
		});
		const json = await res.json();

		expect(res.status).toBe(200);
		expect(json.accessToken).toBeTypeOf("string");
	});

	it("rejects an exchange code that was never issued", async () => {
		const res = await app.request("/api/auth/google/exchange", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ code: "never-issued" }),
		});
		const json = await res.json();

		expect(res.status).toBe(400);
		expect(json.error.code).toBe("INVALID_EXCHANGE_CODE");
	});

	it("rejects reusing an exchange code a second time", async () => {
		const { id, email } = await createTestUser();
		createdUserIds.push(id);

		const code = createExchangeCode({ id, email, role: "USER" });

		await app.request("/api/auth/google/exchange", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ code }),
		});
		const secondRes = await app.request("/api/auth/google/exchange", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ code }),
		});

		expect(secondRes.status).toBe(400);
	});
});
