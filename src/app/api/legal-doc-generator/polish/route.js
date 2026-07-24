import { NextResponse } from "next/server";
import { verifyToken } from "@/middleware/auth.middleware";
import { callGemini } from "@/lib/gemini";

export async function POST(req) {
  try {
    const authResult = await verifyToken(req);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content, templateType, action, targetLanguage } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required." }, { status: 400 });
    }

    let prompt = "";

    if (action === "rewrite") {
      prompt = `You are an expert legal contract writer. Rewrite the following clause to make it more professional, clear, and legally sound, while keeping its exact original intent:
"""
${content}
"""
Rules:
1. Do NOT include preambles, meta-commentary, or markdown code fences.
2. Return ONLY the rewritten text.`;
    } else if (action === "shorten") {
      prompt = `You are an expert legal contract writer. Shorten this legal clause to make it concise and direct, without losing its core legal meaning:
"""
${content}
"""
Rules:
1. Do NOT include preambles, meta-commentary, or markdown code fences.
2. Return ONLY the shortened text.`;
    } else if (action === "simplify") {
      prompt = `You are an expert legal contract writer. Simplify the following legal text so it is easy for a layperson to understand, while retaining the essential legal substance:
"""
${content}
"""
Rules:
1. Do NOT include preambles, meta-commentary, or markdown code fences.
2. Return ONLY the simplified text.`;
    } else if (action === "translate") {
      prompt = `Translate the following legal clause into ${targetLanguage || "Spanish"}, using precise and professional legal terminology for that language:
"""
${content}
"""
Rules:
1. Do NOT include preambles, meta-commentary, or markdown code fences.
2. Return ONLY the translated text.`;
    } else {
      // Default: full-document draft/polish
      prompt = `You are a professional legal contract writer at a top-tier firm. Draft a formal, legally structured agreement body from the user's raw notes below.

Document Category: ${templateType || "Custom Agreement"}
User's Raw Notes:
"""
${content}
"""

Strict requirements:
1. Target length: 180–260 words total. This MUST fit on a single printed page alongside a letterhead, recipient block, and signature block — do not exceed 260 words under any circumstance.
2. Structure as 3–5 short numbered clauses (e.g. Scope, Term, Compensation/Payment, Obligations, Termination) — only include clauses that are actually implied by the notes. Do not invent unrelated boilerplate (no arbitration, no force majeure, no severability) unless the notes call for it.
3. Each clause should be 1–3 sentences. Prefer precise, plain legal language over dense multi-clause paragraphs.
4. Do NOT include the company logo header, company contact columns, document title, recipient "To/Date" block, signature lines, seal, or footer — those are rendered separately by the letterhead template. Start directly with the opening clause or salutation line.
5. Do NOT include a preamble, meta-commentary, or code fences (no \`\`\`json or \`\`\`text). Return only the drafted clause text.
6. If the notes already contain more than 260 words of necessary detail, condense and summarize rather than omit — prioritize brevity over completeness.`;
    }

    const polishedText = await callGemini(prompt);

    return NextResponse.json({ success: true, polishedText: polishedText.trim() });
  } catch (error) {
    console.error("Doc generator polish API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}