import { useMutation } from "@tanstack/react-query";
import { apiClient } from "#/libs/api-client";
import { extractErrorMessage } from "#/libs/api-error";

export const useForgotPassword = () => {
	return useMutation({
		mutationFn: async (input: { email: string }) => {
			// `app: "admin"` supaya backend membangun link reset ke origin admin
			// (localhost:4000/reset-password), bukan ke apps/platform — lihat
			// resetPasswordUrlByApp di apps/api/src/config/env.ts.
			const res = await apiClient.api.auth["forgot-password"].$post({
				json: { ...input, app: "admin" },
			});

			if (!res.ok)
				throw new Error(
					await extractErrorMessage(res, "Failed to send the reset link"),
				);

			return res.json();
		},
	});
};
