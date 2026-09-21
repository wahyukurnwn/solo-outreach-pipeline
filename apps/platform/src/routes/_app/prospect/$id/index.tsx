import { AlertDialog } from "@mycustom/ui";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Pencil, Trash } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import {
	dangerSoftButtonClassName,
	softButtonClassName,
} from "#/components/form-styles";
import { QueryError } from "#/components/query-error";
import { ActivityLogForm, ActivityTimeline } from "#/modules/activity";
import {
	ProspectAvatar,
	ProspectFormDialog,
	ProspectNotes,
	ProspectProperties,
	useDeleteProspect,
	useProspect,
} from "#/modules/prospect";

export const Route = createFileRoute("/_app/prospect/$id/")({
	component: ProspectDetailPage,
});

function ProspectDetailPage() {
	const { id } = Route.useParams();

	return (
		<div className="flex flex-col gap-6 px-6 py-7 sm:px-12 sm:pb-12 lg:px-16">
			<ProspectDetailContent id={id} />
		</div>
	);
}

// Halaman aktivitas disusun di route (bukan di modules/prospect) supaya
// modules/prospect tidak perlu mengimpor modules/activity — activity sudah
// bergantung ke prospect, jadi arah sebaliknya akan membuat import melingkar.
function ProspectDetailContent({ id }: { id: string }) {
	const navigate = useNavigate();
	const prospectQuery = useProspect(id);
	const deleteProspect = useDeleteProspect();
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	if (prospectQuery.error)
		return (
			<>
				<Breadcrumb />
				<QueryError
					title="Prospect couldn't be loaded"
					message={prospectQuery.error.message}
					onRetry={() => prospectQuery.refetch()}
				/>
			</>
		);

	if (!prospectQuery.data) return <ProspectDetailSkeleton />;

	const prospect = prospectQuery.data;

	function handleDelete() {
		if (deleteProspect.isPending) return;

		deleteProspect.mutate(prospect.id, {
			onSuccess: () => {
				toast.success("Prospect deleted");
				navigate({ to: "/prospect" });
			},
			onError: (err) => {
				toast.error(err.message);
				setIsDeleteOpen(false);
			},
		});
	}

	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-3">
				<Breadcrumb name={prospect.name} />
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => setIsEditOpen(true)}
						className={softButtonClassName}
					>
						<Pencil className="size-3.5" />
						Edit
					</button>
					<button
						type="button"
						onClick={() => setIsDeleteOpen(true)}
						className={dangerSoftButtonClassName}
					>
						<Trash className="size-3.5" />
						Delete
					</button>
				</div>
			</div>

			<div className="flex flex-col gap-4">
				<ProspectAvatar prospect={prospect} size="lg" />
				<h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
					{prospect.name}
				</h1>
			</div>

			<ProspectProperties prospect={prospect} />

			{prospect.notes ? <ProspectNotes notes={prospect.notes} /> : null}

			<div className="h-px bg-line" />

			<div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
				<ActivityLogForm prospect={prospect} />
				<ActivityTimeline prospectId={prospect.id} />
			</div>

			<ProspectFormDialog
				open={isEditOpen}
				onClose={() => setIsEditOpen(false)}
				prospect={prospect}
			/>
			<AlertDialog
				open={isDeleteOpen}
				title="Delete this prospect?"
				description={`${prospect.name} and all of their activity history will be permanently deleted.`}
				confirmLabel={deleteProspect.isPending ? "Deleting..." : "Delete"}
				onConfirm={handleDelete}
				onCancel={() => setIsDeleteOpen(false)}
			/>
		</>
	);
}

function Breadcrumb({ name }: { name?: string }) {
	return (
		<nav
			aria-label="Breadcrumb"
			className="flex min-w-0 items-center gap-2 text-[13px] text-muted"
		>
			<Link to="/prospect" className="transition-colors hover:text-ink">
				Prospects
			</Link>
			{name ? (
				<>
					<span className="text-faint">/</span>
					<span className="truncate font-medium text-ink">{name}</span>
				</>
			) : null}
		</nav>
	);
}

function ProspectDetailSkeleton() {
	return (
		<div aria-busy="true" className="flex flex-col gap-6">
			<span className="sr-only">Loading prospect…</span>
			<div className="h-5 w-40 animate-pulse rounded-full bg-sidebar" />
			<div className="size-[72px] animate-pulse rounded-[22px] bg-sidebar" />
			<div className="h-9 w-72 max-w-full animate-pulse rounded-xl bg-sidebar" />
			<div className="h-44 animate-pulse rounded-2xl bg-sidebar/70" />
		</div>
	);
}
