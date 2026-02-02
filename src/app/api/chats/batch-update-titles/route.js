import { NextResponse } from "next/server";
import { generateChatTitle } from "@/lib/gemini";
import { db } from "@/lib/firebaseAdmin";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || cookieStore.get("refreshToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    const userId = decoded.id;

    // Get user's chats with generic titles
    const chatsSnapshot = await db.collection("chats")
      .where("userId", "==", userId)
      .get();

    const chatsToUpdate = [];
    
    for (const chatDoc of chatsSnapshot.docs) {
      const chatData = chatDoc.data();
      const title = chatData.title || "";
      
      // Check if title looks generic (contains "..." or "New Chat" or is very short)
      if (title.includes("...") || title === "New Chat" || title.length < 10) {
        chatsToUpdate.push({
          id: chatDoc.id,
          data: chatData
        });
      }
    }

    const updatedChats = [];
    
    // Update titles in batches to avoid rate limits
    for (const chat of chatsToUpdate.slice(0, 10)) { // Limit to 10 at a time
      try {
        // Get first user message
        const messagesSnapshot = await db.collection("chats")
          .doc(chat.id)
          .collection("messages")
          .where("role", "==", "user")
          .orderBy("createdAt", "asc")
          .limit(1)
          .get();

        if (!messagesSnapshot.empty) {
          const firstMessage = messagesSnapshot.docs[0].data();
          const documentContext = chat.data.documentContext || "";

          // Generate new title
          const newTitle = await generateChatTitle(firstMessage.content, documentContext);

          // Update chat title
          await db.collection("chats").doc(chat.id).update({
            title: newTitle,
            updatedAt: new Date()
          });

          updatedChats.push({
            id: chat.id,
            oldTitle: chat.data.title,
            newTitle: newTitle
          });
        }
      } catch (error) {
        console.error(`Failed to update chat ${chat.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount: updatedChats.length,
      totalFound: chatsToUpdate.length,
      updatedChats: updatedChats
    });

  } catch (error) {
    console.error("Batch update titles error:", error);
    return NextResponse.json({ error: "Failed to update titles" }, { status: 500 });
  }
}