"use client";

import { useState } from "react";
import { 
    Share2, 
    Copy, 
    Check, 
    X, 
    Globe, 
    Lock, 
    MessageCircle, 
    Calendar,
    Eye,
    ExternalLink
} from "lucide-react";
import toast from "react-hot-toast";

export default function ShareChatModal({ isOpen, onClose, chatId, chatTitle }) {
    const [sharing, setSharing] = useState(false);
    const [shareData, setShareData] = useState(null);
    const [copied, setCopied] = useState(false);
    const [settings, setSettings] = useState({
        isPublic: true,
        allowComments: false,
        expiresAt: null
    });

    const handleShare = async () => {
        setSharing(true);
        try {
            const response = await fetch('/api/share-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chatId,
                    title: chatTitle,
                    settings
                })
            });

            const result = await response.json();
            
            if (result.success) {
                setShareData(result);
                toast.success('Chat shared successfully!');
            } else {
                toast.error(result.error || 'Failed to share chat');
            }
        } catch (error) {
            console.error('Share error:', error);
            toast.error('Failed to share chat');
        } finally {
            setSharing(false);
        }
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success('Link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Copy failed:', error);
            toast.error('Failed to copy link');
        }
    };

    const handleExpirationChange = (days) => {
        if (days === 0) {
            setSettings(prev => ({ ...prev, expiresAt: null }));
        } else {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + days);
            setSettings(prev => ({ ...prev, expiresAt: expiresAt.toISOString() }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                        <Share2 className="text-blue-600" size={24} />
                        <h2 className="text-xl font-bold text-gray-900">Share Chat</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {!shareData ? (
                        <>
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-2">Chat Title</h3>
                                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    {chatTitle || 'Legal Consultation'}
                                </p>
                            </div>

                            <div className="space-y-4 mb-6">
                                <h3 className="font-semibold text-gray-900">Sharing Settings</h3>
                                
                                {/* Public/Private Toggle */}
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        {settings.isPublic ? (
                                            <Globe className="text-green-600" size={20} />
                                        ) : (
                                            <Lock className="text-gray-600" size={20} />
                                        )}
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {settings.isPublic ? 'Public' : 'Private'}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {settings.isPublic 
                                                    ? 'Anyone with the link can view'
                                                    : 'Only you can access'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSettings(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            settings.isPublic ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                settings.isPublic ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Comments Toggle */}
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <MessageCircle className="text-blue-600" size={20} />
                                        <div>
                                            <p className="font-medium text-gray-900">Allow Comments</p>
                                            <p className="text-sm text-gray-500">
                                                Let viewers leave feedback
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSettings(prev => ({ ...prev, allowComments: !prev.allowComments }))}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            settings.allowComments ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                settings.allowComments ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Expiration Settings */}
                                <div className="p-3 border rounded-lg">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Calendar className="text-orange-600" size={20} />
                                        <div>
                                            <p className="font-medium text-gray-900">Expiration</p>
                                            <p className="text-sm text-gray-500">
                                                When should this link expire?
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { label: 'Never', days: 0 },
                                            { label: '7 days', days: 7 },
                                            { label: '30 days', days: 30 },
                                            { label: '90 days', days: 90 }
                                        ].map(option => (
                                            <button
                                                key={option.days}
                                                onClick={() => handleExpirationChange(option.days)}
                                                className={`p-2 text-sm rounded-lg border transition-colors ${
                                                    (option.days === 0 && !settings.expiresAt) ||
                                                    (option.days > 0 && settings.expiresAt && 
                                                     new Date(settings.expiresAt).getTime() - Date.now() <= option.days * 24 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000 &&
                                                     new Date(settings.expiresAt).getTime() - Date.now() > (option.days - 1) * 24 * 60 * 60 * 1000)
                                                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                                                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleShare}
                                disabled={sharing}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                {sharing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        Creating Share Link...
                                    </>
                                ) : (
                                    <>
                                        <Share2 size={16} />
                                        Create Share Link
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="text-green-600" size={32} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Chat Shared Successfully!
                                </h3>
                                <p className="text-gray-600">
                                    Your legal consultation is now shareable
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Share Link</span>
                                    <div className="flex items-center gap-2">
                                        <Eye className="text-gray-400" size={14} />
                                        <span className="text-sm text-gray-500">0 views</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={shareData.shareUrl}
                                        readOnly
                                        className="flex-1 p-2 bg-white border border-gray-200 rounded text-sm"
                                    />
                                    <button
                                        onClick={() => copyToClipboard(shareData.shareUrl)}
                                        className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                    >
                                        {copied ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => window.open(shareData.shareUrl, '_blank')}
                                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    <ExternalLink size={16} />
                                    Preview
                                </button>
                                <button
                                    onClick={() => copyToClipboard(shareData.shareUrl)}
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                    {copied ? 'Copied!' : 'Copy Link'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}