import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

app.get("/", async (c) => {
	return c.json("Hello, hono!");
});

serve(
	{
		fetch: app.fetch,
		port: 8000,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	},
);
