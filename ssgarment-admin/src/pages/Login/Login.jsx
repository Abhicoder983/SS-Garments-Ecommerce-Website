// src/pages/Login/Login.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Login() {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const otpRefs = useRef([]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/send-otp/', { email });
      toast.success('OTP sent to your email');
      setStep('otp');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send OTP, please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/verify-otp/', { email, otp });
      localStorage.setItem('admin_access_token', res.data.access);
      localStorage.setItem('admin_refresh_token', res.data.refresh);
      toast.success('Login successful');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP, please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    try {
      await api.post('/send-otp/', { email });
      toast.success('OTP resent');
    } catch (err) {
      toast.error('Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  // OTP box logic (visual only, doesn't affect API logic)
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const digits = otp.split('');
    digits[index] = value;
    const newOtp = digits.join('');
    setOtp(newOtp.padEnd(6, '').slice(0, 6));
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setOtp(pasted);
    const focusIndex = Math.min(pasted.length, 5);
    setTimeout(() => otpRefs.current[focusIndex]?.focus(), 0);
  };

  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => otpRefs.current[0]?.focus(), 300);
    }
  }, [step]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-100 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white/50 p-8 sm:p-10">
          
          {/* Logo & Header */}
          <div className="text-center mb-10">
            <div className="relative inline-flex items-center justify-center w-16 h-16 mb-5">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl rotate-3 opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl" />
              <span className="relative text-white text-2xl font-bold tracking-tight">S</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">SS Garments Admin</h1>
            <p className="text-slate-400 text-sm mt-2 font-medium">
              {step === 'email'
                ? 'Sign in to your admin dashboard'
                : `Enter the 6-digit code sent to ${email}`}
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`flex items-center gap-2 transition-all duration-500 ${step === 'email' ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300 ${step === 'email' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>1</div>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</span>
            </div>
            <div className="w-8 h-px bg-slate-200" />
            <div className={`flex items-center gap-2 transition-all duration-500 ${step === 'otp' ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300 ${step === 'otp' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>2</div>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Verify</span>
            </div>
          </div>

          {/* Email Step */}
          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="admin@ssgarment.in"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-200 active:scale-[0.98]"
              >
                <span className={`flex items-center justify-center gap-2 transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                  Continue
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
                {loading && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <ClipLoader color="#ffffff" size={20} />
                  </span>
                )}
              </button>
            </form>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3 text-center">
                  Verification Code
                </label>
                <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      ref={(el) => (otpRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[index] || ''}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      disabled={loading}
                      className="w-11 h-14 sm:w-12 sm:h-16 bg-slate-50 border-2 border-slate-200 rounded-xl text-center text-xl font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50 transition-all duration-200"
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-400 text-center mt-3">
                  Didn't receive it? Check your spam folder
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-200 active:scale-[0.98]"
              >
                <span className={`flex items-center justify-center gap-2 transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                  Verify & Login
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                {loading && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <ClipLoader color="#ffffff" size={20} />
                  </span>
                )}
              </button>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setOtp('');
                  }}
                  className="group flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Change email
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {resending ? 'Sending...' : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6 font-medium">
          Secure admin access · SS Garments
        </p>
      </div>
    </div>
  );
}