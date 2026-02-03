"use client";
import { useState, useRef, useEffect } from "react";
import { 
    Send, Paperclip, X, AlertCircle, Shield, 
    Plus, Lock, ArrowRight, Share2, Sparkles, FileText, ChevronDown, Check
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ShareChatModal from "@/components/chat-sharing/ShareChatModal";

// ============================================
// UTILITY: Guest ID Generator
// ============================================
const getGuestId = () => {
    if (typeof window === 'undefined') return '';
    let id = localStorage.getItem('guest_id');
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('guest_id', id);
    }
    return id;
};

// ============================================
// DATA NORMALIZER
// ============================================
function normalizeAnalysis(raw) {
    if (!raw) return null;
    return {
        summary: raw.summary || "Analysis complete.",
        clauses: (raw.clauses || []).map(c => {
            const rawLevel = c.risk_level ? c.risk_level.toLowerCase() : "low";
            let normalizedLevel = rawLevel;
            if (rawLevel === "critical") normalizedLevel = "high";
            if (rawLevel === "beneficial") normalizedLevel = "low";

            return {
                clause: c.clause_snippet || c.clause || "Clause text missing",
                risk_level: normalizedLevel,
                explanation: c.explanation || "No explanation provided.",
                recommendation: c.recommendation || "No recommendation."
            };
        }),
        missing_protections: raw.missing_clauses || []
    };
}

// ============================================
// MODAL: LIMIT REACHED
// ============================================
function LimitModal({ isOpen, router }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Lock className="w-10 h-10 text-white" />
                </div>
                
                <h3 className="text-2xl font-semibold text-gray-900 mb-3 text-center">Free Trial Complete</h3>
                <p className="text-gray-600 mb-8 leading-relaxed text-center">
                    You've explored the power of our AI legal advisor. Create a free account to continue analyzing documents and get unlimited access.
                </p>

                <div className="space-y-3">
                    <button 
                        onClick={() => router.push('/pages/signup')}
                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                        Create Free Account <ArrowRight className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => router.push('/')} 
                        className="w-full py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-xl transition-all"
                    >
                        Sign In Instead
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================
// FILE UPLOAD COMPONENTS
// ============================================
function FilePreview({ file, onRemove, index }) {
    return (
        <div className="group bg-white border border-gray-200 rounded-2xl p-3 flex items-center justify-between gap-3 hover:border-blue-300 hover:shadow-sm transition-all">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                    <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
            </div>
            <button 
                onClick={onRemove} 
                className="p-2 hover:bg-red-50 rounded-lg transition-all shrink-0 opacity-0 group-hover:opacity-100"
            >
                <X className="w-4 h-4 text-red-500" />
            </button>
        </div>
    );
}

function FileUploadArea({ files, onAdd, onRemove }) {
    const fileInputRef = useRef(null);
    
    if (files.length === 0) return null;
    
    return (
        <div className="mb-3 space-y-2">
            {files.map((file, idx) => (
                <FilePreview 
                    key={`${file.name}-${idx}`} 
                    file={file} 
                    index={idx} 
                    onRemove={() => onRemove(idx)} 
                />
            ))}
        </div>
    );
}

// ============================================
// TYPING INDICATOR
// ============================================
function TypingIndicator() {
    return (
        <div className="flex items-center gap-1.5 px-4 py-3">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
    );
}

function ProcessingIndicator({ stage }) {
    const stages = [
        { text: "Reading document", icon: "📄" },
        { text: "Analyzing clauses", icon: "🔍" },
        { text: "Finalizing results", icon: "✨" }
    ];
    
    return (
        <div className="flex items-center gap-3 px-4 py-3">
            <div className="relative">
                <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-xs">
                    {stages[stage].icon}
                </div>
            </div>
            <span className="text-sm text-gray-600 font-medium">{stages[stage].text}...</span>
        </div>
    );
}

// ============================================
// RESULT CARD COMPONENTS
// ============================================
function RiskBadge({ level, count, onClick }) {
    const styles = {
        low: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
        medium: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
        high: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
    };
    
    const icons = { 
        low: <div className="w-2 h-2 rounded-full bg-emerald-500"></div>, 
        medium: <div className="w-2 h-2 rounded-full bg-amber-500"></div>, 
        high: <div className="w-2 h-2 rounded-full bg-rose-500"></div>
    };
    
    return (
        <button 
            onClick={onClick} 
            className={`${styles[level]} border-2 px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2.5 transition-all shadow-sm hover:shadow-md`}
        >
            {icons[level]}
            <span className="capitalize">{level} Risk</span>
            <span className="bg-white/80 px-2.5 py-0.5 rounded-full text-xs font-bold ml-1">{count}</span>
        </button>
    );
}

