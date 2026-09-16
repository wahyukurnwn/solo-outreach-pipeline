import type z from "zod";
import { NotFoundError } from "../../exceptions";
import { userRepository } from "../user/user.repository";
import type {
	updateUserDemoSchema,
	updateUserRoleSchema,
} from "./admin.schema";
import { roleChangeLogRepository } from "./role-change-log.repository";

// Jangan pernah kembalikan field password ke response admin.
function toUserSummary(user: {
	id: string;
	email: string;
	role: string;
	isDemo: boolean;
	createdAt: Date;
}) {
	return {
		id: user.id,
		email: user.email,
		role: user.role,
		isDemo: user.isDemo,
		createdAt: user.createdAt,
	};
}

export const adminService = {
	async listUsers() {
		const users = await userRepository.findMany();

		return users.map(toUserSummary);
	},

	async getUserById(id: string) {
		const user = await userRepository.findById(id);

		if (!user) throw new NotFoundError("User tidak ditemukan");

		return toUserSummary(user);
	},

	async updateUserRole(
		id: string,
		{ role }: z.infer<typeof updateUserRoleSchema>,
		actorId: string,
	) {
		const existingUser = await userRepository.findById(id);

		if (!existingUser) throw new NotFoundError("User tidak ditemukan");

		// Set ke role yang sama bukan perubahan sungguhan — tidak perlu bikin
		// entry log baru untuk no-op.
		if (existingUser.role === role) return toUserSummary(existingUser);

		const updatedUser = await userRepository.updateRoleWithLog(
			id,
			existingUser.role,
			role,
			actorId,
		);

		return toUserSummary(updatedUser);
	},

	async getRoleLogs(id: string) {
		const existingUser = await userRepository.findById(id);

		if (!existingUser) throw new NotFoundError("User tidak ditemukan");

		const logs = await roleChangeLogRepository.findByTargetId(id);

		return logs.map((log) => ({
			id: log.id,
			fromRole: log.fromRole,
			toRole: log.toRole,
			createdAt: log.createdAt,
			actor: log.actor,
		}));
	},

	async updateUserDemo(
		id: string,
		{ isDemo }: z.infer<typeof updateUserDemoSchema>,
	) {
		const existingUser = await userRepository.findById(id);

		if (!existingUser) throw new NotFoundError("User tidak ditemukan");

		const updatedUser = isDemo
			? await userRepository.setDemoUser(id)
			: await userRepository.unsetDemoUser(id);

		return toUserSummary(updatedUser);
	},
};
