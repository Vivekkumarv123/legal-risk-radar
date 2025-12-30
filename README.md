# Legal Risk Radar

Legal Risk Radar is an AI-powered web application that helps non-lawyers understand legal documents in simple, everyday language.

Upload a legal document (PDF or image), and the system will:

- Extract the text (OCR)
- Analyze legal risks using AI
- Highlight dangerous clauses
- Explain everything clearly
- Read explanations aloud in the user’s language

> **⚠️ Disclaimer:** This is not legal advice. It is a legal awareness and risk-explanation tool .

---

## 🚀 Why Legal Risk Radar?

Legal documents are:

- Hard to understand
- Full of confusing jargon
- Risky if misunderstood

Legal Risk Radar acts like a legal safety assistant, helping users identify:

- Where they may lose money
- Where legal traps exist
- What protections are missing
- How risky a document really is

---

## ✨ Features

### 📄 Document Processing
- Upload PDF or Image
- OCR support for scanned documents
- File size validation
- Text extraction quality checks

### 🧠 AI Legal Risk Analysis
- Powered by Google Gemini
- Client-centric analysis (intern, freelancer, employee, buyer, etc.)
- Risk categorization: **CRITICAL**, **HIGH**, **MEDIUM**, **LOW**
- Missing clause detection
- Plain-language explanations (no legal jargon)

### 🗣️ Voice & Language Support
- 🎙️ Voice input (Speech-to-Text)
- 🔊 Voice output (Text-to-Speech)
- 🌍 Multi-language support (English, Hindi, Marathi planned)
- Auto language detection
- ChatGPT-style voice interaction

### 💬 Modern Chat UI
- Typing animation for responses
- Thinking / analyzing loader
- Clause-level highlighting
- Scroll-to-risk feature
- Minimal, clean UI inspired by ChatGPT & Gemini

---

## 🏗️ Tech Stack

### Frontend
- Next.js 16 (App Router)
- React 19
- Tailwind CSS
- Lucide Icons
- react-type-animation
- Web Speech API (STT + TTS)

### Backend
- Next.js API Routes
- Google Gemini API
- Tesseract.js (OCR for images)
- pdf2json (PDF text extraction)

---

## 🧩 System Architecture

1. **User Upload / Voice Input**  
2. **OCR API** `/api/ocr`  
   - Extracts text from uploaded documents (PDF or image)
3. **Extracted Text**  
4. **Gemini Analysis API** `/api/generate-content`  
   - Analyzes extracted text and identifies legal risks
5. **Structured Risk JSON**  
6. **Frontend Rendering + Voice Explanation**

---

## 📂 API Endpoints

### `/api/ocr`

Handles document upload and text extraction.

#### Input
- PDF or Image file

#### Response
```json
{
  "success": true,
  "text": "Extracted document text",
  "ocrConfidence": 91.2
}
```

### `/api/generate-content`

Analyzes extracted document text and provides a risk breakdown.

#### Input
```json
{
  "documentText": "...",
  "userQuestion": "Explain risks"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "overall_risk_score": "7",
    "summary": "This is a one-sided agreement.",
    "clauses": []
  }
}
```

## 🧪 Example AI Output

```json
{
  "overall_risk_score": "7",
  "summary": "You are working for free with no job security.",
  "missing_clauses": [
    "Internship Certificate",
    "Expense Reimbursement"
  ],
  "clauses": [
    {
      "risk_level": "CRITICAL",
      "explanation": "You will not be paid any money."
    }
  ]
}
```

## ⚠️ Disclaimer

Legal Risk Radar does **not** provide legal advice.  
It highlights potential risks using AI and general legal understanding.  
Always consult a qualified lawyer for legal decisions.

---

## 📌 Future Enhancements

- Clause comparison between contracts  
- Downloadable risk reports (PDF)  
- Chrome extension  
- Legal glossary pop-ups  
- More Indian language voices  
- Optional user accounts & history  

---

## 👨‍💻 Target Users

- Students  
- Interns  
- Freelancers  
- Startup founders  
- Non-legal professionals  

---

## ❤️ Inspiration

Legal Risk Radar is inspired by:

- ChatGPT  
- Google Gemini  
- Claude AI  

Built with a focus on **clarity**, **safety**, and **simplicity**.

