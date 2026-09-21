import { useMutation } from "@tanstack/react-query";
import type { InferRequestType } from "hono/client";
import { apiClient } from "#/libs/api-client";
import { extractErrorMessage } from "#/libs/api-error";
import { clearAuthToken, setAuthToken } from "#/libs/auth.token";

export type SignInInput = InferRequestType<
	typeof apiClient.api.auth.signin.$post
>["json"];

export const useSignIn = () => {
	return useMutation({
		mutationFn: async (credentials: SignInInput) => {
			const res = await apiClient.api.auth.signin.$post({ json: credentials });

			if (!res.ok)
				throw new Error(
					await extractErrorMessage(res, "Incorrect email or password"),
				);

			const data = await res.json();
			// Signin response tidak membawa role (lihat auth.route.ts) — set
			// token dulu supaya apiClient bisa memanggil /me dengan token baru,
			// lalu cek role di sini sebelum benar-benar dianggap "berhasil login".
			setAuthToken(data.accessToken);

			const meRes = await apiClient.api.auth.me.$get();
			if (!meRes.ok) {
				clearAuthToken();
				throw new Error("Failed to verify the account");
			}

			const me = await meRes.json();
			if (me.role !== "ADMIN") {
				clearAuthToken();
				throw new Error("Admin access is required to sign in here");
			}

			return { ...data, role: me.role };
		},
	});
};
