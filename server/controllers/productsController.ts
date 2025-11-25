import { Context } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db";
import {
  products,
  insertProductSchema,
  updateProductSchema,
  type NewProduct,
} from "../schema";

export class ProductsController {
  // GET /api/products - Get all products
  static async getAllProducts(c: Context) {
    try {
      const allProducts = await db
        .select()
        .from(products)
        .orderBy(products.createdAt);
      return c.json({ success: true, data: allProducts });
    } catch (error) {
      console.error("Error fetching products:", error);
      return c.json({ success: false, error: "Failed to fetch products" }, 500);
    }
  }

  // GET /api/products/domain/:domainId - Get products by domain ID
  static async getProductsByDomain(c: Context) {
    try {
      const domainId = parseInt(c.req.param("domainId"));
      if (isNaN(domainId)) {
        return c.json({ success: false, error: "Invalid domain ID" }, 400);
      }

      const domainProducts = await db
        .select()
        .from(products)
        .where(eq(products.domainId, domainId))
        .orderBy(products.createdAt);

      return c.json({ success: true, data: domainProducts });
    } catch (error) {
      console.error("Error fetching products by domain:", error);
      return c.json(
        {
          success: false,
          error: "Failed to fetch products for domain",
        },
        500
      );
    }
  }

  // GET /api/products/:id - Get single product
  static async getProductById(c: Context) {
    try {
      const id = parseInt(c.req.param("id"));
      if (isNaN(id)) {
        return c.json({ success: false, error: "Invalid ID" }, 400);
      }

      const product = await db
        .select()
        .from(products)
        .where(eq(products.id, id))
        .limit(1);

      if (product.length === 0) {
        return c.json({ success: false, error: "Product not found" }, 404);
      }

      return c.json({ success: true, data: product[0] });
    } catch (error) {
      console.error("Error fetching product:", error);
      return c.json({ success: false, error: "Failed to fetch product" }, 500);
    }
  }

  // POST /api/products - Create new product
  static async createProduct(c: Context) {
    try {
      const body = await c.req.json();
      const parsed = insertProductSchema.safeParse(body);

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

      const newProduct = {
        ...parsed.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as NewProduct;

      const result = await db.insert(products).values(newProduct).returning();
      return c.json({ success: true, data: result[0] }, 201);
    } catch (error) {
      console.error("Error creating product:", error);
      return c.json({ success: false, error: "Failed to create product" }, 500);
    }
  }

  // POST /api/products/bulk - Create multiple products
  static async createBulkProducts(c: Context) {
    try {
      const body = await c.req.json();

      if (!Array.isArray(body)) {
        return c.json(
          {
            success: false,
            error: "Request body must be an array of products",
          },
          400
        );
      }

      const validatedProducts: NewProduct[] = [];
      const validationErrors: any[] = [];

      // Validate each product
      for (let i = 0; i < body.length; i++) {
        const parsed = insertProductSchema.safeParse(body[i]);
        if (parsed.success) {
          validatedProducts.push({
            ...parsed.data,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as NewProduct);
        } else {
          validationErrors.push({
            index: i,
            product: body[i],
            errors: parsed.error.format(),
          });
        }
      }

      if (validationErrors.length > 0) {
        return c.json(
          {
            success: false,
            error: "Some products have validation errors",
            validationErrors,
          },
          400
        );
      }

      if (validatedProducts.length === 0) {
        return c.json(
          {
            success: false,
            error: "No valid products to insert",
          },
          400
        );
      }

      const result = await db
        .insert(products)
        .values(validatedProducts)
        .returning();
      return c.json(
        {
          success: true,
          data: result,
          count: result.length,
        },
        201
      );
    } catch (error) {
      console.error("Error creating bulk products:", error);
      return c.json(
        { success: false, error: "Failed to create products" },
        500
      );
    }
  }

  // PUT /api/products/:id - Update product
  static async updateProduct(c: Context) {
    try {
      const id = parseInt(c.req.param("id"));
      if (isNaN(id)) {
        return c.json({ success: false, error: "Invalid ID" }, 400);
      }

      const body = await c.req.json();
      const parsed = updateProductSchema.safeParse(body);

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
        .update(products)
        .set(updateData)
        .where(eq(products.id, id))
        .returning();

      if (result.length === 0) {
        return c.json({ success: false, error: "Product not found" }, 404);
      }

      return c.json({ success: true, data: result[0] });
    } catch (error) {
      console.error("Error updating product:", error);
      return c.json({ success: false, error: "Failed to update product" }, 500);
    }
  }

  // DELETE /api/products/:id - Delete product
  static async deleteProduct(c: Context) {
    try {
      const id = parseInt(c.req.param("id"));
      if (isNaN(id)) {
        return c.json({ success: false, error: "Invalid ID" }, 400);
      }

      const result = await db
        .delete(products)
        .where(eq(products.id, id))
        .returning();

      if (result.length === 0) {
        return c.json({ success: false, error: "Product not found" }, 404);
      }

      return c.json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      return c.json({ success: false, error: "Failed to delete product" }, 500);
    }
  }

  // DELETE /api/products/domain/:domainId - Delete all products for a domain
  static async deleteProductsByDomain(c: Context) {
    try {
      const domainId = parseInt(c.req.param("domainId"));
      if (isNaN(domainId)) {
        return c.json({ success: false, error: "Invalid domain ID" }, 400);
      }

      const result = await db
        .delete(products)
        .where(eq(products.domainId, domainId))
        .returning();

      return c.json({
        success: true,
        message: `Deleted ${result.length} products for domain ${domainId}`,
        deletedCount: result.length,
      });
    } catch (error) {
      console.error("Error deleting products by domain:", error);
      return c.json(
        {
          success: false,
          error: "Failed to delete products for domain",
        },
        500
      );
    }
  }
}
