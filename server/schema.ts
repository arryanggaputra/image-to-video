import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const domains = sqliteTable("domains", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  url: text("url").notNull(),
  status: text("status", {
    enum: ["pending", "processing", "generating", "complete", "error"],
  })
    .notNull()
    .default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Zod schemas for validation
export const insertDomainSchema = createInsertSchema(domains, {
  url: z.string().url("Invalid URL format"),
  status: z
    .enum(["pending", "processing", "generating", "complete", "error"])
    .optional(),
});

export const selectDomainSchema = createSelectSchema(domains);

export type Domain = z.infer<typeof selectDomainSchema>;
export type NewDomain = z.infer<typeof insertDomainSchema>;
