import { db } from "@/lib/firebaseAdmin"; 
import { z } from "zod"; 
import { FieldValue } from "firebase-admin/firestore";

// ==========================================
// 1. ZOD SCHEMAS
// ==========================================

const SharedChatSchema = z.object({
  originalChatId: z.string().min(1, "Original chat ID is required"),
  userId: z.string().min(1, "User ID is required"),
  title: z.string().min(1, "Title is required"),
  shareId: z.string().min(1, "Share ID is required"), // Unique identifier for sharing
  isPublic: z.boolean().default(true),
  allowComments: z.boolean().default(false),
  expiresAt: z.any().optional().nullable(), // Optional expiration date
  viewCount: z.number().default(0),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

// ==========================================
// 2. SHARED CHAT MODEL
// ==========================================
class SharedChatModel {
  constructor() {
    this.collection = db.collection("sharedChats");
  }

  /**
   * Create a new shared chat
   */
  async create(data) {
    const parsedData = SharedChatSchema.parse(data);
    
    const docData = {
      ...parsedData,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await this.collection.add(docData);
    return { id: docRef.id, ...docData };
  }

  /**
   * Find shared chat by shareId
   */
  async findByShareId(shareId) {
    const snapshot = await this.collection
      .where("shareId", "==", shareId)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return this._normalizeDoc(snapshot.docs[0]);
  }

  /**
   * Get all shared chats by user
   */
  async findByUser(userId) {
    const snapshot = await this.collection
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map(doc => this._normalizeDoc(doc));
  }

  /**
   * Update shared chat
   */
  async update(shareId, data) {
    const snapshot = await this.collection
      .where("shareId", "==", shareId)
      .limit(1)
      .get();

    if (snapshot.empty) throw new Error("Shared chat not found");

    const docRef = snapshot.docs[0].ref;
    const updateData = {
      ...data,
      updatedAt: FieldValue.serverTimestamp()
    };

    await docRef.update(updateData);
    return { shareId, ...updateData };
  }

  /**
   * Increment view count
   */
  async incrementViewCount(shareId) {
    const snapshot = await this.collection
      .where("shareId", "==", shareId)
      .limit(1)
      .get();

    if (snapshot.empty) return;

    const docRef = snapshot.docs[0].ref;
    await docRef.update({
      viewCount: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp()
    });
  }

  /**
   * Delete shared chat
   */
  async delete(shareId) {
    const snapshot = await this.collection
      .where("shareId", "==", shareId)
      .limit(1)
      .get();

    if (snapshot.empty) throw new Error("Shared chat not found");

    await snapshot.docs[0].ref.delete();
  }

  /**
   * Check if chat is expired
   */
  isExpired(sharedChat) {
    if (!sharedChat.expiresAt) return false;
    const now = new Date();
    const expiresAt = sharedChat.expiresAt.toDate ? sharedChat.expiresAt.toDate() : new Date(sharedChat.expiresAt);
    return now > expiresAt;
  }

  _normalizeDoc(doc) {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
      expiresAt: data.expiresAt?.toDate ? data.expiresAt.toDate() : data.expiresAt,
    };
  }
}

export const SharedChat = new SharedChatModel();