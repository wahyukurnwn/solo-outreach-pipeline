// Endpoint demo (GET /api/demo/*) publik, read-only, tidak pernah butuh
// Authorization header atau cookie session (PRD §7: "tidak pernah menerima  user_id dari client").

import { hc } from "hono/client";
import type { AppType } from "../../../api/src/app";
import { env } from "../config/env";

export const apiClient = hc<AppType>(env.apiUrl);
