import { RotateCw } from "lucide-react";

interface QueryErrorProps {
	title: string;
	message: string;
	onRetry: () => void;
}

export const QueryError = ({ title, message, onRetry }: QueryErrorProps) => (
	<div className="flex flex-col items-start gap-3 rounded-[20px] border border-blush-100 bg-blush-50 p-5 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<p className="text-sm font-semibold text-blush-700">{title}</p>
			<p className="mt-0.5 text-[13px] text-blush-700/80">{message}</p>
		</div>
		<button
			type="button"
			onClick={onRetry}
			className="inline-flex items-center gap-1.5 rounded-[10px] bg-white px-3 py-1.5 text-[13px] font-semibold text-blush-700 transition-colors hover:bg-blush-100"
		>
			<RotateCw className="size-3.5" />
			Try again
		</button>
	</div>
);
