import { googleAuth } from "@hono/oauth-providers/google";
import { env } from "../config/env";
import { ServiceUnavailableError } from "../exceptions";

const { googleClientId, googleClientSecret } = env;

if (!googleClientId || !googleClientSecret)
	throw new ServiceUnavailableError(
		"The server is currently unable to handle the request. Please retry shortly.",
	);

export const googleAuthMiddleware = googleAuth({
	client_id: googleClientId,
	client_secret: googleClientSecret,
	scope: ["openid", "email", "profile"],
});
