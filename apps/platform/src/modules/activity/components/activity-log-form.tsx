import { Card, IconBox, SectionHeader } from "@mycustom/ui";
import { NotebookPen, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import {
	helperClassName,
	primaryButtonClassName,
	softButtonClassName,
} from "#/components/form-styles";
import { Loader } from "#/components/loader";
import {
	type Prospect,
	toLocalIsoDate,
	useGenerateDraft,
} from "#/modules/prospect";
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
	const generateDraft = useGenerateDraft(prospect.id);

	function handleGenerateDraft() {
		generateDraft.mutate(undefined, {
			onSuccess: (draft) =>
				setValues((current) => ({ ...current, messageText: draft })),
			onError: (err) => toast.error(err.message),
		});
	}

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

				<div>
					<button
						type="button"
						onClick={handleGenerateDraft}
						disabled={generateDraft.isPending}
						className={softButtonClassName}
					>
						{generateDraft.isPending ? (
							<Loader />
						) : (
							<Sparkles className="size-3.5" />
						)}
						{generateDraft.isPending ? "Membuat draft..." : "Draft dengan AI"}
					</button>
					<p className={helperClassName}>
						Draft dibuat oleh AI pihak ketiga dari nama, perusahaan, dan catatan
						prospek — jangan masukkan data sensitif di catatan.
					</p>
				</div>

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
