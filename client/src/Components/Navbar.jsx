import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaGhost,
  FaSearch,
  FaBell,
  FaUserCircle,
  FaCamera,
} from "react-icons/fa";
import { IoChatbubblesSharp, IoPeopleSharp } from "react-icons/io5";

export default function Navbar() {
  const location = useLocation();

  // Navbar Links
  const navLinks = [
    {
      name: "Chats",
      path: "/chats",
      icon: <IoChatbubblesSharp />,
    },
    {
      name: "Friends",
      path: "/friends",
      icon: <IoPeopleSharp />,
    },
    {
      name: "Snap",
      path: "/camera",
      icon: <FaCamera />,
    },
    {
      name: "Search",
      path: "/search",
      icon: <FaSearch />,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <FaUserCircle />,
    },
  ];

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <motion.div
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <FaGhost className="text-3xl text-yellow-500" />
              </motion.div>

              <h1 className="text-2xl font-black bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 bg-clip-text text-transparent">
                LOOPIX
              </h1>
            </motion.div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-3">
            {navLinks.map((item) => {
              const active = location.pathname === item.path;

              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                      active
                        ? "bg-yellow-400 text-white shadow-lg"
                        : "text-gray-600 hover:bg-yellow-50 hover:text-yellow-500"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium text-sm">
                      {item.name}
                    </span>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            
            {/* Notification */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 rounded-full bg-gray-100 hover:bg-yellow-100"
            >
              <FaBell className="text-gray-700 text-lg" />

              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center">
                3
              </span>
            </motion.button>

            {/* User Avatar */}
            <Link to="/profile">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer"
              >
                <FaUserCircle className="text-3xl text-gray-700 hover:text-yellow-500 transition" />
              </motion.div>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navbar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="flex justify-around py-3">
          {navLinks.map((item) => {
            const active = location.pathname === item.path;

            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`flex flex-col items-center ${
                    active
                      ? "text-yellow-500"
                      : "text-gray-500"
                  }`}
                >
                  <span className="text-xl">
                    {item.icon}
                  </span>

                  <span className="text-[10px] mt-1">
                    {item.name}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}