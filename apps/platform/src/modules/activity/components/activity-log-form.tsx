import { Card, IconBox, SectionHeader } from "@mycustom/ui";
import { NotebookPen, Send } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import {
	inputClassName,
	labelClassName,
	primaryButtonClassName,
} from "#/components/form-styles";
import { Loader } from "#/components/loader";
import {
	channelLabel,
	channelOptions,
	type Prospect,
	toLocalIsoDate,
} from "#/modules/prospect";
import {
	type ActivityInput,
	useCreateActivity,
} from "../hooks/use-create-activity";
import { outcomeLabel, outcomeOptions } from "../labels";

export const ActivityLogForm = ({ prospect }: { prospect: Prospect }) => {
	const [channel, setChannel] = useState<ActivityInput["channel"]>(
		prospect.channel ?? "EMAIL",
	);
	const [outcome, setOutcome] = useState<ActivityInput["outcome"]>("sent");
	const [activityDate, setActivityDate] = useState(() =>
		toLocalIsoDate(new Date()),
	);
	const [messageText, setMessageText] = useState("");
	const createActivity = useCreateActivity(prospect.id);

	function handleSubmit(event: React.SubmitEvent) {
		event.preventDefault();

		createActivity.mutate(
			{
				channel,
				outcome,
				activityDate,
				messageText: messageText.trim() || undefined,
			},
			{
				onSuccess: () => {
					toast.success("Aktivitas dicatat");
					setMessageText("");
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
				<div className="grid grid-cols-2 gap-2.5">
					<div>
						<label htmlFor="activity-channel" className={labelClassName}>
							Channel
						</label>
						<select
							id="activity-channel"
							value={channel}
							onChange={(event) =>
								setChannel(event.target.value as ActivityInput["channel"])
							}
							className={inputClassName}
						>
							{channelOptions.map((option) => (
								<option key={option} value={option}>
									{channelLabel[option]}
								</option>
							))}
						</select>
					</div>
					<div>
						<label htmlFor="activity-outcome" className={labelClassName}>
							Hasil
						</label>
						<select
							id="activity-outcome"
							value={outcome}
							onChange={(event) =>
								setOutcome(event.target.value as ActivityInput["outcome"])
							}
							className={inputClassName}
						>
							{outcomeOptions.map((option) => (
								<option key={option} value={option}>
									{outcomeLabel[option]}
								</option>
							))}
						</select>
					</div>
				</div>

				<div>
					<label htmlFor="activity-date" className={labelClassName}>
						Tanggal
					</label>
					<input
						id="activity-date"
						type="date"
						value={activityDate}
						onChange={(event) => setActivityDate(event.target.value)}
						required
						className={inputClassName}
					/>
				</div>

				<div>
					<label htmlFor="activity-message" className={labelClassName}>
						Catatan pesan
					</label>
					<textarea
						id="activity-message"
						value={messageText}
						onChange={(event) => setMessageText(event.target.value)}
						rows={3}
						placeholder="Ringkasan singkat pesan yang dikirim..."
						className={`${inputClassName} resize-none`}
					/>
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
