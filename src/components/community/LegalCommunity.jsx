"use client";

import { useState, useEffect } from "react";
import { 
    MessageSquare, Plus, Search, TrendingUp, Award, 
    ThumbsUp, ThumbsDown, MessageCircle, Eye, Filter,
    CheckCircle, AlertCircle, Send, X, Sparkles, Flame
} from "lucide-react";
import toast from "react-hot-toast";
import { authenticatedFetch } from "@/utils/auth.utils";

const CATEGORIES = [
    { id: 'all', label: 'All Topics', color: 'gray', icon: '📚' },
    { id: 'contract_law', label: 'Contract Law', color: 'blue', icon: '📝' },
    { id: 'corporate_law', label: 'Corporate Law', color: 'purple', icon: '🏢' },
    { id: 'ip_law', label: 'IP Law', color: 'green', icon: '💡' },
    { id: 'employment_law', label: 'Employment Law', color: 'yellow', icon: '👔' },
    { id: 'tax_law', label: 'Tax Law', color: 'red', icon: '💰' },
    { id: 'general', label: 'General', color: 'gray', icon: '💬' },
];

const CHANNEL_TYPES = [
    { id: 'discussion', label: '💬 Discussion', description: 'Open-ended conversations and debates' },
    { id: 'help', label: '❓ Help & Questions', description: 'Get help with specific legal questions' },
    { id: 'resources', label: '📚 Resources', description: 'Share useful legal resources and guides' },
    { id: 'case_studies', label: '⚖️ Case Studies', description: 'Discuss real-world legal cases' },
];

