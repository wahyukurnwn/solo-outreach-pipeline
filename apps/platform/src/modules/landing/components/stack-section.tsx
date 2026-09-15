import { Layers } from "lucide-react";
import { containerClassName } from "../styles";
import { SectionEyebrow } from "./section-eyebrow";

// Hanya teknologi yang benar-benar ada di repo ini — tidak mengklaim tooling
// deploy (Dockerfile, CI, reverse proxy) yang belum dibuat.
const stack = [
	"React 19",
	"TanStack Start",
	"TanStack Router",
	"TanStack Query",
	"Tailwind v4",
	"Hono",
	"Zod",
	"Prisma 7",
	"PostgreSQL",
	"Vitest",
	"Biome",
	"pnpm workspaces",
];

const layers = [
	{
		eyebrow: "Presentation",
		title: "React 19 · TanStack Start · Tailwind v4",
		body: "A client that talks only to its own typed API — never straight to the database.",
	},
	{
		eyebrow: "Application",
		title: "Hono · TypeScript · Zod",
		body: "Business rules live here: per-user authorization, due dates, validation, rate math.",
	},
	{
		eyebrow: "Data access",
		title: "Prisma ORM",
		body: "The only layer that touches SQL. Services call repositories, not queries.",
	},
	{
		eyebrow: "Infrastructure",
		title: "PostgreSQL · Docker Compose",
		body: "One command brings the database up locally, and integration tests run against it — not against mocks.",
	},
];

export const StackSection = () => (
	<section id="stack" className="scroll-mt-16 bg-ink py-20 text-white sm:py-28">
		<div
			className={`${containerClassName} grid gap-12 lg:grid-cols-2 lg:gap-16`}
		>
			<div>
				<SectionEyebrow tone="dark" icon={<Layers className="size-3" />}>
					Under the hood
				</SectionEyebrow>
				<h2 className="mt-5 text-[32px] leading-[1.08] font-bold tracking-[-0.03em] sm:text-[42px]">
					Built like something
					<span className="block">
						that has to <span className="text-lavender-100">stay running</span>
					</span>
				</h2>
				<p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/60 sm:text-base">
					Four layers with a strict dependency direction, each one only talking
					to the layer below it. Not because the scale demands it — because
					knowing how to do it is the point.
				</p>
				<ul className="mt-8 flex flex-wrap gap-2">
					{stack.map((item) => (
						<li
							key={item}
							className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/75"
						>
							{item}
						</li>
					))}
				</ul>
			</div>

			<ol className="flex flex-col gap-3">
				{layers.map((layer) => (
					<li
						key={layer.eyebrow}
						className="rounded-2xl border border-white/10 bg-white/4 p-5 transition-colors hover:bg-white/7"
					>
						<p className="text-[11px] font-bold tracking-[0.1em] text-white/40 uppercase">
							{layer.eyebrow}
						</p>
						<p className="mt-2 text-[15px] font-semibold text-white">
							{layer.title}
						</p>
						<p className="mt-1 text-sm text-white/55">{layer.body}</p>
					</li>
				))}
			</ol>
		</div>
	</section>
);
