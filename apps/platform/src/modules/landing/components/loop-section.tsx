import {
	containerClassName,
	sectionLeadClassName,
	sectionTitleClassName,
} from "../styles";
import { SectionEyebrow } from "./section-eyebrow";

const steps = [
	{
		title: "Capture the prospect",
		body: "Name, company, channel, and whatever context you have. It lands in New. Thirty seconds, not a data-entry ritual.",
	},
	{
		title: "Log what you actually did",
		body: "Sent, replied, or no response — every outreach becomes an activity, and each prospect's history stays chronological.",
	},
	{
		title: "Let the numbers correct you",
		body: "Open analytics when you're deciding what to change. Response and conversion rates come from the activity log — nothing is self-reported.",
	},
];

export const LoopSection = () => (
	<section id="how-it-works" className="scroll-mt-20 py-20 sm:py-28">
		<div
			className={`${containerClassName} grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16`}
		>
			<div className="lg:sticky lg:top-28 lg:self-start">
				<SectionEyebrow tone="mint">The loop</SectionEyebrow>
				<h2 className={`mt-5 ${sectionTitleClassName}`}>
					Three steps, <span className="text-lavender-700">repeated</span>
				</h2>
				<p className={`mt-5 max-w-md ${sectionLeadClassName}`}>
					The whole product is one loop. If a feature didn&apos;t make this loop
					tighter, it didn&apos;t ship.
				</p>
			</div>

			<ol className="flex flex-col gap-3">
				{steps.map((step, index) => (
					<li
						key={step.title}
						className="flex gap-5 rounded-3xl border border-line bg-white p-6 shadow-[0_1px_2px_rgba(45,42,38,0.04)] sm:p-7"
					>
						<span className="text-2xl font-bold tracking-tight text-line-strong tabular-nums">
							{String(index + 1).padStart(2, "0")}
						</span>
						<div>
							<h3 className="text-base font-bold text-ink sm:text-lg">
								{step.title}
							</h3>
							<p className="mt-1.5 text-sm leading-relaxed text-muted">
								{step.body}
							</p>
						</div>
					</li>
				))}
			</ol>
		</div>
	</section>
);
