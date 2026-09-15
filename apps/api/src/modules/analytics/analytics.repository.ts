import { prisma } from "../../libs/prisma";

export const analyticsRepository = {
	findProspectStagesByUserId: (userId: string) =>
		prisma.prospect.findMany({
			where: { userId },
			select: { id: true, stage: true },
		}),

	findActivityOutcomesByUserId: (userId: string) =>
		prisma.activity.findMany({
			where: { userId },
			select: { prospectId: true, channel: true, outcome: true },
		}),
};
