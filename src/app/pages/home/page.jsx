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
                        <Link href="/pages/pricing" className="hover:text-blue-600 transition">Features & Pricing</Link>
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
                        <Link href="#features" className="text-lg font-medium text-slate-700">Features</Link>
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
                            Upload contracts, NDAs, or agreements and get an instant summary, risk analysis, and actionable advice powered by advanced AI.
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

            {/* ================= HOW IT WORKS ================= */}
            <section id="how-it-works" className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Simplify Law in 3 Steps</h2>
                        <p className="text-slate-500 text-lg">No lawyer fees. No waiting weeks. Just answers.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-linear-to-r from-blue-100 via-blue-200 to-blue-100 -z-10"></div>

                        {[
                            { title: "Upload", desc: "Drag & drop any PDF contract or legal document.", icon: <FileText size={24} /> },
                            { title: "Analyze", desc: "Our AI scans for risks, loopholes, and weird clauses.", icon: <Zap size={24} /> },
                            { title: "Resolve", desc: "Get actionable advice or ask questions in plain English.", icon: <CheckCircle size={24} /> },
                        ].map((step, i) => (
                            <div key={i} className="relative bg-white p-6 rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 text-center hover:-translate-y-2 transition-transform duration-300">
                                <div className="w-16 h-16 mx-auto bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/30">
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                                <p className="text-slate-500 leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
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
                            Join 10,000+ freelancers and businesses who use LegalAI to protect themselves from bad contracts.
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
                            <Scale size={24} /> LegalAI
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
                        <h4 className="font-bold text-slate-900 mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li><a href="#" className="hover:text-blue-600">About</a></li>
                            <li><a href="#" className="hover:text-blue-600">Careers</a></li>
                            <li><a href="#" className="hover:text-blue-600">Contact</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto border-t border-slate-100 pt-8 text-center text-slate-400 text-sm">
                    © {new Date().getFullYear()} Legal Advisor AI. All rights reserved.
                </div>
            </footer>
        </div>
    );
}