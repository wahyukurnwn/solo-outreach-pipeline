import { FileText } from "lucide-react";

export const ProspectNotes = ({ notes }: { notes: string }) => (
	<div className="flex gap-3 rounded-2xl bg-sand-50 px-4.5 py-4">
		<FileText className="mt-0.5 size-[18px] shrink-0 text-sand-700" />
		<p className="text-[14.5px] leading-relaxed whitespace-pre-line text-pretty text-ink-soft">
			{notes}
		</p>
	</div>
);
