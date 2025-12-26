import Tesseract from "tesseract.js";
import PDFParser from "pdf2json";

// ---------------- CONFIG ---------------- //
const MAX_FILE_SIZE_MB = 10; // ✅ 10 MB limit
// --------------------------------------- //

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // ✅ File size validation
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return Response.json(
        { error: `File too large. Max ${MAX_FILE_SIZE_MB}MB allowed.` },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = "";
    let ocrConfidence = null; // ✅ confidence (image only)

    // 📄 PDF Handling
    if (file.type === "application/pdf") {
      extractedText = await parsePdfBuffer(buffer);
    }

    // 🖼️ Image OCR
    else if (file.type.startsWith("image/")) {
      const result = await Tesseract.recognize(
        buffer,
        "eng+hin",
        { logger: () => {} }
      );

      extractedText = result.data.text;
      ocrConfidence = result.data.confidence; // ✅ confidence score
    }

    else {
      return Response.json(
        { error: "Only PDF or Image files are supported" },
        { status: 400 }
      );
    }

    // 🧹 Clean & Validate Text
    const cleanText = extractedText.trim();

    if (!cleanText || cleanText.length < 20) {
      return Response.json(
        {
          error:
            "Text could not be reliably extracted (file may be empty or scanned poorly)"
        },
        { status: 422 }
      );
    }

    return Response.json({
      success: true,
      text: cleanText,
      ocrConfidence, // ✅ null for PDFs, number for images
    });

  } catch (err) {
    console.error("OCR Error:", err);
    return Response.json(
      { error: "Processing failed", details: err.message },
      { status: 500 }
    );
  }
}

// 🛠️ pdf2json helper
function parsePdfBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(this, 1);

    pdfParser.on("pdfParser_dataError", err =>
      reject(new Error(err.parserError))
    );

    pdfParser.on("pdfParser_dataReady", () => {
      const rawText = pdfParser.getRawTextContent();
      resolve(rawText);
    });

    pdfParser.parseBuffer(buffer);
  });
}
