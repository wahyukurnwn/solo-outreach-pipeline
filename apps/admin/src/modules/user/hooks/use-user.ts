import { useQuery } from "@tanstack/react-query";
import { apiClient } from "#/libs/api-client";
import { extractErrorMessage } from "#/libs/api-error";

export const userQueryKey = (id: string) => ["admin", "users", id] as const;

export const useUser = (id: string) => {
	return useQuery({
		queryKey: userQueryKey(id),
		queryFn: async () => {
			const res = await apiClient.api.admin.users[":id"].$get({
				param: { id },
			});

			if (!res.ok)
				throw new Error(await extractErrorMessage(res, "Failed to load user"));

			return res.json();
		},
	});
};
