import { Card, IconBox, SectionHeader } from "@mycustom/ui";
import { MessageSquare } from "lucide-react";
import { channelLabel } from "#/modules/prospect";
import { formatRate } from "../format";
import type { Analytics } from "../types";

export const ChannelBreakdownCard = ({
	channels,
}: {
	channels: Analytics["channels"];
}) => (
	<Card className="flex flex-col gap-4">
		<SectionHeader
			title="Response rate per channel"
			icon={
				<IconBox tone="cloud">
					<MessageSquare className="size-[15px]" />
				</IconBox>
			}
		/>

		<ul className="flex flex-col gap-4">
			{channels.map((row) => (
				<li key={row.channel} className="flex flex-col gap-2">
					<div className="flex items-baseline justify-between gap-3 text-[13px]">
						<span className="font-semibold text-ink">
							{channelLabel[row.channel]}
						</span>
						<span className="text-muted">
							<span className="font-bold text-ink tabular-nums">
								{formatRate(row.responseRate)}
							</span>{" "}
							· {row.replied} dari {row.contacted} membalas
						</span>
					</div>
					<div className="h-2 overflow-hidden rounded-full bg-sidebar">
						<div
							className="h-full rounded-full bg-cloud-700 transition-[width] duration-500"
							style={{ width: `${(row.responseRate ?? 0) * 100}%` }}
						/>
					</div>
				</li>
			))}
		</ul>
	</Card>
);
