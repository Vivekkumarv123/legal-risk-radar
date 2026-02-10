"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Menu, X, FileText, Book, MessageSquare, LogOut, AlertCircle,
    Upload, ArrowRight, Search, Loader2, Send, Star, Flag, Lightbulb,
    CheckCircle, ArrowLeft, UserX, AlertTriangle
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import toast from "react-hot-toast";
import Image from "next/image";
import ClauseComparison from "@/components/clause-comparison/ClauseComparison";
import dynamic from 'next/dynamic';

// Lazy-load heavy glossary component to avoid UI blocking
const LegalGlossary = dynamic(() => import('@/components/legal-glossary/LegalGlossary'), {
    ssr: false,
    loading: () => (
        <div className="p-8 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
    )
});

// ==========================================
// SUB-COMPONENTS
// ==========================================

function LogoutModal({ isOpen, onClose, onConfirm, isLoading }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <LogOut className="w-6 h-6 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Log out?</h3>
                    <p className="text-gray-500 text-sm mb-6">Are you sure you want to log out?</p>
                    <div className="flex gap-3 w-full">
                        <button onClick={onClose} disabled={isLoading} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors disabled:opacity-50">Cancel</button>
                        <button onClick={onConfirm} disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-black text-white font-medium rounded-xl transition-colors disabled:opacity-70">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Log out"}
                        </button>
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
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Account?</h3>
                    <p className="text-gray-500 text-sm mb-6">This action is <strong>irreversible</strong>.</p>
                    <div className="flex gap-3 w-full">
                        <button onClick={onClose} disabled={isLoading} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors disabled:opacity-50">Cancel</button>
                        <button onClick={onConfirm} disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors disabled:opacity-70">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Forever"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Document Compare Component
function DocumentCompareSection() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Document Comparison</h2>
                    <p className="text-sm text-gray-500">Compare legal documents side-by-side to identify differences</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <ClauseComparison />
            </div>
        </div>
    );
}

// Legal Glossary Component
function LegalGlossarySection() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Book className="w-6 h-6 text-green-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Legal Glossary</h2>
                    <p className="text-sm text-gray-500">Understand legal terms and definitions</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <LegalGlossary />
            </div>
        </div>
    );
}

