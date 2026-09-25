import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { primaryButtonClassName } from "#/components/form-styles";
import { PageHeader } from "#/components/page-header";
import { QueryError } from "#/components/query-error";
import { getEmailUsername } from "#/libs/email-format";
import { useMe } from "#/modules/auth";
import {
	DashboardSkeleton,
	DashboardStats,
	FollowUpTodayCard,
	formatLongDate,
	greetingFor,
	StageBreakdownCard,
} from "#/modules/dashboard";
import {
	ProspectFormDialog,
	useFollowUps,
	useProspects,
} from "#/modules/prospect";

export const Route = createFileRoute("/_app/dashboard/")({
	component: DashboardPage,
});

function DashboardPage() {
	const now = new Date();
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const meQuery = useMe();
	const username = meQuery.data ? getEmailUsername(meQuery.data.email) : null;

	return (
		<div className="flex flex-col gap-7 px-6 py-8 sm:px-12 sm:py-10">
			<PageHeader
				eyebrow={formatLongDate(now)}
				title={username ? `${greetingFor(now)}, ${username}` : greetingFor(now)}
				description="Here's where your pipeline stands today."
				action={
					<button
						type="button"
						onClick={() => setIsCreateOpen(true)}
						className={primaryButtonClassName}
					>
						<Plus className="size-4" />
						Add prospect
					</button>
				}
			/>
			<DashboardContent />
			<ProspectFormDialog
				open={isCreateOpen}
				onClose={() => setIsCreateOpen(false)}
			/>
		</div>
	);
}

function DashboardContent() {
	const prospectsQuery = useProspects();
	const followUpsQuery = useFollowUps();
	const error = prospectsQuery.error ?? followUpsQuery.error;

	if (error)
		return (
			<QueryError
				title="Failed to load dashboard"
				message={error.message}
				onRetry={() => {
					prospectsQuery.refetch();
					followUpsQuery.refetch();
				}}
			/>
		);

	if (!prospectsQuery.data || !followUpsQuery.data)
		return <DashboardSkeleton />;

	return (
		<div className="flex flex-col gap-7">
			<DashboardStats
				prospects={prospectsQuery.data}
				followUps={followUpsQuery.data}
			/>
			<div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
				<FollowUpTodayCard followUps={followUpsQuery.data} />
				<StageBreakdownCard prospects={prospectsQuery.data} />
			</div>
		</div>
	);
}
