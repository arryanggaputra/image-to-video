import { getApiToken } from "./token";

export interface KlingVideoRequest {
  model_name: "kling-v2-5-turbo";
  mode: "pro" | "std";
  duration: "5" | "10";
  image: string; // Base64 encoded image
  prompt: string;
  cfg_scale?: number; // 0.1-1.0, default 0.5
  static_mask?: string; // Optional static mask URL
  dynamic_masks?: Array<{
    mask: string;
    trajectories: Array<{ x: number; y: number }>;
  }>;
}

export interface KlingVideoResponse {
  code: number;
  message: string;
  data: {
    task_id: string;
    task_status: "submitted" | "processing" | "succeed" | "failed";
    created_at: number;
    updated_at: number;
    task_status_msg?: string;
    task_result?: {
      videos: Array<{
        id: string;
        url: string;
        duration: number;
      }>;
    };
  };
}

export class KlingAiService {
  private readonly baseUrl = "https://api-singapore.klingai.com/v1";

  /**
   * Convert image URL to base64 string
   */
  private async imageUrlToBase64(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch image: ${response.status} ${response.statusText}`
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      // Return just the base64 string (Kling AI may not expect data URL format)
      return base64;
    } catch (error) {
      console.error("Error converting image to base64:", error);
      throw new Error(
        `Failed to convert image to base64: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Submit a video generation task
   */
  async createImageToVideo(
    request: KlingVideoRequest
  ): Promise<KlingVideoResponse> {
    const token = getApiToken();

    try {
      const response = await fetch(`${this.baseUrl}/videos/image2video`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Kling AI API error response:", errorText);
        console.error("Request payload:", JSON.stringify(request, null, 2));
        throw new Error(
          `Kling AI API error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data: KlingVideoResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Kling AI video generation error:", error);
      throw new Error(
        `Failed to create video: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Check the status of a video generation task
   */
  async getTaskStatus(taskId: string): Promise<KlingVideoResponse> {
    const token = getApiToken();

    try {
      const response = await fetch(
        `${this.baseUrl}/videos/image2video/${taskId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Kling AI API error: ${response.status} ${response.statusText}`
        );
      }

      const data: KlingVideoResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Kling AI task status error:", error);
      throw new Error(
        `Failed to get task status: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Generate a video from product image with auto-generated prompt
   */
  async generateProductVideo(
    imageUrl: string,
    productTitle: string,
    productDescription: string
  ): Promise<KlingVideoResponse> {
    // Convert image URL to base64
    const base64Image = await this.imageUrlToBase64(imageUrl);

    // Generate an appropriate prompt for the product
    const prompt = this.getPrompt();

    const request: KlingVideoRequest = {
      model_name: "kling-v2-5-turbo",
      mode: "pro",
      duration: "10",
      image: base64Image,
      prompt,
      cfg_scale: 0.5,
    };

    return this.createImageToVideo(request);
  }

  /**
   * Generate a prompt from product information
   */
  private getPrompt(): string {
    return `The subject should remain realistic and detailed — keep all text, logos, and labels perfectly clear and unchanged.Use creative but realistic motion, such as:A subtle parallax effect, as if the camera gently moves around the product (without showing unseen sides). Soft dynamic lighting, like a slow light sweep across the surface to highlight gloss and texture.Shallow depth of field, with a slight focus shift from top to bottom or front to back. Avoid any rotation or label distortion. Keep the camera motion cinematic, not static zoom.`;
  }
}

export const klingAiService = new KlingAiService();
