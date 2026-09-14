import type { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../libs/prisma";

export const prospectRepository = {
	create: (
		userId: string,
		data: Omit<Prisma.ProspectUncheckedCreateInput, "userId">,
	) =>
		prisma.prospect.create({
			data: { ...data, userId },
		}),

	findManyByUserId: (userId: string) =>
		prisma.prospect.findMany({
			where: { userId },
			orderBy: { createdAt: "desc" },
		}),

	findByIdAndUserId: (id: string, userId: string) =>
		prisma.prospect.findFirst({
			where: { id, userId },
		}),

	update: (id: string, data: Prisma.ProspectUncheckedUpdateInput) =>
		prisma.prospect.update({
			where: { id },
			data,
		}),

	delete: (id: string) =>
		prisma.prospect.delete({
			where: { id },
		}),
};
