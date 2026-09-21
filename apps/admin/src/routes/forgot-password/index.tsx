import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthCard, ForgotPasswordForm } from "#/modules/auth";

export const Route = createFileRoute("/forgot-password/")({
	ssr: false,
	component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
	return (
		<AuthCard
			title="Forgot your password?"
			description="Enter your admin account email and we'll send you a link to set a new password."
			footer={
				<span className="text-muted">
					Remember your password?{" "}
					<Link
						to="/signin"
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
