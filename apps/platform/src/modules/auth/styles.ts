import { primaryButtonClassName } from "#/components/form-styles";

// Tombol submit utama di semua kartu auth (signin/signup, lupa & reset
// password) — versi "raised" dari primaryButtonClassName sesuai desain form auth.
export const authSubmitButtonClassName = `${primaryButtonClassName} h-11 w-full bg-linear-to-b from-[#4a453f] to-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_10px_20px_-10px_rgba(45,42,38,0.65)] hover:brightness-110`;
