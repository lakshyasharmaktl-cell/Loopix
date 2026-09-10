import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaCheckCircle, FaTimesCircle, FaRedoAlt, FaArrowLeft, FaSun, FaMoon, FaKey } from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';
import axios from 'axios';
import { toast } from 'react-toastify';
import BASE_URL from '../../global_url.js';
import { useTheme } from '../../context/ThemeContext.jsx';

function LoopixMark({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lmGOtp2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
      </defs>
      <path d="M 68.2 69.2 A 26 26 0 1 1 68.2 30.8" fill="none" stroke="url(#lmGOtp2)" strokeWidth="10" strokeLinecap="round" />
      <path d="M 61 38 A 16 16 0 1 1 61 62" fill="none" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" opacity="0.5" />
      <circle cx="68.2" cy="69.2" r="5.5" fill="#ef4444" />
      <circle cx="68.2" cy="69.2" r="2.5" fill="#ffffff" />
    </svg>
  );
}

export default function OtpSection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { isDark, toggleTheme } = useTheme();

  // 4-digit OTP state
  const [otp, setOtp] = useState(['', '', '', '']);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Extract email from location state or localStorage
  useEffect(() => {
    const userEmail = location.state?.email || localStorage.getItem('otp_email') || '';
    if (userEmail) {
      setEmail(userEmail);
      localStorage.setItem('otp_email', userEmail);
    }
    if (location.state?.name) {
      localStorage.setItem('temp_user_name', location.state.name);
    }
  }, [location]);

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Auto focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const handleOtpChange = (index, value) => {
    if (value && !/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    // Auto advance focus to next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter' && otp.every((d) => d !== '')) {
      handleVerifyOtp();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().slice(0, 4);
    if (/^\d+$/.test(pastedData)) {
      const arr = pastedData.split('');
      const newOtp = [...otp];
      for (let i = 0; i < Math.min(arr.length, 4); i++) {
        newOtp[i] = arr[i];
      }
      setOtp(newOtp);
      setError('');
      const lastIndex = Math.min(arr.length, 4) - 1;
      if (lastIndex >= 0) {
        inputRefs.current[lastIndex]?.focus();
      }
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join('').trim();
    if (otpValue.length !== 4) {
      setError('Please enter the complete 4-digit code');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const targetEmail = (email || localStorage.getItem('otp_email') || '').trim();
    const targetId = id && id !== 'undefined' && id !== ':id' ? id : '';

    // Candidate base URLs to ensure both production Render backend and local dev work seamlessly
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const candidateUrls = [
      BASE_URL,
      ...(isLocal ? ['http://localhost:2345', 'http://127.0.0.1:2345'] : [])
    ].filter((v, i, a) => a.indexOf(v) === i);

    let verifiedRes = null;
    let backendErrorMsg = '';

    for (const baseUrl of candidateUrls) {
      if (verifiedRes) break;

      const attempts = [];
      if (targetId) {
        attempts.push({ url: `${baseUrl}/verify-otp/${targetId}`, data: { otp: otpValue, email: targetEmail, id: targetId } });
        attempts.push({ url: `${baseUrl}/verify-otp`, data: { otp: otpValue, email: targetEmail, id: targetId, userId: targetId } });
      } else {
        attempts.push({ url: `${baseUrl}/verify-otp`, data: { otp: otpValue, email: targetEmail } });
      }

      for (const attempt of attempts) {
        try {
          const res = await axios.post(attempt.url, attempt.data, { timeout: 40000 });
          if (res && res.status >= 200 && res.status < 300) {
            if (res.data && res.data.status === false) {
              backendErrorMsg = res.data.msg || 'Invalid verification code';
              continue;
            }
            verifiedRes = res;
            break;
          }
        } catch (err) {
          if (err.response?.data?.msg) {
            backendErrorMsg = err.response.data.msg;
          }
        }
      }
    }

    let finalUser = null;
    let finalToken = null;

    if (verifiedRes && verifiedRes.data && verifiedRes.data.status !== false) {
      const resData = verifiedRes.data || {};
      finalUser = resData.user || resData.data?.user || resData.data || {
        id: resData.id || resData._id || targetId || 'user_' + Date.now(),
        _id: resData._id || resData.id || targetId || 'user_' + Date.now(),
        name: resData.name || location.state?.name || localStorage.getItem('temp_user_name') || (targetEmail ? targetEmail.split('@')[0] : 'User'),
        email: targetEmail || resData.email || 'user@loopix.com',
      };
      finalToken = resData.token || resData.accessToken || resData.data?.token || ('auth_token_' + Date.now());
    } else {
      const errMsg = backendErrorMsg || 'Incorrect OTP code. Please check your email and try again.';
      setError(errMsg);
      toast.error(errMsg);
      setLoading(false);
      return;
    }

    localStorage.setItem('loopix_user', JSON.stringify(finalUser));
    localStorage.setItem('auth_token', finalToken);
    window.dispatchEvent(new Event('loopix-auth-change'));

    localStorage.removeItem('otp_email');
    localStorage.removeItem('temp_otp');
    localStorage.removeItem('temp_user_name');

    setSuccess('Account verified! Redirecting to chats...');
    toast.success('Account verified successfully! Welcome to Loopix! 🎉');
    setTimeout(() => navigate('/chats', { replace: true }), 1000);
    setLoading(false);
  };

  const handleResendOtp = async () => {
    if (!canResend && timeLeft > 0) {
      setError(`Please wait ${formatTime(timeLeft)} before requesting a new code`);
      return;
    }
    const targetEmail = (email || localStorage.getItem('otp_email') || '').trim();
    if (!targetEmail) {
      toast.error('Email not found. Please register again.');
      navigate('/signup');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const candidateUrls = [
      BASE_URL,
      ...(isLocal ? ['http://localhost:2345', 'http://127.0.0.1:2345'] : [])
    ].filter((v, i, a) => a.indexOf(v) === i);

    let resendSuccess = false;
    let lastError = null;

    for (const baseUrl of candidateUrls) {
      try {
        await axios.post(`${baseUrl}/resend-otp`, { email: targetEmail }, { timeout: 40000 });
        resendSuccess = true;
        break;
      } catch (e1) {
        lastError = e1;
      }
    }

    setLoading(false);

    if (resendSuccess) {
      setTimeLeft(300);
      setCanResend(false);
      setOtp(['', '', '', '']);
      setSuccess('New verification code sent! Check your inbox.');
      toast.success('OTP resent to your email 📧');
      inputRefs.current[0]?.focus();
    } else {
      const msg = lastError?.response?.data?.msg || 'Failed to resend code. Please try again.';
      setError(msg);
      toast.error(msg);
    }
  };

  const allFilled = otp.every((d) => d !== '');

  return (
    <div
      style={{
        minHeight: '100vh',
        background: isDark
          ? '#000000'
          : 'linear-gradient(145deg, #fafaf9 0%, #f5f3f0 50%, #fdf8f8 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter','Segoe UI',sans-serif",
        padding: '2rem 1rem',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.3s ease',
      }}
    >
      {/* Floating Theme Toggle */}
      <button
        onClick={toggleTheme}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 20,
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: isDark ? '1px solid #27272a' : '1px solid #e5e7eb',
          background: isDark ? '#09090b' : '#ffffff',
          color: isDark ? '#fbbf24' : '#4b5563',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.1rem',
          boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease',
        }}
      >
        {isDark ? <FaSun /> : <FaMoon />}
      </button>

      {/* Ambient glowing background blobs */}
      {!isDark && (
        <>
          <div
            style={{
              position: 'fixed',
              top: '-80px',
              right: '-80px',
              width: '320px',
              height: '320px',
              background: 'radial-gradient(circle, rgba(220,38,38,0.12) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'fixed',
              bottom: '-80px',
              left: '-80px',
              width: '280px',
              height: '280px',
              background: 'radial-gradient(circle, rgba(220,38,38,0.08) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />
        </>
      )}

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: '420px',
          background: isDark ? '#09090b' : '#fff',
          borderRadius: '24px',
          boxShadow: isDark
            ? '0 20px 60px rgba(0,0,0,0.9)'
            : '0 4px 6px rgba(0,0,0,0.03), 0 20px 60px rgba(0,0,0,0.08)',
          border: isDark ? '1px solid #27272a' : '1px solid rgba(0,0,0,0.06)',
          overflow: 'hidden',
          zIndex: 10,
        }}
      >
        {/* Red top accent bar */}
        {!isDark && (
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #ef4444, #dc2626, #ef4444)' }} />
        )}

        <div style={{ padding: '2.25rem 2rem' }}>
          {/* Logo & Header */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.75rem' }}>
            <motion.div
              animate={{ rotate: [0, 6, -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ marginBottom: '0.625rem' }}
            >
              <LoopixMark size={50} />
            </motion.div>
            <span
              className="loopix-brand-title"
              style={{
                display: 'inline-block',
                fontSize: '1.625rem',
                fontWeight: '900',
                letterSpacing: '4px',
              }}
            >
              LOOPIX
            </span>
            <span
              style={{
                marginTop: '0.25rem',
                fontSize: '0.65rem',
                fontWeight: '700',
                color: isDark ? '#a1a1aa' : '#9ca3af',
                letterSpacing: '3px',
              }}
            >
              VERIFY YOUR ACCOUNT
            </span>
          </div>

          {/* Email badge / notice */}
          {email ? (
            <div
              style={{
                marginBottom: '1rem',
                padding: '0.625rem 0.875rem',
                background: isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff',
                border: isDark ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid #bfdbfe',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <FaEnvelope style={{ color: '#60a5fa', fontSize: '0.8rem', flexShrink: 0 }} />
              <span style={{ fontSize: '0.78rem', color: isDark ? '#93c5fd' : '#1d4ed8', fontWeight: '500' }}>
                Code sent to <strong>{email}</strong>
              </span>
            </div>
          ) : (
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.875rem',
                  fontSize: '0.8rem',
                  background: isDark ? '#0f172a' : '#f9fafb',
                  border: isDark ? '1px solid #334155' : '1px solid #e5e7eb',
                  borderRadius: '10px',
                  color: isDark ? '#f8fafc' : '#111827',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}



          {/* Error & Success Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                style={{
                  marginBottom: '0.875rem',
                  padding: '0.6rem 0.875rem',
                  background: isDark ? 'rgba(220, 38, 38, 0.2)' : '#fef2f2',
                  border: isDark ? '1px solid rgba(220, 38, 38, 0.4)' : '1px solid #fecaca',
                  borderRadius: '10px',
                  color: isDark ? '#fca5a5' : '#dc2626',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <FaTimesCircle style={{ flexShrink: 0 }} /> <span>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                style={{
                  marginBottom: '0.875rem',
                  padding: '0.6rem 0.875rem',
                  background: isDark ? 'rgba(22, 163, 74, 0.2)' : '#f0fdf4',
                  border: isDark ? '1px solid rgba(22, 163, 74, 0.4)' : '1px solid #bbf7d0',
                  borderRadius: '10px',
                  color: isDark ? '#86efac' : '#16a34a',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <FaCheckCircle style={{ flexShrink: 0 }} /> <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 4-Digit OTP inputs */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                textAlign: 'center',
                marginBottom: '1rem',
                fontSize: '0.7rem',
                fontWeight: '700',
                color: isDark ? '#94a3b8' : '#9ca3af',
                letterSpacing: '2px',
              }}
            >
              ENTER 4-DIGIT CODE
            </label>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }} onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <motion.input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={loading}
                  whileFocus={{ scale: 1.05 }}
                  style={{
                    width: '64px',
                    height: '68px',
                    textAlign: 'center',
                    fontSize: '1.75rem',
                    fontWeight: '800',
                    background: digit
                      ? isDark
                        ? 'rgba(239,68,68,0.2)'
                        : '#fef2f2'
                      : isDark
                      ? '#0f172a'
                      : '#fafafa',
                    border: digit
                      ? '2px solid #ef4444'
                      : isDark
                      ? '2px solid #334155'
                      : '2px solid #e5e7eb',
                    borderRadius: '16px',
                    color: digit ? '#ef4444' : isDark ? '#f8fafc' : '#374151',
                    transition: 'all 0.15s ease',
                    outline: 'none',
                    cursor: 'text',
                    boxShadow: digit ? '0 4px 12px rgba(220,38,38,0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Timer & Resend Button */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            {!canResend && timeLeft > 0 ? (
              <p style={{ fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#9ca3af' }}>
                Code expires in <span style={{ color: '#ef4444', fontWeight: '700' }}>{formatTime(timeLeft)}</span>
              </p>
            ) : (
              <button
                onClick={handleResendOtp}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.8rem',
                  color: '#ef4444',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  margin: '0 auto',
                }}
              >
                <FaRedoAlt style={{ fontSize: '0.7rem' }} /> Resend code
              </button>
            )}
          </div>

          {/* Verify Button */}
          <motion.button
            onClick={handleVerifyOtp}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            disabled={loading || !allFilled}
            style={{
              width: '100%',
              padding: '0.875rem',
              borderRadius: '14px',
              border: 'none',
              fontWeight: '800',
              color: '#fff',
              fontSize: '0.9rem',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: loading || !allFilled ? 'not-allowed' : 'pointer',
              background:
                loading || !allFilled
                  ? isDark
                    ? '#334155'
                    : '#d1d5db'
                  : 'linear-gradient(135deg, #ef4444, #dc2626)',
              boxShadow: loading || !allFilled ? 'none' : '0 6px 20px rgba(220,38,38,0.3)',
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
                  style={{
                    display: 'inline-block',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.35)',
                    borderTopColor: '#fff',
                  }}
                />
                Verifying...
              </>
            ) : (
              <>
                <MdVerified style={{ fontSize: '1rem' }} /> Verify &amp; Continue
              </>
            )}
          </motion.button>

          {/* Back to Login */}
          <button
            onClick={() => {
              localStorage.removeItem('otp_email');
              navigate('/login');
            }}
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '0.75rem',
              padding: '0.75rem',
              borderRadius: '14px',
              border: isDark ? '1.5px solid #334155' : '1.5px solid #e5e7eb',
              background: 'transparent',
              color: isDark ? '#94a3b8' : '#6b7280',
              fontSize: '0.825rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease',
            }}
          >
            <FaArrowLeft style={{ fontSize: '0.7rem' }} /> Back to Login
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.72rem', color: isDark ? '#64748b' : '#c4c4c4', marginTop: '1.25rem' }}>
            Didn't receive the code? Check your spam folder or wait to resend.
          </p>
        </div>
      </motion.div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        input:focus { border-color: #ef4444 !important; box-shadow: 0 0 0 3px rgba(239,68,68,0.12) !important; }
      `}</style>
    </div>
  );
}