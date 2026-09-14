import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { googleAuthMiddleware } from "../../libs/auth.";
import { signToken } from "../../libs/jwt";
import { createdAccountResponse, messageResponse } from "../../utils/response";
import {
	forgotPasswordSchema,
	loginSchema,
	registerSchema,
	resetPasswordSchema,
} from "./auth.schema";
import { credentialService } from "./credential.service";

const authRoute = new Hono()
	.post("/api/auth/signup", zValidator("json", registerSchema), async (c) => {
		const body = c.req.valid("json");

		await credentialService.register(body);

		return c.json(
			createdAccountResponse(
				"Register berhasil. Silahkan ke halaman login page!",
			),
		);
	})
	.post("/api/auth/signin", zValidator("json", loginSchema), async (c) => {
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
		zValidator("json", forgotPasswordSchema),
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
		zValidator("json", resetPasswordSchema),
		async (c) => {
			const body = c.req.valid("json");

			await credentialService.resetPassword(body);

			return c.json(
				messageResponse("Password berhasil direset. Silahkan login."),
			);
		},
	);

export default authRoute;
