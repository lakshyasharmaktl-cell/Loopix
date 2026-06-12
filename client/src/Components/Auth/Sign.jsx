import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight,
} from "react-icons/fa";

/* ─── Loopix mark ─── */
function LoopixMark({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lmG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF5555" />
          <stop offset="100%" stopColor="#AA0000" />
        </linearGradient>
      </defs>
      <path d="M 68.2 69.2 A 26 26 0 1 1 68.2 30.8" fill="none" stroke="url(#lmG)" strokeWidth="10" strokeLinecap="round" />
      <path d="M 61 38 A 16 16 0 1 1 61 62" fill="none" stroke="#CC2222" strokeWidth="3.5" strokeLinecap="round" opacity="0.6" />
      <circle cx="68.2" cy="69.2" r="5.5" fill="#FF4444" />
      <circle cx="68.2" cy="69.2" r="2.5" fill="#100000" />
    </svg>
  );
}

/* ─── password strength helper ─── */
function strengthOf(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) || /[0-9]/.test(pw) || /[^a-zA-Z0-9]/.test(pw)) s++;
  return Math.min(s, 3);
}
const STRENGTH_LABEL = ["", "Weak", "Fair", "Strong"];
const STRENGTH_COLOR = ["", "#DC2626", "#F59E0B", "#10B981"];

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = "Username is required";
    else if (form.username.length < 3) e.username = "At least 3 characters";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "At least 6 characters";
    if (form.confirm !== form.password) e.confirm = "Passwords don't match";
    return e;
  };

  const onChange = (field) => (ev) => {
    setForm(f => ({ ...f, [field]: ev.target.value }));
    setErrors(e => ({ ...e, [field]: undefined }));
    setApiError(""); // Clear API error on input change
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { 
      setErrors(errs); 
      return; 
    }
    
    setLoading(true);
    setApiError("");
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed. Please try again.');
      }

      // Store email for OTP verification
      localStorage.setItem('otp_email', form.email);
      
      // Navigate to OTP verification page
      navigate('/otp-verify', { 
        state: { 
          email: form.email,
          message: 'Verification code sent to your email!'
        } 
      });

    } catch (err) {
      console.error('Signup error:', err);
      setApiError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = strengthOf(form.password);

  const fields = [
    { key: "username", label: "Username", icon: <FaUser />, type: "text", placeholder: "your_handle" },
    { key: "email", label: "Email address", icon: <FaEnvelope />, type: "email", placeholder: "you@example.com" },
    {
      key: "password", label: "Password", icon: <FaLock />,
      type: showPass ? "text" : "password",
      placeholder: "Min 6 characters",
      toggle: () => setShowPass(p => !p), showing: showPass,
    },
    {
      key: "confirm", label: "Confirm password", icon: <FaLock />,
      type: showConf ? "text" : "password",
      placeholder: "Repeat your password",
      toggle: () => setShowConf(p => !p), showing: showConf,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center font-sans relative overflow-hidden p-8">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-100 rounded-full blur-3xl opacity-40 translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-50 rounded-full blur-3xl opacity-20 pointer-events-none" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Top shimmer line */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-70" />

        <div className="p-8 sm:p-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              animate={{ rotate: [0, 7, -7, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="mb-3"
            >
              <LoopixMark size={52} />
            </motion.div>
            <span className="text-3xl font-black tracking-tight bg-gradient-to-r from-gray-900 via-red-700 to-red-600 bg-clip-text text-transparent">
              LOOPIX
            </span>
            <span className="mt-1.5 text-xs font-semibold text-gray-500 tracking-[3px]">
              CREATE YOUR ACCOUNT
            </span>
          </div>

          {/* API Error Message */}
          <AnimatePresence>
            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium"
              >
                {apiError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={onSubmit} noValidate>
            <div className="flex flex-col gap-5">
              {fields.map(({ key, label, icon, type, placeholder, toggle, showing }) => (
                <div key={key}>
                  <label className="block mb-1.5 text-xs font-bold text-gray-600 tracking-wide">
                    {label.toUpperCase()}
                  </label>

                  <div className="relative">
                    <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm pointer-events-none ${errors[key] ? 'text-red-500' : 'text-gray-400'}`}>
                      {icon}
                    </span>

                    <input
                      type={type}
                      value={form[key]}
                      onChange={onChange(key)}
                      placeholder={placeholder}
                      autoComplete={key === "confirm" ? "new-password" : key}
                      className={`w-full py-2.5 px-10 bg-gray-50 border rounded-xl text-gray-900 text-sm font-medium placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400/50 ${
                        errors[key] ? 'border-red-500 bg-red-50/30' : 'border-gray-200 focus:border-red-300'
                      }`}
                    />

                    {toggle && (
                      <button
                        type="button"
                        onClick={toggle}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showing ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {errors[key] && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-1 ml-1 text-xs font-semibold text-red-500"
                      >
                        ⚠ {errors[key]}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Password strength */}
                  {key === "password" && form.password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-2 flex items-center gap-2"
                    >
                      <div className="flex-1 flex gap-1">
                        {[1, 2, 3].map(i => (
                          <motion.div
                            key={i}
                            animate={{ scaleX: strength >= i ? 1 : 0.15, opacity: strength >= i ? 1 : 0.3 }}
                            className={`h-1 rounded-full origin-left ${strength >= i ? 'bg-green-500' : 'bg-gray-300'}`}
                            style={{ flex: 1 }}
                          />
                        ))}
                      </div>
                      <span className={`text-[11px] font-bold min-w-[42px] text-right ${strength > 0 ? `text-${STRENGTH_COLOR[strength] === '#DC2626' ? 'red-500' : STRENGTH_COLOR[strength] === '#F59E0B' ? 'amber-500' : 'green-500'}` : 'text-gray-400'}`}>
                        {STRENGTH_LABEL[strength]}
                      </span>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              disabled={loading}
              className={`w-full mt-8 py-3.5 rounded-xl font-extrabold text-white text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-200 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-600 to-red-700 hover:shadow-lg hover:shadow-red-200 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
                    className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                  />
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <FaArrowRight className="text-sm" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-300" />
            <span className="text-xs font-bold text-gray-400 tracking-wider">OR</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-300" />
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-red-600 font-bold hover:text-red-700 transition-colors border-b border-red-300 pb-0.5">
              Log in
            </Link>
          </p>
        </div>

        {/* Bottom shimmer line */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
      </motion.div>
    </div>
  );
}