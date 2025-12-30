import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function DELETE(req) {
  try {
    // 1. Verify User via Cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || cookieStore.get("refreshToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    const userId = decoded.id;

    if (!userId) {
      return NextResponse.json({ error: "Invalid Token" }, { status: 403 });
    }

    // ==================================================================
    // HELPER: Recursive Delete Function (For Sub-collections > 500 docs)
    // ==================================================================
    async function deleteCollection(collectionRef, batchSize) {
      const query = collectionRef.orderBy('__name__').limit(batchSize);

      return new Promise((resolve, reject) => {
        deleteQueryBatch(db, query, resolve).catch(reject);
      });
    }

    async function deleteQueryBatch(db, query, resolve) {
      const snapshot = await query.get();

      const batchSize = snapshot.size;
      if (batchSize === 0) {
        resolve();
        return;
      }

      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      process.nextTick(() => {
        deleteQueryBatch(db, query, resolve);
      });
    }

    // ==================================================================
    // STEP 2: DELETE ALL CHATS & MESSAGES
    // ==================================================================
    
    // Get all chats belonging to this user
    const chatsSnapshot = await db.collection("chats").where("userId", "==", userId).get();

    // Loop through every chat to delete its messages first
    const chatDeletionPromises = chatsSnapshot.docs.map(async (doc) => {
      const chatRef = doc.ref;
      
      // A. Delete the 'messages' sub-collection recursively
      await deleteCollection(chatRef.collection("messages"), 400);
      
      // B. Delete the chat document itself
      return chatRef.delete();
    });

    // Wait for all chats to be deleted
    await Promise.all(chatDeletionPromises);

    // ==================================================================
    // STEP 3: DELETE USER DATA & USAGE LIMITS
    // ==================================================================

    const batch = db.batch();

    // Delete Usage Stats
    const usageRef = db.collection("usage_limits").doc(`user_${userId}`);
    batch.delete(usageRef);

    // Delete User Profile
    const userRef = db.collection("users").doc(userId);
    batch.delete(userRef);

    await batch.commit();

    // ==================================================================
    // STEP 4: CLEAR COOKIE & RESPOND
    // ==================================================================
    
    cookieStore.delete("token"); // Log the user out
    cookieStore.delete("refreshToken");

    return NextResponse.json({ success: true, message: "Account deleted successfully" });

  } catch (error) {
    console.error("Delete Account Error:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}