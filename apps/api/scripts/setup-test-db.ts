import { execSync } from "node:child_process";
import pg from "pg";
import {
	databaseName,
	resolveTestDatabaseUrl,
} from "../src/test/test-database";

// Membuat database test kalau belum ada, lalu menerapkan semua migrasi.
// Aman dijalankan berulang (dipanggil tiap `pnpm test`): migrate deploy tidak
// melakukan apa-apa kalau skema sudah terbaru, dan tidak pernah menyentuh
// database dev.
const devUrl = process.env.DATABASE_URL?.trim();
if (!devUrl) throw new Error("DATABASE_URL belum di-set");

const testUrl = resolveTestDatabaseUrl(devUrl);
const testName = databaseName(testUrl);

if (testUrl === devUrl)
	throw new Error("URL database test sama dengan dev — dibatalkan.");

const client = new pg.Client({ connectionString: devUrl });
await client.connect();

const { rowCount } = await client.query(
	"SELECT 1 FROM pg_database WHERE datname = $1",
	[testName],
);

if (!rowCount) {
	// Nama database tidak bisa di-parameterize di CREATE DATABASE; aman karena
	// nilainya berasal dari env kita sendiri, dan dikutip sebagai identifier.
	await client.query(`CREATE DATABASE "${testName.replaceAll('"', '""')}"`);
	console.log(`[test-db] dibuat: ${testName}`);
}

await client.end();

execSync("pnpm prisma migrate deploy", {
	stdio: "inherit",
	env: { ...process.env, DATABASE_URL: testUrl },
});
