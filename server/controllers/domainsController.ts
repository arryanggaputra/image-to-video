import { Context } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db";
import {
  domains,
  products,
  insertDomainSchema,
  type NewDomain,
  type NewProduct,
} from "../schema";
import { scrapeGraphUtils, ScrapeGraphUtils } from "../utils/scrapeGraphUtils";

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
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as NewDomain;

      // Insert domain first
      const result = await db.insert(domains).values(newDomain).returning();
      const createdDomain = result[0];

      // Start scraping process asynchronously
      DomainsController.startScraping(
        createdDomain.id,
        createdDomain.url
      ).catch((error) => {
        console.error(`Failed to scrape domain ${createdDomain.id}:`, error);
      });

      return c.json({ success: true, data: createdDomain }, 201);
    } catch (error) {
      console.error("Error creating domain:", error);
      return c.json({ success: false, error: "Failed to create domain" }, 500);
    }
  }

  // Private method to handle scraping process
  private static async startScraping(domainId: number, url: string) {
    try {
      // Update status to processing
      await db
        .update(domains)
        .set({ status: "processing", updatedAt: new Date() })
        .where(eq(domains.id, domainId));

      console.log(`Starting scraping for domain ${domainId}: ${url}`);

      // Perform scraping
      const scrapeResponse = await scrapeGraphUtils.scrapeProducts(url);

      // Update status to generating (processing scraped data)
      await db
        .update(domains)
        .set({ status: "generating", updatedAt: new Date() })
        .where(eq(domains.id, domainId));

      // Extract and validate products
      const scrapedProducts = ScrapeGraphUtils.extractProducts(scrapeResponse);

      if (scrapedProducts.length === 0) {
        console.warn(`No products found for domain ${domainId}`);
        await db
          .update(domains)
          .set({ status: "complete", updatedAt: new Date() })
          .where(eq(domains.id, domainId));
        return;
      }

      // Convert scraped products to database format
      const productsToInsert: NewProduct[] = scrapedProducts.map((product) => ({
        domainId,
        title: product.title,
        description: product.description,
        url: product.url,
        images: product.image, // This is already an array
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      // Insert products in bulk
      await db.insert(products).values(productsToInsert);

      // Update domain status to complete
      await db
        .update(domains)
        .set({ status: "complete", updatedAt: new Date() })
        .where(eq(domains.id, domainId));

      console.log(
        `Successfully scraped ${scrapedProducts.length} products for domain ${domainId}`
      );
    } catch (error) {
      console.error(`Error scraping domain ${domainId}:`, error);

      // Update status to error
      await db
        .update(domains)
        .set({ status: "error", updatedAt: new Date() })
        .where(eq(domains.id, domainId));
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

  // GET /api/domains/:id/with-products - Get domain with its products
  static async getDomainWithProducts(c: Context) {
    try {
      const id = parseInt(c.req.param("id"));
      if (isNaN(id)) {
        return c.json({ success: false, error: "Invalid ID" }, 400);
      }

      // Get domain
      const domain = await db
        .select()
        .from(domains)
        .where(eq(domains.id, id))
        .limit(1);

      if (domain.length === 0) {
        return c.json({ success: false, error: "Domain not found" }, 404);
      }

      // Get products for this domain
      const domainProducts = await db
        .select()
        .from(products)
        .where(eq(products.domainId, id))
        .orderBy(products.createdAt);

      const domainWithProducts = {
        ...domain[0],
        products: domainProducts,
        productCount: domainProducts.length,
      };

      return c.json({ success: true, data: domainWithProducts });
    } catch (error) {
      console.error("Error fetching domain with products:", error);
      return c.json(
        { success: false, error: "Failed to fetch domain with products" },
        500
      );
    }
  }
}
