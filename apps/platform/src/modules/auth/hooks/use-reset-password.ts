import { useMutation } from "@tanstack/react-query";
import { apiClient } from "#/libs/api-client";
import { extractErrorMessage } from "#/libs/api-error";

export const useResetPassword = () => {
	return useMutation({
		mutationFn: async (input: { token: string; password: string }) => {
			const res = await apiClient.api.auth["reset-password"].$post({
				json: input,
			});

			if (!res.ok)
				throw new Error(
					await extractErrorMessage(res, "Gagal mengatur ulang password"),
				);

			return res.json();
		},
	});
};
