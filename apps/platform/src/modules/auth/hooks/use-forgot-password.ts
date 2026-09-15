import { useMutation } from "@tanstack/react-query";
import { apiClient } from "#/libs/api-client";
import { extractErrorMessage } from "#/libs/api-error";

export const useForgotPassword = () => {
	return useMutation({
		mutationFn: async (input: { email: string }) => {
			const res = await apiClient.api.auth["forgot-password"].$post({
				json: input,
			});

			if (!res.ok)
				throw new Error(
					await extractErrorMessage(res, "Gagal mengirim link reset password"),
				);

			return res.json();
		},
	});
};
