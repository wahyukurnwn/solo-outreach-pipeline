import { Layers, Sheet, Target } from "lucide-react";
import {
	containerClassName,
	sectionLeadClassName,
	sectionTitleClassName,
} from "../styles";
import { SectionEyebrow } from "./section-eyebrow";

const options = [
	{
		icon: Sheet,
		title: "A spreadsheet",
		body: "Free and flexible, until it isn't. No reminders, no history per prospect, no idea which approach actually lands. Follow-ups live in your head — right up until they don't.",
		highlighted: false,
	},
	{
		icon: Layers,
		title: "A team CRM",
		body: "Permissions, seats, deal owners, billing tiers, pipeline automation rules. Ninety percent of it exists to coordinate a team you don't have.",
		highlighted: false,
	},
	{
		icon: Target,
		title: "This, instead",
		body: "One place to track prospects, see who is due today, and read honest response and conversion numbers. Sized for one person.",
		highlighted: true,
	},
];

export const GapSection = () => (
	<section id="why" className="scroll-mt-20 py-20 sm:py-28">
		<div className={containerClassName}>
			<div className="max-w-2xl">
				<SectionEyebrow>The gap</SectionEyebrow>
				<h2 className={`mt-5 ${sectionTitleClassName}`}>
					Two extremes, and
					<span className="block text-lavender-700">nothing in between</span>
				</h2>
				<p className={`mt-5 ${sectionLeadClassName}`}>
					Anyone prospecting alone ends up picking between a tool that does too
					little and one built for an org chart they don&apos;t have.
				</p>
			</div>

			<div className="mt-12 grid gap-4 md:grid-cols-3">
				{options.map(({ icon: Icon, title, body, highlighted }) => (
					<article
						key={title}
						className={`flex flex-col rounded-3xl p-6 sm:p-7 ${
							highlighted
								? "bg-ink text-white shadow-[0_28px_60px_-28px_rgba(45,42,38,0.7)]"
								: "border border-line bg-white shadow-[0_1px_2px_rgba(45,42,38,0.04)]"
						}`}
					>
						<span
							className={`flex size-10 items-center justify-center rounded-xl ${
								highlighted
									? "bg-white/10 text-white"
									: "bg-sidebar text-ink-soft"
							}`}
						>
							<Icon className="size-[18px]" />
						</span>
						<h3
							className={`mt-10 text-lg font-bold tracking-tight ${
								highlighted ? "text-white" : "text-ink"
							}`}
						>
							{title}
						</h3>
						<p
							className={`mt-2 text-sm leading-relaxed ${
								highlighted ? "text-white/70" : "text-muted"
							}`}
						>
							{body}
						</p>
					</article>
				))}
			</div>
		</div>
	</section>
);
