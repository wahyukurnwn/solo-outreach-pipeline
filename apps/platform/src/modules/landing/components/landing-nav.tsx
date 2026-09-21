import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { BrandMark } from "#/components/brand-mark";
import { containerClassName } from "../styles";
import { GitHubIcon } from "./github-icon";

// Ganti ke URL repo spesifik kalau sudah ada.
const GITHUB_URL = "https://github.com/wahyukurnwn";

const sectionLinks = [
	{ href: "#why", label: "Why" },
	{ href: "#features", label: "Features" },
	{ href: "#how-it-works", label: "How it works" },
	{ href: "#stack", label: "Stack" },
];

export const LandingNav = () => (
	<header className="sticky top-0 z-40 border-b border-line/70 bg-paper/80 backdrop-blur-md">
		<div
			className={`${containerClassName} flex h-16 items-center justify-between gap-6`}
		>
			<Link to="/" aria-label="Pipeline, back to home">
				<BrandMark withWordmark />
			</Link>

			<nav className="hidden items-center gap-1 md:flex">
				{sectionLinks.map((link) => (
					<a
						key={link.href}
						href={link.href}
						className="rounded-full px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-sidebar hover:text-ink"
					>
						{link.label}
					</a>
				))}
			</nav>

			<div className="flex items-center gap-1.5">
				<a
					href={GITHUB_URL}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
				>
					<GitHubIcon />
					GitHub
				</a>
				<Link
					to="/dashboard"
					className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-ink/90"
				>
					Open the app
					<ArrowRight className="size-3.5" />
				</Link>
			</div>
		</div>
	</header>
);
