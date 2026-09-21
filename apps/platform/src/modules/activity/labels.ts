import type { Activity } from "./types";

export const outcomeLabel: Record<Activity["outcome"], string> = {
	sent: "Sent",
	replied: "Replied",
	no_response: "No response",
};

export const outcomeOptions = Object.keys(
	outcomeLabel,
) as Activity["outcome"][];

export const outcomeClass: Record<Activity["outcome"], string> = {
	sent: "bg-cloud-50 text-cloud-700",
	replied: "bg-mint-50 text-mint-700",
	no_response: "bg-sand-50 text-sand-700",
};

// Titik timeline: warna isi + ring lembut dengan hue yang sama.
export const outcomeDotClass: Record<Activity["outcome"], string> = {
	sent: "bg-cloud-700 ring-cloud-100",
	replied: "bg-mint-700 ring-mint-100",
	no_response: "bg-sand-700 ring-sand-100",
};
