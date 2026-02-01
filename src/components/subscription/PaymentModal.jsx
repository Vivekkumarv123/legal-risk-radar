"use client";

import { useState } from "react";
import { 
    CreditCard, 
    X, 
    Lock, 
    Check, 
    AlertCircle,
    Loader2
} from "lucide-react";
import toast from "react-hot-toast";

export default function PaymentModal({ isOpen, onClose, plan, onSuccess }) {
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                        <CreditCard className="text-blue-600" size={24} />
                        <h2 className="text-xl font-bold text-gray-900">Complete Payment</h2>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Plan Summary */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-blue-900">{plan.name} Plan</h3>
                            <span className="text-2xl font-bold text-blue-600">
                                ₹{plan.price}
                                <span className="text-sm font-normal text-blue-500">/month</span>
                            </span>
                        </div>
                        <p className="text-sm text-blue-700">{plan.description}</p>
                    </div>

                    {/* Payment Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Card Information */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Card Number
                            </label>
                            <input
                                type="text"
                                placeholder="1234 5678 9012 3456"
                                value={formData.cardNumber}
                                onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                                maxLength={19}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Expiry Date
                                </label>
                                <input
                                    type="text"
                                    placeholder="MM/YY"
                                    value={formData.expiryDate}
                                    onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                                    maxLength={5}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    CVV
                                </label>
                                <input
                                    type="text"
                                    placeholder="123"
                                    value={formData.cvv}
                                    onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    maxLength={4}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cardholder Name
                            </label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                value={formData.cardholderName}
                                onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Billing Address */}
                        <div className="border-t pt-4">
                            <h4 className="font-medium text-gray-900 mb-3">Billing Address</h4>
                            
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Street Address"
                                    value={formData.billingAddress.street}
                                    onChange={(e) => handleInputChange('billingAddress.street', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        placeholder="City"
                                        value={formData.billingAddress.city}
                                        onChange={(e) => handleInputChange('billingAddress.city', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="State"
                                        value={formData.billingAddress.state}
                                        onChange={(e) => handleInputChange('billingAddress.state', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                
                                <input
                                    type="text"
                                    placeholder="ZIP Code"
                                    value={formData.billingAddress.zipCode}
                                    onChange={(e) => handleInputChange('billingAddress.zipCode', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        {/* Security Notice */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Lock className="text-green-600 mt-0.5" size={16} />
                                <div>
                                    <h4 className="font-medium text-gray-900 text-sm">Secure Payment</h4>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Your payment information is encrypted and secure. We don't store your card details.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Demo Notice */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="text-yellow-600 mt-0.5" size={16} />
                                <div>
                                    <h4 className="font-medium text-yellow-900 text-sm">Demo Payment</h4>
                                    <p className="text-xs text-yellow-700 mt-1">
                                        This is a demo payment system. Use any card number for testing. No real charges will be made.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Processing Payment...
                                </>
                            ) : (
                                <>
                                    <Lock size={16} />
                                    Pay ₹{plan.price}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}