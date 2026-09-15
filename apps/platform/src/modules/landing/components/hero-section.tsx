import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import {
	containerClassName,
	primaryCtaClassName,
	secondaryCtaClassName,
} from "../styles";
import { AppPreview } from "./app-preview";

export const HeroSection = () => (
	<section className="relative overflow-hidden">
		<div
			aria-hidden="true"
			className="glow-hero pointer-events-none absolute inset-x-0 top-0 h-[760px]"
		/>

		<div
			className={`${containerClassName} relative flex flex-col items-center pt-16 pb-12 text-center sm:pt-24 sm:pb-16`}
		>
			<span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-3 py-1 text-xs font-medium text-ink-soft shadow-[0_1px_2px_rgba(45,42,38,0.04)]">
				<Sparkles className="size-3.5 text-lavender-700" />
				Built for solo outbound — not for sales teams
			</span>

			<h1 className="mt-7 max-w-4xl text-[42px] leading-[1.02] font-bold tracking-[-0.045em] text-balance text-ink sm:text-[64px] lg:text-[76px]">
				Track every prospect
				<span className="block text-lavender-700">without the CRM bloat</span>
			</h1>

			<p className="mt-6 max-w-xl text-base leading-relaxed text-pretty text-muted sm:text-lg">
				A lightweight pipeline for people doing outbound alone. Log every
				prospect, draft personal follow-ups from real context, and see the
				numbers that tell you what&apos;s actually working.
			</p>

			<div className="mt-9 flex flex-wrap items-center justify-center gap-3">
				<Link to="/dashboard" className={primaryCtaClassName}>
					Open the app
					<ArrowRight className="size-4" />
				</Link>
				<a href="#how-it-works" className={secondaryCtaClassName}>
					See how it works
				</a>
			</div>

			<p className="mt-6 flex items-center gap-2 text-xs text-muted">
				<span className="size-1.5 rounded-full bg-lavender-700" />
				No team seats. No permissions. No billing tiers.
			</p>

			<div className="mt-16 w-full sm:mt-20">
				<AppPreview />
			</div>
		</div>
	</section>
);
