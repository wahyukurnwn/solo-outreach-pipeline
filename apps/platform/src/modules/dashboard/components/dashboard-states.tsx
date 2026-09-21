const statSkeletonTones = [
	"bg-lavender-50",
	"bg-peach-50",
	"bg-mint-50",
	"bg-cloud-50",
];

export const DashboardSkeleton = () => (
	<div aria-busy="true" className="flex flex-col gap-7">
		<span className="sr-only">Loading dashboard…</span>
		<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
			{statSkeletonTones.map((tone) => (
				<div
					key={tone}
					className={`h-[148px] animate-pulse rounded-[20px] ${tone}`}
				/>
			))}
		</div>
		<div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
			<div className="h-72 animate-pulse rounded-[20px] border border-line bg-white" />
			<div className="h-72 animate-pulse rounded-[20px] border border-line bg-white" />
		</div>
	</div>
);
