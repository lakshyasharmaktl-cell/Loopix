import React, { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import BASE_URL from "../../global_url.js";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.gender) {
      toast.warning("All fields are required to join the club 🎉");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/register`, formData);
      toast.success(response?.data?.msg || "OTP sent to your email");
      navigate(`/otp-verify/${response?.data?.id}`, {
        state: { email: response?.data?.email }
      });
    } catch (err) {
      toast.error(err.response?.data?.msg || "Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const googleLoginApi = () => {
    try {
      window.location.href = `${BASE_URL}/auth/google`;
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 50%, #e5e7eb 100%)",
      padding: "2rem 1rem",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      {/* Background blobs */}
      <div style={{
        position: "fixed", top: "-100px", right: "-100px",
        width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(220,38,38,0.06) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none"
      }} />
      <div style={{
        position: "fixed", bottom: "-100px", left: "-100px",
        width: "350px", height: "350px",
        background: "radial-gradient(circle, rgba(220,38,38,0.04) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none"
      }} />

      <div style={{
        display: "flex",
        width: "100%",
        maxWidth: "1000px",
        background: "rgba(255, 255, 255, 0.8)",
        border: "1px solid rgba(0, 0, 0, 0.06)",
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02)",
        backdropFilter: "blur(20px)",
      }}>

        {/* Left Panel */}
        <div style={{
          display: "none",
          width: "45%",
          background: "linear-gradient(145deg, #fef2f2, #fee2e2)",
          padding: "3rem",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          borderRight: "1px solid rgba(0, 0, 0, 0.05)",
          position: "relative",
          overflow: "hidden",
        }} className="signup-left-panel">
          {/* Animated rings */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            width: "300px", height: "300px",
            border: "1px solid rgba(220,38,38,0.06)",
            borderRadius: "50%", animation: "spin 20s linear infinite",
          }} />
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            width: "220px", height: "220px",
            border: "1px solid rgba(220,38,38,0.04)",
            borderRadius: "50%", animation: "spin 15s linear infinite reverse",
          }} />

          <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
            <div style={{ marginBottom: "2rem" }}>
              <svg width="80" height="80" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="sgG" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF5555" />
                    <stop offset="100%" stopColor="#8B0000" />
                  </linearGradient>
                </defs>
                <path d="M 68.2 69.2 A 26 26 0 1 1 68.2 30.8" fill="none" stroke="url(#sgG)" strokeWidth="10" strokeLinecap="round" />
                <path d="M 61 38 A 16 16 0 1 1 61 62" fill="none" stroke="#CC2222" strokeWidth="3.5" strokeLinecap="round" opacity="0.6" />
                <circle cx="68.2" cy="69.2" r="5.5" fill="#FF4444" />
                <circle cx="68.2" cy="69.2" r="2.5" fill="#FFFFFF" />
              </svg>
            </div>
            <h2 style={{ color: "#111827", fontSize: "2rem", fontWeight: "900", letterSpacing: "4px", marginBottom: "0.5rem" }}>LOOPIX</h2>
            <p style={{ color: "#6b7280", fontSize: "0.85rem", letterSpacing: "2px", marginBottom: "2.5rem" }}>CONNECT · SNAP · SHARE</p>

            <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { icon: "👤", text: "Create your unique profile" },
                { icon: "💬", text: "Chat with friends instantly" },
                { icon: "📸", text: "Send disappearing snaps" },
                { icon: "🔒", text: "Private & secure experience" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{
                    width: "36px", height: "36px", background: "rgba(220,38,38,0.05)",
                    border: "1px solid rgba(220,38,38,0.15)", borderRadius: "10px",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem"
                  }}>{item.icon}</div>
                  <span style={{ color: "#4b5563", fontSize: "0.875rem", fontWeight: "500" }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div style={{
          flex: 1,
          padding: "2.5rem 2rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.75rem" }}>
            <svg width="36" height="36" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="sgLogo" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF5555" />
                  <stop offset="100%" stopColor="#8B0000" />
                </linearGradient>
              </defs>
              <path d="M 68.2 69.2 A 26 26 0 1 1 68.2 30.8" fill="none" stroke="url(#sgLogo)" strokeWidth="10" strokeLinecap="round" />
              <path d="M 61 38 A 16 16 0 1 1 61 62" fill="none" stroke="#CC2222" strokeWidth="3.5" strokeLinecap="round" opacity="0.6" />
              <circle cx="68.2" cy="69.2" r="5.5" fill="#FF4444" />
              <circle cx="68.2" cy="69.2" r="2.5" fill="#FFFFFF" />
            </svg>
            <span style={{
              fontSize: "1.5rem", fontWeight: "900", letterSpacing: "3px",
              background: "linear-gradient(90deg, #111827, #dc2626)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>LOOPIX</span>
          </div>

          <h2 style={{ color: "#111827", fontSize: "1.75rem", fontWeight: "800", marginBottom: "0.25rem" }}>Create Account</h2>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "1.75rem" }}>Join the community and start creating ✨</p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* Name */}
            <div>
              <label style={{ display: "block", color: "#4b5563", fontSize: "0.7rem", fontWeight: "700", letterSpacing: "1.5px", marginBottom: "0.4rem" }}>USERNAME</label>
              <div style={{ position: "relative" }}>
                <User style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", width: "16px", height: "16px" }} />
                <input
                  type="text" name="name" value={formData.name} onChange={handleChange}
                  placeholder="John Doe"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: "block", color: "#4b5563", fontSize: "0.7rem", fontWeight: "700", letterSpacing: "1.5px", marginBottom: "0.4rem" }}>EMAIL</label>
              <div style={{ position: "relative" }}>
                <Mail style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", width: "16px", height: "16px" }} />
                <input
                  type="email" name="email" value={formData.email} onChange={handleChange}
                  placeholder="you@example.com"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label style={{ display: "block", color: "#4b5563", fontSize: "0.7rem", fontWeight: "700", letterSpacing: "1.5px", marginBottom: "0.6rem" }}>GENDER</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {["Male", "Female", "Other"].map((g) => (
                  <label key={g} style={{ flex: 1, cursor: "pointer" }}>
                    <input type="radio" name="gender" value={g} onChange={handleChange} style={{ display: "none" }} />
                    <div style={{
                      padding: "0.6rem",
                      textAlign: "center",
                      background: formData.gender === g ? "rgba(220,38,38,0.1)" : "#f9fafb",
                      border: formData.gender === g ? "1px solid rgba(220,38,38,0.6)" : "1px solid #d1d5db",
                      borderRadius: "10px",
                      color: formData.gender === g ? "#dc2626" : "#4b5563",
                      fontSize: "0.8rem", fontWeight: "600",
                      transition: "all 0.2s ease",
                    }}>{g}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Passwords */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={{ display: "block", color: "#4b5563", fontSize: "0.7rem", fontWeight: "700", letterSpacing: "1.5px", marginBottom: "0.4rem" }}>PASSWORD</label>
                <div style={{ position: "relative" }}>
                  <Lock style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", width: "16px", height: "16px" }} />
                  <input
                    type={showPass ? "text" : "password"} name="password"
                    value={formData.password} onChange={handleChange}
                    placeholder="••••••••"
                    style={inputStyle}
                  />
                  <div onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#9ca3af" }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </div>
                </div>
              </div>
              <div>
                <label style={{ display: "block", color: "#4b5563", fontSize: "0.7rem", fontWeight: "700", letterSpacing: "1.5px", marginBottom: "0.4rem" }}>CONFIRM</label>
                <div style={{ position: "relative" }}>
                  <Lock style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", width: "16px", height: "16px" }} />
                  <input
                    type={showConfirmPass ? "text" : "password"} name="confirmPassword"
                    value={formData.confirmPassword} onChange={handleChange}
                    placeholder="••••••••"
                    style={inputStyle}
                  />
                  <div onClick={() => setShowConfirmPass(!showConfirmPass)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#9ca3af" }}>
                    {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              style={{
                width: "100%", padding: "0.875rem",
                background: loading ? "#cbd5e1" : "linear-gradient(135deg, #dc2626, #b91c1c)",
                border: "none", borderRadius: "12px",
                color: "#fff", fontWeight: "800", fontSize: "0.9rem", letterSpacing: "1px",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                transition: "all 0.2s ease",
                boxShadow: loading ? "none" : "0 8px 24px rgba(220,38,38,0.2)",
                marginTop: "0.25rem",
              }}
            >
              {loading ? (
                <><div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.75s linear infinite" }} /> Creating account...</>
              ) : (
                <>Sign Up <ArrowRight size={16} /></>
              )}
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
              <span style={{ color: "#9ca3af", fontSize: "0.7rem", fontWeight: "700", letterSpacing: "2px" }}>OR</span>
              <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
            </div>

            {/* Social */}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="button" onClick={googleLoginApi} style={socialBtnStyle}>
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"/><path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.777l-4.028 3.116C3.196 21.296 7.265 24 12 24c2.933 0 5.735-1.043 7.834-3L16.04 18.013Z"/><path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/><path fill="#FBBC05" d="M5.277 14.314A7.117 7.117 0 0 1 4.909 12c0-.809.138-1.582.357-2.314L1.24 6.571A11.932 11.932 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.021Z"/></svg>
                Google
              </button>
              <button type="button" style={socialBtnStyle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#181717"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                GitHub
              </button>
            </div>

            <p style={{ textAlign: "center", color: "#4b5563", fontSize: "0.85rem", marginTop: "0.25rem" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#dc2626", fontWeight: "700", textDecoration: "none" }}>Log in</Link>
            </p>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #9ca3af; }
        input:focus { outline: none; border-color: rgba(220,38,38,0.5) !important; box-shadow: 0 0 0 3px rgba(220,38,38,0.15); }
        @media(min-width: 768px) { .signup-left-panel { display: flex !important; } }
      `}</style>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  paddingLeft: "2.5rem",
  paddingRight: "2.5rem",
  paddingTop: "0.7rem",
  paddingBottom: "0.7rem",
  background: "#f9fafb",
  border: "1px solid #d1d5db",
  borderRadius: "12px",
  color: "#111827",
  fontSize: "0.875rem",
  transition: "all 0.2s ease",
  boxSizing: "border-box",
};

const socialBtnStyle = {
  flex: 1,
  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
  padding: "0.65rem",
  background: "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: "12px",
  color: "#374151",
  fontSize: "0.8rem", fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s ease",
};