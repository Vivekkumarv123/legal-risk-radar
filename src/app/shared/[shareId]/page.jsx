"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { 
    MessageCircle, User, Bot, Eye, Calendar, Share2, 
    Copy, Check, AlertCircle, FileText, ChevronRight,
    ShieldAlert, Info, ArrowLeft, ShieldCheck, Printer, Clock
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";

export default function SharedChatPage() {
    const params = useParams();
    const shareId = params.shareId;
    
    const [chatData, setChatData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (shareId) fetchSharedChat();
    }, [shareId]);

    const fetchSharedChat = async () => {
        try {
            const response = await fetch(`/api/shared/${shareId}`);
            const result = await response.json();
            if (result.success) {
                setChatData(result);
            } else {
                setError(result.error || 'This report is no longer available.');
            }
        } catch (error) {
            setError('We could not load this report. Please check your internet connection.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            toast.success('Link saved to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error('Could not copy link');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
            <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-xl font-medium text-slate-600 text-center animate-pulse">Opening your legal report...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
            <div className="max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100 animate-in zoom-in-95">
                <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
                <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
                <p className="text-slate-500 mb-6">{error}</p>
                <Link href="/" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors">Return Home</Link>
            </div>
        </div>
    );

    const { sharedChat, messages } = chatData;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 selection:bg-blue-100 print:bg-white">
            {/* SaaS Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 print:hidden">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-blue-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                            <ShieldCheck className="text-white" size={20} />
                        </div>
                        <span className="font-black text-xl tracking-tight">Legal <span className="text-blue-600">Advisor</span></span>
                    </Link>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handlePrint}
                            className="p-2 text-slate-500 hover:text-slate-900 transition-colors"
                            title="Print Report"
                        >
                            <Printer size={20} />
                        </button>
                        <button
                            onClick={copyToClipboard}
                            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-slate-200 active:scale-95 transition-all"
                        >
                            {copied ? <Check size={18} /> : <Share2 size={18} />}
                            {copied ? 'Link Copied' : 'Share report'}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12">
                {/* Executive Summary Section */}
                <div className="bg-white rounded-[32px] p-8 md:p-10 mb-12 shadow-sm border border-slate-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                        <ShieldCheck size={200} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-6 bg-blue-50 w-fit px-3 py-1 rounded-full">
                            <Clock size={14} /> Shared Analysis Report
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 leading-tight">
                            {sharedChat.title || "Legal Consultation Analysis"}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-slate-500 font-semibold text-sm">
                            <span className="flex items-center gap-2"><Calendar size={18} className="text-slate-400"/> {new Date(sharedChat.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                            <span className="flex items-center gap-2"><Eye size={18} className="text-slate-400"/> {sharedChat.viewCount} views</span>
                            <span className="flex items-center gap-2"><MessageCircle size={18} className="text-slate-400"/> {messages.length} Exchanges</span>
                        </div>
                    </div>
                </div>

                {/* Messages Timeline */}
                <div className="space-y-16">
                    {messages.map((message, idx) => (
                        <div key={idx} className={`flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-${idx * 100}`}>
                            {message.role === 'user' ? (
                                /* USER MESSAGE LOOK */
                                <div className="flex flex-col items-end group">
                                    <div className="bg-white border border-slate-200 p-6 rounded-[24px] rounded-tr-none shadow-sm max-w-[90%] md:max-w-[80%] hover:border-blue-300 transition-colors">
                                        {message.attachmentUrl && (
                                            <div className="mb-4 rounded-xl overflow-hidden border border-slate-100 shadow-inner group">
                                                <div className="bg-slate-50 p-2 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                                    <FileText size={12} /> Source Document
                                                </div>
                                                <img src={message.attachmentUrl} alt="Document" className="w-full h-auto max-h-[400px] object-contain bg-white" />
                                            </div>
                                        )}
                                        <p className="text-lg text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-3 pr-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Your Inquiry</span>
                                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">U</div>
                                    </div>
                                </div>
                            ) : (
                                /* ASSISTANT REPORT LOOK */
                                <div className="w-full">
                                    <div className="bg-white border border-slate-200 rounded-[32px] rounded-tl-none shadow-sm overflow-hidden border-t-4 border-t-blue-600">
                                        {/* Report Header */}
                                        <div className="p-8 md:p-10 pb-0">
                                            <div className="flex items-center gap-3 mb-8">
                                                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                                                    <Bot className="text-white" size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-slate-900 text-lg leading-none">Legal Intelligence Engine</h3>
                                                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em]">Verified Analysis v4.2</span>
                                                </div>
                                            </div>

                                            {/* Markdown Content with SaaS Typography */}
                                            <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed prose-headings:text-slate-900 prose-headings:font-black prose-strong:text-slate-900 prose-p:mb-6">
                                                <ReactMarkdown>{message.content}</ReactMarkdown>
                                            </div>
                                        </div>

                                        {/* Professional Findings Display */}
                                        {message.analysisData && (
                                            <div className="p-8 md:p-10 pt-4 bg-slate-50/50 border-t border-slate-100">
                                                <div className="flex items-center gap-2 mb-6">
                                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest italic flex items-center gap-2">
                                                       Critical Findings Breakdown
                                                    </h4>
                                                </div>
                                                <AnalysisDisplay data={message.analysisData} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-3 pl-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">AI Risk Audit Complete</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Grade-Level CTA Section */}
                <div className="mt-24 text-center print:hidden">
                    <div className="inline-block p-1 rounded-[40px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-2xl shadow-blue-200 mb-8">
                        <div className="bg-slate-900 rounded-[38px] px-10 py-12 text-white max-w-3xl">
                            <h2 className="text-3xl font-black mb-4 leading-tight">Protect your business from hidden risks.</h2>
                            <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto font-medium">
                                Get professional-grade legal analysis for any document in seconds. 
                                Trusted by freelancers and enterprises.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Link href="/pages/signup" className="w-full sm:w-auto bg-white text-slate-900 px-10 py-4 rounded-full font-black text-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-2 active:scale-95">
                                    Analyze My Document <ChevronRight size={20} />
                                </Link>
                                <Link href="/pages/features" className="w-full sm:w-auto bg-white/10 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all">
                                    View Features
                                </Link>
                            </div>
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Powered by LegalRadar.ai Intelligence System</p>
                </div>
            </main>

            {/* Print Footer */}
            <footer className="hidden print:block fixed bottom-0 left-0 right-0 p-8 border-t border-slate-200 bg-white">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    <span>LegalRadar Analysis Report</span>
                    <span>Shared ID: {shareId}</span>
                    <span>Page 1 of 1</span>
                </div>
            </footer>
        </div>
    );
}

/**
 * Enhanced Sub-component for Risk Cards
 * Uses high-contrast colors and professional spacing
 */
function AnalysisDisplay({ data }) {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;

    // Standardize input if it's the custom structure vs generic JSON
    const clauses = parsed.clauses || [];

    return (
        <div className="grid grid-cols-1 gap-4">
            {clauses.map((item, idx) => (
                <div 
                    key={idx} 
                    className={`group bg-white border p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 ${
                        item.risk_level?.toLowerCase() === 'high' 
                        ? 'border-l-8 border-l-red-500 border-slate-200' 
                        : 'border-l-8 border-l-amber-500 border-slate-200'
                    }`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-black italic">
                                {idx + 1}
                            </span>
                            <h5 className="font-black text-slate-900 text-sm uppercase tracking-tight">
                                {item.clause_snippet || item.clause || "Clause Analysis"}
                            </h5>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                            item.risk_level?.toLowerCase() === 'high' 
                            ? 'bg-red-50 text-red-600' 
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                            {item.risk_level} Risk
                        </span>
                    </div>
                    
                    <p className="text-slate-600 text-base leading-relaxed font-medium pl-9">
                        {item.explanation}
                    </p>

                    {item.suggestion && (
                        <div className="mt-4 ml-9 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                            <p className="text-xs text-emerald-800 font-bold flex items-center gap-2 mb-1">
                                <ShieldCheck size={14} /> Recommended Action:
                            </p>
                            <p className="text-sm text-emerald-700 font-medium leading-relaxed">
                                {item.suggestion}
                            </p>
                        </div>
                    )}
                </div>
            ))}

            {/* Missing Clauses Warning */}
            {parsed.missing_clauses && parsed.missing_clauses.length > 0 && (
                <div className="mt-6 bg-amber-50 rounded-2xl p-6 border border-amber-200 border-dashed">
                    <h5 className="text-amber-800 font-black text-sm uppercase tracking-widest flex items-center gap-2 mb-4">
                        <AlertCircle size={18} /> Critical Missing Protections
                    </h5>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {parsed.missing_clauses.map((missing, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-amber-700 font-bold bg-white/50 p-3 rounded-xl border border-amber-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                {missing}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}