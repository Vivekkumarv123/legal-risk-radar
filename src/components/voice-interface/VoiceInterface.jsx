"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX, Settings, Play, Pause } from "lucide-react";

export default function VoiceInterface({ onTranscript, onResponse }) {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('en-IN');
    const [selectedVoice, setSelectedVoice] = useState('');
    const [availableVoices, setAvailableVoices] = useState([]);
    const [transcript, setTranscript] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    
    const recognitionRef = useRef(null);
    const synthRef = useRef(null);

    const indianLanguages = [
        { code: 'en-IN', name: 'English (India)', flag: '🇮🇳' },
        { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
        { code: 'bn-IN', name: 'Bengali', flag: '🇮🇳' },
        { code: 'te-IN', name: 'Telugu', flag: '🇮🇳' },
        { code: 'mr-IN', name: 'Marathi', flag: '🇮🇳' },
        { code: 'ta-IN', name: 'Tamil', flag: '🇮🇳' },
        { code: 'gu-IN', name: 'Gujarati', flag: '🇮🇳' },
        { code: 'kn-IN', name: 'Kannada', flag: '🇮🇳' },
        { code: 'ml-IN', name: 'Malayalam', flag: '🇮🇳' },
        { code: 'pa-IN', name: 'Punjabi', flag: '🇮🇳' },
        { code: 'or-IN', name: 'Odia', flag: '🇮🇳' },
        { code: 'as-IN', name: 'Assamese', flag: '🇮🇳' }
    ];

    useEffect(() => {
        initializeSpeechRecognition();
        loadAvailableVoices();
    }, []);

    useEffect(() => {
        if (selectedLanguage && recognitionRef.current) {
            recognitionRef.current.lang = selectedLanguage;
        }
    }, [selectedLanguage]);

    const initializeSpeechRecognition = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = selectedLanguage;

            recognitionRef.current.onstart = () => {
                setIsListening(true);
            };

            recognitionRef.current.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                setTranscript(finalTranscript + interimTranscript);
                
                if (finalTranscript && onTranscript) {
                    onTranscript(finalTranscript);
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    };

    const loadAvailableVoices = () => {
        const voices = speechSynthesis.getVoices();
        const indianVoices = voices.filter(voice => 
            voice.lang.includes('IN') || 
            voice.lang.includes('hi') || 
            voice.lang.includes('en-IN')
        );
        setAvailableVoices(indianVoices);
        
        if (indianVoices.length > 0 && !selectedVoice) {
            setSelectedVoice(indianVoices[0].name);
        }
    };

    // Load voices when they become available
    useEffect(() => {
        speechSynthesis.onvoiceschanged = loadAvailableVoices;
        return () => {
            speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setTranscript('');
            recognitionRef.current.start();
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    };

    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            // Stop any ongoing speech
            speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Set voice if selected
            if (selectedVoice) {
                const voice = availableVoices.find(v => v.name === selectedVoice);
                if (voice) {
                    utterance.voice = voice;
                }
            }
            
            // Set language
            utterance.lang = selectedLanguage;
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 1;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            speechSynthesis.speak(utterance);
        }
    };

    const stopSpeaking = () => {
        speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Mic className="text-blue-600" size={24} />
                    <h3 className="text-xl font-bold text-gray-900">Voice Interface</h3>
                </div>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                    <Settings size={20} />
                </button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Voice Settings</h4>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Language
                            </label>
                            <select
                                value={selectedLanguage}
                                onChange={(e) => setSelectedLanguage(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {indianLanguages.map(lang => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.flag} {lang.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Voice
                            </label>
                            <select
                                value={selectedVoice}
                                onChange={(e) => setSelectedVoice(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {availableVoices.map(voice => (
                                    <option key={voice.name} value={voice.name}>
                                        {voice.name} ({voice.lang})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Voice Controls */}
            <div className="flex items-center justify-center gap-4 mb-6">
                <button
                    onClick={isListening ? stopListening : startListening}
                    className={`p-4 rounded-full transition-all ${
                        isListening
                            ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                    {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                </button>

                <button
                    onClick={isSpeaking ? stopSpeaking : () => speakText("Hello, I'm your legal assistant. How can I help you today?")}
                    className={`p-4 rounded-full transition-all ${
                        isSpeaking
                            ? 'bg-orange-600 hover:bg-orange-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                >
                    {isSpeaking ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
            </div>

            {/* Status Display */}
            <div className="text-center mb-4">
                {isListening && (
                    <div className="flex items-center justify-center gap-2 text-red-600">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">Listening...</span>
                    </div>
                )}
                
                {isSpeaking && (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                        <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">Speaking...</span>
                    </div>
                )}
                
                {!isListening && !isSpeaking && (
                    <span className="text-sm text-gray-500">Ready to assist</span>
                )}
            </div>

            {/* Transcript Display */}
            {transcript && (
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Transcript:</h4>
                    <p className="text-gray-700">{transcript}</p>
                </div>
            )}

            {/* Quick Voice Commands */}
            <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">Quick Commands</h4>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        "Analyze this contract",
                        "What are my rights?",
                        "Explain this clause",
                        "Legal advice needed"
                    ].map((command, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setTranscript(command);
                                if (onTranscript) onTranscript(command);
                            }}
                            className="p-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                            "{command}"
                        </button>
                    ))}
                </div>
            </div>

            {/* Language Support Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Supported Languages</h4>
                <p className="text-sm text-blue-700">
                    Ask legal questions in {indianLanguages.find(l => l.code === selectedLanguage)?.name} 
                    and get responses in your preferred language.
                </p>
            </div>
        </div>
    );
}