export default function LegalCommunity() {
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedType, setSelectedType] = useState('discussion');
    const [searchTerm, setSearchTerm] = useState('');
    const [prefetchedComments, setPrefetchedComments] = useState({});

    useEffect(() => {
        fetchPosts();
    }, [selectedCategory, selectedType]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (selectedCategory !== 'all') params.append('category', selectedCategory);
            if (selectedType !== 'all') params.append('type', selectedType);
            if (searchTerm) params.append('search', searchTerm);

            const response = await authenticatedFetch(`/api/community/posts?${params}`);
            const data = await response.json();

            if (data.success) {
                setPosts(data.posts);
            }
        } catch (error) {
            console.error('Fetch posts error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPostDetails = async (postId) => {
        try {
            // Always fetch fresh data from the database
            const response = await authenticatedFetch(`/api/community/posts/${postId}`);
            const data = await response.json();

            if (data.success) {
                setSelectedPost(data.post);
                setComments(data.comments);
                
                // Also update the post in the posts list to keep it in sync
                setPosts(prev => prev.map(p => p.id === postId ? data.post : p));
            }
        } catch (error) {
            console.error('Fetch post details error:', error);
        }
    };

    const prefetchPostDetails = async (postId) => {
        // Don't prefetch if already cached
        if (prefetchedComments[postId]) return;

        try {
            const response = await authenticatedFetch(`/api/community/posts/${postId}`);
            const data = await response.json();

            if (data.success) {
                setPrefetchedComments(prev => ({
                    ...prev,
                    [postId]: { post: data.post, comments: data.comments }
                }));
            }
        } catch (error) {
            console.error('Prefetch error:', error);
        }
    };

    const handleVote = async (postId, commentId, type) => {
        try {
            // Make API call
            const response = await authenticatedFetch('/api/community/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId, commentId, type }),
            });

            const data = await response.json();
            
            if (!data.success) {
                toast.error(data.error || 'Failed to vote');
                return;
            }

            // Update UI based on the action returned from backend
            const { action, oldType } = data;
            
            if (selectedPost && postId === selectedPost.id) {
                setSelectedPost(prev => {
                    const newPost = { ...prev };
                    
                    if (action === 'added') {
                        if (type === 'upvote') {
                            newPost.upvotes = (newPost.upvotes || 0) + 1;
                        } else {
                            newPost.downvotes = (newPost.downvotes || 0) + 1;
                        }
                    } else if (action === 'removed') {
                        if (type === 'upvote') {
                            newPost.upvotes = Math.max(0, (newPost.upvotes || 0) - 1);
                        } else {
                            newPost.downvotes = Math.max(0, (newPost.downvotes || 0) - 1);
                        }
                    } else if (action === 'changed') {
                        if (oldType === 'upvote') {
                            newPost.upvotes = Math.max(0, (newPost.upvotes || 0) - 1);
                        } else {
                            newPost.downvotes = Math.max(0, (newPost.downvotes || 0) - 1);
                        }
                        if (type === 'upvote') {
                            newPost.upvotes = (newPost.upvotes || 0) + 1;
                        } else {
                            newPost.downvotes = (newPost.downvotes || 0) + 1;
                        }
                    }
                    
                    return newPost;
                });
            } else if (commentId) {
                setComments(prev => prev.map(comment => {
                    if (comment.id === commentId) {
                        const updated = { ...comment };
                        
                        if (action === 'added') {
                            if (type === 'upvote') {
                                updated.upvotes = (updated.upvotes || 0) + 1;
                            } else {
                                updated.downvotes = (updated.downvotes || 0) + 1;
                            }
                        } else if (action === 'removed') {
                            if (type === 'upvote') {
                                updated.upvotes = Math.max(0, (updated.upvotes || 0) - 1);
                            } else {
                                updated.downvotes = Math.max(0, (updated.downvotes || 0) - 1);
                            }
                        } else if (action === 'changed') {
                            if (oldType === 'upvote') {
                                updated.upvotes = Math.max(0, (updated.upvotes || 0) - 1);
                            } else {
                                updated.downvotes = Math.max(0, (updated.downvotes || 0) - 1);
                            }
                            if (type === 'upvote') {
                                updated.upvotes = (updated.upvotes || 0) + 1;
                            } else {
                                updated.downvotes = (updated.downvotes || 0) + 1;
                            }
                        }
                        
                        return updated;
                    }
                    return comment;
                }));
            } else {
                setPosts(prev => prev.map(post => {
                    if (post.id === postId) {
                        const updated = { ...post };
                        
                        if (action === 'added') {
                            if (type === 'upvote') {
                                updated.upvotes = (updated.upvotes || 0) + 1;
                            } else {
                                updated.downvotes = (updated.downvotes || 0) + 1;
                            }
                        } else if (action === 'removed') {
                            if (type === 'upvote') {
                                updated.upvotes = Math.max(0, (updated.upvotes || 0) - 1);
                            } else {
                                updated.downvotes = Math.max(0, (updated.downvotes || 0) - 1);
                            }
                        } else if (action === 'changed') {
                            if (oldType === 'upvote') {
                                updated.upvotes = Math.max(0, (updated.upvotes || 0) - 1);
                            } else {
                                updated.downvotes = Math.max(0, (updated.downvotes || 0) - 1);
                            }
                            if (type === 'upvote') {
                                updated.upvotes = (updated.upvotes || 0) + 1;
                            } else {
                                updated.downvotes = (updated.downvotes || 0) + 1;
                            }
                        }
                        
                        return updated;
                    }
                    return post;
                }));
            }
            
        } catch (error) {
            console.error('Vote error:', error);
            toast.error('Failed to vote');
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <style jsx>{`
                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.05);
                    }
                }

                @keyframes bounce {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }

                @keyframes shimmer {
                    0% {
                        background-position: -1000px 0;
                    }
                    100% {
                        background-position: 1000px 0;
                    }
                }

                .animate-slide-in-up {
                    animation: slideInUp 0.4s ease-out;
                }

                .animate-slide-in-down {
                    animation: slideInDown 0.3s ease-out;
                }

                .animate-scale-in {
                    animation: scaleIn 0.3s ease-out;
                }

                .animate-pulse-once {
                    animation: pulse 0.3s ease-out;
                }

                .animate-bounce-once {
                    animation: bounce 0.5s ease-out;
                }

                .shimmer {
                    background: linear-gradient(
                        90deg,
                        #f0f0f0 0%,
                        #e0e0e0 50%,
                        #f0f0f0 100%
                    );
                    background-size: 1000px 100%;
                    animation: shimmer 2s infinite;
                }

                .hover-lift {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .hover-lift:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
                }

                .vote-button {
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }

                .vote-button::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.5);
                    transform: translate(-50%, -50%);
                    transition: width 0.6s, height 0.6s;
                }

                .vote-button:active::before {
                    width: 300px;
                    height: 300px;
                }

                .vote-button:active {
                    transform: scale(0.95);
                }

                .stagger-animation > * {
                    opacity: 0;
                    animation: slideInUp 0.4s ease-out forwards;
                }

                .stagger-animation > *:nth-child(1) { animation-delay: 0.05s; }
                .stagger-animation > *:nth-child(2) { animation-delay: 0.1s; }
                .stagger-animation > *:nth-child(3) { animation-delay: 0.15s; }
                .stagger-animation > *:nth-child(4) { animation-delay: 0.2s; }
                .stagger-animation > *:nth-child(5) { animation-delay: 0.25s; }
                .stagger-animation > *:nth-child(6) { animation-delay: 0.3s; }
                .stagger-animation > *:nth-child(7) { animation-delay: 0.35s; }
                .stagger-animation > *:nth-child(8) { animation-delay: 0.4s; }
                .stagger-animation > *:nth-child(9) { animation-delay: 0.45s; }
                .stagger-animation > *:nth-child(10) { animation-delay: 0.5s; }

                .comment-enter {
                    animation: slideInUp 0.4s ease-out;
                }

                .modal-backdrop {
                    animation: fadeIn 0.2s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .modal-content {
                    animation: scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .skeleton {
                    background: linear-gradient(
                        90deg,
                        #f0f0f0 25%,
                        #e0e0e0 50%,
                        #f0f0f0 75%
                    );
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                }

                .glow-on-hover {
                    transition: box-shadow 0.3s ease;
                }

                .glow-on-hover:hover {
                    box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
                }

                .ripple {
                    position: relative;
                    overflow: hidden;
                }

                .ripple::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.5);
                    transform: translate(-50%, -50%);
                    opacity: 0;
                }

                .ripple:active::after {
                    width: 200px;
                    height: 200px;
                    opacity: 1;
                    transition: width 0.4s, height 0.4s, opacity 0.4s;
                }
            `}</style>

            {/* Header */}
            <div className="flex items-center justify-between mb-8 animate-slide-in-down">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <MessageSquare className="text-blue-600 animate-bounce-once" size={32} />
                        Legal Community
                        <Sparkles className="text-yellow-500" size={24} />
                    </h1>
                    <p className="text-gray-600 mt-2 ml-11">Connect, discuss, and learn with legal professionals</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 ripple"
                >
                    <Plus size={20} className="animate-pulse-once" />
                    New Post
                </button>
            </div>

            {/* Channel Types - Discord Style */}
            <div className="grid md:grid-cols-4 gap-4 mb-6 stagger-animation">
                {CHANNEL_TYPES.map(channel => (
                    <button
                        key={channel.id}
                        onClick={() => setSelectedType(channel.id)}
                        className={`p-5 rounded-xl border-2 transition-all duration-300 text-left hover-lift ${
                            selectedType === channel.id
                                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg scale-105'
                                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                        }`}
                    >
                        <div className="text-xl font-bold mb-2 flex items-center gap-2">
                            {channel.label}
                            {selectedType === channel.id && <Flame className="text-orange-500" size={18} />}
                        </div>
                        <div className="text-xs text-gray-600">{channel.description}</div>
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 mb-6 animate-scale-in hover:shadow-lg transition-shadow duration-300">
                <div className="grid md:grid-cols-2 gap-4">
                    {/* Search */}
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search discussions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && fetchPosts()}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        />
                    </div>

                    {/* Category Filter */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 cursor-pointer hover:border-gray-400"
                    >
                        {CATEGORIES.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Posts List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                            <div className="flex gap-4">
                                <div className="flex flex-col gap-2">
                                    <div className="w-16 h-10 skeleton rounded"></div>
                                    <div className="w-16 h-10 skeleton rounded"></div>
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="h-6 skeleton rounded w-3/4"></div>
                                    <div className="h-4 skeleton rounded w-full"></div>
                                    <div className="h-4 skeleton rounded w-5/6"></div>
                                    <div className="flex gap-4">
                                        <div className="h-4 skeleton rounded w-20"></div>
                                        <div className="h-4 skeleton rounded w-20"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-300 animate-scale-in">
                    <MessageSquare className="mx-auto text-gray-400 mb-4 animate-bounce-once" size={64} />
                    <p className="text-gray-600 text-lg font-medium">No discussions found. Be the first to start one!</p>
                </div>
            ) : (
                <div className="space-y-4 stagger-animation">
                    {posts.map(post => (
                        <PostCard 
                            key={post.id} 
                            post={post} 
                            onClick={() => fetchPostDetails(post.id)}
                            onVote={handleVote}
                            onMouseEnter={() => prefetchPostDetails(post.id)}
                        />
                    ))}
                </div>
            )}

            {/* Create Post Modal */}
            {showCreateModal && (
                <CreatePostModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchPosts();
                    }}
                />
            )}

            {/* Post Detail Modal */}
            {selectedPost && (
                <PostDetailModal
                    post={selectedPost}
                    comments={comments}
                    onClose={() => {
                        setSelectedPost(null);
                        // Refresh posts list to sync with database
                        fetchPosts();
                    }}
                    onVote={handleVote}
                    onCommentAdded={() => fetchPostDetails(selectedPost.id)}
                    setComments={setComments}
                />
            )}
        </div>
    );
}

