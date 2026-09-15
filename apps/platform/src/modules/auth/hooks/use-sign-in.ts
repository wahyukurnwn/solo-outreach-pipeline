import { useMutation } from "@tanstack/react-query";
import { apiClient } from "#/libs/api-client";
import { extractErrorMessage } from "#/libs/api-error";
import { setAuthToken } from "#/libs/auth.token";
import type { AuthCredentials } from "#/modules/auth/schema/auth.schema";

export const useSignIn = () => {
	return useMutation({
		mutationFn: async (credentials: AuthCredentials) => {
			const res = await apiClient.api.auth.signin.$post({ json: credentials });

			if (!res.ok)
				throw new Error(
					await extractErrorMessage(res, "Email atau password salah"),
				);

			const data = await res.json();
			setAuthToken(data.accessToken);

			return data;
		},
	});
};
