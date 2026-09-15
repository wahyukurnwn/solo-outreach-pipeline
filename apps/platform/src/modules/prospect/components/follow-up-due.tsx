import { Badge } from "@mycustom/ui";
import { formatDateOnly, formatShortDateOnly } from "#/libs/date";
import { daysOverdue, followUpDueLabel } from "../follow-up";

interface FollowUpDueProps {
	followUpDate: string | null;
	dateFormat?: "short" | "long";
}

export const FollowUpDue = ({
	followUpDate,
	dateFormat = "short",
}: FollowUpDueProps) => {
	if (!followUpDate) return <span className="text-faint">—</span>;

	const days = daysOverdue(followUpDate);

	return (
		<span className="flex flex-wrap items-center gap-2">
			{dateFormat === "long"
				? formatDateOnly(followUpDate)
				: formatShortDateOnly(followUpDate)}
			{days >= 0 ? (
				<Badge variant={days > 0 ? "danger" : "warning"}>
					{followUpDueLabel(days)}
				</Badge>
			) : null}
		</span>
	);
};
