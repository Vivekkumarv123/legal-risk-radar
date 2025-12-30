"use client";

import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Shield,
  CheckCircle2,
  X,
  ArrowRight,
  Scale,
  KeyRound
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast"; 
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link"; // Ensure Link is imported if used for back navigation

/* ================= CUSTOM OTP INPUT COMPONENT ================= */
const OtpInput = ({ value, onChange, length = 6 }) => {
  const inputRef = useRef(null);
  const handleBoxClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full cursor-text" onClick={handleBoxClick}>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={length}
        value={value}
        onChange={(e) => {
          const val = e.target.value.replace(/[^0-9]/g, "");
          onChange(val);
        }}
        className="absolute inset-0 w-full h-full opacity-0 z-20 pointer-events-none"
        style={{ caretColor: "transparent" }}
        autoComplete="one-time-code"
      />
      <div className="flex justify-between gap-2 pointer-events-none">
        {Array.from({ length }).map((_, index) => {
          const digit = value[index];
          const isActive = value.length === index;
          const isFilled = value.length > index;
          return (
            <div key={index} className="relative w-10 h-12 md:w-12 md:h-14 flex items-center justify-center">
              <motion.div
                initial={false}
                animate={{
                  borderColor: isActive ? "#2563eb" : isFilled ? "#93c5fd" : "#e2e8f0",
                  borderWidth: isActive ? 2 : 1,
                  scale: isActive ? 1.05 : 1,
                  boxShadow: isActive ? "0 4px 12px rgba(37, 99, 235, 0.1)" : "none",
                  backgroundColor: isFilled ? "#eff6ff" : "#f8fafc"
                }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 rounded-xl border bg-slate-50 z-10"
              />
              <motion.span
                key={digit}
                initial={{ opacity: 0, scale: 0.5, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative z-10 text-xl font-bold text-slate-800"
              >
                {digit}
              </motion.span>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="absolute z-10 w-0.5 h-5 bg-blue-600 rounded-full"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ================= MAIL SEND ANIMATION OVERLAY ================= */
function MailSendAnimation({ status, onComplete }) {
  const [show, setShow] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (status) {
      setShow(true);
      if (status === "success") {
        const newParticles = Array.from({ length: 30 }, (_, i) => ({
          id: i,
          x: Math.random() * 100 - 50,
          y: Math.random() * -100 - 50,
          rotate: Math.random() * 360,
          scale: Math.random() * 0.5 + 0.5,
          delay: Math.random() * 0.3,
          color: ["#3B82F6", "#60A5FA", "#93C5FD", "#FBBF24", "#F59E0B"][i % 5]
        }));
        setParticles(newParticles);
      }
      const duration = status === "success" ? 2800 : 2500;
      setTimeout(() => {
        setShow(false);
        setTimeout(() => onComplete?.(), 300);
      }, duration);
    }
  }, [status, onComplete]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
      >
        {status === "success" && (
          <div className="relative flex flex-col items-center">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{
                  x: p.x * 4,
                  y: p.y * 2,
                  opacity: [0, 1, 1, 0],
                  scale: [0, p.scale, 0],
                  rotate: p.rotate,
                }}
                transition={{ duration: 1.5, delay: 0.6 + p.delay, ease: "easeOut" }}
                className="absolute w-3 h-3 rounded-full"
                style={{ background: p.color, left: "50%", top: "50%" }}
              />
            ))}
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: [0, 1.2, 1], rotate: [-45, -45, 0] }}
              transition={{ duration: 0.5, ease: "backOut" }}
              className="relative mb-8"
            >
              <motion.div
                animate={{ x: [0, 20, 400], y: [0, -10, -400], scale: [1, 1, 0], opacity: [1, 1, 0] }}
                transition={{ duration: 1.2, delay: 0.6, ease: "easeInOut" }}
              >
                <div className="bg-white p-6 rounded-full shadow-2xl">
                    <Mail size={48} className="text-blue-600" strokeWidth={2} />
                </div>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="bg-white px-8 py-5 rounded-2xl shadow-2xl text-center"
            >
              <p className="text-xl font-bold text-slate-900 mb-1">Email Sent! 📩</p>
              <p className="text-sm text-slate-500">Check your inbox for the reset code</p>
            </motion.div>
          </div>
        )}

        {status === "error" && (
          <div className="relative flex flex-col items-center">
            <motion.div 
               animate={{ x: [0, -10, 10, -10, 0] }}
               transition={{ duration: 0.5 }}
               className="relative mb-8"
            >
              <div className="bg-white p-6 rounded-full shadow-2xl border-2 border-red-50">
                  <Mail size={48} className="text-red-500" strokeWidth={2} />
              </div>
              <motion.div 
                 initial={{ scale: 0 }} 
                 animate={{ scale: 1 }}
                 className="absolute -right-1 -bottom-1 bg-red-600 rounded-full p-1.5 border-2 border-white"
              >
                 <X size={20} className="text-white" strokeWidth={3} />
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white px-8 py-5 rounded-2xl shadow-2xl border border-red-100 text-center"
            >
              <p className="text-xl font-bold text-red-600 mb-1">Sending Failed</p>
              <p className="text-sm text-slate-500">Please verify your email and try again</p>
            </motion.div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/* ================= MAIN COMPONENT ================= */
export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [mailStatus, setMailStatus] = useState(null); 

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
        setMailStatus("success");
      } else {
        if (res.status === 400 && data.message) {
          toast.error(data.message, {
            duration: 4000,
            icon: '🚫',
          });
        } else {
          setMailStatus("error");
        }
      }
    } catch (err) {
      console.error(err);
      setMailStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const handleAnimationComplete = () => {
    if (mailStatus === "success") {
      setStep(2);
    }
    setMailStatus(null);
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
        toast.success("Code verified successfully ✅");
        setStep(3);
      } else {
        toast.error(data.message || "Invalid Code");
      }
    } catch {
      toast.error("Verification failed");
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

      if (res.ok) {
        toast.success("Password reset successfully 🔐");
        setTimeout(() => (window.location.href = "/pages/login"), 1500);
      } else {
        const data = await res.json();
        toast.error(data.message || "Reset failed");
      }
    } catch {
      toast.error("Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      
      <MailSendAnimation status={mailStatus} onComplete={handleAnimationComplete} />

      {/* ================= LEFT SIDE (BRAND PANEL) ================= */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12 text-white">
        {/* Abstract Background Shapes (Consistent with Login/Signup) */}
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-slate-950 opacity-80"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-30 animate-pulse"></div>
        
        <div className="relative z-10 max-w-lg space-y-10">
            <div className="flex items-center gap-3 text-blue-400 font-bold text-2xl mb-8">
                <div className="bg-white/10 backdrop-blur-sm p-2 rounded-xl border border-white/20">
                    <Scale size={28} />
                </div>
                LegalAI
            </div>

            <div>
                <h2 className="text-4xl font-bold leading-tight mb-4">
                    Account <span className="text-blue-400">Security</span>
                </h2>
                <p className="text-slate-300 text-lg leading-relaxed">
                    We use multi-factor authentication and secure OTP verification to ensure only you can access your legal documents.
                </p>
            </div>

            <div className="space-y-5">
                {[
                    "End-to-End Encryption", 
                    "Secure OTP Verification", 
                    "Instant Account Recovery"
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15 }}
                        className="flex items-center gap-4 text-slate-200 font-medium"
                    >
                        <div className="bg-green-500/20 p-1.5 rounded-full">
                            <CheckCircle2 size={18} className="text-green-400" />
                        </div>
                        {item}
                    </motion.div>
                ))}
            </div>
        </div>
      </div>

      {/* ================= RIGHT SIDE (FORM) ================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="w-full max-w-md bg-white">
          
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
                {step === 1 && "Forgot Password?"}
                {step === 2 && "Verify Identity"}
                {step === 3 && "Reset Password"}
            </h2>
            <p className="text-slate-500">
                {step === 1 && "Don't worry, we'll send you reset instructions."}
                {step === 2 && `Enter the 6-digit code sent to ${emailOrPhone}`}
                {step === 3 && "Create a new strong password for your account."}
            </p>
          </div>

          {/* STEP 1: EMAIL */}
          {step === 1 && (
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSendOtp} 
              className="space-y-6"
            >
              <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    />
                  </div>
              </div>

              <button
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {loading ? (
                    "Sending..." 
                ) : (
                    <>Send Instructions <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>

              <div className="text-center">
                  <Link href="/pages/login" className="text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors">
                      ← Back to Login
                  </Link>
              </div>
            </motion.form>
          )}

          {/* STEP 2: OTP */}
          {step === 2 && (
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleVerifyOtp} 
              className="space-y-8"
            >
              <div className="py-2 flex justify-center">
                 <OtpInput value={otp} onChange={setOtp} length={6} />
              </div>

              <div className="space-y-4">
                  <button
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-blue-600/20 transition-all disabled:opacity-70"
                  >
                    {loading ? "Verifying..." : "Verify Code"}
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={() => setStep(1)}
                    className="w-full text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors"
                  >
                    Didn't receive code? Try again
                  </button>
              </div>
            </motion.form>
          )}

          {/* STEP 3: RESET PASSWORD */}
          {step === 3 && (
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleResetPassword} 
              className="space-y-6"
            >
              <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">New Password</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-3.5 text-slate-400" size={20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
              </div>

              <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-3.5 text-slate-400" size={20} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
              </div>

              <button
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? "Updating..." : "Reset Password"}
              </button>
            </motion.form>
          )}
        </div>
      </div>
    </div>
  );
}