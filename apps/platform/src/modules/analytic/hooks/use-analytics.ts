import { useQuery } from "@tanstack/react-query";
import { apiClient } from "#/libs/api-client";
import { extractErrorMessage } from "#/libs/api-error";

export const analyticsQueryKey = ["analytics"] as const;

export const useAnalytics = () => {
	return useQuery({
		queryKey: analyticsQueryKey,
		queryFn: async () => {
			const res = await apiClient.api.analytics.$get();

			if (!res.ok)
				throw new Error(
					await extractErrorMessage(res, "Failed to load analytics"),
				);

			return res.json();
		},
	});
};
