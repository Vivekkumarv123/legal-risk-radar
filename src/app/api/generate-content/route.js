import { NextResponse } from "next/server";
import { callGemini, generateChatTitle } from "@/lib/gemini";
import { db } from "@/lib/firebaseAdmin"; 
import { FieldValue } from "firebase-admin/firestore";
import { headers, cookies } from "next/headers"; 
import { verifyToken } from "@/middleware/auth.middleware";
import { checkUsageLimit, trackUsage } from "@/middleware/usage.middleware";

// CONFIGURATION
const GUEST_DAILY_LIMIT = 3; 

export async function POST(req) {
  try {
    const body = await req.json();
    let { documentText, message, userRole, docType, fileUrl, chatId } = body;
    // Validate Input
    if (!documentText && !message) {
      return NextResponse.json({ error: "Text or message required" }, { status: 400 });
    }

    // ============================================================
    // STEP 1 & 2: AUTHENTICATION & USAGE LIMITS
    // ============================================================
    // ============================================================
    // STEP 1: IDENTIFY THE USER (Use existing auth middleware)
    // ============================================================
    const headersList = await headers();
    const guestIdHeader = headersList.get("x-guest-id");

    let userId = null;
    let isGuest = true;
    let trackerId = null;

    // Use the same verifyToken function as other APIs
    const authResult = await verifyToken(req);
    
    if (authResult.success && authResult.user?.uid) {
      userId = authResult.user.uid;
      isGuest = false;
      trackerId = `user_${userId}`;
      console.log(`✅ Authenticated user: ${userId}`);
    } else {
      console.log('⚠️ Authentication failed, treating as guest:', authResult.error || 'No token');
    }

    // 3. Fallback to Guest ID (only if truly a guest - no valid token)
    if (isGuest) {
      if (!guestIdHeader) {
        // Generate a temporary guest ID if none provided
        const tempGuestId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        trackerId = `guest_${tempGuestId}`;
        console.log('🔓 Generated temporary guest ID for unauthenticated user:', tempGuestId);
      } else {
        trackerId = `guest_${guestIdHeader}`;
        console.log('🔓 Using provided guest ID:', guestIdHeader);
      }
    }
    
    // Sanity check - should never happen but let's be safe
    if (!trackerId) {
      console.error('❌ ERROR: No tracker ID generated!');
      return NextResponse.json({ error: "Authentication error" }, { status: 500 });
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
      if (currentCount >= GUEST_DAILY_LIMIT) {
        // Calculate time until midnight (reset time)
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const hoursUntilReset = Math.floor((tomorrow - now) / (1000 * 60 * 60));
        const minutesUntilReset = Math.floor(((tomorrow - now) % (1000 * 60 * 60)) / (1000 * 60));
        
        return NextResponse.json({ 
          error: "Daily limit reached", 
          isLimitReached: true,
          limitType: 'guest_limit',
          currentUsage: currentCount,
          limit: GUEST_DAILY_LIMIT,
          resetTime: tomorrow.toISOString(),
          hoursUntilReset,
          minutesUntilReset,
          resetMessage: `Limit resets in ${hoursUntilReset}h ${minutesUntilReset}m`
        }, { status: 403 });
      }
    } else {
      // Check authenticated user limits
      const usageCheck = await checkUsageLimit(userId, 'ai_query');
      if (!usageCheck.allowed) {
        // Calculate time until midnight (reset time for daily limits)
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const hoursUntilReset = Math.floor((tomorrow - now) / (1000 * 60 * 60));
        const minutesUntilReset = Math.floor(((tomorrow - now) % (1000 * 60 * 60)) / (1000 * 60));
        
        return NextResponse.json({ 
          error: usageCheck.message,
          isLimitReached: true,
          upgradeRequired: usageCheck.upgradeRequired,
          currentUsage: usageCheck.currentUsage,
          limit: usageCheck.limit,
          limitType: usageCheck.limitType || 'ai_query',
          resetTime: tomorrow.toISOString(),
          hoursUntilReset,
          minutesUntilReset,
          resetMessage: `Limit resets in ${hoursUntilReset}h ${minutesUntilReset}m`
        }, { status: 403 });
      }
    }

    // ============================================================
    // STEP 3: CONTEXT RETRIEVAL & CHAT MEMORY
    // ============================================================
    let contextToAnalyze = documentText || "";
    let currentChatId = chatId;
    let chatHistory = [];

    // Retrieve context and chat history from DB if this is a follow-up
    if (!isGuest && currentChatId && !documentText) {
        const chatDoc = await db.collection("chats").doc(currentChatId).get();
        if (chatDoc.exists && chatDoc.data().documentContext) {
            contextToAnalyze = chatDoc.data().documentContext; 
        }
        
        // Get recent chat history for context (last 5 messages instead of 10)
        const messagesSnapshot = await db.collection("chats")
            .doc(currentChatId)
            .collection("messages")
            .orderBy("createdAt", "desc")
            .limit(5) // Reduced from 10 to 5
            .get();
        
        if (!messagesSnapshot.empty) {
            chatHistory = messagesSnapshot.docs
                .map(doc => {
                    const data = doc.data();
                    return data;
                })
                .reverse() // Reverse to get chronological order
                .filter(msg => msg.content) // Filter out messages without content
                .map(msg => `${msg.role}: ${msg.content}`)
                .join('\n');
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
    console.log(sanitizedDoc);
    let prompt;

    if (isStandardAnalysis) {
        // --- MODE A: ANALYST (Strict JSON) ---
        prompt = `
          Legal Risk AI - Analyze for non-lawyers:
          
          DOCUMENT: """${sanitizedDoc}${fileContext}"""

          OUTPUT (JSON ONLY):
          {
            "summary": "Brief summary",
            "overall_risk_score": "1-10",
            "missing_clauses": ["Missing item"],
            "clauses": [
              {
                "clause": "Text snippet",
                "risk_level": "HIGH/MEDIUM/LOW",
                "explanation": "Why risky"
              }
            ]
          }
        `;
    } else {
        // --- MODE B: CHAT COMPANION (Simple Text) ---
        const chatHistoryContext = chatHistory ? `
          PREVIOUS CONVERSATION:
          """
          ${chatHistory}
          """
        ` : "";
        
        prompt = `
          Legal Assistant - Answer based on document and conversation.
          
          DOCUMENT: """${sanitizedDoc}${fileContext}"""
          ${chatHistoryContext}

          USER: "${userQuery}"

          RULES:
          1. Answer directly, no jargon
          2. If asked in specific language, respond in that language
          3. Use conversation history for context
          4. No JSON, just text/bullets
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
    // STEP 6: SAVE TO FIRESTORE & TRACK USAGE
    // ============================================================
    await usageRef.set({ count: isGuest ? currentCount + 1 : 0, lastUsed: FieldValue.serverTimestamp(), type: isGuest ? "guest" : "user" }, { merge: true });

    // Track usage for authenticated users
    if (!isGuest) {
      await trackUsage(userId, 'ai_query', 1);
    }

    if (!isGuest && userId) {
        const chatsRef = db.collection("chats");
        // Ensure we save the context if we just extracted it
        const contextToSave = documentText || contextToAnalyze || "";

        if (!currentChatId) {
            // Generate intelligent title based on content
            const chatTitle = await generateChatTitle(message, contextToSave);
            
            const newChat = await chatsRef.add({ 
                userId, 
                title: chatTitle, 
                documentContext: contextToSave, 
                createdAt: FieldValue.serverTimestamp(), 
                updatedAt: FieldValue.serverTimestamp() 
            });
            currentChatId = newChat.id;
        } else {
            const updateData = { updatedAt: FieldValue.serverTimestamp() };
            if (contextToSave) updateData.documentContext = contextToSave;
            await chatsRef.doc(currentChatId).update(updateData);
        }

        const messagesRef = chatsRef.doc(currentChatId).collection("messages");
        await messagesRef.add({ role: "user", content: message, attachmentUrl: fileUrl || null, createdAt: FieldValue.serverTimestamp() });
        
        // Save the appropriate content based on response type
        let assistantContent;
        if (isStandardAnalysis) {
            // For analysis, save both summary and full analysis for context
            assistantContent = parsedResult.summary;
            // Also save a more detailed version for context retrieval
            const detailedContent = `Analysis Summary: ${parsedResult.summary}\n\nRisk Score: ${parsedResult.overall_risk_score}\n\nKey Issues: ${parsedResult.clauses?.map(c => c.explanation).join('; ') || 'None'}`;
            
            await messagesRef.add({ 
                role: "assistant", 
                content: detailedContent, // Save detailed content for better context
                displayContent: assistantContent, // What to show in UI
                analysisData: parsedResult, 
                createdAt: FieldValue.serverTimestamp() 
            });
        } else {
            assistantContent = parsedResult.response;
            await messagesRef.add({ 
                role: "assistant", 
                content: assistantContent, 
                analysisData: null, 
                createdAt: FieldValue.serverTimestamp() 
            });
        }
    }

    return NextResponse.json({
      success: true,
      data: parsedResult,
      chatId: currentChatId,
      remainingTries: isGuest ? Math.max(0, GUEST_DAILY_LIMIT - (currentCount + 1)) : "Unlimited"
    });

  } catch (err) {
    console.error("API Error:", err);
    
    // Provide user-friendly error messages based on error type
    if (err.message.includes('503') || err.message.includes('overloaded')) {
      return NextResponse.json({ 
        error: "AI service is temporarily overloaded. Please try again in a few moments.", 
        details: "The AI model is experiencing high traffic. This usually resolves within 1-2 minutes.",
        retryAfter: 60000 // Suggest retry after 1 minute
      }, { status: 503 });
    }
    
    if (err.message.includes('quota exceeded') || err.message.includes('rate limit')) {
      return NextResponse.json({ 
        error: "API quota exceeded. Please try again later.", 
        details: "Daily API limit reached. Please upgrade your plan or try again tomorrow.",
        upgradeRequired: true
      }, { status: 429 });
    }
    
    if (err.message.includes('authentication') || err.message.includes('API key')) {
      return NextResponse.json({ 
        error: "Service configuration error. Please contact support.", 
        details: "There's an issue with the AI service configuration."
      }, { status: 500 });
    }
    
    // Generic error for other cases
    return NextResponse.json({ 
      error: "Processing failed. Please try again.", 
      details: err.message,
      canRetry: true
    }, { status: 500 });
  }
}