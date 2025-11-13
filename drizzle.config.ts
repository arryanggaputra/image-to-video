import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./server/schema.ts",
  out: "./server/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL || "./dev.db",
  },
});
