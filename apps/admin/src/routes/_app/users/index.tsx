import { IconBox } from "@mycustom/ui";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Users as UsersIcon } from "lucide-react";
import { useState } from "react";
import { inputClassName } from "#/components/form-styles";
import { PageHeader } from "#/components/page-header";
import { QueryError } from "#/components/query-error";
import { UserTable, useUsers } from "#/modules/user";

export const Route = createFileRoute("/_app/users/")({
	component: UsersPage,
});

function UsersPage() {
	return (
		<div className="flex flex-col gap-7">
			<PageHeader
				title="Users"
				description="Kelola akun dan role akses ke aplikasi."
			/>
			<UserDirectory />
		</div>
	);
}

function UserDirectory() {
	const [keyword, setKeyword] = useState("");
	const usersQuery = useUsers();

	if (usersQuery.error)
		return (
			<QueryError
				title="Daftar user gagal dimuat"
				message={usersQuery.error.message}
				onRetry={() => usersQuery.refetch()}
			/>
		);

	if (!usersQuery.data) return <UserListSkeleton />;

	const users = usersQuery.data;

	if (users.length === 0) return <EmptyUsers />;

	const normalizedKeyword = keyword.trim().toLowerCase();
	const visibleUsers = users.filter(
		(user) =>
			!normalizedKeyword ||
			user.email.toLowerCase().includes(normalizedKeyword),
	);

	return (
		<div className="flex flex-col gap-4">
			<label className="relative sm:w-72">
				<span className="sr-only">Cari email</span>
				<Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint" />
				<input
					type="search"
					value={keyword}
					onChange={(event) => setKeyword(event.target.value)}
					placeholder="Cari email"
					className={`${inputClassName} pl-9`}
				/>
			</label>

			{visibleUsers.length === 0 ? (
				<p className="rounded-[20px] border border-dashed border-line-strong px-6 py-10 text-center text-sm text-muted">
					Tidak ada user yang cocok dengan pencarian ini.
				</p>
			) : (
				<UserTable users={visibleUsers} />
			)}
		</div>
	);
}

function UserListSkeleton() {
	return (
		<div aria-busy="true" className="flex flex-col gap-4">
			<span className="sr-only">Memuat daftar user…</span>
			<div className="h-9 w-72 animate-pulse rounded-xl bg-sidebar" />
			<div className="h-80 animate-pulse rounded-[20px] border border-line bg-white" />
		</div>
	);
}

function EmptyUsers() {
	return (
		<div className="flex flex-col items-center rounded-[20px] border border-line bg-white px-6 py-14 text-center">
			<IconBox tone="lavender" size="xl">
				<UsersIcon className="size-6" />
			</IconBox>
			<p className="mt-4 text-base font-bold text-ink">Belum ada user</p>
			<p className="mt-1 max-w-sm text-sm text-muted">
				User akan muncul di sini setelah mendaftar di aplikasi utama.
			</p>
		</div>
	);
}
