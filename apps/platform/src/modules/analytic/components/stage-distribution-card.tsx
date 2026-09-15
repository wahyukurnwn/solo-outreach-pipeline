import { Card, IconBox, SectionHeader } from "@mycustom/ui";
import { Layers } from "lucide-react";
import { stageColor, stageLabel, stageOptions } from "#/modules/prospect";
import type { Analytics } from "../types";

interface StageDistributionCardProps {
	stages: Analytics["stages"];
	total: number;
}

// Beda dari StageBreakdownCard di Dashboard: di sini keenam stage ditampilkan,
// termasuk Closed Won & Closed Lost, karena halaman ini tempat review hasil.
export const StageDistributionCard = ({
	stages,
	total,
}: StageDistributionCardProps) => (
	<Card className="flex flex-col gap-4">
		<SectionHeader
			title="Sebaran stage"
			icon={
				<IconBox tone="lavender">
					<Layers className="size-[15px]" />
				</IconBox>
			}
			action={<span className="text-[13px] text-muted">{total} prospek</span>}
		/>

		<ul className="flex flex-col gap-3.5">
			{stageOptions.map((stage) => {
				const count = stages[stage];
				const percentage = total === 0 ? 0 : (count / total) * 100;

				return (
					<li key={stage} className="flex flex-col gap-[7px]">
						<div className="flex items-center justify-between text-[13px]">
							<span className="flex items-center gap-2 text-ink-soft">
								<span
									className={`size-[7px] rounded-full ${stageColor[stage]}`}
								/>
								{stageLabel[stage]}
							</span>
							<span className="font-bold text-ink tabular-nums">{count}</span>
						</div>
						<div className="h-2 overflow-hidden rounded-full bg-sidebar">
							<div
								className={`h-full rounded-full transition-[width] duration-500 ${stageColor[stage]}`}
								style={{ width: `${percentage}%` }}
							/>
						</div>
					</li>
				);
			})}
		</ul>
	</Card>
);
