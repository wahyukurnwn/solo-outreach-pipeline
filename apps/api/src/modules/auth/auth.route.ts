import type { Context } from "hono";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { env } from "../../config/env";
import {
	InvalidExchangeCodeError,
	InvalidRefreshTokenError,
	UnauthorizedError,
} from "../../exceptions";
import { googleAuthMiddleware } from "../../libs/auth.";
import { signToken } from "../../libs/jwt";
import {
	consumeExchangeCode,
	createExchangeCode,
} from "../../libs/oauth-exchange";
import { authRateLimit } from "../../libs/rate-limit";
import { validate } from "../../libs/validate";
import { requireAuth } from "../../middleware/auth";
import type { AppEnv } from "../../types";
import { createdAccountResponse, messageResponse } from "../../utils/response";
import { userRepository } from "../user/user.repository";
import {
	changePasswordSchema,
	forgotPasswordSchema,
	googleExchangeSchema,
	loginSchema,
	registerSchema,
	removePasswordSchema,
	resetPasswordSchema,
} from "./auth.schema";
import { credentialService } from "./credential.service";

// Batas percobaan per IP — proteksi brute-force/spam. signin lebih longgar
// dari signup/forgot-password karena typo password wajar terjadi berkali-kali
// dalam sesi login yang sama, sementara bikin akun/kirim email berulang tidak.
const SIGNUP_RATE_LIMIT = {
	windowMs: 60 * 60 * 1000,
	max: 5,
	keyPrefix: "signup",
};
const SIGNIN_RATE_LIMIT = {
	windowMs: 15 * 60 * 1000,
	max: 10,
	keyPrefix: "signin",
};
const FORGOT_PASSWORD_RATE_LIMIT = {
	windowMs: 60 * 60 * 1000,
	max: 5,
	keyPrefix: "forgot-password",
};

const REFRESH_TOKEN_COOKIE = "refresh_token";

// path:"/api/auth" supaya cookie ini cuma ikut terkirim ke endpoint auth
// (refresh, logout), bukan ke setiap request API — mengecilkan permukaan
// yang membawa credential ini.
function setRefreshTokenCookie(c: Context, token: string) {
	setCookie(c, REFRESH_TOKEN_COOKIE, token, {
		httpOnly: true,
		secure: env.isProduction,
		sameSite: "Lax",
		path: "/api/auth",
		maxAge: env.refreshTokenExpiresInDays * 24 * 60 * 60,
	});
}

function clearRefreshTokenCookie(c: Context) {
	deleteCookie(c, REFRESH_TOKEN_COOKIE, { path: "/api/auth" });
}

const authRoute = new Hono<AppEnv>()
	.post(
		"/api/auth/signup",
		authRateLimit(SIGNUP_RATE_LIMIT),
		validate("json", registerSchema),
		async (c) => {
			const body = c.req.valid("json");

			await credentialService.register(body);

			return c.json(
				createdAccountResponse(
					"Register berhasil. Silahkan ke halaman login page!",
				),
				201,
			);
		},
	)
	.post(
		"/api/auth/signin",
		authRateLimit(SIGNIN_RATE_LIMIT),
		validate("json", loginSchema),
		async (c) => {
			const body = c.req.valid("json");

			const { user } = await credentialService.login(body);

			const accessToken = signToken({
				id: user.id,
				email: user.email,
				role: user.role,
			});
			const refreshToken = await credentialService.issueRefreshToken(user.id);
			setRefreshTokenCookie(c, refreshToken);

			return c.json({ id: user.id, email: user.email, accessToken });
		},
	)
	.get("/api/auth/callback/google", googleAuthMiddleware, async (c) => {
		const googleUser = c.get("user-google");

		const { user } = await credentialService.loginWithGoogle(googleUser ?? {});

		const code = createExchangeCode({
			id: user.id,
			email: user.email,
			role: user.role,
		});

		// Cookie di-set di sini (bukan di /google/exchange) — Set-Cookie pada
		// response redirect tetap tersimpan untuk origin api ini, terlepas ke
		// mana browser diarahkan setelahnya.
		const refreshToken = await credentialService.issueRefreshToken(user.id);
		setRefreshTokenCookie(c, refreshToken);

		return c.redirect(
			`${env.corsOrigins[0]}/auth/callback/google?code=${code}`,
		);
	})
	.post(
		"/api/auth/google/exchange",
		validate("json", googleExchangeSchema),
		async (c) => {
			const { code } = c.req.valid("json");

			const user = consumeExchangeCode(code);
			if (!user) throw new InvalidExchangeCodeError();

			const accessToken = signToken(user);

			return c.json({ id: user.id, email: user.email, accessToken });
		},
	)
	.post("/api/auth/refresh", async (c) => {
		const rawToken = getCookie(c, REFRESH_TOKEN_COOKIE);
		if (!rawToken) throw new InvalidRefreshTokenError();

		const { user, refreshToken } =
			await credentialService.rotateRefreshToken(rawToken);
		setRefreshTokenCookie(c, refreshToken);

		const accessToken = signToken({
			id: user.id,
			email: user.email,
			role: user.role,
		});

		return c.json({ accessToken });
	})
	.post("/api/auth/logout", async (c) => {
		const rawToken = getCookie(c, REFRESH_TOKEN_COOKIE);
		if (rawToken) await credentialService.revokeRefreshToken(rawToken);
		clearRefreshTokenCookie(c);

		return c.json(messageResponse("Berhasil logout."));
	})
	.post(
		"/api/auth/forgot-password",
		authRateLimit(FORGOT_PASSWORD_RATE_LIMIT),
		validate("json", forgotPasswordSchema),
		async (c) => {
			const body = c.req.valid("json");

			await credentialService.forgotPassword(body);

			return c.json(
				messageResponse(
					"Jika email terdaftar, link reset password sudah dikirim.",
				),
			);
		},
	)
	.post(
		"/api/auth/reset-password",
		validate("json", resetPasswordSchema),
		async (c) => {
			const body = c.req.valid("json");

			await credentialService.resetPassword(body);

			return c.json(
				messageResponse("Password berhasil direset. Silahkan login."),
			);
		},
	)
	.get("/api/auth/me", requireAuth, async (c) => {
		const { id } = c.get("user");

		const user = await userRepository.findById(id);
		if (!user) throw new UnauthorizedError();

		// Cuma boolean — hash password dan googleId sendiri tidak pernah dikirim.
		return c.json({
			id: user.id,
			email: user.email,
			role: user.role,
			hasPassword: user.password !== null,
			hasGoogle: user.googleId !== null,
		});
	})
	.patch(
		"/api/auth/password",
		requireAuth,
		validate("json", changePasswordSchema),
		async (c) => {
			const { id } = c.get("user");
			const body = c.req.valid("json");

			await credentialService.changePassword(id, body);

			return c.json(messageResponse("Password berhasil diubah."));
		},
	)
	.delete(
		"/api/auth/password",
		requireAuth,
		validate("json", removePasswordSchema),
		async (c) => {
			const { id } = c.get("user");
			const body = c.req.valid("json");

			await credentialService.removePassword(id, body);

			return c.json(messageResponse("Password berhasil dihapus."));
		},
	)
	.delete("/api/auth/google", requireAuth, async (c) => {
		const { id } = c.get("user");

		await credentialService.unlinkGoogle(id);

		return c.json(messageResponse("Akun Google berhasil dilepas."));
	});

export default authRoute;
