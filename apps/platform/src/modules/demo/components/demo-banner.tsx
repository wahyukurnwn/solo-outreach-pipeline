import { Link } from "@tanstack/react-router";
import { ArrowRight, Eye } from "lucide-react";

export const DemoBanner = () => (
	<div className="sticky top-0 z-30 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 bg-ink px-4 py-2.5 text-center text-[13px] text-white/90">
		<span className="inline-flex items-center gap-1.5 font-medium">
			<Eye className="size-3.5 text-lavender-100" />
			This is sample data, view-only — it can't be edited or deleted.
		</span>
		<Link
			to="/auth/signin"
			search={{ tab: "signup" }}
			className="inline-flex items-center gap-1 font-semibold text-white underline-offset-2 hover:underline"
		>
			Create a free account
			<ArrowRight className="size-3.5" />
		</Link>
	</div>
);
