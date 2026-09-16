import type z from "zod";
import { NotFoundError } from "../../exceptions";
import { userRepository } from "../user/user.repository";
import type {
	updateUserDemoSchema,
	updateUserRoleSchema,
} from "./admin.schema";

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
	) {
		const existingUser = await userRepository.findById(id);

		if (!existingUser) throw new NotFoundError("User tidak ditemukan");

		const updatedUser = await userRepository.updateRole(id, role);

		return toUserSummary(updatedUser);
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
