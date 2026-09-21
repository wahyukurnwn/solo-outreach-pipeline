import { databaseName } from "./test-database";

// Pengaman terakhir kalau konfigurasi vitest suatu saat salah: menolak jalan
// (bukan sekadar berharap) ke database yang bukan database test.
const url = process.env.DATABASE_URL;

if (!url || !databaseName(url).endsWith("_test"))
	throw new Error(
		`Refusing to run tests against database "${url ? databaseName(url) : "(empty)"}" — the test database name must end in "_test". Run tests via \`pnpm test\`.`,
	);
