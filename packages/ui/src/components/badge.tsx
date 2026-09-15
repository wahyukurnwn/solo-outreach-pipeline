export type BadgeVariant =
	| "neutral"
	| "info"
	| "success"
	| "warning"
	| "danger";

interface BadgeProps {
	children: React.ReactNode;
	variant?: BadgeVariant;
}

// Badge cuma tahu warna & teks — tidak pernah tahu ARTI di baliknya
// (mis. "overdue" atau "stage"). Keputusan mapping ke `variant` yang mana
// itu tanggung jawab feature component pemanggilnya.
const variantClasses: Record<BadgeVariant, string> = {
	neutral: "bg-sidebar text-ink-soft",
	info: "bg-cloud-50 text-cloud-700",
	success: "bg-mint-50 text-mint-700",
	warning: "bg-sand-50 text-sand-700",
	danger: "bg-blush-50 text-blush-700",
};

export const Badge = ({ children, variant = "neutral" }: BadgeProps) => (
	<span
		className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${variantClasses[variant]}`}
	>
		{children}
	</span>
);
