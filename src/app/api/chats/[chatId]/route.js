import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET(req, { params }) {
  try {
    // 1. Get Chat ID from URL
    const { chatId } = await params; 
    
    // 2. Get Token from Cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || 
                  cookieStore.get("accessToken")?.value || 
                  cookieStore.get("refreshToken")?.value;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Verify Token
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    
    // 4. Check Chat Ownership (Security)
    // We check the PARENT document to make sure this user owns this chat
    const chatDoc = await db.collection("chats").doc(chatId).get();
    
    if (!chatDoc.exists) {
        return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    if (chatDoc.data().userId !== decoded.id) {
        return NextResponse.json({ error: "Forbidden: You do not own this chat" }, { status: 403 });
    }

    // 5. Fetch Messages (The Conversation & Gemini Data)
    // We go into the 'messages' sub-collection
    const messagesSnapshot = await db.collection("chats")
      .doc(chatId)
      .collection("messages")
      .orderBy("createdAt", "asc") // Oldest first (chronological order)
      .get();

    const messages = messagesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        role: data.role, // 'user' or 'assistant'
        content: data.content, // The text message
        
        // ✅ This is the "Gemini Thing" (Structured Data for Cards)
        analysisData: data.analysisData || null, 
        
        // File attachment if present
        attachmentUrl: data.attachmentUrl || null,
        file: data.attachmentUrl ? "Attached Document" : null,

        // Safe Timestamp
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
      };
    });

    return NextResponse.json({ success: true, messages });

  } catch (error) {
    console.error("Fetch Messages Error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}