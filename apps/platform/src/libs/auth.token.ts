// PRD: token JWT disimpan di sessionStorage (bukan localStorage) — hilang
// begitu tab ditutup, bukan proteksi XSS (JS tetap bisa baca keduanya),
// cuma tidak bertahan lintas restart browser. Lihat PRD §8.

const AUTH_TOKEN_KEY = "auth_token";

// TanStack Start me-render di server (Node) juga, di mana sessionStorage
// tidak ada — dijaga di sini supaya fungsi-fungsi ini aman dipanggil dari
// mana saja (mis. dari apiClient.headers() yang bisa saja jalan di loader
// SSR), bukan cuma dari event handler yang pasti di browser.
function isBrowser() {
	return typeof window !== "undefined";
}

export function getAuthToken() {
	if (!isBrowser()) return null;
	return sessionStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string) {
	if (!isBrowser()) return;
	sessionStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
	if (!isBrowser()) return;
	sessionStorage.removeItem(AUTH_TOKEN_KEY);
}
