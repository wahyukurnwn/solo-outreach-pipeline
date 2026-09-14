import z from "zod";
import { ContactChannel, PipelineStage } from "../../generated/prisma/enums";

export const createProspectSchema = z.object({
	name: z.string().min(1, "Nama wajib diisi"),
	company: z.string().optional(),
	channel: z.enum(ContactChannel).optional(),
	stage: z.enum(PipelineStage).optional(),
	notes: z.string().optional(),
	followUpDate: z.iso
		.date()
		.transform((value) => new Date(value))
		.optional(),
});

export const updateProspectSchema = createProspectSchema.partial();

export const prospectIdParamSchema = z.object({
	id: z.uuid(),
});
