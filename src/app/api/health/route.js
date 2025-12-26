import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "Legal Risk Radar API",
    key: process.env.GEMINI_API_KEY ? "configured" : "not configured",
    timestamp: new Date().toISOString(),
  });
}
