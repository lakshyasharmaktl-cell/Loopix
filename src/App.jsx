import React, { useState, useEffect } from 'react'
import Navbar from './Components/Navbar.jsx'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sign from './Components/Auth/Sign.jsx';
import Login from './Components/Auth/Login.jsx';
import Otpsection from './Components/Otp/Otpsection.jsx';
import Chats from './Components/Chatting/Chats.jsx';
import Friends from './Components/Friends/Friends.jsx';
import Snap from './Components/Snap/Snap.jsx';
import Profile from './Components/Profile/Profile.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Helper to check if valid user authentication exists
const isAuthenticated = () => {
  try {
    const userStr = localStorage.getItem('loopix_user');
    const token = localStorage.getItem('auth_token');
    if (!userStr || !token || userStr === 'null' || userStr === 'undefined') return false;
    const user = JSON.parse(userStr);
    return !!(user && (user.id || user._id || user.email));
  } catch {
    return false;
  }
};

// ProtectedRoute: Only authenticated users can access. Redirect to /login if not logged in.
function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// PublicRoute: Only non-authenticated users can access (/login, /signup, /otp-verify).
// Redirect to /chats if already logged in.
function PublicRoute({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/chats" replace />;
  }
  return children;
}

export default function App() {
  const [, setAuthTick] = useState(0);

  useEffect(() => {
    const handleAuthChange = () => setAuthTick(t => t + 1);
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('loopix-auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('loopix-auth-change', handleAuthChange);
    };
  }, []);

  return (
    <div>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/signup" element={<PublicRoute><Sign /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/otp-verify" element={<PublicRoute><Otpsection /></PublicRoute>} />
          <Route path="/otp-verify/:id" element={<PublicRoute><Otpsection /></PublicRoute>} />

          {/* Protected Main App Routes */}
          <Route path="/chats" element={<ProtectedRoute><Chats /></ProtectedRoute>} />
          <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
          <Route path="/camera" element={<ProtectedRoute><Snap /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Root route redirect based on auth */}
          <Route
            path="/"
            element={
              isAuthenticated() ? (
                <Navigate to="/chats" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Fallback route */}
          <Route
            path="*"
            element={
              isAuthenticated() ? (
                <Navigate to="/chats" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} theme="light" />
      </BrowserRouter>
    </div>
  )
}

