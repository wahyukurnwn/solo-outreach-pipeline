import { IconBox } from "@mycustom/ui";
import { createFileRoute, Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { primaryButtonClassName } from "#/components/form-styles";
import { AuthCard, ResetPasswordForm } from "#/modules/auth";

export const Route = createFileRoute("/reset-password/")({
	ssr: false,
	validateSearch: (search: Record<string, unknown>): { token?: string } =>
		typeof search.token === "string" && search.token.length > 0
			? { token: search.token }
			: {},
	component: ResetPasswordPage,
});

const requestNewLinkFooter = (
	<span className="text-muted">
		Link kedaluwarsa?{" "}
		<Link
			to="/forgot-password"
			className="font-semibold text-ink transition-colors hover:text-lavender-700"
		>
			Minta link baru
		</Link>
	</span>
);

function ResetPasswordPage() {
	const { token } = Route.useSearch();

	if (!token)
		return (
			<AuthCard
				title="Link tidak valid"
				description="Link reset password ini tidak lengkap atau sudah terpotong."
			>
				<div className="flex flex-col items-center gap-5">
					<IconBox tone="blush" size="lg">
						<X className="size-5" />
					</IconBox>
					<Link
						to="/forgot-password"
						className={`${primaryButtonClassName} h-11 w-full`}
					>
						Minta link baru
					</Link>
				</div>
			</AuthCard>
		);

	return (
		<AuthCard
			title="Buat password baru"
			description="Password baru langsung menggantikan password lama Anda."
			footer={requestNewLinkFooter}
		>
			<ResetPasswordForm token={token} />
		</AuthCard>
	);
}
