const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function toLocalIsoDate(date: Date) {
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${date.getFullYear()}-${month}-${day}`;
}

// followUpDate disimpan sebagai @db.Date (tengah malam UTC) — yang dibandingkan
// cuma bagian tanggalnya dengan tanggal lokal hari ini, bukan jamnya, supaya
// zona waktu tidak menggeser "hari ini" jadi "telat 1 hari".
export function daysOverdue(followUpDate: string, today = new Date()) {
	const [year, month, day] = followUpDate.slice(0, 10).split("-").map(Number);
	const dueUtc = Date.UTC(year, month - 1, day);
	const todayUtc = Date.UTC(
		today.getFullYear(),
		today.getMonth(),
		today.getDate(),
	);

	return Math.round((todayUtc - dueUtc) / MS_PER_DAY);
}

export function followUpDueLabel(days: number) {
	return days > 0 ? `Telat ${days} hari` : "Hari ini";
}
