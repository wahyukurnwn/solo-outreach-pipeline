import { prisma } from "../../libs/prisma";

export const roleChangeLogRepository = {
	// Diurutkan terbaru dulu — dipakai untuk timeline "riwayat perubahan role"
	// di halaman detail user, bukan log global. Baris dibuat oleh
	// userRepository.updateRoleWithLog dalam satu transaksi dengan update role.
	findByTargetId: (targetId: string) =>
		prisma.roleChangeLog.findMany({
			where: { targetId },
			orderBy: { createdAt: "desc" },
			include: {
				actor: { select: { id: true, email: true } },
			},
		}),
};
