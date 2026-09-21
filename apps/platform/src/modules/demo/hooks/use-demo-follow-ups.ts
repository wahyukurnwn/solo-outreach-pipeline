import { useQuery } from "@tanstack/react-query";
import { extractErrorMessage } from "#/libs/api-error";
import { apiClient } from "#/libs/demo-api-client";
import { toLocalIsoDate } from "#/modules/prospect";
import { demoProspectsQueryKey } from "./use-demo-prospects";

export const demoFollowUpsQueryKey = [
	...demoProspectsQueryKey,
	"follow-ups",
] as const;

export const useDemoFollowUps = () => {
	const today = toLocalIsoDate(new Date());

	return useQuery({
		queryKey: [...demoFollowUpsQueryKey, today],
		queryFn: async () => {
			const res = await apiClient.api.demo.prospects["follow-ups"].$get({
				query: { date: today },
			});

			if (!res.ok)
				throw new Error(
					await extractErrorMessage(res, "Failed to load demo follow-ups"),
				);

			const { data } = await res.json();
			return data;
		},
		retry: false,
	});
};
