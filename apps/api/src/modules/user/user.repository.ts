import type { UserRole } from "../../generated/prisma/enums";
import { prisma } from "../../libs/prisma";

export const userRepository = {
	findMany: () =>
		prisma.user.findMany({
			orderBy: { createdAt: "desc" },
		}),

	findById: (id: string) =>
		prisma.user.findUnique({
			where: { id },
		}),

	findByEmail: (email: string) =>
		prisma.user.findUnique({
			where: { email },
		}),

	findByGoogleId: (googleId: string) =>
		prisma.user.findUnique({
			where: { googleId },
		}),

	create: (data: { email: string; password?: string; googleId?: string }) =>
		prisma.user.create({
			data,
		}),

	updatePassword: (id: string, password: string) =>
		prisma.user.update({
			where: { id },
			data: { password },
		}),

	linkGoogleId: (id: string, googleId: string) =>
		prisma.user.update({
			where: { id },
			data: { googleId },
		}),

	updateRole: (id: string, role: UserRole) =>
		prisma.user.update({
			where: { id },
			data: { role },
		}),
};
