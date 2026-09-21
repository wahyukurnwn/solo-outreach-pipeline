import { useQuery } from "@tanstack/react-query";
import { extractErrorMessage } from "#/libs/api-error";
import { apiClient } from "#/libs/demo-api-client";

export const demoActivitiesQueryKey = (prospectId: string) =>
	["demo", "activities", prospectId] as const;

export const useDemoActivities = (prospectId: string) => {
	return useQuery({
		queryKey: demoActivitiesQueryKey(prospectId),
		queryFn: async () => {
			const res = await apiClient.api.demo.prospects[
				":prospectId"
			].activities.$get({ param: { prospectId } });

			if (!res.ok)
				throw new Error(
					await extractErrorMessage(
						res,
						"Failed to load demo activity history",
					),
				);

			const { data } = await res.json();
			return data;
		},
		retry: false,
	});
};
