// Test suite menulis & menghapus data sungguhan (user, prospek, flag is_demo),
// jadi tidak boleh berbagi database dengan dev — dulu setiap `pnpm test`
// diam-diam me-reset akun demo yang sedang dipakai di `/demo`.
export function resolveTestDatabaseUrl(
	databaseUrl: string | undefined,
	override = process.env.TEST_DATABASE_URL,
) {
	if (override) return override;
	if (!databaseUrl) throw new Error("DATABASE_URL belum di-set");

	const url = new URL(databaseUrl.trim());
	const name = url.pathname.replace(/^\//, "");
	url.pathname = `/${name.endsWith("_test") ? name : `${name}_test`}`;

	return url.toString();
}

export function databaseName(databaseUrl: string) {
	return new URL(databaseUrl).pathname.replace(/^\//, "");
}
