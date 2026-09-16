import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { apiClient } from "#/libs/api-client";
import { clearAuthToken } from "#/libs/auth.token";

// POST /api/auth/logout me-revoke refresh token di server supaya cookie
// yang tersisa di browser tidak bisa dipakai lagi. Best-effort — kalau
// request gagal (mis. offline), tetap lanjut bersihkan state lokal.
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
		queryClient.clear();
		navigate({ to: "/signin" });
	};
};
