import { afterEach, describe, expect, it } from "vitest";
import { app } from "../../app";
import {
	cleanupUser,
	createProspect,
	createTestUser,
} from "../../test/helpers";

describe("prospects", () => {
	const createdUserIds: string[] = [];

	afterEach(async () => {
		await Promise.all(createdUserIds.splice(0).map(cleanupUser));
	});

	it("rejects every route without a token", async () => {
		const resList = await app.request("/api/prospects");
		const resCreate = await app.request("/api/prospects", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: "No Auth" }),
		});

		expect(resList.status).toBe(401);
		expect(resCreate.status).toBe(401);
	});

	it("creates and lists a prospect for the authenticated user", async () => {
		const { id, authHeaders } = await createTestUser();
		createdUserIds.push(id);

		const created = await createProspect(authHeaders, { name: "Budi Santoso" });

		const res = await app.request("/api/prospects", { headers: authHeaders });
		const json = await res.json();

		expect(res.status).toBe(200);
		expect(json.data).toHaveLength(1);
		expect(json.data[0].id).toBe(created.id);
	});

	it("gets, updates, and deletes a prospect owned by the user", async () => {
		const { id, authHeaders } = await createTestUser();
		createdUserIds.push(id);

		const prospect = await createProspect(authHeaders);

		const getRes = await app.request(`/api/prospects/${prospect.id}`, {
			headers: authHeaders,
		});
		expect(getRes.status).toBe(200);

		const updateRes = await app.request(`/api/prospects/${prospect.id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json", ...authHeaders },
			body: JSON.stringify({ stage: "CONTACTED" }),
		});
		const updated = await updateRes.json();
		expect(updateRes.status).toBe(200);
		expect(updated.stage).toBe("CONTACTED");

		const deleteRes = await app.request(`/api/prospects/${prospect.id}`, {
			method: "DELETE",
			headers: authHeaders,
		});
		expect(deleteRes.status).toBe(200);

		const getAfterDeleteRes = await app.request(
			`/api/prospects/${prospect.id}`,
			{
				headers: authHeaders,
			},
		);
		expect(getAfterDeleteRes.status).toBe(404);
	});

	it("never lets a user access another user's prospect", async () => {
		const owner = await createTestUser();
		const intruder = await createTestUser();
		createdUserIds.push(owner.id, intruder.id);

		const prospect = await createProspect(owner.authHeaders);

		const getRes = await app.request(`/api/prospects/${prospect.id}`, {
			headers: intruder.authHeaders,
		});
		const updateRes = await app.request(`/api/prospects/${prospect.id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json", ...intruder.authHeaders },
			body: JSON.stringify({ stage: "CONTACTED" }),
		});
		const deleteRes = await app.request(`/api/prospects/${prospect.id}`, {
			method: "DELETE",
			headers: intruder.authHeaders,
		});

		expect(getRes.status).toBe(404);
		expect(updateRes.status).toBe(404);
		expect(deleteRes.status).toBe(404);

		const stillThereRes = await app.request(`/api/prospects/${prospect.id}`, {
			headers: owner.authHeaders,
		});
		expect(stillThereRes.status).toBe(200);
	});

	it("only returns prospects that are due for follow-up", async () => {
		const { id, authHeaders } = await createTestUser();
		createdUserIds.push(id);

		const due = await createProspect(authHeaders, {
			name: "Due",
			followUpDate: "2020-01-01",
		});
		await createProspect(authHeaders, {
			name: "Not due yet",
			followUpDate: "2099-01-01",
		});
		await createProspect(authHeaders, { name: "No follow-up date" });

		const res = await app.request("/api/prospects/follow-ups", {
			headers: authHeaders,
		});
		const json = await res.json();

		expect(res.status).toBe(200);
		expect(json.data).toHaveLength(1);
		expect(json.data[0].id).toBe(due.id);
	});

	it("treats ?date as the caller's local today when listing follow-ups", async () => {
		const { id, authHeaders } = await createTestUser();
		createdUserIds.push(id);

		const dueOnDate = await createProspect(authHeaders, {
			name: "Due on the given date",
			followUpDate: "2099-01-01",
		});

		const onDateRes = await app.request(
			"/api/prospects/follow-ups?date=2099-01-01",
			{ headers: authHeaders },
		);
		const onDate = await onDateRes.json();
		const dayBeforeRes = await app.request(
			"/api/prospects/follow-ups?date=2098-12-31",
			{ headers: authHeaders },
		);
		const dayBefore = await dayBeforeRes.json();

		expect(onDateRes.status).toBe(200);
		expect(
			onDate.data.map((prospect: { id: string }) => prospect.id),
		).toContain(dueOnDate.id);
		expect(dayBefore.data).toHaveLength(0);
	});

	it("rejects an invalid ?date when listing follow-ups", async () => {
		const { id, authHeaders } = await createTestUser();
		createdUserIds.push(id);

		const res = await app.request("/api/prospects/follow-ups?date=not-a-date", {
			headers: authHeaders,
		});

		expect(res.status).toBe(422);
	});

	it("clears nullable fields when they are patched with null", async () => {
		const { id, authHeaders } = await createTestUser();
		createdUserIds.push(id);

		const prospect = await createProspect(authHeaders, {
			company: "Studio Arsa",
			followUpDate: "2099-01-01",
		});

		const res = await app.request(`/api/prospects/${prospect.id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json", ...authHeaders },
			body: JSON.stringify({ company: null, followUpDate: null }),
		});
		const updated = await res.json();

		expect(res.status).toBe(200);
		expect(updated.company).toBeNull();
		expect(updated.followUpDate).toBeNull();
	});

	it("deletes a prospect that already has activities", async () => {
		const { id, authHeaders } = await createTestUser();
		createdUserIds.push(id);

		const prospect = await createProspect(authHeaders);
		const activityRes = await app.request(
			`/api/prospects/${prospect.id}/activities`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json", ...authHeaders },
				body: JSON.stringify({
					channel: "EMAIL",
					outcome: "sent",
					activityDate: "2026-01-01",
				}),
			},
		);
		expect(activityRes.status).toBe(201);

		const deleteRes = await app.request(`/api/prospects/${prospect.id}`, {
			method: "DELETE",
			headers: authHeaders,
		});
		expect(deleteRes.status).toBe(200);

		const activitiesAfterDeleteRes = await app.request(
			`/api/prospects/${prospect.id}/activities`,
			{ headers: authHeaders },
		);
		expect(activitiesAfterDeleteRes.status).toBe(404);
	});
});
