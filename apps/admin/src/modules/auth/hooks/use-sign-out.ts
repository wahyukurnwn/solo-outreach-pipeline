import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { clearAuthToken } from "#/libs/auth.token";

// Sama seperti apps/platform: tidak ada request network, logout murni
// membuang token lokal + membersihkan cache query.
export const useSignOut = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	return () => {
		clearAuthToken();
		queryClient.clear();
		navigate({ to: "/signin" });
	};
};
