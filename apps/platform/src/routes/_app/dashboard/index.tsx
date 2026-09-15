import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "#/components/page-header";
import {
	DashboardError,
	DashboardSkeleton,
	DashboardStats,
	FollowUpTodayCard,
	formatLongDate,
	greetingFor,
	StageBreakdownCard,
} from "#/modules/dashboard";
import { useFollowUps, useProspects } from "#/modules/prospect";

export const Route = createFileRoute("/_app/dashboard/")({
	component: DashboardPage,
});

function DashboardPage() {
	const now = new Date();

	return (
		<div className="flex flex-col gap-7 px-6 py-8 sm:px-12 sm:py-10">
			<PageHeader
				eyebrow={formatLongDate(now)}
				title={greetingFor(now)}
				description="Ini kondisi pipeline Anda hari ini."
			/>
			<DashboardContent />
		</div>
	);
}

function DashboardContent() {
	const prospectsQuery = useProspects();
	const followUpsQuery = useFollowUps();
	const error = prospectsQuery.error ?? followUpsQuery.error;

	if (error)
		return (
			<DashboardError
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
