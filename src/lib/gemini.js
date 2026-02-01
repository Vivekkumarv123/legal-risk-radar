import { GoogleGenAI } from "@google/genai";

// 🔑 API key pool (free-tier rotation)
const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean);

if (API_KEYS.length === 0) {
  throw new Error("No Gemini API keys configured");
}

// 🤖 Create one client per key
const clients = API_KEYS.map(
  (key) => new GoogleGenAI({ apiKey: key })
);

// 🔄 Round-robin rotation
let index = 0;
function getClient() {
  const client = clients[index];
  index = (index + 1) % clients.length;
  return client;
}

// 📌 Correct Gemini model names
const CHAT_MODEL = "gemini-1.5-flash";
const LIVE_MODEL = "gemini-1.5-flash";

// --------------------
// Normal Chat
// --------------------
export async function callGemini(prompt) {
  const ai = getClient();

  try {
    const model = ai.getGenerativeModel({ model: CHAT_MODEL });
    const response = await model.generateContent(prompt);
    return response.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(`Gemini API failed: ${error.message}`);
  }
}

// --------------------
// Live / Voice Chat
// --------------------
export async function callLiveGemini(prompt) {
  const ai = getClient();

  try {
    const model = ai.getGenerativeModel({ model: LIVE_MODEL });
    const response = await model.generateContent(prompt);
    return response.response.text();
  } catch (error) {
    console.error("Gemini Live Error:", error);
    throw new Error("Failed to generate content");
  }
}
