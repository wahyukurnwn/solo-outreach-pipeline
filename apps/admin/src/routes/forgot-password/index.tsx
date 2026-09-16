import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthCard, ForgotPasswordForm } from "#/modules/auth";

export const Route = createFileRoute("/forgot-password/")({
	ssr: false,
	component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
	return (
		<AuthCard
			title="Lupa password?"
			description="Masukkan email akun admin Anda. Kami kirim link untuk membuat password baru."
			footer={
				<span className="text-muted">
					Ingat password Anda?{" "}
					<Link
						to="/signin"
						className="font-semibold text-ink transition-colors hover:text-lavender-700"
					>
						Masuk
					</Link>
				</span>
			}
		>
			<ForgotPasswordForm />
		</AuthCard>
	);
}
