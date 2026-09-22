import { describe, expect, it } from "vitest";
import { app } from "./app";

describe("GET /health", () => {
	it("reports ok and a reachable database without requiring auth", async () => {
		const res = await app.request("/health");

		expect(res.status).toBe(200);
		await expect(res.json()).resolves.toEqual({
			status: "ok",
			database: "up",
		});
	});
});
