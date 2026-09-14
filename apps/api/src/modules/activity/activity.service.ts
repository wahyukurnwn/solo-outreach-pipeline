import type z from "zod";
import { NotFoundError } from "../../exceptions";
import { prospectService } from "../prospect/prospect.service";
import { activityRepository } from "./activity.repository";
import type {
	createActivitySchema,
	updateActivitySchema,
} from "./activity.schema";

export const activityService = {
	async create(
		userId: string,
		prospectId: string,
		data: z.infer<typeof createActivitySchema>,
	) {
		await prospectService.findById(userId, prospectId);

		return activityRepository.create(userId, prospectId, data);
	},

	async listByProspect(userId: string, prospectId: string) {
		await prospectService.findById(userId, prospectId);

		return activityRepository.findManyByProspectId(prospectId, userId);
	},

	async findById(userId: string, id: string) {
		const activity = await activityRepository.findByIdAndUserId(id, userId);

		if (!activity) throw new NotFoundError("Activity tidak ditemukan");

		return activity;
	},

	async update(
		userId: string,
		id: string,
		data: z.infer<typeof updateActivitySchema>,
	) {
		await this.findById(userId, id);

		return activityRepository.update(id, data);
	},

	async remove(userId: string, id: string) {
		await this.findById(userId, id);

		await activityRepository.delete(id);
	},
};
