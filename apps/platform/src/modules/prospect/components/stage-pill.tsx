import { stageAvatarClass, stageColor, stageLabel } from "../labels";
import type { Prospect } from "../types";

interface StagePillProps {
	stage: Prospect["stage"];
	variant?: "outline" | "tinted";
}

export const StagePill = ({ stage, variant = "outline" }: StagePillProps) => (
	<span
		className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${
			variant === "tinted"
				? stageAvatarClass[stage]
				: "border border-line bg-white text-ink-soft"
		}`}
	>
		<span className={`size-[7px] rounded-full ${stageColor[stage]}`} />
		{stageLabel[stage]}
	</span>
);
