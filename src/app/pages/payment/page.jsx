"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
    CreditCard, 
    Lock, 
    Check, 
    AlertCircle,
    Loader2,
    Shield,
    ArrowLeft,
    ChevronRight,
    CheckCircle2,
    Sparkles,
    Crown,
    FileText,
    Star,
    Info,
    Building2,
    Mail,
    User
} from "lucide-react";
import toast from "react-hot-toast";

// Separate component that uses useSearchParams
function PaymentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const planId = searchParams.get('plan');
    const billingCycle = searchParams.get('billing') || 'annual';
    
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [paymentComplete, setPaymentComplete] = useState(false);
    const [prorationDetails, setProrationDetails] = useState(null);
    const [loadingProration, setLoadingProration] = useState(true);
    const [formData, setFormData] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
        email: '',
        billingAddress: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'India'
        }
    });

    const [focusedField, setFocusedField] = useState(null);

    // Plan Details
    const plans = {
        pro: {
            id: 'pro',
            name: 'Pro Advisor',
            icon: Sparkles,
            monthlyPrice: 699,
            annualPrice: 499,
            features: [
                'Unlimited AI Legal Chat',
                'Deep Contract Risk Analysis',
                'Voice-to-Text Queries',
                'Export Analysis to PDF',
                'Priority Email Support',
                'Contract Comparison Tool',
                'Chrome Extension Access',
                'Legal Glossary Pop-ups'
            ],
            color: 'blue'
        },
        enterprise: {
            id: 'enterprise',
            name: 'Enterprise',
            icon: Crown,
            monthlyPrice: 2999,
            annualPrice: 2499,
            features: [
                'Everything in Pro',
                'Team Collaboration (5 Users)',
                'API Access for Workflow',
                'Dedicated Account Manager',
                'Custom Legal Templates',
                'Unlimited Documents',
                'Advanced Analytics',
                'White-label Reports'
            ],
            color: 'purple'
        }
    };

    const selectedPlan = plans[planId];
    const isAnnual = billingCycle === 'annual';
    const monthlyPrice = isAnnual ? selectedPlan?.annualPrice : selectedPlan?.monthlyPrice;
    const baseAmount = isAnnual ? monthlyPrice * 12 : monthlyPrice;
    const totalAmount = prorationDetails?.proratedAmount ?? baseAmount;
    const savings = isAnnual && selectedPlan ? (selectedPlan.monthlyPrice * 12) - (selectedPlan.annualPrice * 12) : 0;

    useEffect(() => {
        if (!planId || !selectedPlan) {
            toast.error('Invalid plan selected');
            router.push('/pages/subscription');
            return;
        }
        
        // Fetch pro-rated pricing
        fetchProrationDetails();
        
        // Check if user already has this plan
        const checkExistingSubscription = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch('/api/subscription', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const result = await response.json();
                
                if (result.success && result.subscription) {
                    // If user already has the selected plan, redirect back
                    if (result.subscription.planId === planId && result.subscription.status === 'active') {
                        toast.info(`You already have the ${selectedPlan.name} plan`);
                        router.push('/pages/subscription');
                        return;
                    }
                }
            } catch (error) {
                console.error('Error checking subscription:', error);
            }
        };
        
        checkExistingSubscription();
        
        // Auto-fill email if user is logged in
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
            setFormData(prev => ({ ...prev, email: userEmail }));
        }

        // Prevent back navigation after payment is complete
        const handlePopState = (e) => {
            if (paymentComplete) {
                e.preventDefault();
                window.history.pushState(null, '', window.location.href);
                toast.error('Payment already completed. Redirecting to dashboard...');
                setTimeout(() => {
                    router.push('/pages/userdashboard');
                }, 1000);
            }
        };

        if (paymentComplete) {
            window.history.pushState(null, '', window.location.href);
            window.addEventListener('popstate', handlePopState);
        }

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [planId, router, paymentComplete]);

    const fetchProrationDetails = async () => {
        if (!selectedPlan) return;
        
        try {
            setLoadingProration(true);
            const token = localStorage.getItem('accessToken');
            
            const response = await fetch('/api/subscription/calculate-prorated', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    planId: selectedPlan.id,
                    billingCycle
                })
            });

            const result = await response.json();

            if (result.success) {
                setProrationDetails(result);
            }
        } catch (error) {
            console.error('Error fetching proration details:', error);
        } finally {
            setLoadingProration(false);
        }
    };

    const handleInputChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return v;
        }
    };

    const formatExpiryDate = (value) => {
        const v = value.replace(/\D/g, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    const getCardType = (number) => {
        const sanitized = number.replace(/\s/g, '');
        if (/^4/.test(sanitized)) return 'visa';
        if (/^5[1-5]/.test(sanitized)) return 'mastercard';
        if (/^3[47]/.test(sanitized)) return 'amex';
        return 'card';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);

        try {
            const token = localStorage.getItem('accessToken');
            
            // Create Stripe checkout session
            const response = await fetch('/api/stripe/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    planId: selectedPlan.id,
                    billingCycle
                })
            });

            const result = await response.json();

            if (result.success && result.url) {
                // Redirect to Stripe Checkout URL directly
                window.location.href = result.url;
            } else {
                toast.error(result.error || 'Failed to create checkout session');
                setProcessing(false);
            }

        } catch (error) {
            console.error('Payment error:', error);
            toast.error('Payment processing failed. Please try again.');
            setProcessing(false);
        }
    };

    const handleBackClick = () => {
        if (paymentComplete) {
            toast.error('Payment already completed. Redirecting to dashboard...');
            setTimeout(() => {
                router.push('/pages/userdashboard');
            }, 1000);
        } else {
            router.back();
        }
    };

    if (!selectedPlan) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const PlanIcon = selectedPlan.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            
            {/* Stripe-Style Header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/80 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <button
                            onClick={handleBackClick}
                            disabled={paymentComplete}
                            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowLeft size={18} />
                            <span className="font-medium text-sm">Back</span>
                        </button>
                        
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <Lock className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-sm font-semibold text-gray-800">Secure checkout</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                    
                    {/* Left Column - Payment Form (Stripe Style) */}
                    <div className="space-y-6">
                        
                        {/* Main Payment Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-6">
                                
                                {/* Info Notice */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex gap-3">
                                        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-blue-900 mb-1">
                                                Secure Stripe Checkout
                                            </p>
                                            <p className="text-xs text-blue-700">
                                                You'll be redirected to Stripe's secure payment page to complete your purchase.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Plan Summary */}
                                <div className="space-y-3 py-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Plan</span>
                                        <span className="font-semibold text-gray-900">{selectedPlan.name}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Billing</span>
                                        <span className="font-semibold text-gray-900">{isAnnual ? 'Annual' : 'Monthly'}</span>
                                    </div>
                                    {isAnnual && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Price per month</span>
                                            <span className="font-medium text-gray-900">₹{monthlyPrice}</span>
                                        </div>
                                    )}
                                    {isAnnual && savings > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Annual discount</span>
                                            <span className="font-medium text-green-600">-₹{savings}</span>
                                        </div>
                                    )}
                                    
                                    {/* Pro-rated pricing breakdown */}
                                    {loadingProration ? (
                                        <div className="flex items-center justify-center py-4">
                                            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                            <span className="ml-2 text-sm text-gray-600">Calculating pricing...</span>
                                        </div>
                                    ) : prorationDetails?.isProrated && prorationDetails.unusedCredit > 0 && (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Info className="w-4 h-4 text-green-600" />
                                                <span className="text-xs font-semibold text-green-900">Upgrade Credit Applied!</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-600">Full plan price</span>
                                                <span className="font-medium text-gray-900">₹{prorationDetails.fullAmount}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-600">Unused credit ({prorationDetails.daysRemaining} days left)</span>
                                                <span className="font-medium text-green-600">-₹{prorationDetails.unusedCredit}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs pt-2 border-t border-green-200">
                                                <span className="font-semibold text-gray-900">You pay today</span>
                                                <span className="font-bold text-green-600">₹{prorationDetails.proratedAmount}</span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                        <span className="text-base font-semibold text-gray-900">Total due today</span>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-gray-900">₹{totalAmount}</div>
                                            {isAnnual && !prorationDetails?.isProrated && (
                                                <div className="text-xs text-gray-500">
                                                    ₹{monthlyPrice}/month × 12 months
                                                </div>
                                            )}
                                            {prorationDetails?.isProrated && prorationDetails.unusedCredit > 0 && (
                                                <div className="text-xs text-green-600">
                                                    Pro-rated for upgrade
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Pay Button */}
                                <button
                                    type="submit"
                                    disabled={processing || paymentComplete}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-6 rounded-lg font-semibold shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Redirecting to Stripe...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-4 h-4" />
                                            <span>Proceed to Payment</span>
                                        </>
                                    )}
                                </button>

                                {/* Security Footer */}
                                <div className="flex items-center justify-center gap-2 pt-2">
                                    <Shield className="w-4 h-4 text-gray-400" />
                                    <p className="text-xs text-gray-500">
                                        Secured by Stripe - PCI DSS compliant
                                    </p>
                                </div>
                            </form>
                        </div>

                        {/* Trust Indicators */}
                        <div className="flex items-center justify-center gap-6 px-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                <span className="text-xs text-gray-600">Money-back guarantee</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                <span className="text-xs text-gray-600">Cancel anytime</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:sticky lg:top-24 lg:self-start">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            
                            {/* Plan Header */}
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                                            <PlanIcon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{selectedPlan.name}</h3>
                                            <p className="text-sm text-blue-100">
                                                {isAnnual ? 'Annual' : 'Monthly'} plan
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                {isAnnual && savings > 0 && (
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 rounded-full">
                                        <Star className="w-3.5 h-3.5 text-white fill-current" />
                                        <span className="text-xs font-bold text-white">
                                            Save ₹{savings}/year
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Summary Content */}
                            <div className="p-6 space-y-6">
                                
                                {/* Features Preview */}
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                        Included features
                                    </h4>
                                    <ul className="space-y-2">
                                        {selectedPlan.features.slice(0, 4).map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm">
                                                <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                                                <span className="text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                        {selectedPlan.features.length > 4 && (
                                            <li className="text-sm text-blue-600 font-medium pl-6">
                                                + {selectedPlan.features.length - 4} more features
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                <div className="border-t border-gray-200 pt-6 space-y-3">
                                    {/* Pricing Breakdown */}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            {isAnnual ? `${selectedPlan.name} (₹${monthlyPrice}/month × 12)` : 'Monthly subscription'}
                                        </span>
                                        <span className="font-medium text-gray-900">₹{isAnnual ? monthlyPrice * 12 : monthlyPrice}</span>
                                    </div>
                                    
                                    {isAnnual && savings > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Annual discount</span>
                                            <span className="font-medium text-green-600">-₹{savings}</span>
                                        </div>
                                    )}

                                    <div className="border-t border-gray-200 pt-3 flex justify-between items-baseline">
                                        <span className="font-semibold text-gray-900">Total due today</span>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-gray-900">₹{totalAmount}</div>
                                            <div className="text-xs text-gray-500">
                                                {isAnnual ? 'Billed annually' : 'Billed monthly'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-500 mb-3">Accepted payment methods</p>
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-12 h-8 bg-white border border-gray-200 rounded flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-blue-600">VISA</span>
                                </div>
                                <div className="w-12 h-8 bg-white border border-gray-200 rounded flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-red-600">MC</span>
                                </div>
                                <div className="w-12 h-8 bg-white border border-gray-200 rounded flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-blue-700">AMEX</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Loading component for Suspense fallback
function PaymentPageLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading payment page...</p>
            </div>
        </div>
    );
}

// Main component with Suspense boundary
export default function PaymentPage() {
    return (
        <Suspense fallback={<PaymentPageLoading />}>
            <PaymentContent />
        </Suspense>
    );
}