// Post Card Component
function PostCard({ post, onClick, onVote, onMouseEnter }) {
    const [isHovered, setIsHovered] = useState(false);
    const categoryColor = CATEGORIES.find(c => c.id === post.category)?.color || 'gray';
    const categoryIcon = CATEGORIES.find(c => c.id === post.category)?.icon || '📚';
    
    const formatDate = (timestamp) => {
        if (!timestamp) return 'Invalid Date';
        try {
            const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
            if (isNaN(date.getTime())) return 'Invalid Date';
            return date.toLocaleDateString();
        } catch (error) {
            console.error('Date formatting error:', error);
            return 'Invalid Date';
        }
    };
    
    return (
        <div 
            onClick={onClick}
            onMouseEnter={() => { onMouseEnter(); setIsHovered(true); }}
            onMouseLeave={() => setIsHovered(false)}
            className={`bg-white rounded-xl shadow-md border-2 border-gray-200 p-6 cursor-pointer transition-all duration-300 ${
                isHovered ? 'shadow-2xl border-blue-300 scale-[1.02]' : ''
            }`}
        >
            <div className="flex gap-4">
                {/* Vote Section */}
                <div className="flex flex-col items-center gap-3">
                    <button
                        onClick={(e) => { e.stopPropagation(); onVote(post.id, null, 'upvote'); }}
                        className="vote-button flex flex-col items-center gap-1 px-3 py-2 hover:bg-green-100 rounded-lg transition-all duration-200 group"
                    >
                        <ThumbsUp size={20} className="text-gray-600 group-hover:text-green-600 group-hover:scale-110 transition-all" />
                        <span className="text-sm font-bold text-gray-700 group-hover:text-green-600">{post.upvotes || 0}</span>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onVote(post.id, null, 'downvote'); }}
                        className="vote-button flex flex-col items-center gap-1 px-3 py-2 hover:bg-red-100 rounded-lg transition-all duration-200 group"
                    >
                        <ThumbsDown size={20} className="text-gray-600 group-hover:text-red-600 group-hover:scale-110 transition-all" />
                        <span className="text-sm font-bold text-gray-700 group-hover:text-red-600">{post.downvotes || 0}</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        <span className={`px-3 py-1.5 bg-gradient-to-r from-${categoryColor}-100 to-${categoryColor}-200 text-${categoryColor}-700 text-xs font-bold rounded-full shadow-sm`}>
                            {categoryIcon} {CATEGORIES.find(c => c.id === post.category)?.label}
                        </span>
                        {post.isResolved && (
                            <span className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-full animate-pulse-once">
                                <CheckCircle size={14} />
                                Resolved
                            </span>
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                        {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">{post.content}</p>

                    <div className="flex items-center gap-5 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                            <Eye size={16} />
                            <span className="font-medium">{post.views || 0}</span>
                        </span>
                        <span className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                            <MessageCircle size={16} />
                            <span className="font-medium">{post.commentCount || 0}</span>
                        </span>
                        <span className="font-medium">by {post.authorName || 'Anonymous'}</span>
                        <span className="text-xs">{formatDate(post.createdAt)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Create Post Modal Component
function CreatePostModal({ onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'general',
        type: 'discussion',
        tags: [],
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await authenticatedFetch('/api/community/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (data.success) {
                toast.success('🎉 Post created successfully!');
                onSuccess();
            } else {
                toast.error(data.error || 'Failed to create post');
            }
        } catch (error) {
            console.error('Create post error:', error);
            toast.error('Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 modal-backdrop backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl modal-content">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Plus className="text-blue-600" />
                        Create New Post
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all duration-200"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                            placeholder="What's your question or topic?"
                            required
                            minLength={10}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 cursor-pointer"
                            >
                                {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Channel Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 cursor-pointer"
                            >
                                {CHANNEL_TYPES.map(type => (
                                    <option key={type.id} value={type.id}>{type.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Content</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-40 transition-all duration-300"
                            placeholder="Provide details about your question or start a discussion..."
                            required
                            minLength={20}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ripple"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Creating...
                                </span>
                            ) : (
                                'Create Post'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border-2 border-gray-300 rounded-lg font-bold hover:bg-gray-100 transition-all duration-300"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Post Detail Modal Component
function PostDetailModal({ post, comments, onClose, onVote, onCommentAdded, setComments }) {
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await authenticatedFetch('/api/auth/me');
                const data = await response.json();
                if (data.success && data.user) {
                    setCurrentUserId(data.user.uid);
                }
            } catch (error) {
                console.error('Failed to get current user:', error);
            }
        };
        fetchCurrentUser();
    }, []);

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Invalid Date';
        try {
            const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
            if (isNaN(date.getTime())) return 'Invalid Date';
            return date.toLocaleString();
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        
        setLoading(true);
        setIsSending(true);

        try {
            const response = await authenticatedFetch('/api/community/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postId: post.id,
                    content: commentText,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setCommentText('');
                toast.success('💬 Comment added!');
                const newComment = {
                    ...data.comment,
                    authorName: data.comment.authorName || 'You',
                };
                setComments(prev => [...prev, newComment]);
                setTimeout(() => onCommentAdded(), 500);
            } else {
                toast.error(data.error || 'Failed to add comment');
            }
        } catch (error) {
            console.error('Add comment error:', error);
            toast.error('Failed to add comment');
        } finally {
            setLoading(false);
            setTimeout(() => setIsSending(false), 300);
        }
    };

    const handleDeletePost = async () => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            const response = await authenticatedFetch(`/api/community/posts/${post.id}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Post deleted successfully');
                onClose();
                window.location.reload();
            } else {
                toast.error(data.error || 'Failed to delete post');
            }
        } catch (error) {
            console.error('Delete post error:', error);
            toast.error('Failed to delete post');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        try {
            const response = await authenticatedFetch(`/api/community/comments/${commentId}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Comment deleted successfully');
                onCommentAdded();
            } else {
                toast.error(data.error || 'Failed to delete comment');
            }
        } catch (error) {
            console.error('Delete comment error:', error);
            toast.error('Failed to delete comment');
        }
    };

    const isAuthor = currentUserId && post.authorId === currentUserId;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 modal-backdrop backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl modal-content">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <MessageCircle className="text-blue-600" />
                        Discussion
                    </h2>
                    <div className="flex items-center gap-2">
                        {isAuthor && (
                            <button
                                onClick={handleDeletePost}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 text-sm font-bold shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                                Delete Post
                            </button>
                        )}
                        <button 
                            onClick={onClose} 
                            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all duration-200"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* Post Content */}
                    <div className="mb-8 animate-slide-in-up">
                        <h3 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h3>
                        <p className="text-gray-700 whitespace-pre-wrap text-lg leading-relaxed">{post.content}</p>
                        
                        <div className="flex items-center gap-5 mt-5 text-sm text-gray-500">
                            <span className="font-medium">by {post.authorName || 'Anonymous'}</span>
                            <span>{formatDate(post.createdAt)}</span>
                            <span className="flex items-center gap-1.5">
                                <Eye size={16} />
                                {post.views || 0} views
                            </span>
                        </div>

                        {/* Vote buttons for post */}
                        <div className="flex items-center gap-4 mt-5">
                            <button
                                onClick={() => onVote(post.id, null, 'upvote')}
                                className="vote-button flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-700 rounded-xl transition-all duration-300 font-bold shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                                <ThumbsUp size={20} />
                                <span>{post.upvotes || 0}</span>
                            </button>
                            <button
                                onClick={() => onVote(post.id, null, 'downvote')}
                                className="vote-button flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-700 rounded-xl transition-all duration-300 font-bold shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                                <ThumbsDown size={20} />
                                <span>{post.downvotes || 0}</span>
                            </button>
                        </div>
                    </div>

                    {/* Comments */}
                    <div className="border-t-2 border-gray-200 pt-6">
                        <h4 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                            <MessageCircle className="text-blue-600" size={24} />
                            {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
                        </h4>

                        <div className="space-y-4 mb-6">
                            {comments.map((comment, index) => {
                                const isCommentAuthor = currentUserId && comment.authorId === currentUserId;
                                return (
                                    <div 
                                        key={comment.id} 
                                        className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-5 hover:shadow-md transition-all duration-300 comment-enter border-l-4 border-blue-500"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <p className="text-gray-800 flex-1 leading-relaxed">{comment.content}</p>
                                            {isCommentAuthor && (
                                                <button
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-100 p-2 rounded-lg transition-all duration-200"
                                                    title="Delete comment"
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-5 text-sm text-gray-600">
                                            <span className="font-bold">{comment.authorName || 'Anonymous'}</span>
                                            <span className="text-xs">{formatDate(comment.createdAt)}</span>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => onVote(null, comment.id, 'upvote')}
                                                    className="vote-button flex items-center gap-1 hover:text-green-600 transition-all duration-200 px-2 py-1 rounded-lg hover:bg-green-100"
                                                >
                                                    <ThumbsUp size={14} />
                                                    <span className="font-medium">{comment.upvotes || 0}</span>
                                                </button>
                                                <button
                                                    onClick={() => onVote(null, comment.id, 'downvote')}
                                                    className="vote-button flex items-center gap-1 hover:text-red-600 transition-all duration-200 px-2 py-1 rounded-lg hover:bg-red-100"
                                                >
                                                    <ThumbsDown size={14} />
                                                    <span className="font-medium">{comment.downvotes || 0}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Add Comment Form */}
                        <form onSubmit={handleAddComment} className="flex gap-3">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                required
                                minLength={5}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all duration-300 flex items-center gap-2 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 ${
                                    isSending ? 'animate-pulse-once' : ''
                                }`}
                            >
                                <Send size={18} className={isSending ? 'animate-bounce-once' : ''} />
                                {loading ? 'Posting...' : 'Post'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}