import { useQuery } from "@tanstack/react-query";
import { apiClient } from "#/libs/api-client";
import { extractErrorMessage } from "#/libs/api-error";
import { toLocalIsoDate } from "../follow-up";
import { prospectsQueryKey } from "./use-prospects";

// Diturunkan dari prospectsQueryKey supaya invalidate ["prospects"] setelah
// create/update prospek ikut menyegarkan daftar follow-up juga.
export const followUpsQueryKey = [...prospectsQueryKey, "follow-ups"] as const;

export const useFollowUps = () => {
	// Server tidak tahu zona waktu user, sedangkan followUpDate cuma tanggal —
	// tanpa tanggal lokal ini, follow-up "hari ini" di WIB baru muncul setelah
	// tanggal UTC ikut berganti (jam 07.00).
	const today = toLocalIsoDate(new Date());

	return useQuery({
		queryKey: [...followUpsQueryKey, today],
		queryFn: async () => {
			const res = await apiClient.api.prospects["follow-ups"].$get({
				query: { date: today },
			});

			if (!res.ok)
				throw new Error(
					await extractErrorMessage(res, "Failed to load follow-ups"),
				);

			const { data } = await res.json();
			return data;
		},
	});
};
