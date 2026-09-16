import { Badge, type BadgeVariant } from "@mycustom/ui";

type Role = "USER" | "ADMIN";

const roleLabel: Record<Role, string> = {
	USER: "User",
	ADMIN: "Admin",
};

const roleVariant: Record<Role, BadgeVariant> = {
	USER: "neutral",
	ADMIN: "info",
};

// `role` diketik `string` (bukan `Role`) karena InferResponseType melebar
// jadi string biasa lewat serialisasi JSON — fallback ke "USER" menjaga
// badge tetap render kalau backend suatu saat menambah role baru.
export const RoleBadge = ({ role }: { role: string }) => {
	const normalizedRole = role === "ADMIN" ? "ADMIN" : ("USER" as Role);
	return (
		<Badge variant={roleVariant[normalizedRole]}>
			{roleLabel[normalizedRole]}
		</Badge>
	);
};
