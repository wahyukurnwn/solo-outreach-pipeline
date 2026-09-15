import { RotateCw } from "lucide-react";

const statSkeletonTones = [
	"bg-lavender-50",
	"bg-peach-50",
	"bg-mint-50",
	"bg-cloud-50",
];

export const DashboardSkeleton = () => (
	<div aria-busy="true" className="flex flex-col gap-7">
		<span className="sr-only">Memuat dashboard…</span>
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

interface DashboardErrorProps {
	message: string;
	onRetry: () => void;
}

export const DashboardError = ({ message, onRetry }: DashboardErrorProps) => (
	<div className="flex flex-col items-start gap-3 rounded-[20px] border border-blush-100 bg-blush-50 p-5 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<p className="text-sm font-semibold text-blush-700">
				Dashboard gagal dimuat
			</p>
			<p className="mt-0.5 text-[13px] text-blush-700/80">{message}</p>
		</div>
		<button
			type="button"
			onClick={onRetry}
			className="inline-flex items-center gap-1.5 rounded-[10px] bg-white px-3 py-1.5 text-[13px] font-semibold text-blush-700 transition-colors hover:bg-blush-100"
		>
			<RotateCw className="size-3.5" />
			Coba lagi
		</button>
	</div>
);
