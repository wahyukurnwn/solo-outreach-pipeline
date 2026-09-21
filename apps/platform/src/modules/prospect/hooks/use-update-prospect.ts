import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType } from "hono/client";
import { apiClient } from "#/libs/api-client";
import { extractErrorMessage } from "#/libs/api-error";
import { prospectsQueryKey } from "./use-prospects";

export type ProspectUpdateInput = InferRequestType<
	(typeof apiClient.api.prospects)[":id"]["$patch"]
>["json"];

export const useUpdateProspect = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			input,
		}: {
			id: string;
			input: ProspectUpdateInput;
		}) => {
			const res = await apiClient.api.prospects[":id"].$patch({
				param: { id },
				json: input,
			});

			if (!res.ok)
				throw new Error(
					await extractErrorMessage(res, "Failed to update prospect"),
				);

			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: prospectsQueryKey });
		},
	});
};
