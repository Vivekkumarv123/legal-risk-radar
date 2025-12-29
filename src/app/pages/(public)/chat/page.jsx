"use client";
import { useState, useRef, useEffect } from "react";
import { TypeAnimation } from "react-type-animation";
import { 
    Mic, MicOff, Send, Paperclip, X, AlertCircle, Shield, 
    Menu, LogOut, MessageSquare, User, Plus, Lock, ArrowRight 
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
// MODAL: LIMIT REACHED (NEW)
// ============================================
function LimitModal({ isOpen, router }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 scale-100 animate-in zoom-in-95 duration-300 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-8 h-8 text-blue-600" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Free Limit Reached</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                    You have used your free tries for today. To continue analyzing documents and asking questions, please create a free account.
                </p>

                <div className="space-y-3">
                    <button 
                        onClick={() => router.push('/pages/signup')} // Redirect to Login/Signup
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2"
                    >
                        Create Free Account <ArrowRight className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => router.push('/')} 
                        className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                    >
                        Log In
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================
// FILE UPLOAD COMPONENTS (Kept same as provided)
// ============================================
function FilePreview({ file, onRemove, index }) {
    return (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
                    <Paperclip className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
            </div>
            <button onClick={onRemove} className="p-1.5 hover:bg-blue-200 rounded-lg transition-all shrink-0">
                <X className="w-4 h-4 text-gray-600" />
            </button>
        </div>
    );
}

function FileUploadArea({ files, onAdd, onRemove }) {
    const fileInputRef = useRef(null);
    return (
        <div className="mb-3 space-y-2">
            <div className="flex flex-col gap-2">
                {files.map((file, idx) => (
                    <FilePreview key={`${file.name}-${idx}`} file={file} index={idx} onRemove={() => onRemove(idx)} />
                ))}
            </div>
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/*"
                multiple
                onChange={(e) => {
                    const selected = Array.from(e.target.files);
                    if (files.length + selected.length > 2) return alert("Max 2 files allowed");
                    selected.forEach(f => onAdd(f));
                    e.target.value = '';
                }}
                className="hidden"
            />
        </div>
    );
}

// ============================================
// INDICATORS (Kept same)
// ============================================
function TypingIndicator() {
    return (
        <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
    );
}

function ProcessingIndicator({ stage }) {
    const stages = ["Reading document...", "Analyzing risks...", "Finalizing results..."];
    return (
        <div className="flex items-center gap-3 py-2">
            <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-sm text-gray-600">{stages[stage]}</span>
        </div>
    );
}

// ============================================
// RESULT COMPONENTS (Kept same)
// ============================================
function RiskBadge({ level, count, onClick }) {
    const styles = {
        low: "bg-green-100 text-green-700 border-green-300",
        medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
        high: "bg-red-100 text-red-700 border-red-300"
    };
    const icons = { low: "🟢", medium: "🟡", high: "🔴" };
    return (
        <button onClick={onClick} className={`${styles[level]} border px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 hover:shadow-md transition-all`}>
            <span>{icons[level]}</span>
            <span className="capitalize">{level} Risk</span>
            <span className="bg-white bg-opacity-70 px-2 py-0.5 rounded-full text-xs font-semibold">{count}</span>
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
    const riskColor = overallRisk === 'High' ? 'text-red-600' : overallRisk === 'Medium' ? 'text-yellow-600' : 'text-green-600';

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 max-w-3xl shadow-sm">
            <div className="text-center py-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                <Shield className={`w-16 h-16 mx-auto mb-3 ${riskColor}`} />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Overall Risk: {overallRisk}</h2>
                <p className="text-gray-600 px-6 max-w-2xl mx-auto">{analysis.summary}</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
                {['low', 'medium', 'high'].map(lvl => riskCounts[lvl] > 0 && (
                    <RiskBadge key={lvl} level={lvl} count={riskCounts[lvl]} onClick={() => scrollToClause(lvl)} />
                ))}
            </div>
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><AlertCircle className="w-5 h-5" /> Identified Clauses</h3>
                {analysis.clauses.map((clause, idx) => (
                    <div key={idx} id={`clause-${clause.risk_level}-${idx}`} className={`border-l-4 p-4 rounded-lg ${clause.risk_level === 'high' ? 'border-red-500 bg-red-50' : clause.risk_level === 'medium' ? 'border-yellow-500 bg-yellow-50' : 'border-green-500 bg-green-50'}`}>
                        <div className="flex items-start justify-between gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900 text-sm flex-1">{clause.clause}</h4>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${clause.risk_level === 'high' ? 'bg-red-200 text-red-800' : clause.risk_level === 'medium' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>{clause.risk_level}</span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">{clause.explanation}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================
// MAIN PAGE COMPONENT (Try)
// ============================================

export default function Try() {
    const router = useRouter(); 
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [processingStage, setProcessingStage] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // NEW: Limit State
    const [showLimitModal, setShowLimitModal] = useState(false);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);

    // Initialize Guest ID
    useEffect(() => {
        getGuestId(); 
    }, []);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const animateAssistantContent = (fullText) => {
        if (!fullText) {
            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
            setIsGenerating(false);
            return;
        }
        let msgIdx = -1;
        setMessages(prev => {
            const newArr = [...prev, { role: 'assistant', content: '' }];
            msgIdx = newArr.length - 1;
            return newArr;
        });
        let charIndex = 0;
        const step = () => {
            if (!isGenerating) return;
            charIndex += 2;
            const current = fullText.slice(0, charIndex);
            setMessages(prev => {
                const copy = [...prev];
                if (copy[msgIdx]) copy[msgIdx] = { ...copy[msgIdx], content: current };
                return copy;
            });
            if (charIndex < fullText.length) setTimeout(step, 20);
            else setIsGenerating(false);
        };
        step();
    };

    const handleSend = async () => {
        if (!inputText.trim() && files.length === 0) return;

        const textToSend = inputText || "Analyze this document";
        const guestId = getGuestId(); // Get ID

        // Add user message
        setMessages(prev => [...prev, { role: "user", content: textToSend, files: files.map(f => f.name) }]);
        setInputText("");
        const currentFiles = [...files];
        setFiles([]);
        setLoading(true);
        setIsGenerating(true);

        try {
            if (currentFiles.length > 0) {
                // 1. OCR Upload
                setProcessingStage(0);
                const formData = new FormData();
                currentFiles.forEach(file => formData.append("file", file));

                const ocrRes = await fetch("/api/ocr", { method: "POST", body: formData });
                const ocrData = await ocrRes.json();

                // 2. AI Analysis
                setProcessingStage(1);
                const aiRes = await fetch("/api/generate-content", {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "x-guest-id": guestId // PASS GUEST ID
                    },
                    body: JSON.stringify({ documentText: ocrData.text, message: textToSend }),
                });

                // HANDLE LIMIT REACHED
                if (aiRes.status === 403) {
                    setLoading(false);
                    setIsGenerating(false);
                    setShowLimitModal(true); // Open Modal
                    return;
                }

                const aiData = await aiRes.json();
                setProcessingStage(2);
                
                const normalized = normalizeAnalysis(aiData.data);
                setMessages(prev => [...prev, { role: "assistant", analysis: normalized }]);
                
            } else {
                // Text Only
                const aiRes = await fetch("/api/generate-content", {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "x-guest-id": guestId // PASS GUEST ID
                    },
                    body: JSON.stringify({ message: textToSend }),
                });

                // HANDLE LIMIT REACHED
                if (aiRes.status === 403) {
                    setLoading(false);
                    setIsGenerating(false);
                    setShowLimitModal(true); // Open Modal
                    return;
                }

                const data = await aiRes.json();
                let content = data.data?.summary || data.data?.response || JSON.stringify(data.data);
                animateAssistantContent(content);
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, error processing request." }]);
        } finally {
            setLoading(false);
            if(files.length > 0) setIsGenerating(false); // Text animation handles its own state
        }
    };

    const scrollToClause = (riskLevel) => {
        const element = document.getElementById(`clause-${riskLevel}-0`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const handleNewChat = () => {
        setMessages([]);
        setFiles([]);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col relative">
            
            {/* LIMIT REACHED MODAL */}
            <LimitModal isOpen={showLimitModal} router={router} />

            {/* Header */}
            <header className="border-b border-gray-200 sticky top-0 z-10 bg-white/80 backdrop-blur-md">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Image src="/logo.svg" width={40} height={40} alt="Logo" className="w-10 h-10" />
                        <h1 className="text-xl font-bold text-gray-900">Legal Advisor <span className="text-blue-600 text-sm font-normal bg-blue-50 px-2 py-0.5 rounded-full ml-2">Free Trial</span></h1>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => router.push('/')} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">Log In</button>
                        <button onClick={() => router.push('/pages/signup')} className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm">Sign Up Free</button>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center mt-10">
                            <Image src="/logo.svg" width={80} height={80} alt="Logo" className="mb-6 opacity-90" />
                            <h2 className="text-3xl font-bold text-gray-900 mb-3">Try Legal AI for Free</h2>
                            <p className="text-gray-500 max-w-md">Upload a contract snippet or ask a legal question to see how it works. (Limited to 3 tries)</p>
                        </div>
                    ) : (
                        <div className="space-y-6 pb-20">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'user' ? (
                                        <div className="bg-blue-600 text-white rounded-2xl px-5 py-3 max-w-2xl shadow-sm">
                                            {msg.files && msg.files.length > 0 && (
                                                <div className="text-xs text-blue-100 mb-2 flex items-center gap-2"><Paperclip className="w-3 h-3" /> {msg.files[0]}</div>
                                            )}
                                            <p>{msg.content}</p>
                                        </div>
                                    ) : msg.analysis ? (
                                        <ResultCard analysis={msg.analysis} scrollToClause={scrollToClause} />
                                    ) : (
                                        <div className="bg-white border border-gray-200 text-gray-800 rounded-2xl px-6 py-4 max-w-3xl shadow-sm"><p>{msg.content}</p></div>
                                    )}
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 rounded-2xl px-5 py-3">
                                        {files.length > 0 ? <ProcessingIndicator stage={processingStage} /> : <TypingIndicator />}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="pb-6 pt-4 bg-transparent">
                <div className="max-w-3xl mx-auto px-4">
                    <FileUploadArea files={files} onAdd={(f) => setFiles(prev => [...prev, f])} onRemove={(i) => setFiles(p => p.filter((_, idx) => idx !== i))} />
                    
                    <div className="bg-white border border-gray-300 rounded-3xl shadow-lg flex items-end gap-2 p-3">
                        <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><Paperclip className="w-5 h-5" /></button>
                        <input ref={fileInputRef} type="file" accept=".pdf,image/*" multiple onChange={(e) => { const s = Array.from(e.target.files); if(files.length+s.length>2)return; setFiles(p=>[...p,...s]); e.target.value=''; }} className="hidden" />
                        
                        <textarea 
                            ref={textareaRef}
                            value={inputText} 
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && !isGenerating && (e.preventDefault(), handleSend())}
                            placeholder="Ask legal questions..." 
                            className="flex-1 bg-transparent resize-none outline-none py-2 max-h-32 text-gray-900"
                            rows={1}
                        />
                        
                        <button onClick={handleSend} disabled={isGenerating || loading || (!inputText && !files.length)} className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-all"><Send className="w-5 h-5" /></button>
                    </div>
                    <p className="text-xs text-center text-gray-400 mt-2">Free trial mode. Data is not saved to an account.</p>
                </div>
            </div>
        </div>
    );
}