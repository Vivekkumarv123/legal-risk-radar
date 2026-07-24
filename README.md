# Legal Advisor 🏛️⚖️

![Legal Advisor Cover Photo](./public/cover_image.png)

> **Submission for the Google Cloud Gen AI Academy APAC Cohort 2 Hackathon**

**An AI-powered legal consultancy and decision-support platform designed to help students, individuals, small businesses, and startups understand legal documents and navigate complex legal concepts with clarity.**

---

## 🏆 Hackathon Context

**Built for the Google Cloud Gen AI Academy APAC Cohort 2 Hackathon.**

Legal Advisor demonstrates how Google Cloud Generative AI and cloud infrastructure can be combined into a real-world, multi-modal legal decision-support system. By leveraging **Google Gemini 3.1 Flash Lite**, **Gemini 3.1 Flash Live Preview**, **Google Cloud Vision OCR**, **Google Cloud BigQuery**, **Firebase Firestore**, and **Google OAuth 2.0**, the platform bridges the gap between complex legal agreements and non-lawyer understanding.

---

## 🛑 Problem Statement

Legal documents govern critical milestones for individuals, students, freelancers, and small businesses—from employment offers and university housing leases to vendor agreements and NDAs. However, standard legal review presents severe barriers:

- **Opaque Legalese & Jargon:** Archaic legal language makes contracts nearly impossible for non-lawyers to evaluate accurately.
- **Hidden & Omitted Risks:** Crucial safeguards (such as liability caps, unfair termination clauses, or indemnification shifts) are frequently buried or omitted entirely.
- **Expensive & Slow Traditional Review:** Retaining professional legal counsel for preliminary document screening is costly and time-consuming.
- **Fragmented Legal Tools:** Users must jump between PDF viewers, search engines for legal definitions, and drafting software to understand and act on a document.
- **High Risk of Pre-Execution Mistakes:** Non-lawyers often sign binding agreements without fully understanding their obligations or potential financial exposure.

---

## 💡 Solution

Legal Advisor is an **AI-powered legal decision-support and educational platform**. It transforms dense, complex contracts into clear, structured, and actionable intelligence.

- **Decision Support, Not Replacement:** Legal Advisor empowers users to understand contract risks, identify missing safeguards, and prepare for discussions. It provides educational guidance and structured insights, operating strictly as a decision-support tool rather than a substitute for licensed legal counsel.
- **Multi-Modal Document Intelligence:** Ingests digital PDFs, Word documents (`.docx`), scanned physical files, images, and browser web text using native text parsers and Google Cloud Vision OCR.
- **Real-Time Interactive Consultation:** Features **Aura AI**, a virtual legal consultant supporting low-latency live voice and text interaction powered by Google Gemini Live models over WebSockets.
- **Browser-Level Text Inspection:** Includes a Chrome Extension that enables instant risk scanning and legal relevance detection directly on web pages and online PDFs.
- **Integrated Legal Workflow:** Combines document auditing, side-by-side contract comparison, an interactive legal glossary, document generation, and exportable PDF decision briefs into a single interface.

---

## ✨ Key Features

### 1. AI Legal Chat & Contextual Document Analysis
- **WHAT it does:** A conversational AI interface where users can ask questions about uploaded documents or general legal topics. Powered by `gemini-3.1-flash-lite` with a sliding context memory window and automated AI title generation.
- **WHY it matters:** Delivers immediate, plain-English explanations for complex legal queries and specific contract clauses.

### 2. Multi-Format Document Parsing & SHA-256 OCR Caching
- **WHAT it does:** Extracts text from PDFs (`pdf2json`), Word documents (`mammoth`), scanned files, and image formats (`.png`, `.jpg`) via Google Cloud Vision OCR (`DOCUMENT_TEXT_DETECTION`) with local Tesseract.js fallback. Results are cached using SHA-256 content hashing.
- **WHY it matters:** Ensures high-speed, reliable document analysis for any document type without redundant processing.

