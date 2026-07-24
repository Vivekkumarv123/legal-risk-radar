import { NextResponse } from "next/server";
import { callGemini, generateChatTitle } from "@/lib/gemini";
import { db } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { headers, cookies } from "next/headers";
import { verifyToken } from "@/middleware/auth.middleware";
import { checkUsageLimit, trackUsage } from "@/middleware/usage.middleware";
import { DecisionAnalysis } from "@/models/chat.model";

// CONFIGURATION
const GUEST_DAILY_LIMIT = 3;

function sanitizeForFirestore(value) {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForFirestore(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, nestedValue]) => nestedValue !== undefined)
        .map(([key, nestedValue]) => [key, sanitizeForFirestore(nestedValue)])
    );
  }

  return value;
}

function normalizeDecisionAnalysis(rawPayload) {
  const payload = typeof rawPayload === "string" ? { executiveSummary: rawPayload } : (rawPayload || {});
  const decisionSummary = payload.decisionSummary || payload.decision_summary || {};
  const recommendations = Array.isArray(payload.recommendations) ? payload.recommendations : [];
  const whatIfSuggestions = Array.isArray(payload.whatIfSuggestions) ? payload.whatIfSuggestions : [];
  const clauses = Array.isArray(payload.clauses) ? payload.clauses : [];

  return DecisionAnalysis.parse({
    decisionSummary: {
      finalDecision: decisionSummary.finalDecision || decisionSummary.final_decision || "Review Before Signing",
      decisionScore: Number(decisionSummary.decisionScore ?? decisionSummary.decision_score ?? 0),
      overallRisk: String(decisionSummary.overallRisk || decisionSummary.overall_risk || "MEDIUM").toUpperCase(),
      confidence: Number(decisionSummary.confidence ?? 0),
      estimatedFinancialRisk: decisionSummary.estimatedFinancialRisk || decisionSummary.estimated_financial_risk,
      lawyerReviewRecommended: Boolean(decisionSummary.lawyerReviewRecommended ?? decisionSummary.lawyer_review_recommended ?? false),
      negotiationRequired: Boolean(decisionSummary.negotiationRequired ?? decisionSummary.negotiation_required ?? false),
    },
    executiveSummary: payload.executiveSummary || payload.executive_summary || payload.summary || "The document has been reviewed.",
    keyRisks: Array.isArray(payload.keyRisks) ? payload.keyRisks : Array.isArray(payload.key_risks) ? payload.key_risks : [],
    missingProtections: Array.isArray(payload.missingProtections) ? payload.missingProtections : Array.isArray(payload.missing_protections) ? payload.missing_protections : [],
    recommendations: recommendations.map((item) => {
      if (typeof item === "string") {
        return { priority: "MEDIUM", title: item, description: item };
      }
      return {
        priority: item.priority || "MEDIUM",
        title: item.title || item.summary || "Recommendation",
        description: item.description || item.detail || "",
      };
    }),
    whatIfSuggestions: whatIfSuggestions.map((item) => ({
      scenario: item.scenario || item.whatIf || "Potential scenario",
      impact: item.impact || item.description || "",
      newDecisionScore: item.newDecisionScore ?? item.new_decision_score,
      newRisk: item.newRisk || item.new_risk,
    })),
    nextBestActions: Array.isArray(payload.nextBestActions) ? payload.nextBestActions : Array.isArray(payload.next_best_actions) ? payload.next_best_actions : [],
    followUpQuestions: Array.isArray(payload.followUpQuestions) ? payload.followUpQuestions : Array.isArray(payload.follow_up_questions) ? payload.follow_up_questions : [],
    clauses: clauses.map((clause) => ({
      clause: clause.clause || clause.clause_snippet || clause.clauseName || "Clause text missing",
      riskLevel: String(clause.riskLevel || clause.risk_level || "LOW").toUpperCase(),
      severity: Number(clause.severity ?? 1),
      explanation: clause.explanation || clause.summary || "No explanation provided.",
      businessImpact: clause.businessImpact || clause.business_impact || "No business impact provided.",
      recommendation: clause.recommendation || clause.suggestion || "No recommendation provided.",
    })),
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    let { documentText, message, userRole, docType, fileUrl, chatId } = body;

    // Validate Input
    if (!documentText && !message) {
      console.log('❌ No text or message');
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
      console.log('✅ Authenticated user:', userId);
    } else {
      console.log('⚠️ Guest user');
    }

    // 3. Fallback to Guest ID (only if truly a guest - no valid token)
    if (isGuest) {
      if (!guestIdHeader) {
        const tempGuestId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        trackerId = `guest_${tempGuestId}`;
      } else {
        trackerId = `guest_${guestIdHeader}`;
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

        console.log('⛔ Guest limit exceeded');

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
        console.log('⛔ Usage limit exceeded');
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
    // STEP 4: DETECT USER INTENT (Analysis vs. Chat)
    // Inspects the incoming payload to decide whether to perform a full document
    // analysis (structured JSON) or continue an interactive conversation.
    // ============================================================
    const userQuery = message || "Explain the risks.";
    const fileContext = fileUrl ? `(File URL provided: ${fileUrl})` : "";

    // LOGIC: It is a "Standard Analysis" (JSON) if:
    // 1. User provided documentText (any new document analysis)
    // 2. OR query explicitly starts with "analyze"
    const isStandardAnalysis =
      !!documentText ||
      userQuery.toLowerCase().startsWith("analyze");

    console.log(isStandardAnalysis ? '🎯 ANALYSIS' : '💬 CHAT');

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
      // Configures the analysis system instructions to extract legal risks,
      // identify missing protections, and return a structured JSON schema response.
      prompt = `
          You are LegalAdvisor AI, an AI-powered Legal Decision Intelligence Assistant.

Your goal is NOT just to analyze legal documents.
Your goal is to help users make informed legal decisions in simple, non-technical language.

Analyze the following legal document:

DOCUMENT:
"""${sanitizedDoc}${fileContext}"""

Return ONLY valid JSON in the following structure.

{
  "decisionSummary": {
    "finalDecision": "Safe to Sign | Review Before Signing | Do Not Sign",
    "decisionScore": 0,
    "overallRisk": "LOW | MEDIUM | HIGH",
    "confidence": 0
  },
  "executiveSummary": "Summarize the document in 3-5 simple sentences.",

  "keyRisks": [
    "Risk 1",
    "Risk 2"
  ],

  "missingProtections": [
    "Missing Clause 1",
    "Missing Clause 2"
  ],

  "recommendations": [
    {
      "priority": "HIGH | MEDIUM | LOW",
      "title": "Specific actionable recommendation",
      "description": "Explain why it matters."
    }
  ],

  "whatIfSuggestions": [
    {
      "scenario": "What if the liability cap is increased?",
      "impact": "Explain how the overall risk changes."
    },
    {
      "scenario": "What if payment is milestone-based?",
      "impact": "Explain how the decision improves."
    },
    {
      "scenario": "What if a Force Majeure clause is added?",
      "impact": "Explain the benefit."
    }
  ],

  "nextBestActions": [
    "Negotiate liability clause",
    "Clarify payment milestones",
    "Consult a legal expert before signing"
  ],

  "followUpQuestions": [
    "Explain the liability clause in simple language.",
    "Compare this contract with another version.",
    "Generate a safer version of this agreement."
  ],

  "clauses": [
    {
      "clause": "Relevant clause",
      "riskLevel": "HIGH | MEDIUM | LOW",
      "severity": 1,
      "explanation": "Explain the legal risk in plain English.",
      "businessImpact": "Describe the possible financial or operational impact.",
      "recommendation": "Suggest how this clause can be improved."
    }
  ]
}

Rules:

- Respond ONLY with valid JSON.
- Do not include markdown.
- Do not invent facts not supported by the document.
- Keep explanations concise and understandable for non-lawyers.
- Recommendations must be practical and actionable.
- What-if suggestions should describe realistic contract improvements.
- Confidence must be between 0-100.
- Decision score must be between 0-100.
- Severity must be between 1-10.
`;
    }

    else {
      // --- MODE B: CHAT COMPANION (Simple Text) ---
      // Configures system guidelines defining conversational constraints
      // to behave as a helpful legal assistant.
      const chatHistoryContext = chatHistory ? `
          PREVIOUS CONVERSATION:
          """
          ${chatHistory}
          """
        ` : "";

      prompt = `
          You are LegalAdvisor AI, an AI-powered Legal Decision Intelligence Assistant.

Your job is to help users understand legal documents and make better legal decisions.

DOCUMENT:
"""${sanitizedDoc}${fileContext}"""

${chatHistoryContext}

USER QUESTION:
"${userQuery}"

Rules:

1. Answer in simple language suitable for non-lawyers.
2. If the user asks in Hindi, Marathi, or any other language, reply in that language.
3. Use previous conversation for context.
4. Explain only what is relevant to the user's question.
5. Never make up legal facts.
6. If the document does not contain the requested information, clearly say so.

Whenever appropriate, also include:

• Recommendation
• Next Best Action
• Optional What-if Suggestion

If the user asks:
"Should I sign this?"

Always provide:

- Final Recommendation
- Why
- Major Risks
- Suggested Negotiation Points

If the document appears high-risk, recommend consulting a legal professional.

Do NOT return JSON.

Respond naturally using headings and bullet points where appropriate.
`;
    }

    // ============================================================
    // STEP 5: CALL GEMINI API
    // ============================================================
    const startTime = Date.now();
    const rawResult = await callGemini(prompt);
    const latencyMs = Date.now() - startTime;
    let parsedResult;

    if (isStandardAnalysis) {
      try {
        const cleanedJson = rawResult.replace(/```json|```/g, '').trim();
        let parsedJson;
        try {
          parsedJson = JSON.parse(cleanedJson);
        } catch (e) {
          console.warn('⚠️ JSON parse failed');
          parsedJson = { executiveSummary: cleanedJson };
        }
        parsedResult = normalizeDecisionAnalysis(parsedJson);
      } catch (e) {
        console.error("❌ Analysis validation error", e);
        parsedResult = normalizeDecisionAnalysis({ executiveSummary: rawResult });
      }
    } else {
      // Return Text for Chat Bubble
      parsedResult = {
        response: rawResult,
        clauses: [] // Empty clauses = Frontend shows text bubble
      };
    }

    // Stream audit logging event to BigQuery asynchronously (non-blocking)
    const riskScore = typeof parsedResult?.decisionSummary?.decisionScore === 'number' ? parsedResult.decisionSummary.decisionScore : 0;
    import("@/services/bigqueryService").then(({ logAuditAnalyticsEvent }) => {
      logAuditAnalyticsEvent({
        eventType: isStandardAnalysis ? "document_analysis" : "chat_query",
        docType: docType || (documentText ? "legal_contract" : "text_clause"),
        riskScore: riskScore,
        latencyMs: latencyMs,
        userType: isGuest ? "guest" : "user"
      });
    }).catch(err => console.error("BigQuery log invoke failed:", err));

    // ============================================================
    // STEP 6: SAVE TO FIRESTORE & TRACK USAGE
    // Persists the conversation and usage data to Firebase Firestore
    // to track API query limits and save session messages.
    // ============================================================
    const usageData = {
      count: isGuest ? currentCount + 1 : 0,
      lastUsed: FieldValue.serverTimestamp(),
      type: isGuest ? "guest" : "user"
    };
    await usageRef.set(usageData, { merge: true });

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

        const newChatData = {
          userId,
          title: chatTitle,
          documentContext: contextToSave,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        };

        const newChat = await chatsRef.add(newChatData);
        currentChatId = newChat.id;
        console.log('✅ Chat created:', currentChatId);
      } else {
        const updateData = { updatedAt: FieldValue.serverTimestamp() };
        if (contextToSave) updateData.documentContext = contextToSave;
        await chatsRef.doc(currentChatId).update(updateData);
      }

      const messagesRef = chatsRef.doc(currentChatId).collection("messages");
      const userMessageData = {
        role: "user",
        content: message,
        attachmentUrl: fileUrl || null,
        createdAt: FieldValue.serverTimestamp()
      };
      await messagesRef.add(userMessageData);

      // Save the appropriate content based on response type
      let assistantContent;
      if (isStandardAnalysis) {
        assistantContent = parsedResult.executiveSummary;
        const detailedContent = `Analysis Summary: ${parsedResult.executiveSummary}\n\nDecision: ${parsedResult.decisionSummary.finalDecision}\n\nRisk: ${parsedResult.decisionSummary.overallRisk}\n\nKey Issues: ${parsedResult.clauses?.map(c => c.explanation).join('; ') || 'None'}`;

        const sanitizedAnalysisData = sanitizeForFirestore(parsedResult);
        const analysisMessageData = {
          role: "assistant",
          content: detailedContent,
          displayContent: assistantContent,
          analysisData: sanitizedAnalysisData,
          createdAt: FieldValue.serverTimestamp()
        };

        await messagesRef.add(analysisMessageData);
        console.log('✅ Analysis saved');
      } else {
        assistantContent = parsedResult.response;
        const chatMessageData = {
          role: "assistant",
          content: assistantContent,
          analysisData: null,
          createdAt: FieldValue.serverTimestamp()
        };

        await messagesRef.add(chatMessageData);
        console.log('✅ Chat response saved');
      }
    }

    const responseData = {
      success: true,
      data: parsedResult,
      chatId: currentChatId,
      remainingTries: isGuest ? Math.max(0, GUEST_DAILY_LIMIT - (currentCount + 1)) : "Unlimited"
    };

    console.log('✅ Response sent');

    return NextResponse.json(responseData);

  } catch (err) {
    console.error("❌ Error:", err.message);

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