import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { env } from "./config/env";
import { AppError } from "./exceptions";
import activityRoute from "./modules/activity/activity.route";
import adminRoute from "./modules/admin/admin.route";
import analyticsRoute from "./modules/analytics/analytics.route";
import authRoute from "./modules/auth/auth.route";
import prospectRoute from "./modules/prospect/prospect.route";

export const app = new Hono()
	.use(
		"*",
		cors({
			origin: env.corsOrigins,
			allowHeaders: ["Content-Type", "Authorization"],
			allowMethods: ["GET", "POST", "PATCH", "DELETE"],
		}),
	)
	.get("/", async (c) => {
		return c.json("Hello, hono!");
	})
	.route("/", authRoute)
	.route("/", prospectRoute)
	.route("/", activityRoute)
	.route("/", adminRoute)
	.route("/", analyticsRoute);

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
				message: "Terjadi kesalahan pada server",
			},
		},
		500,
	);
});

export type AppType = typeof app;
