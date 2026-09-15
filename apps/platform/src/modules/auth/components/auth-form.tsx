import { Link, useNavigate } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import {
	inputClassName,
	labelClassName,
	labelTextClassName,
} from "#/components/form-styles";
import { Loader } from "#/components/loader";
import { useSignIn } from "../hooks/use-sign-in";
import { useSignUp } from "../hooks/use-sign-up";
import { authSubmitButtonClassName } from "../styles";

export type AuthMode = "signin" | "signup";

interface AuthFormProps {
	mode: AuthMode;
	// Signup sukses tidak auto-login
	// Setelah sign up sukses, cukup pindah tab ke Sign In
	// di kartu yang sama, kredensial yang baru diketik masih relevan.
	onSignedUp: () => void;
}

export const AuthForm = ({ mode, onSignedUp }: AuthFormProps) => {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const signIn = useSignIn();
	const signUp = useSignUp();
	const isPending = mode === "signin" ? signIn.isPending : signUp.isPending;

	//
	function handleSubmitForm(event: React.SubmitEvent) {
		event.preventDefault();

		if (mode === "signup") {
			signUp.mutate(
				{ email, password },
				{
					onSuccess: () => onSignedUp(),
					onError: (err) => toast.error(err.message),
				},
			);
			return;
		}

		signIn.mutate(
			{ email, password },
			{
				onSuccess: () => navigate({ to: "/dashboard" }),
				onError: (err) => toast.error(err.message),
			},
		);
	}

	return (
		<form onSubmit={handleSubmitForm} className="flex flex-col gap-4">
			<section>
				<label htmlFor="email" className={labelClassName}>
					Email
				</label>
				<input
					id="email"
					type="email"
					placeholder="you@example.com"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					className={inputClassName}
				/>
			</section>

			<section>
				<div className="mb-1.5 flex items-center justify-between">
					<label htmlFor="password" className={labelTextClassName}>
						Password
					</label>
					{mode === "signin" ? (
						<Link
							to="/auth/forgot-password"
							className="text-[13px] font-medium text-ink-soft no-underline transition-colors hover:text-lavender-700"
						>
							Lupa password?
						</Link>
					) : null}
				</div>
				<input
					id="password"
					type="password"
					placeholder="········"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					minLength={8}
					className={inputClassName}
				/>
			</section>

			<button
				type="submit"
				disabled={isPending}
				className={`${authSubmitButtonClassName} mt-1`}
			>
				{isPending ? <Loader /> : <Mail className="size-4" />}
				{mode === "signup"
					? isPending
						? "Mendaftar..."
						: "Daftar dengan Email"
					: isPending
						? "Masuk..."
						: "Masuk dengan Email"}
			</button>
		</form>
	);
};
