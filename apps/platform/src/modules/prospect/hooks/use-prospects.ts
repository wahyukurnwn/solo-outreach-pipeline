import { useQuery } from "@tanstack/react-query";
import { apiClient } from "#/libs/api-client";
import { extractErrorMessage } from "#/libs/api-error";

export const prospectsQueryKey = ["prospects"] as const;

export const useProspects = () => {
	return useQuery({
		queryKey: prospectsQueryKey,
		queryFn: async () => {
			const res = await apiClient.api.prospects.$get();

			if (!res.ok)
				throw new Error(
					await extractErrorMessage(res, "Failed to load prospects"),
				);

			const { data } = await res.json();
			return data;
		},
	});
};
