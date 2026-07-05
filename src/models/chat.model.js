import { db } from "@/lib/firebaseAdmin"; 
import { z } from "zod"; 
import { FieldValue } from "firebase-admin/firestore";

// ==========================================
// 1. ZOD SCHEMAS
// ==========================================

// Schema for a Chat Session (The Sidebar items)
const ChatSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  title: z.string().default("New Chat"),
  createdAt: z.any().optional(), // Accepts Date or Firestore Timestamp
  updatedAt: z.any().optional(),
});

// Schema for Decision Analysis (Structured AI Output)
const DecisionAnalysisSchema = z.object({
  decisionSummary: z.object({
    finalDecision: z.string(),
    decisionScore: z.number(),
    overallRisk: z.enum(["LOW", "MEDIUM", "HIGH"]),
    confidence: z.number(),

    estimatedFinancialRisk: z.string().optional(),
    lawyerReviewRecommended: z.boolean().optional(),
    negotiationRequired: z.boolean().optional(),
  }),

  executiveSummary: z.string(),

  keyRisks: z.array(z.string()),

  missingProtections: z.array(z.string()),

  recommendations: z.array(
    z.object({
      priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
      title: z.string(),
      description: z.string(),
    })
  ),

  whatIfSuggestions: z.array(
    z.object({
      scenario: z.string(),
      impact: z.string(),
      newDecisionScore: z.number().optional(),
      newRisk: z.string().optional(),
    })
  ),

  nextBestActions: z.array(z.string()),

  followUpQuestions: z.array(z.string()),

  clauses: z.array(
    z.object({
      clause: z.string(),
      riskLevel: z.enum(["HIGH", "MEDIUM", "LOW"]),
      severity: z.number(),
      explanation: z.string(),
      businessImpact: z.string(),
      recommendation: z.string(),
    })
  ),
});

// Schema for a Single Message (Inside a Chat)
const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().optional(), // Can be empty if just a file upload
  
  // Cloudinary Attachment
  attachmentUrl: z.string().url().optional().nullable(),
  
  // AI Structured Data (optional)
  analysisData: DecisionAnalysisSchema.optional().nullable(),
  
  createdAt: z.any().optional(),
});

// ==========================================
// 2. CHAT MODEL (Parent Collection)
// ==========================================
class ChatModel {
  constructor() {
    this.collection = db.collection("chats");
  }

  /**
   * Create a new Chat Session
   */
  async create(data) {
    const parsedData = ChatSchema.parse(data);
    
    const docData = {
      ...parsedData,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await this.collection.add(docData);
    return { id: docRef.id, ...docData }; // Return ID immediately
  }

  /**
   * Get all chats for a specific user (For Sidebar)
   * Ordered by 'updatedAt' (Most recent first)
   */
  async findByUser(userId) {
    const snapshot = await this.collection
      .where("userId", "==", userId)
      .orderBy("updatedAt", "desc")
      .get();

    return snapshot.docs.map(doc => this._normalizeDoc(doc));
  }

  /**
   * Get a single chat by ID
   */
  async findById(chatId) {
    const doc = await this.collection.doc(chatId).get();
    if (!doc.exists) return null;
    return this._normalizeDoc(doc);
  }

  /**
   * Update Chat Title or timestamp
   */
  async update(chatId, data) {
    // Determine if we need to update the timestamp
    const updateData = { ...data };
    if (!updateData.updatedAt) {
        updateData.updatedAt = FieldValue.serverTimestamp();
    }
    
    await this.collection.doc(chatId).update(updateData);
  }

  // Delete chat and (optionally) recursively delete sub-collection
  // Note: Recursive delete in Firestore Admin is manual or requires a helper
  async delete(chatId) {
    await this.collection.doc(chatId).delete();
  }

  _normalizeDoc(doc) {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
    };
  }
}

// ==========================================
// 3. MESSAGE MODEL (Sub-Collection)
// ==========================================
class MessageModel {
  // Note: No 'this.collection' because it depends on the chatId

  /**
   * Add a message to a specific chat
   * AND automatically update the parent chat's "updatedAt"
   */
  async create(chatId, data) {
    const parsedData = MessageSchema.parse(data);

    const docData = {
      ...parsedData,
      createdAt: FieldValue.serverTimestamp(),
    };

    // 1. Add to Sub-collection
    const msgRef = await db.collection("chats").doc(chatId).collection("messages").add(docData);

    // 2. Update Parent Chat's "Last Active" time (Crucial for Sidebar sorting)
    await db.collection("chats").doc(chatId).update({
      updatedAt: FieldValue.serverTimestamp()
    });

    return { id: msgRef.id, ...docData };
  }

  /**
   * Get all messages for a chat history
   */
  async findByChatId(chatId) {
    const snapshot = await db.collection("chats")
      .doc(chatId)
      .collection("messages")
      .orderBy("createdAt", "asc") // Oldest first (chronological)
      .get();

    return snapshot.docs.map(doc => this._normalizeDoc(doc));
  }

  _normalizeDoc(doc) {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
    };
  }
}

// ==========================================
// 4. EXPORTS
// ==========================================
export const Chat = new ChatModel();
export const Message = new MessageModel();
export const DecisionAnalysis = DecisionAnalysisSchema; 