import { describe, expect, it } from "vitest";
import { databaseName, resolveTestDatabaseUrl } from "./test-database";

describe("resolveTestDatabaseUrl", () => {
	it("derives a *_test database from the dev url, keeping the rest", () => {
		const url = resolveTestDatabaseUrl(
			"postgresql://postgres:postgres@localhost:5449/postgres",
			undefined,
		);

		expect(url).toBe(
			"postgresql://postgres:postgres@localhost:5449/postgres_test",
		);
	});

	it("tolerates the leading space some .env files have", () => {
		const url = resolveTestDatabaseUrl(
			" postgresql://u:p@localhost:5449/app",
			undefined,
		);

		expect(databaseName(url)).toBe("app_test");
	});

	it("does not append _test twice", () => {
		const url = resolveTestDatabaseUrl(
			"postgresql://u:p@localhost:5449/app_test",
			undefined,
		);

		expect(databaseName(url)).toBe("app_test");
	});

	it("prefers an explicit TEST_DATABASE_URL", () => {
		expect(
			resolveTestDatabaseUrl(
				"postgresql://u:p@h/dev",
				"postgresql://u:p@h/custom_test",
			),
		).toBe("postgresql://u:p@h/custom_test");
	});

	it("throws when there is no DATABASE_URL to derive from", () => {
		expect(() => resolveTestDatabaseUrl(undefined, undefined)).toThrow(
			/DATABASE_URL/,
		);
	});
});
