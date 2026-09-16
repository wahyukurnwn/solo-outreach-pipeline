import { prisma } from "../../libs/prisma";

export const demoChangeLogRepository = {
	// Diurutkan terbaru dulu — dipakai untuk timeline "riwayat status demo" di
	// halaman detail user. Baris dibuat oleh
	// userRepository.setDemoUserWithLog/unsetDemoUserWithLog dalam satu
	// transaksi dengan update is_demo.
	findByTargetId: (targetId: string) =>
		prisma.demoChangeLog.findMany({
			where: { targetId },
			orderBy: { createdAt: "desc" },
			include: {
				actor: { select: { id: true, email: true } },
			},
		}),
};
