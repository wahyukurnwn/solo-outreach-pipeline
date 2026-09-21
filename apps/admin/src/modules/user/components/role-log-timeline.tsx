import { Card, IconBox } from "@mycustom/ui";
import { History } from "lucide-react";
import { QueryError } from "#/components/query-error";
import { useRoleLogs } from "../hooks/use-role-logs";
import { RoleBadge } from "./role-badge";

function formatDateTime(iso: string) {
	return new Date(iso).toLocaleString("en-US", {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

// Timeline "siapa mengubah role siapa" — dibuat komponen terpisah dari
// UserDetailCard supaya loading/error-nya sendiri, tidak memblokir render
// kartu utama yang datanya sudah tersedia lebih dulu dari route loader.
export const RoleLogTimeline = ({ userId }: { userId: string }) => {
	const logsQuery = useRoleLogs(userId);

	return (
		<Card className="p-6">
			<p className="text-[13px] font-semibold text-ink-soft">
				Role change history
			</p>

			{logsQuery.error ? (
				<div className="mt-3">
					<QueryError
						title="History failed to load"
						message={logsQuery.error.message}
						onRetry={() => logsQuery.refetch()}
					/>
				</div>
			) : !logsQuery.data ? (
				<div
					aria-busy="true"
					className="mt-3 h-16 animate-pulse rounded-xl bg-sidebar"
				/>
			) : logsQuery.data.length === 0 ? (
				<p className="mt-3 text-[13px] text-muted">
					No role changes recorded for this user yet.
				</p>
			) : (
				<ul className="mt-4 flex flex-col gap-4">
					{logsQuery.data.map((log) => (
						<li key={log.id} className="flex items-start gap-3">
							<IconBox size="sm" tone="lavender">
								<History className="size-3.5" />
							</IconBox>
							<div className="min-w-0 flex-1">
								<p className="text-[13px] text-ink-soft">
									<span className="font-semibold text-ink">
										{log.actor.email}
									</span>{" "}
									changed the role from <RoleBadge role={log.fromRole} /> to{" "}
									<RoleBadge role={log.toRole} />
								</p>
								<p className="mt-1 text-xs text-faint">
									{formatDateTime(log.createdAt)}
								</p>
							</div>
						</li>
					))}
				</ul>
			)}
		</Card>
	);
};
