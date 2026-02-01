"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
    ShieldCheck, FileText, MessageCircle, Clock,
    Check, X, Briefcase, ChevronRight, Star
} from "lucide-react";

export default function PricingAndFeatures() {
    const [isAnnual, setIsAnnual] = useState(true);
    const router = useRouter();

    // Pricing Data with updated features
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
            cta: "Get Started Free",
            popular: false,
            limits: {
                dailyQueries: 5,
                monthlyDocuments: 0,
            }
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
            limits: {
                dailyQueries: -1, // Unlimited
                monthlyDocuments: 50,
            }
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
            cta: "Contact Sales",
            popular: false,
            limits: {
                dailyQueries: -1, // Unlimited
                monthlyDocuments: -1, // Unlimited
            }
        },
    ];

    useEffect(() => {
        // Pricing page is view-only, no need to check user subscription
    }, []);

    const handlePlanSelect = (plan) => {
        // Pricing page is view-only, redirect to login for purchasing
        if (plan.id === 'basic') {
            router.push('/pages/signup');
        } else {
            router.push('/pages/login');
        }
    };

    const handlePaymentSuccess = (subscription) => {
        // This function is not needed in view-only pricing page
    };

    const features = [
        {
            icon: <MessageCircle className="text-white" size={24} />,
            color: "bg-blue-600",
            title: "Contextual AI Chat",
            desc: "Ask complex questions about Indian Law (IPC, Contract Act) and get instant, simplified answers.",
        },
        {
            icon: <FileText className="text-white" size={24} />,
            color: "bg-purple-600",
            title: "Document Risk Radar",
            desc: "Upload NDAs, rental agreements, or employment contracts. We highlight risky clauses in seconds.",
        },
        {
            icon: <ShieldCheck className="text-white" size={24} />,
            color: "bg-emerald-600",
            title: "Enterprise-Grade Privacy",
            desc: "Your documents are processed in memory and encrypted. We do not use your data to train public models.",
        },
        {
            icon: <Clock className="text-white" size={24} />,
            color: "bg-orange-600",
            title: "Instant Turnaround",
            desc: "No waiting for appointments. Get preliminary legal insights 24/7, right from your device.",
        },
    ];

    return (
        <div className="min-h-screen bg-white font-sans">

            {/* ================= HERO SECTION (REVAMPED) ================= */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [bg-size:16px_16px] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50"></div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-125 h-125 bg-blue-100 rounded-full blur-3xl opacity-40 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-100 h-100 bg-purple-100 rounded-full blur-3xl opacity-40"></div>

                <div className="relative max-w-7xl mx-auto px-6 text-center z-10">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-white border border-blue-100 shadow-sm px-4 py-1.5 rounded-full text-sm font-medium text-blue-800 mb-8 animate-fade-in-up">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span>Now updated with Bharatiya Nyaya Sanhita (BNS) context</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
                        Your Personal AI <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">
                            Legal Consultant
                        </span>
                    </h1>

                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Navigate the complexities of Indian Law with confidence.
                        Instant analysis, contract review, and legal guidance at a fraction of the cost.
                    </p>

                    {/* Hero Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <button onClick={() => router.push("/pages/chat")} className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                            Try for Free <ChevronRight size={20} />
                        </button>
                        <button className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                            View Sample Analysis
                        </button>
                    </div>

                    {/* Social Proof Strip */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 opacity-80 grayscale hover:grayscale-0 transition-all duration-500">
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                                ))}
                            </div>
                            <div className="text-left">
                                <div className="flex text-yellow-400">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} fill="currentColor" />)}
                                </div>
                                <p className="text-xs font-semibold text-gray-600">Loved by 10,000+ Indians</p>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-gray-300 hidden md:block"></div>
                        <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <ShieldCheck size={16} className="text-green-600" /> AES-256 Encrypted Data
                        </p>
                    </div>
                </div>
            </section>

            {/* ================= FEATURES GRID ================= */}
            <section className="py-24 px-6 bg-gray-50/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need to stay legally safe</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">We combine advanced LLMs with a proprietary database of Indian legal precedents.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((f, i) => (
                            <div
                                key={i}
                                className="group bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-transparent to-gray-50 rounded-bl-full opacity-50 group-hover:scale-110 transition-transform`}></div>

                                <div className={`mb-6 ${f.color} w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg`}>
                                    {f.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                                <p className="text-gray-600 leading-relaxed text-sm">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= PRICING SECTION ================= */}
            <section className="py-24 px-6 bg-white" id="pricing">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-6">Simple, Transparent Pricing</h2>

                        {/* Toggle Switch */}
                        <div className="flex items-center justify-center gap-4 p-1.5 bg-gray-100  rounded-full">
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
                                    className={`w-full py-4 rounded-xl font-bold transition-all mb-8 ${
                                        plan.popular
                                            ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50"
                                            : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                                        }`}
                                >
                                    {plan.id === 'basic' ? 'Get Started Free' : 'Login to Purchase'}
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

            {/* ================= FOOTER CTA ================= */}
            <section className="bg-gray-900 text-white py-20 px-6 relative overflow-hidden">
                {/* Abstract shapes */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600 rounded-full blur-3xl opacity-20 -ml-16 -mb-16"></div>

                <div className="relative max-w-4xl mx-auto text-center z-10">
                    <div className="inline-block p-4 bg-gray-800/50 backdrop-blur-sm rounded-2xl mb-8 border border-gray-700">
                        <Briefcase className="text-blue-400 w-10 h-10" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to simplify your legal work?</h2>
                    <p className="text-gray-400 mb-10 text-lg max-w-2xl mx-auto">
                        Join thousands of freelancers, small business owners, and individuals using AI to decode contracts.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onClick={()=>router.push('/pages/signup')} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-blue-900/40">
                            Start Analyzing Now
                        </button>
                        <button className="bg-transparent border border-gray-600 hover:bg-gray-800 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all">
                            Contact Sales
                        </button>
                    </div>
                </div>
            </section>

            {/* Payment Modal - Not needed in view-only pricing page */}
        </div>
    );
}