### 3. Contract Risk Scoring & Clause Classification
- **WHAT it does:** Audits document text and assigns an overall numerical risk score (0–10) while categorizing individual clauses into **HIGH**, **MEDIUM**, or **LOW** risk levels.
- **WHY it matters:** Instantly draws user focus to high-exposure liabilities, hidden penalties, or unfair obligations.

### 4. Missing Safeguard & Missing Clause Detection
- **WHAT it does:** Scans contracts against standard protective benchmarks to identify omitted terms—such as missing salary details, termination notice windows, or IP ownership protections.
- **WHY it matters:** Prevents users from signing unbalanced agreements that lack essential legal protections.

### 5. Side-by-Side Contract Comparison
- **WHAT it does:** Compares two contract versions (`/api/compare-contracts`), flagging structural modifications, clause additions/deletions, risk deltas, and strategic recommendations.
- **WHY it matters:** Eliminates manual line-by-line comparison when negotiating agreement revisions.

### 6. Searchable Legal Glossary & Research Hub
- **WHAT it does:** An interactive repository of 300+ legal terms across 12 legal categories (Contract, Corporate, IP, Labour, Civil, Criminal, etc.) (`/api/legal-glossary`).
- **WHY it matters:** Builds legal literacy by explaining complex legal terms directly inside the user's workflow.

### 7. Aura AI / Virtual Legal Consultation Stage
- **WHAT it does:** A 1-on-1 virtual consultation room (`/pages/(private)/legal-consultation/[id]`) featuring dynamic view switching (face-to-face video grid vs. contract split-screen viewer), an animated state-machine avatar, missing info panel, and decision brief exporting.
- **WHY it matters:** Recreates an interactive consultation session for thorough document review.

### 8. Real-Time Voice & Live Conversation
- **WHAT it does:** Enables hands-free verbal conversation using `models/gemini-3.1-flash-live-preview` over WebSockets, supplemented by Web Speech API fallback.
- **WHY it matters:** Offers accessible, conversational legal guidance for users who prefer speaking over typing.

### 9. Chrome Browser Extension
- **WHAT it does:** A Manifest V3 extension (`/chrome-extension`) allowing users to select legal text on any website or PDF. Evaluates legal relevance, assigns risk levels, and displays plain-English summaries in a floating overlay.
- **WHY it matters:** Brings instant contract intelligence directly to online Terms of Service, privacy policies, and digital agreements.

### 10. Legal Document Generator Suite
- **WHAT it does:** An in-browser editing environment powered by TipTap, featuring standardized templates, CSV mail merge, a digital signature canvas, AI clause polishing, PDF export, and email dispatch.
- **WHY it matters:** Streamlines drafting and customizing basic legal agreements.

### 11. PDF Report & Decision Brief Export
- **WHAT it does:** Generates formatted PDF reports (`jsPDF`, `html2canvas-pro`) compiling document risk scores, missing clause warnings, and consultation decision briefs.
- **WHY it matters:** Delivers shareable, offline-ready documentation for user records or attorney reviews.

### 12. Community Knowledge Platform
- **WHAT it does:** A community forum (`/api/community`) enabling users to post questions, comment, vote, and share practical experiences.
- **WHY it matters:** Encourages crowdsourced legal awareness and shared guidance.

### 13. Google Cloud BigQuery Audit Telemetry
- **WHAT it does:** Streams consultation events, risk scores, latency metrics, and document metadata into Google Cloud BigQuery (`legal_risk_radar.audit_logs`).
- **WHY it matters:** Enables operational auditing, analytics data warehousing, and system performance monitoring.

---

## 🎙️ Aura AI / AI Legal Consultant

Aura AI powers the Virtual Legal Consultation Room (`/pages/(private)/legal-consultation/[id]`), delivering a real-time advisory experience:

- **Gemini Live WebSocket Integration:** Communicates directly with `models/gemini-3.1-flash-live-preview` over WebSockets for low-latency voice and text interaction.
- **Voice-Based Interaction:** Supports hands-free verbal questions and responses, integrated with an animated avatar reflecting *Idle*, *Listening*, *Thinking*, and *Speaking* states.
- **Dynamic Consultation Stage:** Automatically transitions layout from full video stage to a split-screen contract audit viewer when a document is uploaded.
- **Missing Information & Risk Panel:** Real-time side panel displaying identified risks, missing parameters, and confidence metrics alongside the live dialogue.
- **Exportable Decision Briefs:** Compiles the session findings into a structured summary report detailing overall risk scores, key findings, and recommended next steps.

