import { Badge } from "@mycustom/ui";
import { Link } from "@tanstack/react-router";
import type { UserSummary } from "../types";
import { RoleBadge } from "./role-badge";

const columnsClassName =
	"md:grid-cols-[minmax(0,2fr)_minmax(0,0.6fr)_minmax(0,0.6fr)_minmax(0,0.8fr)]";

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString("id-ID", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

export const UserTable = ({ users }: { users: UserSummary[] }) => (
	<div className="overflow-hidden rounded-[20px] border border-line bg-white">
		<div
			className={`hidden gap-4 border-b border-line bg-subtle px-5 py-2.5 text-[11px] font-bold tracking-[0.08em] text-faint uppercase md:grid ${columnsClassName}`}
		>
			<span>Email</span>
			<span>Role</span>
			<span>Demo</span>
			<span>Terdaftar</span>
		</div>

		<ul className="divide-y divide-line">
			{users.map((user) => (
				<li key={user.id}>
					<Link
						to="/users/$id"
						params={{ id: user.id }}
						className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5 transition-colors hover:bg-subtle md:gap-4 ${columnsClassName}`}
					>
						<p className="min-w-0 truncate text-sm font-semibold text-ink">
							{user.email}
						</p>
						<div>
							<RoleBadge role={user.role} />
						</div>
						<div className="hidden md:block">
							{user.isDemo ? (
								<Badge variant="warning">Demo</Badge>
							) : (
								<span className="text-sm text-faint">—</span>
							)}
						</div>
						<span className="hidden text-sm text-ink-soft md:block">
							{formatDate(user.createdAt)}
						</span>
					</Link>
				</li>
			))}
		</ul>
	</div>
);
