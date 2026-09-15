import { Card, IconBox, SectionHeader } from "@mycustom/ui";
import { NotebookPen, Send } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { primaryButtonClassName } from "#/components/form-styles";
import { Loader } from "#/components/loader";
import { type Prospect, toLocalIsoDate } from "#/modules/prospect";
import { useCreateActivity } from "../hooks/use-create-activity";
import { ActivityFields, type ActivityFieldValues } from "./activity-fields";

export const ActivityLogForm = ({ prospect }: { prospect: Prospect }) => {
	const [values, setValues] = useState<ActivityFieldValues>(() => ({
		channel: prospect.channel ?? "EMAIL",
		outcome: "sent",
		activityDate: toLocalIsoDate(new Date()),
		messageText: "",
	}));
	const createActivity = useCreateActivity(prospect.id);

	function handleSubmit(event: React.SubmitEvent) {
		event.preventDefault();

		createActivity.mutate(
			{
				channel: values.channel,
				outcome: values.outcome,
				activityDate: values.activityDate,
				messageText: values.messageText.trim() || undefined,
			},
			{
				onSuccess: () => {
					toast.success("Aktivitas dicatat");
					setValues((current) => ({ ...current, messageText: "" }));
				},
				onError: (err) => toast.error(err.message),
			},
		);
	}

	return (
		<Card className="flex flex-col gap-3.5">
			<SectionHeader
				title="Catat aktivitas"
				icon={
					<IconBox tone="mint">
						<NotebookPen className="size-[15px]" />
					</IconBox>
				}
			/>

			<form onSubmit={handleSubmit} className="flex flex-col gap-3">
				<ActivityFields
					idPrefix="activity-log"
					values={values}
					onChange={setValues}
				/>

				<button
					type="submit"
					disabled={createActivity.isPending}
					className={primaryButtonClassName}
				>
					{createActivity.isPending ? <Loader /> : <Send className="size-4" />}
					Simpan aktivitas
				</button>
			</form>
		</Card>
	);
};
