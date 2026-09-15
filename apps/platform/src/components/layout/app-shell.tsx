import { IconBox } from "@mycustom/ui";
import { Link } from "@tanstack/react-router";
import {
	ChartColumn,
	LayoutDashboard,
	LogOut,
	Menu,
	Settings,
	Users,
	X,
} from "lucide-react";
import { useState } from "react";
import { BrandMark } from "#/components/brand-mark";
import { useMe, useSignOut } from "#/modules/auth";

const navItems = [
	{
		to: "/dashboard",
		label: "Dashboard",
		icon: LayoutDashboard,
		tone: "lavender",
	},
	{ to: "/prospect", label: "Prospek", icon: Users, tone: "mint" },
	{ to: "/analytic", label: "Analitik", icon: ChartColumn, tone: "peach" },
] as const;

const navRowClassName =
	"flex items-center gap-2.5 rounded-xl px-2.5 py-[7px] text-sm transition-colors";

const activeNavClassName =
	"bg-white font-semibold text-ink shadow-[0_1px_2px_rgba(45,42,38,0.07)]";

const inactiveNavClassName =
	"font-medium text-muted hover:bg-white/60 hover:text-ink";

// Kelas aktif & non-aktif dipisah lewat activeProps/inactiveProps (bukan
// ditumpuk di className) supaya text-ink dan text-muted tidak pernah hadir
// bersamaan — urutan utility Tailwind di CSS tidak mengikuti urutan di string.
function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
	return (
		<nav className="flex flex-col gap-1">
			{navItems.map(({ to, label, icon: Icon, tone }) => (
				<Link
					key={to}
					to={to}
					onClick={onNavigate}
					className={navRowClassName}
					activeProps={{ className: activeNavClassName }}
					inactiveProps={{ className: inactiveNavClassName }}
				>
					<IconBox tone={tone} size="sm">
						<Icon className="size-3.5" />
					</IconBox>
					{label}
				</Link>
			))}
		</nav>
	);
}

function AccountFooter({ onNavigate }: { onNavigate?: () => void }) {
	const { data: me } = useMe();
	const signOut = useSignOut();

	return (
		<div className="flex flex-col gap-1 border-t border-line pt-3">
			{me ? (
				<div className="flex items-center gap-2.5 px-2.5 py-1.5">
					<span className="flex size-[26px] shrink-0 items-center justify-center rounded-lg bg-lavender-100 text-xs font-bold text-lavender-700 uppercase">
						{me.email.charAt(0)}
					</span>
					<span className="min-w-0 truncate text-[13px] text-ink-soft">
						{me.email}
					</span>
				</div>
			) : null}
			<Link
				to="/settings"
				onClick={onNavigate}
				className={navRowClassName}
				activeProps={{ className: activeNavClassName }}
				inactiveProps={{ className: inactiveNavClassName }}
			>
				<IconBox size="sm">
					<Settings className="size-3.5" />
				</IconBox>
				Pengaturan
			</Link>
			<button
				type="button"
				onClick={signOut}
				className={`${navRowClassName} ${inactiveNavClassName}`}
			>
				<IconBox size="sm">
					<LogOut className="size-3.5" />
				</IconBox>
				Keluar
			</button>
		</div>
	);
}

export const AppShell = ({ children }: { children: React.ReactNode }) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const closeMenu = () => setIsMenuOpen(false);

	return (
		<div className="min-h-screen bg-paper md:flex">
			<aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col justify-between bg-sidebar px-3.5 py-5 md:flex">
				<div className="flex flex-col gap-7">
					<Link to="/" className="rounded-xl px-1.5">
						<BrandMark withWordmark tagline="Ruang kerja pribadi" />
					</Link>
					<SidebarNav />
				</div>
				<AccountFooter />
			</aside>

			<header className="sticky top-0 z-30 border-b border-line bg-sidebar/90 backdrop-blur-md md:hidden">
				<div className="flex items-center justify-between px-4 py-3">
					<Link to="/">
						<BrandMark withWordmark />
					</Link>
					<button
						type="button"
						aria-label={isMenuOpen ? "Tutup menu" : "Buka menu"}
						aria-expanded={isMenuOpen}
						onClick={() => setIsMenuOpen((open) => !open)}
						className="flex size-9 items-center justify-center rounded-xl text-ink-soft transition-colors hover:bg-white"
					>
						{isMenuOpen ? (
							<X className="size-5" />
						) : (
							<Menu className="size-5" />
						)}
					</button>
				</div>
				{isMenuOpen ? (
					<div className="flex flex-col gap-3 px-3 pb-4">
						<SidebarNav onNavigate={closeMenu} />
						<AccountFooter onNavigate={closeMenu} />
					</div>
				) : null}
			</header>

			<main className="min-w-0 flex-1">{children}</main>
		</div>
	);
};
