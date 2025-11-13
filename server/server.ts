import { serve } from "@hono/node-server";
import app from "./index";

const port = Number(process.env.PORT) || 8000;

console.log(`🚀 Server starting on port ${port}`);

serve({
  fetch: app.fetch,
  port: port,
});
