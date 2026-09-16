import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import toast from "react-hot-toast";
import {
	helperClassName,
	inputClassName,
	labelClassName,
	primaryButtonClassName,
} from "#/components/form-styles";
import { Loader } from "#/components/loader";
import { useResetPassword } from "../hooks/use-reset-password";

export const ResetPasswordForm = ({ token }: { token: string }) => {
	const navigate = useNavigate();
	const [password, setPassword] = useState("");
	const [confirmation, setConfirmation] = useState("");
	const resetPassword = useResetPassword();
	const isMismatch = confirmation.length > 0 && confirmation !== password;

	function handleSubmit(event: React.SubmitEvent) {
		event.preventDefault();
		if (password !== confirmation) return;

		resetPassword.mutate(
			{ token, password },
			{
				onSuccess: (res) => {
					toast.success(res.message);
					navigate({ to: "/signin" });
				},
				onError: (err) => toast.error(err.message),
			},
		);
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4">
			<section>
				<label htmlFor="reset-password" className={labelClassName}>
					Password baru
				</label>
				<input
					id="reset-password"
					type="password"
					placeholder="········"
					autoComplete="new-password"
					value={password}
					onChange={(event) => setPassword(event.target.value)}
					required
					minLength={8}
					className={inputClassName}
				/>
				<p className={helperClassName}>Minimal 8 karakter.</p>
			</section>

			<section>
				<label htmlFor="reset-password-confirmation" className={labelClassName}>
					Ulangi password baru
				</label>
				<input
					id="reset-password-confirmation"
					type="password"
					placeholder="········"
					autoComplete="new-password"
					value={confirmation}
					onChange={(event) => setConfirmation(event.target.value)}
					required
					minLength={8}
					aria-invalid={isMismatch}
					aria-describedby={isMismatch ? "reset-password-mismatch" : undefined}
					className={inputClassName}
				/>
				{isMismatch ? (
					<p
						id="reset-password-mismatch"
						className="mt-1.5 text-xs font-medium text-blush-700"
					>
						Password tidak sama.
					</p>
				) : null}
			</section>

			<button
				type="submit"
				disabled={resetPassword.isPending || isMismatch}
				className={`${primaryButtonClassName} mt-1 h-11 w-full`}
			>
				{resetPassword.isPending ? <Loader /> : null}
				{resetPassword.isPending ? "Menyimpan..." : "Simpan password baru"}
			</button>
		</form>
	);
};
