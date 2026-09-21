import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { QueryError } from "#/components/query-error";
import {
	DemoLogTimeline,
	RoleLogTimeline,
	UserDetailCard,
	useUser,
} from "#/modules/user";

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
				Back to users
			</Link>

			{userQuery.error ? (
				<QueryError
					title="User couldn't be loaded"
					message={userQuery.error.message}
					onRetry={() => userQuery.refetch()}
				/>
			) : userQuery.data ? (
				<>
					<UserDetailCard user={userQuery.data} />
					<RoleLogTimeline userId={userQuery.data.id} />
					<DemoLogTimeline userId={userQuery.data.id} />
				</>
			) : (
				<div
					aria-busy="true"
					className="h-48 animate-pulse rounded-[20px] border border-line bg-white"
				/>
			)}
		</div>
	);
}
