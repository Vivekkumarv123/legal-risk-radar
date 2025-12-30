"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, ArrowRight, Scale, Shield, Zap } from "lucide-react";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email) {
      toast.error("Name and email are required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Account created! Password sent to your email 📧");
        router.push("/login");
      } else {
        toast.error(data.message || "Signup failed");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">

      {/* ================= LEFT SIDE (BRAND PANEL) ================= */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12 text-white">
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-slate-950 opacity-80"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] opacity-40 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 rounded-full blur-[100px] opacity-20"></div>

        {/* Content Layer */}
        <div className="relative z-10 max-w-lg space-y-8">
            <div className="flex items-center gap-3 text-blue-400 font-bold text-2xl mb-8">
                <div className="bg-white/10 backdrop-blur-sm p-2 rounded-xl border border-white/20">
                    <Scale size={28} />
                </div>
                LegalAI
            </div>

            <h1 className="text-5xl font-bold leading-tight tracking-tight">
                Join the future of <br/>
                <span className="text-blue-400">Legal Intelligence.</span>
            </h1>
            
            <p className="text-slate-300 text-lg leading-relaxed">
                Create an account to access instant contract analysis, risk detection, and 24/7 AI legal support.
            </p>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 gap-4 pt-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                    <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400"><Zap size={20} /></div>
                    <div>
                        <h3 className="font-semibold text-white">Lightning Fast</h3>
                        <p className="text-sm text-slate-400">Get contract summaries in seconds, not days.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                    <div className="bg-green-500/20 p-2 rounded-lg text-green-400"><Shield size={20} /></div>
                    <div>
                        <h3 className="font-semibold text-white">Bank-Grade Security</h3>
                        <p className="text-sm text-slate-400">Your documents are encrypted and private.</p>
                    </div>
                </div>
            </div>

            {/* Social Proof */}
            <div className="pt-4 flex items-center gap-4 text-sm text-slate-400 font-medium">
                <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900"></div>
                    ))}
                </div>
                <p>Joined by 10,000+ professionals</p>
            </div>
        </div>
      </div>

      {/* ================= RIGHT SIDE (SIGNUP FORM) ================= */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 lg:p-12 relative">
        
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2 text-blue-700 font-bold text-xl">
            <Scale size={24} /> LegalAI
        </div>

        <div className="w-full max-w-md bg-white">
          
          {/* HEADER */}
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Create your account</h2>
            <p className="text-slate-500">
                Start your 7-day free trial. No credit card required.
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* NAME */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Full Name</label>
                <div className="relative">
                    <User className="absolute left-4 top-3.5 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={loading}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all disabled:opacity-50"
                    />
                </div>
            </div>

            {/* EMAIL */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Work Email</label>
                <div className="relative">
                    <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
                    <input
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all disabled:opacity-50"
                    />
                </div>
            </div>

            {/* SIGNUP BUTTON */}
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                  <>Creating Account...</>
              ) : (
                  <>Get Started <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          {/* DIVIDER */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500 font-medium">Or sign up with</span>
            </div>
          </div>

          {/* GOOGLE SIGNUP BUTTON */}
          <button
            type="button"
            disabled={loading}
            className="w-full border border-slate-200 flex items-center justify-center gap-3 py-3 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-700 font-semibold disabled:opacity-50"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Google
          </button>

          {/* LOGIN CTA */}
          <p className="text-center text-slate-500 mt-8 font-medium">
            Already have an account?{" "}
            <Link
              href="/pages/login"
              className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-colors"
            >
              Log in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}