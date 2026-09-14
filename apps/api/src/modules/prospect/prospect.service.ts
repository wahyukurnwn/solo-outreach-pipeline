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

	listFollowUpsDue(userId: string) {
		return prospectRepository.findFollowUpsDueByUserId(userId, new Date());
	},

	async findById(userId: string, id: string) {
		const prospect = await prospectRepository.findByIdAndUserId(id, userId);

		if (!prospect) throw new NotFoundError("Prospect tidak ditemukan");

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
