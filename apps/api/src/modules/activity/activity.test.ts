import { afterEach, describe, expect, it } from "vitest";
import { app } from "../../app";
import {
	cleanupUser,
	createProspect,
	createTestUser,
} from "../../test/helpers";

function createActivity(
	authHeaders: Record<string, string>,
	prospectId: string,
	overrides: Record<string, unknown> = {},
) {
	return app.request(`/api/prospects/${prospectId}/activities`, {
		method: "POST",
		headers: { "Content-Type": "application/json", ...authHeaders },
		body: JSON.stringify({
			channel: "EMAIL",
			outcome: "sent",
			activityDate: "2026-01-01",
			...overrides,
		}),
	});
}

describe("activities", () => {
	const createdUserIds: string[] = [];

	afterEach(async () => {
		await Promise.all(createdUserIds.splice(0).map(cleanupUser));
	});

	it("rejects creating an activity under a prospect that isn't the caller's", async () => {
		const owner = await createTestUser();
		const intruder = await createTestUser();
		createdUserIds.push(owner.id, intruder.id);

		const prospect = await createProspect(owner.authHeaders);

		const res = await createActivity(intruder.authHeaders, prospect.id);

		expect(res.status).toBe(404);
	});

	it("creates and lists activities scoped to a prospect", async () => {
		const { id, authHeaders } = await createTestUser();
		createdUserIds.push(id);

		const prospect = await createProspect(authHeaders);
		const created = await (
			await createActivity(authHeaders, prospect.id, { messageText: "Halo" })
		).json();

		const res = await app.request(`/api/prospects/${prospect.id}/activities`, {
			headers: authHeaders,
		});
		const json = await res.json();

		expect(res.status).toBe(200);
		expect(json.data).toHaveLength(1);
		expect(json.data[0].id).toBe(created.id);
	});

	it("updates and deletes an activity owned by the user", async () => {
		const { id, authHeaders } = await createTestUser();
		createdUserIds.push(id);

		const prospect = await createProspect(authHeaders);
		const activity = await (
			await createActivity(authHeaders, prospect.id)
		).json();

		const updateRes = await app.request(`/api/activities/${activity.id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json", ...authHeaders },
			body: JSON.stringify({ outcome: "replied" }),
		});
		const updated = await updateRes.json();
		expect(updateRes.status).toBe(200);
		expect(updated.outcome).toBe("replied");

		const deleteRes = await app.request(`/api/activities/${activity.id}`, {
			method: "DELETE",
			headers: authHeaders,
		});
		expect(deleteRes.status).toBe(200);
	});

	it("never lets a user modify another user's activity", async () => {
		const owner = await createTestUser();
		const intruder = await createTestUser();
		createdUserIds.push(owner.id, intruder.id);

		const prospect = await createProspect(owner.authHeaders);
		const activity = await (
			await createActivity(owner.authHeaders, prospect.id)
		).json();

		const updateRes = await app.request(`/api/activities/${activity.id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json", ...intruder.authHeaders },
			body: JSON.stringify({ outcome: "replied" }),
		});
		const deleteRes = await app.request(`/api/activities/${activity.id}`, {
			method: "DELETE",
			headers: intruder.authHeaders,
		});

		expect(updateRes.status).toBe(404);
		expect(deleteRes.status).toBe(404);
	});
});
