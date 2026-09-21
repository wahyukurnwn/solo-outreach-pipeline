import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "#/libs/api-client";
import { extractErrorMessage } from "#/libs/api-error";
import { prospectsQueryKey } from "./use-prospects";

export const useDeleteProspect = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const res = await apiClient.api.prospects[":id"].$delete({
				param: { id },
			});

			if (!res.ok)
				throw new Error(
					await extractErrorMessage(res, "Failed to delete prospect"),
				);
		},
		onSuccess: () => {
			// Query detail dikecualikan: halaman detail masih ter-mount sampai
			// navigasi selesai, dan refetch-nya pasti 404 untuk prospek yang
			// baru saja dihapus.
			queryClient.invalidateQueries({
				queryKey: prospectsQueryKey,
				predicate: (query) => query.queryKey[1] !== "detail",
			});
		},
	});
};
