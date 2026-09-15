import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/analytic/")({
	component: AnalyticPage,
});

function AnalyticPage() {
	return (
		<div className="flex flex-col gap-7 px-6 py-8 sm:px-12 sm:py-10">
			<h1>Welcome to Analytic page!</h1>
		</div>
	);
}
