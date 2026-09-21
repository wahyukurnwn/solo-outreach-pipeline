import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType } from "hono/client";
import { apiClient } from "#/libs/api-client";
import { extractErrorMessage } from "#/libs/api-error";
import { activitiesQueryKey } from "./use-activities";

export type ActivityUpdateInput = InferRequestType<
	(typeof apiClient.api.activities)[":id"]["$patch"]
>["json"];

export const useUpdateActivity = (prospectId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			input,
		}: {
			id: string;
			input: ActivityUpdateInput;
		}) => {
			const res = await apiClient.api.activities[":id"].$patch({
				param: { id },
				json: input,
			});

			if (!res.ok)
				throw new Error(
					await extractErrorMessage(res, "Failed to update activity"),
				);

			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: activitiesQueryKey(prospectId),
			});
		},
	});
};
