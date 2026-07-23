"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Book, X, ExternalLink, Hash, Info, Bookmark } from "lucide-react";
import toast from "react-hot-toast";
import UpgradePrompt from "@/components/subscription/UpgradePrompt";
import { authenticatedFetch } from "@/utils/auth.utils";

const CATEGORIES = [
    'All', 'Criminal Law', 'Civil Law', 'Contract Law', 'Corporate Law', 
    'Constitutional Law', 'Property Law', 'Family Law', 'Tax Law', 
    'Labour Law', 'Intellectual Property Law', 'Environmental Law', 
    'Cyber Law', 'Administrative Law'
];

export default function LegalGlossary() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTerm, setSelectedTerm] = useState(null);
    const [glossaryData, setGlossaryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subscription, setSubscription] = useState(null);
    const [planDetails, setPlanDetails] = useState(null);
    const [usage, setUsage] = useState(null);
    const [loadingPlan, setLoadingPlan] = useState(true);
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [upgradeMessage, setUpgradeMessage] = useState("");
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [activeLetter, setActiveLetter] = useState(null);

    useEffect(() => { loadGlossaryData(); }, []);

    const loadGlossaryData = async () => {
        try {
            const response = await fetch('/api/legal-glossary');
            const data = await response.json();
            setGlossaryData(data);
        } catch (error) {
            console.error('Failed to load glossary:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchPlanData = async () => {
            try {
                const [subRes, usageRes] = await Promise.all([
                    authenticatedFetch('/api/subscription'),
                    authenticatedFetch('/api/usage')
                ]);
                const subJson = await subRes.json();
                if (subJson.success) {
                    setSubscription(subJson.subscription);
                    setPlanDetails(subJson.planDetails);
                }
                const usageJson = await usageRes.json();
                if (usageJson.success) setUsage(usageJson.currentUsage);
            } catch (error) {
                if (error.message !== 'Authentication required') console.error('Plan fetch error:', error);
            } finally {
                setLoadingPlan(false);
            }
        };
        fetchPlanData();
    }, []);

    const filteredTerms = useMemo(() => {
        return glossaryData.filter(term => {
            const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 term.definition.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || term.category === selectedCategory;
            const matchesLetter = !activeLetter || term.term.toUpperCase().startsWith(activeLetter);
            return matchesSearch && matchesCategory && matchesLetter;
        });
    }, [searchTerm, glossaryData, selectedCategory, activeLetter]);

    const getDailyLimit = () => planDetails?.limits?.dailyGlossaryLookups ?? 0;
    const getDailyUsed = () => {
        const todayKey = new Date().toISOString().slice(0, 10);
        return usage?.dailyGlossaryLookups?.[todayKey] || 0;
    };

    const handleSelectTerm = async (term) => {
        if (loadingPlan) return;
        if (!subscription || !planDetails) {
            toast.error('Please log in to view glossary details');
            return;
        }

        setSelectedTerm(term);

        try {
            const res = await authenticatedFetch('/api/legal-glossary/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ term: term.term }),
            });

            if (res.status === 403) {
                const data = await res.json();
                setSelectedTerm(null);
                setUpgradeMessage(data.upgradeMessage || 'Upgrade required for glossary lookups.');
                setShowUpgrade(true);
                return;
            }

            if (res.ok) {
                const usageRes = await authenticatedFetch('/api/usage');
                if (usageRes.ok) {
                    const usageJson = await usageRes.json();
                    if (usageJson.success) setUsage(usageJson.currentUsage);
                }
            }
        } catch (error) {
            console.error('Usage tracking failed:', error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 min-h-screen bg-[#F9FAFB]">
            {/* Header Section */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Book size={160} />
                </div>
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                        <Book className="text-blue-600" size={32} />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Legal Dictionary</h1>
                    <p className="text-slate-500 max-w-xl mx-auto text-lg leading-relaxed">
                        An authoritative guide to Indian legal terminology, covering civil, criminal, and corporate jurisprudence.
                    </p>
                    
                    {subscription && planDetails && (
                        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                {getDailyLimit() === -1 ? "Unlimited Lookups" : `${getDailyUsed()} / ${getDailyLimit()} Uses Used Today`}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="sticky top-4 z-30 space-y-4">
                <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-4 shadow-xl shadow-slate-200/50 border border-white flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search legal concepts, acts, or phrases..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-700 font-medium"
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="md:w-64 px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-700 font-bold text-sm cursor-pointer"
                    >
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>

                {/* A-Z Picker */}
                <div className="flex flex-wrap justify-center gap-1 bg-white/50 p-2 rounded-2xl backdrop-blur-sm overflow-x-auto no-scrollbar">
                    {Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ").map(letter => (
                        <button
                            key={letter}
                            onClick={() => setActiveLetter(activeLetter === letter ? null : letter)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                                activeLetter === letter 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110' 
                                : 'text-slate-400 hover:bg-white hover:text-slate-900'
                            }`}
                        >
                            {letter}
                        </button>
                    ))}
                    <button 
                        onClick={() => setActiveLetter(null)}
                        className="px-2 h-8 flex items-center justify-center rounded-lg text-[10px] font-black uppercase text-slate-400 hover:text-rose-500"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Results Grid */}
            {loading ? (
                <div className="flex flex-col items-center py-24 gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-bold text-slate-400 animate-pulse">Compiling database...</p>
                </div>
            ) : filteredTerms.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-24 text-center border-2 border-dashed border-slate-200">
                    <Info className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-xl font-bold text-slate-900">No terms found</p>
                    <p className="text-slate-400 mt-1 text-sm">Try adjusting your filters or search keywords.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTerms.map((term, index) => (
                        <div
                            key={index}
                            onClick={() => handleSelectTerm(term)}
                            className="group bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-100 cursor-pointer transition-all duration-300 flex flex-col animate-in fade-in slide-in-from-bottom-2"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                    {term.category}
                                </span>
                                <div className="text-slate-300 group-hover:text-blue-500 transition-colors">
                                    <ExternalLink size={18} />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                                {term.term}
                            </h3>
                            <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6 flex-grow">
                                {term.definition}
                            </p>
                            <div className="pt-4 border-t border-slate-50 flex items-center gap-2 text-slate-400">
                                <Bookmark size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-tighter">View Detailed Context</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Term Detail Modal */}
            {selectedTerm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] max-w-3xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="relative p-10 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                            <button
                                onClick={() => setSelectedTerm(null)}
                                className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <div className="flex items-center gap-3 mb-4">
                                <Hash className="text-blue-400" size={24} />
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">{selectedTerm.category}</span>
                            </div>
                            <h2 className="text-4xl font-black tracking-tight leading-tight">{selectedTerm.term}</h2>
                        </div>
                        
                        <div className="p-10 space-y-8 max-h-[65vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-3">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Info size={14} /> Formal Definition
                                </h3>
                                <p className="text-slate-700 text-lg leading-relaxed font-medium">
                                    {selectedTerm.definition}
                                </p>
                            </div>

                            {selectedTerm.example && (
                                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-3 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5">
                                        <Bookmark size={64} />
                                    </div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Practical Example</h3>
                                    <p className="text-slate-600 italic text-base leading-relaxed relative z-10">
                                        "{selectedTerm.example}"
                                    </p>
                                </div>
                            )}

                            {selectedTerm.relatedTerms?.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Related Jurisprudence</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTerm.relatedTerms.map((related, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    const term = glossaryData.find(t => t.term === related);
                                                    if (term) handleSelectTerm(term);
                                                }}
                                                className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm"
                                            >
                                                {related}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedTerm.legalReference && (
                                <div className="pt-8 border-t border-slate-100 flex items-start gap-4">
                                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                                        <Hash className="text-amber-600" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Legal Statutory Reference</h3>
                                        <p className="text-sm font-bold text-slate-600 leading-snug">{selectedTerm.legalReference}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <UpgradePrompt
                isOpen={showUpgrade}
                onClose={() => setShowUpgrade(false)}
                feature="glossary_lookup"
                currentPlan={subscription?.planId || "basic"}
                currentPlanExpiry={subscription?.endDate || null}
                message={upgradeMessage}
            />
        </div>
    );
}