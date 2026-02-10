"use client";
import { useState } from 'react';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewsletterSubscribe() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [frequency, setFrequency] = useState('daily');
    const [loading, setLoading] = useState(false);
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = async (e) => {
        e.preventDefault();

        if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            toast.error('Please enter a valid email address');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    name,
                    frequency,
                    categories: ['all']
                }),
            });

            const data = await response.json();

            if (data.success) {
                setSubscribed(true);
                toast.success('Successfully subscribed to newsletter!');
                setEmail('');
                setName('');
            } else {
                toast.error(data.error || 'Failed to subscribe');
            }
        } catch (error) {
            console.error('Subscribe error:', error);
            toast.error('Failed to subscribe. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (subscribed) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-900 mb-2">
                    You're Subscribed!
                </h3>
                <p className="text-green-700">
                    Check your inbox for the latest legal updates.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">
                        Legal Newsletter
                    </h3>
                    <p className="text-sm text-gray-600">
                        Stay updated with daily legal insights
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubscribe} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name (Optional)
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency
                    </label>
                    <select
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Subscribing...
                        </>
                    ) : (
                        <>
                            <Mail className="w-5 h-5" />
                            Subscribe to Newsletter
                        </>
                    )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                    By subscribing, you agree to receive legal updates via email.
                    You can unsubscribe anytime.
                </p>
            </form>
        </div>
    );
}
