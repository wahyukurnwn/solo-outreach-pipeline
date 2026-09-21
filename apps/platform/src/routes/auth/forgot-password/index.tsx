import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthCard, ForgotPasswordForm } from "#/modules/auth";

export const Route = createFileRoute("/auth/forgot-password/")({
	component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
	return (
		<AuthCard
			title="Forgot your password?"
			description="Enter your account email and we'll send you a link to set a new password."
			footer={
				<span className="text-muted">
					Remember your password?{" "}
					<Link
						to="/auth/signin"
						className="font-semibold text-ink transition-colors hover:text-lavender-700"
					>
						Sign in
					</Link>
				</span>
			}
		>
			<ForgotPasswordForm />
		</AuthCard>
	);
}
