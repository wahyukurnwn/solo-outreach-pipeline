import { IconBox } from "@mycustom/ui";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Users } from "lucide-react";
import { useState } from "react";
import {
	inputClassName,
	primaryButtonClassName,
} from "#/components/form-styles";
import { PageHeader } from "#/components/page-header";
import { QueryError } from "#/components/query-error";
import {
	type Prospect,
	ProspectFormDialog,
	ProspectTable,
	StageFilter,
	stageOptions,
	useProspects,
} from "#/modules/prospect";

export const Route = createFileRoute("/_app/prospect/")({
	// `stage` opsional supaya semua <Link to="/prospect"> lain tidak wajib
	// mengirim search — pola yang sama dengan `tab` di route signin.
	validateSearch: (
		search: Record<string, unknown>,
	): { stage?: Prospect["stage"] } => {
		const stage = stageOptions.find((option) => option === search.stage);
		return stage ? { stage } : {};
	},
	component: ProspectPage,
});

function ProspectPage() {
	const [isCreateOpen, setIsCreateOpen] = useState(false);

	return (
		<div className="flex flex-col gap-7 px-6 py-8 sm:px-12 sm:py-10">
			<PageHeader
				title="Prospects"
				description="Everyone you're reaching out to, in one place."
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
			<ProspectDirectory onCreate={() => setIsCreateOpen(true)} />
			<ProspectFormDialog
				open={isCreateOpen}
				onClose={() => setIsCreateOpen(false)}
			/>
		</div>
	);
}

function ProspectDirectory({ onCreate }: { onCreate: () => void }) {
	const { stage } = Route.useSearch();
	const [keyword, setKeyword] = useState("");
	const prospectsQuery = useProspects();

	if (prospectsQuery.error)
		return (
			<QueryError
				title="Prospects failed to load"
				message={prospectsQuery.error.message}
				onRetry={() => prospectsQuery.refetch()}
			/>
		);

	if (!prospectsQuery.data) return <ProspectListSkeleton />;

	const prospects = prospectsQuery.data;

	if (prospects.length === 0) return <EmptyPipeline onCreate={onCreate} />;

	const normalizedKeyword = keyword.trim().toLowerCase();
	const visibleProspects = prospects.filter(
		(prospect) =>
			(!stage || prospect.stage === stage) &&
			(!normalizedKeyword ||
				prospect.name.toLowerCase().includes(normalizedKeyword) ||
				(prospect.company ?? "").toLowerCase().includes(normalizedKeyword)),
	);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
				<StageFilter prospects={prospects} activeStage={stage} />
				<label className="relative xl:w-64">
					<span className="sr-only">Search prospects</span>
					<Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint" />
					<input
						type="search"
						value={keyword}
						onChange={(event) => setKeyword(event.target.value)}
						placeholder="Search by name or company"
						className={`${inputClassName} pl-9`}
					/>
				</label>
			</div>

			{visibleProspects.length === 0 ? (
				<p className="rounded-[20px] border border-dashed border-line-strong px-6 py-10 text-center text-sm text-muted">
					No prospects match this filter.
				</p>
			) : (
				<ProspectTable prospects={visibleProspects} />
			)}
		</div>
	);
}

function ProspectListSkeleton() {
	return (
		<div aria-busy="true" className="flex flex-col gap-4">
			<span className="sr-only">Loading prospects…</span>
			<div className="h-8 w-2/3 animate-pulse rounded-full bg-sidebar" />
			<div className="h-80 animate-pulse rounded-[20px] border border-line bg-white" />
		</div>
	);
}

function EmptyPipeline({ onCreate }: { onCreate: () => void }) {
	return (
		<div className="flex flex-col items-center rounded-[20px] border border-line bg-white px-6 py-14 text-center">
			<IconBox tone="lavender" size="xl">
				<Users className="size-6" />
			</IconBox>
			<p className="mt-4 text-base font-bold text-ink">No prospects yet</p>
			<p className="mt-1 max-w-sm text-sm text-muted">
				Start with one person you've been meaning to reach out to. Thirty
				seconds, not a data-entry ritual.
			</p>
			<button
				type="button"
				onClick={onCreate}
				className={`${primaryButtonClassName} mt-6`}
			>
				<Plus className="size-4" />
				Add your first prospect
			</button>
		</div>
	);
}
