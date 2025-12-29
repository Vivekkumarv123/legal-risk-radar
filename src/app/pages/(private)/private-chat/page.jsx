"use client";
import { useState, useRef, useEffect } from "react";
import { TypeAnimation } from "react-type-animation";
import { 
    Mic, MicOff, Send, Paperclip, X, AlertCircle, Shield, 
    Menu, LogOut, MessageSquare, User, Plus, AlertTriangle, Loader2, CheckCircle, XCircle 
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// ==========================================
// SUB-COMPONENTS
// ==========================================

// 1. Toast Notification Component (NEW)
function Toast({ message, type, isVisible, onClose }) {
    if (!isVisible) return null;

    return (
        <div className={`fixed top-5 right-5 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-top-5 duration-300 ${
            type === 'success' ? 'bg-white border-green-200 text-green-800' : 'bg-white border-red-200 text-red-800'
        }`}>
            {type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
            <span className="text-sm font-medium">{message}</span>
            <button onClick={onClose} className="ml-2 hover:bg-gray-100 rounded-full p-1">
                <X className="w-4 h-4 text-gray-500" />
            </button>
        </div>
    );
}

// 2. Updated Logout Modal (Accepts isLoading)
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
                            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                "Log out"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// UploadBox Component
function UploadBox({ onUpload, onCancel, file }) {
    if (file) {
        return (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between mb-3 max-w-md w-full mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                        <Paperclip className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                </div>
                <button onClick={onCancel} className="p-1.5 hover:bg-blue-100 rounded transition-colors">
                    <X className="w-4 h-4 text-gray-600" />
                </button>
            </div>
        );
    }
    return null;
}

// ProcessingLoader Component
function ProcessingLoader({ stage }) {
    const stages = [
        { label: "Reading document...", icon: "📄" },
        { label: "Analyzing risks...", icon: "🔍" },
        { label: "Finalizing results...", icon: "✨" }
    ];

    return (
        <div className="flex flex-col items-center justify-center py-8">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
            <p className="text-base font-medium text-gray-900 mb-1">
                {stages[stage]?.icon} {stages[stage]?.label}
            </p>
            <p className="text-sm text-gray-500">Please wait...</p>
        </div>
    );
}

// RiskBadge Component
function RiskBadge({ level, count, onClick }) {
    const styles = {
        low: "bg-green-100 text-green-700 border-green-300",
        medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
        high: "bg-red-100 text-red-700 border-red-300"
    };

    const icons = {
        low: "🟢",
        medium: "🟡",
        high: "🔴"
    };

    return (
        <button
            onClick={onClick}
            className={`${styles[level]} border px-3 py-1.5 rounded-full font-medium text-sm flex items-center gap-2 hover:shadow-md transition-all`}
        >
            <span>{icons[level]}</span>
            <span className="capitalize">{level} Risk</span>
            <span className="bg-white bg-opacity-60 px-2 py-0.5 rounded-full text-xs">{count}</span>
        </button>
    );
}

// ResultCard Component
function ResultCard({ analysis, scrollToClause }) {
    const riskCounts = {
        low: analysis.clauses.filter(c => c.risk_level === 'low').length,
        medium: analysis.clauses.filter(c => c.risk_level === 'medium').length,
        high: analysis.clauses.filter(c => c.risk_level === 'high').length
    };

    const overallRisk = riskCounts.high > 0 ? 'High' : riskCounts.medium > 2 ? 'Medium' : 'Low';
    const riskColor = overallRisk === 'High' ? 'text-red-600' : overallRisk === 'Medium' ? 'text-yellow-600' : 'text-green-600';

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 max-w-3xl w-full">
            <div className="text-center py-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                <Shield className={`w-14 h-14 mx-auto mb-3 ${riskColor}`} />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Overall Risk: {overallRisk}</h2>
                <p className="text-gray-600 px-4">{analysis.summary}</p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
                {riskCounts.low > 0 && <RiskBadge level="low" count={riskCounts.low} onClick={() => scrollToClause('low')} />}
                {riskCounts.medium > 0 && <RiskBadge level="medium" count={riskCounts.medium} onClick={() => scrollToClause('medium')} />}
                {riskCounts.high > 0 && <RiskBadge level="high" count={riskCounts.high} onClick={() => scrollToClause('high')} />}
            </div>

            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Identified Clauses
                </h3>
                {analysis.clauses.map((clause, idx) => (
                    <div
                        key={idx}
                        id={`clause-${clause.risk_level}-${idx}`}
                        className={`border-l-4 p-4 rounded-lg ${clause.risk_level === 'high'
                            ? 'border-red-500 bg-red-50'
                            : clause.risk_level === 'medium'
                                ? 'border-yellow-500 bg-yellow-50'
                                : 'border-green-500 bg-green-50'
                            }`}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 text-sm">{clause.clause}</h4>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${clause.risk_level === 'high'
                                ? 'bg-red-200 text-red-800'
                                : clause.risk_level === 'medium'
                                    ? 'bg-yellow-200 text-yellow-800'
                                    : 'bg-green-200 text-green-800'
                                }`}>
                                {clause.risk_level.toUpperCase()}
                            </span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">{clause.explanation}</p>
                    </div>
                ))}
            </div>

            {analysis.missing_protections && analysis.missing_protections.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-orange-600" />
                        Missing Protections
                    </h3>
                    <ul className="space-y-2">
                        {analysis.missing_protections.map((protection, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="text-orange-500 mt-0.5">⚠️</span>
                                <span>{protection}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

// RecordingWave Component
function RecordingWave({ analyserRef, dataArrayRef, isRecording }) {
    const bars = 24;
    const barRefs = useRef([]);

    useEffect(() => {
        let rafId;
        const render = () => {
            if (analyserRef?.current && dataArrayRef?.current) {
                try {
                    analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
                    const data = dataArrayRef.current;
                    const segment = Math.floor(data.length / bars);
                    for (let i = 0; i < bars; i++) {
                        const start = i * segment;
                        let sum = 0;
                        for (let j = 0; j < segment; j++) sum += Math.abs(data[start + j] - 128);
                        const avg = sum / segment;
                        const height = Math.min(1, avg / 64); 
                        const el = barRefs.current[i];
                        if (el) {
                            el.style.transform = `scaleY(${0.2 + height * 1.2})`;
                            el.style.opacity = `${0.3 + height * 0.7}`;
                        }
                    }
                } catch (e) { }
            } else {
                for (let i = 0; i < bars; i++) {
                    const el = barRefs.current[i];
                    if (el) {
                        const rand = 0.2 + 0.8 * Math.abs(Math.sin(Date.now() / 200 + i));
                        el.style.transform = `scaleY(${rand})`;
                        el.style.opacity = `${0.35 + 0.65 * rand}`;
                    }
                }
            }
            rafId = requestAnimationFrame(render);
        };
        if (isRecording) render();
        return () => cancelAnimationFrame(rafId);
    }, [analyserRef, dataArrayRef, isRecording]);

    return (
        <div className="flex items-end gap-1 px-2" style={{ width: 80, height: 22 }}>
            {Array.from({ length: bars }).map((_, i) => (
                <div
                    key={i}
                    ref={el => (barRefs.current[i] = el)}
                    className="bg-gray-400 rounded-sm w-1"
                    style={{ transformOrigin: 'center bottom', transform: 'scaleY(0.3)', transition: 'transform 80ms linear, opacity 80ms linear' }}
                />
            ))}
        </div>
    );
}

// ==========================================
// MAIN APP COMPONENT
// ==========================================

export default function Home() {
    const router = useRouter(); 
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [processingStage, setProcessingStage] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isAuthChecking, setIsAuthChecking] = useState(true); 
    const [user, setUser] = useState(null); 
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    
    // New States for Logout UX
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const rafRef = useRef(null);
    const fileInputRef = useRef(null);

    // ==========================================
    // 1. AUTH CHECKING
    // ==========================================
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/me', { cache: 'no-store' }); 
                
                if (!res.ok) {
                    throw new Error("Unauthorized");
                }
                
                const data = await res.json();
                setUser(data.user); 
                setIsAuthChecking(false);
            } catch (error) {
                console.log("Not authenticated, redirecting...");
                router.push('/'); 
            }
        };

        checkAuth();
    }, [router]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load/Persist chat
    useEffect(() => {
        try {
            const raw = localStorage.getItem('chat_messages');
            if (raw) setMessages(JSON.parse(raw));
        } catch (e) { }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('chat_messages', JSON.stringify(messages));
        } catch (e) { }
    }, [messages]);

    // Voice Recognition Setup
    useEffect(() => {
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                setInputText(transcript);
            };

            recognitionRef.current.onerror = () => {
                setIsRecording(false);
            };
        }
    }, []);

    // Cleanup
    useEffect(() => {
        return () => {
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(t => t.stop());
            }
            if (audioContextRef.current) {
                try { audioContextRef.current.close(); } catch (e) { }
            }
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, []);

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(t => t.stop());
                mediaStreamRef.current = null;
            }
            if (audioContextRef.current) {
                try { audioContextRef.current.close(); } catch (e) { }
                audioContextRef.current = null;
            }
            setIsRecording(false);
        } else {
            recognitionRef.current?.start();
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
                    mediaStreamRef.current = stream;
                    try {
                        const AudioContext = window.AudioContext || window.webkitAudioContext;
                        const audioCtx = new AudioContext();
                        audioContextRef.current = audioCtx;
                        const source = audioCtx.createMediaStreamSource(stream);
                        const analyser = audioCtx.createAnalyser();
                        analyser.fftSize = 256;
                        const bufferLength = analyser.frequencyBinCount;
                        const dataArray = new Uint8Array(bufferLength);
                        analyserRef.current = analyser;
                        dataArrayRef.current = dataArray;
                        source.connect(analyser);
                        const tick = () => {
                            rafRef.current = requestAnimationFrame(tick);
                        };
                        tick();
                    } catch (e) {
                        console.warn('AudioContext not available', e);
                    }
                }).catch(err => {
                    console.warn('getUserMedia error', err);
                });
            }
            setIsRecording(true);
        }
    };

    const animateAssistantContent = (fullText) => {
        if (!fullText) {
            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
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
            charIndex += 1;
            const current = fullText.slice(0, charIndex);
            setMessages(prev => {
                const copy = [...prev];
                if (!copy[msgIdx]) {
                    copy.push({ role: 'assistant', content: current });
                } else {
                    copy[msgIdx] = { ...copy[msgIdx], content: current };
                }
                return copy;
            });
            if (charIndex < fullText.length) {
                setTimeout(step, 15);
            }
        };
        step();
    };

    const handleFileUpload = (uploadedFile) => {
        setFile(uploadedFile);
    };

    const handleNewChat = () => {
        setMessages([]);
        setInputText("");
        setFile(null);
        setSidebarOpen(false); 
    };

    // ==========================================
    // 2. UPDATED LOGOUT LOGIC (With Loading & Toast)
    // ==========================================
    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const performLogout = async () => {
        setIsLoggingOut(true); // Start loading state in modal
        try {
            const res = await fetch('/api/auth/logout', { method: 'POST' });
            
            if (res.ok) {
                // Show Success Toast
                setToast({ show: true, message: 'Logged out successfully', type: 'success' });
                localStorage.removeItem('chat_messages');
                
                // Wait 1.5 seconds so user sees the toast, then close modal and redirect
                setTimeout(() => {
                    setShowLogoutModal(false);
                    router.push('/');
                }, 1500);
            } else {
                throw new Error("Logout failed");
            }
        } catch (error) {
            console.error("Logout failed", error);
            setToast({ show: true, message: 'Failed to log out. Please try again.', type: 'error' });
            setIsLoggingOut(false); // Stop loading so they can try again
            
            // Hide error toast after 3s
            setTimeout(() => setToast({ ...toast, show: false }), 3000);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim() && !file) return;

        const textToSend = inputText || "Analyze this document";
        const greet = textToSend.trim().toLowerCase();
        const greetingRegex = /^(hi+|hello|hey|hii|namaste|नमस्ते|hello\.!|hiya|yo|sup)$/i;
        
        if (greetingRegex.test(greet)) {
            const userMsg = { role: 'user', content: textToSend, file: file?.name };
            const assistantMsg = {
                role: 'assistant',
                content: `Hi ${user?.name ? user.name.split(' ')[0] : ''}! 👋 I can help review contracts and highlight risks.`
            };
            setMessages(prev => [...prev, userMsg, assistantMsg]);
            setInputText("");
            setLoading(false);
            return;
        }

        const userMessage = {
            role: "user",
            content: textToSend,
            file: file?.name
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText("");
        setLoading(true);

        try {
            if (file) {
                setProcessingStage(0);
                const formData = new FormData();
                formData.append("file", file);

                const ocrRes = await fetch("/api/ocr", {
                    method: "POST",
                    body: formData,
                });
                const ocrData = await ocrRes.json();

                setProcessingStage(1);
                const aiRes = await fetch("/api/generate-content", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        documentText: ocrData.text,
                        message: textToSend
                    }),
                });
                const aiData = await aiRes.json();

                setProcessingStage(2);
                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        role: "assistant",
                        analysis: aiData.data
                    }]);
                    setFile(null);
                    setLoading(false);
                }, 500);
            } else {
                const response = await fetch("/api/generate-content", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message: textToSend
                    }),
                });
                const data = await response.json();

                let assistantContent = "";
                if (data && data.data) {
                    assistantContent = data.data.summary || data.data.response || JSON.stringify(data.data);
                } else {
                    assistantContent = data.response || data.content || JSON.stringify(data);
                }

                animateAssistantContent(assistantContent);
                setLoading(false);
            }
        } catch (error) {
            console.error("Error:", error);
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Sorry, there was an error processing your request."
            }]);
            setLoading(false);
        }
    };

    const scrollToClause = (riskLevel) => {
        const element = document.getElementById(`clause-${riskLevel}-0`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    // If checking auth, show a full-screen loader
    if (isAuthChecking) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Verifying access...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-white overflow-hidden relative">
            
            {/* TOAST NOTIFICATION */}
            <Toast 
                message={toast.message} 
                type={toast.type} 
                isVisible={toast.show} 
                onClose={() => setToast({ ...toast, show: false })}
            />

            {/* LOGOUT MODAL */}
            <LogoutModal 
                isOpen={showLogoutModal} 
                onClose={() => !isLoggingOut && setShowLogoutModal(false)} // Prevent closing while loading
                onConfirm={performLogout} 
                isLoading={isLoggingOut} // Pass loading state to modal
            />

            {/* ================= Sidebar ================= */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside className={`
                fixed md:static inset-y-0 left-0 z-30
                w-64 bg-gray-50 border-r border-gray-200 transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
                flex flex-col
            `}>
                <div className="p-4 border-b border-gray-200 flex items-center gap-2">
                    <Image
                        src="/logo.svg"
                        width={32}
                        height={32}
                        alt="Logo"
                        className="w-8 h-8"
                    />
                    <span className="font-bold text-gray-900">Legal Advisor</span>
                    <button 
                        onClick={() => setSidebarOpen(false)}
                        className="md:hidden ml-auto p-1 text-gray-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 p-4 overflow-y-auto">
                    <button 
                        onClick={handleNewChat}
                        className="w-full flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-sm mb-6"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="font-medium">New Chat</span>
                    </button>

                    <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Recent</p>
                        {messages.length > 0 ? (
                            <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-sm text-left truncate">
                                <MessageSquare className="w-4 h-4 shrink-0 text-gray-400" />
                                <span className="truncate">Current Session</span>
                            </button>
                        ) : (
                            <p className="text-sm text-gray-400 px-2 italic">No history yet</p>
                        )}
                    </div>
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 overflow-hidden relative border border-blue-200">
                            {user?.avatar ? (
                                <img 
                                    src={user.avatar} 
                                    alt={user.name} 
                                    className="w-full h-full object-cover" 
                                />
                            ) : (
                                <User className="w-4 h-4" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.name || "User Account"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {user?.email || "user@example.com"}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogoutClick}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                    >
                        <LogOut className="w-4 h-4" />
                        Log out
                    </button>
                </div>
            </aside>

            {/* ================= Main Content ================= */}
            <main className="flex-1 flex flex-col h-full w-full relative">
                <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setSidebarOpen(true)}
                                className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <div className="md:hidden flex items-center gap-2">
                                <Image src="/logo.svg" width={28} height={28} alt="Logo" />
                                <span className="font-bold text-gray-900">Legal Advisor</span>
                            </div>
                            <h1 className="hidden md:block text-lg font-medium text-gray-700">
                                Contract Analysis AI
                            </h1>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-3xl mx-auto px-4 py-8">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center min-h-[50vh] mt-10">
                                <Image
                                    src="/logo.svg"
                                    width={120}
                                    height={120}
                                    alt="Legal Risk Radar"
                                    className="w-24 h-24 mb-6 animate-pulse"
                                />
                                <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4 text-center min-h-[60px]">
                                    <TypeAnimation
                                        sequence={[
                                            `Hello ${user?.name?.split(' ')[0] || 'there'}!`,
                                            1000,
                                            "Where should we begin?",
                                            1000,
                                            "शुरुआत कहां से करें?",
                                            1000,
                                            "आम्ही कुठून सुरुवात करावी?",
                                            1000,
                                        ]}
                                        wrapper="span"
                                        speed={5}
                                        repeat={Infinity}
                                    />
                                </h2>
                                <p className="text-gray-500 text-center max-w-md">
                                    Upload a contract or ask me anything about legal documents
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-8 pb-4">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.role === 'user' ? (
                                            <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-5 py-3 max-w-[85%] shadow-sm">
                                                {msg.file && (
                                                    <div className="text-xs text-blue-100 mb-2 flex items-center gap-1 bg-blue-700/50 p-1.5 rounded">
                                                        <Paperclip className="w-3 h-3" />
                                                        {msg.file}
                                                    </div>
                                                )}
                                                <p className="leading-relaxed">{msg.content}</p>
                                            </div>
                                        ) : msg.analysis ? (
                                            <div className="w-full">
                                                <ResultCard analysis={msg.analysis} scrollToClause={scrollToClause} />
                                            </div>
                                        ) : (
                                            <div className="max-w-3xl w-full">
                                                <div className="flex gap-4">
                                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-1">
                                                        <Image src="/logo.svg" width={20} height={20} alt="AI" />
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        <p className="text-gray-800 leading-relaxed">{msg.content}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {loading && (
                                    <div className="flex justify-start w-full">
                                        <div className="max-w-3xl w-full bg-gray-50 rounded-xl p-6 border border-gray-100">
                                            <ProcessingLoader stage={processingStage} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <div className="p-4 bg-white">
                    <div className="max-w-3xl mx-auto">
                        {file && (
                            <div className="flex justify-center mb-2">
                                <UploadBox file={file} onCancel={() => setFile(null)} />
                            </div>
                        )}

                        <div className="bg-gray-50 border border-gray-200 rounded-3xl shadow-sm focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
                            <div className="flex items-end gap-2 p-2">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-3 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"
                                    title="Attach File"
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
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder="Ask anything..."
                                    rows={1}
                                    className="flex-1 bg-transparent resize-none border-none focus:ring-0 p-3 max-h-32 text-gray-900 placeholder-gray-500"
                                    style={{ minHeight: '44px' }}
                                />

                                <div className="flex items-center gap-1">
                                    <div className="hidden sm:block">
                                        <RecordingWave analyserRef={analyserRef} dataArrayRef={dataArrayRef} isRecording={isRecording} />
                                    </div>
                                    <button
                                        onClick={toggleRecording}
                                        className={`p-3 rounded-full transition-all ${isRecording 
                                            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                            : 'text-gray-500 hover:bg-gray-200'
                                        }`}
                                    >
                                        {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={handleSend}
                                        disabled={loading || (!inputText.trim() && !file)}
                                        className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-md"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-center text-gray-400 mt-2">
                            AI can make mistakes. Please verify important information.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}