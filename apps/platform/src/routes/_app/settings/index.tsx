import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "#/components/page-header";
import { QueryError } from "#/components/query-error";
import {
	ChangePasswordCard,
	LoginMethodsCard,
	ProfileCard,
} from "#/modules/account";
import { useMe } from "#/modules/auth";

export const Route = createFileRoute("/_app/settings/")({
	component: SettingsPage,
});

function SettingsPage() {
	return (
		<div className="flex flex-col gap-7 px-6 py-8 sm:px-12 sm:py-10">
			<PageHeader
				title="Account settings"
				description="Manage how you sign in and keep your account secure."
			/>
			<SettingsContent />
		</div>
	);
}

function SettingsContent() {
	const meQuery = useMe();

	if (meQuery.error)
		return (
			<QueryError
				title="Settings failed to load"
				message={meQuery.error.message}
				onRetry={() => meQuery.refetch()}
			/>
		);

	// useMe mengembalikan null kalau token sudah tidak berlaku (dan token basinya
	// sudah dibersihkan), jadi yang tepat di sini adalah minta login ulang.
	if (meQuery.data === null)
		return (
			<p className="rounded-[20px] border border-line bg-white px-5 py-4 text-sm text-muted">
				Your session has ended.{" "}
				<Link
					to="/auth/signin"
					className="font-semibold text-ink transition-colors hover:text-lavender-700"
				>
					Sign in again
				</Link>
			</p>
		);

	if (!meQuery.data) return <SettingsSkeleton />;

	const me = meQuery.data;

	return (
		<div className="flex max-w-3xl flex-col gap-5">
			<ProfileCard me={me} />
			<LoginMethodsCard me={me} />
			{me.hasPassword ? <ChangePasswordCard /> : null}
		</div>
	);
}

function SettingsSkeleton() {
	return (
		<div aria-busy="true" className="flex max-w-3xl flex-col gap-5">
			<span className="sr-only">Loading settings…</span>
			<div className="h-24 animate-pulse rounded-[20px] border border-line bg-white" />
			<div className="h-56 animate-pulse rounded-[20px] border border-line bg-white" />
			<div className="h-72 animate-pulse rounded-[20px] border border-line bg-white" />
		</div>
	);
}
