import { db } from "@/lib/firebaseAdmin"; 
import { z } from "zod"; 
import { FieldValue } from "firebase-admin/firestore";

// ==========================================
// 1. ZOD SCHEMAS
// ==========================================

const SubscriptionSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  planId: z.string().min(1, "Plan ID is required"),
  planName: z.string().min(1, "Plan name is required"),
  status: z.enum(["active", "cancelled", "expired", "pending"]),
  startDate: z.any().optional(),
  endDate: z.any().optional(),
  price: z.number().min(0),
  currency: z.string().default("INR"),
  paymentId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  stripeCustomerId: z.string().optional(),
  features: z.object({
    aiQueries: z.number().default(-1), // -1 means unlimited
    documentAnalysis: z.boolean().default(false),
    voiceQueries: z.boolean().default(false),
    pdfReports: z.boolean().default(false),
    prioritySupport: z.boolean().default(false),
    apiAccess: z.boolean().default(false),
    teamCollaboration: z.number().default(0), // Number of team members
    contractComparison: z.boolean().default(false),
    chromeExtension: z.boolean().default(false),
    newsletter: z.boolean().default(false),
  }),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

const UsageSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  month: z.string().min(1, "Month is required"), // Format: YYYY-MM
  aiQueries: z.number().default(0),
  documentsAnalyzed: z.number().default(0),
  voiceQueries: z.number().default(0),
  pdfReportsGenerated: z.number().default(0),
  contractComparisons: z.number().default(0),
  glossaryLookups: z.number().default(0),
  dailyContractComparisons: z.record(z.number()).optional(),
  dailyGlossaryLookups: z.record(z.number()).optional(),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

// ==========================================
// 2. SUBSCRIPTION MODEL
// ==========================================
class SubscriptionModel {
  constructor() {
    this.collection = db.collection("subscriptions");
  }

  /**
   * Create a new subscription
   */
  async create(data) {
    const parsedData = SubscriptionSchema.parse(data);
    
    const docData = {
      ...parsedData,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await this.collection.add(docData);
    return { id: docRef.id, ...docData };
  }

  /**
   * Get user's active subscription
   */
  async findActiveByUser(userId) {
    const snapshot = await this.collection
      .where("userId", "==", userId)
      .where("status", "==", "active")
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return this._normalizeDoc(snapshot.docs[0]);
  }

  /**
   * Get all subscriptions for a user
   */
  async findByUser(userId) {
    const snapshot = await this.collection
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map(doc => this._normalizeDoc(doc));
  }

  /**
   * Update subscription
   */
  async update(subscriptionId, data) {
    const updateData = {
      ...data,
      updatedAt: FieldValue.serverTimestamp()
    };

    await this.collection.doc(subscriptionId).update(updateData);
    return { id: subscriptionId, ...updateData };
  }

  /**
   * Cancel subscription
   */
  async cancel(subscriptionId) {
    await this.collection.doc(subscriptionId).update({
      status: "cancelled",
      updatedAt: FieldValue.serverTimestamp()
    });
  }

  /**
   * Find subscription by Stripe subscription ID
   */
  async findByStripeId(stripeSubscriptionId) {
    const snapshot = await this.collection
      .where("stripeSubscriptionId", "==", stripeSubscriptionId)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return this._normalizeDoc(snapshot.docs[0]);
  }

  /**
   * Check if subscription is expired
   */
  isExpired(subscription) {
    if (!subscription.endDate) return false;
    const now = new Date();
    const endDate = subscription.endDate.toDate ? subscription.endDate.toDate() : new Date(subscription.endDate);
    return now > endDate;
  }

  _normalizeDoc(doc) {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
      startDate: data.startDate?.toDate ? data.startDate.toDate() : data.startDate,
      endDate: data.endDate?.toDate ? data.endDate.toDate() : data.endDate,
    };
  }
}

// ==========================================
// 3. USAGE MODEL
// ==========================================
class UsageModel {
  constructor() {
    this.collection = db.collection("usage");
  }

  /**
   * Get or create usage record for current month
   */
  async getCurrentMonthUsage(userId) {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    const snapshot = await this.collection
      .where("userId", "==", userId)
      .where("month", "==", currentMonth)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      return this._normalizeDoc(snapshot.docs[0]);
    }

