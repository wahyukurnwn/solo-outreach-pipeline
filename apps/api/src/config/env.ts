import { config } from "dotenv";

config({ path: "../../.env" });

export const env = {
	databaseUrl: process.env.DATABASE_URL,
	jwtSecret: process.env.JWT_SECRET,
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
