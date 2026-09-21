import { ArrowRight, ChevronDown, Plus } from "lucide-react";

// Mockup statis untuk landing page — bukan data asli. Warna stage mengikuti
// stageAvatarClass di modules/prospect/labels.ts supaya preview terbaca sama
// dengan app sungguhan.
const needsAction = [
	{
		initials: "AW",
		name: "Andra Wibowo",
		company: "Studio Nusa",
		stage: "Replied",
		toneClass: "bg-lavender-50 text-lavender-700",
		due: "Today",
		dueClass: "text-muted",
	},
	{
		initials: "RW",
		name: "Rina Wijaya",
		company: "Kedai Senja",
		stage: "Contacted",
		toneClass: "bg-lagoon-50 text-lagoon-700",
		due: "2d late",
		dueClass: "font-semibold text-blush-700",
	},
	{
		initials: "DP",
		name: "Dimas Pratama",
		company: "Studio Arsa",
		stage: "New",
		toneClass: "bg-cloud-50 text-cloud-700",
		due: "Today",
		dueClass: "text-muted",
	},
];

interface PreviewCardProps {
	badge: string;
	badgeClassName: string;
	children: React.ReactNode;
}

function PreviewCard({ badge, badgeClassName, children }: PreviewCardProps) {
	return (
		<div className="relative rounded-[18px] border border-line bg-white p-4 sm:p-5">
			<span
				className={`absolute -top-2.5 right-4 rounded-full border border-white px-2 py-0.5 text-[10px] font-bold tracking-[0.08em] uppercase ${badgeClassName}`}
			>
				{badge}
			</span>
			{children}
		</div>
	);
}

function StatHeader({ title, subtitle }: { title: string; subtitle: string }) {
	return (
		<div className="flex items-start justify-between gap-2">
			<div>
				<p className="text-[15px] font-semibold text-ink">{title}</p>
				<p className="text-[13px] text-muted">{subtitle}</p>
			</div>
			<ChevronDown className="size-4 text-faint" />
		</div>
	);
}

export const AppPreview = () => (
	<div className="relative mx-auto max-w-5xl text-left">
		<div
			aria-hidden="true"
			className="absolute -inset-x-8 -top-8 bottom-8 rounded-[48px] bg-lavender-100/50 blur-3xl"
		/>

		<div className="relative overflow-hidden rounded-[22px] border border-line bg-white shadow-[0_40px_90px_-40px_rgba(45,42,38,0.35),0_2px_6px_rgba(45,42,38,0.04)]">
			<div className="flex items-center gap-3 border-b border-line bg-subtle px-4 py-2.5">
				<div className="flex gap-1.5">
					<span className="size-2.5 rounded-full bg-blush-700/60" />
					<span className="size-2.5 rounded-full bg-sand-700/50" />
					<span className="size-2.5 rounded-full bg-mint-700/50" />
				</div>
				<div className="mx-auto hidden w-64 truncate rounded-md bg-sidebar px-3 py-1 text-center text-[11px] text-muted sm:block">
					app.pipeline.local/dashboard
				</div>
				<span className="ml-auto text-[11px] font-medium text-faint sm:ml-0">
					Preview
				</span>
			</div>

			<div className="flex flex-col gap-5 bg-paper p-5 sm:p-8">
				<div>
					<p className="text-2xl font-bold tracking-tight text-ink sm:text-[28px]">
						Good evening, <span className="text-lavender-700">John</span>
					</p>
					<p className="mt-1 text-sm text-muted">
						Here&apos;s where your pipeline stands today.
					</p>
				</div>

				<PreviewCard
					badge="Quick action"
					badgeClassName="bg-sidebar text-muted"
				>
					<div className="flex items-center gap-3.5">
						<span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-lavender-50 text-lavender-700">
							<Plus className="size-5" />
						</span>
						<div className="min-w-0 flex-1">
							<p className="text-[15px] font-semibold text-ink">
								Add a new prospect
							</p>
							<p className="truncate text-[13px] text-muted">
								Name, company, channel, and a note — that&apos;s all it takes
							</p>
						</div>
						<ArrowRight className="size-4 shrink-0 text-lavender-700" />
					</div>
				</PreviewCard>

				<div className="grid gap-5 sm:grid-cols-2">
					<PreviewCard
						badge="Due today"
						badgeClassName="bg-mint-50 text-mint-700"
					>
						<StatHeader
							title="Follow-ups waiting"
							subtitle="Nothing slips through"
						/>
						<p className="mt-4 flex items-baseline gap-2">
							<span className="text-3xl font-bold tracking-tight text-ink">
								4
							</span>
							<span className="text-xs font-semibold text-blush-700">
								2 overdue
							</span>
						</p>
					</PreviewCard>
					<PreviewCard
						badge="Live numbers"
						badgeClassName="bg-lavender-50 text-lavender-700"
					>
						<StatHeader
							title="Response rate"
							subtitle="Computed from real activity"
						/>
						<p className="mt-4 text-3xl font-bold tracking-tight text-ink">
							31.4%
						</p>
					</PreviewCard>
				</div>

				<div className="rounded-[18px] border border-line bg-white p-4 sm:p-5">
					<div className="flex items-center justify-between">
						<p className="text-sm font-semibold text-ink">Needs action today</p>
						<p className="text-xs text-muted">3 prospects</p>
					</div>
					<ul className="mt-2 flex flex-col divide-y divide-line">
						{needsAction.map((prospect) => (
							<li
								key={prospect.name}
								className="flex items-center gap-3 py-2.5"
							>
								<span
									className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${prospect.toneClass}`}
								>
									{prospect.initials}
								</span>
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-semibold text-ink">
										{prospect.name}
									</p>
									<p className="truncate text-xs text-muted">
										{prospect.company}
									</p>
								</div>
								<span
									className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${prospect.toneClass}`}
								>
									{prospect.stage}
								</span>
								<span
									className={`hidden w-14 text-right text-xs sm:block ${prospect.dueClass}`}
								>
									{prospect.due}
								</span>
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	</div>
);
