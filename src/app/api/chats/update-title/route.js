import { NextResponse } from "next/server";
import { generateChatTitle } from "@/lib/gemini";
import { db } from "@/lib/firebaseAdmin";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { chatId } = await req.json();
    
    if (!chatId) {
      return NextResponse.json({ error: "Chat ID required" }, { status: 400 });
    }

    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || cookieStore.get("refreshToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    const userId = decoded.id;

    // Get chat and verify ownership
    const chatDoc = await db.collection("chats").doc(chatId).get();
    
    if (!chatDoc.exists) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const chatData = chatDoc.data();
    
    if (chatData.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get first user message to generate title
    const messagesSnapshot = await db.collection("chats")
      .doc(chatId)
      .collection("messages")
      .where("role", "==", "user")
      .orderBy("createdAt", "asc")
      .limit(1)
      .get();

    if (messagesSnapshot.empty) {
      return NextResponse.json({ error: "No messages found" }, { status: 404 });
    }

    const firstMessage = messagesSnapshot.docs[0].data();
    const documentContext = chatData.documentContext || "";

    // Generate new title
    const newTitle = await generateChatTitle(firstMessage.content, documentContext);

    // Update chat title
    await db.collection("chats").doc(chatId).update({
      title: newTitle,
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      title: newTitle
    });

  } catch (error) {
    console.error("Update title error:", error);
    return NextResponse.json({ error: "Failed to update title" }, { status: 500 });
  }
}