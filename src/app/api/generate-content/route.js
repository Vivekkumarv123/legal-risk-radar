import { callGemini } from "@/lib/gemini";

export async function POST(req) {
  try {
    const body = await req.json();
    // Accept both documentText (from OCR) and message (text-only chat)
    const { documentText, message, userQuestion, userRole, docType } = body;

    if (!documentText && !message) {
      return Response.json(
        { error: "Document text or message is required" },
        { status: 400 }
      );
    }

    // SANITIZATION: Prevent triple quotes in the user text from breaking the prompt structure
    const doc = documentText || message;
    const sanitizedDoc = (doc || "").replace(/"""/g, "'''");
    const question = userQuestion || message || "Explain the risks for me in simple terms.";

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


    // Call your existing Gemini library function
    const rawResult = await callGemini(prompt);
    
    // SAFETY: Clean the output in case Gemini wraps it in markdown code blocks
    const cleanedJsonString = rawResult
      .replace(/```json/g, '') // Remove start of code block
      .replace(/```/g, '')     // Remove end of code block
      .trim();

    // Parse the string into a real JSON object
    const parsedResult = JSON.parse(cleanedJsonString);

    return Response.json({
      success: true,
      data: parsedResult,
    });

  } catch (err) {
    console.error("Legal AI Error:", err);
    
    // Determine if it was a parsing error or a Gemini API error
    const errorMessage = err instanceof SyntaxError 
      ? "AI response could not be parsed as JSON." 
      : err.message;

    return Response.json(
      { error: "Processing failed", details: errorMessage },
      { status: 500 }
    );
  }
}