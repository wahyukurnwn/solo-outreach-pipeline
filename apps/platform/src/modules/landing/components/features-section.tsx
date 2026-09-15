import { IconBox, type Tone } from "@mycustom/ui";
import {
	ChartColumn,
	Clock,
	type LucideIcon,
	NotebookPen,
	ShieldCheck,
	Users,
	WandSparkles,
} from "lucide-react";
import {
	containerClassName,
	sectionLeadClassName,
	sectionTitleClassName,
} from "../styles";
import { SectionEyebrow } from "./section-eyebrow";

interface Feature {
	eyebrow: string;
	icon: LucideIcon;
	tone: Tone | "dark";
	title: string;
	body: string;
	span: string;
}

// Klaim fitur diselaraskan dengan ERD/PRD: stage bebas berpindah tanpa state
// machine, rate dihitung on-the-fly dari activities, draft AI stateless dan
// tidak pernah terkirim otomatis.
const features: Feature[] = [
	{
		eyebrow: "Pipeline",
		icon: Users,
		tone: "lavender",
		title: "Six stages, no ceremony",
		body: "New → Contacted → Replied → Call scheduled → Won or Lost. Move a prospect anywhere, any time — the stage follows what actually happened, not a rigid funnel.",
		span: "md:col-span-3",
	},
	{
		eyebrow: "Follow-ups",
		icon: Clock,
		tone: "peach",
		title: "A list that tells you what to do today",
		body: "Set a follow-up date and forget it. Anything due or overdue surfaces the moment you open the app — no background jobs, no notifications to ignore.",
		span: "md:col-span-3",
	},
	{
		eyebrow: "AI drafting",
		icon: WandSparkles,
		tone: "cloud",
		title: "Drafts from context you actually saved",
		body: "Drafts are built from what you stored — name, company, notes, and recent activity. Missing data stays missing, so nothing gets invented.",
		span: "md:col-span-2",
	},
	{
		eyebrow: "Guardrails",
		icon: ShieldCheck,
		tone: "mint",
		title: "Nothing sends itself",
		body: "A draft is text for you to review, edit, and send yourself. There is no send path in the product — not disabled, absent.",
		span: "md:col-span-2",
	},
	{
		eyebrow: "Analytics",
		icon: ChartColumn,
		tone: "sand",
		title: "Rates that don't flatter you",
		body: "Response and conversion rates are computed on the fly from your activity log. Nothing is self-reported, nothing drifts out of sync.",
		span: "md:col-span-2",
	},
	{
		eyebrow: "Notes",
		icon: NotebookPen,
		tone: "dark",
		title: "Context compounds",
		body: "Free-text notes are the input drafting leans on hardest. The more honestly you write them, the less generic the draft that comes back.",
		span: "md:col-span-6",
	},
];

export const FeaturesSection = () => (
	<section id="features" className="scroll-mt-20 py-20 sm:py-28">
		<div className={containerClassName}>
			<div className="max-w-2xl">
				<SectionEyebrow tone="lavender">What&apos;s inside</SectionEyebrow>
				<h2 className={`mt-5 ${sectionTitleClassName}`}>
					Small surface area,{" "}
					<span className="text-lavender-700">deliberately</span>
				</h2>
				<p className={`mt-5 ${sectionLeadClassName}`}>
					Every feature here earned its place by solving a problem that actually
					showed up while doing outbound alone.
				</p>
			</div>

			<div className="mt-12 grid gap-4 md:grid-cols-6">
				{features.map((feature) => {
					const Icon = feature.icon;
					const isDark = feature.tone === "dark";

					return (
						<article
							key={feature.title}
							className={`flex flex-col rounded-3xl p-6 transition-transform hover:-translate-y-0.5 sm:p-7 ${feature.span} ${
								isDark
									? "bg-ink text-white"
									: "border border-line bg-white shadow-[0_1px_2px_rgba(45,42,38,0.04)]"
							}`}
						>
							<div className="flex items-center gap-3">
								{feature.tone === "dark" ? (
									<span className="flex size-[30px] items-center justify-center rounded-[10px] bg-white/10 text-white">
										<Icon className="size-4" />
									</span>
								) : (
									<IconBox tone={feature.tone} size="md">
										<Icon className="size-4" />
									</IconBox>
								)}
								<span
									className={`text-[11px] font-bold tracking-[0.1em] uppercase ${
										isDark ? "text-white/50" : "text-faint"
									}`}
								>
									{feature.eyebrow}
								</span>
							</div>
							<h3
								className={`mt-8 text-lg font-bold tracking-tight ${
									isDark ? "text-white" : "text-ink"
								}`}
							>
								{feature.title}
							</h3>
							<p
								className={`mt-2 max-w-xl text-sm leading-relaxed ${
									isDark ? "text-white/70" : "text-muted"
								}`}
							>
								{feature.body}
							</p>
						</article>
					);
				})}
			</div>
		</div>
	</section>
);
