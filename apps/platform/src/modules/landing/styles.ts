// Kelas bersama untuk semua section landing page — satu sumber supaya lebar
// kontainer, skala judul, dan bentuk tombol CTA tidak drift antar section.
export const containerClassName = "mx-auto w-full max-w-6xl px-5 sm:px-8";

export const sectionTitleClassName =
	"text-[32px] leading-[1.08] font-bold tracking-[-0.03em] text-ink sm:text-[42px]";

export const sectionLeadClassName =
	"text-[15px] leading-relaxed text-muted sm:text-base";

export const primaryCtaClassName =
	"inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_24px_-10px_rgba(45,42,38,0.6)] transition-all hover:-translate-y-px hover:bg-ink/90";

export const secondaryCtaClassName =
	"inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-[0_1px_2px_rgba(45,42,38,0.05)] transition-all hover:-translate-y-px hover:border-line-strong";
