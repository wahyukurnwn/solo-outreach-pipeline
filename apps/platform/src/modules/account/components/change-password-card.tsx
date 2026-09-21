import { Card, IconBox, SectionHeader } from "@mycustom/ui";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import {
	helperClassName,
	inputClassName,
	labelClassName,
	primaryButtonClassName,
} from "#/components/form-styles";
import { Loader } from "#/components/loader";
import { useChangePassword } from "../hooks/use-change-password";

export const ChangePasswordCard = () => {
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmation, setConfirmation] = useState("");
	const changePassword = useChangePassword();
	const isMismatch = confirmation.length > 0 && confirmation !== newPassword;

	function handleSubmit(event: React.SubmitEvent) {
		event.preventDefault();
		if (newPassword !== confirmation) return;

		changePassword.mutate(
			{ currentPassword, newPassword },
			{
				onSuccess: (res) => {
					toast.success(res.message);
					setCurrentPassword("");
					setNewPassword("");
					setConfirmation("");
				},
				onError: (err) => toast.error(err.message),
			},
		);
	}

	return (
		<Card className="flex flex-col gap-4">
			<SectionHeader
				title="Ganti password"
				icon={
					<IconBox tone="peach">
						<KeyRound className="size-[15px]" />
					</IconBox>
				}
			/>

			<form
				onSubmit={handleSubmit}
				className="flex flex-col gap-3.5 sm:max-w-md"
			>
				<div>
					<label htmlFor="change-current-password" className={labelClassName}>
						Current password
					</label>
					<input
						id="change-current-password"
						type="password"
						autoComplete="current-password"
						value={currentPassword}
						onChange={(event) => setCurrentPassword(event.target.value)}
						required
						className={inputClassName}
					/>
				</div>

				<div>
					<label htmlFor="change-new-password" className={labelClassName}>
						New password
					</label>
					<input
						id="change-new-password"
						type="password"
						autoComplete="new-password"
						value={newPassword}
						onChange={(event) => setNewPassword(event.target.value)}
						required
						minLength={8}
						className={inputClassName}
					/>
					<p className={helperClassName}>At least 8 characters.</p>
				</div>

				<div>
					<label
						htmlFor="change-password-confirmation"
						className={labelClassName}
					>
						Confirm new password
					</label>
					<input
						id="change-password-confirmation"
						type="password"
						autoComplete="new-password"
						value={confirmation}
						onChange={(event) => setConfirmation(event.target.value)}
						required
						minLength={8}
						aria-invalid={isMismatch}
						aria-describedby={
							isMismatch ? "change-password-mismatch" : undefined
						}
						className={inputClassName}
					/>
					{isMismatch ? (
						<p
							id="change-password-mismatch"
							className="mt-1.5 text-xs font-medium text-blush-700"
						>
							Passwords don't match.
						</p>
					) : null}
				</div>

				<div className="mt-1">
					<button
						type="submit"
						disabled={changePassword.isPending || isMismatch}
						className={primaryButtonClassName}
					>
						{changePassword.isPending ? <Loader /> : null}
						Save new password
					</button>
				</div>
			</form>
		</Card>
	);
};
