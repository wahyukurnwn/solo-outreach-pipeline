import { StatCard } from "@mycustom/ui";
import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare, Send, Trophy, Users } from "lucide-react";
import { PageHeader } from "#/components/page-header";
import { QueryError } from "#/components/query-error";
import {
	ChannelBreakdownCard,
	formatRate,
	SMALL_SAMPLE_SIZE,
	StageDistributionCard,
	useAnalytics,
} from "#/modules/analytic";

export const Route = createFileRoute("/_app/analytic/")({
	component: AnalyticPage,
});

function AnalyticPage() {
	return (
		<div className="flex flex-col gap-7 px-6 py-8 sm:px-12 sm:py-10">
			<PageHeader
				title="Analytics"
				description="Response and conversion rates, calculated directly from your activity history."
			/>
			<AnalyticsContent />
		</div>
	);
}

function AnalyticsContent() {
	const analyticsQuery = useAnalytics();

	if (analyticsQuery.error)
		return (
			<QueryError
				title="Analytics failed to load"
				message={analyticsQuery.error.message}
				onRetry={() => analyticsQuery.refetch()}
			/>
		);

	if (!analyticsQuery.data) return <AnalyticsSkeleton />;

	const analytics = analyticsQuery.data;
	const hasContacted = analytics.contacted > 0;

	return (
		<div className="flex flex-col gap-7">
			{hasContacted && analytics.contacted < SMALL_SAMPLE_SIZE ? (
				<p className="rounded-2xl bg-sand-50 px-4.5 py-3.5 text-[13px] leading-relaxed text-sand-700">
					Small sample ({analytics.contacted} prospects contacted) — the rates
					below can still shift a lot. Treat them as a hint, not a conclusion.
				</p>
			) : null}

			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				<StatCard
					label="Response rate"
					value={formatRate(analytics.responseRate)}
					subtitle={
						hasContacted
							? `${analytics.replied} of ${analytics.contacted} contacted prospects replied`
							: "No prospects contacted yet"
					}
					tone="mint"
					icon={<MessageSquare className="size-4" />}
				/>
				<StatCard
					label="Conversion rate"
					value={formatRate(analytics.conversionRate)}
					subtitle={
						hasContacted
							? `${analytics.won} of ${analytics.contacted} became Closed Won`
							: "No prospects contacted yet"
					}
					tone="cloud"
					icon={<Trophy className="size-4" />}
				/>
				<StatCard
					label="Contacted"
					value={analytics.contacted}
					subtitle={`of ${analytics.totalProspects} prospects`}
					tone="lavender"
					icon={<Send className="size-4" />}
				/>
				<StatCard
					label="Not contacted"
					value={analytics.totalProspects - analytics.contacted}
					subtitle="No activity logged yet"
					tone="peach"
					icon={<Users className="size-4" />}
				/>
			</div>

			<div className="grid items-start gap-5 lg:grid-cols-2">
				<ChannelBreakdownCard channels={analytics.channels} />
				<StageDistributionCard
					stages={analytics.stages}
					total={analytics.totalProspects}
				/>
			</div>

			<p className="text-xs leading-relaxed text-faint">
				Response rate = prospects that replied ÷ prospects with at least one
				activity. Conversion rate = Closed Won prospects that were ever
				contacted ÷ prospects with at least one activity.
			</p>
		</div>
	);
}

function AnalyticsSkeleton() {
	return (
		<div aria-busy="true" className="flex flex-col gap-7">
			<span className="sr-only">Loading analytics…</span>
			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				<div className="h-[148px] animate-pulse rounded-[20px] bg-mint-50" />
				<div className="h-[148px] animate-pulse rounded-[20px] bg-cloud-50" />
				<div className="h-[148px] animate-pulse rounded-[20px] bg-lavender-50" />
				<div className="h-[148px] animate-pulse rounded-[20px] bg-peach-50" />
			</div>
			<div className="grid items-start gap-5 lg:grid-cols-2">
				<div className="h-72 animate-pulse rounded-[20px] border border-line bg-white" />
				<div className="h-72 animate-pulse rounded-[20px] border border-line bg-white" />
			</div>
		</div>
	);
}
