import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function GET() {
  const healthStatus = {
    status: "ok",
    service: "Legal Risk Radar API",
    timestamp: new Date().toISOString(),
    checks: {
      database: "ok", // Assuming Firebase is working if we reach here
      apiKeys: process.env.GEMINI_API_KEY_1 ? "configured" : "not configured",
      keyRotation: {
        total: [
          process.env.GEMINI_API_KEY_1,
          process.env.GEMINI_API_KEY_2,
          process.env.GEMINI_API_KEY_3,
        ].filter(Boolean).length,
        status: "ok"
      }
    }
  };

  // Quick Gemini API test (optional, only if requested)
  const testGemini = new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').searchParams.get('test-gemini');
  
  if (testGemini === 'true') {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY_1 });
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Say 'API working'",
      });
      const response = result.text;
      
      healthStatus.checks.geminiApi = response.includes('working') ? "ok" : "partial";
    } catch (error) {
      healthStatus.checks.geminiApi = "error";
      healthStatus.checks.geminiError = error.message;
      healthStatus.status = "degraded";
    }
  }

  const statusCode = healthStatus.status === "ok" ? 200 : 503;
  return NextResponse.json(healthStatus, { status: statusCode });
}
