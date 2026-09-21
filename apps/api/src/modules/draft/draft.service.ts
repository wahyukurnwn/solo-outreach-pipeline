import { generateDraftMessage } from "../../libs/openrouter";
import { prospectService } from "../prospect/prospect.service";

const stageLabel: Record<string, string> = {
	NEW: "belum dihubungi",
	CONTACTED: "sudah dihubungi, belum ada balasan",
	REPLIED: "sudah membalas",
	CALL_SCHEDULED: "sudah jadwalkan panggilan",
	CLOSED_WON: "deal / menjadi klien",
	CLOSED_LOST: "tidak lanjut",
};

const channelLabel: Record<string, string> = {
	EMAIL: "email",
	LINKEDIN: "LinkedIn",
	PHONE: "telepon",
	OTHER: "channel lain",
};

// Prompt dibangun dari data prospek yang tersimpan di server (bukan input
// bebas dari client) — prospek ini milik user yang login (dicek lewat
// prospectService.findById), jadi konteksnya selalu data mereka sendiri.
function buildPrompt(prospect: {
	name: string;
	company: string | null;
	channel: string | null;
	stage: string;
	notes: string | null;
}) {
	const lines = [
		`Nama: ${prospect.name}`,
		prospect.company ? `Perusahaan: ${prospect.company}` : null,
		prospect.channel
			? `Channel komunikasi: ${channelLabel[prospect.channel] ?? prospect.channel}`
			: null,
		`Status pipeline: ${stageLabel[prospect.stage] ?? prospect.stage}`,
		prospect.notes ? `Catatan: ${prospect.notes}` : "Catatan: (belum ada)",
	].filter(Boolean);

	return `Kamu membantu seorang solo-preneur menulis pesan outreach singkat untuk prospek berikut:

${lines.join("\n")}

Tulis SATU draft pesan outreach dalam Bahasa Indonesia yang natural, singkat (maksimal 5 kalimat), sopan, dan relevan dengan status & catatan di atas. Jangan pakai salam pembuka formal berlebihan atau tanda tangan. Balas HANYA dengan teks pesannya saja, tanpa penjelasan tambahan.`;
}

export const draftService = {
	async generateForProspect(userId: string, prospectId: string) {
		const prospect = await prospectService.findById(userId, prospectId);

		const prompt = buildPrompt(prospect);
		const draft = await generateDraftMessage(prompt);

		return { draft };
	},
};
