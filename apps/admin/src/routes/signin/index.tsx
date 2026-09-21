import { createFileRoute } from "@tanstack/react-router";
import { AuthCard } from "#/modules/auth/components/auth-card";
import { SignInForm } from "#/modules/auth/components/sign-in-form";

export const Route = createFileRoute("/signin/")({
	ssr: false,
	component: SignInPage,
});

function SignInPage() {
	return (
		<AuthCard
			title="Admin sign-in"
			description="For accounts with admin access only."
		>
			<SignInForm />
		</AuthCard>
	);
}
