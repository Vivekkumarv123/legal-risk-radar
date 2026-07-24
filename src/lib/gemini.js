import { executeWithKeyRotation } from "./geminiKeyRotation.js";

// 📌 Models configuration
const CHAT_MODEL = "gemini-3.1-flash-lite";
const LIVE_MODEL = "gemini-3.1-flash-lite";
export const WEBSOCKET_LIVE_MODEL = "models/gemini-3.1-flash-live-preview";
// Fallback models in case primary models are overloaded
const FALLBACK_MODELS = ["gemini-3.5-flash", "gemini-2.5-flash", "gemini-2.5-flash-lite"];

// --------------------
// Try with fallback models if primary model fails
// Self-Healing Multi-Agent Fallback Protocol
// --------------------
async function callWithFallback(primaryModel, prompt) {
  const modelsToTry = [primaryModel, ...FALLBACK_MODELS];

  for (let i = 0; i < modelsToTry.length; i++) {
    const modelName = modelsToTry[i];

    try {
      const responseText = await executeWithKeyRotation(async (ai) => {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
        });
        return response.text;
      });

      return responseText;
    } catch (error) {
      console.error(`❌ Model ${modelName} failed:`, error.message);

      // If this is the last model and we've exhausted options, throw error
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
  return await callWithFallback(CHAT_MODEL, prompt);
}

// --------------------
// Live / Voice Chat
// --------------------
export async function callLiveGemini(prompt) {
  return await callWithFallback(LIVE_MODEL, prompt);
}

// --------------------
// Generate Chat Title
// --------------------
export async function generateChatTitle(userMessage, documentContext = "") {
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
}