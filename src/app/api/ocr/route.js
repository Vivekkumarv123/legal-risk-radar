export const runtime = "nodejs";

import { createWorker } from "tesseract.js";
import PDFParser from "pdf2json";

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
    let extractedText = "";
    let ocrConfidence = null;

    // 📄 PDF (text → OCR fallback)
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith('.pdf')) {
      extractedText = await parsePdfBuffer(buffer);

      if (!extractedText || extractedText.trim().length < 20) {
        console.log("PDF scanned or empty — OCR fallback");

        try {
          const worker = await createWorker("eng");
          const result = await worker.recognize(buffer);
          extractedText = result.data.text;
          ocrConfidence = result.data.confidence;
          await worker.terminate();
        } catch (ocrError) {
          console.error("OCR failed:", ocrError);
          return Response.json(
            { error: "OCR processing failed", details: ocrError.message },
            { status: 500 }
          );
        }
      }
    }

    // 🖼️ Image
    else if (file.type.startsWith("image/")) {
      try {
        const worker = await createWorker("eng");
        const result = await worker.recognize(buffer);
        extractedText = result.data.text;
        ocrConfidence = result.data.confidence;
        await worker.terminate();
      } catch (ocrError) {
        console.error("OCR failed:", ocrError);
        return Response.json(
          { error: "OCR processing failed", details: ocrError.message },
          { status: 500 }
        );
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

    return Response.json({
      success: true,
      text: cleanText,
      ocrConfidence,
    });

  } catch (err) {
    console.error("OCR Error:", err);
    return Response.json(
      { error: "Processing failed", details: err.message },
      { status: 500 }
    );
  }
}
