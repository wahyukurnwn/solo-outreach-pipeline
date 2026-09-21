import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AuthCard, AuthForm, type AuthMode } from "#/modules/auth";
import { AuthTabs } from "#/modules/auth/components/auth-tabs";
import { GoogleSignInButton } from "#/modules/auth/components/google-sign-in-button";

export const Route = createFileRoute("/auth/signin/")({
	validateSearch: (search: Record<string, unknown>): { tab?: "signup" } => {
		if (search.tab === "signup") return { tab: "signup" };
		return {};
	},
	component: SignInPage,
});

function SignInPage() {
	const { tab } = Route.useSearch();
	const [mode, setMode] = useState<AuthMode>(tab ?? "signin");

	return (
		<AuthCard
			title={mode === "signup" ? "Create your account" : "Welcome back"}
			description={
				mode === "signup"
					? "Sign up to start tracking your prospects"
					: "Sign in to access your account and all your features"
			}
		>
			<div className="flex flex-col gap-5">
				<GoogleSignInButton />

				<div className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.08em] text-faint">
					<span className="h-px flex-1 bg-line" />
					ATAU
					<span className="h-px flex-1 bg-line" />
				</div>

				<AuthTabs mode={mode} onChange={setMode} />

				<AuthForm mode={mode} onSignedUp={() => setMode("signin")} />
			</div>
		</AuthCard>
	);
}
