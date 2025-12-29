"use client";
import { useState, useRef, useEffect } from "react";
import { TypeAnimation } from "react-type-animation";
import { Mic, MicOff, Send, Paperclip, X, AlertCircle, Shield, Globe, BookOpen, Sparkles } from "lucide-react";
import Image from "next/image";

// UploadBox Component
function UploadBox({ onUpload, onCancel, file }) {
    if (file) {
        return (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between mb-3 max-w-md">
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
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 max-w-3xl">
            {/* Overall Risk Score */}
            <div className="text-center py-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                <Shield className={`w-14 h-14 mx-auto mb-3 ${riskColor}`} />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Overall Risk: {overallRisk}</h2>
                <p className="text-gray-600 px-4">{analysis.summary}</p>
            </div>

            {/* Risk Overview Chips */}
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

            {/* Risky Clauses */}
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

            {/* Missing Protections */}
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

// RecordingWave Component - shows animated bars driven by AnalyserNode
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
                        const height = Math.min(1, avg / 64); // normalize
                        const el = barRefs.current[i];
                        if (el) el.style.transform = `scaleY(${0.2 + height * 1.2})`;
                        if (el) el.style.opacity = `${0.3 + height * 0.7}`;
                    }
                } catch (e) {
                    // ignore
                }
            } else {
                // idle animation when no analyser available
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
                    className="bg-gray-300 rounded-sm w-1"
                    style={{ transformOrigin: 'center bottom', transform: 'scaleY(0.3)', transition: 'transform 80ms linear, opacity 80ms linear' }}
                />
            ))}
        </div>
    );
}

