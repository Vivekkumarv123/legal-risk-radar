import { GoogleGenerativeAI } from "@google/generative-ai";

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
  (key) => new GoogleGenerativeAI(key)
);

// 🔄 Round-robin rotation
let index = 0;
function getClient() {
  const client = clients[index];
  index = (index + 1) % clients.length;
  return client;
}

// 📌 Models required by hackathon
const CHAT_MODEL = "gemini-3-flash-preview";
const LIVE_MODEL = "gemini-2.5-flash-lite";
// Fallback models in case primary models are overloaded
const FALLBACK_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];

// --------------------
// Retry Logic with Exponential Backoff
// --------------------
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isRetryableError = 
        error.message.includes('503') || 
        error.message.includes('overloaded') ||
        error.message.includes('rate limit') ||
        error.message.includes('quota exceeded') ||
        error.message.includes('temporarily unavailable');

      if (attempt === maxRetries || !isRetryableError) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      console.log(`Attempt ${attempt} failed, retrying in ${Math.round(delay)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// --------------------
// Try with fallback models if primary fails
// --------------------
async function callWithFallback(primaryModel, prompt, maxRetries = 2) {
  const modelsToTry = [primaryModel, ...FALLBACK_MODELS];
  
  for (let i = 0; i < modelsToTry.length; i++) {
    const modelName = modelsToTry[i];
    
    try {
      const ai = getClient();
      const model = ai.getGenerativeModel({ model: modelName });
      const response = await model.generateContent(prompt);
      
      if (i > 0) {
        console.log(`✅ Successfully used fallback model: ${modelName}`);
      }
      
      return response.response.text();
    } catch (error) {
      console.error(`❌ Model ${modelName} failed:`, error.message);
      
      // If this is the last model and we've exhausted retries, throw error
      if (i === modelsToTry.length - 1) {
        throw error;
      }
      
      // Wait a bit before trying next model
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// --------------------
// Normal Chat
// --------------------
export async function callGemini(prompt) {
  return await retryWithBackoff(async () => {
    return await callWithFallback(CHAT_MODEL, prompt);
  }, 3, 2000); // 3 retries, starting with 2 second delay
}

// --------------------
// Live / Voice Chat
// --------------------
export async function callLiveGemini(prompt) {
  return await retryWithBackoff(async () => {
    return await callWithFallback(LIVE_MODEL, prompt);
  }, 3, 1500);
}

// --------------------
// Generate Chat Title
// --------------------
export async function generateChatTitle(userMessage, documentContext = "") {
  return await retryWithBackoff(async () => {
    try {
      const prompt = `
        Generate a concise, descriptive title (max 4-6 words) for this chat based on the user's message and document context.
        
        User Message: "${userMessage}"
        Document Context: "${documentContext.substring(0, 200)}..."
        
        Rules:
        1. Keep it under 25 characters
        2. Make it specific and descriptive
        3. Use title case
        4. Focus on the main topic/document type
        5. Examples: "Employment Contract Review", "NDA Risk Analysis", "Lease Agreement Questions"
        
        Return ONLY the title, nothing else.
      `;

      const result = await callWithFallback(CHAT_MODEL, prompt);
      const title = result.trim();
      
      // Fallback if title is too long or empty
      if (!title || title.length > 50) {
        return userMessage.substring(0, 30) + "...";
      }
      
      return title;
    } catch (error) {
      console.error("Title generation error:", error);
      // Fallback to truncated user message
      return userMessage.substring(0, 30) + "...";
    }
  }, 2, 1000); // Fewer retries for title generation since it's not critical
}