import { createFileRoute, Link } from "@tanstack/react-router";
import { BrandMark } from "#/components/brand-mark";
import { QueryError } from "#/components/query-error";
import {
	DemoActivityTimeline,
	DemoBanner,
	useDemoActivities,
	useDemoProspect,
} from "#/modules/demo";
import {
	ProspectAvatar,
	ProspectNotes,
	ProspectProperties,
} from "#/modules/prospect";

export const Route = createFileRoute("/demo/$id/")({
	component: DemoProspectDetailPage,
});

function DemoProspectDetailPage() {
	return (
		<div className="min-h-screen bg-paper">
			<DemoBanner />
			<div className="border-b border-line bg-white/60 px-4 py-3 sm:px-8">
				<Link to="/">
					<BrandMark withWordmark />
				</Link>
			</div>

			<div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-7 sm:px-8 sm:pb-12">
				<DemoProspectContent />
			</div>
		</div>
	);
}

function DemoProspectContent() {
	const { id } = Route.useParams();
	const prospectQuery = useDemoProspect(id);
	const activitiesQuery = useDemoActivities(id);

	return (
		<>
			<nav
				aria-label="Breadcrumb"
				className="flex items-center gap-2 text-[13px] text-muted"
			>
				<Link to="/demo" className="transition-colors hover:text-ink">
					Sample pipeline
				</Link>
				{prospectQuery.data ? (
					<>
						<span className="text-faint">/</span>
						<span className="truncate font-medium text-ink">
							{prospectQuery.data.name}
						</span>
					</>
				) : null}
			</nav>

			{prospectQuery.error ? (
				<QueryError
					title="Demo prospect not found"
					message={prospectQuery.error.message}
					onRetry={() => prospectQuery.refetch()}
				/>
			) : !prospectQuery.data ? (
				<div aria-busy="true" className="flex flex-col gap-4">
					<span className="sr-only">Loading prospect…</span>
					<div className="size-[72px] animate-pulse rounded-[22px] bg-sidebar" />
					<div className="h-9 w-72 max-w-full animate-pulse rounded-xl bg-sidebar" />
				</div>
			) : (
				<>
					<div className="flex flex-col gap-4">
						<ProspectAvatar prospect={prospectQuery.data} size="lg" />
						<h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
							{prospectQuery.data.name}
						</h1>
					</div>

					<ProspectProperties prospect={prospectQuery.data} />

					{prospectQuery.data.notes ? (
						<ProspectNotes notes={prospectQuery.data.notes} />
					) : null}

					<div className="h-px bg-line" />

					<DemoActivityTimeline activities={activitiesQuery.data} />
				</>
			)}
		</>
	);
}
