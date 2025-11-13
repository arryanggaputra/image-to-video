import { Hono } from "hono";
import { db } from "../db";
import { products } from "../schema";
import { eq } from "drizzle-orm";
import { klingAiService } from "../utils/KlingAi/videoService";

const videoController = new Hono();

// Generate video for a product
videoController.post("/generate/:productId", async (c) => {
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

    // Check if video is already being processed
    if (productData.videoStatus === "processing") {
      return c.json(
        {
          success: false,
          error: "Video generation already in progress",
        },
        409
      );
    }

    // Use the first image for video generation
    if (!productData.images || productData.images.length === 0) {
      return c.json(
        {
          success: false,
          error: "Product has no images for video generation",
        },
        400
      );
    }

    const imageUrl = productData.images[0];

    // Update product status to processing
    await db
      .update(products)
      .set({
        videoStatus: "processing",
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId));

    try {
      // Generate video using Kling AI
      const videoResponse = await klingAiService.generateProductVideo(
        imageUrl,
        productData.title,
        productData.description
      );

      if (videoResponse.code === 0 && videoResponse.data.task_id) {
        // Update product with task ID
        await db
          .update(products)
          .set({
            videoTaskId: videoResponse.data.task_id,
            updatedAt: new Date(),
          })
          .where(eq(products.id, productId));

        return c.json({
          success: true,
          data: {
            taskId: videoResponse.data.task_id,
            status: videoResponse.data.task_status,
            message: "Video generation started successfully",
          },
        });
      } else {
        // Update status to error
        await db
          .update(products)
          .set({
            videoStatus: "error",
            updatedAt: new Date(),
          })
          .where(eq(products.id, productId));

        return c.json(
          {
            success: false,
            error: videoResponse.message || "Failed to start video generation",
          },
          500
        );
      }
    } catch (error) {
      // Update status to error on exception
      await db
        .update(products)
        .set({
          videoStatus: "error",
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId));

      console.error("Video generation error:", error);
      return c.json(
        {
          success: false,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        },
        500
      );
    }
  } catch (error) {
    console.error("Video generation endpoint error:", error);
    return c.json(
      {
        success: false,
        error: "Internal server error",
      },
      500
    );
  }
});

// Check video status for a product
videoController.get("/status/:productId", async (c) => {
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

    // If there's no task ID, return current status
    if (!productData.videoTaskId) {
      return c.json({
        success: true,
        data: {
          videoStatus: productData.videoStatus,
          videoUrl: productData.videoUrl,
        },
      });
    }

    // If status is already finished or error, return cached result
    if (
      productData.videoStatus === "finish" ||
      productData.videoStatus === "error"
    ) {
      return c.json({
        success: true,
        data: {
          videoStatus: productData.videoStatus,
          videoUrl: productData.videoUrl,
          taskId: productData.videoTaskId,
        },
      });
    }

    try {
      // Check status with Kling AI
      const statusResponse = await klingAiService.getTaskStatus(
        productData.videoTaskId
      );

      if (statusResponse.code === 0) {
        let newVideoStatus: "unavailable" | "processing" | "finish" | "error" =
          productData.videoStatus;
        let videoUrl = productData.videoUrl;

        // Map Kling AI status to our status
        switch (statusResponse.data.task_status) {
          case "submitted":
          case "processing":
            newVideoStatus = "processing";
            break;
          case "succeed":
            newVideoStatus = "finish";
            if (
              statusResponse.data.task_result?.videos &&
              statusResponse.data.task_result.videos.length > 0
            ) {
              videoUrl = statusResponse.data.task_result.videos[0].url;
            }
            break;
          case "failed":
            newVideoStatus = "error";
            break;
        }

        // Update database if status changed
        if (
          newVideoStatus !== productData.videoStatus ||
          videoUrl !== productData.videoUrl
        ) {
          await db
            .update(products)
            .set({
              videoStatus: newVideoStatus,
              videoUrl: videoUrl,
              updatedAt: new Date(),
            })
            .where(eq(products.id, productId));
        }

        return c.json({
          success: true,
          data: {
            videoStatus: newVideoStatus,
            videoUrl: videoUrl,
            taskId: productData.videoTaskId,
            taskStatus: statusResponse.data.task_status,
            statusMessage: statusResponse.data.task_status_msg,
          },
        });
      } else {
        return c.json(
          {
            success: false,
            error: statusResponse.message || "Failed to check video status",
          },
          500
        );
      }
    } catch (error) {
      console.error("Video status check error:", error);
      return c.json({
        success: true, // Return success with current cached status
        data: {
          videoStatus: productData.videoStatus,
          videoUrl: productData.videoUrl,
          taskId: productData.videoTaskId,
          error: "Failed to check latest status",
        },
      });
    }
  } catch (error) {
    console.error("Video status endpoint error:", error);
    return c.json(
      {
        success: false,
        error: "Internal server error",
      },
      500
    );
  }
});

// Get all products with video status for a domain
videoController.get("/domain/:domainId", async (c) => {
  try {
    const domainId = parseInt(c.req.param("domainId"));

    if (isNaN(domainId)) {
      return c.json({ success: false, error: "Invalid domain ID" }, 400);
    }

    const productsWithVideo = await db
      .select({
        id: products.id,
        title: products.title,
        description: products.description,
        url: products.url,
        images: products.images,
        videoStatus: products.videoStatus,
        videoUrl: products.videoUrl,
        videoTaskId: products.videoTaskId,
      })
      .from(products)
      .where(eq(products.domainId, domainId));

    return c.json({
      success: true,
      data: productsWithVideo,
    });
  } catch (error) {
    console.error("Domain video status error:", error);
    return c.json(
      {
        success: false,
        error: "Internal server error",
      },
      500
    );
  }
});

export default videoController;
