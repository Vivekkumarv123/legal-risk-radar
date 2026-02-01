# Legal Risk Radar

Legal Risk Radar is an AI-powered web application that helps non-lawyers understand legal documents in simple, everyday language. Now featuring a comprehensive subscription system, enhanced features, and seamless user experience.

Upload a legal document (PDF or image), and the system will:

- Extract the text (OCR)
- Analyze legal risks using AI
- Highlight dangerous clauses
- Explain everything clearly
- Read explanations aloud in the user's language
- Generate PDF reports
- Compare contracts side-by-side
- Provide legal glossary assistance

> **⚠️ Disclaimer:** This is not legal advice. It is a legal awareness and risk-explanation tool.

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
- Multi-document support

### 🧠 AI Legal Risk Analysis
- Powered by Google Gemini
- Client-centric analysis (intern, freelancer, employee, buyer, etc.)
- Risk categorization: **CRITICAL**, **HIGH**, **MEDIUM**, **LOW**
- Missing clause detection
- Plain-language explanations (no legal jargon)
- Context-aware follow-up questions

### 🗣️ Voice & Language Support
- 🎙️ Voice input (Speech-to-Text)
- 🔊 Voice output (Text-to-Speech)
- 🌍 Multi-language support (12+ Indian languages)
- Auto language detection
- ChatGPT-style voice interaction
- Live conversation mode

### 💬 Modern Chat UI
- Typing animation for responses
- Thinking / analyzing loader
- Clause-level highlighting
- Scroll-to-risk feature
- Chat history and persistence
- Share chat functionality
- Minimal, clean UI inspired by ChatGPT & Gemini

### 🔐 Authentication & User Management
- Email/password authentication
- Google OAuth integration
- User profiles and avatars
- Secure JWT token management
- Password reset functionality
- Account deletion options

### 💳 Subscription System
- **Basic Plan**: 5 AI queries/day (Free)
- **Pro Plan**: Unlimited queries + premium features (₹499/month)
- **Enterprise Plan**: Team collaboration + API access (₹2499/month)
- Dummy payment gateway integration
- Real-time usage tracking
- ChatGPT-style upgrade flow
- Automatic plan enforcement

### 🎯 Enhanced Features
- **Chat Sharing**: Share conversations with public URLs
- **Contract Comparison**: Side-by-side clause analysis
- **PDF Reports**: Download analysis as professional reports
- **Legal Glossary**: Interactive legal term explanations
- **Chrome Extension**: Browser integration for quick analysis
- **Usage Analytics**: Track queries and document analysis

---

## 🏗️ Tech Stack

### Frontend
- Next.js 15 (App Router)
- React 19
- Tailwind CSS
- Lucide Icons
- react-type-animation
- Web Speech API (STT + TTS)
- jsPDF (PDF generation)
- React Hot Toast (notifications)

### Backend
- Next.js API Routes
- Google Gemini API
- Firebase Firestore (database)
- Firebase Admin SDK
- Tesseract.js (OCR for images)
- pdf2json (PDF text extraction)
- JWT authentication
- Cloudinary (file storage)

### Database
- Firebase Firestore collections:
  - `users` - User accounts and profiles
  - `chats` - Chat history and conversations
  - `subscriptions` - User subscription plans
  - `usage` - Monthly usage tracking
  - `sharedChats` - Public chat sharing

---

## 🧩 System Architecture

1. **User Authentication** → Login/Signup with Google OAuth
2. **Document Upload** → OCR API `/api/ocr`
3. **AI Analysis** → Gemini API `/api/generate-content`
4. **Usage Tracking** → Real-time limit enforcement
5. **Subscription Management** → Plan upgrades and billing
6. **Chat Persistence** → Firebase Firestore storage
7. **Enhanced Features** → PDF reports, sharing, comparison

---

## 📂 API Endpoints

