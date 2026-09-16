import type { InferResponseType } from "hono/client";
import type { apiClient } from "#/libs/api-client";

// Di-infer dari response asli GET /api/admin/users — kalau bentuk response
// backend berubah, tipe ini ikut berubah otomatis.
type UsersResponse = InferResponseType<typeof apiClient.api.admin.users.$get>;

export type UserSummary = UsersResponse["data"][number];

type RoleLogsResponse = InferResponseType<
	(typeof apiClient.api.admin.users)[":id"]["role-logs"]["$get"]
>;

export type RoleChangeLog = RoleLogsResponse["data"][number];

type DemoLogsResponse = InferResponseType<
	(typeof apiClient.api.admin.users)[":id"]["demo-logs"]["$get"]
>;

export type DemoChangeLog = DemoLogsResponse["data"][number];
