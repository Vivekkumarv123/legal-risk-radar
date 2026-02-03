"use client";

import { useState, useEffect } from "react";
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

export default function PaymentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const planId = searchParams.get('plan');
    const billingCycle = searchParams.get('billing') || 'annual';
    
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [paymentComplete, setPaymentComplete] = useState(false);
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
    const price = isAnnual ? selectedPlan?.annualPrice : selectedPlan?.monthlyPrice;
    const totalAmount = price;
    const savings = isAnnual && selectedPlan ? (selectedPlan.monthlyPrice * 12) - (selectedPlan.annualPrice * 12) : 0;

    useEffect(() => {
        if (!planId || !selectedPlan) {
            toast.error('Invalid plan selected');
            router.push('/pages/subscription');
        }
        
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
    }, [planId, selectedPlan, router, paymentComplete]);

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
            // Validate form
            if (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.cardholderName) {
                toast.error('Please fill in all required fields');
                setProcessing(false);
                return;
            }

            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Process payment
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    planId: selectedPlan.id,
                    billingCycle,
                    paymentData: formData
                })
            });

            const result = await response.json();

            if (result.success) {
                setPaymentComplete(true);
                toast.success('Payment successful! Welcome to ' + selectedPlan.name);
                
                // Prevent back navigation
                window.history.pushState(null, '', window.location.href);
                
                // Redirect to dashboard after a brief delay
                setTimeout(() => {
                    router.replace('/pages/userdashboard');
                }, 1500);
            } else {
                toast.error(result.error || 'Payment failed');
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
                                
                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            placeholder="your@email.com"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            onFocus={() => setFocusedField('email')}
                                            onBlur={() => setFocusedField(null)}
                                            className={`w-full px-4 py-3 pl-11 border rounded-lg transition-all text-gray-900 placeholder:text-gray-400 ${
                                                focusedField === 'email' 
                                                    ? 'border-blue-500 ring-4 ring-blue-100 shadow-sm' 
                                                    : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                            required
                                        />
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    </div>
                                </div>

                                {/* Card Information Section */}
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Card information
                                    </label>
                                    
                                    {/* Card Number */}
                                    <div className="border border-gray-300 rounded-lg overflow-hidden hover:border-gray-400 transition-all">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="1234 1234 1234 1234"
                                                value={formData.cardNumber}
                                                onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                                                onFocus={() => setFocusedField('cardNumber')}
                                                onBlur={() => setFocusedField(null)}
                                                maxLength={19}
                                                className={`w-full px-4 py-3 pl-11 border-0 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 placeholder:text-gray-400 ${
                                                    focusedField === 'cardNumber' ? 'ring-4 ring-blue-100' : ''
                                                }`}
                                                required
                                            />
                                            <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            
                                            {/* Card Type Badge */}
                                            {getCardType(formData.cardNumber) !== 'card' && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    {getCardType(formData.cardNumber) === 'visa' && (
                                                        <div className="px-2 py-1 bg-blue-600 rounded text-white text-xs font-bold">
                                                            VISA
                                                        </div>
                                                    )}
                                                    {getCardType(formData.cardNumber) === 'mastercard' && (
                                                        <div className="px-2 py-1 bg-red-500 rounded text-white text-xs font-bold">
                                                            MC
                                                        </div>
                                                    )}
                                                    {getCardType(formData.cardNumber) === 'amex' && (
                                                        <div className="px-2 py-1 bg-blue-700 rounded text-white text-xs font-bold">
                                                            AMEX
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Expiry & CVV Row */}
                                        <div className="grid grid-cols-2 border-t border-gray-300">
                                            <div className="relative border-r border-gray-300">
                                                <input
                                                    type="text"
                                                    placeholder="MM / YY"
                                                    value={formData.expiryDate}
                                                    onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                                                    onFocus={() => setFocusedField('expiry')}
                                                    onBlur={() => setFocusedField(null)}
                                                    maxLength={5}
                                                    className={`w-full px-4 py-3 border-0 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 placeholder:text-gray-400 ${
                                                        focusedField === 'expiry' ? 'ring-4 ring-blue-100' : ''
                                                    }`}
                                                    required
                                                />
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="CVC"
                                                    value={formData.cvv}
                                                    onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                                                    onFocus={() => setFocusedField('cvv')}
                                                    onBlur={() => setFocusedField(null)}
                                                    maxLength={4}
                                                    className={`w-full px-4 py-3 border-0 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 placeholder:text-gray-400 ${
                                                        focusedField === 'cvv' ? 'ring-4 ring-blue-100' : ''
                                                    }`}
                                                    required
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 group">
                                                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                                                    <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-48 bg-gray-900 text-white text-xs rounded-lg p-2 shadow-lg z-10">
                                                        3-digit security code on the back of your card
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Cardholder Name */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Cardholder name
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Full name on card"
                                            value={formData.cardholderName}
                                            onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                                            onFocus={() => setFocusedField('name')}
                                            onBlur={() => setFocusedField(null)}
                                            className={`w-full px-4 py-3 pl-11 border rounded-lg transition-all text-gray-900 placeholder:text-gray-400 ${
                                                focusedField === 'name' 
                                                    ? 'border-blue-500 ring-4 ring-blue-100 shadow-sm' 
                                                    : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                            required
                                        />
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    </div>
                                </div>

                                {/* Billing Address */}
                                <div className="space-y-4 pt-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Billing address
                                    </label>
                                    
                                    <select
                                        value={formData.billingAddress.country}
                                        onChange={(e) => handleInputChange('billingAddress.country', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:border-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900"
                                    >
                                        <option value="India">India</option>
                                        <option value="USA">United States</option>
                                        <option value="UK">United Kingdom</option>
                                    </select>

                                    <input
                                        type="text"
                                        placeholder="Address"
                                        value={formData.billingAddress.street}
                                        onChange={(e) => handleInputChange('billingAddress.street', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:border-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 placeholder:text-gray-400"
                                        required
                                    />
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            placeholder="City"
                                            value={formData.billingAddress.city}
                                            onChange={(e) => handleInputChange('billingAddress.city', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:border-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 placeholder:text-gray-400"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="State"
                                            value={formData.billingAddress.state}
                                            onChange={(e) => handleInputChange('billingAddress.state', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:border-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 placeholder:text-gray-400"
                                            required
                                        />
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="ZIP / Postal code"
                                        value={formData.billingAddress.zipCode}
                                        onChange={(e) => handleInputChange('billingAddress.zipCode', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:border-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 placeholder:text-gray-400"
                                        required
                                    />
                                </div>

                                {/* Demo Notice */}
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <div className="flex gap-3">
                                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-amber-900 mb-1">
                                                Demo payment system
                                            </p>
                                            <p className="text-xs text-amber-700">
                                                This is a demonstration. Use any test card number. No real charges will be processed.
                                            </p>
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
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-4 h-4" />
                                            <span>Pay ₹{totalAmount}</span>
                                        </>
                                    )}
                                </button>

                                {/* Security Footer */}
                                <div className="flex items-center justify-center gap-2 pt-2">
                                    <Shield className="w-4 h-4 text-gray-400" />
                                    <p className="text-xs text-gray-500">
                                        Secured by 256-bit SSL encryption
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
                                            {isAnnual ? 'Annual subscription' : 'Monthly subscription'}
                                        </span>
                                        <span className="font-medium text-gray-900">₹{price}</span>
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