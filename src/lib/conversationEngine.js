import { FastPreClassifier } from "@/services/cpe/fastClassifier.js";
import { LanguageEngine } from "@/services/cpe/languageEngine.js";
import { FirestoreStore } from "@/services/memory/firestoreStore.js";
import { buildGeminiSystemInstruction } from "@/services/llm/promptBuilder.js";
import { executeWithKeyRotation } from "./geminiKeyRotation.js";

// Official Project Model Configurations
const CHAT_MODEL = "gemini-3.1-flash-lite";
const FALLBACK_MODELS = ["gemini-3.5-flash", "gemini-2.5-flash", "gemini-2.5-flash-lite"];

/**
 * Execute Gemini API call with official self-healing fallback protocol
 * @param {string} prompt 
 * @param {string} systemInstruction 
 * @returns {Promise<string>}
 */
async function callGeminiWithFallback(prompt, systemInstruction) {
  const modelsToTry = [CHAT_MODEL, ...FALLBACK_MODELS];

  for (let i = 0; i < modelsToTry.length; i++) {
    const modelName = modelsToTry[i];

    try {
      const responseText = await executeWithKeyRotation(async (ai) => {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction: systemInstruction,
          },
        });
        return response.text;
      });

      return responseText;
    } catch (error) {
      console.error(`❌ Model ${modelName} failed in conversationEngine:`, error.message);

      if (i === modelsToTry.length - 1) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  }
}

/**
 * Main Native Multilingual Conversation Orchestrator
 * Handles full lifecycle: Fast Classifier -> Firestore Load -> EWMA Profile -> Gemini Call -> Feedback Loop -> Persist
 * 
 * @param {Object} params
 * @param {string} params.chatId
 * @param {string} params.userId
 * @param {string} params.message
 * @param {string} [params.attachmentUrl]
 * @returns {Promise<Object>} { assistantResponse, profile, messageId }
 */
export async function handleMultilingualConversation({ chatId, userId, message, attachmentUrl = null }) {
  if (!chatId || !message) {
    throw new Error("chatId and message are required for handleMultilingualConversation");
  }

  // 1. Fetch Chat Session Profile & Message History from Firestore
  const chatSession = await FirestoreStore.getChatSession(chatId);
  const currentProfile = chatSession?.profile || {};
  const recentMessages = await FirestoreStore.getRecentMessages(chatId, 10);

  // 2. Fast Pre-Classifier Analysis (< 1ms execution)
  const preClassResult = FastPreClassifier.analyze(message);

  // 3. Update Conversation Profile State (EWMA + Composite Matrix + Adaptive Hysteresis)
  const updatedProfile = LanguageEngine.updateProfile(currentProfile, message, preClassResult, recentMessages);

  // 4. Save User Message & Update Profile in Firestore (Async / Parallel)
  const saveUserMsgPromise = FirestoreStore.saveMessage(chatId, {
    role: 'user',
    sender: 'user',
    content: message,
    attachmentUrl,
    metadata: {
      detectedLanguage: preClassResult.detectedLanguage,
      script: preClassResult.script,
      isExplicitOverride: preClassResult.isExplicitOverride,
    },
  });

  const updateProfilePromise = FirestoreStore.updateChatProfile(chatId, updatedProfile);
  await Promise.all([saveUserMsgPromise, updateProfilePromise]);

  // 5. Build Dynamic System Instructions for Gemini API
  const systemInstruction = buildGeminiSystemInstruction(updatedProfile);

  // 6. Build History Context Window for Gemini Prompt
  let formattedHistory = "";
  if (recentMessages.length > 0) {
    formattedHistory = "=== CONVERSATION HISTORY ===\n" + recentMessages.map(m => {
      const roleName = m.role === 'user' ? 'User' : 'Assistant';
      return `${roleName}: ${m.content}`;
    }).join("\n") + "\n\n";
  }

  const prompt = `${formattedHistory}=== CURRENT USER QUERY ===\nUser: ${message}`;

  // 7. Invoke Gemini API using gemini-3.1-flash-lite & Fallback Protocol
  const assistantResponse = await callGeminiWithFallback(prompt, systemInstruction);

  // 8. Run Assistant Response Feedback Loop
  const reinforcedProfile = LanguageEngine.processAssistantFeedback(updatedProfile, assistantResponse);

  // 9. Save Assistant Response & Reinforced Profile to Firestore
  const assistantMsgId = await FirestoreStore.saveMessage(chatId, {
    role: 'assistant',
    sender: 'assistant',
    content: assistantResponse,
    metadata: {
      primaryLanguage: reinforcedProfile.primaryLanguage,
      scriptPreference: reinforcedProfile.scriptPreference,
      confidence: reinforcedProfile.profileConfidence,
    },
  });

  await FirestoreStore.updateChatProfile(chatId, reinforcedProfile);

  return {
    success: true,
    chatId,
    assistantResponse,
    profile: reinforcedProfile,
    messageId: assistantMsgId,
  };
}
