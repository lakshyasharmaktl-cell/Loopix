import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaGoogle, FaGithub } from 'react-icons/fa';

// Loopix mark component
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

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!form.email.trim() || !form.password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Replace with your actual API endpoint
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      // Store user data and token
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      localStorage.setItem('loopix_user', JSON.stringify(data.user || { email: form.email, username: data.user?.username || 'User' }));

      setSuccess('Login successful! Redirecting...');
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/chats');
      }, 1500);

    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Demo login for testing (remove in production)
  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Demo credentials check
      if (form.email && form.password) {
        localStorage.setItem('loopix_user', JSON.stringify({ 
          email: form.email, 
          username: form.email.split('@')[0] 
        }));
        setSuccess('Demo login successful!');
        setTimeout(() => navigate('/chats'), 1000);
      } else {
        setError('Please enter email and password for demo');
      }
    } catch (err) {
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

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
              WELCOME BACK
            </span>
          </div>

          {/* Error/Success Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm font-medium"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-5">
              {/* Email field */}
              <div>
                <label className="block mb-1.5 text-xs font-bold text-gray-600 tracking-wide">
                  EMAIL ADDRESS
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    <FaEnvelope />
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full py-2.5 px-10 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-red-300"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="block mb-1.5 text-xs font-bold text-gray-600 tracking-wide">
                  PASSWORD
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    <FaLock />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full py-2.5 px-10 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-red-300"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Forgot password link */}
            <div className="text-right mt-2">
              <Link to="/forgot-password" className="text-xs text-gray-500 hover:text-red-600 transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              disabled={loading}
              className={`w-full mt-6 py-3.5 rounded-xl font-extrabold text-white text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-200 ${
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
                  Logging in...
                </>
              ) : (
                <>
                  Log in
                  <FaArrowRight className="text-sm" />
                </>
              )}
            </motion.button>
          </form>

          {/* Demo login button (optional) */}
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full mt-3 py-2.5 rounded-xl font-semibold text-gray-600 text-sm border border-gray-200 bg-white/50 hover:bg-gray-50 transition-all duration-200"
          >
            Demo Login
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-300" />
            <span className="text-xs font-bold text-gray-400 tracking-wider">OR</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-300" />
          </div>

          {/* Social login buttons */}
          <div className="flex gap-3">
            <button className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white/50 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2 text-gray-700 text-sm font-medium">
              <FaGoogle className="text-red-500" />
              Google
            </button>
            <button className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white/50 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2 text-gray-700 text-sm font-medium">
              <FaGithub className="text-gray-800" />
              GitHub
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-red-600 font-bold hover:text-red-700 transition-colors border-b border-red-300 pb-0.5">
              Sign up
            </Link>
          </p>
        </div>

        {/* Bottom shimmer line */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
      </motion.div>
    </div>
  );
}