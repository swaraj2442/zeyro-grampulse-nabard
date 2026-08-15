"use client";

import React, { useState } from 'react';
import { Wheat, ArrowRight, AlertCircle } from 'lucide-react';
import apiClient from '../services/apiClient';
import { useGramPulseStore } from '../store/useGramPulseStore';

const ROLES = ['Regional Manager', 'Field Officer', 'Branch Manager', 'NABARD Admin', 'Enterprise Owner'];

export default function LoginScreen({ onLogin }: { onLogin: (role: string) => void }) {
  const [role, setRole] = useState('Regional Manager');
  const [mobile, setMobile] = useState('98765 43210');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { setCurrentUser } = useGramPulseStore();

  const handleSendOtp = () => {
    setStep('otp');
    setOtp(['1', '2', '3', '4', '5', '6']);
    setError(null);
  };

  const handleOtpChange = (i: number, val: string) => {
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
  };

  const handleVerify = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      // Execute login via apiClient
      const res = await apiClient.login({ phone: mobile, otp: otp.join(''), role });
      
      // Update global store
      if (res.data?.accessToken) {
        setCurrentUser(res.data.user || { role }, res.data.accessToken);
      }
      
      // Proceed to app
      onLogin(role);
    } catch (e: any) {
      setError(e.message || 'Login failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#f4f5f4] font-sans">
      {/* Left panel */}
      <div className="hidden lg:flex w-[45%] bg-[#17332e] flex-col justify-between p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="absolute border border-white rounded-full"
              style={{ width: `${(i + 1) * 120}px`, height: `${(i + 1) * 120}px`,
                top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
          ))}
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-green-400/20 border border-green-400/30 flex items-center justify-center">
            <Wheat size={18} className="text-green-300" />
          </div>
          <div>
            <div className="text-white font-semibold text-[15px] leading-tight">Zeyro GramPulse</div>
            <div className="text-green-400/70 text-[11px]">by Zeyro · NABARD</div>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-6">
          <div>
            <div className="text-green-400 text-[11px] font-semibold uppercase tracking-widest mb-3">Rural Enterprise Intelligence</div>
            <h1 className="text-white text-[36px] font-semibold leading-tight">
              Know every farm.<br/>Before they ask.
            </h1>
          </div>
          <p className="text-white/60 text-[14px] leading-relaxed max-w-sm">
            AI-powered cash flow forecasts, BFS-R scores, and early warning alerts across India's rural micro enterprise portfolio.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[['3,250', 'Enterprises'], ['81', 'Avg Health Score'], ['2.7%', 'Forecast NPA']].map(([val, lbl]) => (
              <div key={lbl} className="border border-white/10 rounded-xl p-3 bg-white/5">
                <div className="text-white font-bold text-[18px]">{val}</div>
                <div className="text-white/50 text-[10px] mt-0.5">{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-white/30 text-[11px]">
          Zeyro GramPulse · v1.0 · July 2026 · NABARD Maharashtra
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-md bg-green-700 flex items-center justify-center">
              <Wheat size={15} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">Zeyro GramPulse</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_40px_rgba(0,0,0,0.06)] p-8">
            <h2 className="text-[22px] font-bold text-gray-900 mb-1">Welcome back!</h2>
            <p className="text-gray-400 text-[13px] mb-6">Sign in to your account</p>
            
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg flex gap-2 items-start text-red-600 text-xs">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Role */}
            <div className="mb-4">
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Select Role</label>
              <div className="relative">
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full appearance-none border border-gray-100 rounded-xl px-3 py-2.5 text-[13px] text-gray-800 bg-white focus:outline-none focus:border-green-500 transition-colors pr-8 disabled:opacity-50"
                >
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</div>
              </div>
            </div>

            {/* Mobile */}
            <div className="mb-5">
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Mobile Number</label>
              <div className="flex border border-gray-100 rounded-xl overflow-hidden focus-within:border-green-500 transition-colors">
                <span className="px-3 py-2.5 bg-gray-50 border-r border-gray-100 text-[13px] text-gray-500 font-medium">+91</span>
                <input
                  type="tel"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  disabled={isSubmitting}
                  className="flex-1 px-3 py-2.5 text-[13px] text-gray-800 focus:outline-none bg-white disabled:opacity-50"
                  placeholder="98765 43210"
                />
              </div>
            </div>

            {step === 'phone' ? (
              <button
                onClick={handleSendOtp}
                className="w-full bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl text-[13px] font-semibold transition-colors flex items-center justify-center gap-2"
              >
                Send OTP <ArrowRight size={14} />
              </button>
            ) : (
              <>
                <div className="mb-5">
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Enter OTP</label>
                  <div className="flex gap-2">
                    {otp.map((val, i) => (
                      <input
                        key={i}
                        type="text"
                        maxLength={1}
                        value={val}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        disabled={isSubmitting}
                        className="w-10 h-12 text-center border border-gray-100 rounded-xl text-[16px] font-bold text-gray-900 focus:outline-none focus:border-green-500 transition-colors disabled:opacity-50"
                      />
                    ))}
                  </div>
                  <div className="mt-2 text-[11px] text-gray-400">
                    Didn't receive OTP? <button className="text-green-700 font-medium hover:underline">Resend</button>
                  </div>
                </div>
                <button
                  onClick={handleVerify}
                  disabled={isSubmitting}
                  className="w-full bg-green-700 hover:bg-green-800 disabled:bg-green-700/70 text-white py-2.5 rounded-xl text-[13px] font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Verifying...' : 'Verify & Sign In'}
                </button>
              </>
            )}
          </div>

          <p className="text-center text-[11px] text-gray-400 mt-5">
            Zeyro GramPulse · Secured by DPDP Act 2023
          </p>
        </div>
      </div>
    </div>
  );
}
