"use client";

import { useState } from "react";
import { 
    CreditCard, 
    X, 
    Lock, 
    CheckCircle2,
    AlertCircle,
    Loader2,
    Shield,
    Sparkles,
    Crown,
    Info,
    ArrowRight
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function PaymentModal({ isOpen, onClose, plan, onSuccess }) {
    const router = useRouter();
    const [useFullCheckout, setUseFullCheckout] = useState(false);

    // If user wants full checkout experience, redirect to payment page
    if (useFullCheckout && plan) {
        router.push(`/pages/payment?plan=${plan.id}&billing=annual`);
        return null;
    }

    const [loading, setLoading] = useState(false);
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
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate form
            if (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.cardholderName) {
                toast.error('Please fill in all required fields');
                return;
            }

            // Process payment
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    planId: plan.id,
                    paymentData: formData
                })
            });

            const result = await response.json();

            if (result.success) {
                toast.success(result.message);
                onSuccess(result.subscription);
                onClose();
            } else {
                toast.error(result.error || 'Payment failed');
            }

        } catch (error) {
            console.error('Payment error:', error);
            toast.error('Payment processing failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !plan) return null;

    const planIcons = {
        pro: Sparkles,
        enterprise: Crown
    };

    const PlanIcon = planIcons[plan.id] || CreditCard;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                
                {/* Header */}
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                    >
                        <X size={20} />
                    </button>
                    
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                            <PlanIcon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Upgrade to {plan.name}</h2>
                            <p className="text-blue-100 text-sm">Complete your subscription</p>
                        </div>
                    </div>
                </div>

                <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                    {/* Plan Summary */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-b-2 border-blue-200 px-6 py-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">{plan.name} Plan</h3>
                                <p className="text-sm text-gray-600">{plan.description}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    ₹{plan.price}
                                </div>
                                <span className="text-sm text-gray-600">/month</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        
                        {/* Quick Checkout Option */}
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-blue-900 mb-2">
                                        Want a more detailed checkout experience?
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setUseFullCheckout(true)}
                                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                    >
                                        Use Full Checkout
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Card Information */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Card Number
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="1234 5678 9012 3456"
                                        value={formData.cardNumber}
                                        onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                                        maxLength={19}
                                        className="w-full px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                                        required
                                    />
                                    <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    
                                    {getCardType(formData.cardNumber) && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <div className={`px-2 py-1 rounded text-xs font-bold text-white ${
                                                getCardType(formData.cardNumber) === 'visa' ? 'bg-blue-600' :
                                                getCardType(formData.cardNumber) === 'mastercard' ? 'bg-red-600' :
                                                'bg-blue-700'
                                            }`}>
                                                {getCardType(formData.cardNumber).toUpperCase()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Expiry Date
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        value={formData.expiryDate}
                                        onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                                        maxLength={5}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        CVV
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="123"
                                        value={formData.cvv}
                                        onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                                        maxLength={4}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Cardholder Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.cardholderName}
                                    onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                                    required
                                />
                            </div>
                        </div>

                        {/* Billing Address (Collapsed) */}
                        <details className="group">
                            <summary className="cursor-pointer list-none">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all">
                                    <span className="font-semibold text-gray-700">Billing Address</span>
                                    <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
                                </div>
                            </summary>
                            
                            <div className="mt-4 space-y-3 p-4 bg-gray-50 rounded-xl">
                                <input
                                    type="text"
                                    placeholder="Street Address"
                                    value={formData.billingAddress.street}
                                    onChange={(e) => handleInputChange('billingAddress.street', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-white"
                                    required
                                />
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        placeholder="City"
                                        value={formData.billingAddress.city}
                                        onChange={(e) => handleInputChange('billingAddress.city', e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-white"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="State"
                                        value={formData.billingAddress.state}
                                        onChange={(e) => handleInputChange('billingAddress.state', e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-white"
                                        required
                                    />
                                </div>
                                
                                <input
                                    type="text"
                                    placeholder="PIN Code"
                                    value={formData.billingAddress.zipCode}
                                    onChange={(e) => handleInputChange('billingAddress.zipCode', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-white"
                                    required
                                />
                            </div>
                        </details>

                        {/* Security & Demo Notices */}
                        <div className="space-y-3">
                            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3">
                                <div className="flex items-start gap-3">
                                    <Shield className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-green-900 text-sm mb-1">Secure Payment</h4>
                                        <p className="text-xs text-green-700">
                                            Your payment is encrypted and secure. Card details are never stored.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-amber-900 text-sm mb-1">Demo Mode</h4>
                                        <p className="text-xs text-amber-700">
                                            This is a test environment. Use any card number. No real charges apply.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-6 rounded-xl font-bold shadow-lg shadow-blue-600/30 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Lock className="w-5 h-5" />
                                    Pay ₹{plan.price}
                                </>
                            )}
                        </button>

                        <p className="text-center text-xs text-gray-500">
                            By subscribing, you agree to our Terms & Privacy Policy
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

// Helper component for missing import
function ChevronRight({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    );
}