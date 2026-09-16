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

	// Update role + catat siapa (actorId) mengubah role siapa dalam satu
	// transaksi, supaya audit trail tidak pernah kehilangan entry kalau salah
	// satu langkah gagal. Dipanggil hanya saat role benar-benar berubah — lihat
	// admin.service.ts (no-op set ke role yang sama tidak menghasilkan log).
	updateRoleWithLog: (
		id: string,
		fromRole: UserRole,
		toRole: UserRole,
		actorId: string,
	) =>
		prisma.$transaction(async (tx) => {
			const updated = await tx.user.update({
				where: { id },
				data: { role: toRole },
			});

			await tx.roleChangeLog.create({
				data: { actorId, targetId: id, fromRole, toRole },
			});

			return updated;
		}),

	// Invariant "paling banyak satu is_demo=true" ditegakkan di sini (bukan di
	// service) lewat transaksi: mematikan demo user lama dulu sebelum
	// menyalakan yang baru, supaya findDemoUser() tidak pernah ambigu. Efek
	// samping "mematikan demo user lama" juga dicatat sebagai log tersendiri
	// (actor sama), supaya riwayat tetap menjelaskan kenapa status demo user
	// lama berubah walau bukan dia yang di-target request ini.
	setDemoUserWithLog: (id: string, actorId: string) =>
		prisma.$transaction(async (tx) => {
			const previousDemoUsers = await tx.user.findMany({
				where: { isDemo: true, NOT: { id } },
				select: { id: true },
			});

			if (previousDemoUsers.length > 0) {
				await tx.user.updateMany({
					where: { isDemo: true, NOT: { id } },
					data: { isDemo: false },
				});

				await tx.demoChangeLog.createMany({
					data: previousDemoUsers.map((user) => ({
						actorId,
						targetId: user.id,
						fromDemo: true,
						toDemo: false,
					})),
				});
			}

			const updated = await tx.user.update({
				where: { id },
				data: { isDemo: true },
			});

			await tx.demoChangeLog.create({
				data: { actorId, targetId: id, fromDemo: false, toDemo: true },
			});

			return updated;
		}),

	unsetDemoUserWithLog: (id: string, actorId: string) =>
		prisma.$transaction(async (tx) => {
			const updated = await tx.user.update({
				where: { id },
				data: { isDemo: false },
			});

			await tx.demoChangeLog.create({
				data: { actorId, targetId: id, fromDemo: true, toDemo: false },
			});

			return updated;
		}),
};
