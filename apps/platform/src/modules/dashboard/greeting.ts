export function greetingFor(date: Date) {
	const hour = date.getHours();

	if (hour < 11) return "Selamat pagi";
	if (hour < 15) return "Selamat siang";
	if (hour < 18) return "Selamat sore";
	return "Selamat malam";
}

const longDateFormatter = new Intl.DateTimeFormat("id-ID", {
	weekday: "long",
	day: "numeric",
	month: "long",
	year: "numeric",
});

export function formatLongDate(date: Date) {
	return longDateFormatter.format(date);
}
