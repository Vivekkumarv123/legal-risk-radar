import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { WEBSOCKET_LIVE_MODEL } from '@/lib/gemini';

// Extract keys from backend environment
const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean);

let keyIndex = 0;
function getRotatedKey() {
  if (API_KEYS.length === 0) return null;
  const key = API_KEYS[keyIndex];
  keyIndex = (keyIndex + 1) % API_KEYS.length;
  return key;
}

/**
 * POST: Dispenses a rotated API key to authenticated consultation rooms, 
 * returning system prompts and historical transcripts for direct client WSS connection.
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // 1. Fetch active session state from Firestore
    const docRef = db.collection('consultations').doc(sessionId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Consultation session not found' }, { status: 404 });
    }

    const sessionData = docSnap.data();

    // 2. Fetch key from load-balanced rotation pool
    const apiKey = getRotatedKey();
    if (!apiKey) {
      return NextResponse.json({ error: 'No Gemini API keys configured on server' }, { status: 500 });
    }

    // 3. Formulate the dynamic legal consultant system guidelines
    const systemInstructions = `
You are a Staff AI Legal Consultant, a professional advisor helping clients understand agreements, detect risks, and make structural decisions.

YOUR CONTEXT:
- Consultation ID: ${sessionData.consultationId}
- Current session timeline events and documents uploaded will be synchronized in real-time.

YOUR SPEECH BEHAVIOR RULES (CRITICAL FOR LIVE AUDIO):
1. Always respond in the SAME language the user speaks. If they greet or speak in Spanish, French, Hindi, Japanese, respond in that language.
2. Keep your spoken voice responses CONCISE (1-3 sentences maximum). Longer explanations block real-time dialogue.
3. Speak in a warm, professional, clear, and reassuring tone.
4. Avoid using markdown, asterisks, headers, or bullet lists in your verbal audio response. Speak in complete, natural sentences.
5. If the user asks a deep legal question, summarize the key advice verbally, and let them know the details are outlined in the "Decision Brief" on their screen.

YOUR AGENT PLANNER OBJECTIVES:
- If a document is uploaded, analyze the key terms.
- Actively check for missing details: salary, bonus structures, notices, and dates. If details are missing, list them and prompt the user: "I notice the contract is missing [notice period]. Could you clarify what notice period you agreed upon?"
- Once gaps are answered, formulate recommendations and mitigate risks.
`;

    return NextResponse.json({
      success: true,
      data: {
        token: apiKey,
        liveModel: WEBSOCKET_LIVE_MODEL,
        systemInstructions,
        history: sessionData.transcript || [],
        status: sessionData.status
      }
    });
  } catch (error) {
    console.error('Error generating live session token:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