// Main App Component
export default function Home() {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [processingStage, setProcessingStage] = useState(0);
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const rafRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load persisted chat from localStorage
    useEffect(() => {
        try {
            const raw = localStorage.getItem('chat_messages');
            if (raw) setMessages(JSON.parse(raw));
        } catch (e) { }
    }, []);

    // Persist chat to localStorage whenever messages change
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

    // Cleanup audio resources on unmount
    useEffect(() => {
        return () => {
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(t => t.stop());
                mediaStreamRef.current = null;
            }
            if (audioContextRef.current) {
                try { audioContextRef.current.close(); } catch (e) { }
                audioContextRef.current = null;
            }
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        };
    }, []);

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            // stop audio analyser
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(t => t.stop());
                mediaStreamRef.current = null;
            }
            if (audioContextRef.current) {
                try { audioContextRef.current.close(); } catch (e) { }
                audioContextRef.current = null;
            }
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            setIsRecording(false);
        } else {
            recognitionRef.current?.start();
            // start audio analyser for waveform visual
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

    // Animate assistant message content char-by-char
    const animateAssistantContent = (fullText) => {
        if (!fullText) {
            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
            return;
        }
        // Append placeholder and capture its index
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

    const handleSend = async () => {
        if (!inputText.trim() && !file) return;

        // capture input before clearing state so API payload isn't empty
        const textToSend = inputText || "Analyze this document";

        // Quick client-side handling for simple greetings to avoid calling the AI
        const greet = textToSend.trim().toLowerCase();
        const greetingRegex = /^(hi+|hello|hey|hii|namaste|नमस्ते|hello\.!|hiya|yo|sup)$/i;
        if (greetingRegex.test(greet)) {
            const userMsg = { role: 'user', content: textToSend, file: file?.name };
            const assistantMsg = {
                role: 'assistant',
                content: `Hi! 👋 I can help review contracts and highlight risks. Upload a contract or ask a question like "What does this NDA mean for me?"`
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
                // Document Analysis Flow
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
                        // send the user's question captured earlier
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
                // Text-only Flow
                const response = await fetch("/api/generate-content", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message: textToSend
                    }),
                });
                const data = await response.json();

                // The API returns { success: true, data: parsedResult }
                // prefer a human-friendly summary if available, else fall back to response/content or JSON
                let assistantContent = "";
                if (data && data.data) {
                    assistantContent = data.data.summary || data.data.response || JSON.stringify(data.data);
                } else {
                    assistantContent = data.response || data.content || JSON.stringify(data);
                }

                // animate assistant response for smooth typing effect
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

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header */}
            <header className="border-b border-gray-200 sticky top-0 z-10 bg-white">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Image
                            src="/logo.svg"
                            width={100}
                            height={100}
                            alt="Legal Risk Radar"
                            className="w-16 h-16 animate-pulse relative z-10"
                        />
                        <h1 className="text-xl font-mono font-bold text-gray-900 tracking-tight">
                            Legal Advisor
                        </h1>
                    </div>
                    <button className="px-4 py-2 text-sm font-medium cursor-pointer  text-gray-900 hover:bg-gray-200 rounded-lg transition-colors">
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
                                width={500}
                                height={500}
                                alt="Legal Risk Radar"
                                className="w-25 h-25 animate-pulse relative z-10"
                            />
                            <h2 className="text-4xl font-semibold text-gray-900 mb-8  min-h-[60px]">
                                <TypeAnimation
                                    sequence={[
                                        // 1. Type English, wait 1s
                                        "Where should we begin?",
                                        1000,
                                        // 2. Delete, Type Hindi, wait 1s
                                        "शुरुआत कहां से करें?",
                                        1000,
                                        // 3. Delete, Type Marathi, wait 1s
                                        "आम्ही कुठून सुरुवात करावी?",
                                        1000,
                                    ]}
                                    wrapper="span"
                                    speed={5}
                                    repeat={Infinity}
                                />
                            </h2>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'user' ? (
                                        <div className="bg-gray-100 rounded-2xl px-5 py-3 max-w-2xl">
                                            {msg.file && (
                                                <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                                                    <Paperclip className="w-3 h-3 cursor-pointer" />
                                                    {msg.file}
                                                </div>
                                            )}
                                            <p className="text-gray-900">{msg.content}</p>
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
                                    <div className="bg-gray-50 rounded-2xl px-6 py-4">
                                        <ProcessingLoader stage={processingStage} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area - Floating */}
            <div className="pb-8 ">
                <div className="max-w-3xl mx-auto px-4">
                    {file && (
                        <div className="flex justify-center mb-2">
                            <UploadBox file={file} onCancel={() => setFile(null)} />
                        </div>
                    )}

                    <div className="bg-white border border-gray-300 rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-end gap-2 p-3">
                            {/* Left Action Buttons */}
                            <div className="flex items-center gap-1 pb-1">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer hover:rounded-full hover:bg-gray-400 transition-colors group"
                                    title="Attach"
                                >
                                    <Paperclip className="w-5 h-5 text-gray-600  group-hover:text-gray-900" />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,image/*"
                                    onChange={(e) => handleFileUpload(e.target.files[0])}
                                    className="hidden"
                                />
                            </div>

                            {/* Text Input */}
                            <div className="flex-1">
                                <textarea
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder="Ask anything"
                                    rows={1}
                                    className="w-full resize-none outline-none text-gray-900 placeholder-gray-500 bg-transparent px-2 py-2 max-h-32"
                                    style={{ minHeight: '24px' }}
                                />
                            </div>

                            {/* Right Action Buttons */}
                            <div className="flex items-center gap-1 pb-1">
                                <div className="flex items-center gap-2">
                                    <RecordingWave analyserRef={analyserRef} dataArrayRef={dataArrayRef} isRecording={isRecording} />
                                    <button
                                        onClick={toggleRecording}
                                        className={`p-2 rounded-lg transition-colors ${isRecording ? 'bg-red-500 text-white hover:bg-red-600' : 'hover:bg-gray-100 text-gray-600'
                                            }`}
                                        title="Voice"
                                    >
                                        {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                    </button>
                                </div>

                                <button
                                    onClick={handleSend}
                                    disabled={loading || (!inputText.trim() && !file)}
                                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    title="Send"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Text */}
                    <p className="text-xs text-center text-gray-500 mt-3">
                        Legal Risk Radar can make mistakes. Check important info.
                    </p>
                </div>
            </div>
        </div>
    );
}