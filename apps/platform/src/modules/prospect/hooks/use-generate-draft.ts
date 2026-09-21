import { useMutation } from "@tanstack/react-query";
import { apiClient } from "#/libs/api-client";
import { extractErrorMessage } from "#/libs/api-error";

// Stateless — tidak disimpan di query cache, cuma teks sekali pakai yang
// dituang ke field pesan aktivitas (lihat activity-log-form.tsx). Sama
// dengan desain backend-nya (tidak ada tabel ai_drafts, lihat ERD.md).
export const useGenerateDraft = (prospectId: string) => {
	return useMutation({
		mutationFn: async () => {
			const res = await apiClient.api.prospects[":id"].draft.$post({
				param: { id: prospectId },
			});

			if (!res.ok)
				throw new Error(
					await extractErrorMessage(res, "Failed to generate draft"),
				);

			const { draft } = await res.json();
			return draft;
		},
	});
};
