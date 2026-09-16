import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { QueryError } from "#/components/query-error";
import { UserDetailCard, useUser } from "#/modules/user";

export const Route = createFileRoute("/_app/users/$id/")({
	component: UserDetailPage,
});

function UserDetailPage() {
	const { id } = Route.useParams();
	const userQuery = useUser(id);

	return (
		<div className="flex flex-col gap-5">
			<Link
				to="/users"
				className="flex w-fit items-center gap-1.5 text-[13px] font-medium text-muted transition-colors hover:text-ink"
			>
				<ArrowLeft className="size-3.5" />
				Kembali ke daftar user
			</Link>

			{userQuery.error ? (
				<QueryError
					title="User tidak bisa dimuat"
					message={userQuery.error.message}
					onRetry={() => userQuery.refetch()}
				/>
			) : userQuery.data ? (
				<UserDetailCard user={userQuery.data} />
			) : (
				<div
					aria-busy="true"
					className="h-48 animate-pulse rounded-[20px] border border-line bg-white"
				/>
			)}
		</div>
	);
}
