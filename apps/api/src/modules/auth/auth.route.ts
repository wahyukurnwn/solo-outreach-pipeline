import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createdAccountResponse } from "../../utils/response";
import { loginSchema, registerSchema } from "./auth.schema";
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

		return c.json({ id: user.id, email: user.email });
	});

export default authRoute;
