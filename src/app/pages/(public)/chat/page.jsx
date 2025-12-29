"use client";
import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, Paperclip, X, AlertCircle, Shield, Square } from "lucide-react";
import Image from "next/image";
import { TypeAnimation } from "react-type-animation";

// ============================================
// DATA NORMALIZER (THE FIX)
// ============================================

function normalizeAnalysis(raw) {
    if (!raw) return null;

    return {
        summary: raw.summary || "Analysis complete.",
        clauses: (raw.clauses || []).map(c => {
            // 1. Safety check for risk level
            const rawLevel = c.risk_level ? c.risk_level.toLowerCase() : "low";

            // 2. Map backend "CRITICAL" to frontend "high" so red badges appear
            let normalizedLevel = rawLevel;
            if (rawLevel === "critical") normalizedLevel = "high";
            if (rawLevel === "beneficial") normalizedLevel = "low";

            return {
                // Handle backend using 'clause_snippet' or just 'clause'
                clause: c.clause_snippet || c.clause || "Clause text missing",
                risk_level: normalizedLevel,
                explanation: c.explanation || "No explanation provided.",
                recommendation: c.recommendation || "No recommendation."
            };
        }),
        // Map backend 'missing_clauses' to frontend 'missing_protections'
        missing_protections: raw.missing_clauses || []
    };
}

// ============================================
// FILE UPLOAD COMPONENTS
// ============================================

function FilePreview({ file, onRemove, index }) {
    return (
        <div
            className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between gap-3 animate-fadeIn"
            style={{
                animation: 'slideIn 0.2s ease-out',
                animationDelay: `${index * 0.05}s`
            }}
        >
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
                    <Paperclip className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
            </div>
            <button
                onClick={onRemove}
                className="p-1.5 hover:bg-blue-200 rounded-lg transition-all shrink-0 group"
                aria-label="Remove file"
            >
                <X className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
            </button>
        </div>
    );
}

function FileUploadArea({ files, onAdd, onRemove }) {
    const MAX_FILES = 2;
    const fileInputRef = useRef(null);
    const [showLimitWarning, setShowLimitWarning] = useState(false);

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const remainingSlots = MAX_FILES - files.length;

        if (files.length >= MAX_FILES) {
            setShowLimitWarning(true);
            setTimeout(() => setShowLimitWarning(false), 3000);
            return;
        }

        const filesToAdd = selectedFiles.slice(0, remainingSlots);
        filesToAdd.forEach(file => onAdd(file));

        if (selectedFiles.length > remainingSlots) {
            setShowLimitWarning(true);
            setTimeout(() => setShowLimitWarning(false), 3000);
        }

        e.target.value = '';
    };

    if (files.length === 0) return null;

    return (
        <div className="mb-3 space-y-2">
            <div className="flex flex-col gap-2">
                {files.map((file, idx) => (
                    <FilePreview
                        key={`${file.name}-${idx}`}
                        file={file}
                        index={idx}
                        onRemove={() => onRemove(idx)}
                    />
                ))}
            </div>

            {showLimitWarning && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-orange-800">
                        Maximum 2 files allowed. Additional files were not added.
                    </p>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
            />
        </div>
    );
}

// ============================================
// LOADING & TYPING INDICATORS
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
    const stages = [
        "Reading document...",
        "Analyzing risks...",
        "Finalizing results..."
    ];

    return (
        <div className="flex items-center gap-3 py-2">
            <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-sm text-gray-600">{stages[stage]}</span>
        </div>
    );
}

// ============================================
// VOICE RECORDING COMPONENTS
// ============================================

function RecordingWave({ analyserRef, dataArrayRef, isRecording }) {
    const bars = 20;
    const barRefs = useRef([]);

    useEffect(() => {
        let rafId;
        const render = () => {
            if (analyserRef?.current && dataArrayRef?.current && isRecording) {
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
                            el.style.transform = `scaleY(${0.3 + height * 1.5})`;
                            el.style.opacity = `${0.4 + height * 0.6}`;
                        }
                    }
                } catch (e) { }
            }
            rafId = requestAnimationFrame(render);
        };
        if (isRecording) render();
        return () => cancelAnimationFrame(rafId);
    }, [analyserRef, dataArrayRef, isRecording, bars]);

    if (!isRecording) return null;

    return (
        <div className="flex items-end gap-0.5 px-2 h-5">
            {Array.from({ length: bars }).map((_, i) => (
                <div
                    key={i}
                    ref={el => (barRefs.current[i] = el)}
                    className="bg-red-500 rounded-full w-0.5"
                    style={{
                        transformOrigin: 'center bottom',
                        transform: 'scaleY(0.3)',
                        transition: 'transform 100ms ease-out, opacity 100ms ease-out',
                        height: '100%'
                    }}
                />
            ))}
        </div>
    );
}

