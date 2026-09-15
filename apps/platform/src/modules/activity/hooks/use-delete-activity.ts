import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "#/libs/api-client";
import { extractErrorMessage } from "#/libs/api-error";
import { activitiesQueryKey } from "./use-activities";

export const useDeleteActivity = (prospectId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const res = await apiClient.api.activities[":id"].$delete({
				param: { id },
			});

			if (!res.ok)
				throw new Error(
					await extractErrorMessage(res, "Gagal menghapus aktivitas"),
				);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: activitiesQueryKey(prospectId),
			});
		},
	});
};
