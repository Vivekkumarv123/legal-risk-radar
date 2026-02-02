import Tesseract from "tesseract.js";
import PDFParser from "pdf2json";
import { callGemini } from "@/lib/gemini";
import { verifyToken } from '@/middleware/auth.middleware';
import { checkUsageLimit, trackUsage } from '@/middleware/usage.middleware';

const MAX_FILE_SIZE_MB = 10;

export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type');
    
    // Handle JSON text analysis (from Chrome extension)
    if (contentType?.includes('application/json')) {
      const response = await handleTextAnalysis(req);
      
      // Add CORS headers for Chrome extension
      const headers = new Headers(response.headers);
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'Content-Type');
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    }
    
    // Handle file upload analysis (from web app)
    return await handleFileAnalysis(req);
    
  } catch (err) {
    console.error("Analyze Error:", err);
    const response = Response.json(
      { error: "Processing failed", details: err.message },
      { status: 500 }
    );
    
    // Add CORS headers even for errors
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
}

// Handle OPTIONS preflight requests
export async function OPTIONS(req) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Handle direct text analysis (Chrome extension)
async function handleTextAnalysis(req) {
  const { text, source } = await req.json();
  
  if (!text || text.trim().length < 50) {
    return Response.json(
      { error: "Text too short for analysis (minimum 50 characters)" },
      { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  }

  // For Chrome extension, we'll do basic analysis without authentication
  if (source === 'chrome_extension' || source === 'chrome_extension_pdf' || source === 'chrome_extension_content') {
    try {
      const analysis = await analyzeTextWithGemini(text, 'TEXT_INPUT');
      return Response.json({
        success: true,
        extraction: {
          type: 'TEXT_INPUT',
          source: source
        },
        analysis
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    } catch (error) {
      console.error('Chrome extension analysis error:', error);
      // Return a mock analysis for Chrome extension when Gemini fails
      return Response.json({
        success: true,
        extraction: {
          type: 'TEXT_INPUT',
          source: source
        },
        analysis: createFallbackAnalysis(text)
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }
  }

  // For authenticated requests, check limits
  const authResult = await verifyToken(req);
  if (!authResult.success) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = authResult.user.uid;

  // Check usage limits
  const usageCheck = await checkUsageLimit(userId, 'ai_query');
  if (!usageCheck.allowed) {
    return Response.json({ 
      error: usageCheck.message,
      upgradeMessage: usageCheck.upgradeMessage,
      upgradeRequired: usageCheck.upgradeRequired,
      currentUsage: usageCheck.currentUsage,
      limit: usageCheck.limit
    }, { status: 403 });
  }

  const analysis = await analyzeTextWithGemini(text, 'TEXT_INPUT');
  
  // Track usage
  await trackUsage(userId, 'ai_query');

  return Response.json({
    success: true,
    extraction: {
      type: 'TEXT_INPUT'
    },
    analysis
  });
}

// Create fallback analysis when AI fails
function createFallbackAnalysis(text) {
  const textLength = text.length;
  const wordCount = text.split(/\s+/).length;
  
  // Simple keyword-based risk assessment
  const highRiskKeywords = ['without compensation', 'no payment', 'exclusive property', 'prohibited from', 'strictly prohibited', 'under any circumstances', 'refrain from'];
  const mediumRiskKeywords = ['intellectual property', 'confidential', 'non-disclosure', 'terminate', 'breach'];
  
  let riskScore = 3; // Default low-medium risk
  let riskLevel = 'MEDIUM';
  let foundRisks = [];
  
  // Check for high-risk keywords
  highRiskKeywords.forEach(keyword => {
    if (text.toLowerCase().includes(keyword.toLowerCase())) {
      riskScore = Math.min(riskScore + 2, 9);
      foundRisks.push({
        keyword,
        level: 'HIGH',
        explanation: `Contains restrictive language: "${keyword}"`
      });
    }
  });
  
  // Check for medium-risk keywords
  mediumRiskKeywords.forEach(keyword => {
    if (text.toLowerCase().includes(keyword.toLowerCase())) {
      riskScore = Math.min(riskScore + 1, 8);
      foundRisks.push({
        keyword,
        level: 'MEDIUM',
        explanation: `Legal term requiring attention: "${keyword}"`
      });
    }
  });
  
  if (riskScore >= 7) riskLevel = 'HIGH';
  else if (riskScore >= 4) riskLevel = 'MEDIUM';
  else riskLevel = 'LOW';

  // Create brief summary for Chrome extension
  let briefSummary = '';
  if (riskScore >= 7) {
    briefSummary = `⚠️ HIGH RISK detected in this clause. Contains restrictive terms that may limit your rights.`;
  } else if (riskScore >= 4) {
    briefSummary = `⚡ MEDIUM RISK found. Some terms need attention before signing.`;
  } else {
    briefSummary = `✅ LOW RISK detected. Appears to be standard legal language.`;
  }
  
  return {
    language: "en",
    client_perspective: "Employee/Contractor",
    overall_risk_score: riskScore.toString(),
    summary: `${briefSummary} Open full app for detailed analysis and recommendations.`,
    missing_clauses: [
      "Open Legal Risk Radar app for comprehensive analysis",
      "Get detailed explanations and legal recommendations"
    ],
    clauses: [
      {
        id: "1",
        clause_snippet: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        risk_level: riskLevel,
        explanation: foundRisks.length > 0 
          ? `${foundRisks.length} concern(s) found. Open app for full details.`
          : "Quick scan complete. Open app for comprehensive legal analysis.",
        recommendation: "Visit Legal Risk Radar app for detailed breakdown and expert recommendations"
      }
    ]
  };
}

// Handle file upload analysis (existing functionality)
async function handleFileAnalysis(req) {
  // Verify authentication
  const authResult = await verifyToken(req);
  if (!authResult.success) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = authResult.user.uid;

  // Check usage limits for document analysis
  const usageCheck = await checkUsageLimit(userId, 'document_analysis');
  if (!usageCheck.allowed) {
    return Response.json({ 
      error: usageCheck.message,
      upgradeMessage: usageCheck.upgradeMessage,
      upgradeRequired: usageCheck.upgradeRequired,
      currentUsage: usageCheck.currentUsage,
      limit: usageCheck.limit
    }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file) {
    return Response.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return Response.json(
      { error: `File too large. Max ${MAX_FILE_SIZE_MB}MB allowed.` },
      { status: 413 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let extractedText = "";
  let ocrConfidence = null;
  let extractionType = "PDF_TEXT";

  // PDF
  if (file.type === "application/pdf") {
    extractedText = await parsePdfBuffer(buffer);
  }

  // Image OCR
  else if (file.type.startsWith("image/")) {
    const result = await Tesseract.recognize(
      buffer,
      "eng+hin",
      { logger: () => {} }
    );

    extractedText = result.data.text;
    ocrConfidence = result.data.confidence;
    extractionType = "IMAGE_OCR";
  }

  else {
    return Response.json(
      { error: "Only PDF or Image files are supported" },
      { status: 400 }
    );
  }

  const cleanText = extractedText.trim();

  if (!cleanText || cleanText.length < 20) {
    return Response.json(
      { error: "Text could not be reliably extracted" },
      { status: 422 }
    );
  }

  const analysis = await analyzeTextWithGemini(cleanText, extractionType, ocrConfidence);

  // Track usage after successful analysis
  await trackUsage(userId, 'document_analysis');

  return Response.json({
    success: true,
    extraction: {
      type: extractionType,
      ocrConfidence
    },
    analysis
  });
}

// Shared Gemini analysis function
async function analyzeTextWithGemini(text, extractionType, ocrConfidence = null) {
  const sanitizedDoc = text.replace(/"""/g, "'''");

  const prompt = `
You are a Legal Risk Explanation AI designed for NON-LAWYERS.

IMPORTANT CONTEXT ABOUT INPUT QUALITY:
- Extraction Type: ${extractionType}
- OCR Confidence: ${ocrConfidence ?? "N/A"}
If confidence is low, mention that some text may be unclear.

ASSUME:
- The user is a normal person (student, freelancer, startup founder)
- They have NO legal background
- They want to understand risks, not legal theory

CONTEXT:
- Client Role: Determine from context
- Document Type: General Contract
- Jurisdiction: General commercial understanding

WHAT YOU MUST DO:
1. Analyze the document ONLY from the client's point of view.
2. Highlight clauses that can cause:
   - Money loss
   - Legal trouble
   - Unfair control by the other party
3. Identify important protections that are MISSING.
4. Explain EVERYTHING in simple language.

LANGUAGE RULES:
- Avoid legal jargon.
- Explain legal words in brackets.
- Short sentences.
- Friendly tone.

DOCUMENT:
"""
${sanitizedDoc}
"""

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "language": "detected language code (e.g. en, hi)",
  "client_perspective": "Who this contract affects most",
  "overall_risk_score": "1-10",
  "summary": "Simple explanation of risk",
  "missing_clauses": [
    "Clause name (simple explanation)"
  ],
  "clauses": [
    {
      "id": "1",
      "clause_snippet": "Exact risky sentence",
      "risk_level": "CRITICAL | HIGH | MEDIUM | LOW | BENEFICIAL",
      "explanation": "Simple explanation",
      "recommendation": "What to ask or change"
    }
  ]
}

SAFETY RULES:
- Do NOT give legal advice.
- Output RAW JSON only.
`;

  const rawResult = await callGemini(prompt);

  const cleanedJson = rawResult
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleanedJson);
}

// ---------- pdf2json helper ----------
function parsePdfBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(this, 1);

    pdfParser.on("pdfParser_dataError", err =>
      reject(new Error(err.parserError))
    );

    pdfParser.on("pdfParser_dataReady", () => {
      resolve(pdfParser.getRawTextContent());
    });

    pdfParser.parseBuffer(buffer);
  });
}
