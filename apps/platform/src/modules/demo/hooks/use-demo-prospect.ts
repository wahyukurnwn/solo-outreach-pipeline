import { useQuery } from "@tanstack/react-query";
import { extractErrorMessage } from "#/libs/api-error";
import { apiClient } from "#/libs/demo-api-client";
import { demoProspectsQueryKey } from "./use-demo-prospects";

export const demoProspectDetailQueryKey = (id: string) =>
	[...demoProspectsQueryKey, "detail", id] as const;

export const useDemoProspect = (id: string) => {
	return useQuery({
		queryKey: demoProspectDetailQueryKey(id),
		queryFn: async () => {
			const res = await apiClient.api.demo.prospects[":id"].$get({
				param: { id },
			});

			if (!res.ok)
				throw new Error(
					await extractErrorMessage(res, "Demo prospect not found"),
				);

			return res.json();
		},
		retry: false,
	});
};
