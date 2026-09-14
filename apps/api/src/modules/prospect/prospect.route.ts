import { Hono } from "hono";
import { validate } from "../../libs/validate";
import { requireAuth } from "../../middleware/auth";
import type { AppEnv } from "../../types";
import { listResponse, messageResponse } from "../../utils/response";
import {
	createProspectSchema,
	prospectIdParamSchema,
	updateProspectSchema,
} from "./prospect.schema";
import { prospectService } from "./prospect.service";

const prospectRoute = new Hono<AppEnv>()
	.post(
		"/api/prospects",
		requireAuth,
		validate("json", createProspectSchema),
		async (c) => {
			const { id: userId } = c.get("user");
			const body = c.req.valid("json");

			const prospect = await prospectService.create(userId, body);

			return c.json(prospect, 201);
		},
	)
	.get("/api/prospects", requireAuth, async (c) => {
		const { id: userId } = c.get("user");

		const prospects = await prospectService.list(userId);

		return c.json(listResponse(prospects));
	})
	.get("/api/prospects/follow-ups", requireAuth, async (c) => {
		const { id: userId } = c.get("user");

		const prospects = await prospectService.listFollowUpsDue(userId);

		return c.json(listResponse(prospects));
	})
	.get(
		"/api/prospects/:id",
		requireAuth,
		validate("param", prospectIdParamSchema),
		async (c) => {
			const { id: userId } = c.get("user");
			const { id } = c.req.valid("param");

			const prospect = await prospectService.findById(userId, id);

			return c.json(prospect);
		},
	)
	.patch(
		"/api/prospects/:id",
		requireAuth,
		validate("param", prospectIdParamSchema),
		validate("json", updateProspectSchema),
		async (c) => {
			const { id: userId } = c.get("user");
			const { id } = c.req.valid("param");
			const body = c.req.valid("json");

			const prospect = await prospectService.update(userId, id, body);

			return c.json(prospect);
		},
	)
	.delete(
		"/api/prospects/:id",
		requireAuth,
		validate("param", prospectIdParamSchema),
		async (c) => {
			const { id: userId } = c.get("user");
			const { id } = c.req.valid("param");

			await prospectService.remove(userId, id);

			return c.json(messageResponse("Prospect berhasil dihapus."));
		},
	);

export default prospectRoute;
