import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { requireAuth } from "../../middleware/auth";
import type { AppEnv } from "../../types";
import { listResponse, messageResponse } from "../../utils/response";
import {
	activityIdParamSchema,
	createActivitySchema,
	prospectIdParamSchema,
	updateActivitySchema,
} from "./activity.schema";
import { activityService } from "./activity.service";

const activityRoute = new Hono<AppEnv>()
	.post(
		"/api/prospects/:prospectId/activities",
		requireAuth,
		zValidator("param", prospectIdParamSchema),
		zValidator("json", createActivitySchema),
		async (c) => {
			const { id: userId } = c.get("user");
			const { prospectId } = c.req.valid("param");
			const body = c.req.valid("json");

			const activity = await activityService.create(userId, prospectId, body);

			return c.json(activity, 201);
		},
	)
	.get(
		"/api/prospects/:prospectId/activities",
		requireAuth,
		zValidator("param", prospectIdParamSchema),
		async (c) => {
			const { id: userId } = c.get("user");
			const { prospectId } = c.req.valid("param");

			const activities = await activityService.listByProspect(
				userId,
				prospectId,
			);

			return c.json(listResponse(activities));
		},
	)
	.patch(
		"/api/activities/:id",
		requireAuth,
		zValidator("param", activityIdParamSchema),
		zValidator("json", updateActivitySchema),
		async (c) => {
			const { id: userId } = c.get("user");
			const { id } = c.req.valid("param");
			const body = c.req.valid("json");

			const activity = await activityService.update(userId, id, body);

			return c.json(activity);
		},
	)
	.delete(
		"/api/activities/:id",
		requireAuth,
		zValidator("param", activityIdParamSchema),
		async (c) => {
			const { id: userId } = c.get("user");
			const { id } = c.req.valid("param");

			await activityService.remove(userId, id);

			return c.json(messageResponse("Activity berhasil dihapus."));
		},
	);

export default activityRoute;
