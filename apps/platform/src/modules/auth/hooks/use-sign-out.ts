import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { clearAuthToken } from "#/libs/auth.token";

// Logout murni sisi client — backend tidak punya mekanisme revoke/blacklist
// untuk access token (lihat catatan di jwt.ts), jadi tidak ada request
// network di sini. "Logout" = buang token + bersihkan cache query.
export const useSignOut = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	return () => {
		clearAuthToken();
		// queryClient.clear() (bukan cuma invalidate "auth.me") supaya data
		// prospects/activities milik user sebelumnya tidak nyangkut kalau user
		// lain login di tab yang sama.
		queryClient.clear();
		navigate({ to: "/auth/signin" });
	};
};
