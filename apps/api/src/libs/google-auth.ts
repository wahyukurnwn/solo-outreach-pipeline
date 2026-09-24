import { googleAuth } from "@hono/oauth-providers/google";
import { createMiddleware } from "hono/factory";
import { env } from "../config/env";
import { ServiceUnavailableError } from "../exceptions";

// Sign-in with Google is optional: the API must boot without credentials so
// that email + password works out of the box (and a fresh clone runs without
// creating an OAuth client). The credentials are therefore read per request,
// and only this route answers 503 when they are missing — the same pattern as
// the mailer and AI drafting. Building the middleware is cheap (a config
// object), so it is not cached and always reflects the current env.
export const googleAuthMiddleware = createMiddleware(async (c, next) => {
	const { googleClientId, googleClientSecret, googleRedirectUri } = env;

	if (!googleClientId || !googleClientSecret)
		throw new ServiceUnavailableError(
			"Google sign-in is not configured",
			"GOOGLE_AUTH_NOT_CONFIGURED",
		);

	return googleAuth({
		client_id: googleClientId,
		client_secret: googleClientSecret,
		scope: ["openid", "email", "profile"],
		redirect_uri: googleRedirectUri,
	})(c, next);
});
