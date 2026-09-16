import { redirect } from "@tanstack/react-router";
import { getAuthToken } from "#/libs/auth.token";

// Sama seperti apps/platform: hanya valid di route ber-`ssr: false`, karena
// sessionStorage tidak ada saat render di server.
export function requireAuthenticated() {
	if (!getAuthToken()) throw redirect({ to: "/signin" });
}
