"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
    FileText, 
    Download, 
    Book, 
    Mic, 
    ArrowRight,
    CheckCircle,
    Zap,
    Shield,
    HelpCircle,
    FileCheck,
    RefreshCw,
    Sparkles,
    ChevronRight,
    Lock,
    Scale,
    Menu,
    X,
    Play,
    Check,
    AlertTriangle,
    Sliders,
    Sparkle
} from "lucide-react";
import Image from "next/image";
import ClauseComparison from "../../../components/clause-comparison/ClauseComparison";
import PDFReportGenerator from "../../../components/pdf-report/PDFReportGenerator";
import LegalGlossary from "../../../components/legal-glossary/LegalGlossary";

export default function FeaturesPage() {
    const [selectedFeature, setSelectedFeature] = useState("aura-voice");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const sampleAnalysis = {
        summary: "This contract contains high-risk clauses including uncapped personal liability and a 24-month non-compete.",
        riskLevel: "High",
        risks: [
            { title: "Uncapped Personal Liability", description: "Section 9.1 exposes employee to full reimbursement of losses without a financial limit.", level: "high" },
            { title: "24-Month Non-Compete", description: "Section 4.2 restricts working in the industry for 2 years post-employment without pay.", level: "high" },
            { title: "Vague Termination Rights", description: "Employer can terminate immediately without specifying written notice cause.", level: "medium" }
        ],
        recommendations: [
            "Negotiate a reasonable liability cap equal to 3-6 months fees",
            "Reduce non-compete duration from 24 months to 6 months with severance pay",
            "Add a 30-day written notice requirement for contract termination"
        ]
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const featureItems = [
        {
            id: "aura-voice",
            title: "Live Voice & Video AI (Aura)",
            tagline: "Interactive Real-Time AI Legal Consultant",
            badge: "Live WebSockets",
            badgeStyle: "bg-blue-50 text-blue-700 border-blue-200",
            accentColor: "from-blue-600 to-indigo-600",
            icon: <Mic className="text-blue-600" size={22} />,
            description: "Discuss contract clauses verbally in real-time with Aura. Upload documents during the call, ask follow-up questions out loud, and receive an instant Decision Brief saved to your dashboard.",
            bullets: [
                "Bidirectional WebSockets audio streaming with zero lag",
                "Review contracts verbally during live interactive calls",
                "Automatic Decision Brief summary generation",
                "Hands-free AI legal sounding board"
            ],
            ctaText: "Launch Live Consultation",
            ctaLink: "/pages/legal-consultation"
        },
        {
            id: "risk-scanner",
            title: "Contract Risk Audit & Verdict",
            tagline: "Deep Clause Risk Scoring & Plain-English Analysis",
            badge: "Core AI",
            badgeStyle: "bg-red-50 text-red-700 border-red-200",
            accentColor: "from-red-600 to-rose-600",
            icon: <Shield className="text-red-600" size={22} />,
            description: "Upload any legal PDF or image contract. Our AI evaluates every clause, categorizes risks into High, Medium, and Low, and gives a clear Verdict (Safe to Sign, Review, or Do Not Sign).",
            bullets: [
                "OCR parsing for scanned PDFs and image contracts",
                "Categorized severity ratings with business impact",
                "Plain-English non-lawyer risk explanations",
                "0-100 Safety Index with confidence scoring"
            ],
            ctaText: "Scan a Contract",
            ctaLink: "/pages/chat"
        },
        {
            id: "gaps-analysis",
            title: "Gaps Analysis & Missing Terms",
            tagline: "Detect Omitted Protections Before Signing",
            badge: "Protection",
            badgeStyle: "bg-amber-50 text-amber-700 border-amber-200",
            accentColor: "from-amber-500 to-orange-600",
            icon: <HelpCircle className="text-amber-600" size={22} />,
            description: "Uncover what's missing from agreements. Our engine detects omitted liability caps, missing IP ownership carve-outs, unlisted termination rights, and vague payment terms.",
            bullets: [
                "Flags omitted IP carve-outs & personal rights protections",
                "Detects missing liability limitation caps",
                "Identifies absent force majeure & default remedies",
                "Suggests exact replacement clauses to request"
            ],
            ctaText: "Run Gaps Analysis",
            ctaLink: "/pages/chat"
        },
        {
            id: "pdf-exporter",
            title: "Export Formatted PDF Reports",
            tagline: "1-Click Branded Executive PDF Briefs",
            badge: "1-Click Export",
            badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
            accentColor: "from-emerald-600 to-teal-600",
            icon: <Download className="text-emerald-600" size={22} />,
            description: "Export clean, executive PDF reports of your contract analysis or consultation decision briefs with 1-click to share with team members, clients, or attorneys.",
            bullets: [
                "Formatted executive PDF decision briefs",
                "Includes risk scores, missing terms, & negotiation points",
                "Instant local PDF generation",
                "Professional layout ready for stakeholders"
            ],
            ctaText: "Download Sample PDF",
            ctaLink: "/pages/chat"
        },
        {
            id: "clause-compare",
            title: "Side-by-Side Contract Comparison",
            tagline: "Diff Analysis Between Contract Revisions",
            badge: "Version Control",
            badgeStyle: "bg-purple-50 text-purple-700 border-purple-200",
            accentColor: "from-purple-600 to-indigo-600",
            icon: <RefreshCw className="text-purple-600" size={22} />,
            description: "Compare two contract drafts side-by-side to highlight subtle changes, risk score shifts, and newly added restrictive terms before accepting counter-proposals.",
            bullets: [
                "Clause-by-clause diff analysis between two drafts",
                "Scorecard comparison for risk & clarity scores",
                "Highlights newly added restrictive language",
                "Winner recommendation by category"
            ],
            ctaText: "Open Comparison Tool",
            ctaLink: "/pages/tools"
        },
        {
            id: "doc-generator",
            title: "AI Legal Document Generator",
            tagline: "Custom NDA & Agreement Drafting",
            badge: "Custom Drafting",
            badgeStyle: "bg-indigo-50 text-indigo-700 border-indigo-200",
            accentColor: "from-indigo-600 to-blue-600",
            icon: <FileCheck className="text-indigo-600" size={22} />,
            description: "Draft customized NDAs, Freelance Agreements, Employment Contracts, and Termination Notices tailored to your exact business terms and jurisdiction.",
            bullets: [
                "Tailored templates for NDAs, Freelance & Employment",
                "Non-lawyer plain English clause options",
                "Interactive AI clause polisher & editor",
                "Export as text or formatted document"
            ],
            ctaText: "Generate Document",
            ctaLink: "/pages/legal-doc-generator"
        },
        {
            id: "glossary-helper",
            title: "Interactive Legal Glossary",
            tagline: "Demystify Latin Jargon & Complex Definitions",
            badge: "Dictionary",
            badgeStyle: "bg-teal-50 text-teal-700 border-teal-200",
            accentColor: "from-teal-600 to-emerald-600",
            icon: <Book className="text-teal-600" size={22} />,
            description: "Plain-English dictionary explaining complex legal terms, Latin phrases, and commercial contract definitions on demand during your contract analysis.",
            bullets: [
                "Demystifies legal jargon (Indemnification, Force Majeure)",
                "Plain-English definitions for non-lawyers",
                "Searchable legal terms database",
                "Contextual tooltip definitions"
            ],
            ctaText: "Browse Glossary",
            ctaLink: "/pages/features"
        }
    ];

    const featureList = featureItems;
    const currentFeature = featureItems.find(f => f.id === selectedFeature) || featureItems[0];

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">

            {/* ================= NAVBAR ================= */}
            <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 py-4 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2.5 text-blue-700 font-extrabold text-2xl tracking-tight group">
                        <Image src="/logo.svg" width={40} height={40} alt="Logo" className="w-9 h-9 opacity-90 group-hover:scale-105 transition-transform" />
                        <span>Legal Advisor</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-8 font-medium text-slate-600 text-sm">
                        <Link href="/pages/features" className="text-blue-600 font-bold flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-3.5 py-1 rounded-full">
                            <Sparkles size={13} className="text-blue-600" /> Platform Features
                        </Link>
                        <Link href="/pages/legal-consultation" className="hover:text-blue-600 transition flex items-center gap-1">
                            <Mic size={14} className="text-indigo-600" /> Live Voice AI
                        </Link>
                        <Link href="/" className="hover:text-blue-600 transition">Home</Link>
                        <Link href="/pages/pricing" className="hover:text-blue-600 transition">Pricing</Link>
                        <Link href="/pages/feedback" className="hover:text-blue-600 transition">Feedback</Link>
                        <div className="h-5 w-px bg-slate-200"></div>
                        <Link href="/pages/login" className="hover:text-blue-600 transition font-semibold text-slate-700">
                            Login
                        </Link>
                        <Link href="/pages/signup" className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/10">
                            Get Started Free
                        </Link>
                    </nav>

                    {/* Mobile Menu Toggle */}
                    <button className="lg:hidden text-slate-700 p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="lg:hidden bg-white border-b border-gray-100 shadow-xl px-6 py-6 flex flex-col gap-4"
                        >
                            <Link href="/pages/features" onClick={() => setMobileMenuOpen(false)} className="text-blue-600 font-bold flex items-center gap-2">
                                <Sparkles size={16} /> Features
                            </Link>
                            <Link href="/pages/legal-consultation" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 font-bold flex items-center gap-2">
                                <Mic size={16} className="text-indigo-600" /> Live Voice AI
                            </Link>
                            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 font-medium">Home</Link>
                            <Link href="/pages/pricing" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 font-medium">Pricing</Link>
                            <div className="pt-2 flex flex-col gap-3">
                                <Link href="/pages/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl">Login</Link>
                                <Link href="/pages/signup" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-md">Get Started Free</Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* ================= HERO HEADER ================= */}
            <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 border-b border-slate-100 overflow-hidden bg-slate-50/40">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-4">
                    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-4">
                        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-semibold shadow-xs">
                            <Zap size={14} className="fill-blue-700" /> Interactive Platform Capabilities
                        </motion.div>

                        <motion.h1 variants={fadeInUp} className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                            Legal Advisor Platform <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                Feature Showcase
                            </span>
                        </motion.h1>

                        <motion.p variants={fadeInUp} className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed font-normal">
                            Click any capability below to experience how our real-time voice AI, risk scanner, missing terms detector, and document tools protect you.
                        </motion.p>
                    </motion.div>
                </div>
            </section>

            {/* ================= INTERACTIVE FEATURE EXPLORER STAGE ================= */}
            <section className="py-16 px-6 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-12 gap-8 items-start">

                    {/* Left: Feature Selector List */}
                    <div className="lg:col-span-5 space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">Select Capability</h3>
                        
                        {featureList.map((item) => {
                            const isSelected = selectedFeature === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setSelectedFeature(item.id)}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 group relative overflow-hidden ${
                                        isSelected 
                                            ? "bg-white border-blue-500 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/20" 
                                            : "bg-slate-50/60 border-slate-200/80 hover:bg-white hover:border-slate-300"
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105 ${
                                        isSelected ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-700"
                                    }`}>
                                        {item.icon}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <h4 className={`text-sm font-bold truncate ${isSelected ? "text-blue-700" : "text-slate-900"}`}>
                                                {item.title}
                                            </h4>
                                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shrink-0 border ${item.badgeStyle}`}>
                                                {item.badge}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-1">
                                            {item.tagline}
                                        </p>
                                    </div>

                                    <ChevronRight size={16} className={`shrink-0 mt-2 transition-transform ${isSelected ? "rotate-90 text-blue-600" : "text-slate-300"}`} />
                                </button>
                            );
                        })}
                    </div>

                    {/* Right: Interactive Live Showcase Stage */}
                    <div className="lg:col-span-7 sticky top-28">
                        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-2xl relative overflow-hidden space-y-6">
                            
                            {/* Stage Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-xs">
                                        {currentFeature.icon}
                                    </div>
                                    <div>
                                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${currentFeature.badgeStyle}`}>
                                            {currentFeature.badge}
                                        </span>
                                        <h3 className="text-xl font-bold text-slate-900 mt-1">
                                            {currentFeature.title}
                                        </h3>
                                    </div>
                                </div>

                                <Link 
                                    href={currentFeature.ctaLink}
                                    className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shrink-0"
                                >
                                    <span>{currentFeature.ctaText}</span>
                                    <ArrowRight size={14} />
                                </Link>
                            </div>

                            {/* Stage Description */}
                            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                {currentFeature.description}
                            </p>

                            {/* Live Interactive Viewport Preview */}
                            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-6 relative overflow-hidden space-y-4">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                    Live Preview Stage
                                </span>

                                <AnimatePresence mode="wait">
                                    {selectedFeature === "aura-voice" && (
                                        <motion.div key="aura-voice" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                                            <div className="bg-blue-900/90 text-white p-5 rounded-2xl space-y-3 shadow-lg">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                                                        <span className="text-xs font-bold tracking-wide">Aura Voice AI — Connected</span>
                                                    </div>
                                                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono">02:45 Live</span>
                                                </div>
                                                <p className="text-xs text-blue-100 leading-relaxed">
                                                    "I reviewed Section 4.2. The 2-year non-compete is legally risky in your jurisdiction without financial severance compensation."
                                                </p>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                                                <span className="text-xs font-bold text-rose-600 flex items-center gap-1.5"><Shield size={14} /> Decision Brief Verdict</span>
                                                <p className="text-xs text-slate-600">Verdict: DO NOT SIGN. Action: Negotiate non-compete duration from 24 to 6 months.</p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {selectedFeature === "risk-scanner" && (
                                        <motion.div key="risk-scanner" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                                            <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="text-red-500" size={22} />
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-900">Employment_Agreement.pdf</p>
                                                        <p className="text-[10px] text-slate-400">Safety Index: 0/100 High Risk</p>
                                                    </div>
                                                </div>
                                                <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">3 High Risks</span>
                                            </div>
                                            <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl space-y-1">
                                                <p className="text-xs font-bold text-red-800">High Risk: Uncapped Liability Clause</p>
                                                <p className="text-[11px] text-red-700 leading-relaxed">Forces employee to personally reimburse company losses without financial cap.</p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {selectedFeature === "gaps-analysis" && (
                                        <motion.div key="gaps-analysis" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                                            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5"><HelpCircle size={15} /> Missing Term Flagged</span>
                                                    <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">Action Required</span>
                                                </div>
                                                <p className="text-xs text-amber-900 font-semibold">Missing IP Ownership Carve-Out</p>
                                                <p className="text-[11px] text-amber-800 leading-relaxed">The contract lacks a carve-out protecting personal pre-existing intellectual property created prior to employment.</p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {selectedFeature === "pdf-exporter" && (
                                        <motion.div key="pdf-exporter" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                                            <PDFReportGenerator analysisData={sampleAnalysis} />
                                        </motion.div>
                                    )}

                                    {selectedFeature === "clause-compare" && (
                                        <motion.div key="clause-compare" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                                            <ClauseComparison />
                                        </motion.div>
                                    )}

                                    {selectedFeature === "doc-generator" && (
                                        <motion.div key="doc-generator" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                                            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
                                                <div className="flex items-center justify-between border-b pb-2">
                                                    <span className="text-xs font-bold text-slate-900">AI Document Generator Draft</span>
                                                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold">Mutual NDA</span>
                                                </div>
                                                <p className="text-xs text-slate-600 font-mono bg-slate-50 p-3 rounded">
                                                    "This Mutual Non-Disclosure Agreement ('Agreement') is entered into between Party A and Party B..."
                                                </p>
                                                <Link href="/pages/legal-doc-generator" className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                                                    Generate Custom Document <ArrowRight size={13} />
                                                </Link>
                                            </div>
                                        </motion.div>
                                    )}

                                    {selectedFeature === "glossary-helper" && (
                                        <motion.div key="glossary-helper" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                                            <LegalGlossary />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Checklist Bullet Points */}
                            <div className="grid sm:grid-cols-2 gap-3 pt-2">
                                {currentFeature.bullets.map((b, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                                        <CheckCircle size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                                        <span>{b}</span>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>

                </div>
            </section>

            {/* ================= CTA BANNER ================= */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto bg-slate-900 rounded-[2.5rem] p-12 md:p-16 text-center relative overflow-hidden shadow-2xl">
                    <div className="relative z-10 space-y-6">
                        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Stop signing bad contracts.</h2>
                        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                            Experience real-time AI legal risk scanning, live voice consultations, and document drafting for free.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
                            <Link href="/pages/signup" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-base transition-all shadow-lg shadow-blue-600/30">
                                Get Started Free
                            </Link>
                            <Link href="/pages/legal-consultation" className="bg-transparent border border-slate-700 text-white hover:bg-slate-800 px-8 py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2">
                                <Mic size={18} className="text-blue-400" /> Start Live Voice Call
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= FOOTER ================= */}
            <footer className="bg-white border-t border-slate-200 pt-16 pb-10 px-6 text-slate-600">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-2 md:col-span-1 space-y-3">
                        <div className="flex items-center gap-2 text-blue-700 font-extrabold text-xl">
                            <Scale size={24} /> Legal Advisor
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Making legal help accessible, affordable, and understandable for everyone.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 text-sm mb-4">Core Products</h4>
                        <ul className="space-y-2.5 text-sm text-slate-500">
                            <li><Link href="/pages/features" className="hover:text-blue-600 font-bold text-blue-600">All Features</Link></li>
                            <li><Link href="/pages/legal-consultation" className="hover:text-blue-600">Live Voice AI (Aura)</Link></li>
                            <li><Link href="/pages/chat" className="hover:text-blue-600">Contract Risk Scanner</Link></li>
                            <li><Link href="/pages/legal-doc-generator" className="hover:text-blue-600">Document Generator</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 text-sm mb-4">Resources</h4>
                        <ul className="space-y-2.5 text-sm text-slate-500">
                            <li><Link href="/pages/pricing" className="hover:text-blue-600">Pricing Plans</Link></li>
                            <li><Link href="/pages/feedback" className="hover:text-blue-600">Submit Feedback</Link></li>
                            <li><Link href="/pages/help-center" className="hover:text-blue-600">Help Center</Link></li>
                            <li><Link href="/pages/release-notes" className="hover:text-blue-600">Release Notes</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 text-sm mb-4">Legal</h4>
                        <ul className="space-y-2.5 text-sm text-slate-500">
                            <li><Link href="/pages/privacy-policy" className="hover:text-blue-600">Privacy Policy</Link></li>
                            <li><Link href="/pages/terms-of-service" className="hover:text-blue-600">Terms of Service</Link></li>
                            <li><Link href="/pages/terms-policies" className="hover:text-blue-600">Compliance Center</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto border-t border-slate-100 pt-8 text-center text-slate-400 text-sm">
                    © {new Date().getFullYear()} Legal Advisor. All rights reserved. Not a law firm.
                </div>
            </footer>

        </div>
    );
}