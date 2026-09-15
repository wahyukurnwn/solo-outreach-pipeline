import { Hono } from "hono";
import { env } from "../../config/env";
import { InvalidExchangeCodeError, UnauthorizedError } from "../../exceptions";
import { googleAuthMiddleware } from "../../libs/auth.";
import { signToken } from "../../libs/jwt";
import {
	consumeExchangeCode,
	createExchangeCode,
} from "../../libs/oauth-exchange";
import { validate } from "../../libs/validate";
import { requireAuth } from "../../middleware/auth";
import type { AppEnv } from "../../types";
import { createdAccountResponse, messageResponse } from "../../utils/response";
import { userRepository } from "../user/user.repository";
import {
	forgotPasswordSchema,
	googleExchangeSchema,
	loginSchema,
	registerSchema,
	resetPasswordSchema,
} from "./auth.schema";
import { credentialService } from "./credential.service";

const authRoute = new Hono<AppEnv>()
	.post("/api/auth/signup", validate("json", registerSchema), async (c) => {
		const body = c.req.valid("json");

		await credentialService.register(body);

		return c.json(
			createdAccountResponse(
				"Register berhasil. Silahkan ke halaman login page!",
			),
			201,
		);
	})
	.post("/api/auth/signin", validate("json", loginSchema), async (c) => {
		const body = c.req.valid("json");

		const { user } = await credentialService.login(body);

		const accessToken = signToken({
			id: user.id,
			email: user.email,
			role: user.role,
		});

		return c.json({ id: user.id, email: user.email, accessToken });
	})
	.get("/api/auth/callback/google", googleAuthMiddleware, async (c) => {
		const googleUser = c.get("user-google");

		const { user } = await credentialService.loginWithGoogle(googleUser ?? {});

		const code = createExchangeCode({
			id: user.id,
			email: user.email,
			role: user.role,
		});

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
	.post(
		"/api/auth/forgot-password",
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

		return c.json({ id: user.id, email: user.email, role: user.role });
	});

export default authRoute;
