import { Dialog } from "@mycustom/ui";
import { useState } from "react";
import toast from "react-hot-toast";
import { primaryButtonClassName } from "#/components/form-styles";
import { Loader } from "#/components/loader";
import { useUpdateActivity } from "../hooks/use-update-activity";
import type { Activity } from "../types";
import { ActivityFields, type ActivityFieldValues } from "./activity-fields";

interface ActivityFormDialogProps {
	open: boolean;
	onClose: () => void;
	activity: Activity;
}

export const ActivityFormDialog = ({
	open,
	onClose,
	activity,
}: ActivityFormDialogProps) => (
	<Dialog open={open} onClose={onClose}>
		<EditActivityForm activity={activity} onClose={onClose} />
	</Dialog>
);

function EditActivityForm({
	activity,
	onClose,
}: {
	activity: Activity;
	onClose: () => void;
}) {
	const [values, setValues] = useState<ActivityFieldValues>({
		channel: activity.channel,
		outcome: activity.outcome,
		activityDate: activity.activityDate.slice(0, 10),
		messageText: activity.messageText ?? "",
	});
	const updateActivity = useUpdateActivity(activity.prospectId);

	function handleSubmit(event: React.SubmitEvent) {
		event.preventDefault();

		updateActivity.mutate(
			{
				id: activity.id,
				input: {
					channel: values.channel,
					outcome: values.outcome,
					activityDate: values.activityDate,
					messageText: values.messageText.trim() || null,
				},
			},
			{
				onSuccess: () => {
					toast.success("Aktivitas diperbarui");
					onClose();
				},
				onError: (err) => toast.error(err.message),
			},
		);
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4">
			<div className="pr-8">
				<p className="text-base font-bold text-ink">Edit aktivitas</p>
				<p className="mt-1 text-sm text-muted">
					Perbaiki detail outreach yang sudah tercatat.
				</p>
			</div>

			<ActivityFields
				idPrefix="activity-edit"
				values={values}
				onChange={setValues}
			/>

			<div className="mt-2 flex justify-end gap-2">
				<button
					type="button"
					onClick={onClose}
					className="rounded-xl bg-sidebar px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-line"
				>
					Batal
				</button>
				<button
					type="submit"
					disabled={updateActivity.isPending}
					className={primaryButtonClassName}
				>
					{updateActivity.isPending ? <Loader /> : null}
					Simpan perubahan
				</button>
			</div>
		</form>
	);
}
