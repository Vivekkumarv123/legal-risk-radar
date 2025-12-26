import Tesseract from "tesseract.js";
import PDFParser from "pdf2json";
import { callGemini } from "@/lib/gemini";

const MAX_FILE_SIZE_MB = 10;

export async function POST(req) {
  try {
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

    // ================= GEMINI PROMPT (YOUR VERSION) ================= //

    const sanitizedDoc = cleanText.replace(/"""/g, "'''");

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

    const parsedResult = JSON.parse(cleanedJson);

    return Response.json({
      success: true,
      extraction: {
        type: extractionType,
        ocrConfidence
      },
      analysis: parsedResult
    });

  } catch (err) {
    console.error("Analyze Error:", err);
    return Response.json(
      { error: "Processing failed", details: err.message },
      { status: 500 }
    );
  }
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
