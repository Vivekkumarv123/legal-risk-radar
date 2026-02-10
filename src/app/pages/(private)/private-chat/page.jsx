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
    Share2, Crown, Scale, Sparkles, ChevronDown, ChevronRight,
    Briefcase, FileCode, Users, ArrowRight, Globe, PlusCircle,
    Settings as SettingsIcon, HelpCircle, Download, Keyboard, Bug,
    Home, CreditCard, Bell, FileQuestion, Zap, Book, CheckCircle,
    ArrowLeft
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { isGreeting, getGreetingResponse } from "@/utils/greetingHandler";
import dynamic from "next/dynamic";

// Dynamically import tool components (Keep your existing imports)
const ClauseComparison = dynamic(() => import("@/components/clause-comparison/ClauseComparison"), { loading: () => <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div> });
const LegalGlossary = dynamic(() => import("@/components/legal-glossary/LegalGlossary"), { loading: () => <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div> });
const LegalCommunity = dynamic(() => import("@/components/community/LegalCommunity"), { loading: () => <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div> });

// Profile Dropdown Component (Dark Mode Updated)
function ProfileDropdown({ isOpen, onClose, user, onUpgrade, onSettings, onLogout, onHelpCenter, onReleaseNotes, onTerms, onReportBug, position = "top" }) {
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
                {/* <button
                    onClick={onSettings}
                    className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
                >
                    <SettingsIcon className="w-4 h-4" />
                    <span className="text-sm">Settings</span>
                </button> */}

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

            {/* Logout */}
            <div className="p-2 border-t border-gray-100">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Log out</span>
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

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function Demo() {
    const router = useRouter();

    // STATE
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [file, setFile] = useState(null);
    const [files, setFiles] = useState([]); // Multiple files support
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

    // New state for enhanced sidebar
    const [toolsOpen, setToolsOpen] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [temporaryChat, setTemporaryChat] = useState(false);
    const [activeTool, setActiveTool] = useState(null);
    const [isRecognitionRunning, setIsRecognitionRunning] = useState(false);

    // Existing states...
    const [documentContext, setDocumentContext] = useState("");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [wasVoiceInput, setWasVoiceInput] = useState(false);
    const [guestId, setGuestId] = useState("");
    const [isLiveMode, setIsLiveMode] = useState(false);
    const [liveStatus, setLiveStatus] = useState("idle");
    const [speechLanguage, setSpeechLanguage] = useState('hi-IN');
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

    // Search chats functionality
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeoutRef = useRef(null);

    // Rename chat functionality
    const [chatToRename, setChatToRename] = useState(null);
    const [newChatTitle, setNewChatTitle] = useState("");
    const [isRenamingChat, setIsRenamingChat] = useState(false);

    // Drag and drop state
    const [isDragging, setIsDragging] = useState(false);

    const MAX_FILES = 3;

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

    // Tool items for collapsible section
    const toolItems = [
        { id: 'compare_docs', label: 'Compare Docs', icon: FileCode, description: 'Compare legal documents' },
        { id: 'glossary_tool', label: 'Glossary', icon: Book, description: 'Legal terminology' },
        { id: 'community_tool', label: 'Community', icon: Users, description: 'Share and learn' },
    ];

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
            if (v.length > 0) setAvailableVoices(v);
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/me', {
                    cache: 'no-store',
                    credentials: 'include' // Ensure cookies are sent
                });

                if (!res.ok) {
                    // If auth fails, check if we have tokens in localStorage
                    const accessToken = localStorage.getItem('accessToken');
                    const refreshToken = localStorage.getItem('refreshToken');

                    if (!accessToken && !refreshToken) {
                        // No tokens at all, redirect to login
                        console.log('No authentication found, redirecting to login');
                        router.push('/pages/login');
                        return;
                    }

                    // Tokens exist but API failed - might be expired
                    console.warn('Auth check failed but tokens exist:', res.status);

                    if (res.status === 401) {
                        // Token expired, clear and redirect
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
                // On error, check if we have any auth tokens
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
            // Ctrl+Shift+O - New Chat
            if (e.ctrlKey && e.shiftKey && e.key === 'O') {
                e.preventDefault();
                handleNewChat();
            }
            // Ctrl+Shift+L - Live Chat
            if (e.ctrlKey && e.shiftKey && e.key === 'L') {
                e.preventDefault();
                setIsLiveMode(true);
            }
            // Ctrl+K - Search Chats
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                setShowSearchModal(true);
            }
            // ESC - Close modals
            if (e.key === 'Escape') {
                setShowSearchModal(false);
                setShowShareModal(false);
                setShowLogoutModal(false);
                setChatToDelete(null);
                setChatToRename(null);
                setShowUsageLimitModal(false);
                // Close all three-dot menus
                document.querySelectorAll('.chat-menu').forEach(menu => menu.classList.add('hidden'));
            }
        };

        // Close three-dot menus when clicking outside
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

    // ==========================================
    // LOGIC & HANDLERS (UNCHANGED)
    // ==========================================
    const getBestVoice = (text) => {
        if (!availableVoices.length) return null;
        const isIndianLang = /[\u0900-\u097F]/.test(text);
        if (isIndianLang) return availableVoices.find(v => v.lang.includes('hi') || v.name.includes('Hindi')) || null;
        return availableVoices.find(v => v.lang === 'en-US' || v.name.includes('Google US English')) || null;
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
        if (!text) {
            console.warn('No text to speak');
            return;
        }
        window.speechSynthesis.cancel();
        const cleanText = cleanMarkdown(text);
        if (!cleanText) {
            console.warn('Text is empty after cleaning');
            return;
        }
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

    const startLiveLoop = () => {
        if (!recognitionRef.current) return;
        if (liveCooldownRef.current) return;
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
            recognition.interimResults = false;
            recognition.maxAlternatives = 3;
            recognition.lang = speechLanguage;
            recognition.onresult = (event) => {
                let finalTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
                }
                if (finalTranscript.trim()) handleLiveInput(finalTranscript);
            };
            recognition.onerror = (event) => {
                setIsRecognitionRunning(false);
                if (event.error === 'no-speech') return;
                if (isLiveMode) {
                    setLiveStatus("idle");
                    setTimeout(() => { if (isLiveMode) startLiveLoop(); }, 1500);
                } else { setIsRecording(false); }
            };
            recognition.onnomatch = () => {
                if (isLiveMode) {
                    try { recognitionRef.current?.stop(); } catch (e) { }
                    setIsRecognitionRunning(false);
                    speakText("I didn't hear anything.");
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

    const handleFileUpload = (uploadedFile) => { setFile(uploadedFile); };

    const toggleRecording = () => {
        if (isRecording) { recognitionRef.current?.stop(); setIsRecording(false); }
        else { recognitionRef.current?.start(); setWasVoiceInput(true); setIsRecording(true); }
    };

    const handleNewChat = () => {
        setMessages([]);
        setInputText("");
        setFile(null);
        setFiles([]);
        setChatId(null);
        setDocumentContext("");
        setSidebarOpen(false);
        setTemporaryChat(false);
        setActiveTool(null); // Close any active tool
        toast.success("New chat started");
    };

    const handleTemporaryChat = () => {
        if (temporaryChat) {
            // Disable temporary chat mode
            setTemporaryChat(false);
            toast.success("Temporary chat disabled");
        } else {
            // Enable temporary chat mode
            setMessages([]);
            setInputText("");
            setFile(null);
            setFiles([]);
            setChatId(null);
            setDocumentContext("");
            setSidebarOpen(false);
            setTemporaryChat(true);
            setActiveTool(null); // Close any active tool
            toast.success("Temporary chat started");
        }
    };

    const handleLogoutClick = () => setShowLogoutModal(true);

    const performLogout = async () => {
        setIsLoggingOut(true);
        try {
            // Clear local storage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');

            const res = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            if (res.ok) {
                toast.success('Logged out successfully');
                setTimeout(() => {
                    setShowLogoutModal(false);
                    router.push('/pages/login');
                }, 500);
            } else {
                throw new Error("Logout Failed");
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Even if API fails, clear local data and redirect
            toast.success('Logged out');
            setTimeout(() => {
                setShowLogoutModal(false);
                router.push('/pages/login');
            }, 500);
        }
    };

    const fetchChats = async () => {
        setIsLoadingHistory(true);
        try {
            const res = await fetch('/api/chats', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                if (data.success) setChatHistory(data.chats);
            }
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
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (res.ok) {
                toast.success("Chat deleted");
                setChatHistory(prev => prev.filter(chat => chat.id !== chatToDelete));
                if (chatId === chatToDelete) handleNewChat();
            } else {
                throw new Error("Failed to delete");
            }
        } catch (error) {
            toast.error("Failed to delete chat");
        } finally {
            setIsDeletingChat(false);
            setChatToDelete(null);
        }
    };

    const handleRenameChat = async () => {
        if (!chatToRename || !newChatTitle.trim()) return;

        setIsRenamingChat(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('/api/chats/update-title', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chatId: chatToRename,
                    title: newChatTitle.trim()
                })
            });

            if (res.ok) {
                toast.success("Chat renamed");
                // Update chat history
                setChatHistory(prev => prev.map(chat =>
                    chat.id === chatToRename
                        ? { ...chat, title: newChatTitle.trim() }
                        : chat
                ));
                setChatToRename(null);
                setNewChatTitle("");
            } else {
                throw new Error("Failed to rename");
            }
        } catch (error) {
            toast.error("Failed to rename chat");
        } finally {
            setIsRenamingChat(false);
        }
    };

    const startRenameChat = (e, chatId, currentTitle) => {
        e.stopPropagation();
        setChatToRename(chatId);
        setNewChatTitle(currentTitle);
    };

    // Handle paste events (Ctrl+V)
    useEffect(() => {
        const handlePaste = async (e) => {
            // Only handle paste when in the main chat area (not in modals or specific inputs)
            const isInModal = e.target.closest('.modal-content');
            const isInRenameInput = chatToRename !== null;
            const isInSearchModal = showSearchModal;

            if (isInModal || isInRenameInput || isInSearchModal) {
                return;
            }

            const items = e.clipboardData?.items;
            if (!items) return;

            let handled = false;
            const pastedFiles = [];

            for (let i = 0; i < items.length; i++) {
                const item = items[i];

                // Handle image paste
                if (item.type.indexOf('image') !== -1) {
                    e.preventDefault();
                    const blob = item.getAsFile();
                    if (blob) {
                        // Create a File object with proper name
                        const fileName = `pasted-image-${Date.now()}-${i}.png`;
                        const file = new File([blob], fileName, { type: blob.type });
                        pastedFiles.push(file);
                        handled = true;
                    }
                }
            }

            if (pastedFiles.length > 0) {
                addFiles(pastedFiles);
                return;
            }

            // Handle text paste only if no image was pasted
            if (!handled) {
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    if (item.type === 'text/plain') {
                        item.getAsString((text) => {
                            if (text.length > 200 && !inputText) {
                                setInputText(text);
                                toast.success('Text pasted! Ready to analyze.');
                            }
                        });
                    }
                }
            }
        };

        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [chatToRename, showSearchModal, inputText, files]);

    // Handle drag and drop
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Check if dragging files
        if (e.dataTransfer.types && e.dataTransfer.types.includes('Files')) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Only hide overlay when leaving the window
        if (e.target === e.currentTarget) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Set the drop effect
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'copy';
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFiles = e.dataTransfer?.files;
        if (!droppedFiles || droppedFiles.length === 0) return;

        addFiles(droppedFiles);
    };

    // Add global drag and drop listeners
    useEffect(() => {
        const preventDefaults = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        // Prevent default drag behaviors on document
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

    const handleSearchMessages = (query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        const results = messages.filter(msg =>
            msg.content?.toLowerCase().includes(query.toLowerCase()) ||
            msg.analysis?.summary?.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(results);
    };

    const handleSearchChats = async (query) => {
        setSearchQuery(query);

        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // If query is empty, clear results immediately
        if (!query.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        // Minimum 2 characters required for search
        if (query.trim().length < 2) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        // Show loading state immediately
        setIsSearching(true);

        // Debounce: Wait 500ms after user stops typing
        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`/api/chats?search=${encodeURIComponent(query)}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    cache: 'no-store'
                });

                if (response.ok) {
                    const data = await response.json();
                    setSearchResults(data.chats || []);
                } else {
                    setSearchResults([]);
                }
            } catch (error) {
                console.error('Search error:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 500); // 500ms debounce delay
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    const handleShareChat = async () => {
        if (!chatId || temporaryChat) {
            toast.error("Cannot share temporary chats");
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('/api/share-chat', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ chatId })
            });

            if (res.ok) {
                const data = await res.json();
                const shareUrl = `${window.location.origin}/shared/${data.shareId}`;

                // Copy to clipboard
                await navigator.clipboard.writeText(shareUrl);
                toast.success("Share link copied to clipboard!");
                setShowShareModal(true);
            } else {
                throw new Error("Failed to share");
            }
        } catch (error) {
            toast.error("Failed to share chat");
        }
    };

    const animateAssistantContent = (fullText) => {
        setIsGenerating(true);
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
        let charIndex = 0;
        const interval = setInterval(() => {
            charIndex += 5;
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
        }, 8);
    };

    const handleLoadChat = async (id) => {
        if (id === chatId) return;
        setLoading(true); setSidebarOpen(false); setTemporaryChat(false);
        try {
            const res = await fetch(`/api/chats/${id}`);
            const data = await res.json();
            if (data.success) {
                setChatId(id);
                setDocumentContext(data.documentContext || "");
                const formattedMessages = data.messages.map(msg => ({
                    role: msg.role || 'user',
                    content: msg.content,
                    analysis: msg.analysisData ? {
                        summary: msg.analysisData.summary,
                        overall_risk_score: msg.analysisData.overall_risk_score,
                        clauses: Array.isArray(msg.analysisData.clauses) ? msg.analysisData.clauses : []
                    } : msg.analysis,
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
    const handleToolClick = (toolId) => { setActiveTool(toolId); if (window.innerWidth < 768) setSidebarOpen(false); };
    const handleCloseTool = () => { setActiveTool(null); };

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
            setInputText("");
            setIsGenerating(true);
            setTimeout(() => {
                const reply = getGreetingResponse(rawInput);
                setMessages(prev => [...prev, { role: "assistant", content: reply, createdAt: new Date().toISOString() }]);
                setIsGenerating(false);
                if (wasVoiceInput) speakText(reply);
                setWasVoiceInput(false);
            }, 200);
            return;
        }

        // Create user message with file names
        const fileNames = files.length > 0 ? files.map(f => f.name).join(', ') : null;
        const userMsg = { role: "user", content: rawInput || "Analyze document", file: fileNames };
        setMessages(prev => [...prev, userMsg]);

        // Store files reference before clearing
        const filesToProcess = [...files];

        // Clear input and files immediately
        setInputText("");
        setFiles([]);
        setFile(null);
        setLoading(true);
        const isNewConversation = !chatId && !temporaryChat;

        try {
            let apiBody = { message: textToSend, chatId: temporaryChat ? null : chatId };
            if (!isNewDocument && documentContext) apiBody.documentText = documentContext;

            // Process multiple files
            if (filesToProcess.length > 0) {
                setProcessingStage(0);
                let combinedText = '';

                for (let i = 0; i < filesToProcess.length; i++) {
                    const file = filesToProcess[i];
                    const formData = new FormData();
                    formData.append("file", file);

                    const ocrRes = await fetch("/api/ocr", { method: "POST", body: formData });
                    if (!ocrRes.ok) throw new Error(`OCR Failed for ${file.name}`);
                    const ocrData = await ocrRes.json();

                    // Combine text from multiple files
                    if (filesToProcess.length > 1) {
                        combinedText += `\n\n--- Document ${i + 1}: ${file.name} ---\n\n${ocrData.text}`;
                    } else {
                        combinedText = ocrData.text;
                    }
                }

                apiBody.documentText = combinedText;
                setDocumentContext(combinedText);
            }

            setProcessingStage(1);

            // Prepare headers with authentication
            const headers = { "Content-Type": "application/json" };
            const token = localStorage.getItem('accessToken');

            console.log('Sending request with auth:', {
                hasToken: !!token,
                hasGuestId: !!guestId,
                chatId: apiBody.chatId,
                isTemporary: temporaryChat
            });

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            } else if (guestId) {
                headers['x-guest-id'] = guestId;
            }

            const aiRes = await fetch("/api/generate-content", {
                method: "POST",
                headers: headers,
                credentials: 'include', // Include cookies for authentication
                body: JSON.stringify(apiBody),
            });

            if (!aiRes.ok) {
                const errorData = await aiRes.json().catch(() => ({}));

                if (aiRes.status === 401) {
                    // Check if it's a session expired vs auth required
                    if (errorData.sessionExpired) {
                        toast.error("Session expired. Please login again.");
                    } else if (errorData.authRequired) {
                        toast.error("Authentication required. Please login.");
                    } else {
                        toast.error("Authentication failed. Please login again.");
                    }

                    // Clear tokens and redirect
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');

                    setTimeout(() => {
                        router.push('/pages/login');
                    }, 1500);
                    throw new Error("Authentication failed");
                }

                if (aiRes.status === 403 && errorData.isLimitReached) {
                    // Show detailed limit information
                    const limitInfo = {
                        currentUsage: errorData.currentUsage,
                        limit: errorData.limit,
                        resetMessage: errorData.resetMessage,
                        hoursUntilReset: errorData.hoursUntilReset,
                        minutesUntilReset: errorData.minutesUntilReset
                    };

                    setUsageLimitInfo(limitInfo);

                    if (errorData.upgradeRequired) {
                        // User needs to upgrade - show modal
                        toast.error(
                            `Limit reached (${limitInfo.currentUsage}/${limitInfo.limit}). ${limitInfo.resetMessage || 'Resets at midnight'}`,
                            { duration: 4000 }
                        );
                        setShowUsageLimitModal(true);
                    } else {
                        // Guest or free user - show reset time
                        toast.error(
                            `Daily limit reached (${limitInfo.currentUsage || errorData.limit}/${errorData.limit}). ${limitInfo.resetMessage || 'Try again tomorrow'}`,
                            { duration: 5000 }
                        );
                        setShowUsageLimitModal(true);
                    }
                    throw new Error("Limit reached");
                }

                // Handle other errors
                if (errorData.error) {
                    toast.error(errorData.error);
                } else {
                    toast.error("Failed to process request. Please try again.");
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
                if (aiData.data.clauses && aiData.data.clauses.length > 0) {
                    setMessages(prev => [...prev, { role: "assistant", analysis: aiData.data }]);
                    if (wasVoiceInput) speakText("Analysis complete.");
                } else {
                    const textResponse = aiData.data.response || aiData.data.summary || "Done.";
                    animateAssistantContent(textResponse);
                    if (wasVoiceInput) speakText(textResponse);
                }
                setWasVoiceInput(false);
            }, 300);
        } catch (error) {
            toast.error("Error");
            setMessages(prev => [...prev, { role: "assistant", content: "Error processing request." }]);
            setLoading(false); setWasVoiceInput(false);
        }
    };

    if (isAuthChecking) return <div className="flex h-screen items-center justify-center bg-gray-50"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;

    return (
        <div
            className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden relative font-sans"
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >

            {/* LIVE MODE OVERLAY (Light Theme) */}
            {isLiveMode && (
                <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <button onClick={() => {
                        setIsLiveMode(false);
                        window.speechSynthesis.cancel();
                        recognitionRef.current?.stop();
                        setIsRecognitionRunning(false);
                        setLiveStatus("idle");
                    }} className="absolute top-6 right-6 p-3 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-700 transition-colors">
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
                            <h2 className="text-3xl font-bold text-gray-900">{liveStatus === 'listening' ? "I'm listening..." : liveStatus === 'speaking' ? "Speaking..." : liveStatus === 'thinking' ? "Thinking..." : "Tap to Speak"}</h2>
                            <p className="text-gray-600">Live Conversation Mode</p>
                        </div>
                        {liveStatus === 'idle' && (
                            <button disabled={isRecognitionRunning} onClick={startLiveLoop} className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg shadow-lg hover:scale-105 transition-all">Start Talking</button>
                        )}
                        {liveStatus !== 'idle' && (
                            <button onClick={() => { recognitionRef.current?.stop(); window.speechSynthesis.cancel(); setLiveStatus("idle"); setIsRecognitionRunning(false); }} className="px-8 py-4 bg-red-50 text-red-600 border border-red-200 rounded-full font-bold text-lg hover:bg-red-100 transition-all">Stop</button>
                        )}
                    </div>
                </div>
            )}

            {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-20 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}

            {/* SIDEBAR (Light Theme) */}
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
                            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-gray-900">
                                <X className="w-5 h-5" />
                            </button>
                        </>
                    )}
                    {/* Collapse button for desktop */}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="hidden md:block p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {sidebarCollapsed ? (
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        ) : (
                            <Menu className="w-5 h-5 text-gray-600" />
                        )}
                    </button>
                </div>

                {/* New Chat Button */}
                {!sidebarCollapsed && (
                    <div className="p-3 space-y-2">
                        <button
                            onClick={handleNewChat}
                            className="group w-full flex items-center justify-between px-3 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm"
                        >
                            <div className="flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                New Chat
                            </div>
                            <span className="bg-blue-700 text-[10px] px-1.5 py-0.5 rounded text-white">Ctrl+Shift+O</span>
                        </button>

                        {/* Live Chat Button */}
                        <button
                            onClick={() => setIsLiveMode(true)}
                            className="w-full flex items-center justify-between gap-2 px-3 py-3 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-all shadow-sm"
                        >
                            <div className="flex items-center gap-2">
                                <BrainCircuit className="w-4 h-4 animate-pulse" />
                                Live Chat
                            </div>
                            <span className="bg-green-600 text-[10px] px-1.5 py-0.5 rounded text-white">Ctrl+Shift+L</span>
                        </button>

                        {/* Search Chats Button */}
                        <button
                            onClick={() => setShowSearchModal(true)}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm bg-transparent hover:bg-gray-50 text-gray-600 hover:text-gray-900 border border-transparent hover:border-gray-200"
                        >
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                <span>Search Chats</span>
                            </div>
                            <span className="text-[10px] text-gray-400">Ctrl+K</span>
                        </button>
                    </div>
                )}

                {sidebarCollapsed && (
                    <div className="p-2 space-y-2">
                        <button
                            onClick={handleNewChat}
                            className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                            title="New Chat (Ctrl+Shift+O)"
                        >
                            <Plus className="w-5 h-5 mx-auto" />
                        </button>

                        <button
                            onClick={() => setIsLiveMode(true)}
                            className="w-full p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
                            title="Live Chat (Ctrl+Shift+L)"
                        >
                            <Phone className="w-5 h-5 mx-auto animate-pulse" />
                        </button>

                        <button
                            onClick={() => setShowSearchModal(true)}
                            className="w-full p-3 bg-transparent hover:bg-gray-50 text-gray-600 hover:text-gray-900 rounded-lg transition-all border border-transparent hover:border-gray-200"
                            title="Search Chats (Ctrl+K)"
                        >
                            <MessageSquare className="w-5 h-5 mx-auto" />
                        </button>
                    </div>
                )}

                {/* Tools Section */}
                {!sidebarCollapsed && (
                    <div className="px-3 py-1">
                        <button onClick={() => setToolsOpen(!toolsOpen)} className="w-full flex items-center justify-between p-2 text-xs font-semibold text-gray-500 hover:text-gray-700 uppercase tracking-wider transition-colors">
                            <span>Tools</span>
                            {toolsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ${toolsOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="mt-1 space-y-0.5">
                                {toolItems.map((tool) => (
                                    <button
                                        key={tool.id}
                                        onClick={() => handleToolClick(tool.id)}
                                        className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-3 ${activeTool === tool.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'}`}
                                    >
                                        <tool.icon className="w-4 h-4" />
                                        <span className="text-sm font-medium">{tool.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {sidebarCollapsed && (
                    <div className="px-2 py-1 space-y-1">
                        {toolItems.map((tool) => (
                            <button
                                key={tool.id}
                                onClick={() => handleToolClick(tool.id)}
                                className={`w-full p-3 rounded-lg transition-all ${activeTool === tool.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-600'}`}
                                title={tool.label}
                            >
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
                                <button
                                    onClick={() => handleLoadChat(chat.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-all truncate ${chatId === chat.id ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
                                    title={sidebarCollapsed ? chat.title : undefined}
                                >
                                    <MessageSquare className="w-4 h-4 shrink-0" />
                                    {!sidebarCollapsed && <span className="truncate flex-1">{chat.title || "Untitled Chat"}</span>}
                                </button>

                                {/* Three-dot menu */}
                                {!sidebarCollapsed && (
                                    <div className="absolute right-1 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Toggle menu for this chat
                                                const menu = e.currentTarget.nextElementSibling;
                                                // Close all other menus first
                                                document.querySelectorAll('.chat-menu').forEach(m => {
                                                    if (m !== menu) m.classList.add('hidden');
                                                });
                                                menu.classList.toggle('hidden');
                                            }}
                                            className="chat-menu-button p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                                                <circle cx="8" cy="3" r="1.5" />
                                                <circle cx="8" cy="8" r="1.5" />
                                                <circle cx="8" cy="13" r="1.5" />
                                            </svg>
                                        </button>
                                        <div className="chat-menu hidden absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px] z-50">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startRenameChat(e, chat.id, chat.title);
                                                    e.currentTarget.parentElement.classList.add('hidden');
                                                }}
                                                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Rename
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    confirmDeleteChat(e, chat.id);
                                                    e.currentTarget.parentElement.classList.add('hidden');
                                                }}
                                                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Profile Footer */}
                <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="relative">
                        {!sidebarCollapsed ? (
                            <button
                                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                className="w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                            >
                                <Avatar src={user?.avatar} fallback="U" size="sm" className="ring-1 ring-gray-200" />
                                <div className="flex-1 min-w-0 text-left">
                                    <p className="text-sm font-medium text-gray-900 truncate">{user?.name || "User"}</p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                className="w-full p-2 hover:bg-gray-50 rounded-lg transition-colors"
                                title={user?.name || "User"}
                            >
                                <Avatar src={user?.avatar} fallback="U" size="sm" className="ring-1 ring-gray-200 mx-auto" />
                            </button>
                        )}
                        <ProfileDropdown
                            isOpen={showProfileDropdown}
                            onClose={() => setShowProfileDropdown(false)}
                            user={user}
                            onUpgrade={handleUpgradePlan}
                            onSettings={handleSettings}
                            onLogout={handleLogoutClick}
                            onHelpCenter={handleHelpCenter}
                            onReleaseNotes={handleReleaseNotes}
                            onTerms={handleTerms}
                            onReportBug={handleReportBug}
                            position={sidebarCollapsed ? "top" : "top"}
                        />
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT (Light Theme) */}
            <main className="flex-1 flex flex-col h-full w-full relative bg-gray-50">
                {/* Drag Overlay */}
                {isDragging && (
                    <div className="fixed inset-0 z-50 bg-blue-500/10 backdrop-blur-sm flex items-center justify-center">
                        <div className="bg-white rounded-2xl p-8 shadow-2xl border-2 border-dashed border-blue-500">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Paperclip className="w-10 h-10 text-blue-600" />
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-bold text-gray-900 mb-1">Drop your file here</p>
                                    <p className="text-sm text-gray-600">PDF or Image files supported</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <header className="hidden md:flex absolute top-0 left-0 right-0 p-4 justify-between items-center z-20 pointer-events-none">
                    <div className="pointer-events-auto flex items-center gap-3">
                        {activeTool && (
                            <button onClick={handleCloseTool} className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm border border-gray-200 transition-colors shadow-sm">
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                        )}
                    </div>

                    {/* Center - Upgrade Plan */}
                    <div className="pointer-events-auto">
                        <button onClick={handleUpgradePlan} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-lg">
                            <Sparkles className="w-3.5 h-3.5" /> Upgrade Plan
                        </button>
                    </div>

                    {/* Right - Temp Chat & Share */}
                    <div className="pointer-events-auto flex items-center gap-2">
                        {/* Temporary Chat Toggle */}
                        {!activeTool && (
                            <button
                                onClick={handleTemporaryChat}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all shadow-sm ${temporaryChat
                                    ? 'bg-orange-50 border-orange-200 text-orange-600'
                                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                    }`}
                                title="Temporary chat won't be saved"
                            >
                                <Clock className="w-4 h-4" />
                                <span className="font-medium">Temporary</span>
                            </button>
                        )}

                        {/* Share Button - Always visible, disabled when no chat or temporary */}
                        {!activeTool && (
                            <button
                                onClick={handleShareChat}
                                disabled={!chatId || temporaryChat || messages.length === 0}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all shadow-sm ${!chatId || temporaryChat || messages.length === 0
                                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                    }`}
                                title={
                                    temporaryChat
                                        ? "Cannot share temporary chats"
                                        : !chatId || messages.length === 0
                                            ? "Start a chat to enable sharing"
                                            : "Share this chat"
                                }
                            >
                                <Share2 className="w-4 h-4" />
                                <span className="font-medium">Share</span>
                            </button>
                        )}
                    </div>
                </header>

                {/* Mobile Header */}
                <header className="md:hidden bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                    <button onClick={() => setSidebarOpen(true)} className="text-gray-700"><Menu className="w-6 h-6" /></button>
                    <div className="flex items-center gap-2">
                        {temporaryChat && (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-100 rounded-full">
                                <Clock className="w-3.5 h-3.5 text-orange-600" />
                                <span className="text-xs font-medium text-orange-700">Temporary</span>
                            </div>
                        )}
                        <span className="font-semibold text-gray-900">LegalAdvisor</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {chatId && !temporaryChat && messages.length > 0 && (
                            <button onClick={handleShareChat} className="text-gray-700">
                                <Share2 className="w-5 h-5" />
                            </button>
                        )}
                        <button onClick={() => setIsLiveMode(true)} className="text-gray-700"><Mic className="w-6 h-6" /></button>
                    </div>
                </header>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {activeTool ? (
                        <div className="w-full h-full p-6 text-gray-900">
                            {/* Tool Rendering Logic */}
                            {activeTool === 'compare_docs' && <ClauseComparison />}
                            {activeTool === 'glossary_tool' && <LegalGlossary />}
                            {activeTool === 'community_tool' && <LegalCommunity />}
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto px-4 py-8 pt-20">
                            {/* Temporary Chat Banner */}
                            {temporaryChat && (
                                <div className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                                            <Clock className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-orange-900 mb-1">Temporary Chat</h3>
                                            <p className="text-sm text-orange-700">
                                                This chat won't appear in your chat history, and won't be used to train our models.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center min-h-[50vh] mt-8">
                                    {temporaryChat ? (
                                        <>
                                            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 shadow-xl border-2 border-orange-200">
                                                <Clock className="w-8 h-8 text-orange-600" />
                                            </div>
                                            <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">Temporary Chat</h2>
                                            <p className="text-gray-600 text-center mb-6 max-w-md">
                                                This chat won't appear in your chat history, and won't be used to train our models.
                                            </p>
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
                                            <button
                                                key={suggestion}
                                                onClick={() => setInputText(suggestion)}
                                                className="px-4 py-3.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all text-left truncate shadow-sm"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 pb-24">
                                    {messages.map((msg, idx) => (
                                        <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            {msg.role === 'assistant' && (
                                                <div className="w-8 h-8 rounded-sm bg-green-100 flex items-center justify-center shrink-0 border border-green-200 mt-1">
                                                    <Image src="/logo.svg" width={16} height={16} alt="AI" className="opacity-70" />
                                                </div>
                                            )}
                                            <div className={`max-w-[85%] sm:max-w-[80%] space-y-1 ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
                                                {msg.role === 'user' ? (
                                                    <div className="bg-blue-600 text-white px-5 py-3 rounded-2xl rounded-tr-sm shadow-sm">
                                                        {msg.file && <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg mb-2 text-xs"><Paperclip className="w-3 h-3" /> {msg.file}</div>}
                                                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-700 leading-relaxed">
                                                        {msg.analysis ? (
                                                            // Analysis Rendering
                                                            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                                                <h3 className="font-bold text-gray-900 mb-2">Analysis Result</h3>
                                                                <p className="text-sm text-gray-700">{msg.analysis.summary}</p>
                                                            </div>
                                                        ) : (
                                                            <div className="markdown-content prose prose-gray prose-p:leading-relaxed prose-pre:bg-gray-100 prose-pre:border prose-pre:border-gray-200 max-w-none">
                                                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                            </div>
                                                        )}
                                                        {/* Action Buttons for message */}
                                                        <div className="flex gap-2 mt-2">
                                                            <button
                                                                onClick={() => {
                                                                    const textToSpeak = msg.analysis
                                                                        ? msg.analysis.summary || "Analysis complete"
                                                                        : msg.content || "";
                                                                    speakText(textToSpeak);
                                                                }}
                                                                className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-900 transition-colors"
                                                                title="Read aloud"
                                                            >
                                                                <Volume2 className="w-4 h-4" />
                                                            </button>
                                                            {isSpeaking && (
                                                                <button
                                                                    onClick={stopSpeaking}
                                                                    className="p-1.5 hover:bg-gray-100 rounded text-red-500 hover:text-red-700 transition-colors"
                                                                    title="Stop speaking"
                                                                >
                                                                    <StopCircle className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {loading && <div className="flex gap-4"><div className="w-8 h-8 rounded-sm bg-green-100 flex items-center justify-center shrink-0"><Loader2 className="w-4 h-4 text-green-600 animate-spin" /></div><span className="text-gray-600 animate-pulse mt-1">Thinking...</span></div>}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Input Area (Centered & Floating) */}
                {!activeTool && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent z-10">
                        <div className="max-w-3xl mx-auto">
                            {/* Multiple Files Preview - Horizontal Layout */}
                            {files.length > 0 && (
                                <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1">
                                    {files.map((file, index) => (
                                        <div key={index} className="relative group shrink-0">
                                            <div className="w-16 h-16 bg-white border-2 border-gray-200 rounded-xl shadow-sm flex items-center justify-center overflow-hidden">
                                                {file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf') ? (
                                                    <div className="flex flex-col items-center justify-center p-2">
                                                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                                                        </svg>
                                                        <span className="text-[8px] text-gray-500 mt-0.5 font-medium">PDF</span>
                                                    </div>
                                                ) : (
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={file.name}
                                                        className="w-full h-full object-cover"
                                                        onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                                                    />
                                                )}
                                            </div>
                                            <button
                                                onClick={() => removeFile(index)}
                                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-900 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                                                title="Remove file"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent rounded-b-xl p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-[8px] text-white truncate font-medium">{file.name}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className={`bg-white border transition-all duration-200 rounded-2xl shadow-lg flex items-end gap-2 p-2 relative ${isRecording ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100'}`}>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-3 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
                                    title="Attach file (PDF or Image)"
                                >
                                    <PlusCircle className="w-5 h-5" />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,image/*,image/png,image/jpeg,image/jpg,image/webp"
                                    multiple
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            addFiles(e.target.files);
                                        }
                                        e.target.value = ''; // Reset input
                                    }}
                                    className="hidden"
                                />
                                <textarea
                                    ref={textareaRef}
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!loading && !isGenerating) handleSend(); } }}
                                    placeholder={isRecording ? "Listening..." : files.length > 0 ? "Add a message (optional)..." : "Message Legal Advisor... (Ctrl+V to paste)"}
                                    className="flex-1 bg-transparent resize-none border-none focus:ring-0 p-3 max-h-32 text-gray-900 placeholder-gray-400 text-base"
                                    rows={1}
                                />
                                <div className="flex items-center gap-1 pb-1 pr-1">
                                    <button onClick={toggleRecording} className={`p-2 rounded-xl transition-all ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                                        {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                    </button>
                                    <button onClick={handleSend} disabled={loading || (!inputText.trim() && files.length === 0) || isGenerating} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            <p className="text-[10px] text-center text-gray-500 mt-2">
                                Legal Advisor can make mistakes. Verify important information. • Drag & drop files or press Ctrl+V to paste
                            </p>
                        </div>
                    </div>
                )}
            </main>

            {/* Delete Chat Confirmation Modal */}
            {chatToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Delete Chat?</h3>
                                <p className="text-sm text-gray-600">This action cannot be undone</p>
                            </div>
                        </div>

                        <p className="text-gray-700 mb-6">
                            Are you sure you want to delete this chat? All messages and analysis will be permanently removed.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setChatToDelete(null)}
                                disabled={isDeletingChat}
                                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteChat}
                                disabled={isDeletingChat}
                                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isDeletingChat ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rename Chat Modal */}
            {chatToRename && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Rename Chat</h3>
                                <p className="text-sm text-gray-600">Give your chat a new name</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Chat Title
                            </label>
                            <input
                                type="text"
                                value={newChatTitle}
                                onChange={(e) => setNewChatTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !isRenamingChat) {
                                        handleRenameChat();
                                    }
                                }}
                                placeholder="Enter chat title..."
                                autoFocus
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setChatToRename(null);
                                    setNewChatTitle("");
                                }}
                                disabled={isRenamingChat}
                                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRenameChat}
                                disabled={isRenamingChat || !newChatTitle.trim()}
                                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isRenamingChat ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        Save
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Share Chat</h3>
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <p className="text-sm text-green-800 font-medium">
                                Share link copied to clipboard!
                            </p>
                        </div>

                        <p className="text-gray-600 text-sm mb-4">
                            Anyone with this link can view this chat conversation. The link will remain active until you delete the chat.
                        </p>

                        <button
                            onClick={() => setShowShareModal(false)}
                            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}

            {/* Search Chats Modal */}
            {showSearchModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <MessageSquare className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Search Chats</h3>
                                    <p className="text-sm text-gray-500">Find your conversations</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowSearchModal(false);
                                    setSearchQuery("");
                                    setSearchResults([]);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChats(e.target.value)}
                                    placeholder="Type to search chats..."
                                    autoFocus
                                    className="w-full px-4 py-3 pl-11 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                                />
                                <MessageSquare className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                                {isSearching && (
                                    <Loader2 className="absolute right-4 top-3.5 w-4 h-4 text-blue-600 animate-spin" />
                                )}
                            </div>
                        </div>

                        {/* Search Results */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {!searchQuery ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <MessageSquare className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 text-sm">Start typing to search your chats</p>
                                    <p className="text-gray-400 text-xs mt-1">Minimum 2 characters required</p>
                                </div>
                            ) : searchQuery.trim().length < 2 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                        <MessageSquare className="w-8 h-8 text-blue-400" />
                                    </div>
                                    <p className="text-gray-500 text-sm">Type at least 2 characters to search</p>
                                </div>
                            ) : isSearching ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                </div>
                            ) : searchResults.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <AlertCircle className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-900 font-medium mb-1">No chats found</p>
                                    <p className="text-gray-500 text-sm">Try a different search term</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-xs text-gray-500 mb-3 px-2">
                                        Found {searchResults.length} {searchResults.length === 1 ? 'chat' : 'chats'}
                                    </p>
                                    {searchResults.map((chat) => (
                                        <button
                                            key={chat.id}
                                            onClick={() => {
                                                handleLoadChat(chat.id);
                                                setShowSearchModal(false);
                                                setSearchQuery("");
                                                setSearchResults([]);
                                            }}
                                            className="w-full flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-all text-left group"
                                        >
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors">
                                                <MessageSquare className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-900 truncate mb-1">
                                                    {chat.title || "Untitled Chat"}
                                                </h4>
                                                <p className="text-sm text-gray-500 line-clamp-2">
                                                    {chat.lastMessage || "No messages yet"}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(chat.updatedAt || chat.createdAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <LogOut className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Logout</h3>
                                <p className="text-sm text-gray-600">Are you sure you want to logout?</p>
                            </div>
                        </div>

                        <p className="text-gray-700 mb-6">
                            You will be redirected to the login page.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                disabled={isLoggingOut}
                                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={performLogout}
                                disabled={isLoggingOut}
                                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoggingOut ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Logging out...
                                    </>
                                ) : (
                                    <>
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Usage Limit Reached Modal */}
            <UsageLimitReachedModal
                isOpen={showUsageLimitModal}
                onClose={() => setShowUsageLimitModal(false)}
                limitInfo={usageLimitInfo}
                onUpgrade={handleUpgradePlan}
            />
        </div>
    );
}