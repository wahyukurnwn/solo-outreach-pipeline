import z from "zod";
import { ActivityOutcome, ContactChannel } from "../../generated/prisma/enums";

export const createActivitySchema = z.object({
	channel: z.enum(ContactChannel),
	outcome: z.enum(ActivityOutcome),
	messageText: z.string().optional(),
	activityDate: z.iso.date().transform((value) => new Date(value)),
});

export const updateActivitySchema = createActivitySchema.partial();

export const activityIdParamSchema = z.object({
	id: z.uuid(),
});

export const prospectIdParamSchema = z.object({
	prospectId: z.uuid(),
});
