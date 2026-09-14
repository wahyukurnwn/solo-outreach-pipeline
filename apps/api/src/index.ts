import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { config } from "dotenv";

config({
  path: "../../.env",
});

const app = new Hono();

console.log("Logging: -----", process.env.TEST);

app.get("/", (c) => {
  return c.text("Hello Hono!");
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
