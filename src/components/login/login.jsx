"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import LegalAdvisorHero from "../LegalAdvisorHero";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
      }
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ GOOGLE LOGIN
  const handleGoogleSuccess = async (credentialResponse) => {
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
      } else {
        toast.error(data.message || "Google login failed");
      }
    } catch {
      toast.error("Google login error");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* LEFT SIDE */}
      <LegalAdvisorHero />

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl px-8 py-10">

          {/* HEADER */}
          <h2 className="text-3xl font-bold text-gray-900 mb-1">
            Welcome Back 👋
          </h2>
          <p className="text-gray-600 mb-8">
            Login to continue to Legal Advisor
          </p>

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* EMAIL */}
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 border border-gray-300
                rounded-xl text-gray-900 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-10 py-3 border border-gray-300
                rounded-xl text-gray-900 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-600"
              />

              {/* SHOW / HIDE */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* FORGOT PASSWORD */}
            <div className="text-right">
              <Link
                href="/pages/forgot-password"
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* LOGIN BUTTON */}
            <button
              disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-800
              text-white py-3 rounded-xl font-semibold transition
              disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* DIVIDER */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="px-4 text-gray-400 text-sm">OR</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* GOOGLE LOGIN */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google Login Failed")}
              width="100%"
            />
          </div>

          {/* SIGNUP */}
          <p className="text-center text-sm mt-6 text-gray-600">
            Don’t have an account?{" "}
            <Link
              href="/pages/signup"
              className="text-blue-600 font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
