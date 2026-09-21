import { useMutation } from "@tanstack/react-query";
import { apiClient } from "#/libs/api-client";
import { extractErrorMessage } from "#/libs/api-error";
import { setAuthToken } from "#/libs/auth.token";

export const useGoogleExchange = () => {
	return useMutation({
		mutationFn: async (code: string) => {
			const res = await apiClient.api.auth.google.exchange.$post({
				json: { code },
			});

			if (!res.ok)
				throw new Error(
					await extractErrorMessage(res, "Failed to sign in with Google"),
				);

			const data = await res.json();
			setAuthToken(data.accessToken);

			return data;
		},
	});
};
