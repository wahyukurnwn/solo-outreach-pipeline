export function greetingFor(date: Date) {
	const hour = date.getHours();

	if (hour < 12) return "Good morning";
	if (hour < 18) return "Good afternoon";
	return "Good evening";
}

const longDateFormatter = new Intl.DateTimeFormat("en-US", {
	weekday: "long",
	day: "numeric",
	month: "long",
	year: "numeric",
});

export function formatLongDate(date: Date) {
	return longDateFormatter.format(date);
}
