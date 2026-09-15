import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/forgot-password/")({
	component: ForgotPassworPage,
});

function ForgotPassworPage() {
	return (
		<div className="flex flex-col gap-7 px-6 py-8 sm:px-12 sm:py-10">
			<h1>Welcome to Forgot Password page!</h1>
		</div>
	);
}
