import { IconBox } from "@mycustom/ui";
import { createFileRoute, Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import {
	AuthCard,
	authSubmitButtonClassName,
	ResetPasswordForm,
} from "#/modules/auth";

export const Route = createFileRoute("/auth/reset-password/")({
	validateSearch: (search: Record<string, unknown>): { token?: string } =>
		typeof search.token === "string" && search.token.length > 0
			? { token: search.token }
			: {},
	component: ResetPasswordPage,
});

const requestNewLinkFooter = (
	<span className="text-muted">
		Link expired?{" "}
		<Link
			to="/auth/forgot-password"
			className="font-semibold text-ink transition-colors hover:text-lavender-700"
		>
			Request a new link
		</Link>
	</span>
);

function ResetPasswordPage() {
	const { token } = Route.useSearch();

	if (!token)
		return (
			<AuthCard
				title="Invalid link"
				description="This password reset link is incomplete or was cut off."
			>
				<div className="flex flex-col items-center gap-5">
					<IconBox tone="blush" size="lg">
						<X className="size-5" />
					</IconBox>
					<Link
						to="/auth/forgot-password"
						className={authSubmitButtonClassName}
					>
						Request a new link
					</Link>
				</div>
			</AuthCard>
		);

	return (
		<AuthCard
			title="Set a new password"
			description="Your new password replaces the old one right away."
			footer={requestNewLinkFooter}
		>
			<ResetPasswordForm token={token} />
		</AuthCard>
	);
}
