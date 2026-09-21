import { Link } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { BrandMark } from "#/components/brand-mark";
import { useMe } from "#/modules/auth/hooks/use-me";
import { useSignOut } from "#/modules/auth/hooks/use-sign-out";

// Konsol admin cuma punya satu bagian (kelola users), jadi tidak perlu
// sidebar navigasi seperti apps/platform — cukup top bar dengan identitas
// akun & tombol keluar.
export const AppShell = ({ children }: { children: React.ReactNode }) => {
	const { data: me } = useMe();
	const signOut = useSignOut();

	return (
		<div className="min-h-screen bg-paper">
			<header className="sticky top-0 z-30 border-b border-line bg-sidebar/90 backdrop-blur-md">
				<div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
					<Link to="/users">
						<BrandMark withWordmark />
					</Link>
					<div className="flex items-center gap-3">
						{me ? (
							<span className="hidden text-[13px] text-ink-soft sm:inline">
								{me.email}
							</span>
						) : null}
						<button
							type="button"
							onClick={signOut}
							className="flex items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 text-[13px] font-medium text-muted transition-colors hover:bg-white hover:text-ink"
						>
							<LogOut className="size-3.5" />
							Sign out
						</button>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
		</div>
	);
};
