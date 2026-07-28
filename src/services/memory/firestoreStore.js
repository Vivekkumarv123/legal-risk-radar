import { db } from "@/lib/firebaseAdmin";
import { DEFAULT_PROFILE } from "../cpe/types.js";
import { Timestamp } from "firebase-admin/firestore";

export class FirestoreStore {
  /**
   * Fetch chat document and profile from `/chats/{chatId}`
   * @param {string} chatId 
   * @returns {Promise<Object>}
   */
  static async getChatSession(chatId) {
    if (!chatId || !db) return null;
    try {
      const docRef = db.collection("chats").doc(chatId);
      const doc = await docRef.get();
      if (!doc.exists) return null;

      const data = doc.data();
      return {
        chatId: doc.id,
        userId: data.userId || null,
        title: data.title || "New Conversation",
        profile: data.profile ? { ...DEFAULT_PROFILE, ...data.profile } : { ...DEFAULT_PROFILE },
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : null,
      };
    } catch (error) {
      console.error(`❌ FirestoreStore.getChatSession error for ${chatId}:`, error.message);
      return null;
    }
  }

  /**
   * Fetch last N messages for conversation context window
   * @param {string} chatId 
   * @param {number} limitCount 
   * @returns {Promise<Array<Object>>}
   */
  static async getRecentMessages(chatId, limitCount = 10) {
    if (!chatId || !db) return [];
    try {
      const snapshot = await db.collection("chats")
        .doc(chatId)
        .collection("messages")
        .orderBy("createdAt", "desc")
        .limit(limitCount)
        .get();

      const messages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          role: data.role || (data.sender === 'user' ? 'user' : 'assistant'),
          content: data.content || "",
          metadata: data.metadata || {},
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        };
      });

      // Reverse to return in chronological order (oldest -> newest)
      return messages.reverse();
    } catch (error) {
      console.error(`❌ FirestoreStore.getRecentMessages error for ${chatId}:`, error.message);
      return [];
    }
  }

  /**
   * Persists/Merges updated Conversation Profile state into `/chats/{chatId}`
   * @param {string} chatId 
   * @param {Object} profile 
   */
  static async updateChatProfile(chatId, profile) {
    if (!chatId || !db || !profile) return;
    try {
      const docRef = db.collection("chats").doc(chatId);
      await docRef.set({
        profile: {
          primaryLanguage: profile.primaryLanguage || 'hinglish',
          scriptPreference: profile.scriptPreference || 'latin',
          conversationTone: profile.conversationTone || 'friendly',
          personaIntensity: profile.personaIntensity ?? 0.6,
          legalExpertise: profile.legalExpertise || 'layman',
          responseLength: profile.responseLength || 'balanced',
          codeSwitchIndex: profile.codeSwitchIndex ?? 0.5,
          ewmaLanguageVector: profile.ewmaLanguageVector || {},
          profileConfidence: profile.profileConfidence ?? 0.2,
          turnCount: profile.turnCount ?? 0,
          explicitLocks: profile.explicitLocks || {},
          lastUpdated: Timestamp.now(),
        },
        updatedAt: Timestamp.now(),
      }, { merge: true });
    } catch (error) {
      console.error(`❌ FirestoreStore.updateChatProfile error for ${chatId}:`, error.message);
    }
  }

  /**
   * Save user/assistant message to `/chats/{chatId}/messages` subcollection
   * @param {string} chatId 
   * @param {Object} message 
   * @returns {Promise<string|null>} message ID
   */
  static async saveMessage(chatId, message) {
    if (!chatId || !db || !message) return null;
    try {
      const messagesRef = db.collection("chats").doc(chatId).collection("messages");
      const docData = {
        role: message.role || (message.sender === 'user' ? 'user' : 'assistant'),
        sender: message.sender || message.role || 'user',
        content: message.content || "",
        analysisData: message.analysisData || null,
        attachmentUrl: message.attachmentUrl || null,
        metadata: message.metadata || {},
        createdAt: Timestamp.now(),
      };
      const newDoc = await messagesRef.add(docData);

      // Touch parent chat document updatedAt
      await db.collection("chats").doc(chatId).set({
        updatedAt: Timestamp.now(),
      }, { merge: true });

      return newDoc.id;
    } catch (error) {
      console.error(`❌ FirestoreStore.saveMessage error for ${chatId}:`, error.message);
      return null;
    }
  }
}
