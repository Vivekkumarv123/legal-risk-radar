"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Scale, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Standard form loading
  const [loading, setLoading] = useState(false);
  
  // Specific loading state for Google Login to block UI
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // ✅ NORMAL LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        toast.success("Login successful 🎉");
        router.push("/pages/private-chat");
      } else {
        toast.error(data.message || "Login failed");
        setLoading(false); // Only stop loading on error
      }
    } catch {
      toast.error("Login failed. Please try again.");
      setLoading(false);
    }
  };

  // ✅ GOOGLE LOGIN
  const handleGoogleSuccess = async (credentialResponse) => {
    // 1. Immediately block UI interactions
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
        toast.success("Login successful 🎉");
        router.push("/pages/private-chat");
        // Note: We intentionally DO NOT set isGoogleLoading(false) here 
        // to keep the UI blocked while redirecting.
      } else {
        toast.error(data.message || "Google login failed");
        setIsGoogleLoading(false); // Re-enable on specific error
      }
    } catch {
      toast.error("Google login error");
      setIsGoogleLoading(false); // Re-enable on crash
    }
  };

  const handleGoogleError = () => {
      toast.error("Google Login Failed");
      setIsGoogleLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">

      {/* ================= LEFT SIDE (BRAND PANEL) ================= */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12 text-white">
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-slate-950 opacity-80"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600 rounded-full blur-[100px] opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-[100px] opacity-30"></div>

        {/* Content Layer */}
        <div className="relative z-10 max-w-lg space-y-8">
            <div className="flex items-center gap-3 text-blue-400 font-bold text-2xl mb-8">
                <div className="bg-white/10 backdrop-blur-sm p-2 rounded-xl border border-white/20">
                    <Scale size={28} />
                </div>
                LegalAI
            </div>

            <h1 className="text-5xl font-bold leading-tight tracking-tight">
                Simplify your legal <br/>
                <span className="text-blue-400">journey today.</span>
            </h1>
            
            <p className="text-slate-300 text-lg leading-relaxed">
                Unlock the power of AI to analyze contracts, understand risks, and get instant legal guidance tailored for India.
            </p>

            {/* Feature List */}
            <div className="space-y-4 pt-4">
                {[
                    "Instant Document Analysis",
                    "Risk Detection & Alerts",
                    "24/7 AI Legal Assistant"
                ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-slate-200 font-medium">
                        <CheckCircle size={20} className="text-green-400" />
                        {item}
                    </div>
                ))}
            </div>

            {/* Testimonial / Social Proof */}
            <div className="mt-12 p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                <p className="italic text-slate-300 mb-4">"LegalAI saved me hours of reading and potential legal trouble. A must-have tool!"</p>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-indigo-500"></div>
                    <div>
                        <p className="font-bold text-sm">Aditya Verma</p>
                        <p className="text-xs text-slate-400">Freelance Designer</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* ================= RIGHT SIDE (LOGIN FORM) ================= */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 lg:p-12 relative">
        
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2 text-blue-700 font-bold text-xl">
            <Scale size={24} /> LegalAI
        </div>

        <div className="w-full max-w-md bg-white relative">
          
          {/* HEADER */}
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome back</h2>
            <p className="text-slate-500">
                Please enter your details to sign in.
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-6">

            {/* EMAIL */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                    <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
                    <input
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading || isGoogleLoading}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <div className="relative">
                    <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading || isGoogleLoading}
                        className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading || isGoogleLoading}
                        className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-60"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
            </div>

            {/* FORGOT PASSWORD */}
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="checkbox" 
                        disabled={loading || isGoogleLoading}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-60" 
                    />
                    <span className="text-sm text-slate-500">Remember me</span>
                </label>
                <Link
                    href="/pages/forgot-password"
                    className={`text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline ${loading || isGoogleLoading ? "pointer-events-none opacity-60" : ""}`}
                >
                    Forgot password?
                </Link>
            </div>

            {/* LOGIN BUTTON */}
            <button
              disabled={loading || isGoogleLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                  <>Logging in...</>
              ) : (
                  <>Sign in <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          {/* DIVIDER */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500 font-medium">Or continue with</span>
            </div>
          </div>

          {/* GOOGLE LOGIN */}
          <div className="flex justify-center w-full relative">
            
            {/* OVERLAY FOR GOOGLE LOADING STATE */}
            {isGoogleLoading && (
                <div className="absolute inset-0 z-20 bg-white/80 flex items-center justify-center rounded-full border border-slate-200">
                    <div className="flex items-center gap-2 text-slate-600 font-semibold text-sm">
                        <Loader2 size={18} className="animate-spin text-blue-600" />
                        Signing in with Google...
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
                    text="continue_with"
                />
            </div>
          </div>

          {/* SIGNUP CTA */}
          <p className="text-center text-slate-500 mt-8 font-medium">
            Don’t have an account?{" "}
            <Link
              href="/pages/signup"
              className={`text-blue-600 font-bold hover:text-blue-700 hover:underline transition-colors ${loading || isGoogleLoading ? "pointer-events-none opacity-60" : ""}`}
            >
              Create free account
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}