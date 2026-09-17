import { afterEach, describe, expect, it, vi } from "vitest";
import { env } from "../config/env";
import { mailer } from "./mailer";

describe("mailer", () => {
	const originalResendApiKey = env.resendApiKey;
	const originalIsProduction = env.isProduction;

	afterEach(() => {
		// `env` bukan objek yang di-freeze — dipulihkan manual supaya test lain
		// (yang mengasumsikan RESEND_API_KEY kosong & bukan production) tidak
		// ikut terpengaruh urutan eksekusi test.
		Object.assign(env, {
			resendApiKey: originalResendApiKey,
			isProduction: originalIsProduction,
		});
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	it("falls back to console.log when RESEND_API_KEY is empty outside production", async () => {
		Object.assign(env, { resendApiKey: undefined, isProduction: false });
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

		await mailer.sendPasswordResetEmail(
			"user@example.com",
			"https://app.test/reset?token=abc",
		);

		expect(logSpy).toHaveBeenCalledOnce();
	});

	it("throws instead of silently failing when RESEND_API_KEY is empty in production", async () => {
		Object.assign(env, { resendApiKey: undefined, isProduction: true });

		await expect(
			mailer.sendPasswordResetEmail(
				"user@example.com",
				"https://app.test/reset?token=abc",
			),
		).rejects.toMatchObject({ status: 503 });
	});

	it("calls the Resend API with the reset link when a key is configured", async () => {
		Object.assign(env, { resendApiKey: "test-key", isProduction: false });
		const fetchMock = vi
			.fn()
			.mockResolvedValue(new Response("{}", { status: 200 }));
		vi.stubGlobal("fetch", fetchMock);

		await mailer.sendPasswordResetEmail(
			"user@example.com",
			"https://app.test/reset?token=abc",
		);

		expect(fetchMock).toHaveBeenCalledOnce();
		const [url, init] = fetchMock.mock.calls[0];
		expect(url).toBe("https://api.resend.com/emails");
		expect(init.headers.Authorization).toBe("Bearer test-key");
		const body = JSON.parse(init.body);
		expect(body.to).toBe("user@example.com");
		expect(body.html).toContain("https://app.test/reset?token=abc");
	});

	it("throws when the Resend API responds with an error", async () => {
		Object.assign(env, { resendApiKey: "test-key", isProduction: false });
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(new Response("bad request", { status: 422 })),
		);

		await expect(
			mailer.sendPasswordResetEmail(
				"user@example.com",
				"https://app.test/reset?token=abc",
			),
		).rejects.toThrow(/Resend API error \(422\)/);
	});
});
