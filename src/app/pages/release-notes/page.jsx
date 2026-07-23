"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Bug, Zap, Shield, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ReleaseNotes() {
    const router = useRouter();
    const [releases, setReleases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReleaseNotes();
    }, []);

    const fetchReleaseNotes = async () => {
        try {
            const res = await fetch('/api/release-notes');
            if (res.ok) {
                const data = await res.json();
                setReleases(data.releases);
            }
        } catch (error) {
            toast.error('Failed to load release notes');
        } finally {
            setLoading(false);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'feature': return <Sparkles className="w-4 h-4" />;
            case 'bugfix': return <Bug className="w-4 h-4" />;
            case 'improvement': return <Zap className="w-4 h-4" />;
            case 'security': return <Shield className="w-4 h-4" />;
            default: return <Sparkles className="w-4 h-4" />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'feature': return 'bg-blue-100 text-blue-600';
            case 'bugfix': return 'bg-red-100 text-red-600';
            case 'improvement': return 'bg-green-100 text-green-600';
            case 'security': return 'bg-purple-100 text-purple-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back</span>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Release Notes</h1>
                    <p className="text-gray-600 mt-1">Stay updated with the latest features and improvements</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="space-y-8">
                    {releases.map((release, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-xl p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                                        Version {release.version}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {new Date(release.date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                {release.isLatest && (
                                    <span className="px-3 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full">
                                        Latest
                                    </span>
                                )}
                            </div>

                            <div className="space-y-3">
                                {release.changes.map((change, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getTypeColor(change.type)}`}>
                                            {getTypeIcon(change.type)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 mb-1">
                                                {change.title}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {change.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
