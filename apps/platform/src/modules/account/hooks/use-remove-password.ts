import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "#/libs/api-client";
import { extractErrorMessage } from "#/libs/api-error";
import { meQueryKey } from "#/modules/auth";

export const useRemovePassword = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: { currentPassword: string }) => {
			const res = await apiClient.api.auth.password.$delete({ json: input });

			if (!res.ok)
				throw new Error(
					await extractErrorMessage(res, "Gagal menghapus password"),
				);

			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: meQueryKey });
		},
	});
};
