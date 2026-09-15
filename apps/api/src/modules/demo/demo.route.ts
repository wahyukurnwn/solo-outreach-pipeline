import { Hono } from "hono";
import { validate } from "../../libs/validate";
import { listResponse } from "../../utils/response";
import { prospectIdParamSchema as activityProspectIdParamSchema } from "../activity/activity.schema";
import { activityService } from "../activity/activity.service";
import { analyticsService } from "../analytics/analytics.service";
import {
	followUpsQuerySchema,
	prospectIdParamSchema,
} from "../prospect/prospect.schema";
import { prospectService } from "../prospect/prospect.service";
import { demoService } from "./demo.service";

// Semua route publik (tanpa requireAuth) dan read-only (cuma GET) — logika
// otorisasi/kepemilikan tetap dipakai ulang dari service asli (prospectService
// dkk.) dengan userId milik akun demo, bukan diduplikasi di sini.
const demoRoute = new Hono()
	.get("/api/demo/analytics", async (c) => {
		const userId = await demoService.getDemoUserId();

		const summary = await analyticsService.getSummary(userId);

		return c.json(summary);
	})
	.get(
		"/api/demo/prospects/follow-ups",
		validate("query", followUpsQuerySchema),
		async (c) => {
			const userId = await demoService.getDemoUserId();
			const { date } = c.req.valid("query");

			const prospects = await prospectService.listFollowUpsDue(userId, date);

			return c.json(listResponse(prospects));
		},
	)
	.get("/api/demo/prospects", async (c) => {
		const userId = await demoService.getDemoUserId();

		const prospects = await prospectService.list(userId);

		return c.json(listResponse(prospects));
	})
	.get(
		"/api/demo/prospects/:id",
		validate("param", prospectIdParamSchema),
		async (c) => {
			const userId = await demoService.getDemoUserId();
			const { id } = c.req.valid("param");

			const prospect = await prospectService.findById(userId, id);

			return c.json(prospect);
		},
	)
	.get(
		"/api/demo/prospects/:prospectId/activities",
		validate("param", activityProspectIdParamSchema),
		async (c) => {
			const userId = await demoService.getDemoUserId();
			const { prospectId } = c.req.valid("param");

			const activities = await activityService.listByProspect(
				userId,
				prospectId,
			);

			return c.json(listResponse(activities));
		},
	);

export default demoRoute;
