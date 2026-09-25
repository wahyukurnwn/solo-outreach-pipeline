import z from "zod";
import { ActivityOutcome, ContactChannel } from "../../generated/prisma/enums";

// Toleransi +1 hari (bukan cuma "<= hari ini UTC") supaya user di timezone
// lebih maju dari UTC (mis. WIB, UTC+7) tidak ditolak salah waktu mencatat
// aktivitas yang baru saja terjadi — "hari ini" versi mereka bisa saja
// "besok" versi UTC. Aktivitas sungguhan tidak pernah butuh tanggal lebih
// dari itu; kalau lolos, itu jelas salah ketik.
function isNotTooFarInFuture(date: Date) {
	const tomorrowUtc = new Date();
	tomorrowUtc.setUTCDate(tomorrowUtc.getUTCDate() + 1);
	tomorrowUtc.setUTCHours(0, 0, 0, 0);

	return date.getTime() <= tomorrowUtc.getTime();
}

const activityFieldsSchema = z.object({
	channel: z.enum(ContactChannel),
	outcome: z.enum(ActivityOutcome),
	// nullish: PATCH dengan null satu-satunya cara mengosongkan catatan pesan.
	messageText: z.string().nullish(),
	activityDate: z.iso.date().transform((value) => new Date(value)),
});

export const createActivitySchema = activityFieldsSchema.refine(
	(data) => isNotTooFarInFuture(data.activityDate),
	{ message: "Activity date can't be in the future", path: ["activityDate"] },
);

export const updateActivitySchema = activityFieldsSchema
	.partial()
	.refine(
		(data) =>
			data.activityDate === undefined || isNotTooFarInFuture(data.activityDate),
		{ message: "Activity date can't be in the future", path: ["activityDate"] },
	);

export const activityIdParamSchema = z.object({
	id: z.uuid(),
});

export const prospectIdParamSchema = z.object({
	prospectId: z.uuid(),
});
