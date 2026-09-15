import { IconBox } from "@mycustom/ui";
import { Check, Send } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { inputClassName, labelClassName } from "#/components/form-styles";
import { Loader } from "#/components/loader";
import { useForgotPassword } from "../hooks/use-forgot-password";
import { authSubmitButtonClassName } from "../styles";

export const ForgotPasswordForm = () => {
	const [email, setEmail] = useState("");
	const forgotPassword = useForgotPassword();

	// Pesan sukses dari API sengaja generik ("jika email terdaftar...") dan
	// ditampilkan apa adanya — UI tidak boleh membedakan email yang terdaftar
	// dari yang tidak.
	if (forgotPassword.isSuccess)
		return (
			<div className="flex flex-col items-center gap-2 rounded-2xl bg-mint-50 px-5 py-6 text-center">
				<IconBox tone="mint" size="lg">
					<Check className="size-5" />
				</IconBox>
				<p className="mt-2 text-sm font-semibold text-ink">Cek email Anda</p>
				<p className="text-[13px] leading-relaxed text-ink-soft">
					{forgotPassword.data.message} Belum masuk? Periksa folder spam.
				</p>
				<button
					type="button"
					onClick={() => forgotPassword.reset()}
					className="mt-2 text-[13px] font-semibold text-mint-700 transition-colors hover:text-ink"
				>
					Kirim ulang ke email lain
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
					placeholder="you@example.com"
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
				className={`${authSubmitButtonClassName} mt-1`}
			>
				{forgotPassword.isPending ? <Loader /> : <Send className="size-4" />}
				{forgotPassword.isPending ? "Mengirim..." : "Kirim link reset"}
			</button>
		</form>
	);
};
