import { afterEach, describe, expect, it } from "vitest";
import { app } from "../../app";
import {
	cleanupUser,
	extractCookieValue,
	signup,
	TEST_PASSWORD,
	uniqueEmail,
} from "../../test/helpers";

async function signinRaw(email: string, password = TEST_PASSWORD) {
	return app.request("/api/auth/signin", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password }),
	});
}

describe("refresh token", () => {
	const createdUserIds: string[] = [];

	afterEach(async () => {
		await Promise.all(createdUserIds.splice(0).map(cleanupUser));
	});

	it("sets an httpOnly refresh_token cookie on signin", async () => {
		const email = uniqueEmail();
		await signup(email);

		const res = await signinRaw(email);
		const { id } = await res.clone().json();
		createdUserIds.push(id);

		const setCookie = res.headers.get("set-cookie");
		expect(setCookie).toContain("refresh_token=");
		expect(setCookie).toContain("HttpOnly");
	});

	it("issues a new access token from a valid refresh token", async () => {
		const email = uniqueEmail();
		await signup(email);
		const signinRes = await signinRaw(email);
		const { id } = await signinRes.clone().json();
		createdUserIds.push(id);

		const refreshToken = extractCookieValue(signinRes, "refresh_token");

		const res = await app.request("/api/auth/refresh", {
			method: "POST",
			headers: { Cookie: `refresh_token=${refreshToken}` },
		});
		const json = await res.json();

		expect(res.status).toBe(200);
		expect(typeof json.accessToken).toBe("string");
	});

	it("rotates the refresh token so the old one can't be reused", async () => {
		const email = uniqueEmail();
		await signup(email);
		const signinRes = await signinRaw(email);
		const { id } = await signinRes.clone().json();
		createdUserIds.push(id);

		const oldRefreshToken = extractCookieValue(signinRes, "refresh_token");

		await app.request("/api/auth/refresh", {
			method: "POST",
			headers: { Cookie: `refresh_token=${oldRefreshToken}` },
		});

		const replayRes = await app.request("/api/auth/refresh", {
			method: "POST",
			headers: { Cookie: `refresh_token=${oldRefreshToken}` },
		});

		expect(replayRes.status).toBe(401);
	});

	it("returns 401 when refreshing without a cookie", async () => {
		const res = await app.request("/api/auth/refresh", { method: "POST" });

		expect(res.status).toBe(401);
	});

	it("revokes the refresh token on logout, so it can no longer be used to refresh", async () => {
		const email = uniqueEmail();
		await signup(email);
		const signinRes = await signinRaw(email);
		const { id } = await signinRes.clone().json();
		createdUserIds.push(id);

		const refreshToken = extractCookieValue(signinRes, "refresh_token");

		const logoutRes = await app.request("/api/auth/logout", {
			method: "POST",
			headers: { Cookie: `refresh_token=${refreshToken}` },
		});
		expect(logoutRes.status).toBe(200);

		const refreshRes = await app.request("/api/auth/refresh", {
			method: "POST",
			headers: { Cookie: `refresh_token=${refreshToken}` },
		});
		expect(refreshRes.status).toBe(401);
	});

	it("treats logout without a cookie as a no-op success", async () => {
		const res = await app.request("/api/auth/logout", { method: "POST" });

		expect(res.status).toBe(200);
	});
});
