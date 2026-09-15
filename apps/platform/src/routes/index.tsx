import { createFileRoute } from "@tanstack/react-router";
import {
	CtaSection,
	FeaturesSection,
	GapSection,
	HeroSection,
	LandingFooter,
	LandingNav,
	LoopSection,
	StackSection,
} from "#/modules/landing";

export const Route = createFileRoute("/")({ component: LandingPage });

function LandingPage() {
	return (
		<div className="min-h-screen bg-paper">
			<LandingNav />
			<main>
				<HeroSection />
				<GapSection />
				<FeaturesSection />
				<LoopSection />
				<StackSection />
				<CtaSection />
			</main>
			<LandingFooter />
		</div>
	);
}
