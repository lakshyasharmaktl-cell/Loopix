import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBell, FaUserCircle, FaCamera, FaSignOutAlt,
  FaSignInAlt, FaUserPlus, FaChevronDown,
} from "react-icons/fa";
import { IoChatbubblesSharp, IoPeopleSharp } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";

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

  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("loopix_user")) || null
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("loopix_user");
    localStorage.removeItem("auth_token");
    setUser(null);
    setDropdownOpen(false);
    navigate("/login");
  };

  const navLinks = [
    { name: "Chats",   path: "/chats",   icon: <IoChatbubblesSharp /> },
    { name: "Friends", path: "/friends", icon: <IoPeopleSharp /> },
    { name: "Snap",    path: "/camera",  icon: <FaCamera /> },
    // { name: "Search",  path: "/search",  icon: <FiSearch /> },
    { name: "Profile", path: "/profile", icon: <FaUserCircle /> },
  ];

  const navStyle = {
    position: "sticky", top: 0, zIndex: 50,
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.02)",
    fontFamily: "'Inter','Segoe UI',sans-serif",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .nav-link-item { transition: all 0.2s ease; }
        .nav-link-item:hover { background: rgba(0, 0, 0, 0.03) !important; color: #111827 !important; }
        .social-btn:hover { background: rgba(0, 0, 0, 0.04) !important; }
        .dropdown-item:hover { background: rgba(220, 38, 38, 0.05) !important; color: #dc2626 !important; }
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
                  background: "linear-gradient(90deg, #111827 0%, #dc2626 60%, #991b1b 100%)",
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
                          background: active ? "rgba(220, 38, 38, 0.05)" : "transparent",
                          border: active ? "1px solid rgba(220, 38, 38, 0.15)" : "1px solid transparent",
                          color: active ? "#dc2626" : "#4b5563",
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
              {user ? (
                <>
                  {/* Bell */}
                  {/* <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    style={{
                      position: "relative", padding: "0.5rem",
                      background: "#f3f4f6", border: "1px solid #e5e7eb",
                      borderRadius: "50%", color: "#4b5563", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <FaBell style={{ fontSize: "0.9rem" }} />
                    <span style={{
                      position: "absolute", top: "-3px", right: "-3px",
                      width: "16px", height: "16px", background: "#dc2626",
                      borderRadius: "50%", color: "#fff", fontSize: "0.55rem",
                      fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center",
                      animation: "pulse 1.5s infinite",
                    }}>3</span>
                  </motion.button> */}

                  {/* Avatar dropdown */}
                  <div style={{ position: "relative" }}>
                    <motion.div
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setDropdownOpen(o => !o)}
                      style={{
                        display: "flex", alignItems: "center", gap: "0.5rem",
                        padding: "0.4rem 0.75rem", borderRadius: "10px",
                        border: "1px solid #e5e7eb",
                        background: "#f9fafb",
                        cursor: "pointer", color: "#111827",
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
                      <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "#374151" }}>
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
                            minWidth: "180px",
                            background: "#ffffff", backdropFilter: "blur(20px)",
                            border: "1px solid #e5e7eb", borderRadius: "14px",
                            boxShadow: "0 20px 40px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.01)", overflow: "hidden", zIndex: 100,
                          }}
                        >
                          <div style={{ padding: "0.5rem 0.75rem", borderBottom: "1px solid #f3f4f6" }}>
                            <p style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: "600" }}>Signed in as</p>
                            <p style={{ fontSize: "0.8rem", color: "#111827", fontWeight: "700", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email || user?.name}</p>
                          </div>
                          <Link to="/profile" onClick={() => setDropdownOpen(false)} style={{ textDecoration: "none" }}>
                            <div className="dropdown-item" style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.75rem 1rem", color: "#4b5563", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer", transition: "all 0.15s" }}>
                              <FaUserCircle style={{ fontSize: "0.9rem" }} /> Profile
                            </div>
                          </Link>
                          <div onClick={handleLogout} className="dropdown-item" style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.75rem 1rem", color: "#dc2626", fontSize: "0.8rem", fontWeight: "700", cursor: "pointer", transition: "all 0.15s", borderTop: "1px solid #f3f4f6" }}>
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
                      style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", borderRadius: "10px", border: "1px solid #d1d5db", color: "#4b5563", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer" }}>
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
          background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(0, 0, 0, 0.05)",
          fontFamily: "'Inter','Segoe UI',sans-serif",
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
                    <span style={{ fontSize: "1.2rem", color: active ? "#dc2626" : "#9ca3af", transition: "color 0.2s" }}>{item.icon}</span>
                    <span style={{ fontSize: "0.6rem", fontWeight: "700", letterSpacing: "0.5px", color: active ? "#dc2626" : "#9ca3af", transition: "color 0.2s" }}>{item.name}</span>
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