// Community & Feedback Component
function CommunitySection() {
    const [feedbackType, setFeedbackType] = useState('suggestion'); // suggestion, issue, report
    const [feedbackText, setFeedbackText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitFeedback = async () => {
        if (!feedbackText.trim()) {
            toast.error("Please enter your feedback");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    type: feedbackType,
                    message: feedbackText
                })
            });

            if (response.ok) {
                toast.success("Thank you for your feedback!");
                setFeedbackText('');
                setFeedbackType('suggestion');
            } else {
                throw new Error("Failed to submit feedback");
            }
        } catch (error) {
            toast.error("Failed to submit feedback");
        } finally {
            setIsSubmitting(false);
        }
    };

    const feedbackOptions = [
        {
            id: 'suggestion',
            label: 'Suggestion',
            icon: Lightbulb,
            description: 'Have an idea to improve the app?',
            color: 'bg-blue-100 text-blue-600'
        },
        {
            id: 'issue',
            label: 'Report Issue',
            icon: Flag,
            description: 'Found a bug or issue?',
            color: 'bg-red-100 text-red-600'
        },
        {
            id: 'report',
            label: 'General Feedback',
            icon: MessageSquare,
            description: 'Share your thoughts and experience',
            color: 'bg-purple-100 text-purple-600'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Community & Feedback</h2>
                    <p className="text-sm text-gray-500">Help us improve! Share your thoughts, suggestions, and report issues</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
                {feedbackOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                        <button
                            key={option.id}
                            onClick={() => setFeedbackType(option.id)}
                            className={`p-4 rounded-xl border-2 transition-all ${
                                feedbackType === option.id
                                    ? 'border-gray-900 bg-gray-50'
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${option.color}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm">{option.label}</h3>
                            <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                        </button>
                    );
                })}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Your Feedback
                        </label>
                        <textarea
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            placeholder={`Tell us your ${feedbackType === 'suggestion' ? 'suggestion' : feedbackType === 'issue' ? 'issue or bug report' : 'thoughts'}...`}
                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={6}
                            disabled={isSubmitting}
                        />
                        <p className="text-xs text-gray-400 mt-2">
                            {feedbackText.length}/500 characters
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleSubmitFeedback}
                            disabled={isSubmitting || !feedbackText.trim()}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            Submit Feedback
                        </button>
                    </div>
                </div>

                {/* Community Guidelines */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4">💡 Community Guidelines</h3>
                    <ul className="space-y-3 text-sm text-gray-600">
                        <li className="flex items-start gap-3">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                            <span>Be constructive and specific with your feedback</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                            <span>Include screenshots or examples for bug reports</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                            <span>Check existing feedback before posting duplicates</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                            <span>Respect other users and maintain a positive tone</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function ToolsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('compare');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [isAuthChecking, setIsAuthChecking] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    // Check authentication
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/me', { cache: 'no-store' });
                if (!res.ok) throw new Error("Unauthorized");
                const data = await res.json();
                setUser(data.user);
            } catch (error) {
                router.push('/pages/login');
            } finally {
                setIsAuthChecking(false);
            }
        };
        checkAuth();
    }, [router]);

    const handleLogout = async () => {
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

    const handleDeleteAccount = async () => {
        setIsDeletingAccount(true);
        try {
            const res = await fetch('/api/auth/delete-account', { method: 'DELETE' });
            if (res.ok) {
                toast.success("Account deleted successfully");
                setTimeout(() => {
                    setShowDeleteModal(false);
                    router.push('/');
                }, 1000);
            } else {
                throw new Error("Failed to delete account");
            }
        } catch (error) {
            toast.error("Could not delete account");
            setIsDeletingAccount(false);
        }
    };

    if (isAuthChecking) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;
    }

    const sidebarItems = [
        {
            id: 'compare',
            label: 'Document Compare',
            icon: FileText,
            description: 'Compare documents'
        },
        {
            id: 'glossary',
            label: 'Legal Glossary',
            icon: Book,
            description: 'Learn legal terms'
        },
        {
            id: 'community',
            label: 'Community & Feedback',
            icon: MessageSquare,
            description: 'Share feedback'
        }
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <LogoutModal isOpen={showLogoutModal} onClose={() => !isLoggingOut && setShowLogoutModal(false)} onConfirm={handleLogout} isLoading={isLoggingOut} />
            <DeleteAccountModal isOpen={showDeleteModal} onClose={() => !isDeletingAccount && setShowDeleteModal(false)} onConfirm={handleDeleteAccount} isLoading={isDeletingAccount} />

            {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}

            {/* SIDEBAR */}
            <aside className={`fixed md:static inset-y-0 left-0 z-30 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col shadow-lg md:shadow-none`}>
                {/* Logo Section */}
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shadow-lg">
                        <Image src="/logo.svg" width={24} height={24} alt="Logo" className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h1 className="font-bold text-gray-900">Legal Tools</h1>
                        <p className="text-xs text-gray-500">Hub</p>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setSidebarOpen(false);
                                }}
                                className={`w-full text-left p-4 rounded-xl transition-all ${
                                    activeTab === item.id
                                        ? 'bg-blue-100 border border-blue-200'
                                        : 'bg-white border border-transparent hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <Icon className={`w-5 h-5 mt-0.5 ${activeTab === item.id ? 'text-blue-600' : 'text-gray-400'}`} />
                                    <div>
                                        <h3 className={`font-semibold text-sm ${activeTab === item.id ? 'text-blue-700' : 'text-gray-900'}`}>
                                            {item.label}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* User Profile Section */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-3">
                    <div className="flex items-center gap-3 px-2 py-2 hover:bg-white rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-200">
                        <Avatar
                            src={user?.avatar}
                            alt={user?.name || "User"}
                            fallback={user?.name?.charAt(0) || "U"}
                            size="md"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || "User"}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Account"
                        >
                            <UserX className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setShowLogoutModal(true)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-all"
                            title="Sign Out"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-gray-600 rounded-lg active:bg-gray-100">
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">Legal Tools Hub</h1>
                    </div>
                    <button
                        onClick={() => router.push('/pages/login')}
                        className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-6xl mx-auto px-6 py-8">
                        {activeTab === 'compare' && <DocumentCompareSection />}
                        {activeTab === 'glossary' && <LegalGlossarySection />}
                        {activeTab === 'community' && <CommunitySection />}
                    </div>
                </div>
            </main>
        </div>
    );
}
