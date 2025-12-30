"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, ArrowRight, Scale, Shield, Zap, CheckCircle2, Loader2 } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // Standard form loading
  const [loading, setLoading] = useState(false);
  
  // Specific loading state for Google Login to block UI
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

  // ✅ GOOGLE LOGIN / SIGNUP LOGIC (Copied from Login)
  const handleGoogleSuccess = async (credentialResponse) => {
    // 1. Immediately block UI interactions
    setIsGoogleLoading(true);

    try {
      // Typically Google Auth endpoints handle both Login and Signup (Upsert)
      const res = await fetch("/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: credentialResponse.credential }),
      });

      const data = await res.json();

      if (res.ok && data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        toast.success("Account created & Logged in 🎉");
        // Redirecting directly to app since they are now authenticated
        router.push("/pages/private-chat"); 
      } else {
        toast.error(data.message || "Google signup failed");
        setIsGoogleLoading(false); // Re-enable on specific error
      }
    } catch {
      toast.error("Google signup error");
      setIsGoogleLoading(false); // Re-enable on crash
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
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-slate-950 opacity-80"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] opacity-40 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 rounded-full blur-[100px] opacity-20"></div>

        {/* Content Layer */}
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

            {/* Feature Cards */}
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

        <div className="w-full max-w-md bg-white animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
          
          {/* HEADER */}
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Create your account</h2>
            <p className="text-slate-500">
                Start your 7-day free trial. No credit card required.
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* NAME */}
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

            {/* EMAIL */}
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

            {/* TERMS CHECKBOX */}
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
                    I agree to the <Link href="#" className="text-blue-600 font-semibold hover:underline">Terms of Service</Link> and <Link href="#" className="text-blue-600 font-semibold hover:underline">Privacy Policy</Link>.
                </label>
            </div>

            {/* SIGNUP BUTTON */}
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

          {/* DIVIDER */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500 font-medium">Or sign up with</span>
            </div>
          </div>

          {/* GOOGLE SIGNUP BUTTON WITH LOADING OVERLAY */}
          <div className="flex justify-center w-full relative">
            
            {/* OVERLAY FOR GOOGLE LOADING STATE */}
            {isGoogleLoading && (
                <div className="absolute inset-0 z-20 bg-white/80 flex items-center justify-center rounded-full border border-slate-200">
                    <div className="flex items-center gap-2 text-slate-600 font-semibold text-sm">
                        <Loader2 size={18} className="animate-spin text-blue-600" />
                        Creating account...
                    </div>
                </div>
            )}

            <div className={`w-full google-btn-wrapper transition-opacity duration-200 ${isGoogleLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
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

          {/* LOGIN CTA */}
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
    </div>
  );
}