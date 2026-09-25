import { generateDraftMessage } from "../../libs/openrouter";
import { activityService } from "../activity/activity.service";
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

const outcomeLabel: Record<string, string> = {
	sent: "message sent",
	replied: "prospect replied",
	no_response: "no response received",
};

// Cukup 3 terbaru — pesan draft ini pendek (maks 5 kalimat), jadi tidak
// butuh seluruh histori untuk memberi konteks yang relevan, dan memangkas
// prompt yang dikirim (biaya + latensi) ke provider AI.
const RECENT_ACTIVITIES_LIMIT = 3;

interface RecentActivity {
	activityDate: Date;
	channel: string;
	outcome: string;
	messageText: string | null;
}

// Prompt dibangun dari data prospek + aktivitas yang tersimpan di server
// (bukan input bebas dari client) — prospek ini milik user yang login
// (dicek lewat prospectService.findById), jadi konteksnya selalu data
// mereka sendiri.
function buildPrompt(
	prospect: {
		name: string;
		company: string | null;
		channel: string | null;
		stage: string;
		notes: string | null;
	},
	recentActivities: RecentActivity[],
) {
	const lines = [
		`Name: ${prospect.name}`,
		prospect.company ? `Company: ${prospect.company}` : null,
		prospect.channel
			? `Contact channel: ${channelLabel[prospect.channel] ?? prospect.channel}`
			: null,
		`Pipeline stage: ${stageLabel[prospect.stage] ?? prospect.stage}`,
		prospect.notes ? `Notes: ${prospect.notes}` : "Notes: (none yet)",
	].filter(Boolean);

	const activityLines =
		recentActivities.length > 0
			? [
					"",
					"Recent activity (most recent first):",
					...recentActivities.map((activity) => {
						const date = activity.activityDate.toISOString().slice(0, 10);
						const channel = channelLabel[activity.channel] ?? activity.channel;
						const outcome = outcomeLabel[activity.outcome] ?? activity.outcome;
						const message = activity.messageText
							? ` — "${activity.messageText.slice(0, 200)}"`
							: "";
						return `- ${date}, ${channel}, ${outcome}${message}`;
					}),
				]
			: [];

	return `You are helping a solo freelancer write a short outreach message to the following prospect:

${lines.join("\n")}${activityLines.join("\n")}

Write ONE outreach message draft in natural, friendly English (or in the language the notes are written in, if it is not English). Keep it short (at most 5 sentences), polite, and relevant to the stage, notes, and recent activity above — for example, don't re-introduce yourself if a message was already sent, and reference their reply if they replied. Skip overly formal greetings and signatures. Reply with ONLY the message text, no extra explanation.

Only use the facts given above. Do not invent details that are not stated — no specific project outcomes, prior conversations, numbers, dates, or promises that aren't in the notes or recent activity. If there is little to go on, write a brief, generic-but-relevant message instead of making something up to fill the gap.`;
}

export const draftService = {
	async generateForProspect(userId: string, prospectId: string) {
		const prospect = await prospectService.findById(userId, prospectId);
		const activities = await activityService.listByProspect(userId, prospectId);

		const prompt = buildPrompt(
			prospect,
			activities.slice(0, RECENT_ACTIVITIES_LIMIT),
		);
		const draft = await generateDraftMessage(prompt);

		return { draft };
	},
};
