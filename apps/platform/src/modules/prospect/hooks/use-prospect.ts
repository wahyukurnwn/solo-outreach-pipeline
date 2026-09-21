import { useQuery } from "@tanstack/react-query";
import { apiClient } from "#/libs/api-client";
import { extractErrorMessage } from "#/libs/api-error";
import { prospectsQueryKey } from "./use-prospects";

export const prospectDetailQueryKey = (id: string) =>
	[...prospectsQueryKey, "detail", id] as const;

export const useProspect = (id: string) => {
	return useQuery({
		queryKey: prospectDetailQueryKey(id),
		queryFn: async () => {
			const res = await apiClient.api.prospects[":id"].$get({ param: { id } });

			if (!res.ok)
				throw new Error(
					await extractErrorMessage(res, "Failed to load prospect"),
				);

			return res.json();
		},
		retry: false,
	});
};
