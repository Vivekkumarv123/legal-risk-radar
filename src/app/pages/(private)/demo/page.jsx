"use client";
import { useState, useRef, useEffect } from "react";
import Avatar from "@/components/ui/Avatar";
import toast from "react-hot-toast";
import { TypeAnimation } from "react-type-animation";
import ReactMarkdown from 'react-markdown';
import {
    Mic, MicOff, Send, Paperclip, X, AlertCircle, Shield,
    Menu, LogOut, MessageSquare, BrainCircuit, Plus, AlertTriangle,
    Loader2, Clock, Trash2, UserX, Volume2, StopCircle, Phone,
    Share2, Crown, Sparkles // ✅ Added Sparkles to imports
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { isGreeting, getGreetingResponse } from "@/utils/greetingHandler";
import ShareChatModal from "@/components/chat-sharing/ShareChatModal";
import UsageLimitModal from "@/components/subscription/UsageLimitModal";

// ==========================================
// SUB-COMPONENTS
// ==========================================

function LogoutModal({ isOpen, onClose, onConfirm, isLoading }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4"><LogOut className="w-6 h-6 text-gray-600" /></div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Log out?</h3>
                    <p className="text-gray-500 text-sm mb-6">Are you sure you want to log out?</p>
                    <div className="flex gap-3 w-full">
                        <button onClick={onClose} disabled={isLoading} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors disabled:opacity-50">Cancel</button>
                        <button onClick={onConfirm} disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-black text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-70">{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Log out"}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DeleteAccountModal({ isOpen, onClose, onConfirm, isLoading }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border-2 border-red-50">
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4"><AlertTriangle className="w-6 h-6 text-red-600" /></div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Account?</h3>
                    <p className="text-gray-500 text-sm mb-6">This action is <strong>irreversible</strong>.</p>
                    <div className="flex gap-3 w-full">
                        <button onClick={onClose} disabled={isLoading} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors disabled:opacity-50">Cancel</button>
                        <button onClick={onConfirm} disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-70">{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Forever"}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DeleteChatModal({ isOpen, onClose, onConfirm, isLoading }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4"><Trash2 className="w-6 h-6 text-red-500" /></div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Chat?</h3>
                    <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
                    <div className="flex gap-3 w-full">
                        <button onClick={onClose} disabled={isLoading} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors disabled:opacity-50">Cancel</button>
                        <button onClick={onConfirm} disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-70">{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}</button>
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
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><Paperclip className="w-5 h-5 text-blue-600" /></div>
                <div><p className="font-medium text-gray-900 text-sm truncate max-w-50">{file.name}</p><p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p></div>
            </div>
            <button onClick={onCancel} className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"><X className="w-4 h-4 text-gray-600" /></button>
        </div>
    );
}

function ProcessingLoader({ stage }) {
    const stages = [{ label: "Reading document...", icon: "📄" }, { label: "Analyzing risks...", icon: "🔍" }, { label: "Finalizing results...", icon: "✨" }];
    return (
        <div className="flex flex-col items-center justify-center py-8">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-medium text-gray-700 flex items-center gap-2 animate-pulse"><span>{stages[stage]?.icon}</span>{stages[stage]?.label}</p>
        </div>
    );
}

