import { Link, useNavigate } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import {
	inputClassName,
	labelClassName,
	primaryButtonClassName,
} from "#/components/form-styles";
import { Loader } from "#/components/loader";
import { useSignIn } from "../hooks/use-sign-in";

export const SignInForm = () => {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const signIn = useSignIn();

	function handleSubmitForm(event: React.SubmitEvent) {
		event.preventDefault();

		signIn.mutate(
			{ email, password },
			{
				onSuccess: () => navigate({ to: "/users" }),
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
					placeholder="admin@example.com"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					className={inputClassName}
				/>
			</section>

			<section>
				<div className="mb-1.5 flex items-center justify-between">
					<label
						htmlFor="password"
						className="text-[13px] font-semibold text-ink-soft"
					>
						Password
					</label>
					<Link
						to="/forgot-password"
						className="text-[13px] font-medium text-ink-soft no-underline transition-colors hover:text-lavender-700"
					>
						Forgot password?
					</Link>
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
				disabled={signIn.isPending}
				className={`${primaryButtonClassName} mt-1 h-11 w-full`}
			>
				{signIn.isPending ? <Loader /> : <Mail className="size-4" />}
				{signIn.isPending ? "Signing in..." : "Sign in"}
			</button>
		</form>
	);
};
