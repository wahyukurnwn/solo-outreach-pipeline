import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType } from "hono/client";
import { apiClient } from "#/libs/api-client";
import { extractErrorMessage } from "#/libs/api-error";
import { activitiesQueryKey } from "./use-activities";

export type ActivityInput = InferRequestType<
	(typeof apiClient.api.prospects)[":prospectId"]["activities"]["$post"]
>["json"];

export const useCreateActivity = (prospectId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: ActivityInput) => {
			const res = await apiClient.api.prospects[":prospectId"].activities.$post(
				{ param: { prospectId }, json: input },
			);

			if (!res.ok)
				throw new Error(
					await extractErrorMessage(res, "Failed to save activity"),
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
