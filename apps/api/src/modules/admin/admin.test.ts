import { afterEach, describe, expect, it } from "vitest";
import { app } from "../../app";
import {
	cleanupUser,
	createTestAdmin,
	createTestUser,
} from "../../test/helpers";

describe("admin routes", () => {
	const createdUserIds: string[] = [];

	afterEach(async () => {
		await Promise.all(createdUserIds.splice(0).map(cleanupUser));
	});

	it("rejects a regular user with 403", async () => {
		const { id, authHeaders } = await createTestUser();
		createdUserIds.push(id);

		const res = await app.request("/api/admin/users", { headers: authHeaders });

		expect(res.status).toBe(403);
	});

	it("rejects an unauthenticated request with 401", async () => {
		const res = await app.request("/api/admin/users");

		expect(res.status).toBe(401);
	});

	it("lets an admin list users without leaking the password field", async () => {
		const admin = await createTestAdmin();
		createdUserIds.push(admin.id);

		const res = await app.request("/api/admin/users", {
			headers: admin.authHeaders,
		});
		const json = await res.json();

		expect(res.status).toBe(200);
		expect(json.data.some((user: { id: string }) => user.id === admin.id)).toBe(
			true,
		);
		expect(JSON.stringify(json)).not.toContain("password");
	});

	it("lets an admin promote another user's role", async () => {
		const admin = await createTestAdmin();
		const target = await createTestUser();
		createdUserIds.push(admin.id, target.id);

		const res = await app.request(`/api/admin/users/${target.id}/role`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json", ...admin.authHeaders },
			body: JSON.stringify({ role: "ADMIN" }),
		});
		const json = await res.json();

		expect(res.status).toBe(200);
		expect(json.role).toBe("ADMIN");
	});

	it("logs who changed a user's role and to what", async () => {
		const admin = await createTestAdmin();
		const target = await createTestUser();
		createdUserIds.push(admin.id, target.id);

		await app.request(`/api/admin/users/${target.id}/role`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json", ...admin.authHeaders },
			body: JSON.stringify({ role: "ADMIN" }),
		});

		const res = await app.request(`/api/admin/users/${target.id}/role-logs`, {
			headers: admin.authHeaders,
		});
		const { data } = await res.json();

		expect(res.status).toBe(200);
		expect(data).toHaveLength(1);
		expect(data[0]).toMatchObject({
			fromRole: "USER",
			toRole: "ADMIN",
			actor: { id: admin.id, email: admin.email },
		});
	});

	it("does not log a no-op role update (setting the same role)", async () => {
		const admin = await createTestAdmin();
		const target = await createTestUser();
		createdUserIds.push(admin.id, target.id);

		await app.request(`/api/admin/users/${target.id}/role`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json", ...admin.authHeaders },
			body: JSON.stringify({ role: "USER" }),
		});

		const res = await app.request(`/api/admin/users/${target.id}/role-logs`, {
			headers: admin.authHeaders,
		});
		const { data } = await res.json();

		expect(data).toHaveLength(0);
	});

	it("rejects a regular user from reading role logs with 403", async () => {
		const { id, authHeaders } = await createTestUser();
		createdUserIds.push(id);

		const res = await app.request(`/api/admin/users/${id}/role-logs`, {
			headers: authHeaders,
		});

		expect(res.status).toBe(403);
	});

	it("returns 404 for a user id that doesn't exist", async () => {
		const admin = await createTestAdmin();
		createdUserIds.push(admin.id);

		const res = await app.request(
			"/api/admin/users/00000000-0000-0000-0000-000000000000",
			{ headers: admin.authHeaders },
		);

		expect(res.status).toBe(404);
	});

	it("lets an admin flag a user as the demo account", async () => {
		const admin = await createTestAdmin();
		const target = await createTestUser();
		createdUserIds.push(admin.id, target.id);

		const res = await app.request(`/api/admin/users/${target.id}/demo`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json", ...admin.authHeaders },
			body: JSON.stringify({ isDemo: true }),
		});
		const json = await res.json();

		expect(res.status).toBe(200);
		expect(json.isDemo).toBe(true);
	});

	it("unsets the previous demo user when a new one is flagged", async () => {
		const admin = await createTestAdmin();
		const previousDemo = await createTestUser();
		const nextDemo = await createTestUser();
		createdUserIds.push(admin.id, previousDemo.id, nextDemo.id);

		await app.request(`/api/admin/users/${previousDemo.id}/demo`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json", ...admin.authHeaders },
			body: JSON.stringify({ isDemo: true }),
		});

		await app.request(`/api/admin/users/${nextDemo.id}/demo`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json", ...admin.authHeaders },
			body: JSON.stringify({ isDemo: true }),
		});

		const listRes = await app.request("/api/admin/users", {
			headers: admin.authHeaders,
		});
		const { data } = await listRes.json();
		const demoUsers = data.filter((user: { isDemo: boolean }) => user.isDemo);

		expect(demoUsers).toHaveLength(1);
		expect(demoUsers[0].id).toBe(nextDemo.id);
	});
});
