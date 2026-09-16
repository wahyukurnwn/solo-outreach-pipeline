// Local-part email (sebelum "@") dipakai sebagai display name ringan di
// sidebar/profil — bukan data baru, cuma cara tampil, jadi tidak perlu field
// "username" terpisah di database.
export function getEmailUsername(email: string) {
	return email.split("@")[0];
}

// Sensor local-part mulai karakter ke-4: "kwangsoo@gmail.com" -> "kwa*****@gmail.com".
// Dipakai di halaman Account Settings supaya format email tetap terlihat
// (user tahu ini alamat email, bukan username acak) tapi tidak terpampang utuh.
export function maskEmail(email: string) {
	const atIndex = email.indexOf("@");
	if (atIndex === -1) return email;

	const local = email.slice(0, atIndex);
	const domain = email.slice(atIndex);
	const visibleLength = Math.min(3, local.length);

	return `${local.slice(0, visibleLength)}${"*".repeat(local.length - visibleLength)}${domain}`;
}
