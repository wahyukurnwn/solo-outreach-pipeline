import { useMutation } from "@tanstack/react-query";
import type { InferRequestType } from "hono/client";
import { apiClient } from "#/libs/api-client";
import { extractErrorMessage } from "#/libs/api-error";
import { setAuthToken } from "#/libs/auth.token";

export type SignInInput = InferRequestType<
	typeof apiClient.api.auth.signin.$post
>["json"];

export const useSignIn = () => {
	return useMutation({
		mutationFn: async (credentials: SignInInput) => {
			const res = await apiClient.api.auth.signin.$post({ json: credentials });

			if (!res.ok)
				throw new Error(
					await extractErrorMessage(res, "Incorrect email or password"),
				);

			const data = await res.json();
			setAuthToken(data.accessToken);

			return data;
		},
	});
};
