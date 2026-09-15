import { inputClassName, labelClassName } from "#/components/form-styles";
import { channelLabel, channelOptions } from "#/modules/prospect";
import type { ActivityInput } from "../hooks/use-create-activity";
import { outcomeLabel, outcomeOptions } from "../labels";

export interface ActivityFieldValues {
	channel: ActivityInput["channel"];
	outcome: ActivityInput["outcome"];
	activityDate: string;
	messageText: string;
}

interface ActivityFieldsProps {
	// Dipakai sebagai prefix id input supaya form "catat" dan dialog "edit" bisa
	// tampil bersamaan di satu halaman tanpa id label yang bentrok.
	idPrefix: string;
	values: ActivityFieldValues;
	onChange: (values: ActivityFieldValues) => void;
}

export const ActivityFields = ({
	idPrefix,
	values,
	onChange,
}: ActivityFieldsProps) => {
	const update = (patch: Partial<ActivityFieldValues>) =>
		onChange({ ...values, ...patch });

	return (
		<>
			<div className="grid grid-cols-2 gap-2.5">
				<div>
					<label htmlFor={`${idPrefix}-channel`} className={labelClassName}>
						Channel
					</label>
					<select
						id={`${idPrefix}-channel`}
						value={values.channel}
						onChange={(event) =>
							update({
								channel: event.target.value as ActivityInput["channel"],
							})
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
					<label htmlFor={`${idPrefix}-outcome`} className={labelClassName}>
						Hasil
					</label>
					<select
						id={`${idPrefix}-outcome`}
						value={values.outcome}
						onChange={(event) =>
							update({
								outcome: event.target.value as ActivityInput["outcome"],
							})
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
				<label htmlFor={`${idPrefix}-date`} className={labelClassName}>
					Tanggal
				</label>
				<input
					id={`${idPrefix}-date`}
					type="date"
					value={values.activityDate}
					onChange={(event) => update({ activityDate: event.target.value })}
					required
					className={inputClassName}
				/>
			</div>

			<div>
				<label htmlFor={`${idPrefix}-message`} className={labelClassName}>
					Catatan pesan
				</label>
				<textarea
					id={`${idPrefix}-message`}
					value={values.messageText}
					onChange={(event) => update({ messageText: event.target.value })}
					rows={3}
					placeholder="Ringkasan singkat pesan yang dikirim..."
					className={`${inputClassName} resize-none`}
				/>
			</div>
		</>
	);
};
