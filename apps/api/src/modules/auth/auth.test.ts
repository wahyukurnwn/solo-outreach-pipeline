import { afterEach, describe, expect, it, vi } from "vitest";
import { app } from "../../app";
import { mailer } from "../../libs/mailer";
import { createExchangeCode } from "../../libs/oauth-exchange";
import {
	cleanupUser,
	createGoogleOnlyTestUser,
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

	it("sends a reset link pointing to the frontend /auth/reset-password route", async () => {
		const { id, email } = await createTestUser();
		createdUserIds.push(id);

		const sendSpy = vi
			.spyOn(mailer, "sendPasswordResetEmail")
			.mockResolvedValue(undefined);

		const res = await app.request("/api/auth/forgot-password", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email }),
		});

		expect(res.status).toBe(200);
		expect(sendSpy).toHaveBeenCalledTimes(1);
		const [, resetUrl] = sendSpy.mock.calls[0];
		expect(resetUrl).toContain("/auth/reset-password?token=");

		sendSpy.mockRestore();
	});

	it("does not send an email or leak whether an email is registered on forgot-password", async () => {
		const sendSpy = vi
			.spyOn(mailer, "sendPasswordResetEmail")
			.mockResolvedValue(undefined);

		const res = await app.request("/api/auth/forgot-password", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email: uniqueEmail() }),
		});

		expect(res.status).toBe(200);
		expect(sendSpy).not.toHaveBeenCalled();

		sendSpy.mockRestore();
	});

	it("resets the password with a valid token and allows signing in with the new password", async () => {
		const { id, email } = await createTestUser();
		createdUserIds.push(id);

		const sendSpy = vi
			.spyOn(mailer, "sendPasswordResetEmail")
			.mockResolvedValue(undefined);

		await app.request("/api/auth/forgot-password", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email }),
		});

		const [, resetUrl] = sendSpy.mock.calls[0];
		const token = new URL(resetUrl).searchParams.get("token");
		sendSpy.mockRestore();

		const resetRes = await app.request("/api/auth/reset-password", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token, password: "newpassword123" }),
		});

		expect(resetRes.status).toBe(200);

		const signinRes = await app.request("/api/auth/signin", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password: "newpassword123" }),
		});

		expect(signinRes.status).toBe(200);
	});

	it("rejects resetting the password with an invalid token", async () => {
		const res = await app.request("/api/auth/reset-password", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				token: "bogus-token",
				password: "newpassword123",
			}),
		});
		const json = await res.json();

		expect(res.status).toBe(400);
		expect(json.error.code).toBe("INVALID_RESET_TOKEN");
	});

	it("rejects reusing a reset token a second time", async () => {
		const { id, email } = await createTestUser();
		createdUserIds.push(id);

		const sendSpy = vi
			.spyOn(mailer, "sendPasswordResetEmail")
			.mockResolvedValue(undefined);

		await app.request("/api/auth/forgot-password", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email }),
		});

		const [, resetUrl] = sendSpy.mock.calls[0];
		const token = new URL(resetUrl).searchParams.get("token");
		sendSpy.mockRestore();

		await app.request("/api/auth/reset-password", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token, password: "newpassword123" }),
		});
		const secondRes = await app.request("/api/auth/reset-password", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token, password: "anotherpassword123" }),
		});

		expect(secondRes.status).toBe(400);
	});

	it("changes the password when the current password is correct", async () => {
		const { id, email, authHeaders } = await createTestUser();
		createdUserIds.push(id);

		const res = await app.request("/api/auth/password", {
			method: "PATCH",
			headers: { "Content-Type": "application/json", ...authHeaders },
			body: JSON.stringify({
				currentPassword: "password123",
				newPassword: "newpassword123",
			}),
		});

		expect(res.status).toBe(200);

		const signinRes = await app.request("/api/auth/signin", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password: "newpassword123" }),
		});

		expect(signinRes.status).toBe(200);
	});

	it("rejects changing the password when the current password is wrong", async () => {
		const { id, authHeaders } = await createTestUser();
		createdUserIds.push(id);

		const res = await app.request("/api/auth/password", {
			method: "PATCH",
			headers: { "Content-Type": "application/json", ...authHeaders },
			body: JSON.stringify({
				currentPassword: "wrong-password",
				newPassword: "newpassword123",
			}),
		});
		const json = await res.json();

		expect(res.status).toBe(401);
		expect(json.error.code).toBe("INVALID_CURRENT_PASSWORD");
	});

	it("rejects changing the password for an account that has no password (google-only)", async () => {
		const { id, authHeaders } = await createGoogleOnlyTestUser();
		createdUserIds.push(id);

		const res = await app.request("/api/auth/password", {
			method: "PATCH",
			headers: { "Content-Type": "application/json", ...authHeaders },
			body: JSON.stringify({
				currentPassword: "anything",
				newPassword: "newpassword123",
			}),
		});
		const json = await res.json();

		expect(res.status).toBe(409);
		expect(json.error.code).toBe("PASSWORD_NOT_SET");
	});

	it("rejects changing the password without a token", async () => {
		const res = await app.request("/api/auth/password", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				currentPassword: "password123",
				newPassword: "newpassword123",
			}),
		});

		expect(res.status).toBe(401);
	});
});
