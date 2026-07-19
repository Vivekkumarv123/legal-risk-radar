"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
    ArrowRight, Shield, FileText, Zap, CheckCircle, 
    Scale, Menu, X, Play, ChevronRight 
} from "lucide-react";
import Image from "next/image";

export default function HomePage() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const router = useRouter();
    // Handle scroll for sticky navbar effect
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden selection:bg-blue-100">

            {/* ================= NAVBAR ================= */}
            <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-blue-700 font-extrabold text-2xl tracking-tight">
                        <Image src="/logo.svg" width={80} height={80} alt="Logo" className="relative z-10 w-20 h-20 opacity-90" />
                        Legal Advisor
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8 font-medium text-slate-600">
                        <Link href="#how-it-works" className="hover:text-blue-600 transition">How it Works</Link>
                        {/* <Link href="/pages/features" className="hover:text-blue-600 transition">Features</Link> */}
                        <Link href="/pages/pricing" className="hover:text-blue-600 transition">Pricing</Link>
                        <div className="h-6 w-px bg-slate-200"></div>
                        <Link href="/pages/feedback" className="hover:text-blue-600 transition">FeedBack</Link>
                        <Link href="/pages/login" className="hover:text-blue-600 transition">Login</Link>
                        <Link href="/pages/signup" className="bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-900/20">
                            Get Started
                        </Link>
                    </nav>

                    {/* Mobile Menu Toggle */}
                    <button className="md:hidden text-slate-700" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl p-6 flex flex-col gap-4 md:hidden animate-fade-in-down">
                        <Link href="/pages/features" className="text-lg font-medium text-slate-700">Features</Link>
                        <Link href="/pages/pricing" className="text-lg font-medium text-slate-700">Pricing</Link>
                        <Link href="/pages/login" className="text-lg font-medium text-slate-700">Login</Link>
                        <Link href="/pages/signup" className="bg-blue-600 text-white text-center py-3 rounded-xl font-bold">Get Started Free</Link>
                    </div>
                )}
            </header>

            {/* ================= HERO SECTION ================= */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Tech Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                    
                    {/* Left: Text Content */}
                    <motion.div 
                        initial="hidden" 
                        animate="visible" 
                        variants={staggerContainer}
                        className="text-center lg:text-left"
                    >
                        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
                            <Zap size={14} className="fill-blue-700" /> AI-Powered Contract Analysis
                        </motion.div>
                        
                        <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-6">
                            Decode Legal <br/>
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">Jargon Instantly.</span>
                        </motion.h1>
                        
                        <motion.p variants={fadeInUp} className="text-lg text-slate-500 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                            Legal Advisor is an AI-powered contract analysis assistant that integrates with Google Drive, Docs, and Calendar to audit agreements, highlight risk clauses, draft notice response templates, and schedule contract deadlines.
                        </motion.p>
                        
                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link href="/pages/signup" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 group">
                                Start Analyzing <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button onClick={() => {router.push("/pages/chat")}} className="bg-white cursor-pointer text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                <Play size={18} className="fill-slate-700" /> Try Demo
                            </button>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-500 font-medium">
                            <span className="flex items-center gap-1"><CheckCircle size={16} className="text-green-500" /> No credit card required</span>
                            <span className="flex items-center gap-1"><CheckCircle size={16} className="text-green-500" /> AES-256 Encryption</span>
                        </motion.div>
                    </motion.div>

                    {/* Right: Floating Product Mockup */}
                    <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative hidden lg:block"
                    >
                        {/* Decorative Blobs */}
                        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-400 rounded-full blur-[80px] opacity-20 animate-pulse"></div>
                        <div className="absolute bottom-0 left-10 w-72 h-72 bg-indigo-400 rounded-full blur-[80px] opacity-20"></div>

                        {/* Glassmorphism Card */}
                        <div className="relative bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-auto transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                            {/* Fake Header */}
                            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                        <FileText className="text-red-500" size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">Employment_Agreement.pdf</p>
                                        <p className="text-xs text-slate-400">2.4 MB • Uploaded just now</p>
                                    </div>
                                </div>
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">Processed</span>
                            </div>

                            {/* Fake Chat/Analysis */}
                            <div className="space-y-4">
                                <div className="bg-slate-50 p-3 rounded-lg rounded-tl-none border border-slate-100">
                                    <p className="text-xs font-bold text-slate-500 mb-1">AI ANALYSIS</p>
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                        I've reviewed the <strong>Non-Compete Clause</strong> (Section 4.2). It restricts you from working with competitors for <strong>2 years</strong>, which is unusually long for this industry standard (typically 6-12 months).
                                    </p>
                                </div>
                                <div className="bg-red-50 p-3 rounded-lg border border-red-100 flex gap-3 items-start">
                                    <Shield className="text-red-500 shrink-0 mt-0.5" size={18} />
                                    <div>
                                        <p className="text-sm font-bold text-red-700">High Risk Detected</p>
                                        <p className="text-xs text-red-600 mt-1">This clause may not be enforceable in some jurisdictions.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Fake Input */}
                            <div className="mt-6 relative">
                                <div className="h-10 bg-white border border-slate-200 rounded-lg flex items-center px-3 text-xs text-slate-400 shadow-sm">
                                    Ask a follow up question...
                                </div>
                                <div className="absolute right-2 top-2 bg-blue-600 w-6 h-6 rounded flex items-center justify-center">
                                    <ArrowRight size={12} className="text-white" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ================= STATS SECTION ================= */}
            <section className="py-10 bg-slate-50 border-y border-slate-200">
                <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center md:justify-between items-center gap-8 text-center md:text-left">
                    <p className="text-slate-500 font-medium uppercase tracking-widest text-sm">Trusted by modern teams</p>
                    <div className="flex gap-8 md:gap-12 opacity-50 grayscale mix-blend-multiply">
                        {/* Placeholder Logos */}
                        <span className="text-xl font-bold font-serif">AstraLaw</span>
                        <span className="text-xl font-bold font-mono">TechFlow</span>
                        <span className="text-xl font-bold font-sans">LegalEase</span>
                        <span className="text-xl font-bold">OpenCorp</span>
                    </div>
                </div>
            </section>

            {/* ================= HOW IT WORKS (REDESIGNED) ================= */}
            <section id="how-it-works" className="py-32 px-6 bg-gradient-to-b from-white to-slate-50/50 relative overflow-hidden">
                {/* Ambient geometric background shapes */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
                <div className="absolute top-0 right-10 w-72 h-72 bg-slate-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col items-center text-center mb-24">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 border border-blue-100/80 px-4 py-1.5 rounded-full shadow-xs">
                            Product Workflow
                        </span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mt-5 mb-4 max-w-2xl leading-[1.15]">
                            Simplify Corporate Law in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Three Execution Steps</span>
                        </h2>
                        <p className="text-slate-500 text-base max-w-xl mx-auto leading-relaxed">
                            An automated contract auditing engine built to eliminate workflow friction and scale legal operations at business speed.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 relative">
                        {[
                            { 
                                title: "Secure Agreement Upload", 
                                desc: "Drag and drop legal PDFs or structural contract scans. Our engine securely ingests and parses multi-page document metadata natively.", 
                                icon: <FileText className="w-5 h-5 text-blue-600" />,
                                number: "01",
                                borderHover: "group-hover:border-blue-500/30"
                            },
                            { 
                                title: "Deep-Level Risk Scan", 
                                desc: "Proprietary AI intelligence flags hidden liabilities, extracts unfavorable indemnity terms, and suggests optimized fallback language instantly.", 
                                icon: <Zap className="w-5 h-5 text-indigo-600" />,
                                number: "02",
                                borderHover: "group-hover:border-indigo-500/30"
                            },
                            { 
                                title: "Enterprise Systems Sync", 
                                desc: "Instantly compile notice briefs directly into Google Workspace ecosystems while deploying lifecycle automation alerts directly to your team calendar.", 
                                icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
                                number: "03",
                                borderHover: "group-hover:border-emerald-500/30"
                            },
                        ].map((step, i) => (
                            <motion.div 
                                key={i} 
                                whileHover={{ y: -6 }}
                                transition={{ type: "spring", stiffness: 150, damping: 20 }}
                                className={`bg-white p-10 rounded-3xl border border-slate-200/70 shadow-xl shadow-slate-200/20 relative overflow-hidden flex flex-col items-start text-left group transition-all duration-300 ${step.borderHover}`}
                            >
                                {/* Industrial level giant back-number branding */}
                                <div className="absolute -top-4 -right-2 text-8xl font-black text-slate-100/60 font-mono tracking-tighter select-none group-hover:text-slate-200/50 group-hover:scale-105 transition-all duration-300">
                                    {step.number}
                                </div>

                                <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mb-8 shadow-xs relative z-10 group-hover:scale-110 group-hover:bg-white transition-transform duration-300">
                                    {step.icon}
                                </div>
                                
                                <h3 className="text-xl font-bold text-slate-900 mb-3.5 relative z-10 tracking-tight group-hover:text-blue-700 transition-colors duration-300">
                                    {step.title}
                                </h3>
                                
                                <p className="text-sm text-slate-500 leading-relaxed relative z-10">
                                    {step.desc}
                                </p>
                                
                                <div className="mt-8 flex items-center text-xs font-semibold text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300 cursor-pointer">
                                    Learn architecture details <ChevronRight size={14} className="ml-1" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= GOOGLE API INTEGRATION (REDESIGNED) ================= */}
            <section className="py-32 px-6 bg-slate-950 border-t border-slate-900 relative overflow-hidden">
                {/* Premium Dark-Mode Matrix/Mesh glows */}
                <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[130px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col items-center text-center mb-20">
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-950/80 border border-blue-800/40 px-4 py-1.5 rounded-full shadow-md">
                            Connected Ecosystem
                        </span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mt-5 mb-4 max-w-3xl leading-[1.15]">
                            Native Google Workspace Sync. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Zero Workflow Interruption.</span>
                        </h2>
                        <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
                            Maintain a rigid chain of custody. Securely hook directly into your active runtime storage environments through dynamically gated access configurations.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Drive Card */}
                        <motion.div 
                            whileHover={{ y: -6 }}
                            className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-8 rounded-3xl flex flex-col justify-between shadow-2xl hover:border-blue-500/40 transition-all duration-300 group relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div>
                                <div className="w-12 h-12 bg-blue-950/50 border border-blue-900/40 text-blue-400 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-105 transition-transform duration-300">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-slate-100 text-lg mb-2.5 tracking-tight group-hover:text-white transition-colors">Google Drive Repository</h4>
                                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                                    Automates structured document storage into sandboxed directories. Our platform isolates asset reads strictly to metadata fields created natively within the system framework.
                                </p>
                            </div>
                            <div>
                                <ul className="text-xs text-slate-400 space-y-2.5 pt-5 border-t border-slate-800/80">
                                    <li className="flex items-center gap-2.5">
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                                        <span>Isolated Application Sandboxing</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                                        <span>Automated Revision Tracking</span>
                                    </li>
                                </ul>
                            </div>
                        </motion.div>
                        
                        {/* Docs Card */}
                        <motion.div 
                            whileHover={{ y: -6 }}
                            className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-8 rounded-3xl flex flex-col justify-between shadow-2xl hover:border-purple-500/40 transition-all duration-300 group relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div>
                                <div className="w-12 h-12 bg-purple-950/50 border border-purple-900/40 text-purple-400 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-105 transition-transform duration-300">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-slate-100 text-lg mb-2.5 tracking-tight group-hover:text-white transition-colors">Google Docs Compiler</h4>
                                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                                    Compiles counter-proposals, remediation agreements, and certified notices into customizable document templates using live, user-approved contextual mapping tools.
                                </p>
                            </div>
                            <div>
                                <ul className="text-xs text-slate-400 space-y-2.5 pt-5 border-t border-slate-800/80">
                                    <li className="flex items-center gap-2.5">
                                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
                                        <span>Real-time Clause Export Injection</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
                                        <span>Custom Corporate Tokens</span>
                                    </li>
                                </ul>
                            </div>
                        </motion.div>

                        {/* Calendar Card */}
                        <motion.div 
                            whileHover={{ y: -6 }}
                            className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-8 rounded-3xl flex flex-col justify-between shadow-2xl hover:border-emerald-500/40 transition-all duration-300 group relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div>
                                <div className="w-12 h-12 bg-emerald-950/50 border border-emerald-900/40 text-emerald-400 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-105 transition-transform duration-300">
                                    <Scale className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-slate-100 text-lg mb-2.5 tracking-tight group-hover:text-white transition-colors">Calendar Lifecycle Engine</h4>
                                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                                    Ensures auto-renewals or expirations never pass unnoted. Seamlessly maps structural milestones, renewal targets, and expiration thresholds directly onto corporate schedules.
                                </p>
                            </div>
                            <div>
                                <ul className="text-xs text-slate-400 space-y-2.5 pt-5 border-t border-slate-800/80">
                                    <li className="flex items-center gap-2.5">
                                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                                        <span>Automated SLA & Milestone Alerts</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                                        <span>Shared Operational Timelines</span>
                                    </li>
                                </ul>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ================= CTA BANNER ================= */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto bg-slate-900 rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-800 via-slate-900 to-slate-900 opacity-50"></div>
                    
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Stop signing blindly.</h2>
                        <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
                            Join 10,000+ freelancers and businesses who use Legal Advisor to protect themselves from bad contracts.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/pages/signup" className="bg-blue-500 hover:bg-blue-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-500/30">
                                Get Started for Free
                            </Link>
                            <Link href="/pages/pricing" className="bg-transparent border border-slate-600 text-white hover:bg-slate-800 px-8 py-4 rounded-xl font-bold text-lg transition-all">
                                View Pricing
                            </Link>
                        </div>
                        <p className="mt-6 text-sm text-slate-500">No credit card required • Cancel anytime</p>
                    </div>
                </div>
            </section>

            {/* ================= FOOTER ================= */}
            <footer className="bg-white border-t border-slate-200 pt-16 pb-8 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 text-blue-700 font-extrabold text-xl mb-4">
                            <Scale size={24} /> Legal Advisor
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Making legal help accessible, affordable, and understandable for everyone.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li><a href="#" className="hover:text-blue-600">Features</a></li>
                            <li><a href="#" className="hover:text-blue-600">Pricing</a></li>
                            <li><a href="#" className="hover:text-blue-600">API</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li><a href="#" className="hover:text-blue-600">Blog</a></li>
                            <li><a href="#" className="hover:text-blue-600">Guide</a></li>
                            <li><a href="#" className="hover:text-blue-600">Help Center</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li><Link href="/pages/privacy-policy" className="hover:text-blue-600">Privacy Policy</Link></li>
                            <li><Link href="/pages/terms-of-service" className="hover:text-blue-600">Terms of Service</Link></li>
                            <li><Link href="/pages/terms-policies" className="hover:text-blue-600">Compliance Center</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto border-t border-slate-100 pt-8 text-center text-slate-400 text-sm">
                    © {new Date().getFullYear()} Legal Advisor. All rights reserved.
                </div>
            </footer>
        </div>
    );
}