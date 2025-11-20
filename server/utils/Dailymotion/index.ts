import { objectToFormData } from "../form";

export const postPartnerLogin = async (): Promise<{
  scope: string;
  access_token: string;
  expires_in: number;
  refresh_token: null;
  token_type: string;
}> => {
  try {
    const clientId = process.env.DAILYMOTION_CLIENT_ID;
    const clientSecret = process.env.DAILYMOTION_CLIENT_SECRET;

    console.log("Attempting Dailymotion authentication with client ID:", {
      clientId,
      clientSecret,
    });

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    const urlencoded = new URLSearchParams();
    urlencoded.append("client_id", `${clientId}`);
    urlencoded.append("client_secret", `${clientSecret}`);
    urlencoded.append("grant_type", "client_credentials");
    urlencoded.append("scope", "manage_videos");

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow" as RequestRedirect,
    };

    const response = await fetch(
      `https://partner.api.dailymotion.com/oauth/v1/token`,
      requestOptions
    );

    const responseText = await response.json();
    console.log("Dailymotion auth response status:", response.status);
    console.log(
      "Dailymotion auth response headers:",
      Object.fromEntries(response.headers)
    );
    console.log("Dailymotion auth response:", responseText);

    let authResult;
    try {
      authResult = responseText;
    } catch (parseError) {
      console.error("Failed to parse auth response:", responseText);
      throw new Error(
        `Invalid response from Dailymotion auth: ${responseText}`
      );
    }

    if (!response.ok || authResult.error || authResult.error_message) {
      console.error("Dailymotion authentication failed:", authResult);
      throw new Error(
        `Authentication failed: ${
          authResult.error_message || authResult.error || "Unknown error"
        }`
      );
    }

    if (!authResult.access_token) {
      throw new Error("No access token received from Dailymotion");
    }

    console.log(
      "Dailymotion authentication successful, scope:",
      authResult.scope
    );

    return {
      scope: authResult.scope,
      access_token: authResult.access_token,
      expires_in: authResult.expires_in,
      refresh_token: authResult.refresh_token,
      token_type: authResult.token_type,
    };
  } catch (error) {
    console.error("Dailymotion authentication error:", error);
    throw error;
  }
};

export const postPublishVideo = async (params: {
  title: string;
  description: string;
  url: string;
  thumbnail_url: string;
  channel: "creation";
  language: "en";
  is_created_for_kids: "false";
  private: "true";
}): Promise<{
  id: string;
  status: "processing" | "published" | "error";
  title: string;
  publishing_progress: number;
  created_time: number;
  private_id: string;
}> => {
  try {
    console.log("Publishing video to Dailymotion with params:", {
      ...params,
      url: params.url.substring(0, 50) + "...", // Truncate URL for logging
    });

    // Get authentication token
    const theToken = await postPartnerLogin();
    console.log("Got token with scope:", theToken.scope);

    // Prepare form data
    const formData = new URLSearchParams();
    formData.append("title", params.title);
    formData.append("description", params.description);
    formData.append("url", params.url);
    formData.append("thumbnail_url", params.thumbnail_url);
    formData.append("channel", params.channel);
    formData.append("language", params.language);
    formData.append("is_created_for_kids", params.is_created_for_kids);
    formData.append("private", params.private);
    formData.append("published", "true");
    formData.append(
      "fields",
      "status,id,title,publishing_progress,created_time,private_id"
    );

    const uploadHeaders = new Headers();
    uploadHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    uploadHeaders.append("Authorization", `Bearer ${theToken.access_token}`);

    console.log("Making request to Dailymotion API...");
    const response = await fetch(
      `https://partner.api.dailymotion.com/rest/user/${process.env.DAILYMOTION_USER_ID}/videos`,
      {
        method: "POST",
        body: formData.toString(),
        headers: uploadHeaders,
      }
    );

    const responseText = await response.text();
    console.log("Dailymotion publish response status:", response.status);
    console.log("Dailymotion publish response:", responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }

      console.error("Dailymotion API error:", errorData);
      throw new Error(
        `Dailymotion API error: ${
          errorData.error_message || errorData.reason || "Unknown error"
        }`
      );
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error(`Failed to parse response: ${responseText}`);
    }

    console.log("Video published successfully:", result);
    return result;
  } catch (error) {
    console.error("Video publishing failed:", error);
    throw error;
  }
};
