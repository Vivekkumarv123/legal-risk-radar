import jwt from "jsonwebtoken";

/**
 * Generate a short-lived OAuth2 access token for the Google Cloud Platform API
 * using the configured Firebase Service Account Key.
 */
async function getAccessTokenFromServiceAccount() {
  const credentialsJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!credentialsJson) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_KEY environment variable");
  }

  const credentials = JSON.parse(credentialsJson);
  if (!credentials.private_key || !credentials.client_email) {
    throw new Error("Invalid service account credentials structure");
  }

  const tokenUrl = "https://oauth2.googleapis.com/token";
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600; // 1 hour token validity

  const payload = {
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: tokenUrl,
    exp,
    iat
  };

  // Sign using the RS256 algorithm (RSA with SHA-256)
  const signedJwt = jwt.sign(payload, credentials.private_key, { algorithm: "RS256" });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${signedJwt}`
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(`Google OAuth error: ${data.error_description || data.error}`);
  }
  return data.access_token;
}

/**
 * Extract text from a document/image buffer using Google Cloud Vision DOCUMENT_TEXT_DETECTION.
 */
export async function detectTextFromBuffer(buffer) {
  try {
    const base64Image = buffer.toString("base64");
    const accessToken = await getAccessTokenFromServiceAccount();

    const url = "https://vision.googleapis.com/v1/images:annotate";
    const body = {
      requests: [
        {
          image: {
            content: base64Image
          },
          features: [
            {
              type: "DOCUMENT_TEXT_DETECTION"
            }
          ]
        }
      ]
    };

    console.log("[GCP Vision] Initiating Document Text Annotation request...");
    const startTime = Date.now();

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const result = await response.json();
    const duration = Date.now() - startTime;
    console.log(`[GCP Vision] Request completed in ${duration}ms.`);

    const errorResult = result.responses?.[0]?.error;
    if (errorResult) {
      throw new Error(`Cloud Vision API error: ${errorResult.message} (code ${errorResult.code})`);
    }

    const fullTextAnnotation = result.responses?.[0]?.fullTextAnnotation;
    const extractedText = fullTextAnnotation?.text || "";

    return extractedText.trim();
  } catch (error) {
    console.error("[GCP Vision Service Error]:", error.message);
    throw error; // Let callers catch and fallback to local Tesseract OCR
  }
}
