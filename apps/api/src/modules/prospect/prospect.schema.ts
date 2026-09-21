import z from "zod";
import { ContactChannel, PipelineStage } from "../../generated/prisma/enums";

// Field opsional sengaja nullish (bukan cuma optional): PATCH dengan null
// adalah satu-satunya cara mengosongkan kolom yang sudah terisi, mis. menghapus
// tanggal follow-up setelah follow-up-nya selesai.
export const createProspectSchema = z.object({
	name: z.string().min(1, "Name is required"),
	company: z.string().nullish(),
	channel: z.enum(ContactChannel).nullish(),
	stage: z.enum(PipelineStage).optional(),
	notes: z.string().nullish(),
	followUpDate: z.iso
		.date()
		.transform((value) => new Date(value))
		.nullish(),
});

export const updateProspectSchema = createProspectSchema.partial();

export const prospectIdParamSchema = z.object({
	id: z.uuid(),
});

export const followUpsQuerySchema = z.object({
	date: z.iso.date().optional(),
});
