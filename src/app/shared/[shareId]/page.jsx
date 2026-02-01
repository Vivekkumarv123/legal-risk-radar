"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
    MessageCircle, 
    User, 
    Bot, 
    Eye, 
    Calendar, 
    Share2, 
    Copy, 
    Check,
    AlertCircle,
    FileText,
    ExternalLink
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function SharedChatPage() {
    const params = useParams();
    const shareId = params.shareId;
    
    const [chatData, setChatData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (shareId) {
            fetchSharedChat();
        }
    }, [shareId]);

    const fetchSharedChat = async () => {
        try {
            const response = await fetch(`/api/shared/${shareId}`);
            const result = await response.json();

            if (result.success) {
                setChatData(result);
            } else {
                setError(result.error || 'Failed to load shared chat');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setError('Failed to load shared chat');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            toast.success('Link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error('Failed to copy link');
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading shared chat...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Chat Not Available</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link 
                        href="/"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        <ExternalLink size={16} />
                        Visit Legal Risk Radar
                    </Link>
                </div>
            </div>
        );
    }

    const { sharedChat, messages } = chatData;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl">
                                ⚖️ Legal Risk Radar
                            </Link>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-600 font-medium">Shared Chat</span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Eye size={16} />
                                <span>{sharedChat.viewCount} views</span>
                            </div>
                            <button
                                onClick={copyToClipboard}
                                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? 'Copied!' : 'Share'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Chat Content */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Chat Info */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                {sharedChat.title}
                            </h1>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Calendar size={16} />
                                    <span>Shared on {formatDate(sharedChat.createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MessageCircle size={16} />
                                    <span>{messages.length} messages</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                            <Share2 size={14} />
                            Shared Chat
                        </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="text-blue-600 mt-0.5" size={20} />
                            <div>
                                <h3 className="font-semibold text-blue-900 mb-1">Legal Disclaimer</h3>
                                <p className="text-sm text-blue-800">
                                    This shared conversation is for informational purposes only and does not constitute legal advice. 
                                    Always consult with a qualified legal professional for specific legal matters.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="space-y-6">
                    {messages.map((message, index) => (
                        <div
                            key={message.id}
                            className={`flex gap-4 ${
                                message.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                        >
                            {message.role === 'assistant' && (
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                    <Bot className="text-white" size={16} />
                                </div>
                            )}
                            
                            <div
                                className={`max-w-3xl rounded-lg p-4 ${
                                    message.role === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white border border-gray-200'
                                }`}
                            >
                                {message.attachmentUrl && (
                                    <div className="mb-3">
                                        <div className="flex items-center gap-2 text-sm opacity-75 mb-2">
                                            <FileText size={16} />
                                            <span>Attached Document</span>
                                        </div>
                                        <img
                                            src={message.attachmentUrl}
                                            alt="Attached document"
                                            className="max-w-full h-auto rounded border"
                                        />
                                    </div>
                                )}
                                
                                <div className="prose prose-sm max-w-none">
                                    {message.content && (
                                        <div className="whitespace-pre-wrap">
                                            {message.content}
                                        </div>
                                    )}
                                </div>

                                {message.analysisData && (
                                    <div className="mt-4 p-3 bg-gray-50 rounded border">
                                        <h4 className="font-semibold text-gray-900 mb-2">Analysis Results</h4>
                                        <div className="text-sm text-gray-700">
                                            {typeof message.analysisData === 'string' 
                                                ? message.analysisData 
                                                : JSON.stringify(message.analysisData, null, 2)
                                            }
                                        </div>
                                    </div>
                                )}

                                <div className={`text-xs mt-2 opacity-75 ${
                                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                    {formatDate(message.createdAt)}
                                </div>
                            </div>

                            {message.role === 'user' && (
                                <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                                    <User className="text-white" size={16} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-center text-white">
                    <h2 className="text-2xl font-bold mb-4">Get Your Own Legal AI Assistant</h2>
                    <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                        Start your own legal consultations with our AI-powered platform. 
                        Get instant analysis, risk assessment, and legal guidance.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/pages/signup"
                            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Get Started Free
                        </Link>
                        <Link
                            href="/pages/features"
                            className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
                        >
                            View Features
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-16">
                <div className="max-w-4xl mx-auto px-4 py-8 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
                        <span>Powered by</span>
                        <Link href="/" className="text-blue-600 font-semibold hover:text-blue-700">
                            Legal Risk Radar
                        </Link>
                    </div>
                    <p className="text-sm text-gray-500">
                        AI-powered legal analysis for everyone. Making law accessible and understandable.
                    </p>
                </div>
            </footer>
        </div>
    );
}