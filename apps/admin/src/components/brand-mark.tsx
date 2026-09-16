import { ShieldCheck } from "lucide-react";

type BrandMarkSize = "sm" | "md" | "lg";

interface BrandMarkProps {
	size?: BrandMarkSize;
	withWordmark?: boolean;
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

// Ikon shield (bukan Zap seperti apps/platform) supaya secara sekilas jelas
// ini konsol admin, bukan aplikasi utama — dua origin, dua tujuan berbeda.
export const BrandMark = ({
	size = "md",
	withWordmark = false,
}: BrandMarkProps) => (
	<span className="inline-flex items-center gap-2.5">
		<span
			className={`flex shrink-0 items-center justify-center bg-ink text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_4px_10px_-4px_rgba(45,42,38,0.5)] ${boxClasses[size]}`}
		>
			<ShieldCheck className={iconClasses[size]} strokeWidth={2.2} />
		</span>
		{withWordmark ? (
			<span className="flex flex-col leading-tight">
				<span className="text-[15px] font-bold tracking-tight text-ink">
					Pipeline Admin
				</span>
			</span>
		) : null}
	</span>
);
