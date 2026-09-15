import z from "zod";
import { ActivityOutcome, ContactChannel } from "../../generated/prisma/enums";

export const createActivitySchema = z.object({
	channel: z.enum(ContactChannel),
	outcome: z.enum(ActivityOutcome),
	// nullish: PATCH dengan null satu-satunya cara mengosongkan catatan pesan.
	messageText: z.string().nullish(),
	activityDate: z.iso.date().transform((value) => new Date(value)),
});

export const updateActivitySchema = createActivitySchema.partial();

export const activityIdParamSchema = z.object({
	id: z.uuid(),
});

export const prospectIdParamSchema = z.object({
	prospectId: z.uuid(),
});
