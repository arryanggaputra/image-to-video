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

// Products table for scraped product data
export const products = sqliteTable("products", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  domainId: integer("domain_id")
    .notNull()
    .references(() => domains.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  url: text("url").notNull(),
  images: text("images", { mode: "json" }).$type<string[]>().notNull(), // JSON array of image URLs
  videoStatus: text("video_status", {
    enum: ["unavailable", "processing", "finish", "error"],
  })
    .notNull()
    .default("unavailable"),
  videoUrl: text("video_url"), // Generated video URL
  videoTaskId: text("video_task_id"), // Kling AI task ID for tracking
  dailymotionId: text("dailymotion_id"), // Dailymotion video ID
  dailymotionStatus: text("dailymotion_status", {
    enum: ["not_published", "publishing", "published", "error"],
  })
    .notNull()
    .default("not_published"),
  dailymotionUrl: text("dailymotion_url"), // Dailymotion video URL
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Zod schemas for products
export const insertProductSchema = createInsertSchema(products, {
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  url: z.string().url("Invalid URL format"),
  images: z
    .array(z.string().url("Invalid image URL"))
    .min(1, "At least one image is required"),
  domainId: z.number().positive("Domain ID must be positive"),
  videoStatus: z
    .enum(["unavailable", "processing", "finish", "error"])
    .optional(),
  videoUrl: z.string().url("Invalid video URL").optional().nullable(),
  videoTaskId: z.string().optional().nullable(),
  dailymotionId: z.string().optional().nullable(),
  dailymotionStatus: z
    .enum(["not_published", "publishing", "published", "error"])
    .optional(),
  dailymotionUrl: z
    .string()
    .url("Invalid Dailymotion URL")
    .optional()
    .nullable(),
});

export const updateProductSchema = insertProductSchema.partial().extend({
  images: z.array(z.string().url("Invalid image URL")).optional(),
});

export const selectProductSchema = createSelectSchema(products);

export type Product = z.infer<typeof selectProductSchema>;
export type NewProduct = z.infer<typeof insertProductSchema>;
