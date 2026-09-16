import { config } from "dotenv";

config({ path: "../../.env" });

export const env = {
	databaseUrl: process.env.DATABASE_URL,
	jwtSecret: process.env.JWT_SECRET,
	// Access token sengaja pendek (menit, bukan hari) sekarang ada refresh
	// token — kalau access token dicuri, umurnya cuma sebentar. Sesi panjang
	// datang dari refresh token yang disimpan di httpOnly cookie, bukan dari
	// access token yang berumur panjang.
	accessTokenExpiresInMinutes: Number(
		process.env.ACCESS_TOKEN_EXPIRES_IN_MINUTES ?? 15,
	),
	refreshTokenExpiresInDays: Number(
		process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS ?? 30,
	),
	isProduction: process.env.NODE_ENV === "production",
	// CORS_ORIGIN dipisah koma untuk banyak origin (apps/platform, apps/admin).
	// corsOrigins[0] juga dipakai sebagai base URL link (mis. reset password).
	corsOrigins: (process.env.CORS_ORIGIN || "http://localhost:3000")
		.split(",")
		.map((origin) => origin.trim())
		.filter(Boolean),
	googleClientId: process.env.GOOGLE_CLIENT_ID,
	googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
	passwordResetTtlMinutes: Number(process.env.PASSWORD_RESET_TTL_MINUTES ?? 15),
} as const;

// Base URL + path reset-password per app — dipetakan di server (bukan dari
// Origin/Referer request) supaya email reset tidak bisa dipakai untuk
// menyuntik link ke domain sembarangan. corsOrigins[1] (admin) fallback ke
// corsOrigins[0] kalau cuma satu origin yang di-set (mis. di test).
export const resetPasswordUrlByApp = {
	platform: `${env.corsOrigins[0]}/auth/reset-password`,
	admin: `${env.corsOrigins[1] ?? env.corsOrigins[0]}/reset-password`,
} as const;
