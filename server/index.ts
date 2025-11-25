import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { serveStatic } from "@hono/node-server/serve-static";
import { apiRouter } from "./routes";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", prettyJSON());
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
);

// Mount API routes
app.route("/api", apiRouter);

// Serve static files from dist directory
app.use(
  "/*",
  serveStatic({
    root: "./dist",
    index: "index.html",
  })
);

// Health check (for API root)
app.get("/api", (c) => {
  return c.json({ message: "ImageToVideoAI API is running!" });
});

// Fallback to index.html for SPA routing
app.get(
  "/*",
  serveStatic({
    path: "./dist/index.html",
  })
);

export default app;
