import { Badge, Card } from "@mycustom/ui";
import toast from "react-hot-toast";
import { softButtonClassName } from "#/components/form-styles";
import { Loader } from "#/components/loader";
import { useMe } from "../../auth/hooks/use-me";
import { useUpdateUserDemo } from "../hooks/use-update-user-demo";
import { useUpdateUserRole } from "../hooks/use-update-user-role";
import type { UserSummary } from "../types";
import { RoleBadge } from "./role-badge";

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString("id-ID", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

export const UserDetailCard = ({ user }: { user: UserSummary }) => {
	const { data: me } = useMe();
	const updateRole = useUpdateUserRole(user.id);
	const updateDemo = useUpdateUserDemo(user.id);
	const isSelf = me?.id === user.id;

	function handleToggleRole() {
		const nextRole = user.role === "ADMIN" ? "USER" : "ADMIN";
		updateRole.mutate(
			{ role: nextRole },
			{
				onSuccess: () =>
					toast.success(
						nextRole === "ADMIN"
							? "User dipromosikan menjadi admin"
							: "Akses admin dicabut dari user ini",
					),
				onError: (err) => toast.error(err.message),
			},
		);
	}

	function handleToggleDemo() {
		const nextIsDemo = !user.isDemo;
		updateDemo.mutate(
			{ isDemo: nextIsDemo },
			{
				onSuccess: () =>
					toast.success(
						nextIsDemo
							? "User ini sekarang jadi akun demo publik"
							: "Status demo dicabut dari user ini",
					),
				onError: (err) => toast.error(err.message),
			},
		);
	}

	return (
		<Card className="p-6">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<p className="text-lg font-semibold text-ink">{user.email}</p>
					<p className="mt-1 text-sm text-muted">
						Terdaftar {formatDate(user.createdAt)}
					</p>
				</div>
				<div className="flex items-center gap-2">
					<RoleBadge role={user.role} />
					{user.isDemo ? <Badge variant="warning">Akun Demo</Badge> : null}
				</div>
			</div>

			<div className="mt-6 border-t border-line pt-5">
				<p className="text-[13px] font-semibold text-ink-soft">Role akses</p>
				<p className="mt-1 text-[13px] text-muted">
					{user.role === "ADMIN"
						? "User ini punya akses admin ke seluruh data."
						: "User ini hanya bisa mengakses data miliknya sendiri."}
				</p>

				{isSelf ? (
					<p className="mt-3 text-[13px] text-faint">
						Tidak bisa mengubah role akun sendiri dari sini.
					</p>
				) : (
					<button
						type="button"
						onClick={handleToggleRole}
						disabled={updateRole.isPending}
						className="mt-3 inline-flex items-center gap-2 rounded-[10px] bg-ink px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-ink/90 disabled:opacity-50"
					>
						{updateRole.isPending ? <Loader /> : null}
						{user.role === "ADMIN" ? "Cabut akses admin" : "Jadikan admin"}
					</button>
				)}
			</div>

			<div className="mt-6 border-t border-line pt-5">
				<p className="text-[13px] font-semibold text-ink-soft">Akun demo</p>
				<p className="mt-1 text-[13px] text-muted">
					{user.isDemo
						? "Akun ini yang dipakai oleh halaman demo publik (/demo)."
						: "Hanya satu akun bisa jadi demo publik dalam satu waktu — menyalakan di sini otomatis mematikan demo user lain."}
				</p>

				<button
					type="button"
					onClick={handleToggleDemo}
					disabled={updateDemo.isPending}
					className={`mt-3 ${softButtonClassName}`}
				>
					{updateDemo.isPending ? <Loader /> : null}
					{user.isDemo ? "Cabut status demo" : "Jadikan akun demo"}
				</button>
			</div>
		</Card>
	);
};
