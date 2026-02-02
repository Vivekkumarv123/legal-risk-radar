import { NextResponse } from "next/server";
import { callLiveGemini } from "@/lib/gemini";
import { verifyToken } from '@/middleware/auth.middleware';
import { checkUsageLimit, trackUsage } from '@/middleware/usage.middleware';

export async function POST(req) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    // Verify authentication
    const authResult = await verifyToken(req);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResult.user.uid;

    // Check if user has access to voice queries
    const usageCheck = await checkUsageLimit(userId, 'voice_query');
    if (!usageCheck.allowed) {
      return NextResponse.json({ 
        error: usageCheck.message,
        upgradeMessage: usageCheck.upgradeMessage,
        upgradeRequired: usageCheck.upgradeRequired,
        limitType: usageCheck.limitType
      }, { status: 403 });
    }

    // 🌍 Language-Aware Voice System Prompt
    const prompt = `
You are a helpful, smart, and witty AI Legal Assistant having a real-time voice conversation.

CRITICAL RULE:
- Always respond in the SAME language the user speaks.
- Do not translate unless the user explicitly asks.

USER SAID:
"${message}"

VOICE RESPONSE RULES:
1. Keep your reply SHORT (1–2 sentences maximum).
2. Sound natural, friendly, and conversational.
3. Do NOT use markdown, symbols, bullets, or formatting.
4. If the user greets you, greet them back warmly in the SAME language.
5. If the legal question is complex, give a brief summary and suggest using the main chat for details.
`;

    const result = await callLiveGemini(prompt);

    // Track usage after successful voice query
    await trackUsage(userId, 'voice_query');

    return NextResponse.json({
      success: true,
      data: { response: result },
    });

  } catch (err) {
    console.error("Live API Error:", err);
    return NextResponse.json(
      { error: "Error processing voice" },
      { status: 500 }
    );
  }
}
