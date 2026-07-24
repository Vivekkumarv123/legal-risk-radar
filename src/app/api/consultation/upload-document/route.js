import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { createWorker } from 'tesseract.js';
import { getCachedDocumentText, setCachedDocumentText } from '@/lib/documentCache';
import PDFParser from 'pdf2json';

// pdf2json helper function for stable PDF text parsing
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

/**
 * POST: Handles document uploads.
 * Checks for searchable PDF text (Native) vs scanned image files (OCR fallback).
 * Uploads to Google Drive using user's access token and logs metadata to Firestore.
 */
export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const consultationId = formData.get('consultationId');
    const accessToken = formData.get('accessToken'); // Google OAuth token

    if (!file || !consultationId) {
      return NextResponse.json({ 
        error: 'Missing required parameters: file and consultationId are required.' 
      }, { status: 400 });
    }

    // Sanitize and validate consultationId parameter format
    if (typeof consultationId !== 'string' || !/^[a-zA-Z0-9_-]{4,50}$/.test(consultationId)) {
      return NextResponse.json({ error: 'Invalid consultationId format' }, { status: 400 });
    }

    // File validation: caps size to 10MB to avoid server memory overload
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File size exceeds the 10MB limit. Uploaded size was ${(file.size / (1024 * 1024)).toFixed(2)}MB.` 
      }, { status: 400 });
    }

    // File validation: filters disallowed file types
    const ALLOWED_MIME_TYPES = [
      'application/pdf', 
      'image/png', 
      'image/jpeg', 
      'image/jpg',
      'image/webp',
      'text/plain',
      'text/markdown',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: `Disallowed file format: ${file.type}. Only PDFs, standard images, text, and Word docs are supported.` 
      }, { status: 400 });
    }

    const filename = file.name;
    const mimeType = file.type;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Bypassed Google Drive upload for fast offline submissions. Process locally.
    const driveFile = {
      id: `local-${crypto.randomUUID()}`,
      name: filename,
      url: ''
    };

    let extractedText = '';
    let isNative = false;
    let textSummary = '';

    // 1. Try Cache Lookup (SHA-256 hash comparison)
    const cachedText = getCachedDocumentText(buffer);
    if (cachedText) {
      extractedText = cachedText;
      isNative = true;
      textSummary = extractedText.substring(0, 500) + '...';
      console.log("[Upload Ingest] Text retrieved from SHA-256 cache.");
    } else {
      // 2. Cascade logic: Native PDF check vs. OCR
      if (mimeType === 'application/pdf') {
        try {
          const parsedText = await parsePdfBuffer(buffer);
          
          // If there's searchable text, it's a native PDF
          if (parsedText.trim().length > 150) {
            isNative = true;
            extractedText = parsedText.trim();
            textSummary = extractedText.substring(0, 500) + '...';
          } else {
            // Empty text means scanned image-only PDF
            isNative = false;
            textSummary = '[Scanned PDF Document Detected] Requires visual reasoning or OCR parsing.';
          }
        } catch (pdfErr) {
          console.error('Error parsing PDF text, falling back:', pdfErr);
          isNative = false;
          textSummary = '[Non-searchable PDF] Native text extraction failed.';
        }
      } else if (mimeType.startsWith('image/')) {
        // Run GCP Vision OCR with local Tesseract fallback
        try {
          const { detectTextFromBuffer } = await import('@/services/gcpVisionService');
          extractedText = await detectTextFromBuffer(buffer);
          isNative = false;
          textSummary = extractedText.substring(0, 500) + '...';
        } catch (gcpErr) {
          console.warn("GCP Vision OCR failed, falling back to local Tesseract OCR:", gcpErr.message);
          const worker = await createWorker('eng');
          const { data: { text } } = await worker.recognize(buffer);
          await worker.terminate();
          
          isNative = false;
          extractedText = text || '';
          textSummary = extractedText.trim().substring(0, 500) + '...';
        }
      } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || filename.endsWith('.docx')) {
        // It is a Word Document (.docx). Parse using Mammoth.
        try {
          const mammoth = await import('mammoth');
          const result = await mammoth.extractRawText({ buffer });
          extractedText = result.value || '';
          isNative = true;
          textSummary = extractedText.trim().substring(0, 500) + '...';
        } catch (wordErr) {
          console.error('Word Document (.docx) parsing failed:', wordErr);
          isNative = false;
          textSummary = '[Word Document] Text extraction failed.';
        }
      } else {
        // Text or other document formats
        extractedText = buffer.toString('utf-8');
        isNative = true;
        textSummary = extractedText.substring(0, 500) + '...';
      }

      // 3. Save result to SHA-256 Cache
      if (extractedText) {
        setCachedDocumentText(buffer, extractedText);
      }
    }

    // 3. Save document references in the consultations collection in Firestore
    const docRef = db.collection('consultations').doc(consultationId);
    
    const newDocItem = {
      googleFileId: driveFile.id,
      name: driveFile.name,
      mimeType,
      url: driveFile.url,
      summary: textSummary,
      isNative,
      uploadedAt: new Date().toISOString()
    };

    await docRef.collection('documents').doc(driveFile.id).set(newDocItem);

    // Write a timeline event about this upload
    await docRef.update({
      timelineEvents: FieldValue.arrayUnion({
        event: `${filename} Ingested (${isNative ? 'Native Layout' : 'Scanned Image OCR'})`,
        timestamp: new Date().toISOString()
      }),
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      data: newDocItem
    });
  } catch (error) {
    console.error('Error processing document upload:', error);
    return NextResponse.json({ 
      error: 'Upload process failed', 
      details: error.message 
    }, { status: 400 });
  }
}
