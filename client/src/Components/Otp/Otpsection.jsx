import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaCheckCircle, FaTimesCircle, FaRedoAlt, FaArrowLeft } from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';
import axios from 'axios';
import { toast } from 'react-toastify';
import BASE_URL from '../../global_url.js';

function LoopixMark({ size = 44 }) {
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
      <circle cx="68.2" cy="69.2" r="2.5" fill="#fff" />
    </svg>
  );
}

export default function OtpSection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  // 4-digit OTP to match server (Math.floor(1000 + Math.random() * 9000))
  const [otp, setOtp] = useState(['', '', '', '']);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    const userEmail = location.state?.email || localStorage.getItem('otp_email');
    if (userEmail) {
      setEmail(userEmail);
      localStorage.setItem('otp_email', userEmail);
    } else if (!id) {
      setError('Session expired. Please register again.');
      setTimeout(() => navigate('/signup'), 2000);
    }
  }, [location, navigate, id]);

  useEffect(() => {
    if (timeLeft <= 0) { setCanResend(true); return; }
    const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const handleOtpChange = (index, value) => {
    if (value && !/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 3) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    if (/^\d+$/.test(pastedData)) {
      const arr = pastedData.split('');
      const newOtp = [...otp];
      for (let i = 0; i < Math.min(arr.length, 4); i++) newOtp[i] = arr[i];
      setOtp(newOtp);
      const last = Math.min(arr.length, 4) - 1;
      if (last >= 0) inputRefs.current[last]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 4) {
      setError('Please enter the complete 4-digit code');
      return;
    }
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await axios.post(`${BASE_URL}/verify-otp/${id}`, { otp: otpValue });
      if (!res.data.status) throw new Error(res.data.msg);
      localStorage.removeItem('otp_email');
      setSuccess('Account verified! Redirecting...');
      toast.success('Account verified successfully! 🎉');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const msg = err.response?.data?.msg || err.message || 'Something went wrong.';
      setError(msg); toast.error(msg);
    } finally { setLoading(false); }
  };

  const handleResendOtp = async () => {
    if (!canResend && timeLeft > 0) { setError(`Wait ${formatTime(timeLeft)} before resending`); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      await axios.post(`${BASE_URL}/register`, { email });
      setTimeLeft(300); setCanResend(false);
      setOtp(['', '', '', '']);
      setSuccess('New code sent! Check your email.');
      toast.success('OTP resent 📧');
      inputRefs.current[0]?.focus();
    } catch (err) {
      const msg = err.response?.data?.msg || 'Failed to resend.';
      setError(msg); toast.error(msg);
    } finally { setLoading(false); }
  };

  const allFilled = otp.every(d => d !== '');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #fafaf9 0%, #f5f3f0 50%, #fdf8f8 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter','Segoe UI',sans-serif",
      padding: '2rem 1rem', position: 'relative', overflow: 'hidden',
    }}>
      {/* Soft background blobs */}
      <div style={{ position:'fixed', top:'-80px', right:'-80px', width:'320px', height:'320px', background:'radial-gradient(circle, rgba(220,38,38,0.07) 0%, transparent 70%)', borderRadius:'50%', pointerEvents:'none' }} />
      <div style={{ position:'fixed', bottom:'-80px', left:'-80px', width:'280px', height:'280px', background:'radial-gradient(circle, rgba(220,38,38,0.05) 0%, transparent 70%)', borderRadius:'50%', pointerEvents:'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          width: '100%', maxWidth: '400px',
          background: '#fff',
          borderRadius: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.03), 0 20px 60px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}
      >
        {/* Red top accent bar */}
        <div style={{ height: '3px', background: 'linear-gradient(90deg, #ef4444, #dc2626, #ef4444)' }} />

        <div style={{ padding: '2.25rem 2rem' }}>
          {/* Logo */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:'1.75rem' }}>
            <motion.div
              animate={{ rotate: [0, 6, -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ marginBottom: '0.625rem' }}
            >
              <LoopixMark size={50} />
            </motion.div>
            <span style={{
              fontSize: '1.625rem', fontWeight: '900', letterSpacing: '4px',
              background: 'linear-gradient(90deg, #1a1a1a, #dc2626)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>LOOPIX</span>
            <span style={{ marginTop: '0.25rem', fontSize: '0.6rem', fontWeight: '700', color: '#9ca3af', letterSpacing: '3px' }}>
              VERIFY YOUR ACCOUNT
            </span>
          </div>

          {/* Email pill */}
          {email && (
            <div style={{
              marginBottom: '1.25rem', padding: '0.625rem 0.875rem',
              background: '#eff6ff', border: '1px solid #bfdbfe',
              borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <FaEnvelope style={{ color: '#3b82f6', fontSize: '0.8rem', flexShrink: 0 }} />
              <span style={{ fontSize: '0.78rem', color: '#1d4ed8', fontWeight: '500' }}>
                Code sent to <strong>{email}</strong>
              </span>
            </div>
          )}

          {/* Messages */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                style={{ marginBottom:'0.875rem', padding:'0.6rem 0.875rem', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'10px', color:'#dc2626', fontSize:'0.8rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <FaTimesCircle style={{ flexShrink:0 }} /> <span>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                style={{ marginBottom:'0.875rem', padding:'0.6rem 0.875rem', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'10px', color:'#16a34a', fontSize:'0.8rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <FaCheckCircle style={{ flexShrink:0 }} /> <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 4-digit OTP inputs */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display:'block', textAlign:'center', marginBottom:'1rem', fontSize:'0.7rem', fontWeight:'700', color:'#9ca3af', letterSpacing:'2px' }}>
              ENTER 4-DIGIT CODE
            </label>
            <div style={{ display:'flex', justifyContent:'center', gap:'0.75rem' }} onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <motion.input
                  key={index}
                  ref={(el) => inputRefs.current[index] = el}
                  type="text" inputMode="numeric" maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={loading}
                  whileFocus={{ scale: 1.05 }}
                  style={{
                    width: '64px', height: '68px',
                    textAlign: 'center', fontSize: '1.75rem', fontWeight: '800',
                    background: digit ? '#fef2f2' : '#fafafa',
                    border: digit ? '2px solid #ef4444' : '2px solid #e5e7eb',
                    borderRadius: '16px',
                    color: digit ? '#dc2626' : '#374151',
                    transition: 'all 0.15s ease',
                    outline: 'none', cursor: 'text',
                    boxShadow: digit ? '0 4px 12px rgba(220,38,38,0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Timer */}
          <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
            {!canResend && timeLeft > 0 ? (
              <p style={{ fontSize:'0.8rem', color:'#9ca3af' }}>
                Code expires in{' '}
                <span style={{ color:'#dc2626', fontWeight:'700' }}>{formatTime(timeLeft)}</span>
              </p>
            ) : (
              <button onClick={handleResendOtp} disabled={loading}
                style={{ background:'none', border:'none', fontSize:'0.8rem', color:'#dc2626', fontWeight:'700', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.4rem', margin:'0 auto' }}>
                <FaRedoAlt style={{ fontSize:'0.7rem' }} /> Resend code
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
              width: '100%', padding: '0.875rem',
              borderRadius: '14px', border: 'none',
              fontWeight: '800', color: '#fff', fontSize: '0.9rem', letterSpacing: '0.5px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              cursor: loading || !allFilled ? 'not-allowed' : 'pointer',
              background: loading || !allFilled
                ? '#d1d5db'
                : 'linear-gradient(135deg, #ef4444, #dc2626)',
              boxShadow: loading || !allFilled ? 'none' : '0 6px 20px rgba(220,38,38,0.3)',
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? (
              <>
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
                  style={{ display:'inline-block', width:'16px', height:'16px', borderRadius:'50%', border:'2px solid rgba(255,255,255,0.35)', borderTopColor:'#fff' }} />
                Verifying...
              </>
            ) : (
              <><MdVerified style={{ fontSize:'1rem' }} /> Verify &amp; Continue</>
            )}
          </motion.button>

          {/* Back */}
          <button onClick={() => { localStorage.removeItem('otp_email'); navigate('/login'); }}
            disabled={loading}
            style={{
              width:'100%', marginTop:'0.75rem', padding:'0.75rem',
              borderRadius:'14px', border:'1.5px solid #e5e7eb',
              background:'transparent', color:'#6b7280',
              fontSize:'0.825rem', fontWeight:'600', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem',
              transition:'all 0.2s ease',
            }}>
            <FaArrowLeft style={{ fontSize:'0.7rem' }} /> Back to Login
          </button>

          <p style={{ textAlign:'center', fontSize:'0.72rem', color:'#c4c4c4', marginTop:'1.25rem' }}>
            Didn't receive the code? Check your spam folder.
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