function ResultCard({ analysis, scrollToClause }) {
    const riskCounts = {
        low: analysis.clauses.filter(c => c.risk_level === 'low').length,
        medium: analysis.clauses.filter(c => c.risk_level === 'medium').length,
        high: analysis.clauses.filter(c => c.risk_level === 'high').length
    };
    
    const overallRisk = riskCounts.high > 0 ? 'High' : riskCounts.medium > 2 ? 'Medium' : 'Low';
    
    const riskStyles = {
        High: { color: 'text-rose-600', bg: 'from-rose-50 to-rose-100', icon: '🚨' },
        Medium: { color: 'text-amber-600', bg: 'from-amber-50 to-amber-100', icon: '⚠️' },
        Low: { color: 'text-emerald-600', bg: 'from-emerald-50 to-emerald-100', icon: '✅' }
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
            {/* Header Section */}
            <div className={`bg-gradient-to-br ${riskStyles[overallRisk].bg} px-8 py-10 text-center border-b border-gray-200`}>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
                    <Shield className={`w-8 h-8 ${riskStyles[overallRisk].color}`} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    <span className="text-2xl mr-2">{riskStyles[overallRisk].icon}</span>
                    Overall Risk: {overallRisk}
                </h2>
                <p className="text-gray-700 text-base max-w-2xl mx-auto leading-relaxed">{analysis.summary}</p>
            </div>

            {/* Risk Badges */}
            <div className="px-8 py-6 flex flex-wrap gap-3 justify-center border-b border-gray-100">
                {['low', 'medium', 'high'].map(lvl => riskCounts[lvl] > 0 && (
                    <RiskBadge 
                        key={lvl} 
                        level={lvl} 
                        count={riskCounts[lvl]} 
                        onClick={() => scrollToClause(lvl)} 
                    />
                ))}
            </div>

            {/* Clauses Section */}
            <div className="px-8 py-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Identified Clauses</h3>
                    <span className="ml-auto text-sm text-gray-500">{analysis.clauses.length} total</span>
                </div>
                
                <div className="space-y-3">
                    {analysis.clauses.map((clause, idx) => {
                        const clauseStyles = {
                            high: { border: 'border-rose-200', bg: 'bg-rose-50/50', badge: 'bg-rose-100 text-rose-700' },
                            medium: { border: 'border-amber-200', bg: 'bg-amber-50/50', badge: 'bg-amber-100 text-amber-700' },
                            low: { border: 'border-emerald-200', bg: 'bg-emerald-50/50', badge: 'bg-emerald-100 text-emerald-700' }
                        };
                        
                        return (
                            <div 
                                key={idx} 
                                id={`clause-${clause.risk_level}-${idx}`}
                                className={`border-l-4 ${clauseStyles[clause.risk_level].border} ${clauseStyles[clause.risk_level].bg} p-5 rounded-xl hover:shadow-sm transition-all`}
                            >
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <h4 className="font-semibold text-gray-900 flex-1 leading-snug">
                                        {clause.clause}
                                    </h4>
                                    <span className={`${clauseStyles[clause.risk_level].badge} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shrink-0`}>
                                        {clause.risk_level}
                                    </span>
                                </div>
                                <p className="text-gray-700 leading-relaxed text-sm">
                                    {clause.explanation}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ============================================
// WELCOME SCREEN
// ============================================
function WelcomeScreen({ onFileClick }) {
    const suggestions = [
        { icon: "📄", text: "Review my employment contract" },
        { icon: "🏠", text: "Analyze lease agreement terms" },
        { icon: "💼", text: "Check NDA for red flags" },
        { icon: "🤝", text: "Explain partnership agreement" }
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12">
            <div className="max-w-2xl w-full text-center space-y-8">
                {/* Logo and Title */}
                <div className="space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl shadow-2xl mb-4">
                        <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                        Legal AI Assistant
                    </h1>
                    <p className="text-lg text-gray-600 max-w-md mx-auto">
                        Upload contracts, ask legal questions, and get instant AI-powered analysis
                    </p>
                </div>

                {/* Suggestion Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-xl mx-auto pt-4">
                    {suggestions.map((suggestion, idx) => (
                        <button
                            key={idx}
                            className="group p-4 bg-white border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all text-left"
                            onClick={() => {
                                // This will be handled by the parent component
                                const event = new CustomEvent('suggestion-click', { detail: suggestion.text });
                                window.dispatchEvent(event);
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{suggestion.icon}</span>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                    {suggestion.text}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Upload Prompt */}
                <div className="pt-4">
                    <button
                        onClick={onFileClick}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-2xl transition-all group"
                    >
                        <Paperclip className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                            Upload a document to get started
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function Try() {
    const router = useRouter(); 
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [processingStage, setProcessingStage] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => { getGuestId(); }, []);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    // Handle suggestion clicks
    useEffect(() => {
        const handleSuggestion = (e) => {
            setInputText(e.detail);
            textareaRef.current?.focus();
        };
        window.addEventListener('suggestion-click', handleSuggestion);
        return () => window.removeEventListener('suggestion-click', handleSuggestion);
    }, []);

    const animateAssistantContent = (fullText) => {
        const textToType = fullText || "I processed your request, but received no text response.";
        setIsGenerating(true);
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        let charIndex = 0;
        const speed = 10;

        const intervalId = setInterval(() => {
            charIndex += 2;
            if (charIndex >= textToType.length) {
                clearInterval(intervalId);
                setIsGenerating(false);
                setMessages(prev => {
                    const newArr = [...prev];
                    const lastIdx = newArr.length - 1;
                    if (lastIdx >= 0) newArr[lastIdx] = { ...newArr[lastIdx], content: textToType };
                    return newArr;
                });
            } else {
                setMessages(prev => {
                    const newArr = [...prev];
                    const lastIdx = newArr.length - 1;
                    if (lastIdx >= 0) newArr[lastIdx] = { ...newArr[lastIdx], content: textToType.slice(0, charIndex) };
                    return newArr;
                });
            }
        }, speed);
    };

    const handleSend = async () => {
        if (!inputText.trim() && files.length === 0) return;

        const textToSend = inputText || "Analyze this document";
        const guestId = getGuestId();

        setMessages(prev => [...prev, { role: "user", content: textToSend, files: files.map(f => f.name) }]);
        setInputText("");
        const currentFiles = [...files];
        setFiles([]);
        setLoading(true);

        try {
            let documentText = "";

            if (currentFiles.length > 0) {
                setProcessingStage(0);
                const formData = new FormData();
                currentFiles.forEach(file => formData.append("file", file));

                const ocrRes = await fetch("/api/ocr", { method: "POST", body: formData });
                if (!ocrRes.ok) throw new Error("OCR Upload failed");
                const ocrData = await ocrRes.json();
                documentText = ocrData.text;
            }

            setProcessingStage(1);
            
            const apiBody = {
                message: textToSend,
                ...(documentText && { documentText })
            };

            const aiRes = await fetch("/api/generate-content", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "x-guest-id": guestId
                },
                body: JSON.stringify(apiBody),
            });

            if (aiRes.status === 403) {
                const errorData = await aiRes.json();
                if (errorData.limitType === 'guest_limit') {
                    setShowLimitModal(true);
                }
                setLoading(false);
                return;
            }

            if (!aiRes.ok) throw new Error("AI Generation failed");

            const aiData = await aiRes.json();
            setProcessingStage(2);

            const hasClauses = aiData.data?.clauses && Array.isArray(aiData.data.clauses) && aiData.data.clauses.length > 0;

            setLoading(false);

            if (hasClauses) {
                const normalized = normalizeAnalysis(aiData.data);
                setMessages(prev => [...prev, { role: "assistant", analysis: normalized }]);
            } else {
                const responseText = 
                    aiData.data?.summary || 
                    aiData.data?.response || 
                    aiData.data?.text || 
                    (typeof aiData.data === 'string' ? aiData.data : "I processed the document but couldn't find specific risks to list.");
                
                animateAssistantContent(responseText);
            }

        } catch (error) {
            console.error("Handle Send Error:", error);
            setLoading(false);
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
        }
    };

    const scrollToClause = (riskLevel) => {
        const element = document.getElementById(`clause-${riskLevel}-0`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
        }
    }, [inputText]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
            
            <LimitModal isOpen={showLimitModal} router={router} />
            <ShareChatModal 
                isOpen={showShareModal} 
                onClose={() => setShowShareModal(false)} 
                chatId="guest-chat" 
                chatTitle="Legal Consultation (Guest)" 
            />

            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Image src="/logo.svg" width={24} height={24} alt="Logo" className="w-6 h-6 invert" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">Legal AI</h1>
                                <span className="text-xs text-gray-500 font-medium">Free Trial</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {messages.length > 0 && (
                                <>
                                    <button
                                        onClick={() => setShowShareModal(true)}
                                        className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        Share
                                    </button>
                                    <button
                                        onClick={() => { setMessages([]); setFiles([]); }}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span className="hidden sm:inline">New</span>
                                    </button>
                                </>
                            )}
                            <button 
                                onClick={() => router.push('/')} 
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-all hidden sm:block"
                            >
                                Sign In
                            </button>
                            <button 
                                onClick={() => router.push('/pages/signup')} 
                                className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Chat Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    {messages.length === 0 ? (
                        <WelcomeScreen onFileClick={() => fileInputRef.current?.click()} />
                    ) : (
                        <div className="space-y-6 py-8 pb-32">
                            {messages.map((msg, idx) => (
                                <div 
                                    key={idx} 
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    {msg.role === 'user' ? (
                                        <div className="flex gap-3 max-w-3xl">
                                            <div className="flex-1">
                                                {msg.files && msg.files.length > 0 && (
                                                    <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
                                                        <FileText className="w-3.5 h-3.5" />
                                                        <span>{msg.files[0]}</span>
                                                    </div>
                                                )}
                                                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-3xl rounded-tr-md px-6 py-4 shadow-lg">
                                                    <p className="leading-relaxed">{msg.content}</p>
                                                </div>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-1">
                                                <span className="text-sm">👤</span>
                                            </div>
                                        </div>
                                    ) : msg.analysis ? (
                                        <div className="flex gap-3 w-full max-w-3xl">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 mt-1 shadow-lg">
                                                <Sparkles className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <ResultCard analysis={msg.analysis} scrollToClause={scrollToClause} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-3 max-w-3xl w-full">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 mt-1 shadow-lg">
                                                <Sparkles className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="flex-1 bg-white border border-gray-200 rounded-3xl rounded-tl-md px-6 py-4 shadow-sm">
                                                <p className="text-gray-800 leading-relaxed">{msg.content}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            
                            {loading && (
                                <div className="flex gap-3 animate-in fade-in duration-300">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-3xl rounded-tl-md shadow-sm">
                                        {files.length > 0 ? <ProcessingIndicator stage={processingStage} /> : <TypingIndicator />}
                                    </div>
                                </div>
                            )}
                            
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>
            </div>

            {/* Input Area - Fixed at Bottom */}
            <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent pt-6 pb-6">
                <div className="max-w-3xl mx-auto px-4 sm:px-6">
                    <FileUploadArea 
                        files={files} 
                        onAdd={(f) => setFiles(prev => [...prev, f])} 
                        onRemove={(i) => setFiles(p => p.filter((_, idx) => idx !== i))} 
                    />
                    
                    <div className="relative">
                        <div className="bg-white border-2 border-gray-200 hover:border-gray-300 focus-within:border-blue-500 rounded-3xl shadow-lg hover:shadow-xl transition-all flex items-end gap-2 p-2">
                            <input 
                                ref={fileInputRef} 
                                type="file" 
                                accept=".pdf,image/*" 
                                multiple 
                                onChange={(e) => { 
                                    const s = Array.from(e.target.files); 
                                    if(files.length+s.length>2) return alert("Maximum 2 files allowed"); 
                                    setFiles(p=>[...p,...s]); 
                                    e.target.value=''; 
                                }} 
                                className="hidden" 
                            />
                            
                            <button 
                                onClick={() => fileInputRef.current?.click()} 
                                className="p-3 hover:bg-gray-100 rounded-2xl text-gray-500 hover:text-gray-700 transition-all shrink-0"
                                title="Attach file"
                            >
                                <Paperclip className="w-5 h-5" />
                            </button>
                            
                            <textarea 
                                ref={textareaRef}
                                value={inputText} 
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey && !isGenerating && !loading) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Ask anything about your legal document..." 
                                className="flex-1 bg-transparent resize-none outline-none py-3 px-2 text-gray-900 placeholder-gray-400 max-h-[200px] min-h-[24px]"
                                rows={1}
                                style={{ lineHeight: '1.5' }}
                            />
                            
                            <button 
                                onClick={handleSend} 
                                disabled={isGenerating || loading || (!inputText.trim() && !files.length)} 
                                className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none shrink-0"
                                title="Send message"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <p className="text-xs text-center text-gray-400 mt-3">
                            Free trial • Your data is not saved
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}