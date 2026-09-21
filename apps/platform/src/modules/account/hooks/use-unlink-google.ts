import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "#/libs/api-client";
import { extractErrorMessage } from "#/libs/api-error";
import { meQueryKey } from "#/modules/auth";

export const useUnlinkGoogle = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			const res = await apiClient.api.auth.google.$delete();

			if (!res.ok)
				throw new Error(
					await extractErrorMessage(res, "Failed to unlink Google account"),
				);

			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: meQueryKey });
		},
	});
};
