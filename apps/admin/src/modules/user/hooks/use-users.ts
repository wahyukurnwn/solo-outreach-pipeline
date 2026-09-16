import { useQuery } from "@tanstack/react-query";
import { apiClient } from "#/libs/api-client";
import { extractErrorMessage } from "#/libs/api-error";

export const usersQueryKey = ["admin", "users"] as const;

export const useUsers = () => {
	return useQuery({
		queryKey: usersQueryKey,
		queryFn: async () => {
			const res = await apiClient.api.admin.users.$get();

			if (!res.ok)
				throw new Error(await extractErrorMessage(res, "Gagal memuat users"));

			const { data } = await res.json();
			return data;
		},
	});
};
