import { Badge, Card, IconBox, SectionHeader } from "@mycustom/ui";
import { Link } from "@tanstack/react-router";
import { CalendarClock, Inbox } from "lucide-react";
import {
	daysOverdue,
	followUpDueLabel,
	type Prospect,
	ProspectAvatar,
	StagePill,
} from "#/modules/prospect";

const MAX_ROWS = 5;

export const FollowUpTodayCard = ({ followUps }: { followUps: Prospect[] }) => {
	const visibleFollowUps = followUps.slice(0, MAX_ROWS);
	const hiddenCount = followUps.length - visibleFollowUps.length;

	return (
		<Card className="flex flex-col gap-4">
			<SectionHeader
				title="Follow-ups today"
				icon={
					<IconBox tone="peach">
						<CalendarClock className="size-[15px]" />
					</IconBox>
				}
				action={
					followUps.length > 0 ? (
						<Link
							to="/prospect"
							className="text-[13px] font-semibold text-lavender-700 transition-colors hover:text-ink"
						>
							View all
						</Link>
					) : null
				}
			/>

			{visibleFollowUps.length === 0 ? (
				<div className="flex flex-col items-center gap-1 rounded-2xl bg-subtle px-6 py-10 text-center">
					<IconBox tone="mint" size="lg">
						<Inbox className="size-[18px]" />
					</IconBox>
					<p className="mt-3 text-sm font-semibold text-ink">
						No follow-ups due
					</p>
					<p className="max-w-xs text-[13px] text-muted">
						Prospects whose follow-up is due today or overdue will show up here.
					</p>
				</div>
			) : (
				<ul className="flex flex-col gap-2">
					{visibleFollowUps.map((prospect) => {
						const days = prospect.followUpDate
							? daysOverdue(prospect.followUpDate)
							: 0;

						return (
							<li key={prospect.id}>
								<Link
									to="/prospect/$id"
									params={{ id: prospect.id }}
									className="flex items-center gap-3 rounded-[14px] bg-subtle px-3.5 py-3 transition-colors hover:bg-sidebar"
								>
									<ProspectAvatar prospect={prospect} />
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-semibold text-ink">
											{prospect.name}
										</p>
										<p className="truncate text-[13px] text-muted">
											{prospect.company || "Tanpa perusahaan"}
										</p>
									</div>
									<Badge variant={days > 0 ? "danger" : "warning"}>
										{followUpDueLabel(days)}
									</Badge>
									<span className="hidden sm:inline-flex">
										<StagePill stage={prospect.stage} />
									</span>
								</Link>
							</li>
						);
					})}
				</ul>
			)}

			{hiddenCount > 0 ? (
				<p className="text-xs text-faint">+{hiddenCount} follow-up lainnya</p>
			) : null}
		</Card>
	);
};
