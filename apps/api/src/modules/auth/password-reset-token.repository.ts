import { prisma } from "../../libs/prisma";

export const passwordResetTokenRepository = {
	create: (data: { userId: string; tokenHash: string; expiresAt: Date }) =>
		prisma.passwordResetToken.create({
			data,
		}),

	findByTokenHash: (tokenHash: string) =>
		prisma.passwordResetToken.findUnique({
			where: { tokenHash },
		}),

	markUsed: (id: string) =>
		prisma.passwordResetToken.update({
			where: { id },
			data: { usedAt: new Date() },
		}),
};
