import { IconBox, SectionHeader } from "@mycustom/ui";
import { Clock } from "lucide-react";
import { formatDateOnly } from "#/libs/date";
import {
	type Activity,
	outcomeClass,
	outcomeDotClass,
	outcomeLabel,
} from "#/modules/activity";
import { channelLabel } from "#/modules/prospect";

// Sengaja bukan reuse ActivityTimeline (modules/activity) — versi itu selalu
// merender tombol edit/hapus yang memanggil endpoint auth. Data & tampilan
// timeline-nya sama, cuma tanpa aksi apa pun.
export const DemoActivityTimeline = ({
	activities,
}: {
	activities?: Activity[];
}) => (
	<section className="flex flex-col gap-3.5">
		<SectionHeader
			title="Riwayat aktivitas"
			icon={
				<IconBox tone="lavender">
					<Clock className="size-[15px]" />
				</IconBox>
			}
			action={
				activities ? (
					<span className="text-[13px] text-muted">
						{activities.length} catatan
					</span>
				) : null
			}
		/>
		<TimelineBody activities={activities} />
	</section>
);

function TimelineBody({ activities }: { activities?: Activity[] }) {
	if (!activities)
		return (
			<div className="flex flex-col gap-2.5">
				<div className="h-20 animate-pulse rounded-2xl border border-line bg-white" />
				<div className="h-20 animate-pulse rounded-2xl border border-line bg-white" />
			</div>
		);

	if (activities.length === 0)
		return (
			<div className="rounded-2xl border border-dashed border-line-strong px-5 py-8 text-center">
				<p className="text-sm font-semibold text-ink">Belum ada aktivitas</p>
			</div>
		);

	return (
		<ol className="flex flex-col">
			{activities.map((activity, index) => {
				const isLast = index === activities.length - 1;

				return (
					<li key={activity.id} className="flex gap-3.5">
						<div className="flex flex-col items-center pt-[18px]">
							<span
								className={`size-2.5 shrink-0 rounded-full ring-4 ${outcomeDotClass[activity.outcome]}`}
							/>
							{isLast ? null : <span className="mt-2 w-0.5 flex-1 bg-line" />}
						</div>
						<div
							className={`flex min-w-0 flex-1 flex-col gap-2 rounded-2xl border border-line bg-white px-4 py-3.5 ${isLast ? "" : "mb-2.5"}`}
						>
							<div className="flex flex-wrap items-center justify-between gap-2">
								<span className="text-[13px] font-semibold text-ink">
									{formatDateOnly(activity.activityDate)}
								</span>
								<div className="flex items-center gap-1.5">
									<span className="rounded-full bg-sidebar px-2.5 py-0.5 text-xs font-semibold text-ink-soft">
										{channelLabel[activity.channel]}
									</span>
									<span
										className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${outcomeClass[activity.outcome]}`}
									>
										{outcomeLabel[activity.outcome]}
									</span>
								</div>
							</div>
							{activity.messageText ? (
								<p className="text-sm leading-relaxed whitespace-pre-line text-ink-soft">
									{activity.messageText}
								</p>
							) : null}
						</div>
					</li>
				);
			})}
		</ol>
	);
}
