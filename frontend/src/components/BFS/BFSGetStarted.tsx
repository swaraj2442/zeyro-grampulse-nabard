"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { startPremiumFluidMask } from '../../utils/premium-fluid-mask';
import { createClient } from '@/lib/supabase';

const customEaseOut = [0.23, 1, 0.32, 1] as const;

export default function BFSGetStarted({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({
    fullName: '',
    workEmail: '',
    company: '',
    role: '',
    website: '',
    mobile: '',
    source: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskEngineRef = useRef<{ stop: () => void, triggerReveal: () => void } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      setDropdownOpen(false);
      setFormData({
        fullName: '',
        workEmail: '',
        company: '',
        role: '',
        website: '',
        mobile: '',
        source: '',
        message: '',
      });
      setErrors({});
      document.body.style.overflow = 'hidden';
      // Center the mask initially
      setMousePos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const engine = startPremiumFluidMask(canvasRef.current);
      maskEngineRef.current = engine;
      return engine.stop;
    }
  }, [isOpen]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.workEmail.trim()) {
      newErrors.workEmail = 'Work email is required';
    } else if (!emailRegex.test(formData.workEmail.trim())) {
      newErrors.workEmail = 'Please enter a valid work email address';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!formData.role.trim()) {
      newErrors.role = 'Role is required';
    }

    const digitsOnly = formData.mobile.replace(/\D/g, '');
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      newErrors.mobile = 'Please enter a valid mobile number (7-15 digits)';
    }

    if (formData.website.trim()) {
      const websiteRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
      if (!websiteRegex.test(formData.website.trim()) && !formData.website.includes('.')) {
        newErrors.website = 'Please enter a valid website URL or domain';
      }
    }

    if (!formData.source) {
      newErrors.source = 'Please select how you heard about us';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const payload = {
        full_name: formData.fullName.trim(),
        work_email: formData.workEmail.trim(),
        company: formData.company.trim(),
        role: formData.role.trim(),
        website: formData.website.trim() || null,
        mobile: formData.mobile.trim(),
        source: formData.source,
        message: formData.message.trim() || null,
        created_at: new Date().toISOString(),
      };

      // Try inserting into leads table, fallback to get_started_submissions
      const { error } = await supabase.from('leads').insert([payload]);
      if (error) {
        console.warn('Inserting into leads table failed, trying fallback table:', error.message);
        try {
          await supabase.from('get_started_submissions').insert([payload]);
        } catch {
          // ignore fallback error
        }
      }

      // Send email template via Resend API
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: formData.fullName,
            workEmail: formData.workEmail,
            company: formData.company,
            role: formData.role,
            mobile: formData.mobile,
            source: formData.source,
            message: formData.message,
          }),
        });
      } catch (emailErr) {
        console.warn('Error calling send-email endpoint:', emailErr);
      }
    } catch (err) {
      console.warn('Supabase submission error:', err);
    } finally {
      setIsSubmitting(false);
      setSubmitted(true); 
      
      // Trigger cinematic mask reveal
      if (maskEngineRef.current) {
        maskEngineRef.current.triggerReveal();
      }
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: customEaseOut }}
          className="fixed inset-0 z-[300] flex flex-col items-center justify-end bg-black/60 backdrop-blur-md px-4 md:px-12"
          onClick={onClose}
        >
          {/* Popup Container */}
          <motion.div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ duration: 0.65, ease: customEaseOut }}
            style={{
              WebkitMaskImage: '-webkit-radial-gradient(white, black)',
              backfaceVisibility: 'hidden',
            }}
            className="relative w-full max-w-[1700px] h-[86vh] md:h-[88vh] rounded-t-[2rem] md:rounded-t-[2.5rem] overflow-hidden shadow-2xl flex items-center justify-center bg-black isolate transform-gpu font-dm-sans"
            onClick={(e) => e.stopPropagation()}
          >
          {/* Base Layer: Background Local Video */}
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            preload="metadata"
            poster="/background-poster.jpg"
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-70 pointer-events-none scale-[1.02]"
          >
            <source src="/background-video-av1.mp4" type="video/mp4; codecs=av01.0.05M.08" />
            <source src="/background-video-h264.mp4" type="video/mp4" />
          </video>

          {/* Premium Canvas Mask Layer */}
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 z-[5] pointer-events-none w-full h-full scale-[1.01]" 
          />

            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 z-30 w-10 h-10 flex items-center justify-center transition-transform hover:scale-110 mix-blend-difference text-white"
            >
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
               </svg>
            </button>

          {/* Waitlist Card */}
          <AnimatePresence>
            {!submitted && (
              <motion.div
                key="card"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10, filter: "blur(12px)" }}
                transition={{ duration: 0.8, ease: customEaseOut }}
                className="relative z-20 w-[550px] max-w-[95%] bg-white/50 backdrop-blur-xl border border-white/60 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-[24px] p-6 md:p-7 flex flex-col items-center max-h-[92vh] overflow-visible font-dm-sans"
                onClick={e => e.stopPropagation()}
              >
            {/* Logo Mark */}
            <div className="mb-3 flex items-center justify-center">
              <span
                className="text-3xl font-[800] leading-none tracking-[0.01em] lowercase flex items-start text-slate-900 no-underline"
                style={{
                  fontFamily: 'var(--font-syne), sans-serif',
                }}
              >
                zeyro<span className="text-[10px] font-bold tracking-normal uppercase ml-[2px] mt-[2px] no-underline select-none">TM</span>
              </span>
            </div>

            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: customEaseOut }}
                className="flex flex-col items-center justify-center text-center gap-4 py-8"
              >
                <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center text-white shadow-md relative overflow-hidden">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                  >
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <motion.path 
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.6, ease: customEaseOut, delay: 0.3 }}
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2.5} 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                  </motion.div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: customEaseOut, delay: 0.4 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 tracking-tight" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}>You're on the list</h3>
                  <p className="text-gray-500 text-[13px]" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}>We'll be in touch soon.</p>
                </motion.div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
                <p className="text-gray-700 text-[13px] text-center leading-relaxed mb-4 px-2" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                  Request access and we'll be in touch.
                </p>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-4 w-full text-left">
                  {/* Full Name */}
                  <div>
                    <label className="block text-[11.5px] font-semibold text-gray-800 mb-1 truncate">Full Name *</label>
                    <input 
                      type="text"
                      value={formData.fullName}
                      onChange={e => handleChange('fullName', e.target.value)}
                      placeholder="John Doe"
                      className={`w-full bg-white/70 border ${errors.fullName ? 'border-red-400 focus:ring-red-200 text-red-900' : 'border-gray-200 focus:ring-gray-300 text-gray-900'} rounded-xl px-3 py-2 text-[12px] placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all`}
                    />
                    {errors.fullName && <p className="text-red-500 text-[10.5px] mt-1 ml-0.5 font-medium">{errors.fullName}</p>}
                  </div>

                  {/* Work Email */}
                  <div>
                    <label className="block text-[11.5px] font-semibold text-gray-800 mb-1 truncate">Work Email *</label>
                    <input 
                      type="email"
                      value={formData.workEmail}
                      onChange={e => handleChange('workEmail', e.target.value)}
                      placeholder="john@company.com"
                      className={`w-full bg-white/70 border ${errors.workEmail ? 'border-red-400 focus:ring-red-200 text-red-900' : 'border-gray-200 focus:ring-gray-300 text-gray-900'} rounded-xl px-3 py-2 text-[12px] placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all`}
                    />
                    {errors.workEmail && <p className="text-red-500 text-[10.5px] mt-1 ml-0.5 font-medium">{errors.workEmail}</p>}
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-[11.5px] font-semibold text-gray-800 mb-1 truncate">Company *</label>
                    <input 
                      type="text"
                      value={formData.company}
                      onChange={e => handleChange('company', e.target.value)}
                      placeholder="Your Company Name"
                      className={`w-full bg-white/70 border ${errors.company ? 'border-red-400 focus:ring-red-200 text-red-900' : 'border-gray-200 focus:ring-gray-300 text-gray-900'} rounded-xl px-3 py-2 text-[12px] placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all`}
                    />
                    {errors.company && <p className="text-red-500 text-[10.5px] mt-1 ml-0.5 font-medium">{errors.company}</p>}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-[11.5px] font-semibold text-gray-800 mb-1 truncate">Role *</label>
                    <input 
                      type="text"
                      value={formData.role}
                      onChange={e => handleChange('role', e.target.value)}
                      placeholder="Role"
                      className={`w-full bg-white/70 border ${errors.role ? 'border-red-400 focus:ring-red-200 text-red-900' : 'border-gray-200 focus:ring-gray-300 text-gray-900'} rounded-xl px-3 py-2 text-[12px] placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all`}
                    />
                    {errors.role && <p className="text-red-500 text-[10.5px] mt-1 ml-0.5 font-medium">{errors.role}</p>}
                  </div>

                  {/* Company website */}
                  <div>
                    <label className="block text-[11.5px] font-semibold text-gray-800 mb-1 truncate">Company website</label>
                    <input 
                      type="text"
                      value={formData.website}
                      onChange={e => handleChange('website', e.target.value)}
                      placeholder="www.acme.com"
                      className={`w-full bg-white/70 border ${errors.website ? 'border-red-400 focus:ring-red-200 text-red-900' : 'border-gray-200 focus:ring-gray-300 text-gray-900'} rounded-xl px-3 py-2 text-[12px] placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all`}
                    />
                    {errors.website && <p className="text-red-500 text-[10.5px] mt-1 ml-0.5 font-medium">{errors.website}</p>}
                  </div>

                  {/* Mobile number */}
                  <div>
                    <label className="block text-[11.5px] font-semibold text-gray-800 mb-1 truncate">Mobile number *</label>
                    <input 
                      type="tel"
                      value={formData.mobile}
                      onChange={e => handleChange('mobile', e.target.value)}
                      placeholder="Mobile number"
                      className={`w-full bg-white/70 border ${errors.mobile ? 'border-red-400 focus:ring-red-200 text-red-900' : 'border-gray-200 focus:ring-gray-300 text-gray-900'} rounded-xl px-3 py-2 text-[12px] placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all`}
                    />
                    {errors.mobile && <p className="text-red-500 text-[10.5px] mt-1 ml-0.5 font-medium">{errors.mobile}</p>}
                  </div>

                  {/* How did you hear about us? */}
                  <div className="col-span-2">
                    <label className="block text-[11.5px] font-semibold text-gray-800 mb-1">How did you hear about us? *</label>
                    <div className="relative" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setDropdownOpen(!dropdownOpen);
                        }}
                        className={`w-full bg-white border ${errors.source ? 'border-red-400 focus:ring-red-200 text-red-900' : 'border-gray-200 focus:ring-gray-300 text-gray-900'} rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 transition-all flex items-center justify-between text-left ${!formData.source ? 'text-gray-400' : 'text-gray-900 font-medium'}`}
                      >
                        <span className="truncate">{formData.source || 'Choose option'}</span>
                        <svg className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      <AnimatePresence>
                        {dropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -4, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.98 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-[0_15px_35px_rgba(0,0,0,0.2)] py-1 z-[100] overflow-hidden max-h-48 overflow-y-auto"
                          >
                            {[
                              "Search Engine (Google, etc.)",
                              "Social Media (LinkedIn, Twitter, etc.)",
                              "Referral / Friend",
                              "Podcast / Media",
                              "Other"
                            ].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleChange('source', opt);
                                  setDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3.5 py-2 text-[12px] transition-colors flex items-center justify-between ${formData.source === opt ? 'bg-[#ff2a85]/10 text-[#ff2a85] font-semibold' : 'text-gray-800 hover:bg-gray-100'}`}
                              >
                                <span>{opt}</span>
                                {formData.source === opt && (
                                  <svg className="w-3.5 h-3.5 text-[#ff2a85]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {errors.source && <p className="text-red-500 text-[10.5px] mt-1 ml-0.5 font-medium">{errors.source}</p>}
                  </div>

                  {/* Add an additional message */}
                  <div className="col-span-2">
                    <label className="block text-[11.5px] font-semibold text-gray-800 mb-1">Add an additional message</label>
                    <textarea
                      rows={2}
                      value={formData.message}
                      onChange={e => handleChange('message', e.target.value)}
                      placeholder="Add your message"
                      className="w-full min-w-[250px] max-w-full min-h-[44px] max-h-[150px] bg-white/70 border border-gray-200 focus:ring-gray-300 text-gray-900 rounded-[10px] px-3 py-2 text-[12px] placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors resize"
                    />
                  </div>
                </div>

                {/* Get in Touch Button */}
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                  className="w-full group bg-black hover:bg-gray-900 text-white font-medium text-[13.5px] py-2.5 rounded-xl transition-all duration-200 active:scale-[0.97] shadow-md mb-1 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <span>{isSubmitting ? 'Sending...' : 'Request Access'}</span>
                  {!isSubmitting && (
                    <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 2L11 13" />
                      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                    </svg>
                  )}
                </button>
              </form>
            )}
              </motion.div>
            )}
          </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!isMounted) return null;
  return createPortal(modalContent, document.body);
}
