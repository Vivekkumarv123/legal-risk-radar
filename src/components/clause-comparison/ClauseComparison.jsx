"use client";

import { useEffect, useState } from "react";
import { 
    FileText, Upload, ArrowRight, AlertTriangle, 
    CheckCircle, XCircle, Files, Activity, Info 
} from "lucide-react";
import toast from "react-hot-toast";
import { authenticatedFetch } from "@/utils/auth.utils";
import UpgradePrompt from "@/components/subscription/UpgradePrompt";

export default function ClauseComparison() {
    const [contracts, setContracts] = useState({ contract1: null, contract2: null });
    const [comparison, setComparison] = useState(null);
    const [loading, setLoading] = useState(false);
    const [subscription, setSubscription] = useState(null);
    const [planDetails, setPlanDetails] = useState(null);
    const [usage, setUsage] = useState(null);
    const [loadingPlan, setLoadingPlan] = useState(true);
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [upgradeMessage, setUpgradeMessage] = useState("");

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
                if (usageJson.success) {
                    setUsage(usageJson.currentUsage);
                }
            } catch (error) {
                if (error.message !== 'Authentication required') {
                    console.error('Plan fetch error:', error);
                }
            } finally {
                setLoadingPlan(false);
            }
        };
        fetchPlanData();
    }, []);

    const getDailyLimit = () => {
        if (!planDetails) return 0;
        return planDetails.limits?.dailyContractComparisons ?? (planDetails.features?.contractComparison ? -1 : 0);
    };

    const getDailyUsed = () => {
        if (!usage) return 0;
        const todayKey = new Date().toISOString().slice(0, 10);
        return usage.dailyContractComparisons?.[todayKey] || 0;
    };

    const handleFileUpload = (contractKey, file) => {
        setContracts(prev => ({ ...prev, [contractKey]: file }));
    };

    const compareContracts = async () => {
        if (!contracts.contract1 || !contracts.contract2) return;
        if (loadingPlan) return;

        if (!subscription || !planDetails) {
            toast.error('Please log in to compare contracts');
            return;
        }

        const limit = getDailyLimit();
        const used = getDailyUsed();
        if (limit !== -1 && used >= limit) {
            setUpgradeMessage(`You've reached your daily limit (${limit}/day).`);
            setShowUpgrade(true);
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('contract1', contracts.contract1);
        formData.append('contract2', contracts.contract2);

        try {
            const response = await authenticatedFetch('/api/compare-contracts', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            
            if (!response.ok) {
                if (response.status === 403) {
                    setUpgradeMessage(result.upgradeMessage || result.error || 'Upgrade required.');
                    setShowUpgrade(true);
                    return;
                }
                toast.error(result.error || 'Comparison failed');
                return;
            }
            setComparison(result);

            const usageRes = await authenticatedFetch('/api/usage');
            const usageJson = await usageRes.json();
            if (usageJson.success) setUsage(usageJson.currentUsage);
            
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-10 space-y-12 min-h-screen bg-[#FDFDFD]">
            {/* --- Header Section --- */}
            <header className="text-center max-w-3xl mx-auto space-y-4">
                {/* <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold uppercase tracking-widest border border-indigo-100">
                    <Activity size={14} className="animate-pulse" /> AI-Powered Analysis
                </div> */}
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                    Clause Comparison <span className="text-indigo-600">Engine</span>
                </h1>
                <p className="text-slate-500 text-lg max-w-xl mx-auto">
                    Upload two versions of a contract to highlight differences, missing protections, and verified similarities.
                </p>
                
                {subscription && planDetails && (
                    <div className="mt-4 flex justify-center">
                        <div className="bg-white border border-slate-200 rounded-2xl px-5 py-2 shadow-sm flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            <span className="text-xs font-semibold text-slate-600">
                                {getDailyLimit() === -1 
                                    ? "Pro Plan: Unlimited Comparisons" 
                                    : `${getDailyUsed()} of ${getDailyLimit()} Daily Uses Used`}
                            </span>
                        </div>
                    </div>
                )}
            </header>

            {/* --- Upload Interface --- */}
            <div className="grid lg:grid-cols-2 gap-8 relative max-w-5xl mx-auto">
                {/* Visual Connector Line */}
                <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="bg-white p-4 rounded-full border border-slate-200 shadow-xl text-indigo-600 ring-8 ring-[#FDFDFD]">
                        <Files size={28} />
                    </div>
                </div>

                {['contract1', 'contract2'].map((key, index) => (
                    <UploadCard 
                        key={key}
                        id={key}
                        title={`Contract ${index + 1}`}
                        file={contracts[key]}
                        onUpload={(file) => handleFileUpload(key, file)}
                    />
                ))}
            </div>

            {/* --- Comparison Action --- */}
            <div className="flex flex-col items-center gap-4">
                <button
                    onClick={compareContracts}
                    disabled={!contracts.contract1 || !contracts.contract2 || loading}
                    className="group relative inline-flex items-center gap-3 bg-indigo-600 text-white px-12 py-5 rounded-2xl font-bold text-xl transition-all shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 disabled:opacity-40 disabled:hover:translate-y-0 active:scale-95"
                >
                    {loading ? "Analyzing Context..." : "Start Comparison"}
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                {!contracts.contract1 || !contracts.contract2 ? (
                    <span className="text-xs text-slate-400 font-medium">Please select both files to proceed</span>
                ) : null}
            </div>

            {/* --- Results Breakdown --- */}
            {comparison && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    <hr className="border-slate-200 border-dashed" />
                    
                    {/* Key Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <StatSummary 
                            label="Missing Items" 
                            val={(comparison.missing_in_contract1?.length || 0) + (comparison.missing_in_contract2?.length || 0)} 
                            color="red"
                        />
                        <StatSummary label="Differences" val={comparison.differences?.length || 0} color="amber" />
                        <StatSummary label="Aligned" val={comparison.similar?.length || 0} color="emerald" />
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Missing Clauses Section */}
                        <ResultBox 
                            title="Missing Provisions" 
                            icon={<XCircle className="text-rose-500" />} 
                            headerBg="bg-rose-50"
                        >
                            <MissingSection 
                                data={comparison.missing_in_contract2} 
                                label="Absent in Contract 2" 
                                color="rose"
                            />
                            <MissingSection 
                                data={comparison.missing_in_contract1} 
                                label="Absent in Contract 1" 
                                color="rose"
                            />
                            {!comparison.missing_in_contract1?.length && !comparison.missing_in_contract2?.length && (
                                <p className="text-slate-400 text-sm italic py-10 text-center">No missing clauses found.</p>
                            )}
                        </ResultBox>

                        {/* Differences Section */}
                        <ResultBox 
                            title="Key Differences" 
                            icon={<AlertTriangle className="text-amber-500" />} 
                            headerBg="bg-amber-50"
                        >
                            {comparison.differences?.length > 0 ? (
                                comparison.differences.map((diff, i) => (
                                    <DifferenceCard key={i} diff={diff} />
                                ))
                            ) : (
                                <p className="text-slate-400 text-sm italic py-10 text-center">Terms are functionally identical.</p>
                            )}
                        </ResultBox>

                        {/* Aligned Sections */}
                        <ResultBox 
                            title="Aligned Terms" 
                            icon={<CheckCircle className="text-emerald-500" />} 
                            headerBg="bg-emerald-50"
                        >
                            {comparison.similar?.length > 0 ? (
                                comparison.similar.map((clause, i) => (
                                    <SimilarCard key={i} clause={clause} />
                                ))
                            ) : (
                                <p className="text-slate-400 text-sm italic py-10 text-center">No standard matches found.</p>
                            )}
                        </ResultBox>
                    </div>
                </div>
            )}

            <UpgradePrompt
                isOpen={showUpgrade}
                onClose={() => setShowUpgrade(false)}
                feature="contract_comparison"
                currentPlan={subscription?.planId || "basic"}
                currentPlanExpiry={subscription?.endDate || null}
                message={upgradeMessage}
            />
        </div>
    );
}

/* --- Modular Helper Components --- */

function UploadCard({ id, title, file, onUpload }) {
    return (
        <div
            className={`relative transition-all rounded-[2.2rem] p-0.5 ${
                file ? 'bg-indigo-200' : 'bg-white shadow-sm hover:shadow-md'
            }`}
        >
            <div
                className={`border-2 border-dashed rounded-[2rem] p-7 text-center bg-white ${
                    file ? 'border-indigo-400' : 'border-slate-200 hover:border-indigo-300'
                }`}
            >
                <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => onUpload(e.target.files[0])}
                    className="hidden"
                    id={id}
                />

                <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${
                        file ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'
                    }`}
                >
                    <FileText size={32} strokeWidth={1.5} />
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-0.5">
                    {title}
                </h3>

                <p className="text-sm text-slate-500 mb-5">
                    Drop your legal doc or click to browse
                </p>

                <label
                    htmlFor={id}
                    className="cursor-pointer bg-slate-900 text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-indigo-600 transition-colors shadow-md shadow-slate-200"
                >
                    {file ? 'Replace File' : 'Select File'}
                </label>

                {file && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-indigo-700 bg-indigo-50/60 py-1.5 px-3 rounded-full text-xs font-bold w-fit mx-auto border border-indigo-100">
                        <CheckCircle size={13} /> {file.name}
                    </div>
                )}
            </div>
        </div>
    );
}


function ResultBox({ title, icon, headerBg, children }) {
    return (
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden flex flex-col h-[650px]">
            <div className={`p-6 ${headerBg} border-b border-black/5 flex items-center gap-3`}>
                {icon}
                <h4 className="font-black text-slate-800 tracking-tight uppercase text-sm">{title}</h4>
            </div>
            <div className="p-5 overflow-y-auto space-y-4 flex-grow custom-scrollbar">
                {children}
            </div>
        </div>
    );
}

function MissingSection({ data, label, color }) {
    if (!data?.length) return null;
    return (
        <div className="space-y-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{label}</span>
            {data.map((item, i) => (
                <div key={i} className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100">
                    <p className="text-sm font-bold text-rose-900 mb-1">{typeof item === 'object' ? item.title : item}</p>
                    {item.description && <p className="text-xs text-rose-700/80 leading-relaxed">{item.description}</p>}
                    {item.significance && (
                        <div className="mt-3 p-3 bg-white/70 rounded-xl border border-rose-200 text-xs">
                            <span className="font-bold text-rose-900 block mb-1 underline decoration-rose-200">Impact Analysis</span>
                            <p className="text-rose-800 italic">{item.significance}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function DifferenceCard({ diff }) {
    const isObj = typeof diff === 'object';
    return (
        <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-100 space-y-3">
            <div className="flex items-center gap-2 text-amber-700">
                <Info size={14} />
                <span className="text-[10px] font-black uppercase tracking-tighter">
                    {isObj ? diff.category : 'Modification'}
                </span>
            </div>
            <p className="text-sm text-slate-800 font-medium leading-relaxed">{isObj ? diff.change : diff}</p>
            {isObj && diff.impact && (
                <div className="p-3 bg-amber-100/30 rounded-xl text-xs text-amber-900 italic leading-snug">
                    {diff.impact}
                </div>
            )}
        </div>
    );
}

function SimilarCard({ clause }) {
    return (
        <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100">
            <p className="text-sm font-bold text-emerald-900 leading-tight mb-1">
                {typeof clause === 'object' ? clause.title : clause}
            </p>
            {clause.description && (
                <p className="text-xs text-emerald-700/80 leading-relaxed line-clamp-3">
                    {clause.description}
                </p>
            )}
        </div>
    );
}

function StatSummary({ label, val, color }) {
    const colorMap = {
        red: "text-rose-600 bg-rose-50 border-rose-100",
        amber: "text-amber-600 bg-amber-50 border-amber-100",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100"
    };
    return (
        <div className={`p-5 rounded-3xl border text-center ${colorMap[color]}`}>
            <div className="text-3xl font-black mb-1">{val}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">{label}</div>
        </div>
    );
}