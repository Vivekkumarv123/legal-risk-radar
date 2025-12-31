import { NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";
import { db } from "@/lib/firebaseAdmin"; 
import { FieldValue } from "firebase-admin/firestore";
import { headers, cookies } from "next/headers"; 
import jwt from "jsonwebtoken";

// CONFIGURATION
const GUEST_DAILY_LIMIT = 3; 

export async function POST(req) {
  try {
    const body = await req.json();
    let { documentText, message, userRole, docType, fileUrl, chatId } = body;
    console.log("Received Request Body:", body);
    // Validate Input
    if (!documentText && !message) {
      return NextResponse.json({ error: "Text or message required" }, { status: 400 });
    }

    // ============================================================
    // STEP 1 & 2: AUTHENTICATION & USAGE LIMITS
    // ============================================================
    // ============================================================
    // STEP 1: IDENTIFY THE USER (Cookie OR Header)
    // ============================================================
    const headersList = await headers();
    const cookieStore = await cookies();
    
    // 1. Try to get Token from Header OR Cookie
    const authHeader = headersList.get("authorization");
    let token = null;
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    } else {
        token = cookieStore.get("token")?.value || 
                cookieStore.get("accessToken")?.value || 
                cookieStore.get("refreshToken")?.value; 
    }

    const guestIdHeader = headersList.get("x-guest-id");

    let userId = null;
    let isGuest = true;
    let trackerId = null;

    // 2. Verify Token
    if (token) {
      try {
        const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
        const decoded = jwt.verify(token, secret);
        
        if (decoded?.id) {
          userId = decoded.id;
          isGuest = false; // Valid User!
          trackerId = `user_${userId}`;
        }
      } catch (e) {
        console.log("Token invalid/expired, treating as guest");
      }
    }

    // 3. Fallback to Guest ID
    if (isGuest) {
      if (!guestIdHeader) {
        return NextResponse.json({ error: "Authentication failed. Please log in again." }, { status: 401 });
      }
      trackerId = `guest_${guestIdHeader}`;
    }


    // Check Limits
    const usageRef = db.collection("usage_limits").doc(trackerId);
    let currentCount = 0;
    if (isGuest) {
      const doc = await usageRef.get();
      if (doc.exists) {
        const data = doc.data();
        const last = data.lastUsed?.toDate ? data.lastUsed.toDate() : new Date();
        const today = new Date();
        if (last.getDate() === today.getDate()) currentCount = data.count || 0;
      }
      if (currentCount >= GUEST_DAILY_LIMIT) return NextResponse.json({ error: "Limit reached", isLimitReached: true }, { status: 403 });
    }

    // ============================================================
    // STEP 3: CONTEXT RETRIEVAL
    // ============================================================
    let contextToAnalyze = documentText || "";
    let currentChatId = chatId;

    // Retrieve context from DB if this is a follow-up
    if (!isGuest && currentChatId && !documentText) {
        const chatDoc = await db.collection("chats").doc(currentChatId).get();
        if (chatDoc.exists && chatDoc.data().documentContext) {
            contextToAnalyze = chatDoc.data().documentContext; 
        }
    }

    // ============================================================
    // ✅ STEP 4: INTELLIGENT INTENT DETECTION
    // ============================================================
    const userQuery = message || "Explain the risks.";
    const fileContext = fileUrl ? `(File URL provided: ${fileUrl})` : "";
    
    // LOGIC: It is a "Standard Analysis" (JSON) if:
    // 1. It starts with the specific prefix we add in Frontend for new docs.
    // 2. OR it explicitly says "Analyze".
    const isStandardAnalysis = 
        userQuery.startsWith("Analyze the following legal text") || 
        userQuery.toLowerCase().startsWith("analyze this");

    // ✅ FIX: If analyzing but no separate documentText, the message IS the document.
    if (isStandardAnalysis && !contextToAnalyze) {
        const prefix = "Analyze the following legal text and identify risks/clauses:\n\n";
        if (userQuery.startsWith(prefix)) {
            contextToAnalyze = userQuery.replace(prefix, "");
        } else {
            contextToAnalyze = userQuery; // Fallback
        }
    }

    const sanitizedDoc = (contextToAnalyze || "").replace(/"""/g, "'''");
    let prompt;

    if (isStandardAnalysis) {
        // --- MODE A: ANALYST (Strict JSON) ---
        prompt = `
          You are a Legal Risk AI. Analyze this document for a Non-Lawyer.
          
          DOCUMENT:
          """
          ${sanitizedDoc}
          ${fileContext}
          """

          OUTPUT FORMAT (STRICT JSON ONLY):
          {
            "summary": "Simple summary",
            "overall_risk_score": "1-10",
            "missing_clauses": ["Missing protection 1"],
            "clauses": [
              {
                "clause": "Original text snippet",
                "risk_level": "HIGH/MEDIUM/LOW",
                "explanation": "Simple explanation why it is risky"
              }
            ]
          }
        `;
    } else {
        // --- MODE B: CHAT COMPANION (Simple Text) ---
        prompt = `
          You are a helpful Legal Assistant. Answer the user's question based on the document.
          
          DOCUMENT:
          """
          ${sanitizedDoc}
          ${fileContext}
          """

          USER QUESTION:
          "${userQuery}"

          INSTRUCTIONS:
          1. Answer directly and simply (No jargon).
          2. If asked to translate, translate the answer fully.
          3. Do NOT output JSON. Write a normal paragraph or bullet points.
        `;
    }

    // ============================================================
    // STEP 5: CALL GEMINI API
    // ============================================================
    const rawResult = await callGemini(prompt);
    let parsedResult;
    
    if (isStandardAnalysis) {
        // Parse JSON for Cards
        try {
            const cleanedJson = rawResult.replace(/```json|```/g, '').trim();
            parsedResult = JSON.parse(cleanedJson);
        } catch (e) {
            console.error("JSON Error", e);
            parsedResult = { summary: rawResult, clauses: [] };
        }
    } else {
        // Return Text for Chat Bubble
        parsedResult = { 
            response: rawResult, 
            clauses: [] // Empty clauses = Frontend shows text bubble
        };
    }

    // ============================================================
    // STEP 6: SAVE TO FIRESTORE
    // ============================================================
    await usageRef.set({ count: isGuest ? currentCount + 1 : 0, lastUsed: FieldValue.serverTimestamp(), type: isGuest ? "guest" : "user" }, { merge: true });

    if (!isGuest && userId) {
        const chatsRef = db.collection("chats");
        // Ensure we save the context if we just extracted it
        const contextToSave = documentText || contextToAnalyze || "";

        if (!currentChatId) {
            const newChat = await chatsRef.add({ 
                userId, title: message.substring(0, 30) + "...", 
                documentContext: contextToSave, 
                createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() 
            });
            currentChatId = newChat.id;
        } else {
            const updateData = { updatedAt: FieldValue.serverTimestamp() };
            if (contextToSave) updateData.documentContext = contextToSave;
            await chatsRef.doc(currentChatId).update(updateData);
        }

        const messagesRef = chatsRef.doc(currentChatId).collection("messages");
        await messagesRef.add({ role: "user", content: message, attachmentUrl: fileUrl || null, createdAt: FieldValue.serverTimestamp() });
        console.log("Saving assistant message:", parsedResult);
        const assistantContent = isStandardAnalysis ? parsedResult.summary : parsedResult.response;
        await messagesRef.add({ 
            role: "assistant", 
            content: assistantContent, 
            analysisData: isStandardAnalysis ? parsedResult : null, 
            createdAt: FieldValue.serverTimestamp() 
        });
    }

    return NextResponse.json({
      success: true,
      data: parsedResult,
      chatId: currentChatId,
      remainingTries: isGuest ? Math.max(0, GUEST_DAILY_LIMIT - (currentCount + 1)) : "Unlimited"
    });

  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json({ error: "Processing failed", details: err.message }, { status: 500 });
  }
}