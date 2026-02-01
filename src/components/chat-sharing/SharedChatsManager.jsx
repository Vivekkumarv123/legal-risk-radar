"use client";

import { useState, useEffect } from "react";
import { 
    Share2, 
    Eye, 
    Calendar, 
    Globe, 
    Lock, 
    Trash2, 
    ExternalLink,
    Copy,
    Check,
    Settings
} from "lucide-react";
import toast from "react-hot-toast";

export default function SharedChatsManager() {
    const [sharedChats, setSharedChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(null);

    useEffect(() => {
        fetchSharedChats();
    }, []);

    const fetchSharedChats = async () => {
        try {
            const response = await fetch('/api/share-chat');
            const result = await response.json();
            
            if (result.success) {
                setSharedChats(result.sharedChats);
            } else {
                toast.error('Failed to load shared chats');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Failed to load shared chats');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (shareId, shareUrl) => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(shareId);
            toast.success('Link copied to clipboard!');
            setTimeout(() => setCopied(null), 2000);
        } catch (error) {
            toast.error('Failed to copy link');
        }
    };

    const deleteSharedChat = async (shareId) => {
        if (!confirm('Are you sure you want to delete this shared chat? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/share-chat?shareId=${shareId}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                setSharedChats(prev => prev.filter(chat => chat.shareId !== shareId));
                toast.success('Shared chat deleted successfully');
            } else {
                toast.error(result.error || 'Failed to delete shared chat');
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete shared chat');
        }
    };

    const toggleVisibility = async (shareId, currentVisibility) => {
        try {
            const response = await fetch('/api/share-chat', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    shareId,
                    settings: {
                        isPublic: !currentVisibility
                    }
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                setSharedChats(prev => prev.map(chat => 
                    chat.shareId === shareId 
                        ? { ...chat, isPublic: !currentVisibility }
                        : chat
                ));
                toast.success(`Chat is now ${!currentVisibility ? 'public' : 'private'}`);
            } else {
                toast.error(result.error || 'Failed to update visibility');
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Failed to update visibility');
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getShareUrl = (shareId) => {
        return `${window.location.origin}/shared/${shareId}`;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <Share2 className="text-blue-600" size={24} />
                    <h2 className="text-xl font-bold text-gray-900">Shared Chats</h2>
                </div>
                <p className="text-gray-600 mt-2">Manage your shared legal consultations</p>
            </div>

            <div className="p-6">
                {sharedChats.length === 0 ? (
                    <div className="text-center py-12">
                        <Share2 className="mx-auto text-gray-400 mb-4" size={48} />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Shared Chats</h3>
                        <p className="text-gray-600">
                            Share your legal consultations to get feedback or help others learn.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sharedChats.map((chat) => (
                            <div key={chat.shareId} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            {chat.title}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                <span>Shared {formatDate(chat.createdAt)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Eye size={14} />
                                                <span>{chat.viewCount} views</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {chat.isPublic ? (
                                                    <>
                                                        <Globe size={14} className="text-green-600" />
                                                        <span className="text-green-600">Public</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock size={14} className="text-gray-600" />
                                                        <span>Private</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded border mb-3">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={getShareUrl(chat.shareId)}
                                            readOnly
                                            className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-sm"
                                        />
                                        <button
                                            onClick={() => copyToClipboard(chat.shareId, getShareUrl(chat.shareId))}
                                            className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                            title="Copy Link"
                                        >
                                            {copied === chat.shareId ? <Check size={14} /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => window.open(getShareUrl(chat.shareId), '_blank')}
                                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            <ExternalLink size={14} />
                                            View
                                        </button>
                                        <button
                                            onClick={() => toggleVisibility(chat.shareId, chat.isPublic)}
                                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-700 font-medium"
                                        >
                                            <Settings size={14} />
                                            {chat.isPublic ? 'Make Private' : 'Make Public'}
                                        </button>
                                    </div>
                                    
                                    <button
                                        onClick={() => deleteSharedChat(chat.shareId)}
                                        className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium"
                                    >
                                        <Trash2 size={14} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}