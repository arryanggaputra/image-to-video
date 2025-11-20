import { smartScraper, healthz } from "scrapegraph-js";

export interface ScrapedProduct {
  description: string;
  image: string[];
  title: string;
  url: string;
}

export interface ScrapeGraphResponse {
  request_id?: string;
  service?: string;
  status?: string;
  website_url?: string;
  user_prompt?: string;
  result?: {
    products: ScrapedProduct[];
  };
  products?: ScrapedProduct[];
  requested_at?: string;
}

export class ScrapeGraphUtils {
  private readonly API_KEY: string;
  private readonly USER_PROMPT =
    "Extract Product Image, Description, and Title, and product URL, to get the product image, you need to go to product detail, and take the HD image. If there's more than one image, put that as an array.";

  constructor() {
    // Get API key from environment variable
    this.API_KEY = process.env.SCRAPE_GRAPH_API_KEY || "";

    if (!this.API_KEY) {
      throw new Error("SCRAPE_GRAPH_API_KEY environment variable is required");
    }
  }

  /**
   * Scrape products from a given website URL
   * @param websiteUrl - The URL to scrape
   * @returns Promise with scraped product data
   */
  async scrapeProducts(websiteUrl: string): Promise<ScrapeGraphResponse> {
    try {
      console.log(`Starting to scrape: ${websiteUrl}`);

      // Use numberOfScrolls to get more products (similar to playground example)
      const rawResponse = await smartScraper(
        this.API_KEY,
        websiteUrl,
        this.USER_PROMPT,
        undefined, // schema
        2 // numberOfScrolls - same as in your playground example
      );

      // Parse response if it's a string
      const parsedResponse =
        typeof rawResponse === "string" ? JSON.parse(rawResponse) : rawResponse;

      // Handle different response formats
      const response: ScrapeGraphResponse = {
        ...parsedResponse,
        products:
          parsedResponse.products || parsedResponse.result?.products || [],
      };

      console.log(`Scraping completed for: ${websiteUrl}`, {
        request_id: response.request_id,
        status: response.status,
        productsCount: response.products?.length || 0,
      });

      return response;
    } catch (error) {
      console.error("ScrapeGraph API Error:", error);
      throw new Error(
        `Failed to scrape website: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Extract and validate products from ScrapeGraph response
   * @param response - ScrapeGraph API response
   * @returns Array of validated products
   */
  static extractProducts(response: ScrapeGraphResponse): ScrapedProduct[] {
    // Handle both response formats
    const products = response.products || response.result?.products || [];

    if (!products || products.length === 0) {
      console.warn("No products found in ScrapeGraph response");
      return [];
    }

    return products
      .filter((product: any) => {
        // Check for both field naming conventions (title vs product_title)
        const title = product.title || product.product_title;
        const url = product.url || product.product_url;
        const image = product.image || product.product_image;

        // Validate that required fields exist (description can be empty)
        const isValid =
          title && url && Array.isArray(image) && image.length > 0;

        if (!isValid) {
          console.warn("Invalid product data found:", product);
        }

        return isValid;
      })
      .map((product: any): ScrapedProduct => {
        // Normalize field names and use title as fallback for empty description
        const title = product.title || product.product_title;
        const description =
          product.description || product.product_description || title;
        const url = product.url || product.product_url;
        const image = product.image || product.product_image;

        return {
          title,
          description,
          url,
          image,
        };
      });
  }

  /**
   * Check if ScrapeGraph API is available
   * @returns Promise<boolean>
   */
  async healthCheck(): Promise<boolean> {
    try {
      await healthz(this.API_KEY);
      return true;
    } catch (error) {
      console.error("ScrapeGraph health check failed:", error);
      return false;
    }
  }
}

export const scrapeGraphUtils = new ScrapeGraphUtils();
