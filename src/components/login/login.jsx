"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import LegalAdvisorHero from "../LegalAdvisorHero";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        router.push("/pages/private-chat");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Login failed");
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
        router.push("/pages/private-chat");
      } else {
        alert(data.message || "Google login failed");
      }
    } catch (error) {
      console.error(error);
      alert("Google login error");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* LEFT SIDE */}
      <LegalAdvisorHero />

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">

          <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
          <p className="text-gray-500 mb-6">Login to your account</p>

          <form onSubmit={handleLogin}>
            {/* EMAIL */}
            <div className="mb-4">
              <label className="text-sm text-gray-600">Email</label>
              <div className="flex items-center border rounded-lg px-3 mt-1">
                <Mail size={18} className="text-gray-400" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="w-full p-2 outline-none"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="mb-4">
              <label className="text-sm text-gray-600">Password</label>
              <div className="flex items-center border rounded-lg px-3 mt-1">
                <Lock size={18} className="text-gray-400" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  className="w-full p-2 outline-none"
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* DIVIDER */}
          <div className="flex items-center my-5">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="px-3 text-gray-400 text-sm">OR</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* GOOGLE BUTTON */}
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => alert("Google Login Failed")}
            width="100%"
          />

          <p className="text-center text-sm mt-6">
            Don’t have an account?{" "}
            <a href="/signup" className="text-blue-600 hover:underline">
              Sign up
            </a>
          </p>

        </div>
      </div>
    </div>
  );
}
