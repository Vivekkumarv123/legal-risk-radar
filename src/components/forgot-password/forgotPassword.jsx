"use client";

import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    Shield,
    CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function ForgotPassword() {
    const [step, setStep] = useState(1);
    const [emailOrPhone, setEmailOrPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    /* ================= SEND OTP ================= */
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/auth/send-reset-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailOrPhone.trim() }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("OTP sent successfully 📩");
                setStep(2);
            } else {
                toast.error(data.message || "Failed to send OTP");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    /* ================= VERIFY OTP ================= */
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/auth/verify-reset-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailOrPhone.trim(), otp }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("OTP verified ✅");
                setStep(3);
            } else {
                toast.error(data.message || "Invalid OTP");
            }
        } catch {
            toast.error("OTP verification failed");
        } finally {
            setLoading(false);
        }
    };

    /* ================= RESET PASSWORD ================= */
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: emailOrPhone.trim(),
                    otp,
                    newPassword,
                    confirmPassword,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Password reset successfully 🔐");
                setTimeout(() => (window.location.href = "/"), 1500);
            } else {
                toast.error(data.message || "Reset failed");
            }
        } catch {
            toast.error("Reset failed");
        } finally {
            setLoading(false);
        }
    };

    /* ================= COMMON INPUT STYLE ================= */
    const inputClass =
        "w-full bg-gray-50 text-gray-900 placeholder-gray-400 " +
        "border border-gray-300 rounded-xl px-10 py-3 " +
        "focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600";

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-blue-100">

            {/* LEFT SIDE */}
            <div className="hidden md:flex w-1/2 px-20 py-16">
                <div className="flex flex-col justify-center space-y-10 max-w-xl">

                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xl">
                            <Shield size={28} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Legal Advisor
                        </h1>
                    </div>

                    <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">
                        Secure <span className="text-blue-600">Password Recovery</span>
                    </h2>

                    <p className="text-lg text-gray-600">
                        Recover your account using a secure OTP-based password reset process.
                    </p>

                    <div className="space-y-4">
                        {[
                            "OTP-based secure reset",
                            "Fast verification",
                            "Private & encrypted",
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.15 }}
                                className="flex items-center gap-3 text-gray-700"
                            >
                                <CheckCircle2 className="text-blue-600" />
                                {item}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">

                    <h2 className="text-3xl font-bold text-gray-900 mb-1">
                        Forgot Password 🔑
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Reset your password securely
                    </p>

                    {/* STEP 1 */}
                    {step === 1 && (
                        <form onSubmit={handleSendOtp} className="space-y-5">
                            <label className="text-sm font-semibold text-gray-700">
                                Registered Email
                            </label>

                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 text-gray-400" />
                                <input
                                    type="email"
                                    placeholder="Enter your registered email"
                                    value={emailOrPhone}
                                    onChange={(e) => setEmailOrPhone(e.target.value)}
                                    required
                                    className={inputClass}
                                />
                            </div>

                            <button
                                disabled={loading}
                                className="w-full py-3 bg-blue-700 hover:bg-blue-800
                text-white rounded-xl font-semibold"
                            >
                                {loading ? "Sending..." : "Send OTP"}
                            </button>
                        </form>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp} className="space-y-5">
                            <label className="text-sm font-semibold text-gray-700">
                                Enter OTP
                            </label>

                            <input
                                type="text"
                                maxLength="6"
                                placeholder="6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className={`${inputClass} text-center tracking-widest`}
                            />

                            <button
                                disabled={loading}
                                className="w-full py-3 bg-blue-700 hover:bg-blue-800
                text-white rounded-xl font-semibold"
                            >
                                {loading ? "Verifying..." : "Verify OTP"}
                            </button>
                        </form>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-5">

                            <label className="text-sm font-semibold text-gray-700">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className={inputClass}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3.5 text-gray-400"
                                >
                                    {showPassword ? <EyeOff /> : <Eye />}
                                </button>
                            </div>

                            <label className="text-sm font-semibold text-gray-700">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 text-gray-400" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Re-enter new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={inputClass}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(!showConfirmPassword)
                                    }
                                    className="absolute right-3 top-3.5 text-gray-400"
                                >
                                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                                </button>
                            </div>

                            <button
                                disabled={loading}
                                className="w-full py-3 bg-green-600 hover:bg-green-700
                text-white rounded-xl font-semibold"
                            >
                                {loading ? "Updating..." : "Reset Password"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
