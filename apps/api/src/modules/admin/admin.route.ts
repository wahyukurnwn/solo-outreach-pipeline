import { Hono } from "hono";
import { validate } from "../../libs/validate";
import { requireAdmin, requireAuth } from "../../middleware/auth";
import type { AppEnv } from "../../types";
import { listResponse } from "../../utils/response";
import {
	updateUserDemoSchema,
	updateUserRoleSchema,
	userIdParamSchema,
} from "./admin.schema";
import { adminService } from "./admin.service";

const adminRoute = new Hono<AppEnv>()
	.get("/api/admin/users", requireAuth, requireAdmin, async (c) => {
		const users = await adminService.listUsers();

		return c.json(listResponse(users));
	})
	.get(
		"/api/admin/users/:id",
		requireAuth,
		requireAdmin,
		validate("param", userIdParamSchema),
		async (c) => {
			const { id } = c.req.valid("param");

			const user = await adminService.getUserById(id);

			return c.json(user);
		},
	)
	.patch(
		"/api/admin/users/:id/role",
		requireAuth,
		requireAdmin,
		validate("param", userIdParamSchema),
		validate("json", updateUserRoleSchema),
		async (c) => {
			const { id } = c.req.valid("param");
			const body = c.req.valid("json");

			const user = await adminService.updateUserRole(id, body);

			return c.json(user);
		},
	)
	.patch(
		"/api/admin/users/:id/demo",
		requireAuth,
		requireAdmin,
		validate("param", userIdParamSchema),
		validate("json", updateUserDemoSchema),
		async (c) => {
			const { id } = c.req.valid("param");
			const body = c.req.valid("json");

			const user = await adminService.updateUserDemo(id, body);

			return c.json(user);
		},
	);

export default adminRoute;
