import { AlertDialog, IconBox, SectionHeader } from "@mycustom/ui";
import { Clock, Pencil, Trash } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { formatDateOnly } from "#/libs/date";
import { channelLabel } from "#/modules/prospect";
import { useActivities } from "../hooks/use-activities";
import { useDeleteActivity } from "../hooks/use-delete-activity";
import { outcomeClass, outcomeDotClass, outcomeLabel } from "../labels";
import type { Activity } from "../types";
import { ActivityFormDialog } from "./activity-form-dialog";

export const ActivityTimeline = ({ prospectId }: { prospectId: string }) => {
	const activitiesQuery = useActivities(prospectId);
	const deleteActivity = useDeleteActivity(prospectId);
	const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
	const [deletingActivity, setDeletingActivity] = useState<Activity | null>(
		null,
	);

	function handleDelete() {
		if (!deletingActivity || deleteActivity.isPending) return;

		deleteActivity.mutate(deletingActivity.id, {
			onSuccess: () => {
				toast.success("Activity deleted");
				setDeletingActivity(null);
			},
			onError: (err) => {
				toast.error(err.message);
				setDeletingActivity(null);
			},
		});
	}

	return (
		<section className="flex flex-col gap-3.5">
			<SectionHeader
				title="Activity history"
				icon={
					<IconBox tone="lavender">
						<Clock className="size-[15px]" />
					</IconBox>
				}
				action={
					activitiesQuery.data ? (
						<span className="text-[13px] text-muted">
							{activitiesQuery.data.length}{" "}
							{activitiesQuery.data.length === 1 ? "entry" : "entries"}
						</span>
					) : null
				}
			/>
			<TimelineBody
				activities={activitiesQuery.data}
				errorMessage={activitiesQuery.error?.message}
				onEdit={setEditingActivity}
				onDelete={setDeletingActivity}
			/>

			{editingActivity ? (
				<ActivityFormDialog
					open
					activity={editingActivity}
					onClose={() => setEditingActivity(null)}
				/>
			) : null}
			<AlertDialog
				open={deletingActivity !== null}
				title="Delete this activity?"
				description="This outreach entry will be permanently deleted and no longer counted in analytics."
				confirmLabel={deleteActivity.isPending ? "Deleting..." : "Delete"}
				onConfirm={handleDelete}
				onCancel={() => setDeletingActivity(null)}
			/>
		</section>
	);
};

interface TimelineBodyProps {
	activities?: Activity[];
	errorMessage?: string;
	onEdit: (activity: Activity) => void;
	onDelete: (activity: Activity) => void;
}

const iconButtonClassName =
	"flex size-7 items-center justify-center rounded-lg text-faint transition-colors";

function TimelineBody({
	activities,
	errorMessage,
	onEdit,
	onDelete,
}: TimelineBodyProps) {
	if (errorMessage)
		return (
			<p className="rounded-2xl bg-blush-50 px-4 py-3 text-[13px] text-blush-700">
				{errorMessage}
			</p>
		);

	if (!activities)
		return (
			<div className="flex flex-col gap-2.5">
				<div className="h-20 animate-pulse rounded-2xl border border-line bg-white" />
				<div className="h-20 animate-pulse rounded-2xl border border-line bg-white" />
			</div>
		);

	if (activities.length === 0)
		return (
			<div className="rounded-2xl border border-dashed border-line-strong px-5 py-8 text-center">
				<p className="text-sm font-semibold text-ink">No activity yet</p>
				<p className="mx-auto mt-1 max-w-xs text-[13px] text-muted">
					Log your first outreach — the history will appear here in
					chronological order.
				</p>
			</div>
		);

	return (
		<ol className="flex flex-col">
			{activities.map((activity, index) => {
				const isLast = index === activities.length - 1;

				return (
					<li key={activity.id} className="flex gap-3.5">
						<div className="flex flex-col items-center pt-[18px]">
							<span
								className={`size-2.5 shrink-0 rounded-full ring-4 ${outcomeDotClass[activity.outcome]}`}
							/>
							{isLast ? null : <span className="mt-2 w-0.5 flex-1 bg-line" />}
						</div>
						<div
							className={`flex min-w-0 flex-1 flex-col gap-2 rounded-2xl border border-line bg-white px-4 py-3.5 ${isLast ? "" : "mb-2.5"}`}
						>
							<div className="flex flex-wrap items-center justify-between gap-2">
								<span className="text-[13px] font-semibold text-ink">
									{formatDateOnly(activity.activityDate)}
								</span>
								<div className="flex items-center gap-1.5">
									<span className="rounded-full bg-sidebar px-2.5 py-0.5 text-xs font-semibold text-ink-soft">
										{channelLabel[activity.channel]}
									</span>
									<span
										className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${outcomeClass[activity.outcome]}`}
									>
										{outcomeLabel[activity.outcome]}
									</span>
									<button
										type="button"
										aria-label="Edit activity"
										onClick={() => onEdit(activity)}
										className={`${iconButtonClassName} hover:bg-sidebar hover:text-ink`}
									>
										<Pencil className="size-3.5" />
									</button>
									<button
										type="button"
										aria-label="Delete activity"
										onClick={() => onDelete(activity)}
										className={`${iconButtonClassName} hover:bg-blush-50 hover:text-blush-700`}
									>
										<Trash className="size-3.5" />
									</button>
								</div>
							</div>
							{activity.messageText ? (
								<p className="text-sm leading-relaxed whitespace-pre-line text-ink-soft">
									{activity.messageText}
								</p>
							) : null}
						</div>
					</li>
				);
			})}
		</ol>
	);
}