// ============================================
// RESULT DISPLAY COMPONENTS
// ============================================

function RiskBadge({ level, count, onClick }) {
    const styles = {
        low: "bg-green-100 text-green-700 border-green-300 hover:bg-green-200",
        medium: "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200",
        high: "bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
    };

    const icons = {
        low: "🟢",
        medium: "🟡",
        high: "🔴"
    };

    return (
        <button
            onClick={onClick}
            className={`${styles[level]} border px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 hover:shadow-md transition-all`}
        >
            <span>{icons[level]}</span>
            <span className="capitalize">{level} Risk</span>
            <span className="bg-white bg-opacity-70 px-2 py-0.5 rounded-full text-xs font-semibold">{count}</span>
        </button>
    );
}

function ResultCard({ analysis, scrollToClause }) {
    // Ensure risk_level comparison matches the normalized data (lowercase)
    const riskCounts = {
        low: analysis.clauses.filter(c => c.risk_level === 'low').length,
        medium: analysis.clauses.filter(c => c.risk_level === 'medium').length,
        high: analysis.clauses.filter(c => c.risk_level === 'high').length
    };

    const overallRisk = riskCounts.high > 0 ? 'High' : riskCounts.medium > 2 ? 'Medium' : 'Low';
    const riskColor = overallRisk === 'High' ? 'text-red-600' : overallRisk === 'Medium' ? 'text-yellow-600' : 'text-green-600';

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 max-w-3xl shadow-sm">
            {/* Overall Risk Score */}
            <div className="text-center py-8 bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl">
                <Shield className={`w-16 h-16 mx-auto mb-3 ${riskColor}`} />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Overall Risk: {overallRisk}</h2>
                <p className="text-gray-600 px-6 max-w-2xl mx-auto">{analysis.summary}</p>
            </div>

            {/* Risk Overview */}
            <div className="flex flex-wrap gap-2 justify-center">
                {riskCounts.low > 0 && (
                    <RiskBadge level="low" count={riskCounts.low} onClick={() => scrollToClause('low')} />
                )}
                {riskCounts.medium > 0 && (
                    <RiskBadge level="medium" count={riskCounts.medium} onClick={() => scrollToClause('medium')} />
                )}
                {riskCounts.high > 0 && (
                    <RiskBadge level="high" count={riskCounts.high} onClick={() => scrollToClause('high')} />
                )}
            </div>

            {/* Clauses */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Identified Clauses
                </h3>
                {analysis.clauses.map((clause, idx) => (
                    <div
                        key={idx}
                        id={`clause-${clause.risk_level}-${idx}`}
                        className={`border-l-4 p-4 rounded-lg transition-all ${clause.risk_level === 'high'
                                ? 'border-red-500 bg-red-50'
                                : clause.risk_level === 'medium'
                                    ? 'border-yellow-500 bg-yellow-50'
                                    : 'border-green-500 bg-green-50'
                            }`}
                    >
                        <div className="flex items-start justify-between gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900 text-sm flex-1">{clause.clause}</h4>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${clause.risk_level === 'high'
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

            {/* Missing Protections */}
            {analysis.missing_protections && analysis.missing_protections.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
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

// ============================================
// MAIN COMPONENT
// ============================================

export default function Home() {
    // State management
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [processingStage, setProcessingStage] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);

    // Refs
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);
    const abortControllerRef = useRef(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        }
    }, [inputText]);

    // Voice recognition setup
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

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(t => t.stop());
            }
            if (audioContextRef.current) {
                try { audioContextRef.current.close(); } catch (e) { }
            }
        };
    }, []);

    // Toggle voice recording
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

    // Stop generation
    const stopGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setIsGenerating(false);
        setLoading(false);
    };

    // Animate assistant typing
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
                if (!copy[msgIdx]) {
                    copy.push({ role: 'assistant', content: current });
                } else {
                    copy[msgIdx] = { ...copy[msgIdx], content: current };
                }
                return copy;
            });

            if (charIndex < fullText.length) {
                setTimeout(step, 20);
            } else {
                setIsGenerating(false);
            }
        };
        step();
    };

    // Handle send
    const handleSend = async () => {
        if (!inputText.trim() && files.length === 0) return;

        const textToSend = inputText || "Analyze this document";

        // Quick greeting check
        const greet = textToSend.trim().toLowerCase();
        const greetingRegex = /^(hi+|hello|hey|hii|namaste|नमस्ते|hiya|yo|sup)$/i;
        if (greetingRegex.test(greet) && files.length === 0) {
            const userMsg = { role: 'user', content: textToSend };
            const assistantMsg = {
                role: 'assistant',
                content: `Hi! 👋 I can help review contracts and highlight risks. Upload a contract or ask a question.`
            };
            setMessages(prev => [...prev, userMsg, assistantMsg]);
            setInputText("");
            return;
        }

        const userMessage = {
            role: "user",
            content: textToSend,
            files: files.map(f => f.name)
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText("");
        const currentFiles = [...files];
        setFiles([]);
        setLoading(true);
        setIsGenerating(true);

        abortControllerRef.current = new AbortController();

        try {
            if (currentFiles.length > 0) {
                // Document analysis
                setProcessingStage(0);
                const formData = new FormData();
                currentFiles.forEach(file => formData.append("file", file));

                const ocrRes = await fetch("/api/ocr", {
                    method: "POST",
                    body: formData,
                    signal: abortControllerRef.current.signal
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
                    signal: abortControllerRef.current.signal
                });
                const aiData = await aiRes.json();

                setProcessingStage(2);

                // NORMALIZE DATA HERE
                const normalizedAnalysis = normalizeAnalysis(aiData.data);
               
                setMessages(prev => [...prev, {
                    role: "assistant",
                    analysis: normalizedAnalysis
                }]);

               
                setLoading(false);
                setIsGenerating(false);
            } else {
                // Text-only
                const response = await fetch("/api/generate-content", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: textToSend }),
                    signal: abortControllerRef.current.signal
                });
                const data = await response.json();

                let assistantContent = "";
                if (data && data.data) {
                    assistantContent = data.data.summary || data.data.response || JSON.stringify(data.data);
                } else {
                    assistantContent = data.response || data.content || JSON.stringify(data);
                }

                setLoading(false);
                animateAssistantContent(assistantContent);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: "Response stopped."
                }]);
            } else {
                console.error("Error:", error);
                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: "Sorry, there was an error processing your request."
                }]);
            }
            setLoading(false);
            setIsGenerating(false);
        }
    };

    const scrollToClause = (riskLevel) => {
        const element = document.getElementById(`clause-${riskLevel}-0`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const handleNewChat = () => {
        setMessages([]);
        setInputText("");
        setFiles([]);
        setLoading(false);
        setIsGenerating(false);
        setIsRecording(false);
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-b from-gray-50 to-white flex flex-col">
            {/* Header */}
            <header className="border-b border-gray-200 sticky top-0 z-10 bg-white/80 backdrop-blur-md">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/logo.svg"
                            width={100}
                            height={100}
                            alt="Legal Risk Radar"
                            className="w-16 h-16 relative z-10"
                        />
                        <h1 className="text-xl font-semibold text-gray-900">Legal Advisor</h1>
                    </div>
                    <button
                        onClick={handleNewChat}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        New chat
                    </button>
                </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[60vh]">
                            <Image
                                src="/logo.svg"
                                width={100}
                                height={100}
                                alt="Legal Risk Radar"
                                className="w-24 h-24 animate-pulse relative z-10"
                            />
                            <h2 className="sm:text-4xl font-semibold text-gray-900 mb-4 sm:mb-6 text-xl  min-h-15">
                                <TypeAnimation
                                    sequence={[
                                        "How can I help you today?",
                                        1000,
                                        "मैं आज आपकी कैसे मदद कर सकता हूँ?",
                                        1000,
                                        "आज मी तुम्हाला कशी मदत करू शकतो?",
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
                        <div className="space-y-6">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'user' ? (
                                        <div className="bg-blue-600 text-white rounded-2xl px-5 py-3 max-w-2xl shadow-sm">
                                            {msg.files && msg.files.length > 0 && (
                                                <div className="text-xs text-blue-100 mb-2 flex items-center gap-1.5 flex-wrap">
                                                    {msg.files.map((fileName, i) => (
                                                        <span key={i} className="flex items-center gap-1 bg-blue-500/50 px-2 py-1 rounded">
                                                            <Paperclip className="w-3 h-3" />
                                                            {fileName}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <p className="leading-relaxed">{msg.content}</p>
                                        </div>
                                    ) : msg.analysis ? (
                                        <ResultCard analysis={msg.analysis} scrollToClause={scrollToClause} />
                                    ) : (
                                        <div className="max-w-3xl">
                                            <p className="text-gray-900 leading-relaxed">{msg.content}</p>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 rounded-2xl px-5 py-3">
                                        {files.length > 0 ? (
                                            <ProcessingIndicator stage={processingStage} />
                                        ) : (
                                            <TypingIndicator />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="pb-6 pt-4">
                <div className="max-w-3xl mx-auto px-4">
                    {/* Stop button */}
                    {isGenerating && (
                        <div className="flex justify-center mb-3">
                            <button
                                onClick={stopGeneration}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all shadow-lg animate-fadeIn"
                            >
                                <Square className="w-4 h-4" />
                                <span className="text-sm font-medium">Stop generating</span>
                            </button>
                        </div>
                    )}

                    {/* File previews */}
                    <FileUploadArea
                        files={files}
                        onAdd={(file) => setFiles(prev => [...prev, file])}
                        onRemove={(idx) => setFiles(prev => prev.filter((_, i) => i !== idx))}
                    />

                    {/* Input box */}
                    <div className="bg-white border border-gray-300 rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-end gap-2 p-3">
                            {/* Left actions */}
                            <div className="flex items-center pb-2">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={files.length >= 2 || isGenerating}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    title={files.length >= 2 ? "Maximum 2 files" : "Attach file"}
                                >
                                    <Paperclip className="w-5 h-5 text-gray-600" />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,image/*"
                                    multiple
                                    onChange={(e) => {
                                        const selectedFiles = Array.from(e.target.files);

                                        // FIX: Check limit INSIDE setFiles to ensure accuracy
                                        setFiles(prev => {
                                            const remainingSlots = 2 - prev.length;
                                            if (remainingSlots <= 0) return prev;
                                            const filesToAdd = selectedFiles.slice(0, remainingSlots);
                                            return [...prev, ...filesToAdd];
                                        });

                                        e.target.value = '';
                                    }}
                                    className="hidden"
                                />
                            </div>

                            {/* Textarea */}
                            <div className="flex-1 max-h-32 overflow-y-auto">
                                <textarea
                                    ref={textareaRef}
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            if (!isGenerating) handleSend();
                                        }
                                    }}
                                    placeholder="Message Legal Advisor..."
                                    disabled={isGenerating}
                                    rows={1}
                                    className="w-full resize-none outline-none text-gray-900 placeholder-gray-400 bg-transparent px-2 py-2 disabled:opacity-50"
                                    style={{ minHeight: '24px', maxHeight: '120px' }}
                                />
                            </div>

                            {/* Right actions */}
                            <div className="flex items-center gap-1 pb-2">
                                <RecordingWave
                                    analyserRef={analyserRef}
                                    dataArrayRef={dataArrayRef}
                                    isRecording={isRecording}
                                />

                                <button
                                    onClick={toggleRecording}
                                    disabled={isGenerating}
                                    className={`p-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed ${isRecording
                                        ? 'bg-red-500 text-white hover:bg-red-600'
                                        : 'hover:bg-gray-100 text-gray-600'
                                        }`}
                                    title={isRecording ? "Stop recording" : "Voice input"}
                                >
                                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>

                                <button
                                    onClick={handleSend}
                                    disabled={isGenerating || loading || (!inputText.trim() && files.length === 0)}
                                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    title="Send message"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-center text-gray-500 mt-3">
                        Legal Advisor can make mistakes. Check important info.
                    </p>
                </div>
            </div>

            {/* CSS for animations */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(-8px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                .animate-bounce { animation: bounce 1.4s ease-in-out infinite; }
            `}</style>
        </div>
    );
}