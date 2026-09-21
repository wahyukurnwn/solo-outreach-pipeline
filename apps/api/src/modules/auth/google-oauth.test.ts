import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { app } from "../../app";
import { env } from "../../config/env";
import { cleanupUser, uniqueEmail } from "../../test/helpers";

function mockGoogleEndpoints(googleUser: { id: string; email: string }) {
	return vi.spyOn(global, "fetch").mockImplementation(async (input) => {
		const url = input.toString();

		if (url.startsWith("https://oauth2.googleapis.com/token")) {
			return new Response(
				JSON.stringify({
					access_token: "fake-access-token",
					expires_in: 3600,
					scope: "openid email profile",
				}),
				{ status: 200, headers: { "content-type": "application/json" } },
			);
		}

		if (url.startsWith("https://www.googleapis.com/oauth2/v2/userinfo")) {
			return new Response(
				JSON.stringify({
					id: googleUser.id,
					email: googleUser.email,
					verified_email: true,
					name: "Test User",
				}),
				{ status: 200, headers: { "content-type": "application/json" } },
			);
		}

		throw new Error(`Unexpected fetch to ${url} in test`);
	});
}

describe("google oauth redirect flow", () => {
	const createdUserIds: string[] = [];

	afterEach(async () => {
		vi.restoreAllMocks();
		await Promise.all(createdUserIds.splice(0).map(cleanupUser));
	});

	it("redirects to google's consent screen and sets a state cookie", async () => {
		const res = await app.request("/api/auth/callback/google");

		expect(res.status).toBe(302);
		expect(res.headers.get("location")).toContain(
			"https://accounts.google.com/o/oauth2/v2/auth",
		);
		expect(res.headers.get("set-cookie")).toMatch(/^state=/);
	});

	it("rejects the callback when the state cookie is missing or mismatched", async () => {
		const res = await app.request(
			"/api/auth/callback/google?code=fake-code&state=whatever",
		);

		expect(res.status).toBe(401);
	});

	it("completes the redirect flow: consent -> callback -> our own exchange code -> access token", async () => {
		const email = uniqueEmail();
		const googleId = randomUUID();

		const initRes = await app.request("/api/auth/callback/google");
		const setCookie = initRes.headers.get("set-cookie");
		const stateValue = setCookie?.match(/state=([^;]+)/)?.[1];
		expect(stateValue).toBeTruthy();

		const fetchSpy = mockGoogleEndpoints({ id: googleId, email });

		const callbackRes = await app.request(
			`/api/auth/callback/google?code=fake-code&state=${stateValue}`,
			{ headers: { cookie: `state=${stateValue}` } },
		);

		expect(fetchSpy).toHaveBeenCalled();
		expect(callbackRes.status).toBe(302);

		const callbackLocation = callbackRes.headers.get("location");
		expect(callbackLocation).toContain("/auth/callback/google?code=");

		const exchangeCode = new URL(callbackLocation ?? "").searchParams.get(
			"code",
		);
		expect(exchangeCode).toBeTruthy();

		const exchangeRes = await app.request("/api/auth/google/exchange", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ code: exchangeCode }),
		});
		const exchangeJson = await exchangeRes.json();

		expect(exchangeRes.status).toBe(200);
		expect(exchangeJson.email).toBe(email);
		expect(exchangeJson.accessToken).toBeTypeOf("string");

		createdUserIds.push(exchangeJson.id);
	});
});

describe("google oauth configuration", () => {
	const original = {
		googleClientId: env.googleClientId,
		googleClientSecret: env.googleClientSecret,
	};

	afterEach(() => {
		Object.assign(env, original);
	});

	// Sign-in with Google is optional: the API boots without credentials and
	// only this route reports that it is unavailable.
	it("answers 503 instead of crashing when the credentials are missing", async () => {
		Object.assign(env, { googleClientId: "", googleClientSecret: "" });

		const res = await app.request("/api/auth/callback/google");
		const json = await res.json();

		expect(res.status).toBe(503);
		expect(json.error.code).toBe("GOOGLE_AUTH_NOT_CONFIGURED");
	});

	it("does not affect email + password auth when Google is not configured", async () => {
		Object.assign(env, { googleClientId: "", googleClientSecret: "" });

		const res = await app.request("/api/auth/me");

		expect(res.status).toBe(401);
	});

	it("redirects to Google's consent screen when the credentials are set", async () => {
		Object.assign(env, {
			googleClientId: "test-client-id",
			googleClientSecret: "test-client-secret",
		});

		const res = await app.request("/api/auth/callback/google");

		expect(res.status).toBe(302);
		expect(res.headers.get("location")).toContain("accounts.google.com");
	});
});
