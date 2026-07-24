export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { createWorker } from "tesseract.js";
import PDFParser from "pdf2json";
import { getCachedDocumentText, setCachedDocumentText } from "@/lib/documentCache";

const MAX_FILE_SIZE_MB = 15;

// pdf2json helper
function parsePdfBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1);

    pdfParser.on("pdfParser_dataError", err =>
      reject(err.parserError)
    );

    pdfParser.on("pdfParser_dataReady", () => {
      resolve(pdfParser.getRawTextContent() || "");
    });

    pdfParser.parseBuffer(buffer);
  });
}

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
    
    // 1. Try Cache Lookup (SHA-256 hash comparison)
    const cachedText = getCachedDocumentText(buffer);
    if (cachedText) {
      return Response.json({
        success: true,
        text: cachedText,
        ocrConfidence: 100,
        cached: true
      });
    }

    let extractedText = "";
    let ocrConfidence = null;

    // 📄 PDF (text → OCR fallback)
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith('.pdf')) {
      extractedText = await parsePdfBuffer(buffer);

      if (!extractedText || extractedText.trim().length < 20) {
        console.log("PDF scanned or empty — GCP Vision OCR / Tesseract fallback");

        try {
          // Attempt GCP Vision API OCR Annotation
          const { detectTextFromBuffer } = await import("@/services/gcpVisionService");
          extractedText = await detectTextFromBuffer(buffer);
          ocrConfidence = 99;
        } catch (gcpErr) {
          console.warn("GCP Vision OCR failed, falling back to local Tesseract OCR:", gcpErr.message);
          const worker = await createWorker("eng");
          const result = await worker.recognize(buffer);
          extractedText = result.data.text;
          ocrConfidence = result.data.confidence;
          await worker.terminate();
        }
      }
    }

    // 🖼️ Image
    else if (file.type.startsWith("image/")) {
      try {
        // Attempt GCP Vision API OCR Annotation
        const { detectTextFromBuffer } = await import("@/services/gcpVisionService");
        extractedText = await detectTextFromBuffer(buffer);
        ocrConfidence = 99;
      } catch (gcpErr) {
        console.warn("GCP Vision OCR failed, falling back to local Tesseract OCR:", gcpErr.message);
        const worker = await createWorker("eng");
        const result = await worker.recognize(buffer);
        extractedText = result.data.text;
        ocrConfidence = result.data.confidence;
        await worker.terminate();
      }
    }

    else {
      return Response.json(
        { error: "Only PDF or image files supported" },
        { status: 400 }
      );
    }

    // 🧹 Clean
    const cleanText = extractedText
      .replace(/\s+/g, " ")
      .replace(/\n+/g, "\n")
      .trim();

    if (!cleanText || cleanText.length < 20) {
      return Response.json(
        {
          error: "No readable text found",
          reason: "Scanned or low-quality document",
          ocrConfidence,
        },
        { status: 422 }
      );
    }

    // 2. Save result to SHA-256 Cache
    setCachedDocumentText(buffer, cleanText);

    return Response.json({
      success: true,
      text: cleanText,
      ocrConfidence,
      cached: false
    });

  } catch (err) {
    console.error("OCR Error:", err);
    return Response.json(
      { error: "Processing failed", details: err.message },
      { status: 500 }
    );
  }
}
