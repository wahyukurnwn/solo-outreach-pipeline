import { createFileRoute } from "@tanstack/react-router";
import { Zap } from "lucide-react";
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
			icon={<Zap className="size-6" />}
			title={mode === "signup" ? "Buat Akun Baru" : "Selamat Datang Kembali"}
			description={
				mode === "signup"
					? "Daftar untuk mulai melacak prospek Anda"
					: "Masuk untuk mengakses akun dan semua fitur Anda"
			}
		>
			<div className="flex flex-col gap-5">
				<GoogleSignInButton />

				<div className="flex items-center gap-3 text-xs font-medium text-muted">
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
