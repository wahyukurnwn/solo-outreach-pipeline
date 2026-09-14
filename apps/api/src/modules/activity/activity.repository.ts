import type { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../libs/prisma";

export const activityRepository = {
	create: (
		userId: string,
		prospectId: string,
		data: Omit<Prisma.ActivityUncheckedCreateInput, "userId" | "prospectId">,
	) =>
		prisma.activity.create({
			data: { ...data, userId, prospectId },
		}),

	findManyByProspectId: (prospectId: string, userId: string) =>
		prisma.activity.findMany({
			where: { prospectId, userId },
			orderBy: { activityDate: "desc" },
		}),

	findByIdAndUserId: (id: string, userId: string) =>
		prisma.activity.findFirst({
			where: { id, userId },
		}),

	update: (id: string, data: Prisma.ActivityUncheckedUpdateInput) =>
		prisma.activity.update({
			where: { id },
			data,
		}),

	delete: (id: string) =>
		prisma.activity.delete({
			where: { id },
		}),
};
