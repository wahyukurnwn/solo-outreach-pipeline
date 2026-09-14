import { prisma } from "../../libs/prisma";

export const userRepository = {
	findById: (id: string) =>
		prisma.user.findUnique({
			where: { id },
		}),

	findByEmail: (email: string) =>
		prisma.user.findUnique({
			where: { email },
		}),

	create: (data: { email: string; password?: string }) =>
		prisma.user.create({
			data,
		}),

	updatePassword: (id: string, password: string) =>
		prisma.user.update({
			where: { id },
			data: { password },
		}),
};
