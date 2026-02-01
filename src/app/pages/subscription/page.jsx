"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
    ShieldCheck, FileText, MessageCircle, Clock,
    Check, X, Briefcase, ChevronRight, Star, Crown, Zap, ArrowLeft
} from "lucide-react";
import PaymentModal from "@/components/subscription/PaymentModal";
import toast from "react-hot-toast";

export default function SubscriptionPage() {
    const [isAnnual, setIsAnnual] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [userSubscription, setUserSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Pricing Data
    const plans = [
        {
            id: "basic",
            name: "Basic",
            desc: "Essential legal guidance for individuals.",
            price: 0,
            features: [
                "5 AI Legal Queries / day",
                "Basic Document Summary",
                "Access to IPC/CrPC Context",
                "Community Support",
            ],
            missing: [
                "Deep Risk Analysis",
                "Contract Drafting",
                "Priority Support",
                "Voice Queries",
                "PDF Reports",
                "Contract Comparison"
            ],
            cta: "Current Plan",
            popular: false,
        },
        {
            id: "pro",
            name: "Pro Advisor",
            desc: "For freelancers and proactive professionals.",
            price: isAnnual ? 499 : 699,
            features: [
                "Unlimited AI Legal Chat",
                "Deep Contract Risk Analysis",
                "Voice-to-Text Queries",
                "Export Analysis to PDF",
                "Priority Email Support",
                "Contract Comparison Tool",
                "Chrome Extension Access",
                "Legal Glossary Pop-ups"
            ],
            missing: [
                "API Access",
                "Team Collaboration",
                "White-label Reports",
            ],
            cta: "Upgrade to Pro",
            popular: true,
        },
        {
            id: "enterprise",
            name: "Enterprise",
            desc: "For small firms and legal teams.",
            price: isAnnual ? 2499 : 2999,
            features: [
                "Everything in Pro",
                "Team Collaboration (5 Users)",
                "API Access for Workflow",
                "Dedicated Account Manager",
                "Custom Legal Templates",
                "Unlimited Documents",
                "Advanced Analytics",
                "White-label Reports"
            ],
            missing: [],
            cta: "Upgrade to Enterprise",
            popular: false,
        },
    ];

    useEffect(() => {
        checkUserSubscription();
        
        // Check if this is an upgrade flow
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('upgrade') === 'true') {
            // Scroll to pricing section
            setTimeout(() => {
                document.getElementById('subscription-plans')?.scrollIntoView({ behavior: 'smooth' });
            }, 500);
        }
    }, []);

    const checkUserSubscription = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/subscription', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            
            if (result.success) {
                setUserSubscription(result.subscription);
            }
        } catch (error) {
            console.error('Failed to check subscription:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlanSelect = (plan) => {
        if (plan.id === 'basic') {
            toast.info('You are already on the Basic plan');
            return;
        }

        if (userSubscription?.planId === plan.id) {
            toast.success(`You're already on the ${plan.name} plan!`);
            return;
        }

        setSelectedPlan(plan);
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = (subscription) => {
        setUserSubscription(subscription);
        setShowPaymentModal(false);
        setSelectedPlan(null);
        toast.success('Subscription updated successfully!');
        
        // Check if user should be redirected back to chat
        const returnUrl = sessionStorage.getItem('returnAfterUpgrade');
        if (returnUrl) {
            sessionStorage.removeItem('returnAfterUpgrade');
            setTimeout(() => {
                router.push(returnUrl);
            }, 1500);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading subscription details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} className="text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
                            <p className="text-gray-600">Choose the plan that works best for you</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Current Plan</p>
                        <p className="font-semibold text-gray-900 capitalize">
                            {userSubscription?.planName || 'Basic'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Current Usage Summary */}
            {userSubscription && (
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Usage</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">5</div>
                                <div className="text-sm text-gray-500">Daily AI Queries</div>
                                <div className="text-xs text-gray-400 mt-1">Resets daily</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {userSubscription.planId === 'basic' ? '0' : '∞'}
                                </div>
                                <div className="text-sm text-gray-500">Document Analysis</div>
                                <div className="text-xs text-gray-400 mt-1">This month</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                    {userSubscription.planId === 'basic' ? '0' : '∞'}
                                </div>
                                <div className="text-sm text-gray-500">Premium Features</div>
                                <div className="text-xs text-gray-400 mt-1">Available</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Subscription Plans */}
            <section className="py-12 px-6" id="subscription-plans">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Choose Your Plan</h2>

                        {/* Toggle Switch */}
                        <div className="flex items-center justify-center gap-4 p-1.5 bg-gray-100 rounded-full">
                            <button
                                onClick={() => setIsAnnual(false)}
                                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${!isAnnual ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setIsAnnual(true)}
                                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${isAnnual ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Yearly <span className="text-green-600 text-xs ml-1">-20%</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 items-start">
                        {plans.map((plan, i) => (
                            <div
                                key={i}
                                className={`relative rounded-3xl p-8 transition-all duration-300 border ${plan.popular
                                        ? "bg-gray-900 text-white shadow-2xl scale-100 md:scale-105 border-gray-800 z-10"
                                        : "bg-white text-gray-900 border-gray-200 hover:border-blue-200 hover:shadow-xl"
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-linear-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide shadow-lg">
                                        Most Popular
                                    </div>
                                )}

                                {userSubscription?.planId === plan.id && (
                                    <div className="absolute -top-4 right-4">
                                        <div className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                            <Crown size={12} />
                                            CURRENT
                                        </div>
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                    <p className={`text-sm ${plan.popular ? 'text-gray-400' : 'text-gray-500'}`}>{plan.desc}</p>
                                </div>

                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-5xl font-extrabold tracking-tight">
                                        {plan.price === 0 ? "Free" : `₹${plan.price}`}
                                    </span>
                                    {plan.price > 0 && <span className={`text-sm font-medium ${plan.popular ? 'text-gray-400' : 'text-gray-500'}`}>/month</span>}
                                </div>

                                <button
                                    onClick={() => handlePlanSelect(plan)}
                                    disabled={loading || (userSubscription?.planId === plan.id)}
                                    className={`w-full py-4 rounded-xl font-bold transition-all mb-8 ${
                                        userSubscription?.planId === plan.id
                                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                            : plan.popular
                                            ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50"
                                            : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                                        }`}
                                >
                                    {loading ? 'Loading...' : 
                                     userSubscription?.planId === plan.id ? 'Current Plan' : 
                                     plan.cta}
                                </button>

                                <div className="space-y-5">
                                    <p className="text-xs font-bold uppercase tracking-wider opacity-70">Features</p>
                                    <ul className="space-y-4">
                                        {plan.features.map((feat, idx) => (
                                            <li key={idx} className="flex items-start gap-3 text-sm font-medium">
                                                <div className={`mt-0.5 rounded-full p-0.5 ${plan.popular ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                                    <Check size={14} />
                                                </div>
                                                <span className={plan.popular ? 'text-gray-200' : 'text-gray-700'}>{feat}</span>
                                            </li>
                                        ))}
                                        {plan.missing.map((miss, idx) => (
                                            <li key={idx} className="flex items-start gap-3 text-sm opacity-40">
                                                <div className="mt-0.5">
                                                    <X size={16} />
                                                </div>
                                                <span>{miss}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Payment Modal */}
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => {
                    setShowPaymentModal(false);
                    setSelectedPlan(null);
                }}
                plan={selectedPlan}
                onSuccess={handlePaymentSuccess}
            />
        </div>
    );
}