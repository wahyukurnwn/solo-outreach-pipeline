type EyebrowTone = "neutral" | "lavender" | "mint" | "dark";

interface SectionEyebrowProps {
	children: React.ReactNode;
	tone?: EyebrowTone;
	icon?: React.ReactNode;
}

const toneClasses: Record<EyebrowTone, string> = {
	neutral: "border-line bg-white text-muted",
	lavender: "border-lavender-100 bg-lavender-50 text-lavender-700",
	mint: "border-mint-100 bg-mint-50 text-mint-700",
	dark: "border-white/10 bg-white/5 text-white/60",
};

export const SectionEyebrow = ({
	children,
	tone = "neutral",
	icon,
}: SectionEyebrowProps) => (
	<span
		className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-[0.08em] uppercase ${toneClasses[tone]}`}
	>
		{icon}
		{children}
	</span>
);
