import { useMutation } from "@tanstack/react-query";
import type { InferRequestType } from "hono/client";
import toast from "react-hot-toast";
import { apiClient } from "#/libs/api-client";
import { extractErrorMessage } from "#/libs/api-error";

export type SignUpInput = InferRequestType<
	typeof apiClient.api.auth.signup.$post
>["json"];

export const useSignUp = () => {
	return useMutation({
		mutationFn: async (credentials: SignUpInput) => {
			const res = await apiClient.api.auth.signup.$post({ json: credentials });

			if (!res.ok)
				throw new Error(
					await extractErrorMessage(
						res,
						"Sign-up failed — try a different email",
					),
				);

			return await res.json();
		},

		onSuccess: () => {
			toast.success("Registered successfully, please login!");
		},
	});
};
