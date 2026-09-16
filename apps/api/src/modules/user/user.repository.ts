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

	// Invariant: paling banyak satu row is_demo=true (dijaga manual/ops, bukan
	// lewat endpoint — lihat catatan ERD). findFirst cukup karena itu.
	findDemoUser: () =>
		prisma.user.findFirst({
			where: { isDemo: true },
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

	unlinkGoogle: (id: string) =>
		prisma.user.update({
			where: { id },
			data: { googleId: null },
		}),

	removePassword: (id: string) =>
		prisma.user.update({
			where: { id },
			data: { password: null },
		}),

	updateRole: (id: string, role: UserRole) =>
		prisma.user.update({
			where: { id },
			data: { role },
		}),

	// Invariant "paling banyak satu is_demo=true" ditegakkan di sini (bukan di
	// service) lewat transaksi: mematikan demo user lama dulu sebelum
	// menyalakan yang baru, supaya findDemoUser() tidak pernah ambigu.
	setDemoUser: (id: string) =>
		prisma.$transaction(async (tx) => {
			await tx.user.updateMany({
				where: { isDemo: true, NOT: { id } },
				data: { isDemo: false },
			});

			return tx.user.update({
				where: { id },
				data: { isDemo: true },
			});
		}),

	unsetDemoUser: (id: string) =>
		prisma.user.update({
			where: { id },
			data: { isDemo: false },
		}),
};
