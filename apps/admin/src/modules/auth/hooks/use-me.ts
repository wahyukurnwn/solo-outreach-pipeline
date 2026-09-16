import { useQuery } from "@tanstack/react-query";
import { apiClient } from "#/libs/api-client";
import { extractErrorMessage } from "#/libs/api-error";
import { clearAuthToken, getAuthToken } from "#/libs/auth.token";

export const meQueryKey = ["auth", "me"] as const;

export const useMe = () => {
	return useQuery({
		queryKey: meQueryKey,
		queryFn: async () => {
			const res = await apiClient.api.auth.me.$get();

			if (res.status === 401) {
				clearAuthToken();
				return null;
			}

			if (!res.ok)
				throw new Error(
					await extractErrorMessage(res, "Gagal memuat data user"),
				);

			return res.json();
		},
		enabled: Boolean(getAuthToken()),
		retry: false,
	});
};