    // Create new usage record
    const usageData = {
      userId,
      month: currentMonth,
      aiQueries: 0,
      documentsAnalyzed: 0,
      voiceQueries: 0,
      pdfReportsGenerated: 0,
      contractComparisons: 0,
      glossaryLookups: 0,
      dailyContractComparisons: {},
      dailyGlossaryLookups: {},
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await this.collection.add(usageData);
    return { id: docRef.id, ...usageData };
  }

  /**
   * Increment usage counter
   */
  async incrementUsage(userId, field, amount = 1) {
    const usage = await this.getCurrentMonthUsage(userId);
    
    const updateData = {
      [field]: FieldValue.increment(amount),
      updatedAt: FieldValue.serverTimestamp()
    };

    await this.collection.doc(usage.id).update(updateData);
    
    return {
      ...usage,
      [field]: usage[field] + amount
    };
  }

  /**
   * Increment daily usage counter inside current month's usage doc
   */
  async incrementDailyUsage(userId, field, dateKey, amount = 1) {
    const usage = await this.getCurrentMonthUsage(userId);
    const updateData = {
      [`${field}.${dateKey}`]: FieldValue.increment(amount),
      updatedAt: FieldValue.serverTimestamp()
    };

    await this.collection.doc(usage.id).update(updateData);

    const currentDaily = (usage[field] && usage[field][dateKey]) || 0;
    return {
      ...usage,
      [field]: {
        ...(usage[field] || {}),
        [dateKey]: currentDaily + amount
      }
    };
  }

  /**
   * Get usage history for user
   */
  async getUsageHistory(userId, months = 6) {
    const snapshot = await this.collection
      .where("userId", "==", userId)
      .orderBy("month", "desc")
      .limit(months)
      .get();

    return snapshot.docs.map(doc => this._normalizeDoc(doc));
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
// 4. PLAN DEFINITIONS
// ==========================================
export const PLANS = {
  basic: {
    id: "basic",
    name: "Basic",
    price: 0,
    currency: "INR",
    interval: "month",
    description: "Essential legal guidance for individuals",
    features: {
      aiQueries: 5, // 5 per day
      documentAnalysis: false,
      voiceQueries: false,
      pdfReports: false,
      prioritySupport: false,
      apiAccess: false,
      teamCollaboration: 0,
      contractComparison: false,
      chromeExtension: false,
      newsletter: false,
    },
    limits: {
      dailyQueries: 5,
      monthlyDocuments: 0,
      pdfReportsMonthly: 0,
      dailyContractComparisons: 1,
      dailyGlossaryLookups: 10,
    }
  },
  pro: {
    id: "pro",
    name: "Pro Advisor",
    price: 499,
    currency: "INR",
    interval: "month",
    description: "For freelancers and proactive professionals",
    features: {
      aiQueries: -1, // Unlimited
      documentAnalysis: true,
      voiceQueries: true,
      pdfReports: true,
      prioritySupport: true,
      apiAccess: false,
      teamCollaboration: 0,
      contractComparison: true,
      chromeExtension: true,
      newsletter: false,
    },
    limits: {
      dailyQueries: -1, // Unlimited
      monthlyDocuments: 50,
      pdfReportsMonthly: 20,
      dailyContractComparisons: -1,
      dailyGlossaryLookups: -1,
    }
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: 2499,
    currency: "INR",
    interval: "month",
    description: "For small firms and legal teams",
    features: {
      aiQueries: -1, // Unlimited
      documentAnalysis: true,
      voiceQueries: true,
      pdfReports: true,
      prioritySupport: true,
      apiAccess: true,
      teamCollaboration: 5,
      contractComparison: true,
      chromeExtension: true,
      newsletter: true,
    },
    limits: {
      dailyQueries: -1, // Unlimited
      monthlyDocuments: -1, // Unlimited
      pdfReportsMonthly: -1, // Unlimited
      dailyContractComparisons: -1,
      dailyGlossaryLookups: -1,
    }
  }
};

export const Subscription = new SubscriptionModel();
export const Usage = new UsageModel();
