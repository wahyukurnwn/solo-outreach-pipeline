// Satu sumber kelas kontrol form & tombol — sama seperti apps/platform,
// supaya gaya Soft tidak drift antar app.
export const inputClassName =
	"w-full rounded-xl border border-line bg-subtle px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-lavender-700 focus:bg-white focus:ring-4 focus:ring-lavender-100";

export const labelClassName =
	"mb-1.5 block text-[13px] font-semibold text-ink-soft";

export const helperClassName = "mt-1.5 text-xs text-muted";

export const primaryButtonClassName =
	"inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink/90 disabled:opacity-50";

export const softButtonClassName =
	"inline-flex items-center justify-center gap-1.5 rounded-[10px] bg-sidebar px-3 py-1.5 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-line disabled:opacity-50";
