import { env } from "../config/env";
import { clearAuthToken, setAuthToken } from "./auth.token";

// Refresh token disimpan di cookie httpOnly (tidak bisa dibaca dari sini) —
// endpoint ini divalidasi lewat cookie yang otomatis terkirim browser
// (credentials:"include"), bukan lewat body/header.
async function performRefresh(): Promise<string | null> {
	try {
		const res = await fetch(`${env.apiUrl}/api/auth/refresh`, {
			method: "POST",
			credentials: "include",
		});

		if (!res.ok) return null;

		const { accessToken } = (await res.json()) as { accessToken: string };
		setAuthToken(accessToken);

		return accessToken;
	} catch {
		return null;
	}
}

// Di-share antar request yang bersamaan kena 401 — refresh token dirotasi
// tiap dipakai (lihat backend), jadi kalau dua request refresh jalan
// bersamaan dengan cookie lama yang sama, salah satunya akan gagal karena
// token sudah di-revoke oleh yang pertama. Satu promise yang di-reuse
// mencegah "thundering herd" itu.
let refreshPromise: Promise<string | null> | null = null;

export function refreshAccessToken(): Promise<string | null> {
	if (!refreshPromise) {
		refreshPromise = performRefresh().finally(() => {
			refreshPromise = null;
		});
	}

	return refreshPromise;
}

// Dipakai apiClient sebagai pengganti `fetch` global — auto-retry sekali
// kalau kena 401 DAN request itu memang mengirim Authorization header
// (penanda ini request otentikasi, bukan mis. /auth/signin yang wajar 401
// saat password salah dan tidak boleh memicu refresh).
export async function fetchWithRefresh(
	input: RequestInfo | URL,
	init?: RequestInit,
): Promise<Response> {
	const requestInit: RequestInit = { ...init, credentials: "include" };
	const res = await fetch(input, requestInit);

	if (res.status !== 401) return res;
	if (!new Headers(init?.headers).has("Authorization")) return res;

	const newAccessToken = await refreshAccessToken();
	if (!newAccessToken) {
		clearAuthToken();
		return res;
	}

	const retryHeaders = new Headers(init?.headers);
	retryHeaders.set("Authorization", `Bearer ${newAccessToken}`);

	return fetch(input, { ...requestInit, headers: retryHeaders });
}
