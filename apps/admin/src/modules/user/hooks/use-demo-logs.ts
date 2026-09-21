import { useQuery } from "@tanstack/react-query";
import { apiClient } from "#/libs/api-client";
import { extractErrorMessage } from "#/libs/api-error";

export const demoLogsQueryKey = (userId: string) =>
	["admin", "users", userId, "demo-logs"] as const;

export const useDemoLogs = (userId: string) => {
	return useQuery({
		queryKey: demoLogsQueryKey(userId),
		queryFn: async () => {
			const res = await apiClient.api.admin.users[":id"]["demo-logs"].$get({
				param: { id: userId },
			});

			if (!res.ok)
				throw new Error(
					await extractErrorMessage(res, "Failed to load demo history"),
				);

			const { data } = await res.json();
			return data;
		},
	});
};
