import { env } from "#/config/env";

// OAuth redirect-based (bukan fetch/XHR): browser HARUS navigasi penuh ke
// endpoint ini, karena backend akan redirect ke halaman consent Google lalu
// Google redirect balik ke backend dengan `code`. Ini tidak bisa dilakukan
// lewat fetch() biasa (redirect lintas origin jadi "opaque", body/lokasinya
// tidak bisa dibaca JS).
export const useGoogleSignIn = () => {
	return async () => {
		window.location.href = `${env.apiUrl}/api/auth/callback/google`;
	};
};
