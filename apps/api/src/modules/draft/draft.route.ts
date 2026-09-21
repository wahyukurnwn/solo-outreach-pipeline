import { Hono } from "hono";
import { userRateLimit } from "../../libs/rate-limit";
import { validate } from "../../libs/validate";
import { requireAuth } from "../../middleware/auth";
import type { AppEnv } from "../../types";
import { prospectIdParamSchema } from "../prospect/prospect.schema";
import { draftService } from "./draft.service";

// 20/jam per user — cukup longgar untuk pemakaian wajar (belasan draft per
// sesi kerja), cukup ketat untuk membatasi kerugian kalau ada spam/bug,
// karena setiap panggilan ini beneran bayar ke provider LLM.
const DRAFT_RATE_LIMIT = {
	windowMs: 60 * 60 * 1000,
	max: 20,
	keyPrefix: "draft",
};

const draftRoute = new Hono<AppEnv>().post(
	"/api/prospects/:id/draft",
	requireAuth,
	userRateLimit(DRAFT_RATE_LIMIT),
	validate("param", prospectIdParamSchema),
	async (c) => {
		const { id: userId } = c.get("user");
		const { id } = c.req.valid("param");

		const result = await draftService.generateForProspect(userId, id);

		return c.json(result);
	},
);

export default draftRoute;
