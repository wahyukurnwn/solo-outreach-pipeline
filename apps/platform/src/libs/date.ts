// Kolom @db.Date (followUpDate, activityDate) disimpan sebagai tengah malam
// UTC, jadi diformat di zona UTC — kalau pakai zona browser, tanggalnya bisa
// mundur sehari untuk zona UTC-.
const dateOnlyFormatter = new Intl.DateTimeFormat("en-US", {
	day: "numeric",
	month: "long",
	year: "numeric",
	timeZone: "UTC",
});

const shortDateOnlyFormatter = new Intl.DateTimeFormat("en-US", {
	day: "numeric",
	month: "short",
	timeZone: "UTC",
});

const timestampDateFormatter = new Intl.DateTimeFormat("en-US", {
	day: "numeric",
	month: "long",
	year: "numeric",
});

export function formatDateOnly(value: string) {
	return dateOnlyFormatter.format(new Date(value));
}

export function formatShortDateOnly(value: string) {
	return shortDateOnlyFormatter.format(new Date(value));
}

export function formatTimestampDate(value: string) {
	return timestampDateFormatter.format(new Date(value));
}
