"use client";

import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Shield,
  CheckCircle2,
  X,
  AlertTriangle // Import AlertTriangle for specific error UI if needed
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast"; // Ensure you have react-hot-toast installed
import { motion, AnimatePresence } from "framer-motion";

/* ================= CUSTOM OTP INPUT COMPONENT ================= */
// ... (Keep OtpInput code exactly as is) ...
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
            <div key={index} className="relative w-12 h-14 md:w-14 md:h-16 flex items-center justify-center">
              <motion.div
                initial={false}
                animate={{
                  borderColor: isActive ? "#2563eb" : isFilled ? "#93c5fd" : "#e5e7eb",
                  borderWidth: isActive ? 2 : 1,
                  scale: isActive ? 1.05 : 1,
                  boxShadow: isActive ? "0 4px 12px rgba(37, 99, 235, 0.2)" : "none",
                  backgroundColor: isFilled ? "#eff6ff" : "#f9fafb"
                }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 rounded-xl border bg-gray-50 z-10"
              />
              <motion.span
                key={digit}
                initial={{ opacity: 0, scale: 0.5, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative z-10 text-2xl font-bold text-gray-800"
              >
                {digit}
              </motion.span>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="absolute z-10 w-0.5 h-6 bg-blue-600 rounded-full"
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
// ... (Keep MailSendAnimation code exactly as is) ...
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      >
        {status === "success" && (
          <>
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
              className="relative"
            >
              <motion.div
                animate={{ x: [0, 20, 400], y: [0, -10, -400], scale: [1, 1, 0], opacity: [1, 1, 0] }}
                transition={{ duration: 1.2, delay: 0.6, ease: "easeInOut" }}
              >
                <Mail size={80} className="text-blue-600 drop-shadow-2xl" strokeWidth={1.5} />
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="absolute bottom-1/3 bg-white px-8 py-4 rounded-2xl shadow-2xl"
            >
              <p className="text-2xl font-bold text-gray-900">Mail sent! 📩</p>
              <p className="text-sm text-gray-500">Check your inbox for OTP</p>
            </motion.div>
          </>
        )}

        {status === "error" && (
          <>
            <motion.div 
               animate={{ x: [0, -10, 10, -10, 0] }}
               transition={{ duration: 0.5 }}
               className="relative"
            >
              <Mail size={80} className="text-red-500 drop-shadow-2xl" strokeWidth={1.5} />
              <motion.div 
                 initial={{ scale: 0 }} 
                 animate={{ scale: 1 }}
                 className="absolute -right-2 -bottom-2 bg-red-600 rounded-full p-2"
              >
                 <X size={30} className="text-white" strokeWidth={3} />
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-1/3 bg-white px-8 py-4 rounded-2xl shadow-2xl border-2 border-red-100"
            >
              <p className="text-xl font-bold text-red-600">Sending Failed</p>
              <p className="text-sm text-gray-500">Please try again</p>
            </motion.div>
          </>
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

  /* ================= SEND OTP (UPDATED LOGIC) ================= */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailOrPhone.trim() }),
      });

      const data = await res.json(); // ALWAYS parse the JSON

      if (res.ok) {
        setMailStatus("success");
      } else {
        // CHECK IF IT'S THE PROVIDER ERROR
        if (res.status === 400 && data.message) {
          // Show the specific message from backend via Toast
          toast.error(data.message, {
            duration: 5000, // Show longer so they can read
            icon: '🚫',
          });
          // DO NOT trigger setMailStatus("error"), as this isn't a "sending failure", it's a validation error.
        } else {
          // Generic error or server error
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

      if (res.ok) {
        toast.success("Password reset successfully 🔐");
        setTimeout(() => (window.location.href = "/"), 1500);
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

  const inputClass =
    "w-full bg-gray-50 text-gray-900 placeholder-gray-400 " +
    "border border-gray-300 rounded-xl px-10 py-3 " +
    "focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all";

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-blue-100">
      
      <MailSendAnimation status={mailStatus} onComplete={handleAnimationComplete} />

      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 px-20 py-16">
        <div className="flex flex-col justify-center space-y-10 max-w-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xl">
              <Shield size={28} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Legal Advisor</h1>
          </div>

          <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">
            Secure <span className="text-blue-600">Password Recovery</span>
          </h2>

          <p className="text-lg text-gray-600">
            Recover your account using a secure OTP-based password reset process.
          </p>

          <div className="space-y-4">
            {["OTP-based secure reset", "Fast verification", "Private & encrypted"].map(
              (item, i) => (
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
              )
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-1">
            Forgot Password 🔑
          </h2>
          <p className="text-gray-600 mb-6">Reset your password securely</p>

          {/* STEP 1: EMAIL */}
          {step === 1 && (
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSendOtp} 
              className="space-y-5"
            >
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
                className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold transition-transform active:scale-95"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </motion.form>
          )}

          {/* STEP 2: OTP (BOXED) */}
          {step === 2 && (
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }} 
              onSubmit={handleVerifyOtp} 
              className="space-y-5"
            >
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Enter OTP</label>
                <p className="text-xs text-gray-500">We sent a code to {emailOrPhone}</p>
              </div>

              <div className="py-2 flex justify-center">
                 <OtpInput value={otp} onChange={setOtp} length={6} />
              </div>

              <button
                disabled={loading}
                className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold transition-transform active:scale-95 mt-2"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
              
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="w-full text-sm text-gray-500 hover:text-blue-600"
              >
                Wrong email? Go back
              </button>
            </motion.form>
          )}

          {/* STEP 3: RESET PASSWORD */}
          {step === 3 && (
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }} 
              onSubmit={handleResetPassword} 
              className="space-y-5"
            >
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
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-blue-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-blue-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button
                disabled={loading}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-transform active:scale-95"
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