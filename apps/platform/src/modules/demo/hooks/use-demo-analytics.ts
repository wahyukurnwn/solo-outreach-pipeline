import { useQuery } from "@tanstack/react-query";
import { extractErrorMessage } from "#/libs/api-error";
import { apiClient } from "#/libs/demo-api-client";

export const demoAnalyticsQueryKey = ["demo", "analytics"] as const;

export const useDemoAnalytics = () => {
	return useQuery({
		queryKey: demoAnalyticsQueryKey,
		queryFn: async () => {
			const res = await apiClient.api.demo.analytics.$get();

			if (!res.ok)
				throw new Error(
					await extractErrorMessage(res, "Failed to load demo analytics"),
				);

			return res.json();
		},
		retry: false,
	});
};
