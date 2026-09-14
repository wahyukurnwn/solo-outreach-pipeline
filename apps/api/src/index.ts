import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { AppError } from "./exceptions";
import activityRoute from "./modules/activity/activity.route";
import adminRoute from "./modules/admin/admin.route";
import authRoute from "./modules/auth/auth.route";
import prospectRoute from "./modules/prospect/prospect.route";

const app = new Hono();

app
	.get("/", async (c) => {
		return c.json("Hello, hono!");
	})
	.route("/", authRoute)
	.route("/", prospectRoute)
	.route("/", activityRoute)
	.route("/", adminRoute);

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

serve(
	{
		fetch: app.fetch,
		port: 8000,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	},
);
