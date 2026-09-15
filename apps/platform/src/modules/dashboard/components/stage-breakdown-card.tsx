import { Card, IconBox, SectionHeader } from "@mycustom/ui";
import { Link } from "@tanstack/react-router";
import { ChartColumn } from "lucide-react";
import {
	activeStages,
	type Prospect,
	stageColor,
	stageLabel,
} from "#/modules/prospect";

export const StageBreakdownCard = ({
	prospects,
}: {
	prospects: Prospect[];
}) => {
	const total = prospects.length;

	return (
		<Card className="flex flex-col gap-4">
			<SectionHeader
				title="Sebaran stage"
				icon={
					<IconBox tone="lavender">
						<ChartColumn className="size-[15px]" />
					</IconBox>
				}
			/>

			<ul className="flex flex-col gap-3.5">
				{activeStages.map((stage) => {
					const count = prospects.filter(
						(prospect) => prospect.stage === stage,
					).length;
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

			<p className="text-xs text-faint">
				Closed Won &amp; Closed Lost ada di halaman{" "}
				<Link
					to="/analytic"
					className="font-medium text-muted underline-offset-2 transition-colors hover:text-ink hover:underline"
				>
					Analitik
				</Link>
			</p>
		</Card>
	);
};
