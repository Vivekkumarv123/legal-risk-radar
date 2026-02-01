"use client";

import { useState } from "react";
import { Crown, X, Zap, ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UpgradePrompt({ 
    isOpen, 
    onClose, 
    feature, 
    currentPlan = "basic",
    message,
    upgradeMessage 
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
        router.push('/pages/pricing');
        onClose();
    };

    const getFeatureIcon = (feature) => {
        switch (feature) {
            case 'ai_query': return '🤖';
            case 'document_analysis': return '📄';
            case 'voice_query': return '🎤';
            case 'pdf_report': return '📊';
            case 'contract_comparison': return '⚖️';
            case 'chrome_extension': return '🌐';
            default: return '⭐';
        }
    };

    const getFeatureName = (feature) => {
        switch (feature) {
            case 'ai_query': return 'AI Queries';
            case 'document_analysis': return 'Document Analysis';
            case 'voice_query': return 'Voice Queries';
            case 'pdf_report': return 'PDF Reports';
            case 'contract_comparison': return 'Contract Comparison';
            case 'chrome_extension': return 'Chrome Extension';
            default: return 'Premium Feature';
        }
    };

    const proFeatures = [
        'Unlimited AI queries',
        'Document analysis',
        'Voice queries',
        'PDF report generation',
        'Contract comparison',
        'Chrome extension access',
        'Priority support'
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`bg-white rounded-lg max-w-md w-full transform transition-all duration-200 ${
                closing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
            }`}>
                {/* Header */}
                <div className="relative p-6 text-center border-b border-gray-200">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                    
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">{getFeatureIcon(feature)}</span>
                    </div>
                    
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Upgrade Required
                    </h2>
                    <p className="text-gray-600 text-sm">
                        {message || `${getFeatureName(feature)} is not available in your current plan`}
                    </p>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Current Limitation */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <X size={14} className="text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-red-900 text-sm">Current Plan Limitation</h3>
                                <p className="text-red-700 text-sm mt-1">
                                    {upgradeMessage || `Your ${currentPlan} plan doesn't include ${getFeatureName(feature).toLowerCase()}.`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Pro Plan Benefits */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Crown className="text-blue-600" size={20} />
                            <h3 className="font-bold text-blue-900">Pro Plan Benefits</h3>
                        </div>
                        
                        <div className="space-y-2">
                            {proFeatures.slice(0, 4).map((benefit, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Check size={14} className="text-green-600" />
                                    <span className="text-sm text-gray-700">{benefit}</span>
                                </div>
                            ))}
                            <div className="text-xs text-gray-500 mt-2">
                                + {proFeatures.length - 4} more features
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-gray-900">₹499</span>
                            <span className="text-gray-500 text-sm">/month</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Cancel anytime • 7-day money-back guarantee
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={handleUpgrade}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                        >
                            <Zap size={16} />
                            Upgrade to Pro
                            <ArrowRight size={16} />
                        </button>
                        
                        <button
                            onClick={handleClose}
                            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                            Maybe Later
                        </button>
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Secure Payment</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>Instant Access</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span>Cancel Anytime</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}