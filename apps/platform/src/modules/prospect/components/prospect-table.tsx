import { Link } from "@tanstack/react-router";
import { channelLabel } from "../labels";
import type { Prospect } from "../types";
import { FollowUpDue } from "./follow-up-due";
import { ProspectAvatar } from "./prospect-avatar";
import { StagePill } from "./stage-pill";

const columnsClassName =
	"md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.3fr)]";

export const ProspectTable = ({ prospects }: { prospects: Prospect[] }) => (
	<div className="overflow-hidden rounded-[20px] border border-line bg-white">
		<div
			className={`hidden gap-4 border-b border-line bg-subtle px-5 py-2.5 text-[11px] font-bold tracking-[0.08em] text-faint uppercase md:grid ${columnsClassName}`}
		>
			<span>Prospek</span>
			<span>Stage</span>
			<span>Channel</span>
			<span>Follow-up</span>
		</div>

		<ul className="divide-y divide-line">
			{prospects.map((prospect) => (
				<li key={prospect.id}>
					<Link
						to="/prospect/$id"
						params={{ id: prospect.id }}
						className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5 transition-colors hover:bg-subtle md:gap-4 ${columnsClassName}`}
					>
						<div className="flex min-w-0 items-center gap-3">
							<ProspectAvatar prospect={prospect} />
							<div className="min-w-0">
								<p className="truncate text-sm font-semibold text-ink">
									{prospect.name}
								</p>
								<p className="truncate text-[13px] text-muted">
									{prospect.company || "Tanpa perusahaan"}
								</p>
							</div>
						</div>
						<div>
							<StagePill stage={prospect.stage} />
						</div>
						<span className="hidden text-sm text-ink-soft md:block">
							{prospect.channel ? channelLabel[prospect.channel] : "—"}
						</span>
						<span className="hidden text-sm text-ink-soft md:block">
							<FollowUpDue followUpDate={prospect.followUpDate} />
						</span>
					</Link>
				</li>
			))}
		</ul>
	</div>
);
