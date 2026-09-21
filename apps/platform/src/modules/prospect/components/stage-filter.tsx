import { Link } from "@tanstack/react-router";
import { stageColor, stageLabel } from "../labels";
import { stageOptions } from "../options";
import type { Prospect } from "../types";

interface StageFilterProps {
	prospects: Prospect[];
	activeStage?: Prospect["stage"];
}

const chipClassName =
	"inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] font-medium transition-colors";

function chipStateClassName(isActive: boolean) {
	return isActive
		? "border-ink bg-ink text-white"
		: "border-line bg-white text-ink-soft hover:border-line-strong hover:text-ink";
}

export const StageFilter = ({ prospects, activeStage }: StageFilterProps) => (
	<nav aria-label="Filter stage" className="flex flex-wrap gap-2">
		<Link
			to="/prospect"
			search={{}}
			className={`${chipClassName} ${chipStateClassName(!activeStage)}`}
		>
			All
			<span className="tabular-nums opacity-60">{prospects.length}</span>
		</Link>
		{stageOptions.map((stage) => (
			<Link
				key={stage}
				to="/prospect"
				search={{ stage }}
				className={`${chipClassName} ${chipStateClassName(activeStage === stage)}`}
			>
				<span className={`size-[7px] rounded-full ${stageColor[stage]}`} />
				{stageLabel[stage]}
				<span className="tabular-nums opacity-60">
					{prospects.filter((prospect) => prospect.stage === stage).length}
				</span>
			</Link>
		))}
	</nav>
);
