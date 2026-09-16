import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { ServiceUnavailableError } from "../exceptions";
import type { AuthUser } from "../types";

function getSecret() {
	const { jwtSecret } = env;

	if (!jwtSecret) throw new ServiceUnavailableError("JWT_SECRET_MISSING");
	return jwtSecret;
}

export function signToken(payload: AuthUser) {
	const { accessTokenExpiresInMinutes } = env;

	return jwt.sign(payload, getSecret(), {
		expiresIn: `${accessTokenExpiresInMinutes}m`,
	});
}

export function verifyToken(token: string) {
	return jwt.verify(token, getSecret()) as AuthUser;
}
