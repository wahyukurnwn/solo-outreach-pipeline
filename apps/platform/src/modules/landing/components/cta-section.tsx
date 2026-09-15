import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import {
	containerClassName,
	primaryCtaClassName,
	secondaryCtaClassName,
	sectionLeadClassName,
	sectionTitleClassName,
} from "../styles";

export const CtaSection = () => (
	<section className="py-20 sm:py-28">
		<div className={containerClassName}>
			<div className="relative overflow-hidden rounded-[32px] border border-line bg-white px-6 py-14 text-center shadow-[0_30px_70px_-40px_rgba(45,42,38,0.35)] sm:px-12 sm:py-20">
				<div
					aria-hidden="true"
					className="glow-cta pointer-events-none absolute inset-0"
				/>
				<div className="relative">
					<h2
						className={`mx-auto max-w-2xl text-balance ${sectionTitleClassName}`}
					>
						Your next follow-up is{" "}
						<span className="text-lavender-700">already late</span>
					</h2>
					<p className={`mx-auto mt-5 max-w-lg ${sectionLeadClassName}`}>
						Open the app, add the prospect you&apos;ve been meaning to write
						down, and let the due list carry it from here.
					</p>
					<div className="mt-9 flex flex-wrap items-center justify-center gap-3">
						<Link to="/dashboard" className={primaryCtaClassName}>
							Open the app
							<ArrowRight className="size-4" />
						</Link>
						<a href="#features" className={secondaryCtaClassName}>
							Read the feature list
						</a>
					</div>
				</div>
			</div>
		</div>
	</section>
);
