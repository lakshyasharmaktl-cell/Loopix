import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaCheckCircle, FaTimesCircle, FaRedoAlt, FaArrowLeft, FaKey } from 'react-icons/fa';

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

export default function OtpSection() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Get email from location state or localStorage
  useEffect(() => {
    const userEmail = location.state?.email || localStorage.getItem('otp_email');
    if (userEmail) {
      setEmail(userEmail);
    } else {
      // If no email, redirect to login
      setError('Session expired. Please login again.');
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [location, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    // Allow only numbers
    if (value && !/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only last character
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle key press for backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste event
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const otpArray = pastedData.split('');
      const newOtp = [...otp];
      for (let i = 0; i < Math.min(otpArray.length, 6); i++) {
        newOtp[i] = otpArray[i];
      }
      setOtp(newOtp);
      // Focus last filled input
      const lastIndex = Math.min(otpArray.length, 6) - 1;
      if (lastIndex >= 0) {
        inputRefs.current[lastIndex]?.focus();
      }
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp: otpValue,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid OTP. Please try again.');
      }

      // Store user data and token
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('loopix_user', JSON.stringify(data.user));
      }
      
      // Clear OTP email from storage
      localStorage.removeItem('otp_email');
      
      setSuccess('Verification successful! Redirecting...');
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/chats');
      }, 1500);

    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend && timeLeft > 0) {
      setError(`Please wait ${formatTime(timeLeft)} before requesting a new code`);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP. Please try again.');
      }

      // Reset timer
      setTimeLeft(300);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      setSuccess('Verification code resent! Please check your email.');
      
      // Focus first input
      inputRefs.current[0]?.focus();

    } catch (err) {
      console.error('Resend OTP error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle go back to login
  const handleGoBack = () => {
    localStorage.removeItem('otp_email');
    navigate('/login');
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
          <div className="flex flex-col items-center mb-6">
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
              VERIFY YOUR ACCOUNT
            </span>
          </div>

          {/* Info message */}
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center gap-2 text-blue-700 text-sm">
              <FaEnvelope className="text-blue-500" />
              <span className="font-medium">Verification code sent to:</span>
              <span className="font-bold">{email}</span>
            </div>
          </div>

          {/* Error/Success Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-sm font-medium"
              >
                <FaTimesCircle className="text-red-500 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-600 text-sm font-medium"
              >
                <FaCheckCircle className="text-green-500 flex-shrink-0" />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* OTP Input Fields */}
          <div className="mb-6">
            <label className="block mb-3 text-xs font-bold text-gray-600 tracking-wide text-center">
              ENTER 6-DIGIT CODE
            </label>
            <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-bold bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-red-300 transition-all duration-200"
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          {/* Timer and Resend */}
          <div className="text-center mb-6">
            {!canResend && timeLeft > 0 ? (
              <p className="text-sm text-gray-500">
                Code expires in <span className="font-bold text-red-600">{formatTime(timeLeft)}</span>
              </p>
            ) : (
              <button
                onClick={handleResendOtp}
                disabled={loading}
                className="text-sm text-red-600 hover:text-red-700 font-semibold flex items-center justify-center gap-2 mx-auto transition-colors"
              >
                <FaRedoAlt className="text-xs" />
                Resend verification code
              </button>
            )}
          </div>

          {/* Verify Button */}
          <motion.button
            onClick={handleVerifyOtp}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-extrabold text-white text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-200 ${
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
                Verifying...
              </>
            ) : (
              <>
                <FaKey className="text-sm" />
                Verify & Continue
               
              </>
            )}
          </motion.button>

          {/* Back to Login */}
          <button
            onClick={handleGoBack}
            disabled={loading}
            className="w-full mt-3 py-2.5 rounded-xl font-semibold text-gray-600 text-sm border border-gray-200 bg-white/50 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <FaArrowLeft className="text-xs" />
            Back to Login
          </button>

          {/* Help Text */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Didn't receive the code? Check your spam folder or contact support
          </p>
        </div>

        {/* Bottom shimmer line */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
      </motion.div>
    </div>
  );
}