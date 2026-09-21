import { databaseName } from "./test-database";

// Pengaman terakhir kalau konfigurasi vitest suatu saat salah: menolak jalan
// (bukan sekadar berharap) ke database yang bukan database test.
const url = process.env.DATABASE_URL;

if (!url || !databaseName(url).endsWith("_test"))
	throw new Error(
		`Menolak menjalankan test ke database "${url ? databaseName(url) : "(kosong)"}" — nama database test harus berakhiran "_test". Jalankan lewat \`pnpm test\`.`,
	);
