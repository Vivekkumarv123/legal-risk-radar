"use client";
import { useState, useRef, useEffect } from "react";
import Avatar from "@/components/ui/Avatar";
import toast from "react-hot-toast";
import { TypeAnimation } from "react-type-animation";
import ReactMarkdown from 'react-markdown';
import {
    Mic, MicOff, Send, Paperclip, X, AlertCircle, Shield, BookOpen, MessageCircle,
    Menu, LogOut, MessageSquare, BrainCircuit, Plus, AlertTriangle,
    Loader2, Clock, Trash2, UserX, Volume2, StopCircle, Phone,
    Share2, Crown, Scale, Sparkles, ChevronDown, ChevronRight, Info,
    Briefcase, FileCode, Users, ArrowRight, Globe, PlusCircle,
    Settings as SettingsIcon, HelpCircle, Download, Keyboard, Bug,
    Home, CreditCard, Bell, FileQuestion, Zap, Book, CheckCircle,
    ArrowLeft, ShieldAlert, ShieldOff, ArrowUpRight, TrendingUp, Lightbulb,
    FileText, Wand2
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { isGreeting, getGreetingResponse } from "@/utils/greetingHandler";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

// Dynamically import tool components
const ClauseComparison = dynamic(() => import("@/components/clause-comparison/ClauseComparison"), { loading: () => <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div> });
const LegalGlossary = dynamic(() => import("@/components/legal-glossary/LegalGlossary"), { loading: () => <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div> });
const LegalCommunity = dynamic(() => import("@/components/community/LegalCommunity"), { loading: () => <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div> });
const ChromeExtensionDownload = dynamic(() => import("@/components/chrome-extension/ChromeExtensionDownload"), { loading: () => <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div> });

// ==========================================
// SUB-COMPONENTS
// ==========================================

// 1. HELPER: Risk Badge (kept semantic — red/amber/green mean the same thing everywhere)
function RiskBadge({ level, size = "sm" }) {
    const safeLevel = (level || "MEDIUM").toUpperCase();
    const styles = {
        LOW: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20",
        MEDIUM: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20",
        HIGH: "bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20"
    };
    const sizing = size === "lg" ? "px-3 py-1.5 text-[11px]" : "px-2.5 py-1 text-[10px]";
    return (
        <span className={`inline-flex items-center gap-1 ${sizing} rounded-full font-bold uppercase tracking-widest border ring-1 ring-inset whitespace-nowrap ${styles[safeLevel] || styles.MEDIUM}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${safeLevel === 'HIGH' ? 'bg-rose-500' : safeLevel === 'LOW' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {safeLevel} risk
        </span>
    );
}

const getRiskTheme = (risk) => {
    switch (risk?.toUpperCase()) {
        case 'HIGH': return { bg: 'from-rose-600 via-rose-700 to-rose-900', ring: 'ring-rose-300/40', dot: 'bg-rose-400' };
        case 'LOW': return { bg: 'from-teal-600 via-teal-700 to-emerald-800', ring: 'ring-teal-300/40', dot: 'bg-emerald-400' };
        default: return { bg: 'from-amber-500 via-amber-600 to-orange-700', ring: 'ring-amber-300/40', dot: 'bg-amber-400' };
    }
};

// Font helpers (arbitrary Tailwind values so no tailwind.config changes are required)
const F_DISPLAY = "font-[\"Fraunces\",ui-serif,serif]";
const F_MONO = "font-[\"IBM_Plex_Mono\",ui-monospace,monospace]";

// ==========================================
// 2. MAIN COMPONENT: ResultCard
// ==========================================

export function ResultCard({ analysis }) {
    const [openSections, setOpenSections] = useState({ clauses: true });
    const [openClause, setOpenClause] = useState(0);

    if (!analysis || !analysis.decisionSummary) return null;

    const {
        decisionSummary, executiveSummary, keyRisks = [], missingProtections = [],
        nextBestActions = [], clauses = [], whatIfSuggestions = [],
        recommendations = [], followUpQuestions = []
    } = analysis;

    const risk = decisionSummary.overallRisk?.toUpperCase() || 'MEDIUM';
    const theme = getRiskTheme(risk);
    const score = Number(decisionSummary.decisionScore) || 0;
    const confidence = Number(decisionSummary.confidence) || 0;

    // Sidebar Stats Calculation
    const highRiskCount = clauses.filter(c => c.riskLevel?.toUpperCase() === 'HIGH').length;
    const medRiskCount = clauses.filter(c => c.riskLevel?.toUpperCase() === 'MEDIUM').length;
    const lowRiskCount = clauses.filter(c => c.riskLevel?.toUpperCase() === 'LOW').length;

    const sectionDefs = [
        { id: 'clauses', title: 'Clause-by-clause analysis', icon: FileCode, count: clauses.length },
        { id: 'recs', title: 'Recommendations', icon: CheckCircle, count: recommendations.length },
        { id: 'missing', title: 'Missing protections', icon: ShieldAlert, count: missingProtections.length },
        { id: 'risks', title: 'Key risks', icon: AlertTriangle, count: keyRisks.length },
        { id: 'actions', title: 'Next best actions', icon: TrendingUp, count: nextBestActions.length },
        { id: 'whatif', title: 'What-if scenarios', icon: Lightbulb, count: whatIfSuggestions.length },
        { id: 'followup', title: 'Questions to ask', icon: HelpCircle, count: followUpQuestions.length },
    ].filter(s => s.count > 0);

    const allOpen = sectionDefs.every(s => openSections[s.id]);
    const toggleAll = () => {
        if (allOpen) { setOpenSections({}); }
        else { setOpenSections(Object.fromEntries(sectionDefs.map(s => [s.id, true]))); }
    };
    const toggleSection = (id) => setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));

    // Reusable Accordion Component (now supports multiple sections open at once,
    // which is friendlier for people who want to compare risks next to recommendations)
    const DashboardSection = ({ id, title, icon: Icon, count, children }) => {
        const isOpen = !!openSections[id];
        return (
            <div className={`border rounded-2xl bg-white shadow-sm overflow-hidden transition-colors motion-reduce:transition-none ${isOpen ? 'border-teal-300 ring-4 ring-teal-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <button
                    onClick={() => toggleSection(id)}
                    aria-expanded={isOpen}
                    aria-controls={`section-${id}`}
                    className="w-full min-h-[64px] p-4 sm:p-5 flex items-center justify-between bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-2xl"
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-lg shrink-0 ${isOpen ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <span className={`${F_DISPLAY} font-semibold text-slate-900 text-base sm:text-lg truncate text-left`}>{title}</span>
                        {count !== undefined && count > 0 && (
                            <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0">{count}</span>
                        )}
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 motion-reduce:transition-none ${isOpen ? 'rotate-180 text-teal-500' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                    {isOpen && (
                        <motion.div
                            id={`section-${id}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="border-t border-slate-100 bg-slate-50/50"
                        >
                            <div className="p-4 sm:p-5">{children}</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <div className='w-full max-w-7xl mx-auto p-3 sm:p-6 lg:p-8 font-["Inter",ui-sans-serif,sans-serif] pb-28 lg:pb-8'>
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

                {/* VERDICT — shown FIRST on mobile so the headline lands immediately,
                    sticky on the right for desktop readers scrolling through detail */}
                <aside className="order-first lg:order-last lg:w-[340px] shrink-0">
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className={`lg:sticky lg:top-6 rounded-[2rem] p-6 sm:p-8 shadow-xl bg-gradient-to-br ${theme.bg} text-white ring-1 ${theme.ring}`}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-xs font-bold uppercase tracking-widest opacity-80">Final verdict</p>
                            <RiskBadge level={risk} />
                        </div>

                        {/* Seal — the one distinctive signature element on the page */}
                        <div className="flex items-center gap-5 mb-7">
                            <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28">
                                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                    <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="6" />
                                    <circle
                                        cx="50" cy="50" r="44" fill="none" stroke="#F4C752" strokeWidth="6"
                                        strokeDasharray={`${(score / 100) * 276.5} 276.5`} strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <Scale className="w-3.5 h-3.5 opacity-70 mb-0.5" />
                                    <span className={`${F_MONO} text-2xl sm:text-3xl font-semibold leading-none`}>{score}</span>
                                    <span className="text-[9px] uppercase tracking-widest opacity-70 mt-0.5">/ 100</span>
                                </div>
                            </div>
                            <h3 className={`${F_DISPLAY} text-2xl sm:text-3xl font-semibold leading-tight`}>{decisionSummary.finalDecision}</h3>
                        </div>

                        <div className="mb-7">
                            <div className="flex justify-between text-[11px] uppercase tracking-widest opacity-80 mb-1.5">
                                <span>Confidence</span>
                                <span className={F_MONO}>{confidence}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-white/15 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${confidence}%` }}
                                    transition={{ duration: 0.6, ease: 'easeOut' }}
                                    className="h-full rounded-full bg-[#F4C752]"
                                />
                            </div>
                        </div>

                        <div className="space-y-3 mb-7 text-sm">
                            <div className="flex justify-between items-center border-b border-white/15 pb-2.5">
                                <span className="opacity-80">Total clauses reviewed</span>
                                <span className={`${F_MONO} font-semibold`}>{clauses.length}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/15 pb-2.5">
                                <span className="opacity-80 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-300" />High risk</span>
                                <span className={`${F_MONO} font-semibold`}>{highRiskCount}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/15 pb-2.5">
                                <span className="opacity-80 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-300" />Medium risk</span>
                                <span className={`${F_MONO} font-semibold`}>{medRiskCount}</span>
                            </div>
                            <div className="flex justify-between items-center pb-1">
                                <span className="opacity-80 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />Low risk</span>
                                <span className={`${F_MONO} font-semibold`}>{lowRiskCount}</span>
                            </div>
                        </div>

                        {nextBestActions.length > 0 && (
                            <div className="mb-7">
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-3">Do this next</p>
                                <ul className="space-y-2.5">
                                    {nextBestActions.slice(0, 3).map((a, i) => (
                                        <li key={i} className="flex gap-2.5 text-xs sm:text-sm font-medium leading-snug">
                                            <CheckCircle className="w-4 h-4 shrink-0 text-white/80 mt-0.5" /> <span>{a}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Buttons hidden on mobile — the sticky bottom bar below covers small screens */}
                        <div className="hidden lg:flex flex-col gap-3">
                            <button className="w-full bg-white text-slate-900 py-3.5 rounded-xl font-bold text-sm hover:bg-slate-100 active:scale-[0.98] transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
                                Talk to a professional
                            </button>
                            <button
                                onClick={() => generatePremiumPDF(analysis)}
                                className="w-full bg-black/20 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-black/30 active:scale-[0.98] transition-all backdrop-blur-sm border border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            >
                                <Download className="w-4 h-4" /> Download full report (PDF)
                            </button>
                        </div>
                    </motion.div>
                </aside>

                {/* MAIN COLUMN */}
                <div className="flex-1 space-y-5 min-w-0 order-last lg:order-first">

                    {/* Executive Summary Hero */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.05 }}
                        className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-200 shadow-sm"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-0.5 bg-teal-500 rounded-full" />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-teal-700">What this means for you</span>
                        </div>
                        <h2 className={`${F_DISPLAY} text-xl sm:text-2xl font-semibold text-slate-900 mb-4`}>Executive summary</h2>
                        <p className="text-slate-600 leading-relaxed text-sm sm:text-base mb-7">{executiveSummary}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                            {[
                                { label: 'Risks found', val: keyRisks.length, col: 'text-rose-600 bg-rose-50 border-rose-100' },
                                { label: 'Missing terms', val: missingProtections.length, col: 'text-amber-600 bg-amber-50 border-amber-100' },
                                { label: 'Recomm-endation', val: recommendations.length, col: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                                { label: 'What-ifs', val: whatIfSuggestions.length, col: 'text-indigo-600 bg-indigo-50 border-indigo-100' }
                            ].map((s, i) => (
                                <div key={i} className={`p-3.5 sm:p-4 rounded-2xl border text-center shadow-sm ${s.col}`}>
                                    <div className={`${F_MONO} text-xl sm:text-2xl font-semibold mb-1`}>{s.val}</div>
                                    <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest opacity-80 leading-tight">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Expand / collapse control */}
                    {sectionDefs.length > 1 && (
                        <div className="flex items-center justify-between px-1">
                            <p className="text-xs text-slate-500">{sectionDefs.length} sections in this report</p>
                            <button
                                onClick={toggleAll}
                                className="text-xs font-bold uppercase tracking-widest text-teal-700 hover:text-teal-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded px-2 py-1"
                            >
                                {allOpen ? 'Collapse all' : 'Expand all'}
                            </button>
                        </div>
                    )}

                    {/* DASHBOARD ACCORDIONS */}
                    <div className="space-y-3.5">

                        {/* 1. Clause Analysis */}
                        {clauses.length > 0 && (
                            <DashboardSection id="clauses" title="Clause-by-clause analysis" icon={FileCode} count={clauses.length}>
                                <div className="space-y-3">
                                    {clauses.map((c, i) => {
                                        const isExpanded = openClause === i;
                                        const cleanTitle = c.clause.replace(/^\d+[\.\-\s]*/, '').trim();
                                        return (
                                            <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                                <button
                                                    onClick={() => setOpenClause(isExpanded ? null : i)}
                                                    aria-expanded={isExpanded}
                                                    className="w-full min-h-[56px] p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                                                >
                                                    <div className="flex items-center gap-3 sm:gap-4 text-left min-w-0">
                                                        <span className={`${F_MONO} text-slate-400 font-semibold text-sm shrink-0`}>{String(i + 1).padStart(2, '0')}</span>
                                                        <span className="font-semibold text-slate-900 text-sm sm:text-base truncate">{cleanTitle}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <RiskBadge level={c.riskLevel} />
                                                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 hidden sm:block ${isExpanded ? 'rotate-180' : ''}`} />
                                                    </div>
                                                </button>
                                                <AnimatePresence initial={false}>
                                                    {isExpanded && (
                                                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.2 }} className="px-4 sm:px-5 pb-5 border-t border-slate-100 bg-slate-50">
                                                            <div className="pt-4 space-y-4 text-sm text-slate-600">
                                                                <div>
                                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">In plain terms</span>
                                                                    <p className="leading-relaxed">{c.explanation}</p>
                                                                </div>
                                                                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                                                                    <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
                                                                        <strong className="text-[10px] flex items-center gap-1.5 uppercase tracking-widest text-amber-600 mb-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Business impact</strong>
                                                                        <p className="leading-relaxed">{c.businessImpact}</p>
                                                                    </div>
                                                                    <div className="bg-white p-4 rounded-xl border border-teal-100 shadow-sm">
                                                                        <strong className="text-[10px] flex items-center gap-1.5 uppercase tracking-widest text-teal-700 mb-1.5"><CheckCircle className="w-3.5 h-3.5" /> Recommendation</strong>
                                                                        <p className="leading-relaxed">{c.recommendation}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
                                </div>
                            </DashboardSection>
                        )}

                        {/* 2. Recommendations */}
                        {recommendations.length > 0 && (
                            <DashboardSection id="recs" title="Recommendations" icon={CheckCircle} count={recommendations.length}>
                                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                                    {recommendations.map((r, i) => (
                                        <div key={i} className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
                                            <div className="flex items-start justify-between mb-2 gap-2">
                                                <h4 className="font-semibold text-slate-900 text-sm leading-snug">{r.title}</h4>
                                                <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded shrink-0 border ${r.priority === 'HIGH' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>{r.priority}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed">{r.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </DashboardSection>
                        )}

                        {/* 3. Missing Protections */}
                        {missingProtections.length > 0 && (
                            <DashboardSection id="missing" title="Missing protections" icon={ShieldAlert} count={missingProtections.length}>
                                <ul className="space-y-2.5">
                                    {missingProtections.map((m, i) => (
                                        <li key={i} className="flex items-start gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm text-sm text-slate-700">
                                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> <span>{m}</span>
                                        </li>
                                    ))}
                                </ul>
                            </DashboardSection>
                        )}

                        {/* 4. Key Risks */}
                        {keyRisks.length > 0 && (
                            <DashboardSection id="risks" title="Key risks" icon={AlertTriangle} count={keyRisks.length}>
                                <ul className="space-y-2.5">
                                    {keyRisks.map((r, i) => (
                                        <li key={i} className="flex items-start gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-rose-100 shadow-sm text-sm text-slate-700">
                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" /> <span>{r}</span>
                                        </li>
                                    ))}
                                </ul>
                            </DashboardSection>
                        )}

                        {/* 5. Next Best Actions */}
                        {nextBestActions.length > 0 && (
                            <DashboardSection id="actions" title="Next best actions" icon={TrendingUp} count={nextBestActions.length}>
                                <ul className="space-y-2.5">
                                    {nextBestActions.map((a, i) => (
                                        <li key={i} className="flex items-start gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-emerald-100 shadow-sm text-sm font-medium text-slate-800">
                                            <div className={`${F_MONO} w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] shrink-0 mt-0.5`}>{i + 1}</div>
                                            <span>{a}</span>
                                        </li>
                                    ))}
                                </ul>
                            </DashboardSection>
                        )}

                        {/* 6. What-if Scenarios */}
                        {whatIfSuggestions.length > 0 && (
                            <DashboardSection id="whatif" title="What-if scenarios" icon={Lightbulb} count={whatIfSuggestions.length}>
                                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                                    {whatIfSuggestions.map((w, i) => (
                                        <div key={i} className="bg-white p-4 sm:p-5 rounded-xl border border-indigo-100 shadow-sm">
                                            <h4 className="font-semibold text-indigo-900 text-sm mb-2">{w.scenario}</h4>
                                            <p className="text-sm text-slate-600 leading-relaxed">{w.impact}</p>
                                        </div>
                                    ))}
                                </div>
                            </DashboardSection>
                        )}

                        {/* 7. Follow-up Questions */}
                        {followUpQuestions.length > 0 && (
                            <DashboardSection id="followup" title="Questions to ask" icon={HelpCircle} count={followUpQuestions.length}>
                                <ul className="space-y-2.5">
                                    {followUpQuestions.map((q, i) => (
                                        <li key={i} className="flex items-start gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm text-sm text-slate-700">
                                            <MessageCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> <span className="italic">"{q}"</span>
                                        </li>
                                    ))}
                                </ul>
                            </DashboardSection>
                        )}
                    </div>
                </div>
            </div>

            {/* MOBILE STICKY ACTION BAR — always-reachable primary actions on small screens */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-slate-200 p-3 flex gap-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
                <button className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-sm active:scale-[0.98] transition-all">
                    Talk to a pro
                </button>
                <button
                    onClick={() => generatePremiumPDF(analysis)}
                    className="flex-1 bg-teal-700 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                >
                    <Download className="w-4 h-4" /> PDF
                </button>
            </div>
        </div>
    );
}

// ==========================================
// 3. PREMIUM PDF GENERATOR ENGINE
//    Same data fields consumed as before — only the visual
//    layout and polish have been improved.
// ==========================================

export const generatePremiumPDF = (data) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPos = 0;

    // --- Styling Config ---
    const FONT = "helvetica";
    const colors = {
        primary: [15, 23, 42],      // Slate 900
        secondary: [71, 85, 105],   // Slate 600
        muted: [148, 163, 184],     // Slate 400
        border: [226, 232, 240],    // Slate 200
        bgLight: [248, 250, 252],   // Slate 50
        brand: [11, 75, 68],        // Deep teal (brand)
        gold: [212, 160, 23],       // Accent gold
        red: [225, 29, 72],
        amber: [217, 119, 6],
        emerald: [5, 150, 105],
        indigo: [79, 70, 229]
    };

    // --- PDF Engine Helpers ---
    const checkPageBreak = (neededHeight) => {
        if (yPos + neededHeight > pageHeight - margin) {
            doc.addPage();
            yPos = margin;
            return true;
        }
        return false;
    };

    const drawWrappedText = (text, x, y, maxWidth, fontSize, fontStyle, color) => {
        doc.setFont(FONT, fontStyle);
        doc.setFontSize(fontSize);
        doc.setTextColor(...color);
        const lines = doc.splitTextToSize(text || 'N/A', maxWidth);
        doc.text(lines, x, y);
        return y + (lines.length * (fontSize * 0.45));
    };

    const drawTitle = (text, fontSize, spacingAfter) => {
        checkPageBreak(fontSize + spacingAfter);
        doc.setFont(FONT, "bold");
        doc.setFontSize(fontSize);
        doc.setTextColor(...colors.primary);
        doc.text(text, margin, yPos);
        // small brand tick beside section titles
        doc.setDrawColor(...colors.brand);
        doc.setLineWidth(1.2);
        doc.line(margin, yPos + 2.5, margin + 8, yPos + 2.5);
        yPos += spacingAfter;
    };

    const drawBulletList = (items, color = colors.secondary) => {
        if (!items || items.length === 0) return;
        items.forEach(item => {
            const bulletHeight = (doc.splitTextToSize(`•  ${item}`, contentWidth - 5).length * (10 * 0.45));
            checkPageBreak(bulletHeight + 5);
            yPos = drawWrappedText(`•  ${item}`, margin, yPos, contentWidth - 5, 10, "normal", color) + 4;
        });
        yPos += 5;
    };

    const drawNumberedList = (items, color = colors.secondary) => {
        if (!items || items.length === 0) return;
        items.forEach((item, idx) => {
            const str = `${idx + 1}.  ${item}`;
            const itemHeight = (doc.splitTextToSize(str, contentWidth - 8).length * (10 * 0.45));
            checkPageBreak(itemHeight + 5);
            yPos = drawWrappedText(str, margin, yPos, contentWidth - 8, 10, "normal", color) + 4;
        });
        yPos += 5;
    };

    // ==========================================
    // PAGE 1: COVER & EXECUTIVE SUMMARY
    // ==========================================

    // Header Banner
    doc.setFillColor(...colors.brand);
    doc.rect(0, 0, pageWidth, 48, 'F');
    doc.setFillColor(...colors.gold);
    doc.rect(0, 46, pageWidth, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont(FONT, "bold");
    doc.setFontSize(23);
    doc.text("Document Analysis Report", margin, 26);
    doc.setFontSize(10);
    doc.setFont(FONT, "normal");
    doc.setTextColor(220, 230, 228);
    doc.text(`Generated on ${new Date().toLocaleDateString()}  •  Prepared for your review`, margin, 36);

    yPos = 65;

    // Overall Assessment Box
    doc.setDrawColor(...colors.border);
    doc.setFillColor(...colors.bgLight);
    doc.roundedRect(margin, yPos, contentWidth, 32, 3, 3, 'FD');

    doc.setFontSize(9);
    doc.setFont(FONT, "bold");
    doc.setTextColor(...colors.muted);
    doc.text("OVERALL DECISION", margin + 6, yPos + 11);
    doc.setFontSize(17);
    doc.setTextColor(...colors.primary);
    doc.text(data.decisionSummary.finalDecision, margin + 6, yPos + 22);

    const col2 = margin + contentWidth * 0.48;
    const col3 = margin + contentWidth * 0.66;
    const col4 = margin + contentWidth * 0.84;

    doc.setFontSize(9);
    doc.setTextColor(...colors.muted);
    doc.text("RISK", col2, yPos + 11);
    doc.setFontSize(13);
    doc.setTextColor(...colors.primary);
    doc.text(data.decisionSummary.overallRisk || 'N/A', col2, yPos + 22);

    doc.setFontSize(9);
    doc.setTextColor(...colors.muted);
    doc.text("SCORE", col3, yPos + 11);
    doc.setFontSize(13);
    doc.setTextColor(...colors.primary);
    doc.text(`${data.decisionSummary.decisionScore}/100`, col3, yPos + 22);

    doc.setFontSize(9);
    doc.setTextColor(...colors.muted);
    doc.text("CONFIDENCE", col4, yPos + 11);
    doc.setFontSize(13);
    doc.setTextColor(...colors.primary);
    doc.text(`${data.decisionSummary.confidence}%`, col4, yPos + 22);

    yPos += 46;

    // Executive Summary
    drawTitle("Executive Summary", 14, 9);
    yPos = drawWrappedText(data.executiveSummary, margin, yPos, contentWidth, 11, "normal", colors.secondary) + 10;

    // Key Risks & Missing Protections (Page 1 Continued)
    if (data.keyRisks?.length > 0) {
        drawTitle("Key Risks Identified", 12, 9);
        drawBulletList(data.keyRisks, colors.red);
    }

    if (data.missingProtections?.length > 0) {
        drawTitle("Missing Protections", 12, 9);
        drawBulletList(data.missingProtections, colors.amber);
    }

    // ==========================================
    // PAGE 2: ACTIONS, RECS, & WHAT-IFS
    // ==========================================
    doc.addPage();
    yPos = margin;

    if (data.nextBestActions?.length > 0) {
        drawTitle("Next Best Actions", 14, 9);
        drawNumberedList(data.nextBestActions, colors.emerald);
        yPos += 5;
    }

    if (data.recommendations?.length > 0) {
        drawTitle("Recommendations", 14, 9);
        data.recommendations.forEach(r => {
            const hTitle = (doc.splitTextToSize(r.title, contentWidth - 10).length * (11 * 0.45));
            const hDesc = (doc.splitTextToSize(r.description, contentWidth - 10).length * (10 * 0.45));
            const cardHeight = 10 + hTitle + 5 + hDesc + 5;

            checkPageBreak(cardHeight);

            doc.setDrawColor(...colors.border);
            doc.setFillColor(...colors.bgLight);
            doc.roundedRect(margin, yPos, contentWidth, cardHeight, 3, 3, 'FD');
            doc.setFillColor(...colors.brand);
            doc.roundedRect(margin, yPos, 2.5, cardHeight, 1, 1, 'F');

            let cy = yPos + 8;
            cy = drawWrappedText(r.title, margin + 8, cy, contentWidth - 14, 11, "bold", colors.primary) + 3;
            drawWrappedText(r.description, margin + 8, cy, contentWidth - 14, 10, "normal", colors.secondary);

            yPos += cardHeight + 6;
        });
        yPos += 5;
    }

    if (data.whatIfSuggestions?.length > 0) {
        drawTitle("What-If Scenarios", 14, 9);
        data.whatIfSuggestions.forEach(w => {
            const hScen = (doc.splitTextToSize(`Scenario: ${w.scenario}`, contentWidth).length * (10 * 0.45));
            const hImp = (doc.splitTextToSize(`Impact: ${w.impact}`, contentWidth).length * (10 * 0.45));
            checkPageBreak(hScen + hImp + 6);

            let cy = yPos;
            cy = drawWrappedText(`Scenario: ${w.scenario}`, margin, cy, contentWidth, 10, "bold", colors.indigo) + 2;
            yPos = drawWrappedText(`Impact: ${w.impact}`, margin, cy, contentWidth, 10, "normal", colors.secondary) + 6;
        });
        yPos += 5;
    }

    if (data.followUpQuestions?.length > 0) {
        drawTitle("Follow-up Questions", 14, 9);
        drawNumberedList(data.followUpQuestions, colors.primary);
    }

    // ==========================================
    // PAGE 3+: CLAUSE-BY-CLAUSE AUDIT
    // ==========================================
    if (data.clauses?.length > 0) {
        doc.addPage();
        yPos = margin;

        drawTitle("Detailed Clause Analysis", 16, 13);

        data.clauses.forEach((c, idx) => {
            const cleanTitle = c.clause.replace(/^\d+[\.\-\s]*/, '').trim();
            const rLevel = (c.riskLevel || 'MEDIUM').toUpperCase();

            // Calculate Box Height beforehand to prevent splitting!
            const hTitle = (doc.splitTextToSize(`${idx + 1}. ${cleanTitle}`, contentWidth - 30).length * (12 * 0.45));
            const hExp = (doc.splitTextToSize(c.explanation, contentWidth - 10).length * (10 * 0.45));
            const colWidth = (contentWidth / 2) - 10;
            const hImp = c.businessImpact ? (doc.splitTextToSize(c.businessImpact, colWidth).length * (9 * 0.45)) : 0;
            const hRec = c.recommendation ? (doc.splitTextToSize(c.recommendation, colWidth).length * (9 * 0.45)) : 0;
            const hCols = Math.max(hImp, hRec);

            const totalHeight = 10 + hTitle + 10 + hExp + (hCols > 0 ? 10 + hCols : 0) + 10;

            // If it doesn't fit, move entire card to next page
            checkPageBreak(totalHeight);

            // Draw Card Background
            doc.setDrawColor(...colors.border);
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(margin, yPos, contentWidth, totalHeight, 3, 3, 'FD');

            let cy = yPos + 10;

            // Title
            drawWrappedText(`${idx + 1}. ${cleanTitle}`, margin + 5, cy, contentWidth - 30, 12, "bold", colors.primary);

            // Badge
            let bColor = colors.amber;
            if (rLevel === 'HIGH') bColor = colors.red;
            if (rLevel === 'LOW') bColor = colors.emerald;
            doc.setFillColor(...bColor);
            doc.roundedRect(pageWidth - margin - 22, cy - 5, 17, 6, 1, 1, 'F');
            doc.setFontSize(8);
            doc.setTextColor(255, 255, 255);
            doc.text(rLevel, pageWidth - margin - 13.5, cy - 1, { align: 'center' });

            cy += hTitle + 8;

            // Explanation
            drawWrappedText("IN PLAIN TERMS", margin + 5, cy, contentWidth - 10, 8, "bold", colors.muted);
            cy += 5;
            cy = drawWrappedText(c.explanation, margin + 5, cy, contentWidth - 10, 10, "normal", colors.secondary) + 8;

            // Columns (Impact & Rec)
            if (hCols > 0) {
                const gridY = cy;
                if (c.businessImpact) {
                    drawWrappedText("BUSINESS IMPACT", margin + 5, gridY, colWidth, 8, "bold", colors.amber);
                    drawWrappedText(c.businessImpact, margin + 5, gridY + 5, colWidth, 9, "normal", colors.secondary);
                }
                if (c.recommendation) {
                    const midX = margin + colWidth + 10;
                    drawWrappedText("RECOMMENDATION", midX, gridY, colWidth, 8, "bold", colors.brand);
                    drawWrappedText(c.recommendation, midX, gridY + 5, colWidth, 9, "normal", colors.secondary);
                }
            }

            yPos += totalHeight + 8;
        });
    }

    // ==========================================
    // FINAL SUMMARY PAGE
    // ==========================================
    checkPageBreak(50);
    drawTitle("Final Summary", 14, 9);
    yPos = drawWrappedText(`Overall Recommendation: ${data.decisionSummary.finalDecision}`, margin, yPos, contentWidth, 11, "bold", colors.primary) + 5;
    if (data.decisionSummary.lawyerReviewRecommended) {
        yPos = drawWrappedText("•  Professional legal review is highly recommended for this document.", margin, yPos, contentWidth, 10, "normal", colors.red) + 5;
    }
    if (data.decisionSummary.negotiationRequired) {
        yPos = drawWrappedText("•  Negotiation of terms is required before signing.", margin, yPos, contentWidth, 10, "normal", colors.amber) + 5;
    }

    // --- FOOTER (All Pages) ---
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setDrawColor(...colors.border);
        doc.setLineWidth(0.3);
        doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);
        doc.setFontSize(8);
        doc.setFont(FONT, "normal");
        doc.setTextColor(...colors.muted);
        doc.text(`Document Analysis Report  •  Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    doc.save("Document_Analysis_Report.pdf");
};


// Profile Dropdown Component
function ProfileDropdown({ isOpen, onClose, user, onUpgrade, onSettings, onLogout, onDeleteAccount, onHelpCenter, onReleaseNotes, onTerms, onReportBug, position = "top" }) {
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const helpItems = [
        { label: "Help Center", icon: HelpCircle, onClick: onHelpCenter },
        { label: "Release Notes", icon: FileQuestion, onClick: onReleaseNotes },
        { label: "Terms & Policies", icon: Shield, onClick: onTerms },
        { label: "Report Bug", icon: Bug, onClick: onReportBug },
    ];

    return (
        <div
            ref={dropdownRef}
            className={`absolute ${position === "top" ? "bottom-full mb-2" : "top-full mt-2"} left-0 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 text-gray-900 animate-in fade-in-0 zoom-in-95 overflow-hidden`}
        >
            {/* Profile Header */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <Avatar
                        src={user?.avatar}
                        alt={user?.name || "User"}
                        fallback={user?.name?.charAt(0) || "U"}
                        size="lg"
                        className="ring-2 ring-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.name || "User"}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-medium rounded-full border border-blue-200">
                                {user?.plan || "Free"} Plan
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upgrade Section */}
            <div className="p-2 border-b border-gray-100">
                <button
                    onClick={onUpgrade}
                    className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-200">
                            <Crown className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium text-gray-900">Upgrade to Pro</p>
                            <p className="text-[10px] text-gray-500">Unlock Several Features</p>
                        </div>
                    </div>
                </button>
            </div>

            {/* Settings & Help */}
            <div className="p-2 space-y-0.5">
                {helpItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={index}
                            onClick={item.onClick}
                            className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
                        >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm">{item.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Logout & Delete Account */}
            <div className="p-2 border-t border-gray-100 space-y-0.5">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Log out</span>
                </button>
                <button
                    onClick={onDeleteAccount}
                    className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <UserX className="w-4 h-4" />
                    <span className="text-sm font-medium">Delete Account</span>
                </button>
            </div>
        </div>
    );
}

// Usage Limit Reached Modal Component
function UsageLimitReachedModal({ isOpen, onClose, limitInfo, onUpgrade }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                        <Clock className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Daily Limit Reached</h3>
                    <p className="text-gray-600 text-sm mb-4">
                        You've used {limitInfo?.currentUsage || 0} of {limitInfo?.limit || 0} daily queries
                    </p>

                    {/* Reset Timer */}
                    <div className="w-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-6">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">Limit Resets In</span>
                        </div>
                        <div className="text-3xl font-bold text-blue-600">
                            {limitInfo?.hoursUntilReset || 0}h {limitInfo?.minutesUntilReset || 0}m
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Your queries will reset at midnight</p>
                    </div>

                    {/* Upgrade CTA */}
                    <div className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Crown className="w-5 h-5 text-yellow-300" />
                            <span className="text-white font-semibold">Upgrade to Pro</span>
                        </div>
                        <p className="text-white/90 text-sm mb-3">
                            Get unlimited queries, advanced features, and priority support
                        </p>
                        <button
                            onClick={() => {
                                onClose();
                                onUpgrade();
                            }}
                            className="w-full px-4 py-2.5 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Upgrade Now
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// Delete Account Modal Component
function DeleteAccountModal({ isOpen, onClose, onConfirm, isLoading }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border-2 border-red-50">
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Account?</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        This action is <strong>irreversible</strong>. All your data will be permanently deleted.
                    </p>
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-70"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Forever"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function Demo() {
    const router = useRouter();

    // STATE
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [file, setFile] = useState(null);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [processingStage, setProcessingStage] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isAuthChecking, setIsAuthChecking] = useState(true);
    const [user, setUser] = useState(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [chatId, setChatId] = useState(null);

    const [toolsOpen, setToolsOpen] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [temporaryChat, setTemporaryChat] = useState(false);
    const [activeTool, setActiveTool] = useState(null);
    const [isRecognitionRunning, setIsRecognitionRunning] = useState(false);

    const [documentContext, setDocumentContext] = useState("");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [wasVoiceInput, setWasVoiceInput] = useState(false);
    const [guestId, setGuestId] = useState("");
    const [isLiveMode, setIsLiveMode] = useState(false);
    const [liveStatus, setLiveStatus] = useState("idle");
    const [speechLanguage, setSpeechLanguage] = useState('hi-IN');
    const [availableVoices, setAvailableVoices] = useState([]);

    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [chatToDelete, setChatToDelete] = useState(null);
    const [isDeletingChat, setIsDeletingChat] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showUsageLimitModal, setShowUsageLimitModal] = useState(false);
    const [usageLimitInfo, setUsageLimitInfo] = useState(null);
    const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
    const [userUsageInfo, setUserUsageInfo] = useState(null);

    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeoutRef = useRef(null);

    const [chatToRename, setChatToRename] = useState(null);
    const [newChatTitle, setNewChatTitle] = useState("");
    const [isRenamingChat, setIsRenamingChat] = useState(false);

    const [isDragging, setIsDragging] = useState(false);

    const MAX_FILES = 3;

    // REFS
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const rafRef = useRef(null);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);
    const liveCooldownRef = useRef(false);

    const toolItems = [
        { id: 'doc_generator', label: 'Legal Doc Studio', icon: FileText, description: 'AI Legal document generator & drafting studio' },
        { id: 'compare_docs', label: 'Compare Docs', icon: FileCode, description: 'Compare legal documents' },
        { id: 'glossary_tool', label: 'Glossary', icon: Book, description: 'Legal terminology' },
        { id: 'community_tool', label: 'Community', icon: Users, description: 'Share and learn' },
        { id: 'chrome_extension', label: 'Chrome Extension', icon: Download, description: 'Download browser extension' },
    ];

    // Helper function to add files
    const addFiles = (newFiles) => {
        const fileArray = Array.from(newFiles);
        const validFiles = fileArray.filter(f => {
            const isPDF = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
            const isImage = f.type.startsWith('image/') ||
                /\.(png|jpg|jpeg|webp)$/i.test(f.name.toLowerCase());
            return isPDF || isImage;
        });

        if (validFiles.length === 0) {
            toast.error('No valid files. Only PDF and images are supported.');
            return;
        }

        const currentCount = files.length;
        const availableSlots = MAX_FILES - currentCount;

        if (availableSlots === 0) {
            toast.error(`Maximum ${MAX_FILES} files allowed. Remove some files first.`);
            return;
        }

        const filesToAdd = validFiles.slice(0, availableSlots);
        const newFilesList = [...files, ...filesToAdd];

        setFiles(newFilesList);

        if (filesToAdd.length < validFiles.length) {
            toast.warning(`Only ${filesToAdd.length} file(s) added. Maximum ${MAX_FILES} files allowed.`);
        } else if (filesToAdd.length === 1) {
            toast.success('File added!');
        } else {
            toast.success(`${filesToAdd.length} files added!`);
        }
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        toast.success('File removed');
    };

    // ==========================================
    // AUTH & SETUP
    // ==========================================
    useEffect(() => {
        let storedGuestId = localStorage.getItem("guest_id");
        if (!storedGuestId) {
            storedGuestId = "guest_" + Math.random().toString(36).substring(2, 15);
            localStorage.setItem("guest_id", storedGuestId);
        }
        setGuestId(storedGuestId);

        const loadVoices = () => {
            const v = window.speechSynthesis.getVoices();
            if (v.length > 0) {
                setAvailableVoices(v);
            }
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/me', {
                    cache: 'no-store',
                    credentials: 'include'
                });

                if (!res.ok) {
                    const accessToken = localStorage.getItem('accessToken');
                    const refreshToken = localStorage.getItem('refreshToken');

                    if (!accessToken && !refreshToken) {
                        router.push('/pages/login');
                        return;
                    }

                    if (res.status === 401) {
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        toast.error('Session expired. Please login again.');
                        router.push('/pages/login');
                        return;
                    }
                }

                const data = await res.json();
                if (data.success && data.user) {
                    setUser(data.user);
                    fetchChats();
                } else {
                    throw new Error('Invalid response from auth API');
                }
            } catch (error) {
                console.error('Auth check error:', error);
                const accessToken = localStorage.getItem('accessToken');
                if (!accessToken) {
                    router.push('/pages/login');
                }
            } finally {
                setIsAuthChecking(false);
            }
        };
        checkAuth();
    }, [router]);

    useEffect(() => {
        const checkUsageInfo = async () => {
            if (user) {
                try {
                    const token = localStorage.getItem('accessToken');
                    const response = await fetch('/api/subscription', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setUserUsageInfo(data);
                    }
                } catch (error) { console.error('Failed to check usage info:', error); }
            }
        };
        checkUsageInfo();
    }, [user]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading, isGenerating]);
    useEffect(() => { if (textareaRef.current) textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`; }, [inputText]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'O') { e.preventDefault(); handleNewChat(); }
            if (e.ctrlKey && e.shiftKey && e.key === 'L') { e.preventDefault(); router.push('/pages/legal-consultation'); }
            if (e.ctrlKey && e.key === 'k') { e.preventDefault(); setShowSearchModal(true); }
            if (e.key === 'Escape') {
                setShowSearchModal(false);
                setShowShareModal(false);
                setShowLogoutModal(false);
                setChatToDelete(null);
                setChatToRename(null);
                setShowUsageLimitModal(false);
                document.querySelectorAll('.chat-menu').forEach(menu => menu.classList.add('hidden'));
            }
        };

        const handleClickOutside = (e) => {
            if (!e.target.closest('.chat-menu-button') && !e.target.closest('.chat-menu')) {
                document.querySelectorAll('.chat-menu').forEach(menu => menu.classList.add('hidden'));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener('click', handleClickOutside);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    // Speech Utils
    const getBestVoice = (text) => {
        if (!availableVoices.length) return null;

        const isHindi = /[\u0900-\u097F]/.test(text);
        const isBengali = /[\u0980-\u09FF]/.test(text);
        const isTamil = /[\u0B80-\u0BFF]/.test(text);
        const isTelugu = /[\u0C00-\u0C7F]/.test(text);
        const isGujarati = /[\u0A80-\u0AFF]/.test(text);
        const isKannada = /[\u0C80-\u0CFF]/.test(text);
        const isMalayalam = /[\u0D00-\u0D7F]/.test(text);
        const isPunjabi = /[\u0A00-\u0A7F]/.test(text);

        if (isHindi) return availableVoices.find(v => v.lang.includes('hi') || v.name.toLowerCase().includes('hindi') || v.lang === 'hi-IN') || availableVoices.find(v => v.lang.includes('en-IN')) || null;
        if (isBengali) return availableVoices.find(v => v.lang.includes('bn') || v.name.toLowerCase().includes('bengali')) || availableVoices.find(v => v.lang.includes('en-IN')) || null;
        if (isTamil) return availableVoices.find(v => v.lang.includes('ta') || v.name.toLowerCase().includes('tamil')) || availableVoices.find(v => v.lang.includes('en-IN')) || null;
        if (isTelugu) return availableVoices.find(v => v.lang.includes('te') || v.name.toLowerCase().includes('telugu')) || availableVoices.find(v => v.lang.includes('en-IN')) || null;
        if (isGujarati) return availableVoices.find(v => v.lang.includes('gu') || v.name.toLowerCase().includes('gujarati')) || availableVoices.find(v => v.lang.includes('en-IN')) || null;
        if (isKannada) return availableVoices.find(v => v.lang.includes('kn') || v.name.toLowerCase().includes('kannada')) || availableVoices.find(v => v.lang.includes('en-IN')) || null;
        if (isMalayalam) return availableVoices.find(v => v.lang.includes('ml') || v.name.toLowerCase().includes('malayalam')) || availableVoices.find(v => v.lang.includes('en-IN')) || null;
        if (isPunjabi) return availableVoices.find(v => v.lang.includes('pa') || v.name.toLowerCase().includes('punjabi')) || availableVoices.find(v => v.lang.includes('en-IN')) || null;

        return availableVoices.find(v => v.lang === 'en-US' || v.lang === 'en-IN' || v.name.includes('Google US English') || v.name.includes('Google UK English')) || availableVoices[0] || null;
    };

    const cleanMarkdown = (text) => {
        if (!text) return "";
        return text.replace(/\*\*/g, "").replace(/\*/g, "").replace(/#{1,6}\s/g, "").replace(/`{1,3}/g, "").replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1").trim();
    };

    const speakTextPromise = (text) => {
        return new Promise((resolve) => {
            if (!window.speechSynthesis) { resolve(); return; }
            window.speechSynthesis.cancel();
            const cleanText = cleanMarkdown(text);
            if (!cleanText) { resolve(); return; }

            const utterance = new SpeechSynthesisUtterance(cleanText);
            const voice = getBestVoice(cleanText);
            if (voice) utterance.voice = voice;

            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            utterance.onstart = () => setLiveStatus("speaking");
            utterance.onend = () => { setLiveStatus("idle"); resolve(); };
            utterance.onerror = () => { setLiveStatus("idle"); resolve(); };
            window.speechSynthesis.speak(utterance);
        });
    };

    const speakText = (text) => {
        if (!window.speechSynthesis) return toast.error('Text-to-speech not supported');
        if (!text) return;

        window.speechSynthesis.cancel();
        const cleanText = cleanMarkdown(text);
        if (!cleanText) return;

        const utterance = new SpeechSynthesisUtterance(cleanText);
        const voice = getBestVoice(cleanText);
        if (voice) utterance.voice = voice;

        utterance.rate = 0.9;
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (e) => {
            setIsSpeaking(false);
            if (e.error !== 'interrupted' && e.error !== 'canceled') console.error('Speech error:', e.error);
        };

        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    // Live Voice Recognition Hooks
    const startLiveLoop = () => {
        if (!recognitionRef.current || liveCooldownRef.current) return;
        try {
            setIsRecognitionRunning(true);
            setLiveStatus("listening");
            recognitionRef.current.start();
        } catch { setIsRecognitionRunning(false); }
    };

    const handleLiveInput = async (transcript) => {
        if (liveCooldownRef.current) return;
        liveCooldownRef.current = true;
        try { recognitionRef.current?.stop(); } catch { }
        setIsRecognitionRunning(false);
        setLiveStatus("thinking");
        try {
            const res = await fetch("/api/live-conversation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ message: transcript }),
            });
            const data = await res.json();
            const reply = data?.data?.response || "I didn't catch that.";
            setLiveStatus("speaking");
            await speakTextPromise(reply);
        } catch { await speakTextPromise("Sorry, please repeat."); }
        setTimeout(() => { liveCooldownRef.current = false; }, 1200);
    };

    useEffect(() => {
        if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.maxAlternatives = 3;
            recognition.lang = speechLanguage;

            recognition.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) finalTranscript += transcript;
                    else interimTranscript += transcript;
                }

                const bestTranscript = finalTranscript || interimTranscript;
                if (bestTranscript.trim()) {
                    if (isLiveMode) handleLiveInput(bestTranscript);
                    else setInputText(bestTranscript);
                }
            };

            recognition.onerror = (event) => {
                setIsRecognitionRunning(false);
                if (event.error === 'language-not-supported' && recognition.lang !== 'en-IN') {
                    recognition.lang = 'en-IN';
                    return;
                }
                if (event.error === 'no-speech') return;

                if (isLiveMode) {
                    setLiveStatus("idle");
                    const errMsg = speechLanguage.startsWith('hi') ? "मुझे समझने में कठिनाई हो रही है।" : "I'm having trouble understanding.";
                    speakText(errMsg);
                    setTimeout(() => { if (isLiveMode) startLiveLoop(); }, 1500);
                } else {
                    setIsRecording(false);
                }
            };

            recognition.onnomatch = () => {
                if (isLiveMode) {
                    try { recognitionRef.current?.stop(); } catch (e) { }
                    setIsRecognitionRunning(false);
                    const noSpeechMessage = speechLanguage.startsWith('hi') ? "मैंने कुछ नहीं सुना।" : "I didn't hear anything.";
                    speakText(noSpeechMessage);
                    setTimeout(() => { if (isLiveMode) startLiveLoop(); }, 1500);
                }
            };

            recognition.onstart = () => { if (isLiveMode) setIsRecognitionRunning(true); };
            recognition.onend = () => {
                setIsRecognitionRunning(false);
                if (isLiveMode && !liveCooldownRef.current) startLiveLoop();
            };

            recognitionRef.current = recognition;
        }
    }, [isLiveMode, speechLanguage]);

    useEffect(() => {
        return () => {
            if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(t => t.stop());
            if (audioContextRef.current) audioContextRef.current.close();
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);


    // UI Handlers
    const toggleRecording = () => {
        if (isRecording) { recognitionRef.current?.stop(); setIsRecording(false); }
        else { recognitionRef.current?.start(); setWasVoiceInput(true); setIsRecording(true); }
    };

    const handleNewChat = () => {
        setMessages([]); setInputText(""); setFile(null); setFiles([]);
        setChatId(null); setDocumentContext(""); setSidebarOpen(false);
        setTemporaryChat(false); setActiveTool(null);
        toast.success("New chat started");
    };

    const handleTemporaryChat = () => {
        if (temporaryChat) {
            setTemporaryChat(false); toast.success("Temporary chat disabled");
        } else {
            setMessages([]); setInputText(""); setFile(null); setFiles([]);
            setChatId(null); setDocumentContext(""); setSidebarOpen(false);
            setTemporaryChat(true); setActiveTool(null); toast.success("Temporary chat started");
        }
    };

    const handleLogoutClick = () => setShowLogoutModal(true);
    const handleDeleteAccountClick = () => setShowDeleteAccountModal(true);

    const performDeleteAccount = async () => {
        setIsDeletingAccount(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('/api/auth/delete-account', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            if (res.ok) {
                toast.success("Account deleted successfully");
                localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken');
                setTimeout(() => { setShowDeleteAccountModal(false); router.push('/pages/login'); }, 1000);
            } else {
                const errorData = await res.json(); throw new Error(errorData.error || "Failed to delete account");
            }
        } catch (error) { toast.error(error.message); setIsDeletingAccount(false); }
    };

    const performLogout = async () => {
        setIsLoggingOut(true);
        try {
            localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken');
            const res = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
            if (res.ok) {
                toast.success('Logged out successfully');
                setTimeout(() => { setShowLogoutModal(false); router.push('/pages/login'); }, 500);
            } else throw new Error("Logout Failed");
        } catch (error) {
            toast.success('Logged out');
            setTimeout(() => { setShowLogoutModal(false); router.push('/pages/login'); }, 500);
        }
    };

    const fetchChats = async () => {
        setIsLoadingHistory(true);
        try {
            const res = await fetch('/api/chats', { cache: 'no-store' });
            if (res.ok) { const data = await res.json(); if (data.success) setChatHistory(data.chats); }
        } catch (error) { } finally { setIsLoadingHistory(false); }
    };

    const confirmDeleteChat = (e, id) => { e.stopPropagation(); setChatToDelete(id); };

    const handleDeleteChat = async () => {
        if (!chatToDelete) return;
        setIsDeletingChat(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`/api/chats/delete?chatId=${chatToDelete}`, {
                method: "DELETE",
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                toast.success("Chat deleted");
                setChatHistory(prev => prev.filter(chat => chat.id !== chatToDelete));
                if (chatId === chatToDelete) handleNewChat();
            } else throw new Error("Failed to delete");
        } catch (error) { toast.error("Failed to delete chat"); }
        finally { setIsDeletingChat(false); setChatToDelete(null); }
    };

    const handleRenameChat = async () => {
        if (!chatToRename || !newChatTitle.trim()) return;
        setIsRenamingChat(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('/api/chats/update-title', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatId: chatToRename, title: newChatTitle.trim() })
            });

            if (res.ok) {
                toast.success("Chat renamed");
                setChatHistory(prev => prev.map(chat => chat.id === chatToRename ? { ...chat, title: newChatTitle.trim() } : chat));
                setChatToRename(null); setNewChatTitle("");
            } else throw new Error("Failed to rename");
        } catch (error) { toast.error("Failed to rename chat"); }
        finally { setIsRenamingChat(false); }
    };

    const startRenameChat = (e, chatId, currentTitle) => { e.stopPropagation(); setChatToRename(chatId); setNewChatTitle(currentTitle); };

    // Paste Events
    useEffect(() => {
        const handlePaste = async (e) => {
            const isInModal = e.target.closest('.modal-content') || chatToRename !== null || showSearchModal;
            if (isInModal) return;

            const items = e.clipboardData?.items;
            if (!items) return;

            let handled = false;
            const pastedFiles = [];

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.type.indexOf('image') !== -1) {
                    e.preventDefault();
                    const blob = item.getAsFile();
                    if (blob) {
                        const file = new File([blob], `pasted-image-${Date.now()}-${i}.png`, { type: blob.type });
                        pastedFiles.push(file);
                        handled = true;
                    }
                }
            }

            if (pastedFiles.length > 0) { addFiles(pastedFiles); return; }

            if (!handled) {
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    if (item.type === 'text/plain') {
                        item.getAsString((text) => {
                            if (text.length > 200 && !inputText) {
                                setInputText(text); toast.success('Text pasted! Ready to analyze.');
                            }
                        });
                    }
                }
            }
        };
        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [chatToRename, showSearchModal, inputText, files]);

    // Drag and Drop
    const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer.types && e.dataTransfer.types.includes('Files')) setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); if (e.target === e.currentTarget) setIsDragging(false); };
    const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'; };
    const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); const droppedFiles = e.dataTransfer?.files; if (droppedFiles && droppedFiles.length > 0) addFiles(droppedFiles); };

    useEffect(() => {
        const preventDefaults = (e) => { e.preventDefault(); e.stopPropagation(); };
        document.addEventListener('dragenter', preventDefaults);
        document.addEventListener('dragover', preventDefaults);
        document.addEventListener('dragleave', preventDefaults);
        document.addEventListener('drop', preventDefaults);
        return () => {
            document.removeEventListener('dragenter', preventDefaults);
            document.removeEventListener('dragover', preventDefaults);
            document.removeEventListener('dragleave', preventDefaults);
            document.removeEventListener('drop', preventDefaults);
        };
    }, []);

    // Search Logic
    const handleSearchChats = async (query) => {
        setSearchQuery(query);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        if (!query.trim() || query.trim().length < 2) { setSearchResults([]); setIsSearching(false); return; }

        setIsSearching(true);
        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`/api/chats?search=${encodeURIComponent(query)}`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    cache: 'no-store'
                });
                if (response.ok) {
                    const data = await response.json(); setSearchResults(data.chats || []);
                } else setSearchResults([]);
            } catch (error) { setSearchResults([]); } finally { setIsSearching(false); }
        }, 500);
    };

    useEffect(() => { return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); }; }, []);

    const handleShareChat = async () => {
        if (!chatId || temporaryChat) return toast.error("Cannot share temporary chats");
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('/api/share-chat', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatId })
            });

            if (res.ok) {
                const data = await res.json();
                const shareUrl = `${window.location.origin}/shared/${data.shareId}`;
                await navigator.clipboard.writeText(shareUrl);
                toast.success("Share link copied to clipboard!");
                setShowShareModal(true);
            } else throw new Error("Failed to share");
        } catch (error) { toast.error("Failed to share chat"); }
    };

    const animateAssistantContent = (fullText) => {
        setIsGenerating(true);
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
        let charIndex = 0;
        const interval = setInterval(() => {
            charIndex += 5;
            if (charIndex >= fullText.length) {
                clearInterval(interval); setIsGenerating(false);
                setMessages(prev => { const newArr = [...prev]; newArr[newArr.length - 1].content = fullText; return newArr; });
            } else {
                setMessages(prev => { const newArr = [...prev]; newArr[newArr.length - 1].content = fullText.slice(0, charIndex); return newArr; });
            }
        }, 8);
    };

    // 🚀 MAP DATA EXACTLY AS IT COMES FROM API
    const handleLoadChat = async (id) => {
        if (id === chatId) return;
        setLoading(true); setSidebarOpen(false); setTemporaryChat(false);
        try {
            const res = await fetch(`/api/chats/${id}`);
            const data = await res.json();
            console.log("Loaded chat data:", data);
            if (data.success) {
                setChatId(id);
                setDocumentContext(data.documentContext || "");

                const formattedMessages = data.messages.map(msg => ({
                    role: msg.role || 'user',
                    content: msg.content,
                    displayContent: msg.displayContent, // Capture fallback text
                    analysis: msg.analysisData, // ✅ Now directly pulling the full structured object
                    file: msg.file || null,
                    createdAt: msg.createdAt
                }));
                setMessages(formattedMessages);
            }
        } catch (error) { toast.error("Error loading chat"); } finally { setLoading(false); }
    };

    const handleUpgradePlan = () => { setShowProfileDropdown(false); router.push('/pages/subscription?upgrade=true'); };
    const handleSettings = () => { setShowProfileDropdown(false); router.push('/pages/settings'); };
    const handleHelpCenter = () => { setShowProfileDropdown(false); router.push('/pages/help-center'); };
    const handleReleaseNotes = () => { setShowProfileDropdown(false); router.push('/pages/release-notes'); };
    const handleTerms = () => { setShowProfileDropdown(false); router.push('/pages/terms-policies'); };
    const handleReportBug = () => { setShowProfileDropdown(false); router.push('/pages/report-bug'); };
    const handleDeleteAccount = () => { setShowProfileDropdown(false); handleDeleteAccountClick(); };
    const handleToolClick = (toolId) => {
        if (toolId === 'doc_generator') {
            router.push('/pages/legal-doc-generator');
            return;
        }
        setActiveTool(toolId);
        if (window.innerWidth < 768) setSidebarOpen(false);
    };
    const handleCloseTool = () => { setActiveTool(null); };

    // 🚀 HANDLE SENDING AND PARSING RESPONSE
    const handleSend = async () => {
        if (!inputText.trim() && files.length === 0) return;
        const rawInput = inputText.trim();
        let textToSend = rawInput;
        const isQuestion = /^(can|could|would|is|are|do|does|what|where|when|who|why|how)/i.test(rawInput) || rawInput.endsWith("?");
        const isHello = isGreeting(rawInput);
        const isNewDocument = files.length > 0 || (rawInput.length > 200 && !isQuestion);

        if (isNewDocument) {
            textToSend = files.length > 0 ? (rawInput.trim() || "Analyze this document") : `Analyze: ${rawInput}`;
            if (files.length === 0) setDocumentContext(rawInput);
        }

        if (!isNewDocument && !documentContext && isHello) {
            setMessages(prev => [...prev, { role: "user", content: rawInput }]);
            setInputText(""); setIsGenerating(true);
            setTimeout(() => {
                const reply = getGreetingResponse(rawInput);
                setMessages(prev => [...prev, { role: "assistant", content: reply, createdAt: new Date().toISOString() }]);
                setIsGenerating(false);
                if (wasVoiceInput) speakText(reply);
                setWasVoiceInput(false);
            }, 200);
            return;
        }

        const fileNames = files.length > 0 ? files.map(f => f.name).join(', ') : null;
        setMessages(prev => [...prev, { role: "user", content: rawInput || "Analyze document", file: fileNames }]);

        const filesToProcess = [...files];
        setInputText(""); setFiles([]); setFile(null); setLoading(true);
        const isNewConversation = !chatId && !temporaryChat;

        try {
            let apiBody = { message: textToSend, chatId: temporaryChat ? null : chatId };
            if (!isNewDocument && documentContext) apiBody.documentText = documentContext;

            if (filesToProcess.length > 0) {
                setProcessingStage(0);
                let combinedText = '';
                for (let i = 0; i < filesToProcess.length; i++) {
                    const formData = new FormData();
                    formData.append("file", filesToProcess[i]);
                    const ocrRes = await fetch("/api/ocr", { method: "POST", body: formData });
                    if (!ocrRes.ok) throw new Error(`OCR Failed for ${filesToProcess[i].name}`);
                    const ocrData = await ocrRes.json();
                    combinedText += filesToProcess.length > 1 ? `\n\n--- Document ${i + 1}: ${filesToProcess[i].name} ---\n\n${ocrData.text}` : ocrData.text;
                }
                apiBody.documentText = combinedText; setDocumentContext(combinedText);
            }

            setProcessingStage(1);
            const headers = { "Content-Type": "application/json" };
            const token = localStorage.getItem('accessToken');
            if (token) headers['Authorization'] = `Bearer ${token}`; else if (guestId) headers['x-guest-id'] = guestId;

            const aiRes = await fetch("/api/generate-content", {
                method: "POST", headers, credentials: 'include', body: JSON.stringify(apiBody),
            });

            if (!aiRes.ok) {
                const errorData = await aiRes.json().catch(() => ({}));
                if (aiRes.status === 401) {
                    if (errorData.sessionExpired) toast.error("Session expired. Please login again.");
                    else toast.error("Authentication failed. Please login again.");
                    localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken');
                    setTimeout(() => router.push('/pages/login'), 1500);
                    throw new Error("Auth failed");
                }
                if (aiRes.status === 403 && errorData.isLimitReached) {
                    const limitInfo = { currentUsage: errorData.currentUsage, limit: errorData.limit, resetMessage: errorData.resetMessage, hoursUntilReset: errorData.hoursUntilReset, minutesUntilReset: errorData.minutesUntilReset };
                    setUsageLimitInfo(limitInfo);
                    toast.error(`Limit reached. ${limitInfo.resetMessage || 'Try again tomorrow'}`, { duration: 4000 });
                    setShowUsageLimitModal(true);
                    throw new Error("Limit reached");
                }
                throw new Error(errorData.error || "AI Failed");
            }
            const aiData = await aiRes.json();

            if (!temporaryChat && aiData.chatId) {
                setChatId(aiData.chatId);
                if (isNewConversation) fetchChats();
            }

            setProcessingStage(2);
            setTimeout(() => {
                setLoading(false);

                // ✅ Check if payload has structured analysis data (DecisionAnalysis JSON)
                if (aiData.data?.decisionSummary || (aiData.data?.clauses && aiData.data.clauses.length > 0)) {
                    setMessages(prev => [...prev, { role: "assistant", analysis: aiData.data }]);
                    if (wasVoiceInput && aiData.data?.executiveSummary) speakText(aiData.data.executiveSummary);
                } else {
                    // Fallback to text chat companion mode
                    const textResponse = aiData.data.response || aiData.data.summary || "Done.";
                    animateAssistantContent(textResponse);
                    if (wasVoiceInput) speakText(textResponse);
                }
                setWasVoiceInput(false);
            }, 300);
        } catch (error) {
            toast.error(error.message || "Error");
            setMessages(prev => [...prev, { role: "assistant", content: "Error processing request." }]);
            setLoading(false); setWasVoiceInput(false);
        }
    };

    if (isAuthChecking) return <div className="flex h-screen items-center justify-center bg-gray-50"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;

    return (
        <div className="chat-root flex h-screen bg-gray-50 text-gray-900 overflow-hidden relative font-sans" onDragEnter={handleDragEnter} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>

            {/* LIVE MODE OVERLAY */}
            {isLiveMode && (
                <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <button onClick={() => { setIsLiveMode(false); window.speechSynthesis.cancel(); recognitionRef.current?.stop(); setIsRecognitionRunning(false); setLiveStatus("idle"); }} className="absolute top-6 right-6 p-3 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-700 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                    <div className="flex flex-col items-center gap-8">
                        <div className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 ${liveStatus === 'listening' ? 'bg-blue-100 scale-110 shadow-[0_0_40px_rgba(59,130,246,0.3)]' : liveStatus === 'speaking' ? 'bg-green-100 scale-100 shadow-[0_0_40px_rgba(34,197,94,0.3)]' : liveStatus === 'thinking' ? 'bg-purple-100 animate-pulse' : 'bg-gray-100'}`}>
                            {liveStatus === 'listening' && <Mic className="w-16 h-16 text-blue-600 animate-bounce" />}
                            {liveStatus === 'speaking' && <Volume2 className="w-16 h-16 text-green-600 animate-pulse" />}
                            {liveStatus === 'thinking' && <Loader2 className="w-16 h-16 text-purple-600 animate-spin" />}
                            {liveStatus === 'idle' && <MicOff className="w-16 h-16 text-gray-400" />}
                        </div>
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-bold text-gray-900">{liveStatus === 'listening' ? "Aura is listening..." : liveStatus === 'speaking' ? "Aura is speaking..." : liveStatus === 'thinking' ? "Aura is thinking..." : "Tap to Speak with Aura"}</h2>
                            <p className="text-gray-600 font-medium flex items-center justify-center gap-1.5"><Sparkles className="w-4 h-4 text-blue-600 inline" /> Aura Realtime Voice Legal Consultation</p>
                        </div>
                        {liveStatus === 'idle' && (
                            <div className="flex flex-col items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <label className="text-sm font-medium text-gray-700">Language:</label>
                                    <select value={speechLanguage} onChange={(e) => setSpeechLanguage(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                                        <option value="hi-IN">🇮🇳 Hindi</option>
                                        <option value="en-IN">🇮🇳 English (India)</option>
                                        <option value="bn-IN">🇮🇳 Bengali</option>
                                        <option value="te-IN">🇮🇳 Telugu</option>
                                        <option value="mr-IN">🇮🇳 Marathi</option>
                                        <option value="ta-IN">🇮🇳 Tamil</option>
                                        <option value="gu-IN">🇮🇳 Gujarati</option>
                                        <option value="kn-IN">🇮🇳 Kannada</option>
                                        <option value="ml-IN">🇮🇳 Malayalam</option>
                                        <option value="pa-IN">🇮🇳 Punjabi</option>
                                    </select>
                                </div>
                                <p className="text-xs text-gray-400 text-center max-w-md">Speak in your preferred language. The AI will respond in the same language.</p>
                            </div>
                        )}
                        <div className="flex gap-6">
                            {liveStatus === 'idle' && <button disabled={isRecognitionRunning} onClick={startLiveLoop} className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg shadow-lg hover:bg-blue-700 hover:scale-105 transition-all">Start Talking</button>}
                            {liveStatus !== 'idle' && <button onClick={() => { recognitionRef.current?.stop(); window.speechSynthesis.cancel(); setLiveStatus("idle"); setIsRecognitionRunning(false); }} className="px-8 py-4 bg-red-50 text-red-600 border border-red-200 rounded-full font-bold text-lg hover:bg-red-100 transition-all">Stop</button>}
                        </div>
                    </div>
                </div>
            )}

            {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-20 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}

            {/* SIDEBAR */}
            <aside className={`fixed md:static inset-y-0 left-0 z-30 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col shadow-lg ${sidebarCollapsed ? 'md:w-16' : 'w-[280px]'}`}>
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    {!sidebarCollapsed && (
                        <>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                                    <Image src="/logo.svg" width={40} height={40} alt="Logo" className="w-9 h-9 " />
                                </div>
                                <span className="font-bold text-gray-900 text-lg tracking-tight">LegalAdvisor</span>
                            </div>
                            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-gray-900"><X className="w-5 h-5" /></button>
                        </>
                    )}
                    <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="hidden md:block p-2 hover:bg-gray-100 rounded-lg transition-colors" title={sidebarCollapsed ? "Expand" : "Collapse"}>
                        {sidebarCollapsed ? <ChevronRight className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
                    </button>
                </div>

                {!sidebarCollapsed && (
                    <div className="p-3 space-y-2">
                        <button onClick={handleNewChat} className="group w-full flex items-center justify-between px-3 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm">
                            <div className="flex items-center gap-2"><Plus className="w-4 h-4" /> New Chat</div>
                            <span className="bg-blue-700 text-[10px] px-1.5 py-0.5 rounded text-white">Ctrl+Shift+O</span>
                        </button>
                        <button
                            onClick={() => router.push('/pages/legal-consultation')}
                            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-blue-50/80 hover:bg-blue-100/80 text-blue-900 border border-blue-200/80 rounded-lg text-sm font-medium transition-all group cursor-pointer shadow-xs"
                        >
                            <div className="flex items-center gap-2">
                                <BrainCircuit className="w-4 h-4 text-blue-600" />
                                <span>Aura Voice Consult</span>
                            </div>
                            <span className="bg-blue-200/60 text-blue-800 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">Ctrl+Shift+L</span>
                        </button>
                        <button onClick={() => setShowSearchModal(true)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm bg-transparent hover:bg-gray-50 text-gray-600 hover:text-gray-900 border border-transparent hover:border-gray-200">
                            <div className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> <span>Search Chats</span></div>
                            <span className="text-[10px] text-gray-400">Ctrl+K</span>
                        </button>
                    </div>
                )}

                {sidebarCollapsed && (
                    <div className="p-2 space-y-2">
                        <button onClick={handleNewChat} className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"><Plus className="w-5 h-5 mx-auto" /></button>
                        <button
                            onClick={() => router.push('/pages/legal-consultation')}
                            className="w-full p-3 bg-blue-50/80 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition-all shadow-xs cursor-pointer"
                            title="Aura Voice Consult"
                        >
                            <BrainCircuit className="w-5 h-5 mx-auto text-blue-600" />
                        </button>
                        <button onClick={() => setShowSearchModal(true)} className="w-full p-3 hover:bg-gray-50 text-gray-600 rounded-lg transition-all"><MessageSquare className="w-5 h-5 mx-auto" /></button>
                    </div>
                )}

                {!sidebarCollapsed && (
                    <div className="px-3 py-1">
                        <button onClick={() => setToolsOpen(!toolsOpen)} className="w-full flex items-center justify-between p-2 text-xs font-semibold text-gray-500 hover:text-gray-700 uppercase tracking-wider transition-colors">
                            <span>Tools</span>{toolsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ${toolsOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="mt-1 space-y-0.5">
                                {toolItems.map((tool) => (
                                    <button key={tool.id} onClick={() => handleToolClick(tool.id)} className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-3 ${activeTool === tool.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'}`}>
                                        <tool.icon className="w-4 h-4" /> <span className="text-sm font-medium">{tool.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {sidebarCollapsed && (
                    <div className="px-2 py-1 space-y-1">
                        {toolItems.map((tool) => (
                            <button key={tool.id} onClick={() => handleToolClick(tool.id)} className={`w-full p-3 rounded-lg transition-all ${activeTool === tool.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-600'}`} title={tool.label}>
                                <tool.icon className="w-5 h-5 mx-auto" />
                            </button>
                        ))}
                    </div>
                )}

                {/* History */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2">
                    {!sidebarCollapsed && <p className="px-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent</p>}
                    <div className="space-y-0.5">
                        {chatHistory.map((chat) => (
                            <div key={chat.id} className="group relative">
                                <button onClick={() => handleLoadChat(chat.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-all truncate ${chatId === chat.id ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`} title={sidebarCollapsed ? chat.title : undefined}>
                                    <MessageSquare className="w-4 h-4 shrink-0" />
                                    {!sidebarCollapsed && <span className="truncate flex-1">{chat.title || "Untitled Chat"}</span>}
                                </button>
                                {!sidebarCollapsed && (
                                    <div className="absolute right-1 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => { e.stopPropagation(); document.querySelectorAll('.chat-menu').forEach(m => { if (m !== e.currentTarget.nextElementSibling) m.classList.add('hidden'); }); e.currentTarget.nextElementSibling.classList.toggle('hidden'); }} className="chat-menu-button p-1.5 text-gray-500 hover:bg-gray-100 rounded">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><circle cx="8" cy="3" r="1.5" /><circle cx="8" cy="8" r="1.5" /><circle cx="8" cy="13" r="1.5" /></svg>
                                        </button>
                                        <div className="chat-menu hidden absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px] z-50">
                                            <button onClick={(e) => { e.stopPropagation(); startRenameChat(e, chat.id, chat.title); e.currentTarget.parentElement.classList.add('hidden'); }} className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"><Plus className="w-4 h-4" /> Rename</button>
                                            <button onClick={(e) => { e.stopPropagation(); confirmDeleteChat(e, chat.id); e.currentTarget.parentElement.classList.add('hidden'); }} className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Delete</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="relative">
                        {!sidebarCollapsed ? (
                            <button onClick={() => setShowProfileDropdown(!showProfileDropdown)} className="w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                                <Avatar src={user?.avatar} fallback="U" size="sm" className="ring-1 ring-gray-200" />
                                <div className="flex-1 min-w-0 text-left"><p className="text-sm font-medium text-gray-900 truncate">{user?.name || "User"}</p></div>
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                            </button>
                        ) : (
                            <button onClick={() => setShowProfileDropdown(!showProfileDropdown)} className="w-full p-2 hover:bg-gray-50 rounded-lg transition-colors" title={user?.name || "User"}>
                                <Avatar src={user?.avatar} fallback="U" size="sm" className="ring-1 ring-gray-200 mx-auto" />
                            </button>
                        )}
                        <ProfileDropdown isOpen={showProfileDropdown} onClose={() => setShowProfileDropdown(false)} user={user} onUpgrade={handleUpgradePlan} onSettings={handleSettings} onLogout={handleLogoutClick} onDeleteAccount={handleDeleteAccount} onHelpCenter={handleHelpCenter} onReleaseNotes={handleReleaseNotes} onTerms={handleTerms} onReportBug={handleReportBug} position="top" />
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col h-full w-full relative bg-gray-50">
                {isDragging && (
                    <div className="fixed inset-0 z-50 bg-blue-500/10 backdrop-blur-sm flex items-center justify-center">
                        <div className="bg-white rounded-2xl p-8 shadow-2xl border-2 border-dashed border-blue-500">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center"><Paperclip className="w-10 h-10 text-blue-600" /></div>
                                <div className="text-center"><p className="text-xl font-bold text-gray-900 mb-1">Drop your file here</p><p className="text-sm text-gray-600">PDF or Image files supported</p></div>
                            </div>
                        </div>
                    </div>
                )}

                <header className="hidden md:flex absolute top-0 left-0 right-0 p-4 justify-between items-center z-20 pointer-events-none">
                    <div className="pointer-events-auto flex items-center gap-3">
                        {activeTool && <button onClick={handleCloseTool} className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm border shadow-sm"><ArrowLeft className="w-4 h-4" /> Back</button>}
                    </div>
                    <div className="pointer-events-auto">
                        <button onClick={handleUpgradePlan} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:opacity-90 shadow-lg"><Sparkles className="w-3.5 h-3.5" /> Upgrade Plan</button>
                    </div>
                    <div className="pointer-events-auto flex items-center gap-2">
                        {!activeTool && (
                            <button onClick={handleTemporaryChat} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border shadow-sm ${temporaryChat ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`} title="Temporary chat won't be saved">
                                <Clock className="w-4 h-4" /><span className="font-medium">Temporary</span>
                            </button>
                        )}
                        {!activeTool && (
                            <button onClick={handleShareChat} disabled={!chatId || temporaryChat || messages.length === 0} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border shadow-sm ${!chatId || temporaryChat || messages.length === 0 ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`} title="Share this chat">
                                <Share2 className="w-4 h-4" /><span className="font-medium">Share</span>
                            </button>
                        )}
                    </div>
                </header>

                <header className="md:hidden bg-white/80 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                    <button onClick={() => setSidebarOpen(true)} className="text-gray-700"><Menu className="w-6 h-6" /></button>
                    <div className="flex items-center gap-2">
                        {temporaryChat && <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-100 rounded-full"><Clock className="w-3.5 h-3.5 text-orange-600" /><span className="text-xs font-medium text-orange-700">Temporary</span></div>}
                        <span className="font-semibold text-gray-900">LegalAdvisor</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {chatId && !temporaryChat && messages.length > 0 && <button onClick={handleShareChat} className="text-gray-700"><Share2 className="w-5 h-5" /></button>}
                        <button onClick={() => setIsLiveMode(true)} className="text-gray-700"><Mic className="w-6 h-6" /></button>
                    </div>
                </header>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {activeTool ? (
                        <div className="w-full h-full p-6 text-gray-900">
                            {activeTool === 'compare_docs' && <ClauseComparison />}
                            {activeTool === 'glossary_tool' && <LegalGlossary />}
                            {activeTool === 'community_tool' && <LegalCommunity />}
                            {activeTool === 'chrome_extension' && <ChromeExtensionDownload />}
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto px-4 py-8 pt-20">
                            {temporaryChat && (
                                <div className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0"><Clock className="w-5 h-5 text-orange-600" /></div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-orange-900 mb-1">Temporary Chat</h3>
                                            <p className="text-sm text-orange-700">This chat won't appear in your chat history, and won't be used to train our models.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center min-h-[50vh] mt-8">
                                    {temporaryChat ? (
                                        <>
                                            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 shadow-xl border-2 border-orange-200"><Clock className="w-8 h-8 text-orange-600" /></div>
                                            <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">Temporary Chat</h2>
                                            <p className="text-gray-600 text-center mb-6 max-w-md">This chat won't appear in your chat history, and won't be used to train our models.</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 bg-blue-200 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                                                <Image src="/logo.svg" width={80} height={80} alt="Logo" className="relative z-10 w-20 h-20 animate-pulse" />
                                            </div>
                                            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                                                <TypeAnimation sequence={[`Hello ${user?.name?.split(' ')[0] || 'there'}`, 2000, "How can I help you today?", 2000]} wrapper="span" speed={50} repeat={Infinity} cursor={true} />
                                            </h2>
                                        </>
                                    )}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                                        {["Analyze NDA Risk", "Review Employment Contract", "Explain Indemnity Clause", "Summarize Lease Agreement"].map((suggestion) => (
                                            <button key={suggestion} onClick={() => setInputText(suggestion)} className="px-4 py-3.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-left truncate shadow-sm">
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8 pb-24">
                                    {messages.map((msg, idx) => (
                                        <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            {msg.role === 'assistant' && (
                                                <div className="w-8 h-8 rounded-sm bg-green-100 flex items-center justify-center shrink-0 border border-green-200 mt-1">
                                                    <Image src="/logo.svg" width={16} height={16} alt="AI" className="opacity-70" />
                                                </div>
                                            )}
                                            <div className={`w-full ${msg.role === 'user' ? 'max-w-[85%] sm:max-w-[80%] order-1' : 'order-2'}`}>
                                                {msg.role === 'user' ? (
                                                    <div className="bg-blue-600 text-white px-5 py-3 rounded-2xl rounded-tr-sm shadow-sm">
                                                        {msg.file && <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg mb-2 text-xs"><Paperclip className="w-3 h-3" /> {msg.file}</div>}
                                                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-700 leading-relaxed w-full">
                                                        {msg.analysis ? (
                                                            <div className="flex flex-col gap-2 w-full animate-in fade-in slide-in-from-bottom-2">
                                                                <ResultCard analysis={msg.analysis} />
                                                                <div className="flex gap-2 ml-2 mt-1">
                                                                    <button onClick={() => speakText(msg.analysis.executiveSummary || msg.analysis.decisionSummary?.finalDecision)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-full transition-colors" title="Read Aloud"><Volume2 className="w-5 h-5" /></button>
                                                                    {isSpeaking && <button onClick={stopSpeaking} className="p-1.5 text-red-400 hover:text-red-600 rounded-full transition-colors animate-pulse" title="Stop Speaking"><StopCircle className="w-5 h-5" /></button>}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col gap-1 items-start w-full max-w-3xl">
                                                                <div className="bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-sm px-6 py-5 shadow-sm w-full">
                                                                    <div className="markdown-content prose prose-gray max-w-none">
                                                                        <ReactMarkdown>{msg.content || msg.displayContent}</ReactMarkdown>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-2 ml-2 mt-1">
                                                                    <button onClick={() => speakText(msg.content)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-full transition-colors" title="Read Aloud"><Volume2 className="w-6 h-6" /></button>
                                                                    {isSpeaking && <button onClick={stopSpeaking} className="p-1.5 text-red-400 hover:text-red-600 rounded-full transition-colors animate-pulse" title="Stop Speaking"><StopCircle className="w-6 h-6" /></button>}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {loading && <div className="flex gap-4"><div className="w-8 h-8 rounded-sm bg-green-100 flex items-center justify-center shrink-0"><Loader2 className="w-4 h-4 text-green-600 animate-spin" /></div><span className="text-gray-600 animate-pulse mt-1">Analyzing Document...</span></div>}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Input Area */}
                {!activeTool && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent z-10">
                        <div className="max-w-3xl mx-auto">
                            {files.length > 0 && (
                                <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1">
                                    {files.map((file, index) => (
                                        <div key={index} className="relative group shrink-0">
                                            <div className="w-16 h-16 bg-white border-2 border-gray-200 rounded-xl shadow-sm flex items-center justify-center overflow-hidden">
                                                {file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf') ? (
                                                    <div className="flex flex-col items-center justify-center p-2">
                                                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>
                                                        <span className="text-[8px] text-gray-500 mt-0.5 font-medium">PDF</span>
                                                    </div>
                                                ) : (
                                                    <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" onLoad={(e) => URL.revokeObjectURL(e.target.src)} />
                                                )}
                                            </div>
                                            <button onClick={() => removeFile(index)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-900 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"><X className="w-3 h-3" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className={`bg-white border transition-all duration-200 rounded-2xl shadow-lg flex items-end gap-2 p-2 relative ${isRecording ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100'}`}>
                                <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"><PlusCircle className="w-5 h-5" /></button>
                                <input ref={fileInputRef} type="file" accept=".pdf,image/*" multiple onChange={(e) => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = ''; }} className="hidden" />
                                <textarea
                                    ref={textareaRef}
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!loading && !isGenerating) handleSend(); } }}
                                    placeholder={isRecording ? "Listening..." : files.length > 0 ? "Add specific instructions (optional)..." : "Analyze document or ask a question (Ctrl+V to paste)"}
                                    className="flex-1 bg-transparent resize-none border-none focus:ring-0 p-3 max-h-32 text-gray-900 placeholder-gray-400 text-base"
                                    rows={1}
                                />
                                <div className="flex items-center gap-1 pb-1 pr-1">
                                    <button onClick={toggleRecording} className={`p-2 rounded-xl transition-all ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'text-gray-500 hover:bg-gray-50'}`}>{isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}</button>
                                    <button onClick={handleSend} disabled={loading || (!inputText.trim() && files.length === 0) || isGenerating} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Modals... */}
            {chatToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-red-600" /></div>
                            <div><h3 className="text-lg font-bold text-gray-900">Delete Chat?</h3></div>
                        </div>
                        <p className="text-gray-700 mb-6">Are you sure you want to delete this chat? All messages and analysis will be permanently removed.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setChatToDelete(null)} disabled={isDeletingChat} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50">Cancel</button>
                            <button onClick={handleDeleteChat} disabled={isDeletingChat} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                {isDeletingChat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {chatToRename && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"><svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></div>
                            <div><h3 className="text-lg font-bold text-gray-900">Rename Chat</h3></div>
                        </div>
                        <div className="mb-6">
                            <input type="text" value={newChatTitle} onChange={(e) => setNewChatTitle(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !isRenamingChat) handleRenameChat(); }} placeholder="Enter chat title..." autoFocus className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => { setChatToRename(null); setNewChatTitle(""); }} disabled={isRenamingChat} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium disabled:opacity-50">Cancel</button>
                            <button onClick={handleRenameChat} disabled={isRenamingChat || !newChatTitle.trim()} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                                {isRenamingChat ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showShareModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-gray-900">Share Chat</h3><button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div>
                        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg mb-4"><CheckCircle className="w-5 h-5 text-green-600" /><p className="text-sm text-green-800 font-medium">Share link copied to clipboard!</p></div>
                        <p className="text-gray-600 text-sm mb-4">Anyone with this link can view this chat conversation.</p>
                        <button onClick={() => setShowShareModal(false)} className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">Got it</button>
                    </div>
                </div>
            )}

            {showSearchModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><MessageSquare className="w-5 h-5 text-blue-600" /></div><div><h3 className="text-lg font-bold text-gray-900">Search Chats</h3></div></div>
                            <button onClick={() => { setShowSearchModal(false); setSearchQuery(""); setSearchResults([]); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-4 border-b border-gray-200">
                            <div className="relative">
                                <input type="text" value={searchQuery} onChange={(e) => handleSearchChats(e.target.value)} placeholder="Type to search chats..." autoFocus className="w-full px-4 py-3 pl-11 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500" />
                                <MessageSquare className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                                {isSearching && <Loader2 className="absolute right-4 top-3.5 w-4 h-4 text-blue-600 animate-spin" />}
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            {!searchQuery ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-12"><div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"><MessageSquare className="w-8 h-8 text-gray-400" /></div><p className="text-gray-500 text-sm">Start typing to search your chats</p></div>
                            ) : searchQuery.trim().length < 2 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-12"><p className="text-gray-500 text-sm">Type at least 2 characters to search</p></div>
                            ) : isSearching ? (
                                <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
                            ) : searchResults.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-12"><p className="text-gray-900 font-medium mb-1">No chats found</p></div>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-xs text-gray-500 mb-3 px-2">Found {searchResults.length} {searchResults.length === 1 ? 'chat' : 'chats'}</p>
                                    {searchResults.map((chat) => (
                                        <button key={chat.id} onClick={() => { handleLoadChat(chat.id); setShowSearchModal(false); setSearchQuery(""); setSearchResults([]); }} className="w-full flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-all text-left group">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0"><MessageSquare className="w-5 h-5 text-blue-600" /></div>
                                            <div className="flex-1 min-w-0"><h4 className="font-medium text-gray-900 truncate mb-1">{chat.title || "Untitled Chat"}</h4><p className="text-sm text-gray-500 line-clamp-2">{chat.lastMessage}</p></div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showLogoutModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center"><LogOut className="w-6 h-6 text-red-600" /></div><div><h3 className="text-lg font-bold text-gray-900">Logout</h3></div></div>
                        <p className="text-gray-700 mb-6">You will be redirected to the login page.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowLogoutModal(false)} disabled={isLoggingOut} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium disabled:opacity-50">Cancel</button>
                            <button onClick={performLogout} disabled={isLoggingOut} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                                {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />} Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <DeleteAccountModal isOpen={showDeleteAccountModal} onClose={() => !isDeletingAccount && setShowDeleteAccountModal(false)} onConfirm={performDeleteAccount} isLoading={isDeletingAccount} />
            <UsageLimitReachedModal isOpen={showUsageLimitModal} onClose={() => setShowUsageLimitModal(false)} limitInfo={usageLimitInfo} onUpgrade={handleUpgradePlan} />
        </div>
    );
}