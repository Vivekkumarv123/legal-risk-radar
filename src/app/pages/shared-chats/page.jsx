"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Share2, ArrowLeft, Plus } from "lucide-react";
import SharedChatsManager from "@/components/chat-sharing/SharedChatsManager";

export default function SharedChatsPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/auth/me');
            const result = await response.json();
            
            if (result.success) {
                setUser(result.user);
            } else {
                router.push('/pages/login');
                return;
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            router.push('/pages/login');
            return;
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Shared Chats</h1>
                                <p className="text-gray-600">Manage your shared legal consultations</p>
                            </div>
                        </div>
                        
                        <button
                            onClick={() => router.push('/pages/private-chat')}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={16} />
                            New Chat
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Info Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                    <div className="flex items-start gap-4">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <Share2 className="text-white" size={20} />
                        </div>
                        <div>
                            <h2 className="font-semibold text-blue-900 mb-2">Share Your Legal Consultations</h2>
                            <p className="text-blue-800 text-sm leading-relaxed">
                                Share your AI legal consultations with colleagues, friends, or the community. 
                                Help others learn from your legal questions and get feedback on complex matters.
                            </p>
                            <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                    <span className="text-blue-800">Control visibility (public/private)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                    <span className="text-blue-800">Track views and engagement</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                    <span className="text-blue-800">Set expiration dates</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shared Chats Manager */}
                <SharedChatsManager />

                {/* How to Share Section */}
                <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Share a Chat</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-blue-600 font-bold">1</span>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-2">Start a Conversation</h4>
                            <p className="text-sm text-gray-600">
                                Have a legal consultation with our AI assistant
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-blue-600 font-bold">2</span>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-2">Click Share</h4>
                            <p className="text-sm text-gray-600">
                                Use the share button in your chat interface
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-blue-600 font-bold">3</span>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-2">Configure & Share</h4>
                            <p className="text-sm text-gray-600">
                                Set privacy settings and share the link
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}