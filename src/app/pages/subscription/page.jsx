"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
    ShieldCheck, FileText, MessageCircle, Clock,
    Check, X, Briefcase, ChevronRight, Star, Crown, Zap, ArrowLeft,
    Users, TrendingUp, Lock, Sparkles, CheckCircle2, Award, BarChart3, AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";
import { getDaysUntilExpiry } from "@/utils/subscription.utils";

export default function SubscriptionPage() {
    const [isAnnual, setIsAnnual] = useState(true);
    const [userSubscription, setUserSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Pricing Data
    const plans = [
        {
            id: "basic",
            name: "Basic",
            tagline: "Essential Tools",
            desc: "Perfect for individuals exploring legal AI assistance.",
            price: 0,
            annualPrice: 0,
            icon: FileText,
            color: "gray",
            features: [
                { text: "5 AI Legal Queries / day", highlight: false },
                { text: "Basic Document Summary", highlight: false },
                { text: "Access to IPC/CrPC Context", highlight: false },
                { text: "Community Support", highlight: false },
            ],
            limits: "Limited daily usage",
            cta: "Current Plan",
            popular: false,
        },
        {
            id: "pro",
            name: "Pro Advisor",
            tagline: "Professional Power",
            desc: "For freelancers and professionals who need advanced legal insights.",
            price: 699,
            annualPrice: 499,
            icon: Sparkles,
            color: "blue",
            features: [
                { text: "Unlimited AI Legal Chat", highlight: true },
                { text: "Deep Contract Risk Analysis", highlight: true },
                { text: "Voice-to-Text Queries", highlight: false },
                { text: "Export Analysis to PDF", highlight: false },
                { text: "Priority Email Support", highlight: false },
                { text: "Contract Comparison Tool", highlight: false },
                { text: "Chrome Extension Access", highlight: false },
                { text: "Legal Glossary Pop-ups", highlight: false }
            ],
            limits: "Unlimited usage",
            cta: "Upgrade to Pro",
            popular: true,
            savings: "Save ₹2,400/year"
        },
        {
            id: "enterprise",
            name: "Enterprise",
            tagline: "Complete Solution",
            desc: "For legal teams and firms requiring advanced collaboration.",
            price: 2999,
            annualPrice: 2499,
            icon: Crown,
            color: "purple",
            features: [
                { text: "Everything in Pro", highlight: true },
                { text: "Team Collaboration (5 Users)", highlight: true },
                { text: "API Access for Workflow", highlight: false },
                { text: "Dedicated Account Manager", highlight: false },
                { text: "Custom Legal Templates", highlight: false },
                { text: "Unlimited Documents", highlight: false },
                { text: "Advanced Analytics Dashboard", highlight: false },
                { text: "White-label Reports", highlight: false }
            ],
            limits: "Enterprise-grade",
            cta: "Contact Sales",
            popular: false,
            savings: "Save ₹6,000/year"
        },
    ];

    useEffect(() => {
        checkUserSubscription();
        
        const urlParams = new URLSearchParams(window.location.search);
        
        // Handle successful payment
        if (urlParams.get('success') === 'true') {
            const sessionId = urlParams.get('session_id');
            const planId = urlParams.get('plan');
            const billingCycle = urlParams.get('billing');
            
            if (sessionId && planId && billingCycle) {
                // Verify and activate subscription
                verifyPayment(sessionId, planId, billingCycle);
            } else {
                toast.success('Payment successful! Your subscription is now active.');
                // Refresh subscription data after a short delay
                setTimeout(() => {
                    checkUserSubscription();
                }, 2000);
            }
            
            // Clean up URL
            window.history.replaceState({}, '', '/pages/subscription');
        }
        
        // Handle cancelled payment
        if (urlParams.get('canceled') === 'true') {
            toast.error('Payment was cancelled. Please try again.');
            // Clean up URL
            window.history.replaceState({}, '', '/pages/subscription');
        }
        
        if (urlParams.get('upgrade') === 'true') {
            setTimeout(() => {
                document.getElementById('subscription-plans')?.scrollIntoView({ behavior: 'smooth' });
            }, 500);
        }
    }, []);

    const verifyPayment = async (sessionId, planId, billingCycle) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/stripe/verify-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ sessionId, planId, billingCycle })
            });

            const result = await response.json();

            if (result.success) {
                toast.success('Payment successful! Your subscription is now active.');
                // Refresh subscription data
                checkUserSubscription();
            } else {
                toast.error('Failed to activate subscription. Please contact support.');
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Failed to verify payment. Please refresh the page.');
        }
    };

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
        // Prevent selecting Basic plan
        if (plan.id === 'basic') {
            if (userSubscription?.planId === 'basic') {
                toast.info('You are already on the Basic plan');
            } else {
                toast.error('Cannot downgrade to Basic plan. Please contact support if you want to cancel your subscription.');
            }
            return;
        }

        // Check if already on this plan
        if (userSubscription?.planId === plan.id) {
            toast.success(`You're already subscribed to ${plan.name}!`);
            return;
        }

        // Prevent downgrade from Enterprise to Pro
        if (userSubscription?.planId === 'enterprise' && plan.id === 'pro') {
            toast.error('Cannot downgrade from Enterprise to Pro. Please contact support if you want to change your plan.');
            return;
        }

        // Navigate to payment page
        router.push(`/pages/payment?plan=${plan.id}&billing=${isAnnual ? 'annual' : 'monthly'}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-gray-600 font-medium">Loading your subscription...</p>
                </div>
            </div>
        );
    }

    const currentPlan = plans.find(p => p.id === (userSubscription?.planId || 'basic'));

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
            
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2.5 hover:bg-gray-100 rounded-xl transition-all"
                            >
                                <ArrowLeft size={20} className="text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Subscription Plans</h1>
                                <p className="text-sm text-gray-500">Choose the perfect plan for your needs</p>
                            </div>
                        </div>
                        
                        {userSubscription && (
                            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                    {currentPlan && <currentPlan.icon className="w-4 h-4 text-white" />}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-medium">Current Plan</p>
                                    <p className="text-sm font-bold text-gray-900">{currentPlan?.name}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200 mb-6">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-700">Trusted by 10,000+ users</span>
                    </div>
                    
                    <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                        Unlock the Full Power of <br/>
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Legal AI Assistant
                        </span>
                    </h2>
                    
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        From individual professionals to enterprise teams, we have a plan that scales with your legal needs.
                    </p>
                </div>
            </section>

            {/* Expiry Warning Banner */}
            {userSubscription && userSubscription.planId !== 'basic' && userSubscription.endDate && (() => {
                const daysLeft = getDaysUntilExpiry(userSubscription);
                const showWarning = daysLeft <= 7 && daysLeft > 0;
                const isExpired = daysLeft <= 0;
                
                if (!showWarning && !isExpired) return null;
                
                return (
                    <section className="px-4 sm:px-6 lg:px-8 pb-8">
                        <div className="max-w-6xl mx-auto">
                            <div className={`rounded-2xl border-2 p-6 ${
                                isExpired 
                                    ? 'bg-red-50 border-red-300' 
                                    : 'bg-amber-50 border-amber-300'
                            }`}>
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                                        isExpired 
                                            ? 'bg-red-100' 
                                            : 'bg-amber-100'
                                    }`}>
                                        <AlertTriangle className={`w-6 h-6 ${
                                            isExpired 
                                                ? 'text-red-600' 
                                                : 'text-amber-600'
                                        }`} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`text-lg font-bold mb-2 ${
                                            isExpired 
                                                ? 'text-red-900' 
                                                : 'text-amber-900'
                                        }`}>
                                            {isExpired 
                                                ? 'Your subscription has expired' 
                                                : `Your subscription expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`
                                            }
                                        </h3>
                                        <p className={`text-sm mb-4 ${
                                            isExpired 
                                                ? 'text-red-700' 
                                                : 'text-amber-700'
                                        }`}>
                                            {isExpired 
                                                ? 'Your account has been downgraded to the Basic plan. Renew now to restore your premium features.' 
                                                : 'Renew your subscription to continue enjoying premium features without interruption.'
                                            }
                                        </p>
                                        <button
                                            onClick={() => document.getElementById('subscription-plans')?.scrollIntoView({ behavior: 'smooth' })}
                                            className={`px-6 py-2.5 rounded-lg font-semibold text-white transition-all flex items-center gap-2 ${
                                                isExpired 
                                                    ? 'bg-red-600 hover:bg-red-700' 
                                                    : 'bg-amber-600 hover:bg-amber-700'
                                            }`}
                                        >
                                            {isExpired ? 'Renew Now' : 'Extend Subscription'}
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                );
            })()}

            {/* Current Usage Summary (Enhanced) */}
            {userSubscription && (
                <section className="px-4 sm:px-6 lg:px-8 pb-12">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
                            
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                                            <Award className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">Your Plan Overview</h3>
                                            <p className="text-sm text-blue-100">Track your usage and benefits</p>
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-xl">
                                        <Crown className="w-5 h-5 text-yellow-300" />
                                        <span className="font-bold text-white capitalize">{userSubscription?.planName || 'Basic'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="p-8">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                        <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                                            <div className="flex items-center justify-between mb-3">
                                                <MessageCircle className="w-8 h-8 text-blue-600" />
                                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                            </div>
                                            <div className="text-3xl font-bold text-blue-600 mb-1">
                                                {userSubscription.planId === 'basic' ? '5' : '∞'}
                                            </div>
                                            <div className="text-sm font-medium text-gray-700">AI Queries</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {userSubscription.planId === 'basic' ? 'Per day' : 'Unlimited'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                        <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl border border-emerald-200">
                                            <div className="flex items-center justify-between mb-3">
                                                <FileText className="w-8 h-8 text-emerald-600" />
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            </div>
                                            <div className="text-3xl font-bold text-emerald-600 mb-1">
                                                {userSubscription.planId === 'basic' ? '0' : '∞'}
                                            </div>
                                            <div className="text-sm font-medium text-gray-700">Documents</div>
                                            <div className="text-xs text-gray-500 mt-1">This month</div>
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                        <div className="relative bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                                            <div className="flex items-center justify-between mb-3">
                                                <Sparkles className="w-8 h-8 text-purple-600" />
                                                <Star className="w-5 h-5 text-purple-500" />
                                            </div>
                                            <div className="text-3xl font-bold text-purple-600 mb-1">
                                                {userSubscription.planId === 'basic' ? '4' : 
                                                 userSubscription.planId === 'pro' ? '8' : '12'}
                                            </div>
                                            <div className="text-sm font-medium text-gray-700">Features</div>
                                            <div className="text-xs text-gray-500 mt-1">Unlocked</div>
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                        <div className="relative bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-2xl border border-amber-200">
                                            <div className="flex items-center justify-between mb-3">
                                                <Clock className="w-8 h-8 text-amber-600" />
                                                <TrendingUp className="w-5 h-5 text-amber-500" />
                                            </div>
                                            <div className="text-3xl font-bold text-amber-600 mb-1">
                                                {userSubscription.planId === 'basic' ? '∞' : 
                                                 userSubscription.endDate ? 
                                                 Math.max(0, Math.ceil((new Date(userSubscription.endDate) - new Date()) / (1000 * 60 * 60 * 24))) : 
                                                 '365'}
                                            </div>
                                            <div className="text-sm font-medium text-gray-700">
                                                {userSubscription.planId === 'basic' ? 'Forever' : 'Days Left'}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {userSubscription.planId === 'basic' ? 'No expiry' : 
                                                 userSubscription.endDate ? 
                                                 new Date(userSubscription.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 
                                                 'Active'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Benefits - Only show if on Basic */}
                                {userSubscription.planId === 'basic' && (
                                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
                                        
                                        <div className="relative flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Zap className="w-6 h-6 text-yellow-300" />
                                                    <h4 className="text-xl font-bold text-white">Unlock Premium Features</h4>
                                                </div>
                                                <p className="text-blue-100 mb-6 max-w-xl">
                                                    Upgrade to Pro for unlimited queries, advanced analysis, voice interface, and 8+ premium features to supercharge your legal workflow.
                                                </p>
                                                <div className="flex flex-wrap gap-3">
                                                    <button
                                                        onClick={() => document.getElementById('subscription-plans')?.scrollIntoView({ behavior: 'smooth' })}
                                                        className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                                                    >
                                                        View Plans
                                                        <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handlePlanSelect(plans.find(p => p.id === 'pro'))}
                                                        className="px-6 py-3 bg-white/10 backdrop-blur text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20"
                                                    >
                                                        Upgrade Now
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="hidden lg:block">
                                                <div className="w-32 h-32 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center">
                                                    <Crown className="w-16 h-16 text-yellow-300" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Subscription Plans */}
            <section className="py-12 px-4 sm:px-6 lg:px-8" id="subscription-plans">
                <div className="max-w-7xl mx-auto">
                    
                    {/* Billing Toggle */}
                    <div className="flex flex-col items-center mb-12">
                        <div className="inline-flex items-center gap-4 p-2 bg-gray-100 rounded-2xl shadow-inner">
                            <button
                                onClick={() => setIsAnnual(false)}
                                className={`relative px-8 py-3 rounded-xl text-sm font-semibold transition-all ${
                                    !isAnnual 
                                        ? 'bg-white text-gray-900 shadow-lg' 
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setIsAnnual(true)}
                                className={`relative px-8 py-3 rounded-xl text-sm font-semibold transition-all ${
                                    isAnnual 
                                        ? 'bg-white text-gray-900 shadow-lg' 
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Annual
                                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                                    -30%
                                </span>
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-3">Save up to ₹6,000 per year with annual billing</p>
                    </div>

                    {/* Plans Grid */}
                    <div className="grid lg:grid-cols-3 gap-8 items-start">
                        {plans.map((plan, idx) => {
                            const Icon = plan.icon;
                            const isCurrentPlan = userSubscription?.planId === plan.id;
                            const displayPrice = isAnnual ? plan.annualPrice : plan.price;
                            
                            return (
                                <div
                                    key={plan.id}
                                    className={`relative rounded-3xl transition-all duration-500 ${
                                        plan.popular
                                            ? "bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl scale-100 lg:scale-105 border-2 border-gray-700 z-10"
                                            : "bg-white text-gray-900 border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl"
                                    }`}
                                    style={{
                                        animationDelay: `${idx * 100}ms`
                                    }}
                                >
                                    {/* Popular Badge */}
                                    {plan.popular && (
                                        <div className="absolute -top-5 left-0 right-0 flex justify-center">
                                            <div className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-full shadow-lg flex items-center gap-2">
                                                <Star className="w-4 h-4 fill-current" />
                                                MOST POPULAR
                                            </div>
                                        </div>
                                    )}

                                    {/* Current Plan Badge */}
                                    {isCurrentPlan && (
                                        <div className="absolute -top-4 right-6">
                                            <div className="px-4 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                ACTIVE
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-8">
                                        {/* Icon & Title */}
                                        <div className="mb-6">
                                            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 ${
                                                plan.popular 
                                                    ? 'bg-blue-500/20' 
                                                    : 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200'
                                            }`}>
                                                <Icon className={`w-7 h-7 ${plan.popular ? 'text-blue-400' : 'text-blue-600'}`} />
                                            </div>
                                            
                                            <div className="mb-2">
                                                <span className={`text-sm font-semibold ${plan.popular ? 'text-blue-400' : 'text-blue-600'}`}>
                                                    {plan.tagline}
                                                </span>
                                            </div>
                                            
                                            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                            <p className={`text-sm leading-relaxed ${plan.popular ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {plan.desc}
                                            </p>
                                        </div>

                                        {/* Pricing */}
                                        <div className="mb-8">
                                            <div className="flex items-baseline gap-2 mb-2">
                                                <span className="text-5xl font-bold tracking-tight">
                                                    {displayPrice === 0 ? "Free" : `₹${displayPrice}`}
                                                </span>
                                                {displayPrice > 0 && (
                                                    <span className={`text-sm font-medium ${plan.popular ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        /month
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {isAnnual && plan.savings && (
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                                                    <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                                                    <span className="text-xs font-semibold text-green-700">
                                                        {plan.savings}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            <div className={`mt-2 text-xs font-medium ${plan.popular ? 'text-gray-500' : 'text-gray-400'}`}>
                                                {plan.limits}
                                            </div>
                                        </div>

                                        {/* CTA Button */}
                                        <button
                                            onClick={() => handlePlanSelect(plan)}
                                            disabled={
                                                loading || 
                                                isCurrentPlan || 
                                                (plan.id === 'basic' && userSubscription?.planId !== 'basic') ||
                                                (plan.id === 'pro' && userSubscription?.planId === 'enterprise')
                                            }
                                            className={`w-full py-4 px-6 rounded-xl font-bold text-sm transition-all duration-300 mb-8 ${
                                                isCurrentPlan
                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                    : (plan.id === 'basic' && userSubscription?.planId !== 'basic') || (plan.id === 'pro' && userSubscription?.planId === 'enterprise')
                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                    : plan.popular
                                                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-900/30 hover:shadow-2xl hover:scale-105"
                                                    : "bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl hover:scale-105"
                                            }`}
                                        >
                                            {loading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    Loading...
                                                </span>
                                            ) : isCurrentPlan ? (
                                                'Your Current Plan'
                                            ) : (plan.id === 'basic' && userSubscription?.planId !== 'basic') ? (
                                                'Cannot Downgrade'
                                            ) : (plan.id === 'pro' && userSubscription?.planId === 'enterprise') ? (
                                                'Cannot Downgrade'
                                            ) : (
                                                <span className="flex items-center justify-center gap-2">
                                                    {plan.cta}
                                                    <ChevronRight className="w-4 h-4" />
                                                </span>
                                            )}
                                        </button>

                                        {/* Features List */}
                                        <div className="space-y-4">
                                            <div className={`text-xs font-bold uppercase tracking-wider ${plan.popular ? 'text-gray-500' : 'text-gray-400'}`}>
                                                What's Included
                                            </div>
                                            
                                            <ul className="space-y-3">
                                                {plan.features.map((feature, idx) => (
                                                    <li key={idx} className="flex items-start gap-3">
                                                        <div className={`mt-0.5 rounded-full p-1 shrink-0 ${
                                                            plan.popular 
                                                                ? 'bg-blue-500/20' 
                                                                : 'bg-blue-50'
                                                        }`}>
                                                            <Check className={`w-3.5 h-3.5 ${
                                                                plan.popular ? 'text-blue-400' : 'text-blue-600'
                                                            }`} />
                                                        </div>
                                                        <span className={`text-sm leading-relaxed ${
                                                            feature.highlight 
                                                                ? 'font-semibold' 
                                                                : plan.popular ? 'text-gray-300' : 'text-gray-600'
                                                        }`}>
                                                            {feature.text}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-16 text-center">
                        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                <span>Secure Payment</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Cancel Anytime</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" />
                                <span>Money-back Guarantee</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                        <p className="text-gray-600">Everything you need to know about our plans</p>
                    </div>
                    
                    <div className="space-y-4">
                        {[
                            {
                                q: "Can I switch plans later?",
                                a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately."
                            },
                            {
                                q: "What payment methods do you accept?",
                                a: "We accept all major credit cards, debit cards, UPI, and net banking for your convenience."
                            },
                            {
                                q: "Is there a free trial?",
                                a: "Yes, you get access to the Basic plan forever with no credit card required. Upgrade anytime for premium features."
                            },
                            {
                                q: "What's your refund policy?",
                                a: "We offer a 7-day money-back guarantee. If you're not satisfied, we'll refund your payment, no questions asked."
                            }
                        ].map((faq, idx) => (
                            <div key={idx} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all">
                                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}