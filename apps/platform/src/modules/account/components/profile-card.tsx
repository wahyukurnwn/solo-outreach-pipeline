import { Badge, Card } from "@mycustom/ui";
import { maskEmail } from "#/libs/email-format";
import type { Me } from "../types";

export const ProfileCard = ({ me }: { me: Me }) => (
	<Card className="flex flex-wrap items-center gap-4">
		<span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-lavender-100 text-lg font-bold text-lavender-700 uppercase">
			{me.email.charAt(0)}
		</span>
		<div className="min-w-0 flex-1">
			<p className="truncate text-base font-semibold text-ink">
				{maskEmail(me.email)}
			</p>
			<p className="text-[13px] text-muted">
				Used to sign in and to receive password reset links.
			</p>
		</div>
		<Badge variant={me.role === "ADMIN" ? "info" : "neutral"}>
			{me.role === "ADMIN" ? "Admin" : "User"}
		</Badge>
	</Card>
);
