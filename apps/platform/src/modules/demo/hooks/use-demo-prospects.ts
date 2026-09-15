import { useQuery } from "@tanstack/react-query";
import { extractErrorMessage } from "#/libs/api-error";
import { apiClient } from "#/libs/demo-api-client";

export const demoProspectsQueryKey = ["demo", "prospects"] as const;

export const useDemoProspects = () => {
	return useQuery({
		queryKey: demoProspectsQueryKey,
		queryFn: async () => {
			const res = await apiClient.api.demo.prospects.$get();

			if (!res.ok)
				throw new Error(
					await extractErrorMessage(res, "Gagal memuat data demo"),
				);

			const { data } = await res.json();
			return data;
		},
		retry: false,
	});
};
