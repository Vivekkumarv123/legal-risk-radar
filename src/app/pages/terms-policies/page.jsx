"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Shield, FileText, Lock, Eye, Loader2, Info } from "lucide-react";

export default function TermsPolicies() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("terms");
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPolicies();
    }, []);

    const fetchPolicies = async () => {
        try {
            const res = await fetch('/api/policies');
            if (res.ok) {
                const data = await res.json();
                setContent(data.policies);
            }
        } catch (error) {
            console.error('Failed to load policies');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: "terms", label: "Terms of Service", icon: FileText },
        { id: "privacy", label: "Privacy Policy", icon: Lock },
        { id: "cookies", label: "Cookie Policy", icon: Eye },
        { id: "security", label: "Security", icon: Shield }
    ];

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
                <p className="text-sm font-medium text-slate-500">Loading legal documents...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Header - Sticky with Blur */}
            <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                        aria-label="Go Back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="h-6 w-px bg-slate-200" />
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 leading-tight">Legal Center</h1>
                        <p className="text-xs text-slate-500 font-medium">Terms, Policies & Compliance</p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="flex gap-6 overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        group flex items-center gap-2 py-4 border-b-2 text-sm font-medium transition-all whitespace-nowrap
                                        ${isActive 
                                            ? 'border-slate-900 text-slate-900' 
                                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                        }
                                    `}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Document Content */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
                            {content && content[activeTab] ? (
                                <div className="p-8 sm:p-10">
                                    {/* Document Header */}
                                    <div className="border-b border-slate-100 pb-8 mb-8">
                                        <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
                                            {content[activeTab].title}
                                        </h2>
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide">
                                                Effective
                                            </span>
                                            {new Date(content[activeTab].lastUpdated).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </div>

                                    {/* Document Body */}
                                    <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed prose-strong:text-slate-800 prose-li:text-slate-600">
                                        {content[activeTab].sections.map((section, index) => (
                                            <div key={index} className="mb-8 last:mb-0 group">
                                                <h3 className="group-hover:text-blue-700 transition-colors">
                                                    {section.heading}
                                                </h3>
                                                <p>
                                                    {section.content}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full p-12 text-center text-slate-400">
                                    <FileText className="w-12 h-12 mb-4 opacity-20" />
                                    <p>No content available for this section.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar / Contact / Quick Actions */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Help Card */}
                        <div className="bg-slate-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mb-4">
                                    <Info className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">Have specific questions?</h3>
                                <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                                    Our legal team is available to help clarify any aspect of our terms or privacy policies.
                                </p>
                                <button
                                    onClick={() => router.push('/pages/feedback')}
                                    className="w-full py-2.5 bg-white text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors shadow-sm"
                                >
                                    Contact Legal Support
                                </button>
                            </div>
                            {/* Decorative Circle */}
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-slate-800 rounded-full opacity-50 pointer-events-none" />
                        </div>

                        {/* Additional Info (Static for UI balance) */}
                        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                                Quick Links
                            </h4>
                            <ul className="space-y-3 text-sm">
                                <li>
                                    <button className="text-slate-600 hover:text-blue-600 hover:underline transition-all flex items-center gap-2">
                                        Download PDF Version
                                    </button>
                                </li>
                                <li>
                                    <button className="text-slate-600 hover:text-blue-600 hover:underline transition-all flex items-center gap-2">
                                        View Previous Versions
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}