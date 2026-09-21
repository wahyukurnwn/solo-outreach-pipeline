import type { Prospect } from "#/modules/prospect/types";

// Diekstrak dari prospect-card.tsx & routes/prospect/$id.tsx — dipakai
// ketiga kalinya di prospect-form.tsx (mode edit), jadi diduplikasi manual
// sudah tidak masuk akal (Rule of Three).
export const stageLabel: Record<Prospect["stage"], string> = {
	NEW: "New",
	CONTACTED: "Contacted",
	REPLIED: "Replied",
	CALL_SCHEDULED: "Call scheduled",
	CLOSED_WON: "Closed Won",
	CLOSED_LOST: "Closed Lost",
};

export const channelLabel: Record<NonNullable<Prospect["channel"]>, string> = {
	EMAIL: "Email",
	LINKEDIN: "LinkedIn",
	PHONE: "Phone",
	OTHER: "Other",
};

// Warna penanda per stage — dipakai bareng (dot + percentage bar) di
// StageBreakdownCard, satu sumber supaya warnanya konsisten di semua tempat
// yang nanti butuh bedakan stage secara visual.
export const stageColor: Record<Prospect["stage"], string> = {
	NEW: "bg-blue-500",
	CONTACTED: "bg-cyan-500",
	REPLIED: "bg-purple-500",
	CALL_SCHEDULED: "bg-amber-500",
	CLOSED_WON: "bg-emerald-500",
	CLOSED_LOST: "bg-rose-500",
};

// Empat stage yang masih "berjalan" (butuh tindakan/pantauan aktif) — dipakai
// StageBreakdownCard di Dashboard supaya fokus ke hal yang actionable, beda
// dari halaman /analytics yang menampilkan keenam stage penuh (termasuk
// Closed Won/Lost, karena memang tempat resmi review konversi — lihat PRD.md
// user story 5, "response rate dan conversion rate").
export const activeStages: Prospect["stage"][] = [
	"NEW",
	"CONTACTED",
	"REPLIED",
	"CALL_SCHEDULED",
];

// Tint avatar mengikuti hue titik stageColor (biru→cloud, cyan→lagoon, dst)
// supaya stage terbaca konsisten di avatar maupun pill.
export const stageAvatarClass: Record<Prospect["stage"], string> = {
	NEW: "bg-cloud-50 text-cloud-700",
	CONTACTED: "bg-lagoon-50 text-lagoon-700",
	REPLIED: "bg-lavender-50 text-lavender-700",
	CALL_SCHEDULED: "bg-peach-50 text-peach-700",
	CLOSED_WON: "bg-mint-50 text-mint-700",
	CLOSED_LOST: "bg-blush-50 text-blush-700",
};

const tagTones = [
	"bg-lavender-50 text-lavender-700",
	"bg-mint-50 text-mint-700",
	"bg-peach-50 text-peach-700",
	"bg-cloud-50 text-cloud-700",
];

// Warna diturunkan dari teks tag (bukan urutannya) — tag yang sama selalu
// berwarna sama di prospek mana pun.
export function tagToneClass(tag: string) {
	let sum = 0;
	for (const char of tag) sum += char.charCodeAt(0);
	return tagTones[sum % tagTones.length] ?? "";
}
