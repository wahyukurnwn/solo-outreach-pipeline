import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "#/components/brand-mark";
import { PageHeader } from "#/components/page-header";
import { QueryError } from "#/components/query-error";
import {
	ChannelBreakdownCard,
	StageDistributionCard,
} from "#/modules/analytic";
import { DashboardStats } from "#/modules/dashboard";
import {
	DemoBanner,
	DemoProspectTable,
	useDemoAnalytics,
	useDemoFollowUps,
	useDemoProspects,
} from "#/modules/demo";

export const Route = createFileRoute("/demo/")({ component: DemoPage });

function DemoPage() {
	return (
		<div className="min-h-screen bg-paper">
			<DemoBanner />
			<div className="border-b border-line bg-white/60 px-4 py-3 sm:px-8">
				<Link to="/">
					<BrandMark withWordmark />
				</Link>
			</div>

			<div className="mx-auto flex max-w-6xl flex-col gap-7 px-4 py-8 sm:px-8 sm:py-10">
				<PageHeader
					title="Contoh pipeline"
					description="The data below is sample data, not your account — explore freely, nothing can change."
					action={
						<Link
							to="/"
							className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted transition-colors hover:text-ink"
						>
							<ArrowLeft className="size-3.5" />
							Back to home
						</Link>
					}
				/>
				<DemoContent />
			</div>
		</div>
	);
}

function DemoContent() {
	const prospectsQuery = useDemoProspects();
	const followUpsQuery = useDemoFollowUps();
	const analyticsQuery = useDemoAnalytics();
	const error =
		prospectsQuery.error ?? followUpsQuery.error ?? analyticsQuery.error;

	if (error)
		return (
			<QueryError
				title="Demo unavailable"
				message={error.message}
				onRetry={() => {
					prospectsQuery.refetch();
					followUpsQuery.refetch();
					analyticsQuery.refetch();
				}}
			/>
		);

	if (!prospectsQuery.data || !followUpsQuery.data || !analyticsQuery.data)
		return <DemoSkeleton />;

	return (
		<div className="flex flex-col gap-7">
			<DashboardStats
				prospects={prospectsQuery.data}
				followUps={followUpsQuery.data}
			/>
			<div className="grid items-start gap-5 lg:grid-cols-2">
				<ChannelBreakdownCard channels={analyticsQuery.data.channels} />
				<StageDistributionCard
					stages={analyticsQuery.data.stages}
					total={analyticsQuery.data.totalProspects}
				/>
			</div>
			<DemoProspectTable prospects={prospectsQuery.data} />
		</div>
	);
}

function DemoSkeleton() {
	return (
		<div aria-busy="true" className="flex flex-col gap-7">
			<span className="sr-only">Loading demo…</span>
			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				<div className="h-[148px] animate-pulse rounded-[20px] bg-lavender-50" />
				<div className="h-[148px] animate-pulse rounded-[20px] bg-peach-50" />
				<div className="h-[148px] animate-pulse rounded-[20px] bg-mint-50" />
				<div className="h-[148px] animate-pulse rounded-[20px] bg-cloud-50" />
			</div>
			<div className="h-80 animate-pulse rounded-[20px] border border-line bg-white" />
		</div>
	);
}
