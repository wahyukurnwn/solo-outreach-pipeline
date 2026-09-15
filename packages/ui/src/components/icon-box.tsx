export type Tone =
	| "neutral"
	| "lavender"
	| "mint"
	| "peach"
	| "cloud"
	| "lagoon"
	| "blush"
	| "sand";

export type IconBoxSize = "sm" | "md" | "lg" | "xl";

interface IconBoxProps {
	children: React.ReactNode;
	tone?: Tone;
	size?: IconBoxSize;
}

// Kelas ditulis utuh per tone (bukan dirakit dari string) supaya tetap
// terdeteksi scanner Tailwind.
const toneClasses: Record<Tone, string> = {
	neutral: "bg-line text-ink-soft",
	lavender: "bg-lavender-100 text-lavender-700",
	mint: "bg-mint-100 text-mint-700",
	peach: "bg-peach-100 text-peach-700",
	cloud: "bg-cloud-100 text-cloud-700",
	lagoon: "bg-lagoon-100 text-lagoon-700",
	blush: "bg-blush-100 text-blush-700",
	sand: "bg-sand-100 text-sand-700",
};

const sizeClasses: Record<IconBoxSize, string> = {
	sm: "size-[26px] rounded-lg",
	md: "size-[30px] rounded-[10px]",
	lg: "size-9 rounded-xl",
	xl: "size-12 rounded-2xl",
};

export const IconBox = ({
	children,
	tone = "neutral",
	size = "md",
}: IconBoxProps) => (
	<span
		className={`flex shrink-0 items-center justify-center ${sizeClasses[size]} ${toneClasses[tone]}`}
	>
		{children}
	</span>
);
