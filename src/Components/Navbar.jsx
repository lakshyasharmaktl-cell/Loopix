import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBell, FaUserCircle, FaCamera, FaSignOutAlt,
  FaSignInAlt, FaUserPlus, FaChevronDown, FaSun, FaMoon
} from "react-icons/fa";
import { IoChatbubblesSharp, IoPeopleSharp } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext.jsx";

function LoopixMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="loopGradNav" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF4444" />
          <stop offset="100%" stopColor="#8B0000" />
        </linearGradient>
      </defs>
      <path d="M 68.2 69.2 A 26 26 0 1 1 68.2 30.8" fill="none" stroke="url(#loopGradNav)" strokeWidth="9" strokeLinecap="round" />
      <path d="M 61 38 A 16 16 0 1 1 61 62" fill="none" stroke="#8B0000" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      <circle cx="68.2" cy="69.2" r="5" fill="#FF3333" />
      <circle cx="68.2" cy="69.2" r="2.2" fill="#FFFFFF" />
    </svg>
  );
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("loopix_user")) || null
  );

  // ── Re-sync user state whenever localStorage changes after login ──
  useEffect(() => {
    const syncUser = () => {
      const stored = localStorage.getItem("loopix_user");
      setUser(stored ? JSON.parse(stored) : null);
    };
    window.addEventListener("storage", syncUser);
    window.addEventListener("loopix-auth-change", syncUser);
    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("loopix-auth-change", syncUser);
    };
  }, []);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  // ── Auth routes: hide navbar completely (like Instagram) ──
  const AUTH_ROUTES = ["/", "/login", "/signup", "/otp-verify"];
  const isAuthPage = AUTH_ROUTES.some(r => r === "/" ? location.pathname === "/" : location.pathname.startsWith(r));

  // Verify valid user object exists
  const hasValidUser = user && (user.id || user._id || user.email || user.name);

  if (isAuthPage || !hasValidUser) return null;

  const handleLogout = () => {
    localStorage.removeItem("loopix_user");
    localStorage.removeItem("auth_token");
    window.dispatchEvent(new Event("loopix-auth-change"));
    setUser(null);
    setDropdownOpen(false);
    navigate("/login", { replace: true });
  };

  const navLinks = [
    { name: "Chats",   path: "/chats",   icon: <IoChatbubblesSharp /> },
    { name: "Friends", path: "/friends", icon: <IoPeopleSharp /> },
    { name: "Snap",    path: "/camera",  icon: <FaCamera /> },
    { name: "Profile", path: "/profile", icon: <FaUserCircle /> },
  ];

  const navStyle = {
    position: "sticky", top: 0, zIndex: 50,
    background: isDark ? "rgba(15, 23, 42, 0.88)" : "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(20px)",
    borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.05)",
    boxShadow: isDark ? "0 4px 30px rgba(0, 0, 0, 0.3)" : "0 4px 30px rgba(0, 0, 0, 0.02)",
    fontFamily: "'Inter','Segoe UI',sans-serif",
    transition: "background 0.3s ease, border-color 0.3s ease"
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .nav-link-item { transition: all 0.2s ease; }
        .nav-link-item:hover {
          background: ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.03)'} !important;
          color: ${isDark ? '#f8fafc' : '#111827'} !important;
        }
        .social-btn:hover { background: ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'} !important; }
        .dropdown-item:hover {
          background: ${isDark ? 'rgba(220, 38, 38, 0.15)' : 'rgba(220, 38, 38, 0.05)'} !important;
          color: #dc2626 !important;
        }
        .mobile-nav-item:hover { opacity: 0.85; }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
      `}</style>

      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={navStyle}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

            {/* Logo */}
            <Link to="/" style={{ textDecoration: "none" }}>
              <motion.div whileHover={{ scale: 1.05 }} style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" }}>
                <motion.div animate={{ rotate: [0, 6, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                  <LoopixMark size={34} />
                </motion.div>
                <span style={{
                  fontSize: "1.375rem", fontWeight: "900", letterSpacing: "3px",
                  background: isDark
                    ? "linear-gradient(90deg, #ffffff 0%, #ef4444 60%, #dc2626 100%)"
                    : "linear-gradient(90deg, #111827 0%, #dc2626 60%, #991b1b 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                }}>LOOPIX</span>
              </motion.div>
            </Link>

            {/* Desktop Nav */}
            {user && (
              <div style={{ display: "none", alignItems: "center", gap: "0.25rem" }} className="desktop-nav">
                {navLinks.map((item) => {
                  const active = location.pathname === item.path;
                  return (
                    <Link key={item.path} to={item.path} style={{ textDecoration: "none" }}>
                      <motion.div
                        whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}
                        className="nav-link-item"
                        style={{
                          display: "flex", alignItems: "center", gap: "0.4rem",
                          padding: "0.5rem 0.875rem", borderRadius: "10px",
                          background: active
                            ? (isDark ? "rgba(220, 38, 38, 0.15)" : "rgba(220, 38, 38, 0.05)")
                            : "transparent",
                          border: active ? "1px solid rgba(220, 38, 38, 0.25)" : "1px solid transparent",
                          color: active ? "#ef4444" : (isDark ? "#94a3b8" : "#4b5563"),
                          transition: "all 0.2s ease",
                        }}
                      >
                        <span style={{ fontSize: "0.9rem" }}>{item.icon}</span>
                        <span style={{ fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.5px" }}>{item.name}</span>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Right Side */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              {/* Theme Toggle Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={toggleTheme}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                style={{
                  width: "36px", height: "36px",
                  borderRadius: "10px",
                  border: isDark ? "1px solid #334155" : "1px solid #e5e7eb",
                  background: isDark ? "#1e293b" : "#f3f4f6",
                  color: isDark ? "#fbbf24" : "#4b5563",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1rem",
                  transition: "all 0.2s ease"
                }}
              >
                {isDark ? <FaSun style={{ color: "#fbbf24" }} /> : <FaMoon style={{ color: "#4b5563" }} />}
              </motion.button>

              {user ? (
                <>
                  {/* Avatar dropdown */}
                  <div style={{ position: "relative" }}>
                    <motion.div
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setDropdownOpen(o => !o)}
                      style={{
                        display: "flex", alignItems: "center", gap: "0.5rem",
                        padding: "0.4rem 0.75rem", borderRadius: "10px",
                        border: isDark ? "1px solid #334155" : "1px solid #e5e7eb",
                        background: isDark ? "#1e293b" : "#f9fafb",
                        cursor: "pointer", color: isDark ? "#f8fafc" : "#111827",
                      }}
                    >
                      <div style={{
                        width: "26px", height: "26px", borderRadius: "50%",
                        background: "linear-gradient(135deg,#dc2626,#991b1b)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.7rem", fontWeight: "800", color: "#fff",
                      }}>
                        {(user?.name || user?.username || "U").charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: "0.8rem", fontWeight: "600", color: isDark ? "#cbd5e1" : "#374151" }}>
                        {user?.name || user?.username || "You"}
                      </span>
                      <motion.span animate={{ rotate: dropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ color: "#9ca3af" }}>
                        <FaChevronDown style={{ fontSize: "0.65rem" }} />
                      </motion.span>
                    </motion.div>

                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          style={{
                            position: "absolute", top: "calc(100% + 8px)", right: 0,
                            minWidth: "190px",
                            background: isDark ? "#1e293b" : "#ffffff", backdropFilter: "blur(20px)",
                            border: isDark ? "1px solid #334155" : "1px solid #e5e7eb", borderRadius: "14px",
                            boxShadow: isDark ? "0 20px 40px rgba(0,0,0,0.5)" : "0 20px 40px rgba(0,0,0,0.06)",
                            overflow: "hidden", zIndex: 100,
                          }}
                        >
                          <div style={{ padding: "0.6rem 0.85rem", borderBottom: isDark ? "1px solid #334155" : "1px solid #f3f4f6" }}>
                            <p style={{ fontSize: "0.7rem", color: isDark ? "#94a3b8" : "#9ca3af", fontWeight: "600" }}>Signed in as</p>
                            <p style={{ fontSize: "0.8rem", color: isDark ? "#f8fafc" : "#111827", fontWeight: "700", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email || user?.name}</p>
                          </div>
                          
                          <Link to="/profile" onClick={() => setDropdownOpen(false)} style={{ textDecoration: "none" }}>
                            <div className="dropdown-item" style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.75rem 1rem", color: isDark ? "#cbd5e1" : "#4b5563", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer", transition: "all 0.15s" }}>
                              <FaUserCircle style={{ fontSize: "0.9rem" }} /> Profile
                            </div>
                          </Link>

                          {/* Quick theme toggle in menu */}
                          <div
                            onClick={() => { toggleTheme(); }}
                            className="dropdown-item"
                            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", color: isDark ? "#cbd5e1" : "#4b5563", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer", transition: "all 0.15s" }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                              {isDark ? <FaSun style={{ color: "#fbbf24", fontSize: "0.9rem" }} /> : <FaMoon style={{ color: "#6366f1", fontSize: "0.9rem" }} />}
                              <span>{isDark ? "Light Theme" : "Dark Theme"}</span>
                            </div>
                            <span style={{ fontSize: "0.65rem", padding: "2px 6px", borderRadius: "6px", background: isDark ? "#334155" : "#e5e7eb", color: isDark ? "#94a3b8" : "#6b7280" }}>
                              {isDark ? "Dark" : "Light"}
                            </span>
                          </div>

                          <div onClick={handleLogout} className="dropdown-item" style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.75rem 1rem", color: "#dc2626", fontSize: "0.8rem", fontWeight: "700", cursor: "pointer", transition: "all 0.15s", borderTop: isDark ? "1px solid #334155" : "1px solid #f3f4f6" }}>
                            <FaSignOutAlt style={{ fontSize: "0.85rem" }} /> Logout
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Link to="/login" style={{ textDecoration: "none" }}>
                    <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}
                      style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", borderRadius: "10px", border: isDark ? "1px solid #475569" : "1px solid #d1d5db", color: isDark ? "#cbd5e1" : "#4b5563", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer" }}>
                      <FaSignInAlt style={{ fontSize: "0.8rem" }} /> Login
                    </motion.div>
                  </Link>
                  <Link to="/signup" style={{ textDecoration: "none" }}>
                    <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}
                      style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", borderRadius: "10px", background: "linear-gradient(135deg,#dc2626,#b91c1c)", color: "#fff", fontSize: "0.8rem", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 15px rgba(220,38,38,0.2)" }}>
                      <FaUserPlus style={{ fontSize: "0.8rem" }} /> Sign Up
                    </motion.div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(220,38,38,0.15), transparent)" }} />
      </motion.nav>

      {/* Mobile Bottom Nav */}
      {user && (
        <div className="mobile-bottom-nav" style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
          background: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderTop: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.05)",
          fontFamily: "'Inter','Segoe UI',sans-serif",
          transition: "background 0.3s ease"
        }}>
          <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(220,38,38,0.15), transparent)" }} />
          <div style={{ display: "flex", justifyContent: "space-around", padding: "0.5rem 0 0.75rem" }}>
            {navLinks.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} style={{ textDecoration: "none" }}>
                  <motion.div whileTap={{ scale: 0.88 }} className="mobile-nav-item" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem", position: "relative" }}>
                    {active && (
                      <motion.div layoutId="mobileActiveBar"
                        style={{ position: "absolute", top: "-8px", width: "20px", height: "2px", borderRadius: "4px", background: "linear-gradient(90deg, #dc2626, #ef4444)" }} />
                    )}
                    <span style={{ fontSize: "1.2rem", color: active ? "#dc2626" : (isDark ? "#64748b" : "#9ca3af"), transition: "color 0.2s" }}>{item.icon}</span>
                    <span style={{ fontSize: "0.6rem", fontWeight: "700", letterSpacing: "0.5px", color: active ? "#dc2626" : (isDark ? "#64748b" : "#9ca3af"), transition: "color 0.2s" }}>{item.name}</span>
                  </motion.div>
                </Link>
              );
            })}
            <motion.div whileTap={{ scale: 0.88 }} onClick={handleLogout} className="mobile-nav-item" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}>
              <span style={{ fontSize: "1.2rem", color: "#dc2626" }}><FaSignOutAlt /></span>
              <span style={{ fontSize: "0.6rem", fontWeight: "700", letterSpacing: "0.5px", color: "#dc2626" }}>Logout</span>
            </motion.div>
          </div>
        </div>
      )}

      <style>{`
        @media(min-width:768px){
          .desktop-nav{display:flex !important;}
          .mobile-bottom-nav{display:none !important;}
        }
      `}</style>
    </>
  );
}