function RiskBadge({ level, count, onClick }) {
    const styles = { low: "bg-green-100 text-green-700 border-green-200 hover:bg-green-200", medium: "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200", high: "bg-red-100 text-red-700 border-red-200 hover:bg-red-200" };
    const icons = { low: "🟢", medium: "🟡", high: "🔴" };
    return (
        <button onClick={onClick} className={`${styles[level]} border px-3 py-1.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors`}>
            <span className="text-xs">{icons[level]}</span><span className="capitalize">{level}</span><span className="bg-white/60 px-1.5 py-0.5 rounded text-xs ml-1">{count}</span>
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
            <div className="p-6 bg-linear-to-br from-gray-50 to-white border-b border-gray-100">
                <div className="flex items-center gap-3 mb-4"><Shield className={`w-8 h-8 ${riskColor}`} /><h2 className="text-xl font-bold text-gray-900">Risk Level: {overallRisk}</h2></div>
                <p className="text-gray-600 text-sm leading-relaxed">{analysis.summary}</p>
            </div>
            <div className="p-4 bg-gray-50/50 flex flex-wrap gap-2 border-b border-gray-100">
                {riskCounts.high > 0 && <RiskBadge level="high" count={riskCounts.high} onClick={() => scrollToClause('high')} />}
                {riskCounts.medium > 0 && <RiskBadge level="medium" count={riskCounts.medium} onClick={() => scrollToClause('medium')} />}
                {riskCounts.low > 0 && <RiskBadge level="low" count={riskCounts.low} onClick={() => scrollToClause('low')} />}
            </div>
            <div className="p-6 space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Analyzed Clauses</h3>
                {analysis.clauses.map((clause, idx) => (
                    <div key={idx} id={`clause-${clause.risk_level}-${idx}`} className={`p-4 rounded-xl border ${clause.risk_level === 'high' ? 'bg-red-50 border-red-100' : clause.risk_level === 'medium' ? 'bg-yellow-50 border-yellow-100' : 'bg-green-50 border-green-100'}`}>
                        <div className="flex justify-between items-start mb-2 gap-2">
                            <h4 className="font-semibold text-gray-900 text-sm">{clause.clause}</h4>
                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${clause.risk_level === 'high' ? 'bg-red-200 text-red-800' : clause.risk_level === 'medium' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>{clause.risk_level}</span>
                        </div>
                        <p className="text-gray-700 text-sm">{clause.explanation}</p>
                    </div>
                ))}
            </div>
            {analysis.missing_protections?.length > 0 && (
                <div className="p-6 bg-orange-50 border-t border-orange-100">
                    <h3 className="text-sm font-semibold text-orange-800 mb-3 flex items-center gap-2">Missing Protections</h3>
                    <ul className="space-y-2">{analysis.missing_protections.map((prot, idx) => (<li key={idx} className="flex items-start gap-2 text-sm text-gray-700"><span className="text-orange-500 mt-1">•</span>{prot}</li>))}</ul>
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
                    if (barRefs.current[i]) barRefs.current[i].style.transform = `scaleY(${0.2 + height * 2})`;
                }
            } else {
                for (let i = 0; i < bars; i++) {
                    if (barRefs.current[i]) { const h = 0.2 + Math.random() * 0.3; barRefs.current[i].style.transform = `scaleY(${h})`; }
                }
            }
            rafId = requestAnimationFrame(render);
        };
        if (isRecording) render();
        return () => cancelAnimationFrame(rafId);
    }, [analyserRef, dataArrayRef, isRecording]);
    return (<div className="flex items-center gap-0.5 h-6">{Array.from({ length: bars }).map((_, i) => (<div key={i} ref={el => (barRefs.current[i] = el)} className="w-1 bg-red-500 rounded-full h-full transition-transform duration-75" style={{ transform: 'scaleY(0.2)' }} />))}</div>);
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

    // ✅ NEW STATES
    const [documentContext, setDocumentContext] = useState("");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [wasVoiceInput, setWasVoiceInput] = useState(false);
    const [guestId, setGuestId] = useState("");
    const [isLiveMode, setIsLiveMode] = useState(false);
    const [liveStatus, setLiveStatus] = useState("idle");
    const [speechLanguage, setSpeechLanguage] = useState('hi-IN'); // Default to Hindi
    const [availableVoices, setAvailableVoices] = useState([]);

    // Account & Chat Management
    const [showDeleteModal, setShowDeleteModal] = useState(false);
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
    // AUTH & SETUP
    // ==========================================
    useEffect(() => {
        let storedGuestId = localStorage.getItem("guest_id");
        if (!storedGuestId) {
            storedGuestId = "guest_" + Math.random().toString(36).substring(2, 15);
            localStorage.setItem("guest_id", storedGuestId);
        }
        setGuestId(storedGuestId);

        // Load Voices
        const loadVoices = () => {
            const v = window.speechSynthesis.getVoices();
            if (v.length > 0) setAvailableVoices(v);
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/me', { cache: 'no-store' });
                if (!res.ok) throw new Error("Unauthorized");
                const data = await res.json();
                setUser(data.user);
                fetchChats();
            } catch (error) { }
            finally { setIsAuthChecking(false); }
        };
        checkAuth();
    }, []);

    // Check user usage info on load
    useEffect(() => {
        const checkUsageInfo = async () => {
            if (user) {
                try {
                    const token = localStorage.getItem('accessToken');
                    const response = await fetch('/api/subscription', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setUserUsageInfo(data);

                        // Show upgrade prompt if user is close to limits
                        if (data.usage && data.planDetails) {
                            const { usage, planDetails } = data;
                            const dailyLimit = planDetails.features.aiQueries;
                            if (dailyLimit > 0 && usage.aiQueries >= dailyLimit - 1) {
                                setShowUpgradePrompt(true);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Failed to check usage info:', error);
                }
            }
        };

        checkUsageInfo();
    }, [user]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading, isGenerating]);
    useEffect(() => { if (textareaRef.current) textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`; }, [inputText]);

    // ==========================================
    // VOICE UTILS (With Language Detection)
    // ==========================================

    const getBestVoice = (text) => {
        if (!availableVoices.length) return null;
        const isIndianLang = /[\u0900-\u097F]/.test(text);
        if (isIndianLang) {
            return availableVoices.find(v => v.lang.includes('hi') || v.name.includes('Hindi')) || null;
        }
        return availableVoices.find(v => v.lang === 'en-US' || v.name.includes('Google US English')) || null;
    };

    const cleanMarkdown = (text) => {
        return text
            .replace(/\*\*/g, "")
            .replace(/\*/g, "")
            .replace(/#{1,6}\s/g, "")
            .replace(/`{1,3}/g, "")
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
            .trim();
    };

    const speakTextPromise = (text) => {
        return new Promise((resolve) => {
            if (!window.speechSynthesis) { resolve(); return; }
            window.speechSynthesis.cancel();

            const cleanText = cleanMarkdown(text);
            const utterance = new SpeechSynthesisUtterance(cleanText);

            const voice = getBestVoice(cleanText);
            if (voice) utterance.voice = voice;
            utterance.lang = voice ? voice.lang : (/[\u0900-\u097F]/.test(cleanText) ? 'hi-IN' : 'en-US');

            utterance.onstart = () => setLiveStatus("speaking");
            utterance.onend = () => { setLiveStatus("idle"); resolve(); };
            utterance.onerror = () => { setLiveStatus("idle"); resolve(); };

            window.speechSynthesis.speak(utterance);
        });
    };

    const speakText = (text) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();

        const cleanText = cleanMarkdown(text);
        const utterance = new SpeechSynthesisUtterance(cleanText);

        const voice = getBestVoice(cleanText);
        if (voice) utterance.voice = voice;
        utterance.lang = voice ? voice.lang : (/[\u0900-\u097F]/.test(cleanText) ? 'hi-IN' : 'en-US');

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => { if (window.speechSynthesis) { window.speechSynthesis.cancel(); setIsSpeaking(false); } };

    // ==========================================
    // LIVE MODE LOOP
    // ==========================================

    const startLiveLoop = () => {
        if (!recognitionRef.current) return;
        setLiveStatus("listening");
        recognitionRef.current.start();
    };

    const handleLiveInput = async (transcript) => {
        setLiveStatus("thinking");
        try {
            const res = await fetch("/api/live-conversation", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    // Remove guest ID, use proper authentication
                },
                credentials: 'include', // Include cookies for authentication
                body: JSON.stringify({ message: transcript }),
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }

            const data = await res.json();
            const reply = data.data?.response || "I didn't catch that.";

            await speakTextPromise(reply);

            if (isLiveMode) {
                setTimeout(() => startLiveLoop(), 500);
            }
        } catch (e) {
            console.error("Live conversation error:", e);
            const errorMessage = speechLanguage.startsWith('hi') 
                ? "क्षमा करें, मुझे समझने में कठिनाई हो रही है। कृपया फिर से कोशिश करें।"
                : "Sorry, I'm having trouble understanding. Please try again.";
            await speakTextPromise(errorMessage);
            setLiveStatus("idle");
        }
    };

    // Speech Recognition Setup
    useEffect(() => {
        if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            // Enhanced configuration for better Hindi support
            recognition.continuous = false;
            recognition.interimResults = true; // Enable interim results for better feedback
            recognition.maxAlternatives = 3; // Get multiple alternatives
            
            // Set language based on user preference
            recognition.lang = speechLanguage;
            
            recognition.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';
                
                // Process all results
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }
                
                // Use final transcript if available, otherwise interim
                const bestTranscript = finalTranscript || interimTranscript;
                
                if (bestTranscript.trim()) {
                    if (isLiveMode) {
                        handleLiveInput(bestTranscript);
                    } else {
                        setInputText(bestTranscript);
                    }
                }
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                
                // If current language fails, try English as fallback
                if (event.error === 'language-not-supported' && recognition.lang !== 'en-IN') {
                    console.log(`${recognition.lang} not supported, falling back to English`);
                    recognition.lang = 'en-IN';
                    return;
                }
                
                if (isLiveMode) {
                    setLiveStatus("idle");
                    // Provide user feedback in selected language
                    const errorMessage = speechLanguage.startsWith('hi') 
                        ? "मुझे समझने में कठिनाई हो रही है। कृपया फिर से कोशिश करें।" 
                        : "I'm having trouble understanding. Please try again.";
                    speakText(errorMessage);
                } else {
                    setIsRecording(false);
                }
            };

            recognition.onnomatch = () => {
                console.log('No speech was recognized');
                if (isLiveMode) {
                    const noSpeechMessage = speechLanguage.startsWith('hi') 
                        ? "मैंने कुछ नहीं सुना। कृपया फिर से बोलें।" 
                        : "I didn't hear anything. Please speak again.";
                    speakText(noSpeechMessage);
                }
            };

            recognitionRef.current = recognition;
        }
    }, [isLiveMode, speechLanguage]); // Re-initialize when language changes

    useEffect(() => {
        return () => {
            if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(t => t.stop());
            if (audioContextRef.current) audioContextRef.current.close();
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    const handleFileUpload = (uploadedFile) => { setFile(uploadedFile); };

    const toggleRecording = () => {
        if (isRecording) { recognitionRef.current?.stop(); setIsRecording(false); }
        else { recognitionRef.current?.start(); setWasVoiceInput(true); setIsRecording(true); }
    };

    const handleNewChat = () => { setMessages([]); setInputText(""); setFile(null); setChatId(null); setDocumentContext(""); setSidebarOpen(false); toast.success("New chat started"); };
    const handleLogoutClick = () => setShowLogoutModal(true);
    const performLogout = async () => { setIsLoggingOut(true); try { const res = await fetch('/api/auth/logout', { method: 'POST' }); if (res.ok) { toast.success('Logged out successfully'); setTimeout(() => { setShowLogoutModal(false); router.push('/'); }, 1000); } else { throw new Error("Logout Failed"); } } catch { toast.error('Logout failed'); setIsLoggingOut(false); } };
    const fetchChats = async () => { setIsLoadingHistory(true); try { const res = await fetch('/api/chats', { cache: 'no-store' }); if (res.ok) { const data = await res.json(); if (data.success) setChatHistory(data.chats); } } catch (error) { console.error("Error fetching chats:", error); } finally { setIsLoadingHistory(false); } };
    const confirmDeleteChat = (e, id) => { e.stopPropagation(); setChatToDelete(id); };
    const handleDeleteChat = async () => { if (!chatToDelete) return; setIsDeletingChat(true); try { const res = await fetch(`/api/chats/delete?chatId=${chatToDelete}`, { method: "DELETE" }); const data = await res.json(); if (res.ok) { toast.success("Chat deleted"); setChatHistory(prev => prev.filter(chat => chat.id !== chatToDelete)); if (chatId === chatToDelete) handleNewChat(); } else { throw new Error(data.error || "Failed to delete"); } } catch (error) { toast.error("Failed to delete chat"); } finally { setIsDeletingChat(false); setChatToDelete(null); } };
    const performDeleteAccount = async () => { setIsDeletingAccount(true); try { const res = await fetch('/api/auth/delete-account', { method: 'DELETE' }); if (res.ok) { toast.success("Account deleted successfully"); setTimeout(() => { setShowDeleteModal(false); router.push('/'); }, 1000); } else { throw new Error("Failed to delete account"); } } catch (error) { toast.error("Could not delete account"); setIsDeletingAccount(false); } };
    const animateAssistantContent = (fullText) => { setIsGenerating(true); setMessages(prev => [...prev, { role: 'assistant', content: '' }]); let charIndex = 0; const interval = setInterval(() => { charIndex += 5; if (charIndex >= fullText.length) { clearInterval(interval); setIsGenerating(false); setMessages(prev => { const newArr = [...prev]; newArr[newArr.length - 1].content = fullText; return newArr; }); } else { setMessages(prev => { const newArr = [...prev]; newArr[newArr.length - 1].content = fullText.slice(0, charIndex); return newArr; }); } }, 8); }; // Faster animation: 5 chars per 8ms instead of 3 chars per 10ms

    const handleLoadChat = async (id) => { if (id === chatId) return; setLoading(true); setSidebarOpen(false); try { const res = await fetch(`/api/chats/${id}`); const data = await res.json(); if (data.success) { setChatId(id); setDocumentContext(data.documentContext || ""); const formattedMessages = data.messages.map(msg => { let analysis = null; if (msg.analysisData) { analysis = { summary: msg.analysisData.summary, overall_risk_score: msg.analysisData.overall_risk_score, missing_protections: msg.analysisData.missing_clauses || [], clauses: Array.isArray(msg.analysisData.clauses) ? msg.analysisData.clauses.map(c => ({ ...c, clause: c.clause_snippet || c.clause })) : [] }; } else if (msg.analysis) { analysis = msg.analysis; } return { role: msg.role || 'user', content: msg.content, analysis: analysis, file: msg.file || null, createdAt: msg.createdAt }; }); setMessages(formattedMessages); } else { toast.error("Failed to load chat"); } } catch (error) { toast.error("Error loading chat"); } finally { setLoading(false); } };
    const scrollToClause = (riskLevel) => { const element = document.getElementById(`clause-${riskLevel}-0`); element?.scrollIntoView({ behavior: 'smooth', block: 'center' }); };

    // ==========================================
    // 4. SMART SEND HANDLER (Document Locking)
    // ==========================================
    const handleSend = async () => {
        if (!inputText.trim() && !file) return;
        const rawInput = inputText.trim();
        let textToSend = rawInput;

        const isQuestion = /^(can|could|would|is|are|do|does|what|where|when|who|why|how|explain|summarize|translate|convert|give|describe)/i.test(rawInput) || rawInput.endsWith("?");
        const isHello = isGreeting(rawInput);
        const isLongText = rawInput.length > 200;
        const isNewDocument = file || (isLongText && !isQuestion);

        if (isNewDocument) {
            if (!file) {
                textToSend = `Analyze the following legal text and identify risks/clauses:\n\n${rawInput}`;
                setDocumentContext(rawInput);
            } else {
                // When uploading a file, ensure we trigger structured analysis
                textToSend = rawInput.trim() || "Analyze the following legal text and identify risks/clauses";
                if (!textToSend.startsWith("Analyze the following legal text")) {
                    textToSend = `Analyze the following legal text and identify risks/clauses:\n\n${textToSend}`;
                }
            }
        } else {
            textToSend = rawInput;
        }

        if (!isNewDocument && !documentContext && isHello) {
            setMessages(prev => [...prev, { role: "user", content: rawInput }]); setInputText(""); setIsGenerating(true);
            setTimeout(() => { const reply = getGreetingResponse(rawInput); setMessages(prev => [...prev, { role: "assistant", content: reply, createdAt: new Date().toISOString() }]); setIsGenerating(false); if (wasVoiceInput) speakText(reply); setWasVoiceInput(false); }, 200); return; // Reduced from 600ms to 200ms
        }

        const userMsg = { role: "user", content: rawInput || "Analyze this document", file: file?.name };
        setMessages(prev => [...prev, userMsg]); setInputText(""); setLoading(true);
        const isNewConversation = !chatId;

        try {
            let apiBody = { message: textToSend, chatId: chatId };

            if (!isNewDocument && documentContext) {
                apiBody.documentText = documentContext;
            }

            if (file) { 
                setProcessingStage(0); 
                const formData = new FormData(); 
                formData.append("file", file); 
                
                // Start OCR processing
                const ocrRes = await fetch("/api/ocr", { method: "POST", body: formData }); 
                if (!ocrRes.ok) throw new Error("OCR Failed"); 
                const ocrData = await ocrRes.json(); 
                apiBody.documentText = ocrData.text; 
                setDocumentContext(ocrData.text); 
            }

            setProcessingStage(1);
            const aiRes = await fetch("/api/generate-content", {
                method: "POST", 
                headers: { "Content-Type": "application/json" }, 
                credentials: 'include',
                body: JSON.stringify(apiBody),
                signal: AbortSignal.timeout(30000) // 30 second timeout
            });

            // Handle usage limit reached
            if (aiRes.status === 403) {
                const errorData = await aiRes.json();
                if (errorData.upgradeRequired) {
                    setUsageLimitInfo({
                        limitType: errorData.limitType || 'ai_query',
                        currentUsage: errorData.currentUsage || 0,
                        limit: errorData.limit || 5
                    });
                    setShowUsageLimitModal(true);
                    setLoading(false);
                    return;
                }
                throw new Error(errorData.error || "Usage limit reached");
            }

            if (!aiRes.ok) throw new Error("AI Failed");
            const aiData = await aiRes.json();
            if (aiData.chatId) { setChatId(aiData.chatId); if (isNewConversation) fetchChats(); }
            setProcessingStage(2);

            setTimeout(() => {
                setLoading(false); setFile(null);
                if (aiData.data.clauses && aiData.data.clauses.length > 0) {
                    setMessages(prev => [...prev, { role: "assistant", analysis: aiData.data }]);
                    if (wasVoiceInput) speakText("I have analyzed the document. Here is the risk assessment.");
                } else {
                    const textResponse = aiData.data.response || aiData.data.summary || "Done.";
                    animateAssistantContent(textResponse);
                    if (wasVoiceInput) speakText(textResponse);
                }
                setWasVoiceInput(false);
            }, 300); // Reduced from 600ms to 300ms
        } catch (error) { toast.error("Error"); setMessages(prev => [...prev, { role: "assistant", content: "Error processing request." }]); setLoading(false); setWasVoiceInput(false); }
    };

    if (isAuthChecking) return <div className="flex h-screen items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden relative font-sans">
            <LogoutModal isOpen={showLogoutModal} onClose={() => !isLoggingOut && setShowLogoutModal(false)} onConfirm={performLogout} isLoading={isLoggingOut} />
            <DeleteAccountModal isOpen={showDeleteModal} onClose={() => !isDeletingAccount && setShowDeleteModal(false)} onConfirm={performDeleteAccount} isLoading={isDeletingAccount} />
            <DeleteChatModal isOpen={!!chatToDelete} onClose={() => !isDeletingChat && setChatToDelete(null)} onConfirm={handleDeleteChat} isLoading={isDeletingChat} />
            <ShareChatModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                chatId={chatId}
                chatTitle={chatHistory.find(chat => chat.id === chatId)?.title || 'Legal Consultation'}
            />

            <UsageLimitModal
                isOpen={showUsageLimitModal}
                onClose={() => setShowUsageLimitModal(false)}
                limitType={usageLimitInfo?.limitType}
                currentPlan="basic"
                usageCount={usageLimitInfo?.currentUsage}
                limit={usageLimitInfo?.limit}
            />

            {/* ✅ LIVE MODE */}
            {isLiveMode && (
                <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <button onClick={() => { setIsLiveMode(false); window.speechSynthesis.cancel(); }} className="absolute top-6 right-6 p-3 bg-gray-100 rounded-full hover:bg-gray-200"><X className="w-6 h-6 text-gray-700" /></button>
                    <div className="flex flex-col items-center gap-8">
                        <div className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 ${liveStatus === 'listening' ? 'bg-blue-100 scale-110 shadow-blue-200 shadow-xl' : liveStatus === 'speaking' ? 'bg-green-100 scale-100 shadow-green-200 shadow-lg' : liveStatus === 'thinking' ? 'bg-purple-100 animate-pulse' : 'bg-gray-100'}`}>
                            {liveStatus === 'listening' && <Mic className="w-16 h-16 text-blue-600 animate-bounce" />}
                            {liveStatus === 'speaking' && <Volume2 className="w-16 h-16 text-green-600 animate-pulse" />}
                            {liveStatus === 'thinking' && <Loader2 className="w-16 h-16 text-purple-600 animate-spin" />}
                            {liveStatus === 'idle' && <MicOff className="w-16 h-16 text-gray-400" />}
                        </div>
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">{liveStatus === 'listening' ? "I'm listening..." : liveStatus === 'speaking' ? "Speaking..." : liveStatus === 'thinking' ? "Thinking..." : "Tap to Speak"}</h2>
                            <p className="text-gray-500">Live Conversation Mode</p>
                        </div>
                        
                        {/* Language Selector */}
                        {liveStatus === 'idle' && (
                            <div className="flex flex-col items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <label className="text-sm font-medium text-gray-700">Language:</label>
                                    <select
                                        value={speechLanguage}
                                        onChange={(e) => setSpeechLanguage(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    >
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
                                <p className="text-xs text-gray-400 text-center max-w-md">
                                    Speak in your preferred language. The AI will respond in the same language.
                                </p>
                            </div>
                        )}
                        
                        <div className="flex gap-6">
                            {liveStatus === 'idle' && <button onClick={startLiveLoop} className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg shadow-lg hover:bg-blue-700 hover:scale-105 transition-all">Start Talking</button>}
                            {liveStatus !== 'idle' && <button onClick={() => { recognitionRef.current?.stop(); window.speechSynthesis.cancel(); setLiveStatus("idle"); }} className="px-8 py-4 bg-red-100 text-red-600 rounded-full font-bold text-lg hover:bg-red-200 transition-all">Stop</button>}
                        </div>
                    </div>
                </div>
            )}

            {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}

            <aside className={`fixed md:static inset-y-0 left-0 z-30 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col shadow-lg md:shadow-none`}>
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shadow-blue-200 shadow-lg"><Image src="/logo.svg" width={24} height={24} alt="Logo" className="w-10 h-10" /></div>
                    <span className="font-bold text-gray-900 text-lg">Legal Advisor</span>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden ml-auto text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                    <button onClick={handleNewChat} className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 mb-4 font-medium"><Plus className="w-5 h-5" /> New Analysis</button>
                    {/* ✅ LIVE BUTTON */}
                    <button onClick={() => setIsLiveMode(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 mb-4 font-medium"><BrainCircuit className="w-5 h-5 animate-pulse" /> Live Chat</button>

                    {/* ✅ UPGRADE BUTTON - Sidebar Version (kept as a secondary access point) */}
                    <button
                        onClick={() => {
                            sessionStorage.setItem('returnAfterUpgrade', window.location.pathname);
                            router.push('/pages/subscription?upgrade=true');
                        }}
                        className="w-full lg:hidden flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 mb-8 font-medium relative overflow-hidden group"
                        title="Upgrade to unlock unlimited queries and premium features"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                        <Crown className="w-5 h-5 relative z-10" />
                        <span className="relative z-10">Upgrade to Pro</span>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                    </button>

                    <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3 flex justify-between items-center">History {isLoadingHistory && <Loader2 className="w-3 h-3 animate-spin" />}</p>
                        {chatHistory.length > 0 ? chatHistory.map((chat) => (
                            <div key={chat.id} className="group relative">
                                <button onClick={() => handleLoadChat(chat.id)} className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl text-sm text-left transition-colors pr-16 group ${chatId === chat.id ? "bg-blue-50 border border-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-50 border border-transparent"}`}>
                                    <MessageSquare className={`w-4 h-4 shrink-0 mt-0.5 ${chatId === chat.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                    <div className="min-w-0 flex-1"><div className="font-medium truncate">{chat.title || "Untitled Conversation"}</div><div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(chat.updatedAt).toLocaleDateString()}</div></div>
                                </button>
                                <div className="absolute right-2 top-3 flex items-center gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setChatId(chat.id);
                                            setShowShareModal(true);
                                        }}
                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Share Chat"
                                    >
                                        <Share2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={(e) => confirmDeleteChat(e, chat.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Chat"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                            </div>
                        )) : <div className="text-center py-8 text-gray-400 text-sm italic">No active chats</div>}
                    </div>
                </div>
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3 mb-4 px-2 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-gray-200 group">
                        <Avatar
                            src={user?.avatar}
                            alt={user?.name || "User"}
                            fallback={user?.name?.charAt(0) || "U"}
                            size="md"
                        />
                        <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-900 truncate">{user?.name || "User"}</p><p className="text-xs text-gray-500 truncate">{user?.email}</p></div>
                        <button onClick={(e) => { e.stopPropagation(); setShowDeleteModal(true); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"><UserX className="w-5 h-5" /></button>
                    </div>
                    <button onClick={handleLogoutClick} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><LogOut className="w-4 h-4" /> Sign Out</button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col h-full w-full relative bg-gray-50/50">
                {/* ================================================
                ✅ NEW DESKTOP HEADER (Upgrade & Share)
                ================================================
                */}
                <div className="hidden md:flex absolute top-0 left-0 right-0 p-4 justify-between items-start z-20 pointer-events-none">
                    {/* Spacer for alignment */}
                    <div className="flex-1"></div>

                    {/* CENTER: Upgrade Button (Pill Style like Free Offer) */}
                    <div className="pointer-events-auto">
                        <button
                            onClick={() => {
                                sessionStorage.setItem('returnAfterUpgrade', window.location.pathname);
                                router.push('/pages/subscription?upgrade=true');
                            }}
                            className="hidden md:flex items-center gap-2 px-5 py-2.5
                            bg-linear-to-r from-indigo-600/70 via-purple-600/70 to-pink-600/70
                            backdrop-blur-md text-white rounded-full text-sm font-semibold
                            shadow-lg hover:shadow-xl hover:cursor-pointer transition-all hover:scale-105 active:scale-95"
                        >
                            <Sparkles className="w-4 h-4 fill-white/20" />
                            <span>Upgrade Plan</span>
                        </button>
                    </div>

                    {/* RIGHT: Share Button (Top Right Corner) */}
                    <div className="flex-1 flex justify-end gap-2 pointer-events-auto">
                        <button
                            onClick={() => setShowShareModal(true)}
                            className="p-2.5 bg-white hover:bg-gray-100 text-gray-600 rounded-xl shadow-sm border border-gray-200 transition-colors"
                            title="Share Chat"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                        {/* Optional: User Avatar duplicate for header if desired, currently sticking to Share only as requested */}
                    </div>
                </div>

                <header className="md:hidden bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-gray-600 rounded-lg active:bg-gray-100"><Menu className="w-6 h-6" /></button>
                        <span className="font-bold text-gray-900">Legal Advisor</span>
                    </div>
                    {/* Share Button for Mobile */}
                    <div className="flex gap-2">
                        {messages.length > 0 && chatId && (
                            <button
                                onClick={() => setShowShareModal(true)}
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="Share Chat"
                            >
                                <Share2 className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            onClick={() => router.push('/pages/subscription?upgrade=true')}
                            className="p-2 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all"
                            title="Upgrade"
                        >
                            <Sparkles className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Upgrade Prompt Banner */}
                {showUpgradePrompt && userUsageInfo?.planDetails?.id === 'basic' && (
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <Crown className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">Almost at your daily limit!</p>
                                <p className="text-xs text-blue-100">Upgrade to Pro for unlimited queries</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    sessionStorage.setItem('returnAfterUpgrade', window.location.pathname);
                                    router.push('/pages/subscription?upgrade=true');
                                }}
                                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors"
                            >
                                Upgrade Now
                            </button>
                            <button
                                onClick={() => setShowUpgradePrompt(false)}
                                className="p-1 hover:bg-white/20 rounded"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="max-w-4xl mx-auto px-4 py-8 pt-16 md:pt-20"> {/* Added pt-16/20 for space for new top bar */}
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center min-h-[60vh] mt-4">
                                <div className="relative mb-8 group">
                                    <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-50 group-hover:scale-110 transition-transform"></div>
                                    <Image src="/logo.svg" width={80} height={80} alt="Logo" className="relative z-10 w-20 h-20 animate-pulse" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center"><TypeAnimation sequence={[`Hello ${user?.name?.split(' ')[0] || 'there'}!`, 2000, "Upload a contract...", 2000, "Ask a legal question...", 2000]} wrapper="span" speed={50} repeat={Infinity} /></h2>
                                <p className="text-gray-500 text-center max-w-md mb-8 leading-relaxed">I'm your AI legal assistant. Upload a PDF or paste text to get instant risk analysis and clause breakdowns.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                                    {["Analyze NDA Risk", "Review Employment Contract", "Explain Indemnity Clause", "Summarize Lease Agreement"].map((suggestion) => (<button key={suggestion} onClick={() => setInputText(suggestion)} className="px-4 py-3 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all text-left shadow-sm hover:shadow-md">{suggestion} →</button>))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8 pb-10">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.role === 'assistant' && (
                                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-md mt-1">
                                                <Image src="/logo.svg" width={16} height={16} alt="AI" className="invert brightness-0" />
                                            </div>
                                        )}
                                        <div className={`max-w-[85%] sm:max-w-[75%] space-y-1 ${msg.role === 'user' ? 'items-end flex flex-col' : ''}`}>
                                            {msg.role === 'user' ? (
                                                <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-5 py-3.5 shadow-md">
                                                    {msg.file && (<div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg mb-2 text-xs font-medium backdrop-blur-sm"><Paperclip className="w-3 h-3" /> {msg.file}</div>)}
                                                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                                </div>
                                            ) : (
                                                msg.analysis ? (
                                                    <div className="flex flex-col gap-2 w-full">
                                                        <ResultCard analysis={msg.analysis} scrollToClause={scrollToClause} />
                                                        <div className="flex gap-2 ml-2 mt-1">
                                                            <button onClick={() => speakText(msg.analysis.summary)} className="self-start flex items-center gap-2 text-xs text-gray-500 hover:text-blue-600 transition-colors ml-2">
                                                                <Volume2 className="w-5 h-5" placeholder="Listen to Summary" />
                                                            </button>
                                                            {isSpeaking && <button onClick={stopSpeaking} className="p-1.5 text-red-400 hover:text-red-600 rounded-full transition-colors animate-pulse" title="Stop Speaking"><StopCircle className="w-5 h-5" /></button>}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col gap-1 items-start w-full">
                                                        <div className="bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-sm px-6 py-5 shadow-sm w-full">
                                                            <div className="markdown-content text-sm leading-relaxed">
                                                                <ReactMarkdown
                                                                    components={{
                                                                        strong: ({ node, ...props }) => <span className="font-bold text-gray-900" {...props} />,
                                                                        ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-2 my-2 text-gray-700" {...props} />,
                                                                        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-2 my-2 text-gray-700" {...props} />,
                                                                        li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                                                        p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                                                                        h1: ({ node, ...props }) => <h1 className="text-lg font-bold text-gray-900 mb-2" {...props} />,
                                                                        h2: ({ node, ...props }) => <h2 className="text-base font-bold text-gray-900 mb-2" {...props} />,
                                                                    }}
                                                                >
                                                                    {msg.content}
                                                                </ReactMarkdown>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 ml-2 mt-1">
                                                            <button onClick={() => speakText(msg.content)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-full transition-colors" title="Read Aloud"><Volume2 className="w-6 h-6" /></button>
                                                            {isSpeaking && <button onClick={stopSpeaking} className="p-1.5 text-red-400 hover:text-red-600 rounded-full transition-colors animate-pulse" title="Stop Speaking"><StopCircle className="w-6 h-6" /></button>}
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                            <span className="text-[10px] text-gray-400 px-1">{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        {msg.role === 'user' && (
                                            <Avatar
                                                src={user?.avatar}
                                                alt="Me"
                                                fallback="ME"
                                                size="sm"
                                                className="shrink-0 mt-1"
                                            />
                                        )}
                                    </div>
                                ))}
                                {loading && (<div className="flex gap-4"><div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-md"><Loader2 className="w-4 h-4 text-white animate-spin" /></div><div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-6 py-4 shadow-sm w-full max-w-md"><ProcessingLoader stage={processingStage} /></div></div>)}
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <div className="p-4 bg-white/80 backdrop-blur-md border-t border-gray-200">
                    <div className="max-w-3xl mx-auto">
                        <UploadBox file={file} onCancel={() => setFile(null)} />
                        <div className={`bg-white border transition-all duration-200 rounded-3xl shadow-lg flex items-end gap-2 p-2 relative ${isRecording ? 'border-red-400 ring-4 ring-red-50' : 'border-gray-200 hover:border-gray-300 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50'}`}>
                            <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Attach PDF or Image" disabled={loading || isGenerating}><Paperclip className="w-5 h-5" /></button>
                            <input ref={fileInputRef} type="file" accept=".pdf,image/*" onChange={(e) => handleFileUpload(e.target.files[0])} className="hidden" />
                            <textarea ref={textareaRef} value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!loading && !isGenerating) handleSend(); } }} placeholder={isRecording ? "Listening..." : "Ask a legal question..."} className="flex-1 bg-transparent resize-none border-none focus:ring-0 p-3 max-h-32 text-gray-900 placeholder-gray-400 text-base" rows={1} disabled={loading} />
                            <div className="flex items-center gap-2 pb-1 pr-1">
                                {isRecording && (<div className="hidden sm:block mr-2"><RecordingWave analyserRef={analyserRef} dataArrayRef={dataArrayRef} isRecording={isRecording} /></div>)}
                                <button onClick={toggleRecording} className={`p-2.5 rounded-full transition-all duration-200 ${isRecording ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}`} disabled={loading || isGenerating}>{isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}</button>
                                <button onClick={handleSend} disabled={loading || (!inputText.trim() && !file) || isGenerating} className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 disabled:cursor-not-allowed transition-all shadow-md active:scale-95">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}</button>
                            </div>
                        </div>
                        <p className="text-[10px] text-center text-gray-400 mt-2">AI may produce inaccurate information about people, places, or facts.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}