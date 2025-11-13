import { Context } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { domains, insertDomainSchema, type NewDomain } from "../schema";

export class DomainsController {
  // GET /api/domains - Get all domains
  static async getAllDomains(c: Context) {
    try {
      const allDomains = await db
        .select()
        .from(domains)
        .orderBy(domains.createdAt);
      return c.json({ success: true, data: allDomains });
    } catch (error) {
      console.error("Error fetching domains:", error);
      return c.json({ success: false, error: "Failed to fetch domains" }, 500);
    }
  }

  // GET /api/domains/:id - Get single domain
  static async getDomainById(c: Context) {
    try {
      const id = parseInt(c.req.param("id"));
      if (isNaN(id)) {
        return c.json({ success: false, error: "Invalid ID" }, 400);
      }

      const domain = await db
        .select()
        .from(domains)
        .where(eq(domains.id, id))
        .limit(1);

      if (domain.length === 0) {
        return c.json({ success: false, error: "Domain not found" }, 404);
      }

      return c.json({ success: true, data: domain[0] });
    } catch (error) {
      console.error("Error fetching domain:", error);
      return c.json({ success: false, error: "Failed to fetch domain" }, 500);
    }
  }

  // POST /api/domains - Create new domain
  static async createDomain(c: Context) {
    try {
      const body = await c.req.json();
      const parsed = insertDomainSchema.safeParse(body);

      if (!parsed.success) {
        return c.json(
          {
            success: false,
            error: "Invalid input",
            details: parsed.error.format(),
          },
          400
        );
      }

      const newDomain = {
        ...parsed.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as NewDomain;

      const result = await db.insert(domains).values(newDomain).returning();
      return c.json({ success: true, data: result[0] }, 201);
    } catch (error) {
      console.error("Error creating domain:", error);
      return c.json({ success: false, error: "Failed to create domain" }, 500);
    }
  }

  // PUT /api/domains/:id - Update domain
  static async updateDomain(c: Context) {
    try {
      const id = parseInt(c.req.param("id"));
      if (isNaN(id)) {
        return c.json({ success: false, error: "Invalid ID" }, 400);
      }

      const body = await c.req.json();
      const parsed = insertDomainSchema.partial().safeParse(body);

      if (!parsed.success) {
        return c.json(
          {
            success: false,
            error: "Invalid input",
            details: parsed.error.format(),
          },
          400
        );
      }

      const updateData = {
        ...parsed.data,
        updatedAt: new Date(),
      };

      const result = await db
        .update(domains)
        .set(updateData)
        .where(eq(domains.id, id))
        .returning();

      if (result.length === 0) {
        return c.json({ success: false, error: "Domain not found" }, 404);
      }

      return c.json({ success: true, data: result[0] });
    } catch (error) {
      console.error("Error updating domain:", error);
      return c.json({ success: false, error: "Failed to update domain" }, 500);
    }
  }

  // DELETE /api/domains/:id - Delete domain
  static async deleteDomain(c: Context) {
    try {
      const id = parseInt(c.req.param("id"));
      if (isNaN(id)) {
        return c.json({ success: false, error: "Invalid ID" }, 400);
      }

      const result = await db
        .delete(domains)
        .where(eq(domains.id, id))
        .returning();

      if (result.length === 0) {
        return c.json({ success: false, error: "Domain not found" }, 404);
      }

      return c.json({ success: true, message: "Domain deleted successfully" });
    } catch (error) {
      console.error("Error deleting domain:", error);
      return c.json({ success: false, error: "Failed to delete domain" }, 500);
    }
  }
}
