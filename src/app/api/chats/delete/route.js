import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");

    if (!chatId) {
      return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
    }

    // 1. Verify User Authentication
    const cookieStore = await cookies(); // ✅ Added await for Next.js 15 support
    const token = cookieStore.get("token")?.value || cookieStore.get("refreshToken")?.value;
    
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    const userId = decoded.id;

    // 2. Verify Ownership
    const chatRef = db.collection("chats").doc(chatId);
    const chatDoc = await chatRef.get();

    if (!chatDoc.exists || chatDoc.data().userId !== userId) {
      return NextResponse.json({ error: "Chat not found or unauthorized" }, { status: 403 });
    }

    // 3. Recursive Delete Function (Handles >500 messages)
    // Firestore batches are limited to 500 ops. We must delete in chunks.
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
        // When there are no documents left, resolve the promise
        resolve();
        return;
      }

      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // Recurse on the next process tick, to avoid
      // exploding the stack.
      process.nextTick(() => {
        deleteQueryBatch(db, query, resolve);
      });
    }

    // Start deleting messages in chunks of 400 to be safe
    await deleteCollection(chatRef.collection("messages"), 400);

    // 4. Finally, delete the Chat Document itself
    await chatRef.delete();

    return NextResponse.json({ success: true, message: "Chat deleted successfully" });

  } catch (error) {
    console.error("Delete Chat Error:", error);
    return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 });
  }
}