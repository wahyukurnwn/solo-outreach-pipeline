import type z from "zod";
import { NotFoundError } from "../../exceptions";
import { prospectRepository } from "./prospect.repository";
import type {
	createProspectSchema,
	updateProspectSchema,
} from "./prospect.schema";

export const prospectService = {
	create(userId: string, data: z.infer<typeof createProspectSchema>) {
		return prospectRepository.create(userId, data);
	},

	list(userId: string) {
		return prospectRepository.findManyByUserId(userId);
	},

	// `date` = tanggal lokal user (YYYY-MM-DD). followUpDate berupa @db.Date di
	// tengah malam UTC, jadi batas jatuh tempo = tengah malam UTC tanggal itu.
	// Tanpa `date`, server memakai waktu sekarang — yang meleset untuk zona UTC+
	// (mis. WIB sebelum 07.00, follow-up hari ini belum dianggap jatuh tempo).
	listFollowUpsDue(userId: string, date?: string) {
		const dueBy = date ? new Date(`${date}T00:00:00.000Z`) : new Date();

		return prospectRepository.findFollowUpsDueByUserId(userId, dueBy);
	},

	async findById(userId: string, id: string) {
		const prospect = await prospectRepository.findByIdAndUserId(id, userId);

		if (!prospect) throw new NotFoundError("Prospect not found");

		return prospect;
	},

	async update(
		userId: string,
		id: string,
		data: z.infer<typeof updateProspectSchema>,
	) {
		await this.findById(userId, id);

		return prospectRepository.update(id, data);
	},

	async remove(userId: string, id: string) {
		await this.findById(userId, id);

		await prospectRepository.delete(id);
	},
};
