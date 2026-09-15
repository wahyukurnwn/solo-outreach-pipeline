import { IconBox, type Tone } from "./icon-box";

interface StatCardProps {
	label: string;
	value: string | number;
	// Sengaja tidak ada prop "trend"/perubahan persen (mis. "+4.6%") — tidak
	// ada data historis buat dibandingkan di backend manapun sekarang, jadi
	// tidak dibuat placeholder yang keliatan meyakinkan tapi angkanya karangan.
	subtitle?: string;
	tone?: Tone;
	icon?: React.ReactNode;
}

const surfaceClasses: Record<Tone, string> = {
	neutral: "border border-line bg-white",
	lavender: "bg-lavender-50",
	mint: "bg-mint-50",
	peach: "bg-peach-50",
	cloud: "bg-cloud-50",
	lagoon: "bg-lagoon-50",
	blush: "bg-blush-50",
	sand: "bg-sand-50",
};

export const StatCard = ({
	label,
	value,
	subtitle,
	tone = "neutral",
	icon,
}: StatCardProps) => (
	<div className={`flex flex-col rounded-[20px] p-5 ${surfaceClasses[tone]}`}>
		{icon ? (
			<div className="mb-4">
				<IconBox tone={tone} size="lg">
					{icon}
				</IconBox>
			</div>
		) : null}
		<p className="text-[13px] font-medium text-ink-soft">{label}</p>
		<p className="mt-0.5 text-3xl font-bold tracking-tight text-ink">{value}</p>
		{subtitle ? <p className="mt-1 text-xs text-muted">{subtitle}</p> : null}
	</div>
);
