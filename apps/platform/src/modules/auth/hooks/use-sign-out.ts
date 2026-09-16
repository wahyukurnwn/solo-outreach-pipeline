import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { apiClient } from "#/libs/api-client";
import { clearAuthToken } from "#/libs/auth.token";

// POST /api/auth/logout me-revoke refresh token di server (lihat
// credential.service.ts:revokeRefreshToken) supaya cookie yang tersisa di
// browser tidak bisa dipakai lagi untuk minta access token baru. Best-effort
// — kalau request gagal (mis. offline), tetap lanjut bersihkan state lokal
// supaya user tidak terjebak di halaman yang butuh login.
export const useSignOut = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	return async () => {
		try {
			await apiClient.api.auth.logout.$post();
		} catch {
			// diamkan — pembersihan lokal di bawah tetap jalan
		}

		clearAuthToken();
		// queryClient.clear() (bukan cuma invalidate "auth.me") supaya data
		// prospects/activities milik user sebelumnya tidak nyangkut kalau user
		// lain login di tab yang sama.
		queryClient.clear();
		navigate({ to: "/auth/signin" });
	};
};
