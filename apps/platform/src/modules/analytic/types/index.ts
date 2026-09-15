import type { InferResponseType } from "hono/client";
import type { apiClient } from "#/libs/api-client";

// Di-infer dari response asli GET /api/analytics, pola yang sama dengan
// modules/prospect/types.
export type Analytics = InferResponseType<typeof apiClient.api.analytics.$get>;
