"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, ArrowRight, Scale, Shield, Zap, CheckCircle2, Loader2, X, FileText } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";

// --- MOCK LEGAL CONTENT (You can replace this with real text) ---
const TERMS_CONTENT = (
  <div className="space-y-4 text-slate-600">
    <p><strong>1. Introduction</strong><br/>Welcome to LegalAI. By accessing our website, you agree to be bound by these Terms of Service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>
    <p><strong>2. Use License</strong><br/>Permission is granted to temporarily download one copy of the materials (information or software) on LegalAI's website for personal, non-commercial transitory viewing only.</p>
    <p><strong>3. Disclaimer</strong><br/>The materials on LegalAI's website are provided on an 'as is' basis. LegalAI makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
    <p><strong>4. Limitations</strong><br/>In no event shall LegalAI or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on LegalAI's website.</p>
  </div>
);

const PRIVACY_CONTENT = (
  <div className="space-y-4 text-slate-600">
    <p><strong>1. Data Collection</strong><br/>We collect information you provide directly to us. For example, we collect information when you create an account, subscribe, participate in any interactive features of our services, fill out a form, request customer support, or otherwise communicate with us.</p>
    <p><strong>2. Use of Information</strong><br/>We use the information we collect to provide, maintain, and improve our services, to process your transactions, to send you related information, including confirmations and invoices, to send you technical notices, updates, security alerts, and support and administrative messages.</p>
    <p><strong>3. Security</strong><br/>LegalAI takes reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>
  </div>
);

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // Modal State: 'terms' | 'privacy' | null
  const [activeModal, setActiveModal] = useState(null); 

  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // ✅ NORMAL SIGNUP
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!agreeTerms) {
      toast.error("You must agree to the Terms of Service");
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
        router.push("/pages/login");
      } else {
        toast.error(data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup Error:", error);
      toast.error("Connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ GOOGLE SIGNUP
  const handleGoogleSuccess = async (credentialResponse) => {
    setIsGoogleLoading(true);
    try {
      const res = await fetch("/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: credentialResponse.credential }),
      });

      const data = await res.json();

      if (res.ok && data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        toast.success("Account created & Logged in 🎉");
        router.push("/pages/private-chat"); 
      } else {
        toast.error(data.message || "Google signup failed");
        setIsGoogleLoading(false);
      }
    } catch {
      toast.error("Google signup error");
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
      toast.error("Google Signup Failed");
      setIsGoogleLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">

      {/* ================= LEFT SIDE (BRAND PANEL) ================= */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12 text-white">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-slate-950 opacity-80"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] opacity-40 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 rounded-full blur-[100px] opacity-20"></div>

        <div className="relative z-10 max-w-lg space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="flex items-center gap-3 text-blue-400 font-bold text-2xl mb-8">
                <div className="bg-white/10 backdrop-blur-sm p-2 rounded-xl border border-white/20 shadow-xl shadow-blue-900/20">
                    <Scale size={28} />
                </div>
                LegalAI
            </div>

            <h1 className="text-5xl font-bold leading-tight tracking-tight">
                Join the future of <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Legal Intelligence.</span>
            </h1>
            
            <p className="text-slate-300 text-lg leading-relaxed">
                Create an account to access instant contract analysis, risk detection, and 24/7 AI legal support.
            </p>

            <div className="grid grid-cols-1 gap-4 pt-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
                    <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400 shrink-0"><Zap size={20} /></div>
                    <div>
                        <h3 className="font-semibold text-white">Lightning Fast</h3>
                        <p className="text-sm text-slate-400">Get contract summaries in seconds, not days.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
                    <div className="bg-green-500/20 p-2 rounded-lg text-green-400 shrink-0"><Shield size={20} /></div>
                    <div>
                        <h3 className="font-semibold text-white">Bank-Grade Security</h3>
                        <p className="text-sm text-slate-400">Your documents are encrypted and private.</p>
                    </div>
                </div>
            </div>

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
        
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2 text-blue-700 font-bold text-xl">
            <Scale size={24} /> LegalAI
        </div>

        <div className="w-full max-w-md bg-white animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
          
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Create your account</h2>
            <p className="text-slate-500">
                Start your 7-day free trial. No credit card required.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                <div className="relative group">
                    <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={loading || isGoogleLoading}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all disabled:opacity-50"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Work Email</label>
                <div className="relative group">
                    <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading || isGoogleLoading}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all disabled:opacity-50"
                    />
                </div>
            </div>

            {/* TERMS CHECKBOX WITH MODAL TRIGGERS */}
            <div className="flex items-start gap-3 pt-2">
                <div className="relative flex items-center">
                    <input
                        type="checkbox"
                        id="terms"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        disabled={loading || isGoogleLoading}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 transition-all checked:border-blue-600 checked:bg-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:opacity-50"
                    />
                    <CheckCircle2 className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" size={14} />
                </div>
                <label htmlFor="terms" className="text-sm text-slate-500 cursor-pointer select-none leading-tight">
                    I agree to the{' '}
                    <button 
                        type="button" 
                        onClick={(e) => { e.preventDefault(); setActiveModal('terms'); }}
                        className="text-blue-600 font-semibold hover:underline focus:outline-none"
                    >
                        Terms of Service
                    </button>
                    {' '}and{' '}
                    <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); setActiveModal('privacy'); }}
                        className="text-blue-600 font-semibold hover:underline focus:outline-none"
                    >
                        Privacy Policy
                    </button>.
                </label>
            </div>

            <button
              disabled={loading || isGoogleLoading}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group mt-2"
            >
              {loading ? (
                  <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating Account...
                  </div>
              ) : (
                  <>Get Started <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500 font-medium">Or sign up with</span>
            </div>
          </div>

          <div className="flex justify-center w-full relative">
            {isGoogleLoading && (
                <div className="absolute inset-0 z-20 bg-white/80 flex items-center justify-center rounded-full border border-slate-200">
                    <div className="flex items-center gap-2 text-slate-600 font-semibold text-sm">
                        <Loader2 size={18} className="animate-spin text-blue-600" />
                        Creating account...
                    </div>
                </div>
            )}

            <div className={`w-full google-btn-wrapper transition-all duration-200 
                ${isGoogleLoading ? 'opacity-0 pointer-events-none' : ''} 
                ${loading ? 'opacity-50 pointer-events-none grayscale' : ''}
            `}>
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    width="100%"
                    theme="outline"
                    size="large"
                    shape="pill"
                    text="signup_with" 
                />
            </div>
          </div>

          <p className="text-center text-slate-500 mt-8 font-medium">
            Already have an account?{" "}
            <Link
              href="/pages/login"
              className={`text-blue-600 font-bold hover:text-blue-700 hover:underline transition-colors ${loading || isGoogleLoading ? "pointer-events-none opacity-60" : ""}`}
            >
              Log in
            </Link>
          </p>

        </div>
      </div>

      {/* ================= MODAL IMPLEMENTATION ================= */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
                onClick={() => setActiveModal(null)}
            ></div>

            {/* Modal Card */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                            <FileText size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">
                            {activeModal === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
                        </h3>
                    </div>
                    <button 
                        onClick={() => setActiveModal(null)}
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Body (Scrollable) */}
                <div className="p-6 overflow-y-auto leading-relaxed text-slate-600">
                    {activeModal === 'terms' ? TERMS_CONTENT : PRIVACY_CONTENT}
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl shrink-0 flex justify-end">
                    <button
                        onClick={() => setActiveModal(null)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
                    >
                        I Understand
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}