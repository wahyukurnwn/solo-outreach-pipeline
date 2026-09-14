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
	const { jwtExpiresInDays } = env;

	return jwt.sign(payload, getSecret(), { expiresIn: `${jwtExpiresInDays}d` });
}

export function verifyToken(token: string) {
	return jwt.verify(token, getSecret()) as AuthUser;
}
