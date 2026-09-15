import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiClient } from "#/libs/api-client";
import { extractErrorMessage } from "#/libs/api-error";
import type { AuthCredentials } from "../schema/auth.schema";

export const useSignUp = () => {
	return useMutation({
		mutationFn: async (credentials: AuthCredentials) => {
			const res = await apiClient.api.auth.signup.$post({ json: credentials });

			if (!res.ok)
				throw new Error(
					await extractErrorMessage(res, "Gagal mendaftar — coba email lain"),
				);

			return await res.json();
		},

		onSuccess: () => {
			toast.success("Registered successfully, please login!");
		},
	});
};
