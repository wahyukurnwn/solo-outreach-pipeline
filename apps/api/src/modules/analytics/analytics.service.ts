import { ContactChannel, PipelineStage } from "../../generated/prisma/enums";
import { analyticsRepository } from "./analytics.repository";

const rate = (part: number, whole: number) =>
	whole === 0 ? null : part / whole;

// Definisi (dihitung on-the-fly dari activities, sesuai ERD — tidak ada tabel
// agregat yang bisa tidak sinkron):
// - dihubungi   = prospek dengan minimal satu aktivitas apa pun
// - membalas    = prospek dengan minimal satu aktivitas ber-outcome "replied"
// - won         = prospek Closed Won yang juga pernah dihubungi, supaya
//                 conversion rate tidak bisa lebih dari 100% karena prospek
//                 yang ditandai Won tanpa pernah dicatat outreach-nya
// - response rate = membalas ÷ dihubungi; conversion rate = won ÷ dihubungi
export const analyticsService = {
	async getSummary(userId: string) {
		const [prospects, activities] = await Promise.all([
			analyticsRepository.findProspectStagesByUserId(userId),
			analyticsRepository.findActivityOutcomesByUserId(userId),
		]);

		const contactedIds = new Set(
			activities.map((activity) => activity.prospectId),
		);
		const repliedIds = new Set(
			activities
				.filter((activity) => activity.outcome === "replied")
				.map((activity) => activity.prospectId),
		);
		const wonCount = prospects.filter(
			(prospect) =>
				prospect.stage === "CLOSED_WON" && contactedIds.has(prospect.id),
		).length;

		const stages = Object.fromEntries(
			Object.values(PipelineStage).map((stage) => [stage, 0]),
		) as Record<PipelineStage, number>;
		for (const prospect of prospects) stages[prospect.stage] += 1;

		const channels = Object.values(ContactChannel).map((channel) => {
			const channelActivities = activities.filter(
				(activity) => activity.channel === channel,
			);
			const contacted = new Set(
				channelActivities.map((activity) => activity.prospectId),
			).size;
			const replied = new Set(
				channelActivities
					.filter((activity) => activity.outcome === "replied")
					.map((activity) => activity.prospectId),
			).size;

			return {
				channel,
				contacted,
				replied,
				responseRate: rate(replied, contacted),
			};
		});

		return {
			totalProspects: prospects.length,
			contacted: contactedIds.size,
			replied: repliedIds.size,
			won: wonCount,
			responseRate: rate(repliedIds.size, contactedIds.size),
			conversionRate: rate(wonCount, contactedIds.size),
			stages,
			channels,
		};
	},
};
