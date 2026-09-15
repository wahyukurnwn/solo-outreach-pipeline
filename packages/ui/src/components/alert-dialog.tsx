import { Dialog } from "./dialog";

interface AlertDialogProps {
	open: boolean;
	title: string;
	description: string;
	confirmLabel?: string;
	cancelLabel?: string;
	variant?: "danger" | "default";
	onConfirm: () => void;
	onCancel: () => void;
}

const confirmVariantClasses: Record<"danger" | "default", string> = {
	danger: "bg-blush-700 hover:bg-blush-700/90",
	default: "bg-ink hover:bg-ink/90",
};

// Bungkus Dialog (bukan reimplement overlay/backdrop/Escape sendiri) —
// tombol X bawaan Dialog otomatis jadi Cancel di sini: menutup tanpa
// mengonfirmasi, yang memang perilaku benar untuk dialog konfirmasi aksi
// destruktif (dismiss harus selalu berarti batal, tidak pernah diam-diam
// menjalankan aksinya).
export const AlertDialog = ({
	open,
	title,
	description,
	confirmLabel = "Hapus",
	cancelLabel = "Batal",
	variant = "danger",
	onConfirm,
	onCancel,
}: AlertDialogProps) => (
	<Dialog open={open} onClose={onCancel}>
		<p className="pr-8 text-base font-bold text-ink">{title}</p>
		<p className="mt-2 text-sm text-muted">{description}</p>
		<div className="mt-6 flex justify-end gap-2">
			<button
				type="button"
				onClick={onCancel}
				className="rounded-xl bg-sidebar px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-line"
			>
				{cancelLabel}
			</button>
			<button
				type="button"
				onClick={onConfirm}
				className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors ${confirmVariantClasses[variant]}`}
			>
				{confirmLabel}
			</button>
		</div>
	</Dialog>
);
