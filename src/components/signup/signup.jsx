"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail } from "lucide-react";
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
        router.push("/");
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
    <div className="flex bg-gradient-to-br from-blue-50 via-white to-blue-100">

      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 items-center justify-center px-16">
        <div className="max-w-lg space-y-8">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl shadow-lg">
              ⚖️
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Legal Advisor
            </h1>
          </div>

          {/* Heading */}
          <h2 className="text-4xl font-extrabold leading-tight text-gray-900">
            Create your <span className="text-blue-600">AI-powered</span> legal account
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-600">
            Sign up once and get instant access to legal insights, risk analysis,
            and AI-powered guidance.
          </p>

          {/* Features */}
          <ul className="space-y-3 text-gray-700 text-base">
            <li>✅ AI contract analysis</li>
            <li>✅ Simple legal explanations</li>
            <li>✅ Private & secure chats</li>
          </ul>

          {/* Trust */}
          <p className="text-sm text-gray-500">
            🔒 Secure • Trusted • AI Powered
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-8">

          <div className="items-center justify-center text-center">
            {/* Header */}
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ✨ Create Account ✨
          </h2>
          <p className="text-gray-600 mb-8">
            Password will be sent to your email
          </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* NAME */}
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl
                bg-white text-gray-900 outline-none
                focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
              />
            </div>

            {/* EMAIL */}
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl
                bg-white text-gray-900 outline-none
                focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
              />
            </div>

            {/* SIGNUP BUTTON */}
            <button
              disabled={loading}
              type="submit"
              className="w-full py-3 bg-blue-700 hover:bg-blue-800
              text-white font-semibold rounded-xl transition
              disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* DIVIDER */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="px-3 text-gray-400 text-sm">OR</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* GOOGLE SIGNUP (UI ONLY) */}
          <button
            type="button"
            className="w-full border border-gray-300 flex items-center justify-center gap-2 py-3 rounded-xl hover:bg-gray-100 transition"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            <span className="text-gray-700 font-medium">
              Sign up with Google
            </span>
          </button>

          {/* LOGIN LINK */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <Link
              href="/"
              className="text-blue-600 font-medium hover:underline"
            >
              Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
