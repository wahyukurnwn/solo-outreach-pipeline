import { useEffect } from "react";

interface DialogProps {
	open: boolean;
	onClose: () => void;
	children: React.ReactNode;
}

// Primitif murni — nol pengetahuan domain, cuma overlay + panel + close on
// backdrop/Escape. Boleh langsung masuk packages/ui tanpa nunggu Rule of
// Three (lihat context/understanding-concept.md §3) karena ini "primitif
// murni", sama kelasnya dengan Button/Badge/Card.
export const Dialog = ({ open, onClose, children }: DialogProps) => {
	useEffect(() => {
		if (!open) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose();
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [open, onClose]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4 backdrop-blur-[2px]">
			<button
				type="button"
				aria-label="Tutup"
				onClick={onClose}
				className="absolute inset-0 cursor-default"
			/>
			<div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[20px] border border-line bg-white p-6 shadow-[0_24px_60px_-20px_rgba(45,42,38,0.35)]">
				<button
					type="button"
					aria-label="Tutup"
					onClick={onClose}
					className="absolute top-4 right-4 flex size-7 items-center justify-center rounded-lg text-faint transition-colors hover:bg-sidebar hover:text-ink"
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<path d="M18 6 6 18" />
						<path d="m6 6 12 12" />
					</svg>
				</button>
				{children}
			</div>
		</div>
	);
};