---

## 🧩 Chrome Extension

The Legal Advisor Chrome Extension (`/chrome-extension`) brings instant document intelligence to any browser window:

1. **Text Selection & Context Menu:** Select legal text on any web page or online PDF and trigger analysis via the context menu or floating action button.
2. **Legal Relevance Detection:** The backend evaluates whether the selected text contains legally binding clauses or general web content. If the text is non-legal, it provides a zero/low-risk notification.
3. **Instant Risk Breakdown:** Displays risk ratings (HIGH, MEDIUM, LOW), plain-English explanations, missing safeguards, and recommendations within a clean overlay popup.
4. **API Integration:** Connects directly with the Legal Advisor API endpoints (`/api/analyze`, `/api/generate-content`).

> 📖 **Dedicated Documentation:** For detailed installation, unpacked developer setup, troubleshooting, and testing instructions, refer to the [Chrome Extension README](./chrome-extension/README.md).

---

## 🌐 Google Technologies & Gen AI

Legal Advisor integrates Google Cloud services and Google AI models to power its architecture:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         Google Technologies Stack                                │
├───────────────────────────────┬──────────────────────────────────────────────────┤
│ Technology                    │ Role & Contribution                              │
├───────────────────────────────┼──────────────────────────────────────────────────┤
│ Google Gemini 3.1 Flash Lite  │ Primary LLM (`gemini-3.1-flash-lite`) chosen for  │
│                               │ fast structured reasoning, risk scoring, missing │
│                               │ clause detection, and interactive legal chat.    │
├───────────────────────────────┼──────────────────────────────────────────────────┤
│ Google Gemini 3.1 Flash Live  │ Real-time model (`models/gemini-3.1-flash-live-  │
│ Preview                       │ preview`) chosen for low-latency WebSocket live   │
│                               │ voice and virtual consultation sessions.         │
├───────────────────────────────┼──────────────────────────────────────────────────┤
│ Google Cloud Vision OCR       │ `DOCUMENT_TEXT_DETECTION` API chosen for high-   │
│                               │ precision text extraction from scanned PDFs and   │
│                               │ contract images using RS256 service account OAuth.│
├───────────────────────────────┼──────────────────────────────────────────────────┤
│ Google Cloud BigQuery         │ Cloud data warehouse (`legal_risk_radar.audit_   │
│                               │ logs`) chosen for streaming audit telemetry,      │
│                               │ risk event logging, and system metrics tracking. │
├───────────────────────────────┼──────────────────────────────────────────────────┤
│ Firebase Firestore            │ Stateful NoSQL database chosen as the persistent │
│                               │ memory bus for user profiles, chat history,      │
│                               │ subscriptions, and shared reports.               │
├───────────────────────────────┼──────────────────────────────────────────────────┤
│ Google OAuth 2.0              │ Identity framework (`@react-oauth/google`) chosen│
│                               │ for secure user sign-in and service authorization│
└───────────────────────────────┴──────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture

![Architecture Diagram](./public/architecture_diagram.png)

### Core System Workflow
1. **Frontend & Ingestion Layer:** Built with Next.js 15 (App Router) and React 19. Accepts document uploads (PDF, DOCX, images), user chat queries, and selection payloads from the Chrome Extension.
2. **Document Processing & OCR:** Extracts document text natively via `pdf2json` and `mammoth`, using Google Cloud Vision OCR (`DOCUMENT_TEXT_DETECTION`) with local Tesseract.js fallback for scanned files. Extracted text is cached using SHA-256 content hashes.
3. **Multi-Agent Gemini AI Engine:** Routes text through `gemini-3.1-flash-lite` for structured risk audits and clause extraction, while establishing WebSocket live streaming sessions via `models/gemini-3.1-flash-live-preview` for real-time voice consultations. Supported by multi-key rotation and exponential backoff retry algorithms.
4. **Data Store & Telemetry:** Persists user sessions and state logs in Firebase Firestore, while streaming audit analytics and risk metrics into Google Cloud BigQuery (`legal_risk_radar.audit_logs`).
5. **Outputs:** Delivers interactive risk dashboards, Aura AI live consultation stages, and exportable PDF decision briefs.

