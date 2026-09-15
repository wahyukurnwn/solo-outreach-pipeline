import { StatCard } from "@mycustom/ui";
import { CalendarClock, MessageSquare, Trophy, Users } from "lucide-react";
import { activeStages, daysOverdue, type Prospect } from "#/modules/prospect";

interface DashboardStatsProps {
	prospects: Prospect[];
	followUps: Prospect[];
}

// Response rate & conversion rate dari desain belum ditampilkan: keduanya butuh
// endpoint analytics yang belum ada, dan StatCard sengaja tidak diisi angka
// karangan. Keempat angka di sini semuanya dihitung dari data prospek asli.
export const DashboardStats = ({
	prospects,
	followUps,
}: DashboardStatsProps) => {
	const activeCount = prospects.filter((prospect) =>
		activeStages.includes(prospect.stage),
	).length;
	const repliedCount = prospects.filter(
		(prospect) => prospect.stage === "REPLIED",
	).length;
	const wonCount = prospects.filter(
		(prospect) => prospect.stage === "CLOSED_WON",
	).length;
	const closedCount = prospects.filter(
		(prospect) =>
			prospect.stage === "CLOSED_WON" || prospect.stage === "CLOSED_LOST",
	).length;
	const overdueCount = followUps.filter(
		(prospect) =>
			prospect.followUpDate !== null && daysOverdue(prospect.followUpDate) > 0,
	).length;

	return (
		<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
			<StatCard
				label="Total prospek"
				value={prospects.length}
				subtitle={`${activeCount} masih berjalan`}
				tone="lavender"
				icon={<Users className="size-4" />}
			/>
			<StatCard
				label="Follow-up jatuh tempo"
				value={followUps.length}
				subtitle={
					overdueCount > 0
						? `${overdueCount} terlambat`
						: "Tidak ada yang telat"
				}
				tone="peach"
				icon={<CalendarClock className="size-4" />}
			/>
			<StatCard
				label="Dibalas"
				value={repliedCount}
				subtitle="Menunggu langkah berikutnya"
				tone="mint"
				icon={<MessageSquare className="size-4" />}
			/>
			<StatCard
				label="Closed Won"
				value={wonCount}
				subtitle={`dari ${closedCount} prospek yang ditutup`}
				tone="cloud"
				icon={<Trophy className="size-4" />}
			/>
		</div>
	);
};
