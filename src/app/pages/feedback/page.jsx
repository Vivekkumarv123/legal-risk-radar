"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion"; // Animation library
import {
  MessageSquare,
  Star,
  Loader2,
  Send,
  User,
  Quote,
  CheckCircle2,
} from "lucide-react";

export default function FeedbackPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    rating: 0,
    message: "",
    isAnonymous: false,
  });
  const [hoverRating, setHoverRating] = useState(0); // For star hover effect
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
        setHoverRating(0);
        fetchFeedbacks();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-6 py-12 font-sans selection:bg-blue-100">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 items-start">
        
        {/* ================= LEFT: HISTORY (7 Cols) ================= */}
        <div className="lg:col-span-7 space-y-6">
          <div className="mb-8">
            <motion.h2 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-extrabold text-slate-900 tracking-tight"
            >
              Feedback History
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 mt-2 text-lg"
            >
              See what the community thinks about LegalAI.
            </motion.p>
          </div>

          <div className="space-y-4">
            {loadingHistory ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/50 shadow-sm">
                <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                <p className="text-slate-500 text-sm font-medium">Loading reviews...</p>
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-slate-300">
                <MessageSquare className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-500">No feedback yet. Be the first!</p>
              </div>
            ) : (
              <AnimatePresence>
                {feedbacks.slice(0, visibleCount).map((item, index) => (
                  <motion.div
                    key={item.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-white/80 backdrop-blur-md border border-white/60 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl p-6 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Quote size={60} className="text-blue-600 rotate-180" />
                    </div>

                    <div className="flex justify-between items-start relative z-10">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center shadow-inner">
                          <User size={20} className="text-blue-700" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">
                            {item.isAnonymous || !item.name
                              ? "Anonymous User"
                              : item.name}
                          </h4>
                          <p className="text-xs font-medium text-slate-400 mt-0.5">
                            {item.createdAt 
                              ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                              : "Recently"}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-0.5 bg-yellow-50/50 px-2 py-1 rounded-full border border-yellow-100">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className={`${
                              star <= item.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-slate-700 mt-4 leading-relaxed relative z-10">
                      {item.message}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {feedbacks.length > 5 && (
            <div className="pt-4 flex justify-center">
              <button
                onClick={() => setVisibleCount((v) => (v < feedbacks.length ? v + 5 : 5))}
                className="group flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-full text-slate-600 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              >
                {visibleCount < feedbacks.length ? "Load More Reviews" : "Show Less"}
              </button>
            </div>
          )}
        </div>

        {/* ================= RIGHT: FORM (5 Cols) ================= */}
        <div className="lg:col-span-5 sticky top-10">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 overflow-hidden relative"
          >
            {/* Decorative background blob */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center mb-8 relative z-10">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
                <MessageSquare size={28} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                We value your opinion
              </h2>
              <p className="text-slate-500 text-sm mt-2">
                Help us improve LegalAI by sharing your experience.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              {/* Rating Input */}
              <div className="flex flex-col items-center gap-2 mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Rate your experience</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setForm({ ...form, rating: star })}
                      className="transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        size={32}
                        className={`transition-colors duration-200 ${
                          star <= (hoverRating || form.rating)
                            ? "text-yellow-400 fill-yellow-400 drop-shadow-sm"
                            : "text-slate-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm font-medium text-blue-600 h-5">
                  {hoverRating === 1 && "Terrible 😠"}
                  {hoverRating === 2 && "Bad 🙁"}
                  {hoverRating === 3 && "Okay 😐"}
                  {hoverRating === 4 && "Good 🙂"}
                  {hoverRating === 5 && "Excellent 🤩"}
                </p>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    placeholder="Your Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    disabled={submitting || form.isAnonymous}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <input
                    type="email"
                    placeholder="Email (Optional)"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    disabled={submitting || form.isAnonymous}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <textarea
                  rows={4}
                  placeholder="Tell us what you think..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  disabled={submitting}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-none text-sm font-medium"
                />
              </div>

              {/* Anonymous Toggle */}
              <div
                onClick={() => setForm({ ...form, isAnonymous: !form.isAnonymous })}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-200 group"
              >
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${form.isAnonymous ? "bg-blue-600 border-blue-600" : "border-slate-300 bg-white"}`}>
                  {form.isAnonymous && <CheckCircle2 size={14} className="text-white" />}
                </div>
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">
                  Submit anonymously
                </span>
              </div>

              {/* Submit Button */}
              <button
                disabled={submitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <span>Send Feedback</span>
                    <Send size={20} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>

      </div>
    </div>
  );
}