---

## 🔄 AI Workflow

![Sequence Diagram](./public/sequence_diagram.png)

1. **User Ingestion:** Document upload, chat query, or Chrome Extension text selection.
2. **Parsing & OCR:** Native text extraction or Google Cloud Vision OCR annotation.
3. **SHA-256 Cache Check:** Instant lookup to skip redundant processing for identical files.
4. **Gemini AI Reasoning:** Multi-agent prompt evaluation using `gemini-3.1-flash-lite` and live WebSocket sessions.
5. **Risk Audit & Clause Scan:** Structured JSON output categorizing HIGH, MEDIUM, and LOW risks alongside missing safeguards.
6. **Decision Support Output:** Interactive risk dashboard, Aura AI voice guidance, and exportable PDF decision briefs.

---

## 🛡️ Responsible AI & Safety

- **Decision-Support Boundary:** Legal Advisor is an AI decision-support and educational tool, **NOT** a substitute for a qualified, licensed lawyer.
- **Verification Notice:** Users should verify critical legal choices and binding decisions with qualified legal professionals.
- **Error Awareness:** AI-generated outputs are probabilistic and may contain inaccuracies. The system includes confidence indicators and risk warnings to encourage human review.
- **Accessibility & Transparency:** Designed to promote legal literacy, document transparency, and proactive risk detection for underserved communities and small businesses.

---

## 📈 Why It Matters

- **Lowers Legal Barriers:** Enables students, freelancers, and small business owners to understand complex legal documents without initial financial hurdles.
- **Early Risk Detection:** Identifies hidden traps and missing protections before contracts are signed.
- **Consolidated Platform:** Eliminates "app hopping" by combining chat, OCR, document comparison, glossary research, virtual voice consultation, and browser extension tools into a unified interface.

---

## 🔮 Future Roadmap

The following features represent planned future enhancements:

- 🔄 **Native Google Workspace Sync:** Direct two-way integration with Google Drive, Google Docs, and Google Calendar for document exporting and event scheduling.
- 📱 **Mobile Application:** Cross-platform mobile app built with React Native.
- 🌐 **Multi-Jurisdictional Frameworks:** Support for international legal systems and localized statutory rules.
- 🏢 **Enterprise Compliance Suite:** Automated SOC 2 compliance verification and custom white-label reports.
- 🔌 **Developer REST API:** Public API platform for external developer integrations.

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Google Cloud Console account (BigQuery & Vision API enabled)
- Firebase project credentials

### Setup Instructions

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/legal-risk-radar.git
   cd legal-risk-radar
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   # Gemini API Keys (Key Rotation Support)
   GEMINI_API_KEY_1=your_gemini_key_1
   GEMINI_API_KEY_2=your_gemini_key_2
   GEMINI_API_KEY_3=your_gemini_key_3

   # JWT Secrets
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   JWT_EXPIRATION=7d

   # Google OAuth Client ID
   NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_client_id

   # Firebase / GCP Service Account JSON String
   FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}

   # Email Configuration (Gmail SMTP)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-gmail-app-password
   SMTP_EMAIL=your-email@gmail.com
   SMTP_PASS=your-gmail-app-password

   # Stripe Payment Integration
   STRIPE_SECRET_KEY=sk_test_your_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
   STRIPE_WEBHOOK_SECRET=whsec_your_secret

   # Cron Job Security
   CRON_SECRET=your_cron_secret
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

5. **Open Application:**
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 🖼️ Architecture & Diagrams

- **Cover Image:** `![Cover Image](./public/cover_image.png)`
- **Architecture Diagram:** `![Architecture](./public/architecture_diagram.png)`
- **Sequence Diagram:** `![Sequence](./public/sequence_diagram.png)`

---

*Legal Advisor — Making Legal Documents Understandable for Everyone* 🏛️⚖️