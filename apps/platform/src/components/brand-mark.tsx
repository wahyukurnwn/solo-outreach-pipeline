import { Zap } from "lucide-react";

type BrandMarkSize = "sm" | "md" | "lg";

interface BrandMarkProps {
	size?: BrandMarkSize;
	withWordmark?: boolean;
	tagline?: string;
}

const boxClasses: Record<BrandMarkSize, string> = {
	sm: "size-7 rounded-[9px]",
	md: "size-8 rounded-[10px]",
	lg: "size-12 rounded-2xl",
};

const iconClasses: Record<BrandMarkSize, string> = {
	sm: "size-3.5",
	md: "size-4",
	lg: "size-6",
};

export const BrandMark = ({
	size = "md",
	withWordmark = false,
	tagline,
}: BrandMarkProps) => (
	<span className="inline-flex items-center gap-2.5">
		<span
			className={`flex shrink-0 items-center justify-center bg-ink text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_4px_10px_-4px_rgba(45,42,38,0.5)] ${boxClasses[size]}`}
		>
			<Zap className={`fill-current ${iconClasses[size]}`} strokeWidth={2.2} />
		</span>
		{withWordmark ? (
			<span className="flex flex-col leading-tight">
				<span className="text-[15px] font-bold tracking-tight text-ink">
					Pipeline
				</span>
				{tagline ? (
					<span className="text-xs font-normal text-muted">{tagline}</span>
				) : null}
			</span>
		) : null}
	</span>
);
