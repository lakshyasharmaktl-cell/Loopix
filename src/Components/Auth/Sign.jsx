import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaGoogle,
  FaGithub,
  FaSun,
  FaMoon,
} from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import BASE_URL from "../../global_url.js";
import { useTheme } from "../../context/ThemeContext.jsx";

function LoopixMark({ size = 52 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lmGSignPro" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF5555" />
          <stop offset="100%" stopColor="#AA0000" />
        </linearGradient>
      </defs>
      <path d="M 68.2 69.2 A 26 26 0 1 1 68.2 30.8" fill="none" stroke="url(#lmGSignPro)" strokeWidth="10" strokeLinecap="round" />
      <path d="M 61 38 A 16 16 0 1 1 61 62" fill="none" stroke="#CC2222" strokeWidth="3.5" strokeLinecap="round" opacity="0.6" />
      <circle cx="68.2" cy="69.2" r="5.5" fill="#FF4444" />
      <circle cx="68.2" cy="69.2" r="2.5" fill="#FFFFFF" />
    </svg>
  );
}

export default function Signup() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "Male",
    password: "",
    confirmPassword: "",
  });

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.gender) {
      setError("Please fill in all fields");
      toast.warning("All fields are required to join Loopix");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let response = null;
      let lastErr = null;

      // Try candidates to support local and remote backends
      const endpoints = [
        "http://localhost:2345/register",
        `${BASE_URL}/register`,
        "http://127.0.0.1:2345/register",
      ];

      for (const ep of endpoints) {
        try {
          response = await axios.post(ep, formData, { timeout: 10000 });
          if (response?.data && response.data.status !== false) break;
        } catch (err) {
          lastErr = err;
          // If server responded with duplicate email / account exists message, throw it to inform user
          if (err.response?.data?.msg && err.response.status === 400 && err.response.data.msg.includes("already exists")) {
            throw err;
          }
        }
      }

      if (!response && lastErr) {
        throw lastErr;
      }

      const targetEmail = formData.email.trim();
      const targetName = formData.name.trim();
      const targetId = response?.data?.id || response?.data?.userId || response?.data?._id || "";

      localStorage.setItem("otp_email", targetEmail);
      localStorage.setItem("temp_user_name", targetName);
      localStorage.removeItem("temp_otp");

      setSuccess("Account registered! Redirecting to verification...");
      toast.success(response?.data?.msg || "OTP sent to your email 📧");

      setTimeout(() => {
        navigate(`/otp-verify/${targetId}`, {
          state: {
            email: targetEmail,
            name: targetName,
            id: targetId,
          },
        });
      }, 800);
    } catch (err) {
      const msg = err.response?.data?.msg || err.message || "Server error. Try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = () => {
    window.location.href = `${BASE_URL}/auth/google`;
  };

  const labelStyle = {
    display: "block",
    marginBottom: "0.4rem",
    fontSize: "0.65rem",
    fontWeight: "700",
    color: isDark ? "#a1a1aa" : "#4b5563",
    letterSpacing: "2px",
  };

  const inputStyle = {
    width: "100%",
    paddingTop: "0.75rem",
    paddingBottom: "0.75rem",
    paddingLeft: "2.5rem",
    paddingRight: "2.5rem",
    background: isDark ? "#121212" : "#f9fafb",
    border: isDark ? "1px solid #27272a" : "1px solid #d1d5db",
    borderRadius: "12px",
    color: isDark ? "#f4f4f5" : "#111827",
    fontSize: "0.875rem",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
  };

  const socialBtnStyle = {
    flex: 1,
    padding: "0.65rem",
    borderRadius: "12px",
    border: isDark ? "1px solid #27272a" : "1px solid #d1d5db",
    background: isDark ? "#121212" : "#ffffff",
    color: isDark ? "#f4f4f5" : "#374151",
    fontSize: "0.8rem",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: isDark
          ? "#000000"
          : "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 50%, #e5e7eb 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        position: "relative",
        overflow: "hidden",
        padding: "2.5rem 1rem",
        transition: "background 0.3s ease",
      }}
    >
      {/* Floating Theme Switcher */}
      <button
        onClick={toggleTheme}
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 20,
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: isDark ? "1px solid #27272a" : "1px solid #e5e7eb",
          background: isDark ? "#09090b" : "#ffffff",
          color: isDark ? "#fbbf24" : "#4b5563",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.1rem",
          boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.5)" : "0 4px 12px rgba(0,0,0,0.1)",
          transition: "all 0.2s ease",
        }}
      >
        {isDark ? <FaSun /> : <FaMoon />}
      </button>

      {/* Ambient background glows */}
      {!isDark && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: "500px",
              height: "500px",
              background: "radial-gradient(circle, rgba(220,38,38,0.08) 0%, transparent 70%)",
              transform: "translate(30%, -30%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              width: "400px",
              height: "400px",
              background: "radial-gradient(circle, rgba(220,38,38,0.05) 0%, transparent 70%)",
              transform: "translate(-30%, 30%)",
              pointerEvents: "none",
            }}
          />
        </>
      )}

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "480px",
          background: isDark ? "#09090b" : "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(24px)",
          border: isDark ? "1px solid #27272a" : "1px solid rgba(0, 0, 0, 0.06)",
          borderRadius: "24px",
          boxShadow: isDark
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.9)"
            : "0 25px 50px -12px rgba(0, 0, 0, 0.08)",
          overflow: "hidden",
        }}
      >
        {/* Top brand line */}
        {!isDark && (
          <div style={{ height: "3px", background: "linear-gradient(90deg, #ff8a8a, #dc2626, #ff8a8a)" }} />
        )}

        <div style={{ padding: "2.5rem 2rem" }}>
          {/* Logo & Header */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.75rem" }}>
            <motion.div
              animate={{ rotate: [0, 7, -7, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ marginBottom: "0.75rem" }}
            >
              <LoopixMark size={52} />
            </motion.div>
            <span
              className="loopix-brand-title"
              style={{
                display: "inline-block",
                fontSize: "1.875rem",
                fontWeight: "900",
                letterSpacing: "4px",
              }}
            >
              LOOPIX
            </span>
            <span
              style={{
                marginTop: "0.375rem",
                fontSize: "0.65rem",
                fontWeight: "700",
                color: isDark ? "#a1a1aa" : "#6b7280",
                letterSpacing: "4px",
              }}
            >
              CREATE YOUR ACCOUNT
            </span>
          </div>

          {/* Error / Success Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  marginBottom: "1.25rem",
                  padding: "0.75rem 1rem",
                  background: isDark ? "rgba(185, 28, 28, 0.2)" : "#fef2f2",
                  border: isDark ? "1px solid rgba(185, 28, 28, 0.4)" : "1px solid #fee2e2",
                  borderRadius: "12px",
                  color: isDark ? "#fca5a5" : "#b91c1c",
                  fontSize: "0.825rem",
                  fontWeight: "500",
                }}
              >
                ⚠️ {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  marginBottom: "1.25rem",
                  padding: "0.75rem 1rem",
                  background: isDark ? "rgba(21, 128, 61, 0.2)" : "#f0fdf4",
                  border: isDark ? "1px solid rgba(21, 128, 61, 0.4)" : "1px solid #dcfce7",
                  borderRadius: "12px",
                  color: isDark ? "#86efac" : "#15803d",
                  fontSize: "0.825rem",
                  fontWeight: "500",
                }}
              >
                ✅ {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              {/* Full Name */}
              <div>
                <label style={labelStyle}>FULL NAME</label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: isDark ? "#64748b" : "#9ca3af",
                      fontSize: "0.85rem",
                    }}
                  >
                    <FaUser />
                  </span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    disabled={loading}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>EMAIL ADDRESS</label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: isDark ? "#64748b" : "#9ca3af",
                      fontSize: "0.85rem",
                    }}
                  >
                    <FaEnvelope />
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    disabled={loading}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label style={labelStyle}>GENDER</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {["Male", "Female", "Other"].map((g) => {
                    const isSelected = formData.gender === g;
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, gender: g }))}
                        disabled={loading}
                        style={{
                          flex: 1,
                          padding: "0.6rem 0.5rem",
                          borderRadius: "10px",
                          border: isSelected
                            ? "1.5px solid #ef4444"
                            : isDark
                            ? "1px solid #27272a"
                            : "1px solid #d1d5db",
                          background: isSelected
                            ? isDark
                              ? "rgba(239, 68, 68, 0.15)"
                              : "#fef2f2"
                            : isDark
                            ? "#121212"
                            : "#f9fafb",
                          color: isSelected ? "#ef4444" : isDark ? "#a1a1aa" : "#4b5563",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Passwords grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                {/* Password */}
                <div>
                  <label style={labelStyle}>PASSWORD</label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: isDark ? "#64748b" : "#9ca3af",
                        fontSize: "0.8rem",
                      }}
                    >
                      <FaLock />
                    </span>
                    <input
                      type={showPass ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      disabled={loading}
                      style={{ ...inputStyle, paddingLeft: "2.2rem", paddingRight: "2.2rem" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: isDark ? "#64748b" : "#9ca3af",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                      }}
                    >
                      {showPass ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label style={labelStyle}>CONFIRM</label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: isDark ? "#64748b" : "#9ca3af",
                        fontSize: "0.8rem",
                      }}
                    >
                      <FaLock />
                    </span>
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      disabled={loading}
                      style={{ ...inputStyle, paddingLeft: "2.2rem", paddingRight: "2.2rem" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: isDark ? "#64748b" : "#9ca3af",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                      }}
                    >
                      {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              disabled={loading}
              style={{
                width: "100%",
                marginTop: "1.5rem",
                padding: "0.875rem",
                borderRadius: "12px",
                fontWeight: "800",
                color: "#fff",
                fontSize: "0.875rem",
                letterSpacing: "1px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "all 0.2s ease",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                background: loading ? "#cbd5e1" : "linear-gradient(135deg, #dc2626, #b91c1c)",
                boxShadow: loading ? "none" : "0 8px 24px rgba(220, 38, 38, 0.2)",
              }}
            >
              {loading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
                    style={{
                      display: "inline-block",
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                    }}
                  />
                  Creating account...
                </>
              ) : (
                <>
                  Sign Up <FaArrowRight style={{ fontSize: "0.8rem" }} />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.25rem 0" }}>
            <div style={{ flex: 1, height: "1px", background: isDark ? "#27272a" : "#e5e7eb" }} />
            <span style={{ fontSize: "0.65rem", fontWeight: "700", color: isDark ? "#71717a" : "#9ca3af", letterSpacing: "3px" }}>
              OR
            </span>
            <div style={{ flex: 1, height: "1px", background: isDark ? "#27272a" : "#e5e7eb" }} />
          </div>

          {/* Social */}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button type="button" onClick={googleLogin} style={socialBtnStyle}>
              <FaGoogle style={{ color: "#EA4335" }} /> Google
            </button>
            <button type="button" style={socialBtnStyle}>
              <FaGithub style={{ color: isDark ? "#f4f4f5" : "#181717" }} /> GitHub
            </button>
          </div>

          {/* Footer */}
          <p style={{ textAlign: "center", fontSize: "0.85rem", color: isDark ? "#a1a1aa" : "#4b5563", marginTop: "1.25rem" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#ef4444", fontWeight: "700", textDecoration: "none" }}>
              Log in
            </Link>
          </p>
        </div>
      </motion.div>

      <style>{`
        input::placeholder { color: ${isDark ? "#52525b" : "#9ca3af"} !important; }
        input:focus { outline: none !important; border-color: rgba(220,38,38,0.5) !important; box-shadow: 0 0 0 3px rgba(220,38,38,0.15) !important; }
      `}</style>
    </div>
  );
}

