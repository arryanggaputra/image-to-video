import jwt from "jsonwebtoken";

export function getApiToken(): string {
  const accessKey = process.env.KLING_AI_ACCESS_KEY;
  const secretKey = process.env.KLING_AI_SECRET_KEY;

  if (!accessKey || !secretKey) {
    throw new Error(
      "KLING_AI_ACCESS_KEY and KLING_AI_SECRET_KEY environment variables are required"
    );
  }

  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: accessKey,
    exp: now + 1800, // expires in 30 minutes
    nbf: now - 5, // valid starting 5s ago
  };

  const token = jwt.sign(payload, secretKey, { header });
  return token;
}

// Example usage
