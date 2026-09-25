import { generateDraftMessage } from "../../libs/openrouter";
import { prospectService } from "../prospect/prospect.service";

const stageLabel: Record<string, string> = {
	NEW: "not contacted yet",
	CONTACTED: "contacted, no reply yet",
	REPLIED: "has replied",
	CALL_SCHEDULED: "call scheduled",
	CLOSED_WON: "deal closed / became a client",
	CLOSED_LOST: "did not move forward",
};

const channelLabel: Record<string, string> = {
	EMAIL: "email",
	LINKEDIN: "LinkedIn",
	PHONE: "phone",
	OTHER: "another channel",
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
		`Name: ${prospect.name}`,
		prospect.company ? `Company: ${prospect.company}` : null,
		prospect.channel
			? `Contact channel: ${channelLabel[prospect.channel] ?? prospect.channel}`
			: null,
		`Pipeline stage: ${stageLabel[prospect.stage] ?? prospect.stage}`,
		prospect.notes ? `Notes: ${prospect.notes}` : "Notes: (none yet)",
	].filter(Boolean);

	return `You are helping a solo freelancer write a short outreach message to the following prospect:

${lines.join("\n")}

Write ONE outreach message draft in natural, friendly English (or in the language the notes are written in, if it is not English). Keep it short (at most 5 sentences), polite, and relevant to the stage and notes above. Skip overly formal greetings and signatures. Reply with ONLY the message text, no extra explanation.

Only use the facts given above. Do not invent details that are not stated — no specific project outcomes, prior conversations, numbers, dates, or promises that aren't in the notes. If the notes are empty or say little, write a brief, generic-but-relevant message instead of making something up to fill the gap.`;
}

export const draftService = {
	async generateForProspect(userId: string, prospectId: string) {
		const prospect = await prospectService.findById(userId, prospectId);

		const prompt = buildPrompt(prospect);
		const draft = await generateDraftMessage(prompt);

		return { draft };
	},
};
