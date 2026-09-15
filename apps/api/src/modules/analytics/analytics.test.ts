import { afterEach, describe, expect, it } from "vitest";
import { app } from "../../app";
import {
	cleanupUser,
	createProspect,
	createTestUser,
} from "../../test/helpers";

function logActivity(
	authHeaders: Record<string, string>,
	prospectId: string,
	channel: string,
	outcome: string,
) {
	return app.request(`/api/prospects/${prospectId}/activities`, {
		method: "POST",
		headers: { "Content-Type": "application/json", ...authHeaders },
		body: JSON.stringify({ channel, outcome, activityDate: "2026-01-01" }),
	});
}

async function getAnalytics(authHeaders: Record<string, string>) {
	const res = await app.request("/api/analytics", { headers: authHeaders });
	return { res, json: await res.json() };
}

describe("analytics", () => {
	const createdUserIds: string[] = [];

	afterEach(async () => {
		await Promise.all(createdUserIds.splice(0).map(cleanupUser));
	});

	it("rejects requests without a token", async () => {
		const res = await app.request("/api/analytics");

		expect(res.status).toBe(401);
	});

	it("returns zero counts and null rates when nothing has been contacted", async () => {
		const { id, authHeaders } = await createTestUser();
		createdUserIds.push(id);

		await createProspect(authHeaders, { name: "Not contacted" });

		const { res, json } = await getAnalytics(authHeaders);

		expect(res.status).toBe(200);
		expect(json.totalProspects).toBe(1);
		expect(json.contacted).toBe(0);
		expect(json.responseRate).toBeNull();
		expect(json.conversionRate).toBeNull();
	});

	it("computes response and conversion rates from contacted prospects only", async () => {
		const { id, authHeaders } = await createTestUser();
		createdUserIds.push(id);

		const replied = await createProspect(authHeaders, {
			name: "Replied",
			stage: "REPLIED",
		});
		const noResponse = await createProspect(authHeaders, {
			name: "No response",
		});
		const wonAfterOutreach = await createProspect(authHeaders, {
			name: "Won after outreach",
			stage: "CLOSED_WON",
		});
		await createProspect(authHeaders, {
			name: "Won without outreach",
			stage: "CLOSED_WON",
		});

		await logActivity(authHeaders, replied.id, "EMAIL", "sent");
		await logActivity(authHeaders, replied.id, "EMAIL", "replied");
		await logActivity(authHeaders, noResponse.id, "LINKEDIN", "no_response");
		await logActivity(authHeaders, wonAfterOutreach.id, "EMAIL", "sent");

		const { json } = await getAnalytics(authHeaders);

		expect(json.totalProspects).toBe(4);
		expect(json.contacted).toBe(3);
		expect(json.replied).toBe(1);
		expect(json.won).toBe(1);
		expect(json.responseRate).toBeCloseTo(1 / 3);
		expect(json.conversionRate).toBeCloseTo(1 / 3);
		expect(json.stages.CLOSED_WON).toBe(2);

		const byChannel = Object.fromEntries(
			json.channels.map((row: { channel: string }) => [row.channel, row]),
		);
		expect(byChannel.EMAIL).toMatchObject({
			contacted: 2,
			replied: 1,
			responseRate: 0.5,
		});
		expect(byChannel.LINKEDIN).toMatchObject({
			contacted: 1,
			replied: 0,
			responseRate: 0,
		});
		expect(byChannel.PHONE).toMatchObject({
			contacted: 0,
			replied: 0,
			responseRate: null,
		});
	});

	it("never counts another user's prospects or activities", async () => {
		const owner = await createTestUser();
		const other = await createTestUser();
		createdUserIds.push(owner.id, other.id);

		const prospect = await createProspect(owner.authHeaders);
		await logActivity(owner.authHeaders, prospect.id, "EMAIL", "replied");

		const { json } = await getAnalytics(other.authHeaders);

		expect(json.totalProspects).toBe(0);
		expect(json.contacted).toBe(0);
		expect(json.responseRate).toBeNull();
	});
});
