import { IconBox } from "@mycustom/ui";
import { Check, Send } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import {
	inputClassName,
	labelClassName,
	primaryButtonClassName,
} from "#/components/form-styles";
import { Loader } from "#/components/loader";
import { useForgotPassword } from "../hooks/use-forgot-password";

export const ForgotPasswordForm = () => {
	const [email, setEmail] = useState("");
	const forgotPassword = useForgotPassword();

	// Pesan sukses generik ("jika email terdaftar...") ditampilkan apa
	// adanya — UI tidak boleh membedakan email admin yang terdaftar dari yang
	// tidak, sama seperti apps/platform.
	if (forgotPassword.isSuccess)
		return (
			<div className="flex flex-col items-center gap-2 rounded-2xl bg-mint-50 px-5 py-6 text-center">
				<IconBox tone="mint" size="lg">
					<Check className="size-5" />
				</IconBox>
				<p className="mt-2 text-sm font-semibold text-ink">Check your email</p>
				<p className="text-[13px] leading-relaxed text-ink-soft">
					{forgotPassword.data.message} Nothing yet? Check your spam folder.
				</p>
				<button
					type="button"
					onClick={() => forgotPassword.reset()}
					className="mt-2 text-[13px] font-semibold text-mint-700 transition-colors hover:text-ink"
				>
					Send to a different email
				</button>
			</div>
		);

	function handleSubmit(event: React.SubmitEvent) {
		event.preventDefault();

		forgotPassword.mutate(
			{ email },
			{ onError: (err) => toast.error(err.message) },
		);
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4">
			<section>
				<label htmlFor="forgot-email" className={labelClassName}>
					Email
				</label>
				<input
					id="forgot-email"
					type="email"
					placeholder="admin@example.com"
					autoComplete="email"
					value={email}
					onChange={(event) => setEmail(event.target.value)}
					required
					className={inputClassName}
				/>
			</section>

			<button
				type="submit"
				disabled={forgotPassword.isPending}
				className={`${primaryButtonClassName} mt-1 h-11 w-full`}
			>
				{forgotPassword.isPending ? <Loader /> : <Send className="size-4" />}
				{forgotPassword.isPending ? "Sending..." : "Send reset link"}
			</button>
		</form>
	);
};
