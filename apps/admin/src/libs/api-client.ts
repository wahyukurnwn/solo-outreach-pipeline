import { hc } from "hono/client";
import type { AppType } from "../../../api/src/app";
import { env } from "../config/env";
import { getAuthToken } from "./auth.token";

// `headers` sebagai function (bukan object statis) supaya token dibaca ulang
// setiap request — kalau statis, client ini akan "membekukan" token dari
// saat modul pertama kali di-import, padahal getAuthToken() bisa berubah
// (login/logout) sepanjang umur tab.
export const apiClient = hc<AppType>(env.apiUrl, {
	headers: (): Record<string, string> => {
		const token = getAuthToken();
		return token ? { Authorization: `Bearer ${token}` } : {};
	},
});
