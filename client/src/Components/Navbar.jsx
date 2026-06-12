import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaBell,
  FaUserCircle,
  FaCamera,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserPlus,
  FaChevronDown,
} from "react-icons/fa";
import { IoChatbubblesSharp, IoPeopleSharp } from "react-icons/io5";

// Loopix SVG loop mark inline
function LoopixMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="loopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF4444" />
          <stop offset="100%" stopColor="#8B0000" />
        </linearGradient>
      </defs>
      <path d="M 68.2 69.2 A 26 26 0 1 1 68.2 30.8" fill="none" stroke="url(#loopGrad)" strokeWidth="9" strokeLinecap="round" />
      <path d="M 61 38 A 16 16 0 1 1 61 62" fill="none" stroke="#8B0000" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      <circle cx="68.2" cy="69.2" r="5" fill="#FF3333" />
      <circle cx="68.2" cy="69.2" r="2.2" fill="#0D0000" />
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
    setUser(null);
    setDropdownOpen(false);
    navigate("/login");
  };

  const navLinks = [
    { name: "Chats",   path: "/chats",   icon: <IoChatbubblesSharp /> },
    { name: "Friends", path: "/friends", icon: <IoPeopleSharp /> },
    { name: "Snap",    path: "/camera",  icon: <FaCamera /> },
    { name: "Search",  path: "/search",  icon: <FaSearch /> },
    { name: "Profile", path: "/profile", icon: <FaUserCircle /> },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-16 flex items-center justify-between">

            {/* Logo */}
            <Link to="/" className="no-underline">
              <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2.5 cursor-pointer">
                <motion.div
                  animate={{ rotate: [0, 6, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <LoopixMark size={36} />
                </motion.div>
                <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-gray-900 via-red-700 to-red-600 bg-clip-text text-transparent">
                  LOOPIX
                </span>
              </motion.div>
            </Link>

            {/* Desktop Nav Links (only when logged in) */}
            {user && (
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((item) => {
                  const active = location.pathname === item.path;
                  return (
                    <Link key={item.path} to={item.path} className="no-underline">
                      <motion.div
                        whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}
                        className={`
                          flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all duration-200
                          ${active 
                            ? 'bg-red-50 border border-red-200 text-red-600 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-transparent'
                          }
                        `}
                      >
                        <span className="text-base">{item.icon}</span>
                        <span className="font-semibold text-xs tracking-wide">{item.name}</span>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Right Side */}
            <div className="flex items-center gap-3 sm:gap-4">

              {user ? (
                <>
                  {/* Notification Bell */}
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="relative p-2 rounded-full bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                  >
                    <FaBell className="text-base" />
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-600 rounded-full text-white text-[9px] font-bold flex items-center justify-center shadow-md"
                    >
                      3
                    </motion.span>
                  </motion.button>

                  {/* User Dropdown */}
                  <div className="relative">
                    <motion.div
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setDropdownOpen((o) => !o)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 bg-white/50 cursor-pointer text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FaUserCircle className="text-xl" />
                      <span className="text-sm font-semibold text-gray-800">
                        {user.username || "You"}
                      </span>
                      <motion.span
                        animate={{ rotate: dropdownOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-gray-400"
                      >
                        <FaChevronDown className="text-xs" />
                      </motion.span>
                    </motion.div>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full right-0 mt-2.5 min-w-[160px] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50"
                        >
                          <Link to="/profile" onClick={() => setDropdownOpen(false)} className="no-underline">
                            <div className="flex items-center gap-2.5 px-4 py-3 text-gray-700 text-sm font-medium cursor-pointer border-b border-gray-100 transition-colors hover:bg-red-50 hover:text-red-600">
                              <FaUserCircle className="text-base" />
                              Profile
                            </div>
                          </Link>
                          <div
                            onClick={handleLogout}
                            className="flex items-center gap-2.5 px-4 py-3 text-red-600 text-sm font-semibold cursor-pointer transition-colors hover:bg-red-50"
                          >
                            <FaSignOutAlt className="text-sm" />
                            Logout
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                /* Guest buttons */
                <div className="flex items-center gap-2 sm:gap-3">
                  <Link to="/login" className="no-underline">
                    <motion.div
                      whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-semibold cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-all"
                    >
                      <FaSignInAlt className="text-sm" />
                      Login
                    </motion.div>
                  </Link>

                  <Link to="/signup" className="no-underline">
                    <motion.div
                      whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-bold cursor-pointer shadow-md hover:shadow-lg transition-all"
                    >
                      <FaUserPlus className="text-sm" />
                      Sign Up
                    </motion.div>
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-red-300 to-transparent opacity-50" />
      </motion.nav>

      {/* Mobile Bottom Navbar (only when logged in) */}
      {user && (
        <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg z-50">
          <div className="h-px bg-gradient-to-r from-transparent via-red-400 to-transparent opacity-60" />
          <div className="flex justify-around py-2 pb-3">
            {navLinks.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} className="no-underline">
                  <motion.div
                    whileTap={{ scale: 0.88 }}
                    className="flex flex-col items-center gap-1 relative"
                  >
                    {active && (
                      <motion.div
                        layoutId="mobileActiveIndicator"
                        className="absolute -top-2 w-6 h-0.5 rounded-full bg-red-500 shadow-md"
                      />
                    )}
                    <span className={`text-xl ${active ? 'text-red-600' : 'text-gray-400'}`}>{item.icon}</span>
                    <span className={`text-[10px] font-semibold tracking-wide ${active ? 'text-red-600' : 'text-gray-500'}`}>{item.name}</span>
                  </motion.div>
                </Link>
              );
            })}

            {/* Mobile logout */}
            <motion.div
              whileTap={{ scale: 0.88 }}
              onClick={handleLogout}
              className="flex flex-col items-center gap-1 cursor-pointer"
            >
              <span className="text-xl text-red-500"><FaSignOutAlt /></span>
              <span className="text-[10px] font-semibold tracking-wide text-red-500">Logout</span>
            </motion.div>
          </div>
        </div>
      )}
    </>
  );
}