import { redirect } from "@tanstack/react-router";
import { getAuthToken } from "#/libs/auth.token";

// Token login cuma ada di sessionStorage, jadi guard ini hanya valid di route
// ber-`ssr: false` — kalau dijalankan di server, token selalu terbaca kosong
// dan setiap user akan ter-redirect ke halaman signin.
export function requireAuthenticated() {
	if (!getAuthToken()) throw redirect({ to: "/auth/signin" });
}
