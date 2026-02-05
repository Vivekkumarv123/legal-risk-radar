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

// 🤖 Create one client per key with validation
const clients = API_KEYS.map((key, index) => {
  try {
    const client = new GoogleGenerativeAI(key);
    return client;
  } catch (error) {
    console.error(`❌ Failed to initialize Gemini client ${index + 1}:`, error.message);
    return null;
  }
}).filter(Boolean); // Remove null clients

if (clients.length === 0) {
  throw new Error("Failed to initialize any Gemini API clients. Check your API keys.");
}

// 🔄 Round-robin rotation with validation
let index = 0;
function getClient() {
  if (clients.length === 0) {
    throw new Error("No valid Gemini API clients available");
  }
  const client = clients[index];
  index = (index + 1) % clients.length;
  
  // Validate client has required methods
  if (!client || typeof client.getGenerativeModel !== 'function') {
    throw new Error("Invalid Gemini API client - missing getGenerativeModel method");
  }
  
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
      
      // Validate client before using
      if (!ai || typeof ai.getGenerativeModel !== 'function') {
        throw new Error("Invalid Gemini client - getGenerativeModel method not available");
      }
      
      const model = ai.getGenerativeModel({ model: modelName });
      const response = await model.generateContent(prompt);
      
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
      // Extract key information for better title generation
      const content = documentContext || userMessage;
      const isContract = /contract|agreement|terms|conditions/i.test(content);
      const isNDA = /non.?disclosure|confidentiality|nda/i.test(content);
      const isEmployment = /employment|job|salary|work|employee/i.test(content);
      const isLease = /lease|rent|property|landlord|tenant/i.test(content);
      const isLegal = /legal|law|clause|liability|indemnity/i.test(content);
      
      let titleHint = "";
      if (isNDA) titleHint = "Focus on NDA/confidentiality aspects";
      else if (isEmployment) titleHint = "Focus on employment/work aspects";
      else if (isLease) titleHint = "Focus on lease/rental aspects";
      else if (isContract) titleHint = "Focus on contract type";
      else if (isLegal) titleHint = "Focus on legal document type";

      const prompt = `
        Generate a concise, descriptive title (max 4-6 words) for this legal consultation.
        
        User Message: "${userMessage.substring(0, 150)}"
        Document Context: "${content.substring(0, 300)}..."
        ${titleHint ? `Hint: ${titleHint}` : ""}
        
        Rules:
        1. Keep it under 30 characters
        2. Make it specific and descriptive
        3. Use title case
        4. Focus on the main legal topic/document type
        5. Examples: "Employment Contract Review", "NDA Risk Analysis", "Lease Agreement Help", "Contract Terms Query", "Legal Clause Question"
        
        Return ONLY the title, nothing else.
      `;

      const result = await callWithFallback(CHAT_MODEL, prompt);
      let title = result.trim().replace(/['"]/g, ''); // Remove quotes
      
      // Clean up common AI response patterns
      title = title.replace(/^(Title:|Chat Title:|Here's the title:)/i, '').trim();
      
      // Fallback if title is too long or empty
      if (!title || title.length > 35) {
        // Generate smart fallback based on content
        if (isNDA) return "NDA Review";
        if (isEmployment) return "Employment Contract";
        if (isLease) return "Lease Agreement";
        if (isContract) return "Contract Analysis";
        if (isLegal) return "Legal Document";
        return userMessage.substring(0, 25) + "...";
      }
      
      return title;
    } catch (error) {
      console.error("Title generation error:", error);
      // Smart fallback based on content analysis
      const content = (documentContext || userMessage).toLowerCase();
      if (content.includes('nda') || content.includes('confidential')) return "NDA Review";
      if (content.includes('employment') || content.includes('job')) return "Employment Contract";
      if (content.includes('lease') || content.includes('rent')) return "Lease Agreement";
      if (content.includes('contract') || content.includes('agreement')) return "Contract Analysis";
      return userMessage.substring(0, 25) + "...";
    }
  }, 2, 1000); // Fewer retries for title generation since it's not critical
}