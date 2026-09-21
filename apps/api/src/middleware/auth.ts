import type { Context } from "hono";
import { createMiddleware } from "hono/factory";
import { ForbiddenError, UnauthorizedError } from "../exceptions";
import { verifyToken } from "../libs/jwt";
import type { AppEnv, AuthUser } from "../types";

export async function getUserFromRequest(c: Context): Promise<AuthUser | null> {
	const header = c.req.header("Authorization");

	if (!header?.startsWith("Bearer ")) return null;

	const token = header.slice("Bearer ".length);

	try {
		return verifyToken(token);
	} catch {
		throw new UnauthorizedError(
			"The token is invalid or has expired",
			"INVALID_TOKEN",
		);
	}
}

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
	const user = await getUserFromRequest(c);

	if (!user)
		throw new UnauthorizedError(
			"An `Authorization: Bearer <token>` header or a signed-in session is required",
			"MISSING_TOKEN",
		);

	c.set("user", user);

	await next();
});

export const requireAdmin = createMiddleware<AppEnv>(async (c, next) => {
	const user = c.get("user");

	if (user.role !== "ADMIN")
		throw new ForbiddenError("Admin access is required");

	await next();
});
