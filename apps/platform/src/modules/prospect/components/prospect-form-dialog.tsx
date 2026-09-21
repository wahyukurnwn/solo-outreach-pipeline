import { Dialog } from "@mycustom/ui";
import { useState } from "react";
import toast from "react-hot-toast";
import {
	helperClassName,
	inputClassName,
	labelClassName,
	primaryButtonClassName,
} from "#/components/form-styles";
import { Loader } from "#/components/loader";
import { useCreateProspect } from "../hooks/use-create-prospect";
import { useUpdateProspect } from "../hooks/use-update-prospect";
import { channelLabel, stageLabel } from "../labels";
import { channelOptions, stageOptions } from "../options";
import type { Prospect } from "../types";

interface ProspectFormDialogProps {
	open: boolean;
	onClose: () => void;
	// Ada = mode edit; tidak ada = mode tambah.
	prospect?: Prospect;
}

// Dialog tidak me-render children saat tertutup, jadi state form otomatis
// terisi ulang dari `prospect` setiap kali dialog dibuka.
export const ProspectFormDialog = ({
	open,
	onClose,
	prospect,
}: ProspectFormDialogProps) => (
	<Dialog open={open} onClose={onClose}>
		<ProspectForm prospect={prospect} onClose={onClose} />
	</Dialog>
);

type ChannelValue = "" | NonNullable<Prospect["channel"]>;

function ProspectForm({
	prospect,
	onClose,
}: {
	prospect?: Prospect;
	onClose: () => void;
}) {
	const [name, setName] = useState(prospect?.name ?? "");
	const [company, setCompany] = useState(prospect?.company ?? "");
	const [channel, setChannel] = useState<ChannelValue>(prospect?.channel ?? "");
	const [stage, setStage] = useState<Prospect["stage"]>(
		prospect?.stage ?? "NEW",
	);
	const [followUpDate, setFollowUpDate] = useState(
		prospect?.followUpDate?.slice(0, 10) ?? "",
	);
	const [notes, setNotes] = useState(prospect?.notes ?? "");

	const createProspect = useCreateProspect();
	const updateProspect = useUpdateProspect();
	const isPending = createProspect.isPending || updateProspect.isPending;
	const isEditing = prospect !== undefined;

	function handleSubmit(event: React.SubmitEvent) {
		event.preventDefault();

		const input = {
			name: name.trim(),
			company: company.trim() || null,
			channel: channel || null,
			stage,
			followUpDate: followUpDate || null,
			notes: notes.trim() || null,
		};
		const onSuccess = () => {
			toast.success(isEditing ? "Prospect updated" : "Prospect added");
			onClose();
		};
		const onError = (err: Error) => toast.error(err.message);

		if (prospect) {
			updateProspect.mutate({ id: prospect.id, input }, { onSuccess, onError });
			return;
		}

		createProspect.mutate(input, { onSuccess, onError });
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4">
			<div className="pr-8">
				<p className="text-base font-bold text-ink">
					{isEditing ? "Edit prospect" : "Add prospect"}
				</p>
				<p className="mt-1 text-sm text-muted">
					{isEditing
						? "Update this prospect's details."
						: "Name, company, channel, and notes — that's all you need."}
				</p>
			</div>

			<div>
				<label htmlFor="prospect-name" className={labelClassName}>
					Name
				</label>
				<input
					id="prospect-name"
					value={name}
					onChange={(event) => setName(event.target.value)}
					placeholder="mis. Dimas Pratama"
					required
					className={inputClassName}
				/>
			</div>

			<div>
				<label htmlFor="prospect-company" className={labelClassName}>
					Company
				</label>
				<input
					id="prospect-company"
					value={company}
					onChange={(event) => setCompany(event.target.value)}
					placeholder="Opsional"
					className={inputClassName}
				/>
			</div>

			<div className="grid grid-cols-2 gap-3">
				<div>
					<label htmlFor="prospect-channel" className={labelClassName}>
						Channel
					</label>
					<select
						id="prospect-channel"
						value={channel}
						onChange={(event) => setChannel(event.target.value as ChannelValue)}
						className={inputClassName}
					>
						<option value="">Not set</option>
						{channelOptions.map((option) => (
							<option key={option} value={option}>
								{channelLabel[option]}
							</option>
						))}
					</select>
				</div>
				<div>
					<label htmlFor="prospect-stage" className={labelClassName}>
						Stage
					</label>
					<select
						id="prospect-stage"
						value={stage}
						onChange={(event) =>
							setStage(event.target.value as Prospect["stage"])
						}
						className={inputClassName}
					>
						{stageOptions.map((option) => (
							<option key={option} value={option}>
								{stageLabel[option]}
							</option>
						))}
					</select>
				</div>
			</div>

			<div>
				<label htmlFor="prospect-follow-up" className={labelClassName}>
					Follow-up date
				</label>
				<input
					id="prospect-follow-up"
					type="date"
					value={followUpDate}
					onChange={(event) => setFollowUpDate(event.target.value)}
					className={inputClassName}
				/>
				<p className={helperClassName}>
					Leave empty if there's no follow-up scheduled.
				</p>
			</div>

			<div>
				<label htmlFor="prospect-notes" className={labelClassName}>
					Notes
				</label>
				<textarea
					id="prospect-notes"
					value={notes}
					onChange={(event) => setNotes(event.target.value)}
					rows={3}
					placeholder="How you know them, what they need, and any other useful context."
					className={`${inputClassName} resize-none`}
				/>
			</div>

			<div className="mt-2 flex justify-end gap-2">
				<button
					type="button"
					onClick={onClose}
					className="rounded-xl bg-sidebar px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-line"
				>
					Cancel
				</button>
				<button
					type="submit"
					disabled={isPending}
					className={primaryButtonClassName}
				>
					{isPending ? <Loader /> : null}
					{isEditing ? "Save changes" : "Add prospect"}
				</button>
			</div>
		</form>
	);
}
