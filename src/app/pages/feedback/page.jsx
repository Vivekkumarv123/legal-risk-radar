"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
    MessageSquare,
    Star,
    Loader2,
    Send,
    ChevronDown,
    ChevronUp,
    User,
} from "lucide-react";

export default function FeedbackPage() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        rating: 0,
        message: "",
        isAnonymous: false,
    });
    const [submitting, setSubmitting] = useState(false);

    const [feedbacks, setFeedbacks] = useState([]);
    const [visibleCount, setVisibleCount] = useState(5);
    const [loadingHistory, setLoadingHistory] = useState(true);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            const res = await fetch("/api/feedback");
            const data = await res.json();
            if (res.ok) {
                setFeedbacks(data.feedbacks || data.data || []);
            }
        } catch {
            toast.error("Failed to load feedback");
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.rating) return toast.error("Please select a rating");
        if (!form.message.trim())
            return toast.error("Feedback message is required");

        setSubmitting(true);
        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                toast.success("Thank you for your feedback 💙");
                setForm({
                    name: "",
                    email: "",
                    rating: 0,
                    message: "",
                    isAnonymous: false,
                });
                fetchFeedbacks();
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 px-6 py-10">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-start">

                {/* ================= LEFT: HISTORY ================= */}
                <div className="bg-white border border-slate-200 rounded-3xl shadow-md p-6">
                    <h2 className="text-2xl font-bold text-slate-900">
                        Feedback History
                    </h2>
                    <p className="text-slate-600 mb-6">
                        What users are saying about LegalAI
                    </p>

                    <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                        {loadingHistory ? (
                            <div className="flex justify-center pt-16">
                                <Loader2 className="animate-spin text-blue-600" size={28} />
                            </div>
                        ) : (
                            feedbacks.slice(0, visibleCount).map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-slate-50 border border-slate-200 rounded-2xl p-4"
                                >
                                    <div className="flex justify-between mb-2">
                                        <div className="flex gap-3">
                                            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                                                <User size={18} className="text-blue-700" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 text-sm">
                                                    {item.isAnonymous || !item.name
                                                        ? "Anonymous User"
                                                        : item.name}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    size={16}
                                                    className={
                                                        star <= item.rating
                                                            ? "text-yellow-400 fill-yellow-400"
                                                            : "text-slate-400"
                                                    }
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <p className="text-slate-800 text-sm">
                                        {item.message}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>

                    {feedbacks.length > 5 && (
                        <div className="pt-4 flex justify-center">
                            {visibleCount < feedbacks.length ? (
                                <button
                                    onClick={() => setVisibleCount((v) => v + 5)}
                                    className="text-sm font-semibold text-blue-600 hover:underline"
                                >
                                    Show More
                                </button>
                            ) : (
                                <button
                                    onClick={() => setVisibleCount(5)}
                                    className="text-sm font-semibold text-slate-600 hover:underline"
                                >
                                    Show Less
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* ================= RIGHT: FORM ================= */}
                <div className="bg-white border border-slate-200 rounded-3xl shadow-md p-6">
                    <div className="text-center mb-6">
                        <div className="mx-auto w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                            <MessageSquare size={24} className="text-blue-700" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            Share your feedback
                        </h2>
                        <p className="text-slate-600 text-sm">
                            Help us improve LegalAI experience
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <input
                            placeholder="Your name (optional)"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            disabled={submitting || form.isAnonymous}
                            className="
                w-full px-4 py-2.5 rounded-xl
                border border-slate-400
                text-slate-900 placeholder-slate-500
                focus:border-blue-600 focus:ring-0
                outline-none
              "
                        />

                        {/* Email */}
                        <input
                            type="email"
                            placeholder="Email address (optional)"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            disabled={submitting || form.isAnonymous}
                            className="
                w-full px-4 py-2.5 rounded-xl
                border border-slate-400
                text-slate-900 placeholder-slate-500
                focus:border-blue-600 focus:ring-0
                outline-none
              "
                        />

                        {/* Rating */}
                        <div>
                            <label className="text-sm font-semibold text-slate-800 mb-1 block">
                                Rating
                            </label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setForm({ ...form, rating: star })}
                                    >
                                        <Star
                                            size={28}
                                            className={
                                                star <= form.rating
                                                    ? "text-yellow-400 fill-yellow-400"
                                                    : "text-slate-400 hover:text-yellow-400"
                                            }
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Message */}
                        <textarea
                            rows={3}
                            placeholder="Write your feedback..."
                            value={form.message}
                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                            disabled={submitting}
                            className="
                w-full px-4 py-2.5 rounded-xl
                border border-slate-400
                text-slate-900 placeholder-slate-500
                focus:border-blue-600 focus:ring-0
                outline-none resize-none
              "
                        />

                        <label className="flex items-center gap-2 text-sm text-slate-800">
                            <input
                                type="checkbox"
                                checked={form.isAnonymous}
                                onChange={(e) =>
                                    setForm({ ...form, isAnonymous: e.target.checked })
                                }
                                className="accent-blue-600"
                            />
                            Submit anonymously
                        </label>

                        <button
                            disabled={submitting}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    Send Feedback <Send size={16} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}
