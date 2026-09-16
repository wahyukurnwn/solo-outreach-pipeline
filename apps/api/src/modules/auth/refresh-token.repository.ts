import { prisma } from "../../libs/prisma";

export const refreshTokenRepository = {
	create: (data: { userId: string; tokenHash: string; expiresAt: Date }) =>
		prisma.refreshToken.create({
			data,
		}),

	findByTokenHash: (tokenHash: string) =>
		prisma.refreshToken.findUnique({
			where: { tokenHash },
		}),

	revoke: (id: string) =>
		prisma.refreshToken.update({
			where: { id },
			data: { revokedAt: new Date() },
		}),
};
