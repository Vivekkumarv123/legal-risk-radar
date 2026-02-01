"use client";

import { useState } from "react";
import { Crown, X, Zap, ArrowRight, Check, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UsageLimitModal({ 
    isOpen, 
    onClose, 
    limitType = "ai_query",
    currentPlan = "basic",
    usageCount = 0,
    limit = 5
}) {
    const router = useRouter();
    const [closing, setClosing] = useState(false);

    const handleClose = () => {
        setClosing(true);
        setTimeout(() => {
            onClose();
            setClosing(false);
        }, 200);
    };

    const handleUpgrade = () => {
        // Store return URL to come back to chat after payment
        sessionStorage.setItem('returnAfterUpgrade', window.location.pathname);
        router.push('/pages/subscription?upgrade=true');
        onClose();
    };

    const getLimitInfo = () => {
        switch (limitType) {
            case 'ai_query':
                return {
                    title: 'Daily AI Query Limit Reached',
                    description: `You've used all ${limit} of your daily AI queries.`,
                    icon: '🤖',
                    feature: 'Unlimited AI Queries'
                };
            case 'document_analysis':
                return {
                    title: 'Document Analysis Not Available',
                    description: 'Document analysis is not included in your Basic plan.',
                    icon: '📄',
                    feature: 'Document Analysis'
                };
            case 'voice_query':
                return {
                    title: 'Voice Queries Not Available',
                    description: 'Voice queries are not included in your Basic plan.',
                    icon: '🎤',
                    feature: 'Voice Queries'
                };
            case 'pdf_report':
                return {
                    title: 'PDF Reports Not Available',
                    description: 'PDF report generation is not included in your Basic plan.',
                    icon: '📊',
                    feature: 'PDF Reports'
                };
            default:
                return {
                    title: 'Upgrade Required',
                    description: 'This feature is not available in your current plan.',
                    icon: '⭐',
                    feature: 'Premium Features'
                };
        }
    };

    const limitInfo = getLimitInfo();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`bg-white rounded-xl max-w-md w-full transform transition-all duration-200 ${
                closing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
            }`}>
                {/* Header */}
                <div className="relative p-6 text-center">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                    
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">{limitInfo.icon}</span>
                    </div>
                    
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {limitInfo.title}
                    </h2>
                    <p className="text-gray-600 text-sm">
                        {limitInfo.description}
                    </p>
                </div>

                {/* Content */}
                <div className="px-6 pb-6">
                    {/* Usage Progress (for query limits) */}
                    {limitType === 'ai_query' && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Daily Usage</span>
                                <span className="text-sm text-gray-500">{usageCount}/{limit}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min((usageCount / limit) * 100, 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Resets daily at midnight
                            </p>
                        </div>
                    )}

                    {/* Pro Plan Benefits */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Crown className="text-blue-600" size={20} />
                            <h3 className="font-bold text-blue-900">Upgrade to Pro</h3>
                            <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                Popular
                            </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2">
                                <Check size={14} className="text-green-600" />
                                <span className="text-sm text-gray-700">Unlimited AI queries</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check size={14} className="text-green-600" />
                                <span className="text-sm text-gray-700">Document analysis</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check size={14} className="text-green-600" />
                                <span className="text-sm text-gray-700">Voice queries</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check size={14} className="text-green-600" />
                                <span className="text-sm text-gray-700">PDF reports</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Sparkles size={14} className="text-purple-600" />
                                <span className="text-sm text-gray-700">Priority support</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="inline-flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-gray-900">₹499</span>
                                <span className="text-gray-500 text-sm">/month</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={handleUpgrade}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg"
                        >
                            <Zap size={16} />
                            Upgrade to Pro
                            <ArrowRight size={16} />
                        </button>
                        
                        <button
                            onClick={handleClose}
                            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                            Continue with Basic
                        </button>
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Instant Upgrade</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>Cancel Anytime</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}