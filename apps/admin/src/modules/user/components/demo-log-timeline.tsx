import { Badge, Card, IconBox } from "@mycustom/ui";
import { History } from "lucide-react";
import { QueryError } from "#/components/query-error";
import { useDemoLogs } from "../hooks/use-demo-logs";

function formatDateTime(iso: string) {
	return new Date(iso).toLocaleString("id-ID", {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function DemoStatusBadge({ isDemo }: { isDemo: boolean }) {
	return (
		<Badge variant={isDemo ? "warning" : "neutral"}>
			{isDemo ? "Demo" : "Bukan demo"}
		</Badge>
	);
}

// Timeline "siapa mengubah status demo siapa" — termasuk efek samping saat
// menyalakan demo di satu user otomatis mematikannya di user lain (invariant
// backend: paling banyak satu is_demo=true), lihat admin.service.ts.
export const DemoLogTimeline = ({ userId }: { userId: string }) => {
	const logsQuery = useDemoLogs(userId);

	return (
		<Card className="p-6">
			<p className="text-[13px] font-semibold text-ink-soft">
				Riwayat status demo
			</p>

			{logsQuery.error ? (
				<div className="mt-3">
					<QueryError
						title="Riwayat gagal dimuat"
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
					Belum ada perubahan status demo yang tercatat untuk user ini.
				</p>
			) : (
				<ul className="mt-4 flex flex-col gap-4">
					{logsQuery.data.map((log) => (
						<li key={log.id} className="flex items-start gap-3">
							<IconBox size="sm" tone="peach">
								<History className="size-3.5" />
							</IconBox>
							<div className="min-w-0 flex-1">
								<p className="text-[13px] text-ink-soft">
									<span className="font-semibold text-ink">
										{log.actor.email}
									</span>{" "}
									mengubah status dari <DemoStatusBadge isDemo={log.fromDemo} />{" "}
									ke <DemoStatusBadge isDemo={log.toDemo} />
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
