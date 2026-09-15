import { Link } from "@tanstack/react-router";
import { BrandMark } from "#/components/brand-mark";
import { containerClassName } from "../styles";

export const LandingFooter = () => (
	<footer className="border-t border-line">
		<div
			className={`${containerClassName} flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between`}
		>
			<div className="flex items-center gap-3">
				<BrandMark size="sm" />
				<p className="text-sm text-muted">
					<span className="font-semibold text-ink">Pipeline</span> — solo
					outreach tracker
				</p>
			</div>
			<nav className="flex items-center gap-5 text-sm text-muted">
				<a href="#features" className="transition-colors hover:text-ink">
					Features
				</a>
				<a href="#stack" className="transition-colors hover:text-ink">
					Stack
				</a>
				<Link to="/dashboard" className="transition-colors hover:text-ink">
					Open the app
				</Link>
			</nav>
		</div>
	</footer>
);
