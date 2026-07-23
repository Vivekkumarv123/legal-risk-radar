"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Search, 
  HelpCircle, 
  Book, 
  MessageSquare, 
  FileText, 
  Video, 
  ChevronRight, 
  TrendingUp, 
  ArrowRight,
  LifeBuoy,
  Mail
} from "lucide-react";

export default function HelpCenter() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    const categories = [
        {
            title: "Getting Started",
            description: "Onboarding basics & setup",
            icon: Book,
            color: "blue",
            articles: [
                { title: "How to create your first analysis", views: "1.2k" },
                { title: "Understanding risk scores", views: "890" },
                { title: "Uploading documents", views: "756" }
            ]
        },
        {
            title: "Platform Features",
            description: "Tools & advanced guides",
            icon: FileText,
            color: "emerald",
            articles: [
                { title: "Using the clause comparison tool", views: "654" },
                { title: "Legal glossary guide", views: "543" },
                { title: "Voice interface tutorial", views: "432" }
            ]
        },
        {
            title: "Billing & Subscription",
            description: "Payments, invoices & plans",
            icon: MessageSquare,
            color: "violet",
            articles: [
                { title: "Upgrading your plan", views: "987" },
                { title: "Managing subscriptions", views: "765" },
                { title: "Payment methods", views: "654" }
            ]
        },
        {
            title: "Video Tutorials",
            description: "Step-by-step walkthroughs",
            icon: Video,
            color: "orange",
            articles: [
                { title: "Complete walkthrough", views: "2.1k" },
                { title: "Advanced features", views: "1.5k" },
                { title: "Tips and tricks", views: "1.2k" }
            ]
        }
    ];

    const popularArticles = [
        { title: "How to analyze a contract", category: "Getting Started", views: "3.2k" },
        { title: "Understanding legal terminology", category: "Features", views: "2.8k" },
        { title: "Subscription plans explained", category: "Billing", views: "2.5k" },
        { title: "Privacy and security", category: "Account", views: "2.1k" }
    ];

    // Refined color utility
    const getTheme = (color) => {
        const themes = {
            blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100", icon: "text-blue-600", hover: "group-hover:text-blue-600" },
            emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", icon: "text-emerald-600", hover: "group-hover:text-emerald-600" },
            violet: { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-100", icon: "text-violet-600", hover: "group-hover:text-violet-600" },
            orange: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100", icon: "text-orange-600", hover: "group-hover:text-orange-600" },
        };
        return themes[color] || themes.blue;
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Header / Hero Section */}
            <div className="bg-white border-b border-slate-200 relative overflow-hidden">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
                
                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                    <button
                        onClick={() => router.back()}
                        className="absolute top-6 left-4 sm:left-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>

                    <div className="text-center max-w-2xl mx-auto mt-6">
                        <div className="inline-flex items-center justify-center p-2 bg-blue-50 rounded-xl mb-6 ring-1 ring-blue-100 shadow-sm">
                            <HelpCircle className="w-8 h-8 text-blue-600" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
                            How can we help?
                        </h1>
                        <p className="text-lg text-slate-500 mb-8">
                            Search our knowledge base for answers, guides, and tutorials.
                        </p>

                        {/* Search Bar */}
                        <div className="relative max-w-xl mx-auto group">
                            <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-lg group-hover:bg-blue-500/30 transition-all opacity-0 group-hover:opacity-100" />
                            <div className="relative bg-white rounded-xl shadow-lg border border-slate-200 flex items-center overflow-hidden ring-4 ring-transparent focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all">
                                <div className="pl-4 text-slate-400">
                                    <Search className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for articles (e.g., 'API keys', 'Billing')..."
                                    className="w-full px-4 py-4 text-slate-900 placeholder:text-slate-400 focus:outline-none"
                                />
                                <div className="pr-2 hidden sm:block">
                                    <kbd className="px-2 py-1 bg-slate-100 text-slate-500 text-xs font-medium rounded border border-slate-200">⌘ K</kbd>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
                
                {/* Popular Articles Section */}
                <div className="mb-16">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-bold text-slate-900">Trending Topics</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {popularArticles.map((article, index) => (
                            <button
                                key={index}
                                className="group flex flex-col p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all text-left"
                            >
                                <span className="text-xs font-semibold text-blue-600 mb-2">{article.category}</span>
                                <h3 className="text-sm font-semibold text-slate-900 mb-4 line-clamp-2 group-hover:text-blue-700">
                                    {article.title}
                                </h3>
                                <div className="mt-auto flex items-center justify-between text-slate-400 text-xs">
                                    <span>{article.views} reads</span>
                                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-600" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Categories Grid */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-900">Browse by Category</h2>
                        <button className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1">
                            View all categories <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {categories.map((category, index) => {
                            const Icon = category.icon;
                            const theme = getTheme(category.color);
                            
                            return (
                                <div key={index} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${theme.bg} ${theme.text}`}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-lg">{category.title}</h3>
                                                    <p className="text-sm text-slate-500">{category.description}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            {category.articles.map((article, idx) => (
                                                <button
                                                    key={idx}
                                                    className="group w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors text-left"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                                                        <span className={`text-sm font-medium text-slate-700 ${theme.hover}`}>
                                                            {article.title}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-slate-400 bg-white border border-slate-100 px-2 py-0.5 rounded-full shadow-sm group-hover:border-slate-200">
                                                        {article.views}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className={`px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-center`}>
                                        <button className={`text-sm font-semibold ${theme.text} flex items-center gap-1 hover:underline`}>
                                            View all 12 articles
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer / Contact CTA */}
                <div className="mt-16 bg-slate-900 rounded-2xl p-8 sm:p-12 relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 shadow-xl">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    
                    <div className="relative z-10 max-w-xl">
                        <div className="flex items-center gap-3 mb-3 justify-center sm:justify-start">
                            <LifeBuoy className="w-6 h-6 text-blue-400" />
                            <h2 className="text-2xl font-bold text-white">Still stuck?</h2>
                        </div>
                        <p className="text-slate-400 text-lg">
                            Can't find what you're looking for? Our support team is available 24/7 to help you resolve any issues.
                        </p>
                    </div>
                    
                    <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <button
                            onClick={() => router.push('/pages/feedback')}
                            className="px-6 py-3.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2"
                        >
                            <Mail className="w-4 h-4" />
                            Contact Support
                        </button>
                        <button className="px-6 py-3.5 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 border border-slate-700 transition-all flex items-center justify-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Live Chat
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}