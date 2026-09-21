import {
	Briefcase,
	CalendarClock,
	Clock,
	Layers,
	type LucideIcon,
	MessageSquare,
} from "lucide-react";
import { formatTimestampDate } from "#/libs/date";
import { channelLabel } from "../labels";
import type { Prospect } from "../types";
import { FollowUpDue } from "./follow-up-due";
import { StagePill } from "./stage-pill";

interface PropertyRowProps {
	icon: LucideIcon;
	label: string;
	children: React.ReactNode;
}

function PropertyRow({ icon: Icon, label, children }: PropertyRowProps) {
	return (
		<div className="grid min-h-[38px] grid-cols-[128px_minmax(0,1fr)] items-center gap-3 text-sm sm:grid-cols-[170px_minmax(0,1fr)]">
			<dt className="flex items-center gap-2 text-muted">
				<Icon className="size-4 shrink-0" />
				{label}
			</dt>
			<dd className="min-w-0 text-ink">{children}</dd>
		</div>
	);
}

function EmptyValue() {
	return <span className="text-faint">Kosong</span>;
}

export const ProspectProperties = ({ prospect }: { prospect: Prospect }) => (
	<dl className="flex flex-col">
		<PropertyRow icon={Layers} label="Stage">
			<StagePill stage={prospect.stage} variant="tinted" />
		</PropertyRow>
		<PropertyRow icon={Briefcase} label="Company">
			{prospect.company || <EmptyValue />}
		</PropertyRow>
		<PropertyRow icon={MessageSquare} label="Channel">
			{prospect.channel ? channelLabel[prospect.channel] : <EmptyValue />}
		</PropertyRow>
		<PropertyRow icon={CalendarClock} label="Follow-up">
			{prospect.followUpDate ? (
				<FollowUpDue followUpDate={prospect.followUpDate} dateFormat="long" />
			) : (
				<EmptyValue />
			)}
		</PropertyRow>
		<PropertyRow icon={Clock} label="Ditambahkan">
			{formatTimestampDate(prospect.createdAt)}
		</PropertyRow>
	</dl>
);
