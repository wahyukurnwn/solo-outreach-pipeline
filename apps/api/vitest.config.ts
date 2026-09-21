import { defineConfig } from "vitest/config";
import { resolveTestDatabaseUrl } from "./src/test/test-database.ts";

export default defineConfig({
	test: {
		environment: "node",
		testTimeout: 10000,
		setupFiles: ["./src/test/setup.ts"],
		// Menimpa DATABASE_URL dari .env (dotenv tidak menimpa variabel yang
		// sudah ada), jadi seluruh kode aplikasi otomatis memakai database test.
		env: {
			DATABASE_URL: resolveTestDatabaseUrl(process.env.DATABASE_URL),
		},
	},
});
