"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ArrowRight, Shield, FileText, Zap, CheckCircle, 
    Scale, Menu, X, Play, ChevronRight, Mic, Sparkles,
    Download, Lock, HelpCircle, FileCheck, Layers, Eye, RefreshCw
} from "lucide-react";
import Image from "next/image";

export default function HomePage() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeDemoTab, setActiveDemoTab] = useState("consultation");
    const [openFaq, setOpenFaq] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    const faqs = [
        {
            q: "How does the Live Voice AI Consultation (Aura) work?",
            a: "Our AI legal consultant, Aura, uses real-time WebSockets to communicate via natural voice and video. You can discuss contract terms verbally, ask follow-up questions, and receive a structured Decision Brief upon completing your session."
        },
        {
            q: "What is Gaps Analysis?",
            a: "Gaps Analysis identifies what is *missing* from a contract. It flags omitted liability caps, missing IP ownership carve-outs, unlisted termination rights, and missing confidentiality protections before you sign."
        },
        {
            q: "Can I download the analysis as a PDF report?",
            a: "Yes! After analyzing any contract or ending a live consultation session, you can export a professionally formatted PDF Decision Brief complete with risk scores, clause breakdowns, and recommended negotiation points."
        },
        {
            q: "How does the Side-by-Side Contract Comparison tool work?",
            a: "You can upload two versions of a contract (e.g. initial draft vs revised agreement). Our AI compares them clause-by-clause, highlighting subtle changes, risk score shifts, and newly added restrictive terms."
        }
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">

            {/* ================= NAVBAR ================= */}
            <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4 border-b border-slate-100' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2.5 text-blue-700 font-extrabold text-2xl tracking-tight group">
                        <Image src="/logo.svg" width={40} height={40} alt="Legal Advisor Logo" className="w-9 h-9 opacity-90 group-hover:scale-105 transition-transform" />
                        <span>Legal Advisor</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-8 font-medium text-slate-600 text-sm">
                        <Link href="/pages/features" className="hover:text-blue-600 transition flex items-center gap-1.5 text-blue-600 font-semibold bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                            <Sparkles size={13} className="text-blue-600" /> Features
                        </Link>
                        <Link href="/pages/legal-consultation" className="hover:text-blue-600 transition flex items-center gap-1">
                            <Mic size={14} className="text-indigo-600" /> Live AI Consultation
                        </Link>
                        <Link href="#how-it-works" className="hover:text-blue-600 transition">How it Works</Link>
                        <Link href="/pages/pricing" className="hover:text-blue-600 transition">Pricing</Link>
                        <Link href="/pages/feedback" className="hover:text-blue-600 transition">Feedback</Link>
                        <div className="h-5 w-px bg-slate-200"></div>
                        <Link href="/pages/login" className="hover:text-blue-600 transition font-semibold text-slate-700">
                            Login
                        </Link>
                        <Link href="/pages/signup" className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/10 hover:shadow-blue-600/20">
                            Get Started Free
                        </Link>
                    </nav>

                    {/* Mobile Menu Toggle */}
                    <button aria-label="Toggle navigation menu" className="lg:hidden text-slate-700 p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
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
                            <Link href="/pages/features" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 font-bold flex items-center gap-2">
                                <Sparkles size={16} className="text-blue-600" /> Features
                            </Link>
                            <Link href="/pages/legal-consultation" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 font-bold flex items-center gap-2">
                                <Mic size={16} className="text-indigo-600" /> Live AI Consultation
                            </Link>
                            <Link href="/pages/pricing" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 font-medium">Pricing</Link>
                            <Link href="/pages/feedback" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 font-medium">Feedback</Link>
                            <div className="pt-2 flex flex-col gap-3">
                                <Link href="/pages/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl">Login</Link>
                                <Link href="/pages/signup" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-md">Get Started Free</Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* ================= MAIN CONTENT ================= */}
            <main>
            {/* ================= HERO SECTION ================= */}
            <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 overflow-hidden">
                {/* Subtle Grid Pattern Background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                    
                    {/* Left Hero Content */}
                    <motion.div 
                        initial="hidden" 
                        animate="visible" 
                        variants={staggerContainer}
                        className="text-center lg:text-left"
                    >
                        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 shadow-xs">
                            <Zap size={14} className="fill-blue-700" /> AI-Powered Contract Risk Intelligence
                        </motion.div>
                        
                        <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
                            Decode Legal <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                Jargon Instantly.
                            </span>
                        </motion.h1>
                        
                        <motion.p variants={fadeInUp} className="text-lg text-slate-500 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                            Legal Advisor is an AI contract assistant that audits agreements, detects missing terms, provides live voice AI consultation (Aura), and exports formatted PDF risk decision briefs.
                        </motion.p>
                        
                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link href="/pages/legal-consultation" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2.5 group">
                                <Mic size={18} className="text-blue-100" />
                                Live Voice AI Consultation
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="/pages/chat" className="bg-white text-slate-700 border border-slate-200 px-7 py-4 rounded-xl font-bold text-base hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-xs">
                                <Play size={16} className="fill-slate-700" /> Try Demo Scan
                            </Link>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-slate-500 font-medium">
                            <span className="flex items-center gap-1.5"><CheckCircle size={16} className="text-green-500" /> No credit card required</span>
                            <span className="flex items-center gap-1.5"><Lock size={16} className="text-blue-600" /> AES-256 Encryption</span>
                            <span className="flex items-center gap-1.5"><FileCheck size={16} className="text-indigo-600" /> PDF Report Export</span>
                        </motion.div>
                    </motion.div>

                    {/* Right Interactive Card Preview */}
                    <motion.div 
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative hidden lg:block"
                    >
                        {/* Decorative Blobs */}
                        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-300 rounded-full blur-[90px] opacity-30 animate-pulse"></div>
                        <div className="absolute bottom-0 left-10 w-72 h-72 bg-indigo-300 rounded-full blur-[90px] opacity-30"></div>

                        {/* Glassmorphism Card */}
                        <div className="relative bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-auto transform -rotate-1 hover:rotate-0 transition-transform duration-500 space-y-4">
                            {/* Card Tab Header */}
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg w-full">
                                    <button 
                                        onClick={() => setActiveDemoTab("consultation")}
                                        aria-label="Switch demo tab to Voice AI consultation"
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${activeDemoTab === "consultation" ? "bg-white text-blue-700 shadow-xs" : "text-slate-500 hover:text-slate-900"}`}
                                    >
                                        🎙️ Voice AI (Aura)
                                    </button>
                                    <button 
                                        onClick={() => setActiveDemoTab("analysis")}
                                        aria-label="Switch demo tab to Risk audit"
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${activeDemoTab === "analysis" ? "bg-white text-blue-700 shadow-xs" : "text-slate-500 hover:text-slate-900"}`}
                                    >
                                        🛡️ Risk Audit
                                    </button>
                                </div>
                            </div>

                            {/* Tab Content */}
                            <AnimatePresence mode="wait">
                                {activeDemoTab === "consultation" ? (
                                    <motion.div 
                                        key="consultation"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        className="space-y-3"
                                    >
                                        <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-100 flex items-start gap-3">
                                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm text-white font-bold text-xs">
                                                Aura
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-900 text-xs">Live Voice AI Consultant</span>
                                                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded">Active Call</span>
                                                </div>
                                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                                    "I've flagged Section 4.2. It restricts non-compete for 24 months without compensation."
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-red-50/80 p-3 rounded-xl border border-red-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Shield className="text-red-500 shrink-0" size={16} />
                                                <div>
                                                    <p className="text-xs font-bold text-red-800">Final Verdict: DO NOT SIGN</p>
                                                    <p className="text-[10px] text-red-600">3 High Risk Clauses Reviewed</p>
                                                </div>
                                            </div>
                                            <Link href="/pages/legal-consultation" className="text-[11px] font-bold text-blue-600 hover:underline">
                                                Join Room →
                                            </Link>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="analysis"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        className="space-y-3"
                                    >
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <FileText className="text-blue-600" size={18} />
                                                <div>
                                                    <p className="font-bold text-slate-800 text-xs">Employment_Agreement.pdf</p>
                                                    <p className="text-[10px] text-slate-400">Risk Score: High Risk (0/100)</p>
                                                </div>
                                            </div>
                                            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded">High Risk</span>
                                        </div>

                                        <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 space-y-1">
                                            <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                                                <HelpCircle size={13} className="text-amber-600" /> Missing Term: IP Ownership Carve-out
                                            </p>
                                            <p className="text-[11px] text-amber-700 leading-relaxed">No protection for pre-existing personal intellectual property.</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Card Footer */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                                <span>AES-256 Protected Sandbox</span>
                                <Link href="/pages/chat" className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                    Start Analysis <ArrowRight size={12} />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ================= STATS SECTION ================= */}
            <section className="py-10 bg-slate-50 border-y border-slate-200">
                <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center md:justify-between items-center gap-8 text-center md:text-left">
                    <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">Trusted by 10,000+ modern teams & professionals</p>
                    <div className="flex gap-8 md:gap-12 opacity-60 font-bold text-slate-700 text-sm">
                        <span className="flex items-center gap-1.5"><Shield size={16} className="text-blue-600" /> AES-256 Encryption</span>
                        <span className="flex items-center gap-1.5"><Mic size={16} className="text-indigo-600" /> WebSockets Voice AI</span>
                        <span className="flex items-center gap-1.5"><Download size={16} className="text-green-600" /> PDF Report Export</span>
                    </div>
                </div>
            </section>

            {/* ================= UPDATED FEATURES SECTION ================= */}
            <section id="features" className="py-28 px-6 bg-white relative">
                <div className="max-w-7xl mx-auto space-y-16">
                    
                    <div className="text-center max-w-3xl mx-auto space-y-4">
                        <span className="text-xs font-bold text-blue-700 uppercase tracking-widest bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full shadow-xs">
                            Legal Advisor Platform Features
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                            Complete Legal Risk Protection <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Built for Modern Businesses</span>
                        </h2>
                        <p className="text-slate-500 text-base leading-relaxed">
                            Discover our full suite of legal AI tools engineered to eliminate contract risk, automate document drafting, and provide live guidance.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        
                        {/* Feature 1: Live Voice AI (Aura) */}
                        <motion.div 
                            whileHover={{ y: -5 }}
                            className="bg-slate-50/70 border border-slate-200/80 p-8 rounded-3xl space-y-4 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group"
                        >
                            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                                <Mic size={22} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Live Voice & Video AI (Aura)</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Talk directly with Aura, your AI legal consultant, in real-time. Discuss clauses verbally, review contracts live, and get a structured Decision Brief saved at the end.
                            </p>
                            <Link href="/pages/legal-consultation" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 pt-2">
                                Start Consultation <ChevronRight size={14} />
                            </Link>
                        </motion.div>

                        {/* Feature 2: Contract Risk Audit */}
                        <motion.div 
                            whileHover={{ y: -5 }}
                            className="bg-slate-50/70 border border-slate-200/80 p-8 rounded-3xl space-y-4 hover:border-red-300 hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300 group"
                        >
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                                <Shield size={22} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Contract Risk Audit & Verdict</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Upload any legal PDF or image contract. Our AI categorizes risk levels (High, Medium, Low) and gives an overall Verdict (`Safe to Sign`, `Review`, `Do Not Sign`).
                            </p>
                            <Link href="/pages/chat" className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 pt-2">
                                Audit Contract <ChevronRight size={14} />
                            </Link>
                        </motion.div>

                        {/* Feature 3: Gaps Analysis */}
                        <motion.div 
                            whileHover={{ y: -5 }}
                            className="bg-slate-50/70 border border-slate-200/80 p-8 rounded-3xl space-y-4 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 group"
                        >
                            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                                <HelpCircle size={22} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Gaps Analysis & Missing Terms</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Automatically detects omitted legal protections, missing IP ownership carve-outs, unlisted termination rights, and vague payment terms before you sign.
                            </p>
                            <Link href="/pages/chat" className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 pt-2">
                                Check Missing Terms <ChevronRight size={14} />
                            </Link>
                        </motion.div>

                        {/* Feature 4: Downloadable PDF Reports */}
                        <motion.div 
                            whileHover={{ y: -5 }}
                            className="bg-slate-50/70 border border-slate-200/80 p-8 rounded-3xl space-y-4 hover:border-green-300 hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300 group"
                        >
                            <div className="w-12 h-12 bg-green-100 text-green-700 rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                                <Download size={22} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Export PDF Decision Briefs</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Export clean, branded PDF reports of your contract analysis or consultation decision brief with 1-click to share with stakeholders or attorneys.
                            </p>
                            <Link href="/pages/features" className="inline-flex items-center gap-1 text-xs font-bold text-green-600 hover:text-green-700 pt-2">
                                View PDF Feature <ChevronRight size={14} />
                            </Link>
                        </motion.div>

                        {/* Feature 5: Document Generator */}
                        <motion.div 
                            whileHover={{ y: -5 }}
                            className="bg-slate-50/70 border border-slate-200/80 p-8 rounded-3xl space-y-4 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group"
                        >
                            <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                                <FileCheck size={22} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">AI Legal Document Generator</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Generate customized NDAs, Employment Agreements, Freelance Contracts, and Termination Notices tailored to your exact business terms and jurisdiction.
                            </p>
                            <Link href="/pages/legal-doc-generator" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 pt-2">
                                Generate Contract <ChevronRight size={14} />
                            </Link>
                        </motion.div>

                        {/* Feature 6: Contract Comparison */}
                        <motion.div 
                            whileHover={{ y: -5 }}
                            className="bg-slate-50/70 border border-slate-200/80 p-8 rounded-3xl space-y-4 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 group"
                        >
                            <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                                <RefreshCw size={22} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Contract Comparison Tool</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Upload two contract versions to perform a side-by-side comparison, highlighting subtle changes, risk score shifts, and newly added restrictive language.
                            </p>
                            <Link href="/pages/features" className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700 pt-2">
                                Try Comparison <ChevronRight size={14} />
                            </Link>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* ================= HOW IT WORKS ================= */}
            <section id="how-it-works" className="py-28 px-6 bg-slate-50 border-y border-slate-200/80 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col items-center text-center mb-20">
                        <span className="text-xs font-bold text-blue-700 uppercase tracking-widest bg-blue-100 px-4 py-1 rounded-full shadow-xs">
                            Product Workflow
                        </span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mt-5 mb-4 max-w-2xl leading-[1.15]">
                            Simplify Corporate Law in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Three Simple Steps</span>
                        </h2>
                        <p className="text-slate-500 text-base max-w-xl mx-auto leading-relaxed">
                            An automated contract auditing engine built to eliminate workflow friction and scale legal decision intelligence.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 relative">
                        {[
                            { 
                                title: "Upload Contract or Call Aura", 
                                desc: "Drag and drop legal PDFs, contract scans, or start a live voice AI consultation session directly in your browser.", 
                                icon: <FileText className="w-5 h-5 text-blue-600" />,
                                number: "01"
                            },
                            { 
                                title: "Deep-Level Risk & Gap Scan", 
                                desc: "Our engine flags hidden liabilities, extracts unfavorable indemnity terms, detects missing clauses, and assigns an overall Verdict.", 
                                icon: <Zap className="w-5 h-5 text-indigo-600" />,
                                number: "02"
                            },
                            { 
                                title: "Export PDF Brief & Action Plan", 
                                desc: "Download formatted PDF Decision Briefs, generate counter-proposals, and negotiate safer terms with recommended negotiation points.", 
                                icon: <CheckCircle className="w-5 h-5 text-green-600" />,
                                number: "03"
                            },
                        ].map((step, i) => (
                            <motion.div 
                                key={i} 
                                whileHover={{ y: -5 }}
                                className="bg-white p-10 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/20 relative overflow-hidden flex flex-col items-start text-left group transition-all duration-300"
                            >
                                <div className="absolute -top-3 -right-1 text-8xl font-black text-slate-100 font-mono tracking-tighter select-none group-hover:text-slate-200 transition-colors">
                                    {step.number}
                                </div>

                                <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mb-8 shadow-xs relative z-10">
                                    {step.icon}
                                </div>
                                
                                <h3 className="text-xl font-bold text-slate-900 mb-3 relative z-10 tracking-tight">
                                    {step.title}
                                </h3>
                                
                                <p className="text-sm text-slate-500 leading-relaxed relative z-10">
                                    {step.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= FAQ SECTION ================= */}
            <section className="py-24 px-6 max-w-4xl mx-auto space-y-12">
                <div className="text-center space-y-3">
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-widest bg-blue-50 border border-blue-100 px-4 py-1 rounded-full">
                        FAQ
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                            <button 
                                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                aria-label={faq.q}
                                className="w-full p-6 text-left font-bold text-slate-900 flex justify-between items-center gap-4 hover:bg-slate-50 transition-colors text-base"
                            >
                                <span>{faq.q}</span>
                                <ChevronRight size={18} className={`transition-transform text-slate-400 shrink-0 ${openFaq === idx ? 'rotate-90 text-blue-600' : ''}`} />
                            </button>
                            <AnimatePresence>
                                {openFaq === idx && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="px-6 pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4"
                                    >
                                        {faq.a}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </section>

            {/* ================= CTA BANNER ================= */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto bg-slate-900 rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Stop signing blindly.</h2>
                        <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">
                            Join 10,000+ freelancers, founders, and professionals who use Legal Advisor to protect themselves from bad contracts.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/pages/signup" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-600/30">
                                Get Started for Free
                            </Link>
                            <Link href="/pages/legal-consultation" className="bg-transparent border border-slate-700 text-white hover:bg-slate-800 px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2">
                                <Mic size={18} className="text-blue-400" /> Start Live Voice Call
                            </Link>
                        </div>
                        <p className="mt-6 text-sm text-slate-400">No credit card required • AES-256 Encrypted</p>
                    </div>
                </div>
            </section>
            </main>

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
                        <h3 className="font-bold text-slate-900 text-sm mb-4">Core Products</h3>
                        <ul className="space-y-2.5 text-sm text-slate-600">
                            <li><Link href="/pages/features" className="hover:text-blue-600">All Features</Link></li>
                            <li><Link href="/pages/legal-consultation" className="hover:text-blue-600">Live Voice AI (Aura)</Link></li>
                            <li><Link href="/pages/chat" className="hover:text-blue-600">Contract Risk Scanner</Link></li>
                            <li><Link href="/pages/legal-doc-generator" className="hover:text-blue-600">Document Generator</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-sm mb-4">Resources</h3>
                        <ul className="space-y-2.5 text-sm text-slate-600">
                            <li><Link href="/pages/pricing" className="hover:text-blue-600">Pricing Plans</Link></li>
                            <li><Link href="/pages/feedback" className="hover:text-blue-600">Submit Feedback</Link></li>
                            <li><Link href="/pages/help-center" className="hover:text-blue-600">Help Center</Link></li>
                            <li><Link href="/pages/release-notes" className="hover:text-blue-600">Release Notes</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-sm mb-4">Legal</h3>
                        <ul className="space-y-2.5 text-sm text-slate-600">
                            <li><Link href="/pages/privacy-policy" className="hover:text-blue-600">Privacy Policy</Link></li>
                            <li><Link href="/pages/terms-of-service" className="hover:text-blue-600">Terms of Service</Link></li>
                            <li><Link href="/pages/terms-policies" className="hover:text-blue-600">Compliance Center</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto border-t border-slate-100 pt-8 text-center text-slate-500 text-sm">
                    © {new Date().getFullYear()} Legal Advisor. All rights reserved. Not a law firm.
                </div>
            </footer>
        </div>
    );
}