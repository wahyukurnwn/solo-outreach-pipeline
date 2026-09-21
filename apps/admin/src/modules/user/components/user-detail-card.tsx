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
	return new Date(iso).toLocaleDateString("en-US", {
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
							? "User promoted to admin"
							: "Admin access revoked for this user",
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
							? "This user is now the public demo account"
							: "Demo status removed from this user",
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
						Joined {formatDate(user.createdAt)}
					</p>
				</div>
				<div className="flex items-center gap-2">
					<RoleBadge role={user.role} />
					{user.isDemo ? <Badge variant="warning">Demo account</Badge> : null}
				</div>
			</div>

			<div className="mt-6 border-t border-line pt-5">
				<p className="text-[13px] font-semibold text-ink-soft">Access role</p>
				<p className="mt-1 text-[13px] text-muted">
					{user.role === "ADMIN"
						? "This user has admin access to all data."
						: "This user can only access their own data."}
				</p>

				{isSelf ? (
					<p className="mt-3 text-[13px] text-faint">
						You can't change your own role here.
					</p>
				) : (
					<button
						type="button"
						onClick={handleToggleRole}
						disabled={updateRole.isPending}
						className="mt-3 inline-flex items-center gap-2 rounded-[10px] bg-ink px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-ink/90 disabled:opacity-50"
					>
						{updateRole.isPending ? <Loader /> : null}
						{user.role === "ADMIN" ? "Revoke admin access" : "Make admin"}
					</button>
				)}
			</div>

			<div className="mt-6 border-t border-line pt-5">
				<p className="text-[13px] font-semibold text-ink-soft">Demo account</p>
				<p className="mt-1 text-[13px] text-muted">
					{user.isDemo
						? "This account powers the public demo page (/demo)."
						: "Only one account can be the public demo at a time — enabling it here automatically disables it on any other user."}
				</p>

				<button
					type="button"
					onClick={handleToggleDemo}
					disabled={updateDemo.isPending}
					className={`mt-3 ${softButtonClassName}`}
				>
					{updateDemo.isPending ? <Loader /> : null}
					{user.isDemo ? "Remove demo status" : "Make demo account"}
				</button>
			</div>
		</Card>
	);
};
