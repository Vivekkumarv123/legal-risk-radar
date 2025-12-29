"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email) {
      alert("Name and email are required");
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
        alert("Account created. Password sent to your email.");
        router.push("/");
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* LEFT SIDE – INFO */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-900 to-blue-700 text-white p-12 flex-col justify-center">
        <h1 className="text-4xl font-bold mb-6">
          Join Legal Advisor
        </h1>

        <p className="text-lg mb-4">
          Create your account in seconds.
        </p>

        <p className="text-lg mb-4">
          Analyze legal documents with AI.
        </p>

        <p className="text-lg mb-4">
          Stay protected from legal risks.
        </p>

        <p className="text-sm opacity-80 mt-6">
          ⚖️ Secure | Private | Trusted
        </p>
      </div>

      {/* RIGHT SIDE – SIGNUP FORM */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">

          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Create Account
          </h2>

          <p className="text-gray-500 mb-6">
            Password will be sent to your email
          </p>

          <form onSubmit={handleSubmit}>
            
            {/* NAME */}
            <div className="mb-4">
              <label className="text-sm text-gray-600">Full Name</label>
              <div className="flex items-center border rounded-lg px-3 mt-1">
                <User size={18} className="text-gray-400" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="Your name"
                  className="w-full p-2 outline-none"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="mb-6">
              <label className="text-sm text-gray-600">Email</label>
              <div className="flex items-center border rounded-lg px-3 mt-1">
                <Mail size={18} className="text-gray-400" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full p-2 outline-none"
                />
              </div>
            </div>

            {/* SIGNUP BUTTON */}
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg transition"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          {/* DIVIDER */}
          <div className="flex items-center my-5">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="px-3 text-gray-400 text-sm">OR</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* GOOGLE SIGNUP */}
          <button className="w-full border flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 transition">
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Sign up with Google
          </button>

          {/* LOGIN LINK */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Login
            </a>
          </p>

        </div>
      </div>
    </div>
  );
}
