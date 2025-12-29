import { NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";
import { db } from "@/lib/firebaseAdmin"; 
import { FieldValue } from "firebase-admin/firestore";
import { headers, cookies } from "next/headers"; // ✅ Added cookies
import jwt from "jsonwebtoken";

// CONFIGURATION
const GUEST_DAILY_LIMIT = 3; 

export async function POST(req) {
  try {
    const body = await req.json();
    let { documentText, message, userQuestion, userRole, docType, fileUrl, chatId } = body;

    // Validate Input
    if (!documentText && !message) {
      return NextResponse.json({ error: "Text or message required" }, { status: 400 });
    }

    // ============================================================
    // STEP 1: IDENTIFY THE USER (Cookie OR Header)
    // ============================================================
    const headersList = await headers();
    const cookieStore = await cookies(); // ✅ Access Cookies
    
    // 1. Try to get Token from Header OR Cookie
    const authHeader = headersList.get("authorization");
    let token = null;
    console.log("Auth Header:", authHeader);
    console.log("Cookies:", cookieStore.getAll());
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    } else {
        // ✅ Check cookies (This fixes the 400 Error!)
        // It checks for 'token' or 'refreshToken' depending on what your login saves
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
        // This was the cause of your 400 error. Now handled correctly.
        return NextResponse.json({ error: "Authentication failed. Please log in again." }, { status: 401 });
      }
      trackerId = `guest_${guestIdHeader}`;
    }

    // ============================================================
    // STEP 2: CHECK USAGE LIMITS (Guests Only)
    // ============================================================
    const usageRef = db.collection("usage_limits").doc(trackerId);
    let currentCount = 0;

    if (isGuest) {
      const doc = await usageRef.get();
      if (doc.exists) {
        currentCount = doc.data().count || 0;
      }

      if (currentCount >= GUEST_DAILY_LIMIT) {
        return NextResponse.json({ 
          error: "Free limit reached", 
          isLimitReached: true, 
          message: "You have used your free tries. Please create an account." 
        }, { status: 403 });
      }
    }

    // ============================================================
    // STEP 3: CONTEXT & MEMORY RETRIEVAL
    // ============================================================
    let contextToAnalyze = documentText || "";
    let currentChatId = chatId;

    // Retrieve context only if it's a member and chatting in an existing thread
    if (!isGuest && currentChatId && !documentText) {
        const chatDoc = await db.collection("chats").doc(currentChatId).get();
        if (chatDoc.exists && chatDoc.data().documentContext) {
            contextToAnalyze = chatDoc.data().documentContext; 
        }
    }

    // ============================================================
    // STEP 4: PREPARE PROMPT (YOUR ORIGINAL PROMPT)
    // ============================================================
    const sanitizedDoc = (contextToAnalyze || "").replace(/"""/g, "'''");
    const question = userQuestion || message || "Explain the risks.";
    const fileContext = fileUrl ? `(File URL provided: ${fileUrl})` : "";

    const prompt = `
      You are a Legal Risk Explanation AI designed for NON-LAWYERS.
      Your job is to explain legal risks in SIMPLE, EASY, EVERYDAY language.

      ASSUME:
      - The user is a normal person (student, freelancer, startup founder)
      - They have NO legal background
      - They want to understand risks, not legal theory

      CONTEXT:
      - Client Role: ${userRole || "Determine from context"}
      - Document Type: ${docType || "General Contract"}
      - Jurisdiction: General commercial understanding (no country-specific law unless mentioned)

      WHAT YOU MUST DO:
      1. Analyze the document ONLY from the client's point of view.
      2. Highlight clauses that can cause:
         - Money loss
         - Legal trouble
         - Unfair control by the other party
      3. Identify important protections that are MISSING.
      4. Explain EVERYTHING in simple language.

      VERY IMPORTANT LANGUAGE RULES:
      - Avoid legal jargon whenever possible.
      - If legal terms are necessary, explain them immediately in brackets.
        Example:
        "Indemnity (you agree to pay for the other person's legal problems)"
      - Use short sentences.
      - Use examples where helpful.
      - Write as if explaining to a friend.
      
      DOCUMENT:
      """
      ${sanitizedDoc}
      ${fileContext}
      """
      
      USER QUESTION:
      "${question}"
      
      OUTPUT FORMAT (STRICT JSON ONLY):
      {
        "language": "detected language code (e.g. en, hi)",
        "client_perspective": "Who this contract affects most (e.g., Freelancer, Employee, Buyer)",
        "overall_risk_score": "1-10",
        "summary": "Very simple overall explanation of why this contract is safe or dangerous",
        "missing_clauses": [
          "Clause name (simple explanation in brackets)"
        ],
        "clauses": [
          {
            "id": "1",
            "clause_snippet": "Exact risky sentence from the document",
            "risk_level": "CRITICAL | HIGH | MEDIUM | LOW | BENEFICIAL",
            "explanation": "Simple explanation of what can go wrong for the client",
            "recommendation": "What a normal person should ask to change"
          }
        ]
      }

      SAFETY RULES:
      - Do NOT give legal advice.
      - Clearly state risks, not guarantees.
      - Be neutral but protective of the client.
      - Output RAW JSON only (no markdown, no explanations outside JSON).
    `;

    // ============================================================
    // STEP 5: CALL GEMINI API
    // ============================================================
    const rawResult = await callGemini(prompt);
    
    let parsedResult;
    try {
      const cleanedJsonString = rawResult.replace(/```json|```/g, '').trim();
      parsedResult = JSON.parse(cleanedJsonString);
    } catch (e) {
      console.error("JSON Parse Error", e);
      parsedResult = { summary: rawResult, clauses: [] };
    }

    // ============================================================
    // STEP 6: SAVE TO FIRESTORE (Private History)
    // ============================================================
    
    // A. Increment Usage Count
    await usageRef.set({
      count: isGuest ? currentCount + 1 : 0, 
      lastUsed: new Date(),
      type: isGuest ? "guest" : "user"
    }, { merge: true });

    // B. Save Chat History (Only for Logged-in Users)
    if (!isGuest && userId) {
        const chatsRef = db.collection("chats");

        if (!currentChatId) {
            // New Session
            const newChat = await chatsRef.add({
                userId,
                title: message.substring(0, 30) + "...",
                documentContext: documentText || "", 
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            });
            currentChatId = newChat.id;
        } else {
            // Existing Session
            const updateData = { updatedAt: FieldValue.serverTimestamp() };
            if (documentText) updateData.documentContext = documentText;
            await chatsRef.doc(currentChatId).update(updateData);
        }

        const messagesRef = chatsRef.doc(currentChatId).collection("messages");

        // Save User Message
        await messagesRef.add({
            role: "user",
            content: message,
            attachmentUrl: fileUrl || null,
            createdAt: FieldValue.serverTimestamp(),
        });

        // Save Assistant Message
        await messagesRef.add({
            role: "assistant",
            content: parsedResult.summary,
            analysisData: parsedResult,
            createdAt: FieldValue.serverTimestamp(),
        });
    }

    return NextResponse.json({
      success: true,
      data: parsedResult,
      chatId: currentChatId,
      remainingTries: isGuest ? Math.max(0, GUEST_DAILY_LIMIT - (currentCount + 1)) : "Unlimited"
    });

  } catch (err) {
    console.error("Legal AI Error:", err);
    return NextResponse.json({ error: "Processing failed", details: err.message }, { status: 500 });
  }
}