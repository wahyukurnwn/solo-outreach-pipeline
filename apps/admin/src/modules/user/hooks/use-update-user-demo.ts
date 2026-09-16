import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType } from "hono/client";
import { apiClient } from "#/libs/api-client";
import { extractErrorMessage } from "#/libs/api-error";
import { userQueryKey } from "./use-user";
import { usersQueryKey } from "./use-users";

type UpdateDemoInput = InferRequestType<
	(typeof apiClient.api.admin.users)[":id"]["demo"]["$patch"]
>["json"];

export const useUpdateUserDemo = (id: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (body: UpdateDemoInput) => {
			const res = await apiClient.api.admin.users[":id"].demo.$patch({
				param: { id },
				json: body,
			});

			if (!res.ok)
				throw new Error(
					await extractErrorMessage(res, "Gagal ubah status demo"),
				);

			return res.json();
		},
		onSuccess: (updatedUser) => {
			queryClient.setQueryData(userQueryKey(id), updatedUser);
			// Menyalakan demo di satu user bisa mematikan demo user lain (invariant
			// backend: paling banyak satu is_demo=true) — invalidate seluruh list
			// supaya badge "Demo" di user lain ikut sinkron, bukan cuma diri sendiri.
			queryClient.invalidateQueries({ queryKey: usersQueryKey });
		},
	});
};
