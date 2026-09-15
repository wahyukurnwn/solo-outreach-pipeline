import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType } from "hono/client";
import { apiClient } from "#/libs/api-client";
import { extractErrorMessage } from "#/libs/api-error";
import { prospectsQueryKey } from "./use-prospects";

export type ProspectInput = InferRequestType<
	typeof apiClient.api.prospects.$post
>["json"];

export const useCreateProspect = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: ProspectInput) => {
			const res = await apiClient.api.prospects.$post({ json: input });

			if (!res.ok)
				throw new Error(
					await extractErrorMessage(res, "Gagal menambah prospek"),
				);

			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: prospectsQueryKey });
		},
	});
};
