import type { InferResponseType } from "hono/client";
import type { apiClient } from "#/libs/api-client";

// Di-infer langsung dari response asli GET /api/prospects (Hono RPC) —
// bukan diketik ulang manual. Kalau bentuk response API berubah, tipe ini
// otomatis ikut berubah & TypeScript akan tunjukkan error di pemakainya,
// bukan diam-diam drift dari kenyataan.
type ProspectsResponse = InferResponseType<typeof apiClient.api.prospects.$get>;

export type Prospect = ProspectsResponse["data"][number];
