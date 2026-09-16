import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType } from "hono/client";
import { apiClient } from "#/libs/api-client";
import { extractErrorMessage } from "#/libs/api-error";
import { userQueryKey } from "./use-user";
import { usersQueryKey } from "./use-users";

type UpdateRoleInput = InferRequestType<
	(typeof apiClient.api.admin.users)[":id"]["role"]["$patch"]
>["json"];

export const useUpdateUserRole = (id: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (body: UpdateRoleInput) => {
			const res = await apiClient.api.admin.users[":id"].role.$patch({
				param: { id },
				json: body,
			});

			if (!res.ok)
				throw new Error(await extractErrorMessage(res, "Gagal ubah role"));

			return res.json();
		},
		onSuccess: (updatedUser) => {
			queryClient.setQueryData(userQueryKey(id), updatedUser);
			queryClient.invalidateQueries({ queryKey: usersQueryKey });
		},
	});
};
