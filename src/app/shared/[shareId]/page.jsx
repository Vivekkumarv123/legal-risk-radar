"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
    MessageCircle, Eye, Calendar, Share2, 
    Check, AlertCircle, FileText, ChevronRight,
    ShieldAlert, ShieldCheck, Printer, Clock,
    Bot, AlertTriangle, CheckCircle, Scale, ListTodo, XCircle,
    HelpCircle, Lightbulb, UserCheck, Briefcase
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
            
            // Map the exact structure from the backend log
            if (result.success && result.messages) {
                setChatData({ 
                    sharedChat: result.sharedChat, 
                    messages: result.messages 
                });
            } else if (Array.isArray(result)) {
                // Fallback just in case the backend returns a raw array
                setChatData({ 
                    sharedChat: {
                        title: "Legal Consultation Analysis",
                        createdAt: result[0]?.createdAt || new Date().toISOString(),
                        viewCount: 1
                    }, 
                    messages: result 
                });
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

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
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
                            onClick={() => window.print()}
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
                            <span className="flex items-center gap-2"><Eye size={18} className="text-slate-400"/> {sharedChat.viewCount || 1} views</span>
                            <span className="flex items-center gap-2"><MessageCircle size={18} className="text-slate-400"/> {messages.length} Exchanges</span>
                        </div>
                    </div>
                </div>

                {/* Messages Timeline */}
                <div className="space-y-16">
                    {messages.map((message, idx) => (
                        <div key={message.id || idx} className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {message.role === 'user' ? (
                                /* USER MESSAGE LOOK */
                                <div className="flex flex-col items-end group">
                                    <div className="bg-white border border-slate-200 p-6 rounded-[24px] rounded-tr-none shadow-sm max-w-[90%] md:max-w-[80%] hover:border-blue-300 transition-colors">
                                        <p className="text-lg text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{message.displayContent || message.content}</p>
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
                                        
                                        <div className="p-8 md:p-10 pb-6 border-b border-slate-100">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                                                    <Bot className="text-white" size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-slate-900 text-lg leading-none">Legal Intelligence Engine</h3>
                                                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em]">Verified Analysis v4.2</span>
                                                </div>
                                            </div>

                                            {(!message.analysisData) && (
                                                <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed prose-headings:text-slate-900 prose-headings:font-black">
                                                    <ReactMarkdown>{message.displayContent || message.content}</ReactMarkdown>
                                                </div>
                                            )}
                                        </div>

                                        {/* Deep Structured Data Display mapped exactly to your backend response */}
                                        {message.analysisData && (
                                            <div className="bg-slate-50/30">
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
            </main>
        </div>
    );
}

/**
 * Maps the exact JSON structure provided by the backend:
 * decisionSummary (overallRisk, finalDecision, confidence, etc)
 * executiveSummary
 * keyRisks (array of strings)
 * missingProtections (array of strings)
 * nextBestActions (array of strings)
 * followUpQuestions (array of strings)
 * recommendations (array of objects)
 * whatIfSuggestions (array of objects)
 * clauses (array of objects)
 */
function AnalysisDisplay({ data }) {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;

    const {
        executiveSummary,
        decisionSummary,
        keyRisks = [],
        missingProtections = [],
        nextBestActions = [],
        followUpQuestions = [],
        recommendations = [],
        whatIfSuggestions = [],
        clauses = []
    } = parsed;

    return (
        <div className="flex flex-col">
            
            {/* Top Level Summary & Decision Banner */}
            <div className="p-8 md:p-10 border-b border-slate-200 space-y-8 bg-white">
                
                {/* Executive Summary */}
                {executiveSummary && (
                    <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-3">
                            <FileText size={16} className="text-blue-500" /> Executive Summary
                        </h4>
                        <p className="text-slate-700 text-lg leading-relaxed font-medium">
                            {executiveSummary}
                        </p>
                    </div>
                )}

                {/* Decision Summary Banner */}
                {decisionSummary && (
                    <div className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                        (decisionSummary.overallRisk === 'HIGH' || decisionSummary.overallRisk === 'CRITICAL')
                            ? 'bg-red-50 border-red-200'
                            : decisionSummary.overallRisk === 'MEDIUM'
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-emerald-50 border-emerald-200'
                    }`}>
                        <div>
                            <span className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-1">
                                Final Recommendation
                            </span>
                            <div className="flex items-center gap-2">
                                {(decisionSummary.overallRisk === 'HIGH' || decisionSummary.overallRisk === 'CRITICAL') 
                                    ? <XCircle className="text-red-600" size={24} /> 
                                    : <Scale size={24} className="text-slate-700"/>}
                                <h2 className="text-2xl font-black text-slate-900">{decisionSummary.finalDecision || "Review Carefully"}</h2>
                            </div>
                            
                            <div className="flex items-center gap-3 mt-3">
                                {decisionSummary.confidence && (
                                    <span className="text-xs font-bold text-slate-600 bg-white/60 px-2 py-1 rounded-md border border-slate-200/50">
                                        {decisionSummary.confidence}% AI Confidence
                                    </span>
                                )}
                                {decisionSummary.lawyerReviewRecommended && (
                                    <span className="text-xs font-bold text-red-700 flex items-center gap-1">
                                        <Briefcase size={12} /> Lawyer Review Required
                                    </span>
                                )}
                                {decisionSummary.negotiationRequired && (
                                    <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                                        <UserCheck size={12} /> Negotiation Required
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex flex-col md:items-end">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-1">
                                Overall Risk
                            </span>
                            <span className={`px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-widest shadow-sm border ${
                                (decisionSummary.overallRisk === 'HIGH' || decisionSummary.overallRisk === 'CRITICAL')
                                    ? 'bg-red-100 text-red-700 border-red-200'
                                    : decisionSummary.overallRisk === 'MEDIUM'
                                    ? 'bg-amber-100 text-amber-700 border-amber-200'
                                    : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            }`}>
                                {decisionSummary.overallRisk || 'UNKNOWN'}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Insights Grid */}
            {(keyRisks.length > 0 || missingProtections.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-200 border-b border-slate-200">
                    {/* Key Risks (Array of Strings) */}
                    {keyRisks.length > 0 && (
                        <div className="bg-white p-8 md:p-10">
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-6">
                                <AlertTriangle size={18} className="text-red-500" /> Key Risks Identified
                            </h4>
                            <ul className="space-y-4">
                                {keyRisks.map((risk, idx) => (
                                    <li key={idx} className="flex gap-3 text-slate-700 font-medium text-base">
                                        <span className="text-red-500 mt-1 flex-shrink-0 font-bold">•</span>
                                        <span>{risk}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Missing Protections (Array of Strings) */}
                    {missingProtections.length > 0 && (
                        <div className="bg-white p-8 md:p-10">
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-6">
                                <ShieldAlert size={18} className="text-amber-500" /> Missing Protections
                            </h4>
                            <ul className="space-y-4">
                                {missingProtections.map((missing, idx) => (
                                    <li key={idx} className="flex gap-3 text-slate-700 font-medium text-base">
                                        <span className="text-amber-500 mt-1 flex-shrink-0 font-bold">•</span>
                                        <span>{missing}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Next Best Actions (Array of Strings) */}
            {nextBestActions.length > 0 && (
                <div className="p-8 md:p-10 bg-white border-b border-slate-200">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-6">
                        <CheckCircle size={18} className="text-emerald-500" /> Next Best Actions
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {nextBestActions.map((action, idx) => (
                            <div key={idx} className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl flex gap-3 items-start">
                                <ListTodo size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                                <span className="text-emerald-900 font-medium text-sm leading-relaxed">
                                    {action}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* What If Scenarios & Recommendations (Handling arrays of objects) */}
            {(whatIfSuggestions.length > 0 || recommendations.length > 0) && (
                <div className="p-8 md:p-10 bg-slate-50 border-b border-slate-200 grid grid-cols-1 gap-8">
                    {whatIfSuggestions.length > 0 && (
                        <div>
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                                <Lightbulb size={18} className="text-blue-500" /> Strategic 'What-If' Scenarios
                            </h4>
                            <div className="space-y-3">
                                {whatIfSuggestions.map((suggestion, idx) => (
                                    <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl text-sm">
                                        <strong className="text-slate-900 block mb-1">{suggestion.scenario || suggestion.title || "Scenario:"}</strong>
                                        <span className="text-slate-600">{suggestion.suggestion || suggestion.description || JSON.stringify(suggestion)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {recommendations.length > 0 && (
                        <div>
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                                <ShieldCheck size={18} className="text-indigo-500" /> Detailed Recommendations
                            </h4>
                            <div className="space-y-3">
                                {recommendations.map((rec, idx) => (
                                    <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl text-sm">
                                        <strong className="text-slate-900 block mb-1">{rec.title || rec.topic || "Recommendation:"}</strong>
                                        <span className="text-slate-600">{rec.description || rec.action || JSON.stringify(rec)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Clause Breakdown List */}
            {clauses.length > 0 && (
                <div className="p-8 md:p-10 bg-slate-50/50">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            Detailed Clause Breakdown
                        </h4>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {clauses.map((item, idx) => (
                            <div 
                                key={idx} 
                                className={`group bg-white border p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 ${
                                    (item.risk_level || item.riskLevel)?.toLowerCase() === 'high' 
                                    ? 'border-l-8 border-l-red-500 border-slate-200' 
                                    : (item.risk_level || item.riskLevel)?.toLowerCase() === 'medium'
                                    ? 'border-l-8 border-l-amber-500 border-slate-200'
                                    : 'border-l-8 border-l-emerald-500 border-slate-200'
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                    <div className="flex items-start sm:items-center gap-3">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-black italic flex-shrink-0">
                                            {idx + 1}
                                        </span>
                                        <h5 className="font-black text-slate-900 text-sm uppercase tracking-tight line-clamp-2">
                                            {item.clause_snippet || item.clauseTitle || item.clause || "Clause Analysis"}
                                        </h5>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm whitespace-nowrap self-start sm:self-auto ${
                                        (item.risk_level || item.riskLevel)?.toLowerCase() === 'high' 
                                        ? 'bg-red-50 text-red-600' 
                                        : (item.risk_level || item.riskLevel)?.toLowerCase() === 'medium'
                                        ? 'bg-amber-50 text-amber-700'
                                        : 'bg-emerald-50 text-emerald-700'
                                    }`}>
                                        {(item.risk_level || item.riskLevel)} Risk
                                    </span>
                                </div>
                                
                                <p className="text-slate-600 text-base leading-relaxed font-medium pl-9">
                                    {item.explanation || item.analysis}
                                </p>

                                {(item.suggestion || item.recommendation) && (
                                    <div className="mt-4 ml-9 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                        <p className="text-xs text-emerald-800 font-bold flex items-center gap-2 mb-1">
                                            <ShieldCheck size={14} /> Recommended Action:
                                        </p>
                                        <p className="text-sm text-emerald-700 font-medium leading-relaxed">
                                            {item.suggestion || item.recommendation}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Follow-Up Questions (Array of Strings) */}
            {followUpQuestions.length > 0 && (
                <div className="p-8 md:p-10 bg-white border-t border-slate-200">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-6">
                        <HelpCircle size={18} className="text-slate-400" /> Recommended Questions to Ask
                    </h4>
                    <div className="flex flex-col gap-3">
                        {followUpQuestions.map((q, idx) => (
                            <div key={idx} className="bg-slate-50 border border-slate-200 px-5 py-4 rounded-xl text-slate-700 font-medium flex items-center gap-3">
                                <MessageCircle size={18} className="text-blue-500 flex-shrink-0" />
                                <span>{q}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}