import { useQuery } from "@tanstack/react-query";
import { apiClient } from "#/libs/api-client";
import { extractErrorMessage } from "#/libs/api-error";

export const activitiesQueryKey = (prospectId: string) =>
	["activities", prospectId] as const;

export const useActivities = (prospectId: string) => {
	return useQuery({
		queryKey: activitiesQueryKey(prospectId),
		queryFn: async () => {
			const res = await apiClient.api.prospects[":prospectId"].activities.$get({
				param: { prospectId },
			});

			if (!res.ok)
				throw new Error(
					await extractErrorMessage(res, "Gagal memuat riwayat aktivitas"),
				);

			const { data } = await res.json();
			return data;
		},
	});
};