### Authentication
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/google-login` - Google OAuth
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token

### Document Processing
- `POST /api/ocr` - Extract text from documents
- `POST /api/generate-content` - AI legal analysis
- `POST /api/analyze` - Advanced document analysis

### Chat Management
- `GET /api/chats` - Get user's chat history
- `GET /api/chats/[chatId]` - Get specific chat
- `DELETE /api/chats/delete` - Delete chat

### Subscription System
- `GET /api/subscription` - Get user's subscription
- `POST /api/subscription` - Create/upgrade subscription
- `DELETE /api/subscription` - Cancel subscription
- `GET /api/usage` - Get usage statistics

### Enhanced Features
- `POST /api/share-chat` - Share chat publicly
- `GET /api/shared/[shareId]` - Get shared chat
- `POST /api/compare-contracts` - Compare documents
- `GET /api/legal-glossary` - Legal term definitions

---

## 🔄 User Journey

### New User Flow
1. **Visit Pricing Page** → View plans and features
2. **Sign Up Free** → Create account with Basic plan
3. **Private Chat** → Start analyzing documents
4. **Hit Limits** → See upgrade prompts and banners
5. **Upgrade Flow** → Select plan → Payment → Return to chat
6. **Premium Features** → Unlimited access to all features

### Subscription Tiers

#### 🆓 Basic Plan (Free)
- 5 AI queries per day
- Basic document summary
- Community support
- Access to IPC/CrPC context

#### 🚀 Pro Plan (₹499/month)
- Unlimited AI queries
- Deep contract risk analysis
- Voice-to-text queries
- PDF report generation
- Priority email support
- Contract comparison tool
- Chrome extension access
- Legal glossary pop-ups

#### 🏢 Enterprise Plan (₹2499/month)
- Everything in Pro
- Team collaboration (5 users)
- API access for workflows
- Dedicated account manager
- Custom legal templates
- Unlimited documents
- Advanced analytics
- White-label reports

---

## 🧪 Example AI Output

```json
{
  "overall_risk_score": "7",
  "summary": "This contract heavily favors the employer with limited protections for you.",
  "missing_clauses": [
    "Termination Notice Period",
    "Intellectual Property Rights",
    "Expense Reimbursement"
  ],
  "clauses": [
    {
      "clause": "Employee shall work without any monetary compensation",
      "risk_level": "HIGH",
      "explanation": "You will not receive any salary or payment for your work, which may violate labor laws.",
      "recommendation": "Negotiate for at least minimum wage or stipend."
    }
  ]
}
```

---

## 🎨 UI/UX Features

### Chat Interface
- **Upgrade Button**: Always visible in sidebar for Basic users
- **Usage Banner**: Proactive upgrade prompts when approaching limits
- **Limit Modal**: Professional upgrade flow when limits exceeded
- **Share Button**: Share interesting conversations publicly
- **Voice Interface**: Hands-free legal consultation

### Subscription Management
- **Current Usage Dashboard**: Real-time usage tracking
- **Plan Comparison**: Clear feature differences
- **Payment Modal**: Secure dummy payment processing
- **Return Flow**: Seamless return to chat after upgrade

### Enhanced Features
- **PDF Reports**: Professional document analysis reports
- **Contract Comparison**: Side-by-side clause analysis
- **Legal Glossary**: Interactive term definitions
- **Chrome Extension**: Browser-based document analysis

---

## ⚠️ Disclaimer

Legal Risk Radar does **not** provide legal advice.  
It highlights potential risks using AI and general legal understanding.  
Always consult a qualified lawyer for legal decisions.

---

## 🚀 Recent Updates

### v2.0 - Enhanced Features & Subscription System
- ✅ Complete subscription system with 3 tiers
- ✅ ChatGPT-style upgrade flow
- ✅ Real-time usage tracking and enforcement
- ✅ Chat sharing with public URLs
- ✅ Contract comparison tool
- ✅ PDF report generation
- ✅ Chrome extension
- ✅ Legal glossary with interactive popups
- ✅ Voice interface with 12+ Indian languages
- ✅ Database persistence with Firebase Firestore
- ✅ Authentication with Google OAuth
- ✅ Professional UI/UX improvements

---

## 👨‍💻 Target Users

- **Students** - Understanding internship agreements
- **Freelancers** - Analyzing client contracts
- **Startup Founders** - Reviewing legal documents
- **Small Business Owners** - Contract risk assessment
- **Legal Professionals** - Quick document screening
- **Non-legal Professionals** - General legal awareness

---

## 🔧 Installation & Setup

1. **Clone the repository**
```bash
git clone https://github.com/your-repo/legal-risk-radar.git
cd legal-risk-radar
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Add your API keys and configuration
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open in browser**
```
http://localhost:3000
```

---

## 🌟 Key Differentiators

- **User-Centric**: Designed for non-lawyers
- **AI-Powered**: Advanced Gemini integration
- **Subscription Model**: Sustainable business model
- **Indian Context**: Focused on Indian legal system
- **Multi-Language**: Support for regional languages
- **Professional Grade**: Enterprise-ready features
- **Privacy-First**: Secure document processing

---

## ❤️ Inspiration

Legal Risk Radar is inspired by:

- **ChatGPT** - Conversational AI interface
- **Google Gemini** - Advanced AI capabilities  
- **Claude AI** - Thoughtful AI responses
- **Stripe** - Seamless payment experience
- **Notion** - Clean, professional design

Built with a focus on **clarity**, **safety**, **scalability**, and **user experience**.

---

## 📈 Future Roadmap

- **Real Payment Gateway** - Stripe/Razorpay integration
- **Mobile App** - React Native application
- **API Platform** - Public API for developers
- **Advanced Analytics** - Usage insights and reporting
- **Team Features** - Collaboration tools
- **Document Templates** - Pre-built legal templates
- **AI Training** - Custom legal AI models
- **International Expansion** - Support for other legal systems

---

## 📊 Project Status

**Current Version**: v2.0  
**Status**: Production Ready  
**Last Updated**: February 2026  
**License**: MIT  

**Key Metrics**:
- 🎯 Complete subscription system
- 🔐 Secure authentication flow
- 📱 Responsive design
- 🚀 Production-ready deployment
- 💳 Payment gateway integration
- 📊 Real-time usage tracking
- 🎨 Professional UI/UX

---

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for more details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## 📞 Support

For support, email us at support@legalriskradar.com or join our community Discord.

---

**Built with ❤️ for the legal community**