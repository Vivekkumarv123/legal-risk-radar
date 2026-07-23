import { db } from "@/lib/firebaseAdmin";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";

// ==========================================
// 1. ZOD SCHEMA
// ==========================================

const FeedbackSchema = z.object({
  name: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),

  rating: z
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),

  message: z.string().min(1, "Feedback message is required"),

  isAnonymous: z.boolean().default(false),

  createdAt: z.any().optional(), // Firestore Timestamp
});

// ==========================================
// 2. FEEDBACK MODEL (Collection)
// ==========================================

class FeedbackModel {
  constructor() {
    this.collection = db.collection("feedback");
  }

  /**
   * Create new feedback (No Login required)
   */
  async create(data) {
    const parsedData = FeedbackSchema.parse(data);

    const docData = {
      ...parsedData,
      name: parsedData.isAnonymous ? null : parsedData.name ?? null,
      email: parsedData.isAnonymous ? null : parsedData.email ?? null,
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await this.collection.add(docData);

    return {
      id: docRef.id,
      ...docData,
    };
  }

  /**
   * Get all feedback (Admin / Internal use)
   * Ordered by newest first
   */
  async findAll() {
    const snapshot = await this.collection
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map((doc) => this._normalizeDoc(doc));
  }

  /**
   * Get single feedback by ID
   */
  async findById(feedbackId) {
    const doc = await this.collection.doc(feedbackId).get();
    if (!doc.exists) return null;

    return this._normalizeDoc(doc);
  }

  /**
   * Delete feedback (Admin use later)
   */
  async delete(feedbackId) {
    await this.collection.doc(feedbackId).delete();
  }

  // ----------------------------------------
  // Helpers
  // ----------------------------------------
  _normalizeDoc(doc) {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate
        ? data.createdAt.toDate()
        : data.createdAt,
    };
  }
}

// ==========================================
// 3. EXPORT
// ==========================================

export const Feedback = new FeedbackModel();
