import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { app } from "../../app";
import {
	cleanupUser,
	clearDemoUsers,
	createProspect,
	createTestUser,
	markAsDemo,
} from "../../test/helpers";

function logActivity(authHeaders: Record<string, string>, prospectId: string) {
	return app.request(`/api/prospects/${prospectId}/activities`, {
		method: "POST",
		headers: { "Content-Type": "application/json", ...authHeaders },
		body: JSON.stringify({
			channel: "EMAIL",
			outcome: "replied",
			activityDate: "2026-01-01",
		}),
	});
}

describe("public demo endpoints", () => {
	const createdUserIds: string[] = [];

	beforeEach(clearDemoUsers);
	afterEach(async () => {
		await Promise.all(createdUserIds.splice(0).map(cleanupUser));
	});

	it("returns 503 on every demo route when no user is flagged is_demo", async () => {
		for (const path of [
			"/api/demo/analytics",
			"/api/demo/prospects",
			"/api/demo/prospects/follow-ups",
		]) {
			const res = await app.request(path);
			const json = await res.json();

			expect(res.status).toBe(503);
			expect(json.error.code).toBe("DEMO_UNAVAILABLE");
		}
	});

	it("serves the demo user's prospects, follow-ups, and analytics without any auth header", async () => {
		const { id, authHeaders } = await createTestUser();
		createdUserIds.push(id);
		await markAsDemo(id);

		const prospect = await createProspect(authHeaders, {
			name: "Demo Prospect",
			followUpDate: "2020-01-01",
		});
		await logActivity(authHeaders, prospect.id);

		const listRes = await app.request("/api/demo/prospects");
		const list = await listRes.json();
		expect(listRes.status).toBe(200);
		expect(list.data.map((p: { id: string }) => p.id)).toContain(prospect.id);

		const followUpsRes = await app.request("/api/demo/prospects/follow-ups");
		const followUps = await followUpsRes.json();
		expect(followUpsRes.status).toBe(200);
		expect(followUps.data.map((p: { id: string }) => p.id)).toContain(
			prospect.id,
		);

		const detailRes = await app.request(`/api/demo/prospects/${prospect.id}`);
		expect(detailRes.status).toBe(200);

		const activitiesRes = await app.request(
			`/api/demo/prospects/${prospect.id}/activities`,
		);
		const activities = await activitiesRes.json();
		expect(activitiesRes.status).toBe(200);
		expect(activities.data).toHaveLength(1);

		const analyticsRes = await app.request("/api/demo/analytics");
		const analytics = await analyticsRes.json();
		expect(analyticsRes.status).toBe(200);
		expect(analytics.contacted).toBeGreaterThanOrEqual(1);
	});

	it("never exposes a prospect that belongs to a non-demo user", async () => {
		const demo = await createTestUser();
		const other = await createTestUser();
		createdUserIds.push(demo.id, other.id);
		await markAsDemo(demo.id);

		const otherProspect = await createProspect(other.authHeaders);

		const res = await app.request(`/api/demo/prospects/${otherProspect.id}`);

		expect(res.status).toBe(404);
	});
});
