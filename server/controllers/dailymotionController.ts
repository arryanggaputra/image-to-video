import { Hono } from "hono";
import { db } from "../db";
import { products } from "../schema";
import { eq } from "drizzle-orm";
import { postPublishVideo } from "../utils/Dailymotion";

const dailymotionController = new Hono();

// Publish video to Dailymotion for a product
dailymotionController.post("/publish/:productId", async (c) => {
  try {
    const productId = parseInt(c.req.param("productId"));

    if (isNaN(productId)) {
      return c.json({ success: false, error: "Invalid product ID" }, 400);
    }

    // Get the product from database
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (product.length === 0) {
      return c.json({ success: false, error: "Product not found" }, 404);
    }

    const productData = product[0];

    // Check if video is available for publishing
    if (productData.videoStatus !== "finish" || !productData.videoUrl) {
      return c.json(
        {
          success: false,
          error: "No video available for publishing. Generate video first.",
        },
        400
      );
    }

    // Check if already published or publishing
    if (productData.dailymotionStatus === "publishing") {
      return c.json(
        {
          success: false,
          error: "Video is already being published to Dailymotion",
        },
        409
      );
    }

    if (
      productData.dailymotionStatus === "published" &&
      productData.dailymotionId
    ) {
      return c.json(
        {
          success: false,
          error: "Video is already published to Dailymotion",
        },
        409
      );
    }

    // Update status to publishing
    await db
      .update(products)
      .set({
        dailymotionStatus: "publishing",
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId));

    try {
      // Prepare data for Dailymotion API
      const publishParams = {
        title: productData.title,
        description: productData.description,
        url: productData.videoUrl,
        thumbnail_url: productData.images[0] || "", // Use first product image as thumbnail
        channel: "creation" as const,
        language: "en" as const,
        is_created_for_kids: "false" as const,
        private: "true" as const, // Initially private
      };

      console.log(`Publishing product ${productId} to Dailymotion:`, {
        title: publishParams.title,
        videoUrl: publishParams.url.substring(0, 50) + "...",
        thumbnailUrl: publishParams.thumbnail_url.substring(0, 50) + "...",
      });

      // Publish to Dailymotion
      const dailymotionResponse = await postPublishVideo(publishParams);

      if (dailymotionResponse.id) {
        // Generate Dailymotion URL from ID
        const dailymotionUrl = `https://www.dailymotion.com/video/${dailymotionResponse.id}`;

        console.log(`Successfully published to Dailymotion: ${dailymotionUrl}`);

        // Update product with Dailymotion details
        await db
          .update(products)
          .set({
            dailymotionId: dailymotionResponse.id,
            dailymotionUrl: dailymotionUrl,
            dailymotionStatus: "published",
            updatedAt: new Date(),
          })
          .where(eq(products.id, productId));

        return c.json({
          success: true,
          data: {
            id: dailymotionResponse.id,
            status: dailymotionResponse.status,
            message: "Video published to Dailymotion successfully",
            url: dailymotionUrl,
          },
        });
      } else {
        console.error(
          "No ID returned from Dailymotion API:",
          dailymotionResponse
        );

        // Update status to error
        await db
          .update(products)
          .set({
            dailymotionStatus: "error",
            updatedAt: new Date(),
          })
          .where(eq(products.id, productId));

        return c.json(
          {
            success: false,
            error: "Failed to publish to Dailymotion - no video ID returned",
          },
          500
        );
      }
    } catch (error) {
      console.error("Dailymotion publishing error:", error);

      // Extract meaningful error message
      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null) {
        errorMessage = JSON.stringify(error);
      }

      // Update status to error on exception
      await db
        .update(products)
        .set({
          dailymotionStatus: "error",
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId));

      return c.json(
        {
          success: false,
          error: `Dailymotion publishing failed: ${errorMessage}`,
        },
        500
      );
    }
  } catch (error) {
    console.error("Dailymotion publish endpoint error:", error);
    return c.json(
      {
        success: false,
        error: "Internal server error",
      },
      500
    );
  }
});

// Check Dailymotion status for a product
dailymotionController.get("/status/:productId", async (c) => {
  try {
    const productId = parseInt(c.req.param("productId"));

    if (isNaN(productId)) {
      return c.json({ success: false, error: "Invalid product ID" }, 400);
    }

    // Get the product from database
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (product.length === 0) {
      return c.json({ success: false, error: "Product not found" }, 404);
    }

    const productData = product[0];

    return c.json({
      success: true,
      data: {
        dailymotionStatus: productData.dailymotionStatus,
        dailymotionUrl: productData.dailymotionUrl,
        dailymotionId: productData.dailymotionId,
      },
    });
  } catch (error) {
    console.error("Dailymotion status endpoint error:", error);
    return c.json(
      {
        success: false,
        error: "Internal server error",
      },
      500
    );
  }
});

export default dailymotionController;
