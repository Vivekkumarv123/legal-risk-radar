import { db } from "@/lib/firebaseAdmin"; // Import your DB connection
import { z } from "zod"; // You'll need: npm install zod

// ==========================================
// 1. THE SCHEMA (Replaces Mongoose Schema)
// ==========================================
const UserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().optional(), // Optional if provider is 'google'
  
  provider: z.enum(["local", "google"]).default("local"),
  role: z.string().default("user"),
  
  avatar: z.string().url().optional(),
  refreshToken: z.string().optional(),
  
  // OTP Fields
  resetOtp: z.string().optional(),
  resetOtpExpiry: z.date().optional(),
  
  // Timestamps (Handled manually in Firestore)
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// ==========================================
// 2. THE MODEL (Replaces Mongoose Model)
// ==========================================
class UserModel {
  constructor() {
    this.collection = db.collection("users");
  }

  /**
   * Mimics mongoose.create()
   * Checks for unique email before saving
   */
  async create(data) {
    // 1. Validate Input
    const parsedData = UserSchema.parse(data);

    // 2. Check Uniqueness (Simulates { unique: true })
    const existing = await this.findOne({ email: parsedData.email });
    if (existing) {
      throw new Error("User with this email already exists");
    }

    // 3. Add Timestamps
    const now = new Date();
    const docData = {
      ...parsedData,
      createdAt: now,
      updatedAt: now,
    };

    // 4. Save to Firestore
    const docRef = await this.collection.add(docData);
    
    // Return the object with its new ID
    return { id: docRef.id, ...docData };
  }

  /**
   * Mimics mongoose.findOne({ email: ... })
   */
  async findOne(filter) {
    let query = this.collection;

    // Apply filters (e.g., where "email" == "...")
    Object.keys(filter).forEach((key) => {
      query = query.where(key, "==", filter[key]);
    });

    const snapshot = await query.limit(1).get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return this._normalizeDoc(doc);
  }

  /**
   * Mimics mongoose.findById()
   */
  async findById(id) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return this._normalizeDoc(doc);
  }

  /**
   * Mimics mongoose.findByIdAndUpdate()
   */
  async update(id, data) {
    // Validate partial updates if needed, or just update directly
    const updateData = {
      ...data,
      updatedAt: new Date(), // Update timestamp
    };

    await this.collection.doc(id).update(updateData);
    return this.findById(id);
  }

  /**
   * Helper: Converts Firestore doc to plain JS object
   * Needed because Firestore timestamps break Next.js serialization
   */
  _normalizeDoc(doc) {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      // Convert Firestore Timestamps to standard JS Dates
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
      resetOtpExpiry: data.resetOtpExpiry?.toDate ? data.resetOtpExpiry.toDate() : data.resetOtpExpiry,
    };
  }
}

// Export a singleton instance (or the class itself if you prefer)
export const User = new UserModel();