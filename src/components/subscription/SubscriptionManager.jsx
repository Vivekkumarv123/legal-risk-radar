"use client";

import { useState, useEffect } from "react";
import { 
    Crown, 
    Check, 
    X, 
    Calendar, 
    CreditCard, 
    AlertCircle,
    TrendingUp,
    Users,
    Zap,
    Shield
} from "lucide-react";
import PaymentModal from "./PaymentModal";
import toast from "react-hot-toast";
import { authenticatedFetch } from "@/utils/auth.utils";

export default function SubscriptionManager() {
    const [subscription, setSubscription] = useState(null);
    const [usage, setUsage] = useState(null);
    const [availablePlans, setAvailablePlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    useEffect(() => {
        fetchSubscriptionData();
    }, []);

    const fetchSubscriptionData = async () => {
        try {
            const response = await authenticatedFetch('/api/subscription');
            const result = await response.json();
            
            if (result.success) {
                setSubscription(result.subscription);
                setUsage(result.usage);
                setAvailablePlans(result.availablePlans);
            } else {
                toast.error('Failed to load subscription data');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            if (error.message === 'Authentication required') {
                toast.error('Please log in to view subscription data');
            } else {
                toast.error('Failed to load subscription data');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = (plan) => {
        if (plan.id === 'basic') {
            toast.error('You are already on the Basic plan');
            return;
        }
        
        if (subscription?.planId === plan.id) {
            toast.error(`You are already on the ${plan.name} plan`);
            return;
        }

        setSelectedPlan(plan);
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = (newSubscription) => {
        setSubscription(newSubscription);
        setShowPaymentModal(false);
        setSelectedPlan(null);
        toast.success('Subscription updated successfully!');
    };

    const handleCancelSubscription = async () => {
        if (!confirm('Are you sure you want to cancel your subscription? You will be downgraded to the Basic plan.')) {
            return;
        }

        try {
            const response = await authenticatedFetch('/api/subscription', {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                toast.success(result.message);
                fetchSubscriptionData();
            } else {
                toast.error(result.error || 'Failed to cancel subscription');
            }
        } catch (error) {
            console.error('Cancel error:', error);
            if (error.message === 'Authentication required') {
                toast.error('Please log in to cancel subscription');
            } else {
                toast.error('Failed to cancel subscription');
            }
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getDaysRemaining = (endDate) => {
        if (!endDate) return null; // Basic plan or no expiry
        const now = new Date();
        const end = new Date(endDate);
        const diffTime = end - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const formatDaysRemaining = (days) => {
        if (days === null) return 'No expiry';
        if (days === 0) return 'Expires today';
        if (days === 1) return '1 day remaining';
        if (days <= 7) return `${days} days remaining`;
        if (days <= 30) return `${days} days remaining`;
        const weeks = Math.floor(days / 7);
        return `${weeks} week${weeks > 1 ? 's' : ''} remaining`;
    };

    const getUsagePercentage = (used, limit) => {
        if (limit === -1) return 0; // Unlimited
        return Math.min((used / limit) * 100, 100);
    };

    const getPlanIcon = (planId) => {
        switch (planId) {
            case 'basic': return <Shield className="text-gray-600" size={20} />;
            case 'pro': return <Zap className="text-blue-600" size={20} />;
            case 'enterprise': return <Crown className="text-purple-600" size={20} />;
            default: return <Shield className="text-gray-600" size={20} />;
        }
    };

    const getPlanColor = (planId) => {
        switch (planId) {
            case 'basic': return 'border-gray-200 bg-gray-50';
            case 'pro': return 'border-blue-200 bg-blue-50';
            case 'enterprise': return 'border-purple-200 bg-purple-50';
            default: return 'border-gray-200 bg-gray-50';
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Current Subscription */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <CreditCard className="text-blue-600" size={24} />
                        <h2 className="text-xl font-bold text-gray-900">Current Subscription</h2>
                    </div>
                </div>

                <div className="p-6">
                    {subscription && (
                        <div className={`border-2 rounded-lg p-6 ${getPlanColor(subscription.planId)}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {getPlanIcon(subscription.planId)}
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {subscription.planName} Plan
                                        </h3>
                                        <p className="text-gray-600">
                                            {subscription.price === 0 ? 'Free' : `₹${subscription.price}/month`}
                                        </p>
                                    </div>
                                </div>
                                
                                {subscription.planId !== 'basic' && (
                                    <button
                                        onClick={handleCancelSubscription}
                                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                                    >
                                        Cancel Subscription
                                    </button>
                                )}
                            </div>

                            {/* Plan Status and Expiry */}
                            <div className="mb-4">
                                {subscription.endDate && (
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                                        getDaysRemaining(subscription.endDate) <= 7 
                                            ? 'bg-red-100 text-red-800' 
                                            : getDaysRemaining(subscription.endDate) <= 30
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-green-100 text-green-800'
                                    }`}>
                                        <Calendar size={14} />
                                        {formatDaysRemaining(getDaysRemaining(subscription.endDate))}
                                    </div>
                                )}
                                {!subscription.endDate && subscription.planId === 'basic' && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                        <Shield size={14} />
                                        Free Plan - No expiry
                                    </div>
                                )}
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-gray-500" />
                                    <span>
                                        Started: {formatDate(subscription.startDate)}
                                    </span>
                                </div>
                                {subscription.endDate && (
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-gray-500" />
                                        <span>
                                            {getDaysRemaining(subscription.endDate) > 0 ? 'Renews' : 'Expired'}: {formatDate(subscription.endDate)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Usage Statistics */}
            {usage && (
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="text-green-600" size={24} />
                            <h2 className="text-xl font-bold text-gray-900">Usage This Month</h2>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-blue-900 mb-2">AI Queries</h4>
                                <p className="text-2xl font-bold text-blue-600">{usage.aiQueries || 0}</p>
                                {subscription?.planId === 'basic' && (
                                    <div className="mt-2">
                                        <div className="bg-blue-200 rounded-full h-2">
                                            <div 
                                                className="bg-blue-600 h-2 rounded-full transition-all"
                                                style={{ width: `${getUsagePercentage(usage.aiQueries || 0, 5)}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-blue-700 mt-1">5 per day limit</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-green-900 mb-2">Documents</h4>
                                <p className="text-2xl font-bold text-green-600">{usage.documentsAnalyzed || 0}</p>
                                {subscription?.features?.documentAnalysis && subscription.planId === 'pro' && (
                                    <div className="mt-2">
                                        <div className="bg-green-200 rounded-full h-2">
                                            <div 
                                                className="bg-green-600 h-2 rounded-full transition-all"
                                                style={{ width: `${getUsagePercentage(usage.documentsAnalyzed || 0, 50)}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-green-700 mt-1">50 per month limit</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-purple-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-purple-900 mb-2">Voice Queries</h4>
                                <p className="text-2xl font-bold text-purple-600">{usage.voiceQueries || 0}</p>
                                <p className="text-xs text-purple-700 mt-1">
                                    {subscription?.features?.voiceQueries ? 'Unlimited' : 'Not available'}
                                </p>
                            </div>

                            <div className="bg-orange-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-orange-900 mb-2">PDF Reports</h4>
                                <p className="text-2xl font-bold text-orange-600">{usage.pdfReportsGenerated || 0}</p>
                                <p className="text-xs text-orange-700 mt-1">
                                    {subscription?.features?.pdfReports ? 'Unlimited' : 'Not available'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Available Plans */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <Crown className="text-purple-600" size={24} />
                        <h2 className="text-xl font-bold text-gray-900">Available Plans</h2>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                        {availablePlans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`border-2 rounded-lg p-6 relative ${
                                    subscription?.planId === plan.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                } ${plan.id === 'pro' ? 'ring-2 ring-blue-200' : ''}`}
                            >
                                {plan.id === 'pro' && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                            POPULAR
                                        </span>
                                    </div>
                                )}

                                {subscription?.planId === plan.id && (
                                    <div className="absolute -top-3 right-4">
                                        <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                            CURRENT
                                        </span>
                                    </div>
                                )}

                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                    <div className="text-3xl font-bold text-gray-900 mb-2">
                                        {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                                        {plan.price > 0 && <span className="text-sm font-normal text-gray-500">/month</span>}
                                    </div>
                                    <p className="text-gray-600 text-sm">{plan.description}</p>
                                    
                                    {/* Show savings or upgrade info */}
                                    {subscription?.planId !== plan.id && plan.price > 0 && (
                                        <div className="mt-2">
                                            {subscription?.planId === 'basic' && (
                                                <p className="text-blue-600 text-xs font-medium">
                                                    Upgrade from Free Plan
                                                </p>
                                            )}
                                            {subscription?.planId === 'pro' && plan.id === 'enterprise' && (
                                                <p className="text-purple-600 text-xs font-medium">
                                                    Upgrade from Pro Plan
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <ul className="space-y-3 mb-6">
                                    <li className="flex items-center gap-2">
                                        <Check className="text-green-600" size={16} />
                                        <span className="text-sm">
                                            {plan.features.aiQueries === -1 ? 'Unlimited' : `${plan.features.aiQueries} daily`} AI queries
                                        </span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        {plan.features.documentAnalysis ? (
                                            <Check className="text-green-600" size={16} />
                                        ) : (
                                            <X className="text-red-500" size={16} />
                                        )}
                                        <span className="text-sm">Document analysis</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        {plan.features.voiceQueries ? (
                                            <Check className="text-green-600" size={16} />
                                        ) : (
                                            <X className="text-red-500" size={16} />
                                        )}
                                        <span className="text-sm">Voice queries</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        {plan.features.pdfReports ? (
                                            <Check className="text-green-600" size={16} />
                                        ) : (
                                            <X className="text-red-500" size={16} />
                                        )}
                                        <span className="text-sm">PDF reports</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        {plan.features.contractComparison ? (
                                            <Check className="text-green-600" size={16} />
                                        ) : (
                                            <X className="text-red-500" size={16} />
                                        )}
                                        <span className="text-sm">Contract comparison</span>
                                    </li>
                                    {plan.features.teamCollaboration > 0 && (
                                        <li className="flex items-center gap-2">
                                            <Users className="text-blue-600" size={16} />
                                            <span className="text-sm">{plan.features.teamCollaboration} team members</span>
                                        </li>
                                    )}
                                </ul>

                                <button
                                    onClick={() => handleUpgrade(plan)}
                                    disabled={subscription?.planId === plan.id}
                                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                                        subscription?.planId === plan.id
                                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                            : plan.id === 'basic'
                                            ? 'bg-gray-600 text-white hover:bg-gray-700'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                >
                                    {subscription?.planId === plan.id
                                        ? 'Current Plan'
                                        : plan.id === 'basic'
                                        ? 'Downgrade'
                                        : 'Upgrade Now'
                                    }
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

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