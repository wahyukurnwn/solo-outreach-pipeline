import type { InferResponseType } from "hono/client";
import type { apiClient } from "#/libs/api-client";

// Di-infer dari response asli GET /api/prospects/:prospectId/activities,
// pola yang sama dengan modules/prospect/types.
type ActivitiesResponse = InferResponseType<
	(typeof apiClient.api.prospects)[":prospectId"]["activities"]["$get"]
>;

export type Activity = ActivitiesResponse["data"][number];
