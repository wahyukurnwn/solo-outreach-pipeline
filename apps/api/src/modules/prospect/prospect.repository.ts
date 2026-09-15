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

	findFollowUpsDueByUserId: (userId: string, dueBy: Date) =>
		prisma.prospect.findMany({
			where: { userId, followUpDate: { lte: dueBy } },
			orderBy: { followUpDate: "asc" },
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

	// FK activities & prospect_tags ke prospects masih ON DELETE RESTRICT, jadi
	// baris anaknya dihapus dulu dalam satu transaksi — tanpa ini, prospek yang
	// sudah punya aktivitas tidak bisa dihapus sama sekali.
	delete: (id: string) =>
		prisma.$transaction([
			prisma.activity.deleteMany({ where: { prospectId: id } }),
			prisma.prospectTag.deleteMany({ where: { prospectId: id } }),
			prisma.prospect.delete({ where: { id } }),
		]),
};
