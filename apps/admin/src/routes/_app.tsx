import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "#/components/layout/app-shell";
import { requireAuthenticated } from "#/modules/auth/guard";

export const Route = createFileRoute("/_app")({
	ssr: false,
	beforeLoad: requireAuthenticated,
	component: AppLayout,
});

function AppLayout() {
	return (
		<AppShell>
			<Outlet />
		</AppShell>
	);
}
