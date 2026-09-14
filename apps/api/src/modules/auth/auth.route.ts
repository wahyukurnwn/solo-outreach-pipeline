import { Hono } from "hono";
import { UnauthorizedError } from "../../exceptions";
import { googleAuthMiddleware } from "../../libs/auth.";
import { signToken } from "../../libs/jwt";
import { validate } from "../../libs/validate";
import { requireAuth } from "../../middleware/auth";
import type { AppEnv } from "../../types";
import { createdAccountResponse, messageResponse } from "../../utils/response";
import { userRepository } from "../user/user.repository";
import {
	forgotPasswordSchema,
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
	.get("/api/auth/google", googleAuthMiddleware, async (c) => {
		const googleUser = c.get("user-google");

		const { user } = await credentialService.loginWithGoogle(googleUser ?? {});

		const accessToken = signToken({
			id: user.id,
			email: user.email,
			role: user.role,
		});

		return c.json({ id: user.id, email: user.email, accessToken });
	})
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
