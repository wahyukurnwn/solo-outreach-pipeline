import { useQuery } from "@tanstack/react-query";
import { apiClient } from "#/libs/api-client";
import { extractErrorMessage } from "#/libs/api-error";

export const roleLogsQueryKey = (userId: string) =>
	["admin", "users", userId, "role-logs"] as const;

export const useRoleLogs = (userId: string) => {
	return useQuery({
		queryKey: roleLogsQueryKey(userId),
		queryFn: async () => {
			const res = await apiClient.api.admin.users[":id"]["role-logs"].$get({
				param: { id: userId },
			});

			if (!res.ok)
				throw new Error(
					await extractErrorMessage(res, "Gagal memuat riwayat role"),
				);

			const { data } = await res.json();
			return data;
		},
	});
};
