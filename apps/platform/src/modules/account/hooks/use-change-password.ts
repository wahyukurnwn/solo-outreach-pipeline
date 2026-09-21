import { useMutation } from "@tanstack/react-query";
import type { InferRequestType } from "hono/client";
import { apiClient } from "#/libs/api-client";
import { extractErrorMessage } from "#/libs/api-error";

export type ChangePasswordInput = InferRequestType<
	typeof apiClient.api.auth.password.$patch
>["json"];

export const useChangePassword = () => {
	return useMutation({
		mutationFn: async (input: ChangePasswordInput) => {
			const res = await apiClient.api.auth.password.$patch({ json: input });

			if (!res.ok)
				throw new Error(
					await extractErrorMessage(res, "Failed to change password"),
				);

			return res.json();
		},
	});
};
