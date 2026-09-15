import { Hono } from "hono";
import { requireAuth } from "../../middleware/auth";
import type { AppEnv } from "../../types";
import { analyticsService } from "./analytics.service";

const analyticsRoute = new Hono<AppEnv>().get(
	"/api/analytics",
	requireAuth,
	async (c) => {
		const { id: userId } = c.get("user");

		const summary = await analyticsService.getSummary(userId);

		return c.json(summary);
	},
);

export default analyticsRoute;
