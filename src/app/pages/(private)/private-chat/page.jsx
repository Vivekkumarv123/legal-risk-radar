"use client";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { TypeAnimation } from "react-type-animation";
import { 
    Mic, MicOff, Send, Paperclip, X, AlertCircle, Shield, 
    Menu, LogOut, MessageSquare, User, Plus, AlertTriangle, 
    Loader2, Clock, Trash2 
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// ==========================================
// SUB-COMPONENTS (Unchanged)
// ==========================================

function LogoutModal({ isOpen, onClose, onConfirm, isLoading }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Log out?</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        Are you sure you want to log out? Your current session history will be cleared from this device.
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
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Log out"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function UploadBox({ onCancel, file }) {
    if (!file) return null;
    return (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between mb-3 max-w-md w-full mx-auto animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Paperclip className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <p className="font-medium text-gray-900 text-sm truncate max-w-50">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
            </div>
            <button onClick={onCancel} className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors">
                <X className="w-4 h-4 text-gray-600" />
            </button>
        </div>
    );
}

function ProcessingLoader({ stage }) {
    const stages = [
        { label: "Reading document...", icon: "📄" },
        { label: "Analyzing risks...", icon: "🔍" },
        { label: "Finalizing results...", icon: "✨" }
    ];

    return (
        <div className="flex flex-col items-center justify-center py-8">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-medium text-gray-700 flex items-center gap-2 animate-pulse">
                <span>{stages[stage]?.icon}</span>
                {stages[stage]?.label}
            </p>
        </div>
    );
}

function RiskBadge({ level, count, onClick }) {
    const styles = {
        low: "bg-green-100 text-green-700 border-green-200 hover:bg-green-200",
        medium: "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200",
        high: "bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
    };
    const icons = { low: "🟢", medium: "🟡", high: "🔴" };

    return (
        <button
            onClick={onClick}
            className={`${styles[level]} border px-3 py-1.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors`}
        >
            <span className="text-xs">{icons[level]}</span>
            <span className="capitalize">{level}</span>
            <span className="bg-white/60 px-1.5 py-0.5 rounded text-xs ml-1">{count}</span>
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
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm w-full overflow-hidden">
            <div className="p-6 bg-linaer-to-br from-gray-50 to-white border-b border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                    <Shield className={`w-8 h-8 ${riskColor}`} />
                    <h2 className="text-xl font-bold text-gray-900">Risk Level: {overallRisk}</h2>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{analysis.summary}</p>
            </div>

            <div className="p-4 bg-gray-50/50 flex flex-wrap gap-2 border-b border-gray-100">
                {riskCounts.high > 0 && <RiskBadge level="high" count={riskCounts.high} onClick={() => scrollToClause('high')} />}
                {riskCounts.medium > 0 && <RiskBadge level="medium" count={riskCounts.medium} onClick={() => scrollToClause('medium')} />}
                {riskCounts.low > 0 && <RiskBadge level="low" count={riskCounts.low} onClick={() => scrollToClause('low')} />}
            </div>

            <div className="p-6 space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Analyzed Clauses
                </h3>
                {analysis.clauses.map((clause, idx) => (
                    <div key={idx} id={`clause-${clause.risk_level}-${idx}`} 
                        className={`p-4 rounded-xl border ${
                            clause.risk_level === 'high' ? 'bg-red-50 border-red-100' :
                            clause.risk_level === 'medium' ? 'bg-yellow-50 border-yellow-100' :
                            'bg-green-50 border-green-100'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-2 gap-2">
                            <h4 className="font-semibold text-gray-900 text-sm">{clause.clause}</h4>
                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                                clause.risk_level === 'high' ? 'bg-red-200 text-red-800' :
                                clause.risk_level === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                                'bg-green-200 text-green-800'
                            }`}>
                                {clause.risk_level}
                            </span>
                        </div>
                        <p className="text-gray-700 text-sm">{clause.explanation}</p>
                    </div>
                ))}
            </div>

            {analysis.missing_protections?.length > 0 && (
                <div className="p-6 bg-orange-50 border-t border-orange-100">
                    <h3 className="text-sm font-semibold text-orange-800 mb-3 flex items-center gap-2">
                        Missing Protections
                    </h3>
                    <ul className="space-y-2">
                        {analysis.missing_protections.map((prot, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="text-orange-500 mt-1">•</span>
                                {prot}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function RecordingWave({ analyserRef, dataArrayRef, isRecording }) {
    const bars = 15;
    const barRefs = useRef([]);

    useEffect(() => {
        let rafId;
        const render = () => {
            if (analyserRef?.current && dataArrayRef?.current) {
                analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
                const data = dataArrayRef.current;
                const segment = Math.floor(data.length / bars);
                
                for (let i = 0; i < bars; i++) {
                    let sum = 0;
                    for (let j = 0; j < segment; j++) sum += Math.abs(data[i * segment + j] - 128);
                    const height = Math.min(1, (sum / segment) / 32); 
                    if (barRefs.current[i]) {
                        barRefs.current[i].style.transform = `scaleY(${0.2 + height * 2})`;
                    }
                }
            } else {
                for (let i = 0; i < bars; i++) {
                    if (barRefs.current[i]) {
                        const h = 0.2 + Math.random() * 0.3;
                        barRefs.current[i].style.transform = `scaleY(${h})`;
                    }
                }
            }
            rafId = requestAnimationFrame(render);
        };
        if (isRecording) render();
        return () => cancelAnimationFrame(rafId);
    }, [analyserRef, dataArrayRef, isRecording]);

    return (
        <div className="flex items-center gap-0.5 h-6">
            {Array.from({ length: bars }).map((_, i) => (
                <div
                    key={i}
                    ref={el => (barRefs.current[i] = el)}
                    className="w-1 bg-red-500 rounded-full h-full transition-transform duration-75"
                    style={{ transform: 'scaleY(0.2)' }}
                />
            ))}
        </div>
    );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function Home() {
    const router = useRouter(); 
    
    // STATE
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [processingStage, setProcessingStage] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isAuthChecking, setIsAuthChecking] = useState(true); 
    const [user, setUser] = useState(null); 
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [chatId, setChatId] = useState(null); 
    
    // Chat History State
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [deletingChatId, setDeletingChatId] = useState(null); // Tracks delete loading state

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

    // ==========================================
    // DATA FETCHING FUNCTIONS
    // ==========================================

    const fetchChats = async () => {
        setIsLoadingHistory(true);
        try {
            const res = await fetch('/api/chats', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setChatHistory(data.chats);
                }
            }
        } catch (error) {
            console.error("Error fetching chats:", error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    // Handle Delete Chat
    const handleDeleteChat = async (e, chatIdToDelete) => {
        // Prevent bubbling so it doesn't try to load the chat
        e.stopPropagation();
        
        if (!confirm("Are you sure you want to delete this chat? This cannot be undone.")) return;

        setDeletingChatId(chatIdToDelete);

        try {
            // Assuming your delete endpoint is at /api/chat/delete?chatId=...
            const res = await fetch(`/api/chats/delete?chatId=${chatIdToDelete}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Chat deleted");
                
                // Optimistically update UI
                setChatHistory(prev => prev.filter(chat => chat.id !== chatIdToDelete));

                // If deleted active chat, start new one
                if (chatId === chatIdToDelete) {
                    handleNewChat();
                }
            } else {
                throw new Error(data.error || "Failed to delete");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete chat");
        } finally {
            setDeletingChatId(null);
        }
    };

    const handleLoadChat = async (id) => {
        if (id === chatId) return; 
        
        setLoading(true);
        setSidebarOpen(false); 
        
        try {
            const res = await fetch(`/api/chats/${id}`);
            const data = await res.json();
            
            if (data.success) {
                setChatId(id);
                // Ensure messages match frontend structure
                const formattedMessages = data.messages.map(msg => {
                    let analysis = null;

                    if (msg.analysisData) {
                        analysis = {
                            summary: msg.analysisData.summary,
                            overall_risk_score: msg.analysisData.overall_risk_score,
                            missing_protections: msg.analysisData.missing_clauses || [],
                            clauses: Array.isArray(msg.analysisData.clauses) 
                                ? msg.analysisData.clauses.map(c => ({
                                    ...c,
                                    clause: c.clause_snippet || c.clause,
                                    risk_level: c.risk_level,
                                    explanation: c.explanation
                                }))
                                : []
                        };
                    } else if (msg.analysis) {
                        analysis = msg.analysis;
                    }

                    return {
                        role: msg.role || 'user',
                        content: msg.content,
                        analysis: analysis,
                        file: msg.file || null,
                        createdAt: msg.createdAt
                    };
                });

                setMessages(formattedMessages);
            } else {
                toast.error("Failed to load chat");
            }
        } catch (error) {
            console.error("Error loading chat:", error);
            toast.error("Error loading chat");
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // AUTH & SETUP
    // ==========================================
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/me', { cache: 'no-store' }); 
                if (!res.ok) throw new Error("Unauthorized");
                const data = await res.json();
                setUser(data.user); 
                
                fetchChats();
            } catch (error) {
                console.log("Redirecting to login...");
                router.push('/'); 
            } finally {
                setIsAuthChecking(false);
            }
        };
        checkAuth();
    }, [router]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading, isGenerating]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [inputText]);

    // Voice Setup
    useEffect(() => {
        if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.onresult = (event) => {
                const transcript = Array.from(event.results).map(r => r[0].transcript).join('');
                setInputText(transcript);
            };
            recognitionRef.current.onerror = () => setIsRecording(false);
        }
    }, []);

    // Cleanup
    useEffect(() => {
        return () => {
            if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(t => t.stop());
            if (audioContextRef.current) audioContextRef.current.close();
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    // ==========================================
    // ACTION HANDLERS
    // ==========================================

    const handleFileUpload = (uploadedFile) => {
        setFile(uploadedFile);
    };

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
        } else {
            recognitionRef.current?.start();
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
                    mediaStreamRef.current = stream;
                    const AudioContext = window.AudioContext || window.webkitAudioContext;
                    const audioCtx = new AudioContext();
                    audioContextRef.current = audioCtx;
                    const source = audioCtx.createMediaStreamSource(stream);
                    const analyser = audioCtx.createAnalyser();
                    analyser.fftSize = 256;
                    analyserRef.current = analyser;
                    dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
                    source.connect(analyser);
                    setIsRecording(true);
                }).catch(err => {
                    console.warn('Audio Error:', err);
                });
            }
        }
    };

    const animateAssistantContent = (fullText) => {
        setIsGenerating(true);
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
        
        let charIndex = 0;
        const interval = setInterval(() => {
            charIndex += 3; // Typing speed
            if (charIndex >= fullText.length) {
                clearInterval(interval);
                setIsGenerating(false);
                setMessages(prev => {
                    const newArr = [...prev];
                    newArr[newArr.length - 1].content = fullText;
                    return newArr;
                });
            } else {
                setMessages(prev => {
                    const newArr = [...prev];
                    newArr[newArr.length - 1].content = fullText.slice(0, charIndex);
                    return newArr;
                });
            }
        }, 10);
    };

    const handleNewChat = () => {
        setMessages([]);
        setInputText("");
        setFile(null);
        setChatId(null); 
        setSidebarOpen(false); 
        toast.success("New chat started");
    };

    const handleLogoutClick = () => setShowLogoutModal(true);

    const performLogout = async () => {
        setIsLoggingOut(true);
        try {
            const res = await fetch('/api/auth/logout', { method: 'POST' });
            if (res.ok) {
                toast.success('Logged out successfully');
                setTimeout(() => {
                    setShowLogoutModal(false);
                    router.push('/');
                }, 1000);
            } else {
                throw new Error("Logout Failed");
            }
        } catch {
            toast.error('Logout failed');
            setIsLoggingOut(false);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim() && !file) return;

        const textToSend = inputText || "Analyze this document";
        
        // Optimistic UI Update
        const userMsg = { role: "user", content: textToSend, file: file?.name };
        setMessages(prev => [...prev, userMsg]);
        setInputText("");
        setLoading(true);

        const isNewConversation = !chatId;

        try {
            let apiBody = { 
                message: textToSend,
                chatId: chatId 
            };

            // 1. OCR Step
            if (file) {
                setProcessingStage(0);
                const formData = new FormData();
                formData.append("file", file);
                
                const ocrRes = await fetch("/api/ocr", { method: "POST", body: formData });
                if (!ocrRes.ok) throw new Error("OCR Failed");
                const ocrData = await ocrRes.json();
                
                apiBody.documentText = ocrData.text; 
            }

            // 2. AI Generation
            setProcessingStage(1);
            const aiRes = await fetch("/api/generate-content", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(apiBody),
            });

            if (!aiRes.ok) {
                const errorData = await aiRes.json();
                throw new Error(errorData.error || "AI Processing Failed");
            }
            
            const aiData = await aiRes.json();

            // Capture new ChatID from backend
            if (aiData.chatId) {
                setChatId(aiData.chatId);
                if (isNewConversation) {
                    fetchChats(); 
                }
            }

            setProcessingStage(2); 
            
            setTimeout(() => {
                setLoading(false);
                setFile(null); 

                if (aiData.data.clauses && aiData.data.clauses.length > 0) {
                    setMessages(prev => [...prev, { role: "assistant", analysis: aiData.data }]);
                } else {
                    const textResponse = aiData.data.summary || aiData.data.response || "I processed your request.";
                    animateAssistantContent(textResponse);
                }
            }, 600);

        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error processing your request." }]);
            setLoading(false);
        }
    };

    const scrollToClause = (riskLevel) => {
        const element = document.getElementById(`clause-${riskLevel}-0`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    // ==========================================
    // RENDER
    // ==========================================

    if (isAuthChecking) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-gray-500 font-medium animate-pulse">Verifying secure access...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden relative font-sans">
            <LogoutModal 
                isOpen={showLogoutModal} 
                onClose={() => !isLoggingOut && setShowLogoutModal(false)} 
                onConfirm={performLogout} 
                isLoading={isLoggingOut} 
            />

            {/* Sidebar Overlay (Mobile) */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/40 z-20 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-30
                w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
                flex flex-col shadow-lg md:shadow-none
            `}>
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shadow-blue-200 shadow-lg">
                        <Image src="/logo.svg" width={24} height={24} alt="Logo" className="w-10 h-10  " />
                    </div>
                    <span className="font-bold text-gray-900 text-lg">Legal Advisor</span>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden ml-auto text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                    <button 
                        onClick={handleNewChat}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 mb-8 font-medium"
                    >
                        <Plus className="w-5 h-5" /> New Analysis
                    </button>

                    <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3 flex justify-between items-center">
                            History
                            {isLoadingHistory && <Loader2 className="w-3 h-3 animate-spin" />}
                        </p>
                        
                        {/* Dynamic Chat History List */}
                        {chatHistory.length > 0 ? (
                            chatHistory.map((chat) => (
                                <div key={chat.id} className="group relative">
                                    <button
                                        onClick={() => handleLoadChat(chat.id)}
                                        className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl text-sm text-left transition-colors pr-10 group ${
                                            chatId === chat.id 
                                            ? "bg-blue-50 border border-blue-100 text-blue-700" 
                                            : "text-gray-600 hover:bg-gray-50 border border-transparent"
                                        }`}
                                    >
                                        <MessageSquare className={`w-4 h-4 shrink-0 mt-0.5 ${chatId === chat.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                        <div className="min-w-0 flex-1">
                                            <div className="font-medium truncate">{chat.title || "Untitled Conversation"}</div>
                                            <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(chat.updatedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </button>

                                    {/* Delete Button - Shows on Hover */}
                                    <button 
                                        onClick={(e) => handleDeleteChat(e, chat.id)}
                                        disabled={deletingChatId === chat.id}
                                        className="absolute right-2 top-3 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all z-10"
                                        title="Delete chat"
                                    >
                                        {deletingChatId === chat.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                                        ) : (
                                            <Trash2 className="text-red-500  cursor-pointer w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-400 text-sm italic">
                                {isLoadingHistory ? "Loading history..." : "No active chats"}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3 mb-4 px-2 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-gray-200">
                        <div className="w-9 h-9 rounded-full bg-linear-to-tr from-blue-100 to-purple-100 flex items-center justify-center text-blue-600 overflow-hidden border border-white shadow-sm">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-bold text-sm">{user?.name?.charAt(0) || "U"}</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || "User"}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogoutClick}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Chat Area */}
            <main className="flex-1 flex flex-col h-full w-full relative bg-gray-50/50">
                {/* Mobile Header */}
                <header className="md:hidden bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-gray-600 rounded-lg active:bg-gray-100">
                            <Menu className="w-6 h-6" />
                        </button>
                        <span className="font-bold text-gray-900">Legal Advisor</span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="max-w-4xl mx-auto px-4 py-8">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center min-h-[60vh] mt-4">
                                <div className="relative mb-8 group">
                                    <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-50 group-hover:scale-110 transition-transform"></div>
                                    <Image src="/logo.svg" width={80} height={80} alt="Logo" className="relative z-10 w-20 h-20  animate-pulse" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                                    <TypeAnimation
                                        sequence={[
                                            `Hello ${user?.name?.split(' ')[0] || 'there'}!`, 2000,
                                            "Upload a contract...", 2000,
                                            "Ask a legal question...", 2000,
                                        ]}
                                        wrapper="span"
                                        speed={50}
                                        repeat={Infinity}
                                    />
                                </h2>
                                <p className="text-gray-500 text-center max-w-md mb-8 leading-relaxed">
                                    I'm your AI legal assistant. Upload a PDF or paste text to get instant risk analysis and clause breakdowns.
                                </p>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                                    {["Analyze NDA Risk", "Review Employment Contract", "Explain Indemnity Clause", "Summarize Lease Agreement"].map((suggestion) => (
                                        <button 
                                            key={suggestion}
                                            onClick={() => setInputText(suggestion)}
                                            className="px-4 py-3 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all text-left shadow-sm hover:shadow-md"
                                        >
                                            {suggestion} →
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8 pb-10">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        {/* Assistant Avatar */}
                                        {msg.role === 'assistant' && (
                                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-md mt-1">
                                                <Image src="/logo.svg" width={16} height={16} alt="AI" className="invert brightness-0" />
                                            </div>
                                        )}

                                        <div className={`max-w-[85%] sm:max-w-[75%] space-y-1 ${msg.role === 'user' ? 'items-end flex flex-col' : ''}`}>
                                            {/* Message Bubble */}
                                            {msg.role === 'user' ? (
                                                <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-5 py-3.5 shadow-md">
                                                    {msg.file && (
                                                        <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg mb-2 text-xs font-medium backdrop-blur-sm">
                                                            <Paperclip className="w-3 h-3" /> {msg.file}
                                                        </div>
                                                    )}
                                                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                                </div>
                                            ) : (
                                                msg.analysis ? (
                                                    <ResultCard analysis={msg.analysis} scrollToClause={scrollToClause} />
                                                ) : (
                                                    <div className="bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-sm px-6 py-4 shadow-sm">
                                                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                                    </div>
                                                )
                                            )}
                                            
                                            {/* Timestamp (Optional) */}
                                            <span className="text-[10px] text-gray-400 px-1">
                                                {msg.createdAt 
                                                    ? new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                                    : new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                                }
                                            </span>
                                        </div>

                                        {/* User Avatar */}
                                        {msg.role === 'user' && (
                                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0 mt-1 border border-white shadow-sm">
                                                {user?.avatar ? (
                                                    <img src={user.avatar} alt="Me" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-bold">ME</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {loading && (
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-md">
                                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                                        </div>
                                        <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-6 py-4 shadow-sm w-full max-w-md">
                                            <ProcessingLoader stage={processingStage} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white/80 backdrop-blur-md border-t border-gray-200">
                    <div className="max-w-3xl mx-auto">
                        <UploadBox file={file} onCancel={() => setFile(null)} />

                        <div className={`
                            bg-white border transition-all duration-200 rounded-3xl shadow-lg
                            flex items-end gap-2 p-2 relative
                            ${isRecording ? 'border-red-400 ring-4 ring-red-50' : 'border-gray-200 hover:border-gray-300 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50'}
                        `}>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                title="Attach PDF or Image"
                                disabled={loading || isGenerating}
                            >
                                <Paperclip className="w-5 h-5" />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,image/*"
                                onChange={(e) => handleFileUpload(e.target.files[0])}
                                className="hidden"
                            />

                            <textarea
                                ref={textareaRef}
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        if (!loading && !isGenerating) handleSend();
                                    }
                                }}
                                placeholder={isRecording ? "Listening..." : "Ask a legal question..."}
                                className="flex-1 bg-transparent resize-none border-none focus:ring-0 p-3 max-h-32 text-gray-900 placeholder-gray-400 text-base"
                                rows={1}
                                disabled={loading}
                            />

                            <div className="flex items-center gap-2 pb-1 pr-1">
                                {isRecording && (
                                    <div className="hidden sm:block mr-2">
                                        <RecordingWave analyserRef={analyserRef} dataArrayRef={dataArrayRef} isRecording={isRecording} />
                                    </div>
                                )}
                                
                                <button
                                    onClick={toggleRecording}
                                    className={`p-2.5 rounded-full transition-all duration-200 ${isRecording 
                                        ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse' 
                                        : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                                    }`}
                                    disabled={loading || isGenerating}
                                >
                                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>

                                <button
                                    onClick={handleSend}
                                    disabled={loading || (!inputText.trim() && !file) || isGenerating}
                                    className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <p className="text-[10px] text-center text-gray-400 mt-2">
                            AI may produce inaccurate information about people, places, or facts.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}