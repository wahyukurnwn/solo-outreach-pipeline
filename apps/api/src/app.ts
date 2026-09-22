import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { env } from "./config/env";
import { AppError } from "./exceptions";
import { prisma } from "./libs/prisma";
import activityRoute from "./modules/activity/activity.route";
import adminRoute from "./modules/admin/admin.route";
import analyticsRoute from "./modules/analytics/analytics.route";
import authRoute from "./modules/auth/auth.route";
import demoRoute from "./modules/demo/demo.route";
import draftRoute from "./modules/draft/draft.route";
import prospectRoute from "./modules/prospect/prospect.route";

export const app = new Hono()
	.use(
		"*",
		cors({
			origin: env.corsOrigins,
			allowHeaders: ["Content-Type", "Authorization"],
			allowMethods: ["GET", "POST", "PATCH", "DELETE"],
			// credentials:true supaya cookie httpOnly refresh_token ikut terkirim
			// dari apps/platform & apps/admin (origin berbeda) ke /api/auth/refresh
			// dan /api/auth/logout — wajib dipasangkan dengan credentials:"include"
			// di fetch sisi client (lihat apps/*/src/libs/api-client.ts).
			credentials: true,
		}),
	)
	.get("/", async (c) => {
		return c.json("Hello, hono!");
	})
	// Dipakai Docker HEALTHCHECK dan verifikasi deploy — bukan cuma "proses
	// Node hidup", tapi "API bisa menjawab dan database bisa dijangkau".
	// Tanpa login, tanpa business logic.
	.get("/health", async (c) => {
		try {
			await prisma.$queryRaw`SELECT 1`;
			return c.json({ status: "ok", database: "up" });
		} catch (err) {
			console.error("Health check failed: database unreachable", err);
			return c.json({ status: "error", database: "down" }, 503);
		}
	})
	.route("/", authRoute)
	.route("/", prospectRoute)
	.route("/", activityRoute)
	.route("/", adminRoute)
	.route("/", analyticsRoute)
	.route("/", demoRoute)
	.route("/", draftRoute);

app.onError((err, c) => {
	if (err instanceof AppError) return c.json(err.toBody(), err.status);

	if (err instanceof HTTPException)
		return c.json(
			{ error: { code: "BAD_REQUEST", message: err.message } },
			err.status,
		);

	console.error(err);
	return c.json(
		{
			error: {
				code: "INTERNAL_SERVER_ERROR",
				message: "Something went wrong on the server",
			},
		},
		500,
	);
});

export type AppType = typeof app;
