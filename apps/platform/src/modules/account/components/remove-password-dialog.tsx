import { Dialog } from "@mycustom/ui";
import { useState } from "react";
import toast from "react-hot-toast";
import { inputClassName, labelClassName } from "#/components/form-styles";
import { Loader } from "#/components/loader";
import { useRemovePassword } from "../hooks/use-remove-password";

interface RemovePasswordDialogProps {
	open: boolean;
	onClose: () => void;
}

export const RemovePasswordDialog = ({
	open,
	onClose,
}: RemovePasswordDialogProps) => (
	<Dialog open={open} onClose={onClose}>
		<RemovePasswordForm onClose={onClose} />
	</Dialog>
);

function RemovePasswordForm({ onClose }: { onClose: () => void }) {
	const [currentPassword, setCurrentPassword] = useState("");
	const removePassword = useRemovePassword();

	function handleSubmit(event: React.SubmitEvent) {
		event.preventDefault();

		removePassword.mutate(
			{ currentPassword },
			{
				onSuccess: () => {
					toast.success("Password dihapus");
					onClose();
				},
				onError: (err) => toast.error(err.message),
			},
		);
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4">
			<div className="pr-8">
				<p className="text-base font-bold text-ink">Remove password?</p>
				<p className="mt-1 text-sm text-muted">
					After this you can only sign in with Google. Enter your current
					password to confirm.
				</p>
			</div>

			<div>
				<label htmlFor="remove-current-password" className={labelClassName}>
					Current password
				</label>
				<input
					id="remove-current-password"
					type="password"
					autoComplete="current-password"
					value={currentPassword}
					onChange={(event) => setCurrentPassword(event.target.value)}
					required
					className={inputClassName}
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
					disabled={removePassword.isPending}
					className="inline-flex items-center gap-2 rounded-xl bg-blush-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blush-700/90 disabled:opacity-50"
				>
					{removePassword.isPending ? <Loader /> : null}
					Remove password
				</button>
			</div>
		</form>
	);
}
