"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Square, Sparkles, Check, FileText, Tag, Building2, ShieldAlert, TrendingUp, Calendar, Activity, CheckCircle, BellRing, AlertOctagon, Percent, User } from 'lucide-react';

// A tiny crosshair component for the corners
const Crosshair = ({ className }: { className?: string }) => (
  <svg 
    className={`absolute w-[9px] h-[9px] text-[#8634DE]/30 ${className}`} 
    viewBox="0 0 12 12" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
  >
    <path d="M6 0V12M0 6H12" />
  </svg>
);

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  return matches;
}

const RAW_DATA = [
  `{"date":"2025-04-06","amount":-3000.00,"currency":"INR","merchant":"Uber"}`,
  `{"date":"2025-04-07","amount":-4500.00,"currency":"INR","merchant":"Starbucks"}`,
  `{"date":"2025-04-08","amount":-1200.00,"currency":"INR","merchant":"Netflix"}`,
  `{"date":"2025-04-09","amount":-5400.00,"currency":"INR","merchant":"Amazon"}`,
  `{"date":"2025-04-10","amount":-2700.00,"currency":"INR","merchant":"Target"}`,
  `{"date":"2025-04-11","amount":-1425.00,"currency":"INR","merchant":"Subway"}`,
  `{"date":"2025-04-12","amount":-2199.00,"currency":"INR","merchant":"Spotify"}`,
  `{"date":"2025-04-13","amount":-6000.00,"currency":"INR","merchant":"Whole Foods"}`,
  `{"date":"2025-04-14","amount":-25000.00,"currency":"INR","merchant":"Rent"}`,
];

const OUTPUT_PILLS = [
  { styleType: 'alert', Icon: ShieldAlert, title: 'RISK SCORE', text: '85', iconColor: 'text-rose-400', borderColor: 'border-rose-500/30', borderLeftClass: 'border-l-rose-500', bgColor: 'bg-rose-500/10' },
  { styleType: 'doc', Icon: FileText, text: 'Bank Statement', iconColor: 'text-violet-500', borderColor: '', bgColor: '' },
  { styleType: 'pill', Icon: Tag, text: 'Category: F&B', iconColor: 'text-emerald-400', borderColor: 'border-emerald-500/30', bgColor: 'bg-emerald-500/10' },
  { styleType: 'card', Icon: Percent, title: 'Confidence', text: '78%', iconColor: 'text-fuchsia-400', borderColor: 'border-fuchsia-500/30', bgColor: 'bg-fuchsia-500/10', progressColor: 'bg-fuchsia-400' },
  { styleType: 'pill', Icon: TrendingUp, text: 'Cashflow:', iconColor: 'text-amber-400', borderColor: 'border-amber-500/30', bgColor: 'bg-amber-500/10', hasGraph: true, graphColor: 'bg-amber-400' },
  { styleType: 'doc', Icon: FileText, text: 'Risk Report', iconColor: 'text-rose-500', borderColor: '', bgColor: '' },
  { styleType: 'alert', Icon: BellRing, title: 'ALERT', text: 'High Velocity detected', iconColor: 'text-orange-400', borderColor: 'border-orange-500/30', borderLeftClass: 'border-l-orange-500', bgColor: 'bg-orange-500/10' },
  { styleType: 'pill', Icon: Activity, text: 'Context: Trusted', iconColor: 'text-blue-400', borderColor: 'border-blue-500/30', bgColor: 'bg-blue-500/10' },
  { styleType: 'status', Icon: CheckCircle, text: 'Loan Approved', iconColor: 'text-cyan-400', borderColor: 'border-cyan-500/30', bgColor: 'bg-cyan-500/10' },
  { styleType: 'doc', Icon: FileText, text: 'FinDoc Analyser', iconColor: 'text-blue-500', borderColor: '', bgColor: '' },
  { styleType: 'pill', Icon: Sparkles, text: 'Agent: Collection', iconColor: 'text-indigo-400', borderColor: 'border-indigo-500/30', bgColor: 'bg-indigo-500/10' },
  { styleType: 'alert', Icon: AlertOctagon, title: 'CRITICAL', text: 'Liquidity Risk', iconColor: 'text-red-500', borderColor: 'border-red-500/30', borderLeftClass: 'border-l-red-500', bgColor: 'bg-red-500/10' }
];

const PillContent = ({ pill }: { pill: any }) => (
  <>
    {pill.styleType === 'pill' && (
      <div className={`flex items-center gap-1.5 px-3 py-1.5 h-[28px] rounded-full bg-slate-800/90 border ${pill.borderColor} shadow-xl backdrop-blur-md`}>
        <pill.Icon className={`w-3 h-3 ${pill.iconColor}`} />
        <span className="text-slate-100 text-[10px] font-dm-sans font-medium whitespace-nowrap tracking-wide">{pill.text}</span>
        {pill.hasGraph && (
          <div className="ml-1 flex items-end gap-[3px] h-3">
            {[3, 5, 4, 7, 10].map((h, idx) => (
              <motion.div 
                key={idx}
                className={`w-[2px] ${pill.graphColor} rounded-t-sm opacity-80`} 
                initial={{ height: h }} 
                animate={{ height: [h, h * 0.6, h] }} 
                transition={{ repeat: Infinity, duration: 1.5, delay: idx * 0.2 }} 
              />
            ))}
          </div>
        )}
      </div>
    )}
    {pill.styleType === 'card' && (
      <div className={`flex items-center justify-between py-1 px-2.5 min-w-[110px] rounded-xl bg-slate-800/95 border ${pill.borderColor} ${pill.bgColor} shadow-2xl backdrop-blur-md`}>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <pill.Icon className={`w-3 h-3 ${pill.iconColor}`} />
            <span className="text-slate-300 text-[8px] font-bold tracking-widest uppercase">{pill.title}</span>
          </div>
          <span className="text-slate-100 text-[9px] font-dm-sans font-medium opacity-70 ml-[18px] leading-none">High accuracy</span>
        </div>
        
        <div className={`relative flex items-center justify-center w-5 h-5 ml-2 ${pill.iconColor}`}>
          <svg width="20" height="20" viewBox="0 0 20 20" className="absolute transform -rotate-90">
            <circle cx="10" cy="10" r="8" fill="transparent" stroke="currentColor" strokeWidth="2.5" className="opacity-20" />
            <motion.circle 
              cx="10" cy="10" r="8" fill="transparent" 
              stroke="currentColor" strokeWidth="2.5" 
              strokeDasharray="50.2" 
              strokeDashoffset="50.2" 
              strokeLinecap="round"
              initial={{ strokeDashoffset: 50.2 }}
              animate={{ strokeDashoffset: 50.2 - (50.2 * (parseInt(pill.text) / 100)) }} 
              transition={{ duration: 1.5, delay: 0.3, ease: [0.23, 1, 0.32, 1] }} 
            />
          </svg>
          <span className="absolute text-[7px] font-bold">{pill.text}</span>
        </div>
      </div>
    )}
    {pill.styleType === 'alert' && (
      <div className={`flex items-center gap-2 py-1 px-2.5 min-w-[110px] rounded-md border-y border-r border-l-[3px] ${pill.borderColor} ${pill.borderLeftClass} ${pill.bgColor} shadow-xl backdrop-blur-md`}>
        <pill.Icon className={`w-3 h-3 ${pill.iconColor}`} />
        <div className="flex flex-col justify-center">
          <span className={`text-[8px] font-bold tracking-widest uppercase ${pill.iconColor} leading-tight`}>{pill.title}</span>
          <span className="text-slate-100 text-[9.5px] font-dm-sans font-medium leading-tight">{pill.text}</span>
        </div>
      </div>
    )}
    {pill.styleType === 'status' && (
      <div className={`flex items-center gap-1.5 py-1 px-2.5 rounded-full border ${pill.borderColor} bg-slate-800/95 shadow-xl backdrop-blur-md`}>
        <pill.Icon className={`w-3 h-3 ${pill.iconColor}`} />
        <span className="text-slate-100 text-[10px] font-dm-sans font-medium tracking-wide whitespace-nowrap">{pill.text}</span>
      </div>
    )}
    {pill.styleType === 'doc' && (
      <div className="flex flex-col bg-slate-50 p-1.5 rounded shadow-xl border border-slate-200 w-[45px] h-[55px]">
        <div className="flex items-center gap-1 mb-1.5">
          <pill.Icon className={`w-2.5 h-2.5 ${pill.iconColor}`} />
          <div className="h-[2px] w-3 bg-slate-300 rounded-full"></div>
        </div>
        <div className="w-full h-[2px] bg-slate-200 rounded-full mb-1"></div>
        <div className="w-4/5 h-[2px] bg-slate-200 rounded-full mb-1"></div>
        <div className="w-full h-[2px] bg-slate-200 rounded-full mb-1"></div>
        <div className="w-2/3 h-[2px] bg-slate-200 rounded-full mb-2"></div>
        <div className="w-1/2 h-[2px] bg-slate-300 rounded-full mt-auto ml-auto"></div>
      </div>
    )}
  </>
);

export default function ZeyroWhatWeDo() {
  const [activeStep, setActiveStep] = useState(0);
  const [arrivedStep, setArrivedStep] = useState(0);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    let delay = 3000;
    if (arrivedStep === 0) delay = 1500; // Start first traversal much sooner
    
    const timer = setTimeout(() => {
      setActiveStep(s => (s + 1) % 4);
    }, delay);
    return () => clearTimeout(timer);
  }, [arrivedStep]);

  return (
    <div className="w-full max-w-[100rem] mx-auto px-6 md:pl-[280px] lg:pl-[320px] lg:pr-12 pb-4 lg:pb-8 pointer-events-auto flex justify-center">
      <div className="w-full">

        {/* The Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          viewport={{ once: true, margin: "-50px" }}
          className="relative w-full border border-dashed border-slate-300/80 bg-white shadow-sm"
        >
          {/* Crosshairs - corners */}
          <Crosshair className="-top-[4px] -left-[4px]" />
          <Crosshair className="-top-[4px] -right-[4px]" />
          <Crosshair className="-bottom-[4px] -left-[4px]" />
          <Crosshair className="-bottom-[4px] -right-[4px]" />
          
          {/* Crosshairs - center dividers (desktop only) */}
          <Crosshair className="-top-[4px] left-1/2 -translate-x-1/2 hidden md:block" />
          <Crosshair className="-bottom-[4px] left-1/2 -translate-x-1/2 hidden md:block" />

          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Left: Legacy */}
            <div className="relative overflow-hidden flex flex-col md:border-r border-dashed border-slate-300/80 border-b md:border-b-0 bg-[#F8FAFC]">
              
              {/* --- The Legacy Animation Header --- */}
              <div className="relative w-full md:h-[400px] py-12 md:py-0 overflow-hidden flex flex-col items-center justify-center shrink-0 border-b border-dashed border-slate-300/80">
                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                {/* --- DESKTOP VIEW (Horizontal Pipeline) --- */}
                <div className="hidden md:flex flex-col items-center w-full z-10 py-6">
                  <div className="relative w-[90%] h-[120px] flex items-center justify-between">
                    
                    {/* Absolute Continuous Pipeline Track */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-[40px] right-[40px] h-[3px] flex z-0">
                      <div className="w-[66.66%] h-full bg-slate-300" />
                      <div className="w-[33.33%] h-full border-t-[3px] border-dashed border-slate-300" />
                      
                      {/* Global Data Packet */}
                      <motion.div
                        className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center -ml-2 w-4 h-4 z-10"
                        initial={false}
                        animate={{ left: `${(activeStep / 3) * 100}%` }}
                        transition={{ duration: activeStep === 0 ? 0 : 5, ease: [0.4, 0, 0.2, 1] }}
                        onAnimationComplete={() => setArrivedStep(activeStep)}
                      >
                        <AnimatePresence mode="wait">
                          {arrivedStep === 0 && (
                            <motion.div 
                              key="cluster" 
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0 }} 
                              className="relative w-2.5 h-2.5"
                            >
                               <div className="absolute top-0 left-0 w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-sm" />
                               <div className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm z-10" />
                               <div className="absolute bottom-0 left-0 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm z-20" />
                               <div className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-rose-400 shadow-sm z-30" />
                            </motion.div>
                          )}
                          {arrivedStep === 1 && (
                            <motion.div 
                              key="grey-orb" 
                              initial={{ opacity: 0, scale: 0 }} 
                              animate={{ opacity: 1, scale: 1 }} 
                              exit={{ opacity: 0, scale: 0 }}
                              className="w-2.5 h-2.5 rounded-full bg-slate-400" 
                            />
                          )}
                          {arrivedStep >= 2 && (
                            <motion.div 
                              key="triangle" 
                              initial={{ opacity: 0, scale: 0, rotate: -90 }} 
                              animate={{ opacity: 1, scale: 1, rotate: 90 }} 
                              exit={{ opacity: 0, scale: 0, rotate: 180 }}
                              className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-slate-400" 
                            />
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </div>

                    {/* Station 1: Data Ingest */}
                    <div className="flex flex-col items-center justify-center relative z-10 w-20 h-20 shrink-0 transition-transform">
                      <div className="w-20 h-20 flex items-center justify-center relative z-10">
                        <div className="w-16 h-16 bg-white border-2 border-slate-300 flex flex-col items-center justify-center shadow-sm relative">
                          <User className="w-6 h-6 mb-1 text-slate-400" strokeWidth={1.5} />
                          <span className="text-[7px] font-bold text-slate-400">CUSTOMER</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-slate-400 bg-[#F8FAFC] px-1">T-MINUS 24H</span>
                    </div>

                    {/* Station 2: Funnel */}
                    <div className="flex flex-col items-center justify-center relative z-10 w-20 h-20 shrink-0 transition-transform">
                      <div className="w-20 h-20 flex items-center justify-center relative z-10">
                        <div className="w-16 h-16 relative flex items-center justify-center mt-2">
                          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm overflow-visible absolute inset-0 z-0">
                            <path d="M 5,5 L 60,35 L 95,35 L 95,65 L 60,65 L 5,95 Z" className="fill-white stroke-2 stroke-slate-300" strokeLinejoin="round" />
                          </svg>
                          <div className="z-10 flex flex-col items-center justify-center -ml-3">
                             <span className="text-[6.5px] font-bold text-slate-400">LEGACY BANK</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-slate-400 bg-[#F8FAFC] px-1">CONTEXT LOSS</span>
                    </div>

                    {/* Station 3: Batch Engine */}
                    <div className="flex flex-col items-center justify-center relative z-10 w-20 h-20 shrink-0 transition-transform">
                      <div className="w-20 h-20 bg-slate-800 border-2 border-slate-700 flex flex-col items-center shadow-lg relative overflow-hidden">
                        <div className="w-full h-4 bg-slate-900 flex items-center px-1 border-b border-slate-700 shrink-0">
                           <span className="text-[6px] text-slate-400 font-mono">RULE_ENGINE</span>
                        </div>
                        <div className="w-full h-full relative overflow-hidden flex flex-col pt-1 bg-slate-800">
                          <motion.div 
                            className="flex flex-col gap-1 w-full px-1.5"
                            animate={{ y: [0, -32] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <div className="text-[7px] font-mono text-emerald-400 whitespace-nowrap">IF RISK {'>'} 80</div>
                            <div className="text-[7px] font-mono text-slate-300 whitespace-nowrap">THEN REJECT</div>
                            <div className="text-[7px] font-mono text-slate-300 whitespace-nowrap">AWAIT MANUAL</div>
                            <div className="text-[7px] font-mono text-rose-400 whitespace-nowrap">ERR_NO_CONTEXT</div>
                            <div className="text-[7px] font-mono text-slate-300 whitespace-nowrap">LOG_TO_DB</div>
                          </motion.div>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-slate-400 bg-[#F8FAFC] px-1">BATCH WINDOW</span>
                    </div>

                    {/* Station 4: Output */}
                    <div className="flex flex-col items-center justify-center relative z-10 w-20 h-20 shrink-0 transition-transform">
                      <div className="w-20 h-20 flex items-center justify-center relative bg-[#F8FAFC] z-10">
                        <div className={`w-16 h-16 bg-white border-2 flex flex-col items-center justify-center shadow-sm overflow-hidden relative transition-colors duration-300 ${activeStep === 3 ? 'border-rose-300' : 'border-slate-300'}`}>
                          <AnimatePresence mode="wait">
                            {activeStep !== 3 ? (
                              <motion.div 
                                key="incomplete"
                                className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                              >
                                <span className="text-[7px] font-bold text-slate-400 text-center px-2 leading-tight">INCOMPLETE SCORE</span>
                              </motion.div>
                            ) : (
                              <motion.div 
                                key="report"
                                className="absolute inset-0 flex flex-col items-center p-2 bg-white"
                                initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1.5, duration: 0.3 }}
                              >
                                <div className="w-full flex justify-between items-center mb-2">
                                   <div className="w-3 h-3 bg-slate-200" />
                                   <div className="w-6 h-1.5 bg-slate-800" />
                                </div>
                                <div className="w-full space-y-1 mt-1">
                                  <div className="w-full h-1.5 bg-slate-800" />
                                  <div className="w-3/4 h-1.5 bg-slate-800" />
                                  <div className="w-5/6 h-1.5 bg-slate-800" />
                                </div>
                                <span className="absolute bottom-1 text-[5px] font-bold text-rose-500 whitespace-nowrap">REDACTED DATA</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-slate-400 bg-[#F8FAFC] px-1">T-PLUS 48H</span>
                    </div>
                  </div>

                  {/* Animated Explanations */}
                  <div className="relative w-[90%] h-24 mt-8 flex justify-center">
                    <AnimatePresence mode="wait">
                      {arrivedStep === 0 && (
                        <motion.div
                          key="step0"
                          className="absolute inset-0 flex flex-col items-center text-center"
                          initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}
                        >
                          <div className="text-[12px] font-bold text-rose-500 mb-2 tracking-wider uppercase">DATA COLLECTION</div>
                          <div className="text-sm text-slate-600 font-dm-sans leading-relaxed max-w-md">User data is collected.</div>
                        </motion.div>
                      )}
                      {arrivedStep === 1 && (
                        <motion.div
                          key="step1"
                          className="absolute inset-0 flex flex-col items-center text-center"
                          initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}
                        >
                          <div className="text-[12px] font-bold text-rose-500 mb-2 tracking-wider uppercase">CONTEXT LOSS</div>
                          <div className="text-sm text-slate-600 font-dm-sans leading-relaxed max-w-md">Crucial financial viewpoints are lost.</div>
                        </motion.div>
                      )}
                      {arrivedStep === 2 && (
                        <motion.div
                          key="step2"
                          className="absolute inset-0 flex flex-col items-center text-center"
                          initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}
                        >
                          <div className="text-[12px] font-bold text-rose-500 mb-2 tracking-wider uppercase">STATIC RULES</div>
                          <div className="text-sm text-slate-600 font-dm-sans leading-relaxed max-w-md">Hardcoded thresholds reject credit-worthy thin-file customers.</div>
                        </motion.div>
                      )}
                      {arrivedStep === 3 && (
                        <motion.div
                          key="step3"
                          className="absolute inset-0 flex flex-col items-center text-center"
                          initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}
                        >
                          <div className="text-[12px] font-bold text-rose-500 mb-2 tracking-wider uppercase">INCOMPLETE REPRESENTATION</div>
                          <div className="text-sm text-slate-600 font-dm-sans leading-relaxed max-w-md">A rigid score doesn't represent the user completely.</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* --- MOBILE VIEW --- */}
                <div className="md:hidden flex flex-col w-full px-4 z-10 py-6 relative">
                  <div className="absolute top-[40px] bottom-[40px] left-[46px] w-[3px] flex flex-col z-0">
                    <div className="h-[66.66%] w-full bg-slate-300" />
                    <div className="h-[33.33%] w-full border-l-[3px] border-dashed border-slate-300" />
                    <motion.div
                      className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center -mt-2 w-4 h-4 z-10"
                      initial={false}
                      animate={{ top: `${(activeStep / 3) * 100}%` }}
                      transition={{ duration: activeStep === 0 ? 0 : 5, ease: [0.4, 0, 0.2, 1] }}
                      onAnimationComplete={() => setArrivedStep(activeStep)}
                    >
                      <AnimatePresence mode="wait">
                        {arrivedStep === 0 && (
                          <motion.div 
                            key="cluster" 
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }} 
                            className="relative w-2.5 h-2.5"
                          >
                             <div className="absolute top-0 left-0 w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-sm" />
                             <div className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm z-10" />
                             <div className="absolute bottom-0 left-0 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm z-20" />
                             <div className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-rose-400 shadow-sm z-30" />
                          </motion.div>
                        )}
                        {arrivedStep === 1 && (
                          <motion.div 
                            key="grey-orb" 
                            initial={{ opacity: 0, scale: 0 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            exit={{ opacity: 0, scale: 0 }}
                            className="w-2.5 h-2.5 rounded-full bg-slate-400" 
                          />
                        )}
                        {arrivedStep >= 2 && (
                          <motion.div 
                            key="triangle" 
                            initial={{ opacity: 0, scale: 0, rotate: 0 }} 
                            animate={{ opacity: 1, scale: 1, rotate: 180 }} 
                            exit={{ opacity: 0, scale: 0, rotate: 270 }}
                            className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-slate-400" 
                          />
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                  
                  <div className="flex flex-col gap-8 w-full z-10">
                    <div className="flex items-center gap-4 relative z-10 transition-opacity duration-300" style={{ opacity: arrivedStep === 0 ? 1 : 0.3 }}>
                      <div className="w-16 h-16 shrink-0 bg-white border-2 border-slate-300 flex flex-col items-center justify-center shadow-sm relative z-10">
                        <User className="w-6 h-6 text-slate-400 mb-1" strokeWidth={1.5} />
                        <span className="text-[7px] font-bold text-slate-400">CUSTOMER</span>
                      </div>
                      <div className="flex flex-col p-3 bg-white border border-rose-200 rounded-lg shadow-sm w-full">
                        <div className="text-[10px] font-bold text-rose-500 mb-1 tracking-wider uppercase">DATA COLLECTION</div>
                        <div className="text-xs text-slate-600 font-dm-sans leading-snug">User data is collected.</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 relative z-10 transition-opacity duration-300" style={{ opacity: arrivedStep === 1 ? 1 : 0.3 }}>
                      <div className="w-16 h-16 shrink-0 relative flex items-center justify-center z-10 mt-2">
                        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm overflow-visible absolute inset-0 z-0">
                          <path d="M 5,5 L 95,5 L 65,60 L 65,95 L 35,95 L 35,60 Z" className="fill-white stroke-slate-300 stroke-2" strokeLinejoin="round" />
                        </svg>
                        <div className="z-10 flex flex-col items-center justify-center -mt-2">
                          <span className="text-[6.5px] font-bold text-slate-400">LEGACY BANK</span>
                        </div>
                      </div>
                      <div className="flex flex-col p-3 bg-white border border-rose-200 rounded-lg shadow-sm w-full">
                        <div className="text-[10px] font-bold text-rose-500 mb-1 tracking-wider uppercase">CONTEXT LOSS</div>
                        <div className="text-xs text-slate-600 font-dm-sans leading-snug">Crucial financial viewpoints are lost.</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 relative z-10 transition-opacity duration-300" style={{ opacity: arrivedStep === 2 ? 1 : 0.3 }}>
                      <div className="w-16 h-16 shrink-0 bg-slate-800 border-2 border-slate-700 flex flex-col items-center shadow-lg relative overflow-hidden z-10">
                        <div className="w-full h-4 bg-slate-900 flex items-center justify-center border-b border-slate-700 shrink-0">
                           <span className="text-[5px] text-slate-400 font-mono">RULE_ENGINE</span>
                        </div>
                        <div className="w-full h-full relative overflow-hidden flex flex-col pt-1 bg-slate-800">
                          <motion.div className="flex flex-col gap-1 w-full px-1.5" animate={{ y: [0, -32] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                            <div className="text-[7px] font-mono text-emerald-400">IF RISK {'>'} 80</div>
                            <div className="text-[7px] font-mono text-slate-300">THEN REJECT</div>
                            <div className="text-[7px] font-mono text-rose-400">ERR_NO_CONTEXT</div>
                          </motion.div>
                        </div>
                      </div>
                      <div className="flex flex-col p-3 bg-white border border-rose-200 rounded-lg shadow-sm w-full">
                        <div className="text-[10px] font-bold text-rose-500 mb-1 tracking-wider uppercase">STATIC RULES</div>
                        <div className="text-xs text-slate-600 font-dm-sans leading-snug">Hardcoded thresholds reject credit-worthy thin-file customers.</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 relative z-10 transition-opacity duration-300" style={{ opacity: arrivedStep === 3 ? 1 : 0.3 }}>
                      <div className="w-16 h-16 shrink-0 bg-white border-2 border-rose-300 flex flex-col items-center justify-center shadow-sm overflow-hidden relative z-10">
                        <AnimatePresence mode="wait">
                          {activeStep !== 3 ? (
                            <motion.div key="incomplete" className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                              <span className="text-[7px] font-bold text-slate-400 text-center px-2 leading-tight">INCOMPLETE SCORE</span>
                            </motion.div>
                          ) : (
                            <motion.div key="report" className="absolute inset-0 flex flex-col items-center p-2 bg-white" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.5, duration: 0.3 }}>
                              <div className="w-full flex justify-between items-center mb-2">
                                 <div className="w-3 h-3 bg-slate-200" />
                                 <div className="w-6 h-1.5 bg-slate-800" />
                              </div>
                              <div className="w-full space-y-1 mt-1">
                                <div className="w-full h-1.5 bg-slate-800" />
                                <div className="w-3/4 h-1.5 bg-slate-800" />
                                <div className="w-5/6 h-1.5 bg-slate-800" />
                              </div>
                              <span className="absolute bottom-1 text-[5px] font-bold text-rose-500 whitespace-nowrap">REDACTED DATA</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="flex flex-col p-3 bg-white border border-rose-200 rounded-lg shadow-sm w-full">
                        <div className="text-[10px] font-bold text-rose-500 mb-1 tracking-wider uppercase">INCOMPLETE REPRESENTATION</div>
                        <div className="text-xs text-slate-600 font-dm-sans leading-snug">A rigid score doesn't represent the user completely.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Content */}
              <div className="p-6 md:p-8 flex flex-col h-full bg-white">
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] uppercase text-slate-400 mb-8 font-dm-mono">
                  <div className="border border-slate-300 rounded-[2px] p-[2px] flex items-center justify-center">
                    <X className="w-2.5 h-2.5" strokeWidth={2.5} />
                  </div>
                  LEGACY · TRADITIONAL FINANCE
                </div>

                <div className="mb-12">
                  <h3 className="text-[22px] md:text-[26px] font-space-grotesk font-normal text-slate-400 leading-[1.3] line-through decoration-slate-400/60 decoration-2">
                    Static data. Fragmented history. Every financial decision starts from zero.
                  </h3>
                </div>

                <ul className="space-y-5">
                  {[
                    "Siloed ledgers, batch processing, rigid rule engines",
                    "Static credit scores; no contextual intelligence",
                    "Transactional records, not financial memory"
                  ].map((text, i) => (
                    <li key={i} className="flex items-center gap-3 text-[14px] text-slate-400 font-dm-sans leading-relaxed">
                      <X className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={2} />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: Zeyro */}
            <div className="relative overflow-hidden group transition-colors duration-500 flex flex-col bg-white">
              
              {/* --- The Animation Header --- */}
              <div className="relative w-full h-[400px] bg-[#0B0F19] overflow-hidden flex items-center justify-center shrink-0 border-b border-dashed border-slate-300/80">
                
                {/* 1. Left Side Diagonal Fanning Scrolling Text */}
                <div className="absolute top-0 left-0 w-1/2 h-full flex items-center justify-end overflow-hidden z-10 bg-[#0B0F19]">
                  <div className="relative w-full h-full flex items-center justify-end" style={{ WebkitMaskImage: 'radial-gradient(circle at 100% 50%, black 10%, transparent 90%)' }}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 flex items-center justify-center">
                      {[40, 30, 20, 10, -10, -20, -30, -40].map((angle, i) => (
                        <div key={angle} className="absolute right-0 w-0 h-0 flex items-center justify-center" style={{ transform: `rotate(${angle}deg)` }}>
                          <motion.div
                            className="absolute right-0 shrink-0 flex justify-end items-center whitespace-nowrap text-slate-500 font-mono text-[10px] font-medium"
                            animate={{ transform: ['translateX(0%)', 'translateX(50%)'] }}
                            transition={{ duration: 90 + i * 15, repeat: Infinity, ease: "linear" }}
                          >
                            <div className="shrink-0 pr-8">{RAW_DATA.join("  ")}</div>
                            <div className="shrink-0 pr-8">{RAW_DATA.join("  ")}</div>
                          </motion.div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Right Side Glowing Light Beam (Spinning Prism masked by Frame cutout) */}
                <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[800px] h-[800px] pointer-events-none z-0 flex items-center justify-center">
                  {/* The spinning full rainbow gradient */}
                  <motion.div 
                    className="absolute w-full h-full rounded-full"
                    style={{
                      background: 'conic-gradient(from 45deg at 50% 50%, #EF4444, #F97316, #EAB308, #22C55E, #3B82F6, #6366F1, #A855F7, #EF4444)',
                      WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 10%, transparent 70%)',
                      filter: 'blur(8px)',
                      opacity: 0.8,
                      mixBlendMode: 'screen'
                    }}
                    animate={{ transform: ['rotate(0deg)', 'rotate(360deg)'] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  />
                  {/* The Frame Cutout that acts as a physical blinder */}
                  <div 
                    className="absolute w-full h-full"
                    style={{
                      background: 'conic-gradient(from 90deg at 50% 50%, transparent 30deg, #0B0F19 45deg, #0B0F19 135deg, transparent 135deg, transparent 225deg, #0B0F19 225deg, #0B0F19 315deg, transparent 345deg)'
                    }}
                  />
                </div>

                {/* 3. Center ZEYR Rings & Badge */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border border-white/20 bg-slate-800/80 flex items-center justify-center backdrop-blur-md shadow-2xl">
                    <Sparkles className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>

                {/* 4. Output Animated Pills (One by One) */}
                <div className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30">
                  {OUTPUT_PILLS.map((pill, i) => {
                    const TOTAL_DURATION = 42; // 3.5s per item
                    const segment = 1 / OUTPUT_PILLS.length;
                    
                    // Emil Engineering: Keep the pop fast even though duration is long
                    // segment = 0.1 (3.5 seconds). pop = 0.1 of segment (0.35s)
                    const pop = segment * 0.1; 
                    const stay = segment * 0.5; 
                    const fade = segment * 0.85; 

                    const delay = i * (TOTAL_DURATION / OUTPUT_PILLS.length);

                    return (
                      <div key={`pill-wrapper-${OUTPUT_PILLS.length}-${i}`} className="absolute top-1/2 left-1/2 w-0 h-0 flex items-center justify-center">
                        
                        {/* MOBILE VERSION */}
                        <motion.div
                          className="flex md:hidden items-center justify-center"
                          animate={{
                            x: [0, 50, 70, 90, 90],
                            scale: [0.4, 0.85, 0.85, 0.7, 0.7],
                            opacity: [0, 1, 1, 0, 0]
                          }}
                          transition={{ 
                            duration: TOTAL_DURATION, 
                            repeat: Infinity, 
                            delay, 
                            times: [0, pop, stay, fade, 1],
                            ease: "easeOut" 
                          }}
                        >
                          <PillContent pill={pill} />
                        </motion.div>

                        {/* DESKTOP VERSION */}
                        <motion.div
                          className="hidden md:flex items-center justify-center"
                          animate={{
                            x: [0, 120, 150, 180, 180],
                            scale: [0.5, 1, 1, 0.8, 0.8],
                            opacity: [0, 1, 1, 0, 0]
                          }}
                          transition={{ 
                            duration: TOTAL_DURATION, 
                            repeat: Infinity, 
                            delay, 
                            times: [0, pop, stay, fade, 1],
                            ease: "easeOut" 
                          }}
                        >
                          <PillContent pill={pill} />
                        </motion.div>

                      </div>
                  );
                })}
                </div>
              </div>

              {/* --- Text Area --- */}
              <div className="p-6 md:p-8 relative flex-grow bg-white hover:bg-slate-50/30 transition-colors duration-500">
                {/* Subtle background glow for Zeyr side */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(134,52,222,0.04)_0%,_transparent_70%)] pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] uppercase text-[#8634DE] mb-6 font-dm-mono relative z-10">
                  <Sparkles className="w-4 h-4" strokeWidth={2} />
                  INTELLIGENCE
                </div>

                <h3 className="text-[20px] md:text-[24px] font-space-grotesk font-normal text-slate-900 leading-[1.3] mb-8 tracking-tight relative z-10">
                  Financial context that evolves. Intelligence that understands behaviour, predicts risk, and acts in real-time.
                </h3>

                <ul className="space-y-4 relative z-10">
                  {[
                    "Unified financial identity and behaviour-aware graph",
                    "Real-time underwriting, dynamic risk, adaptive decisions",
                    "One API: ingest, understand, automate"
                  ].map((text, i) => (
                    <li key={i} className="flex items-center gap-3 text-[13px] text-slate-700 font-dm-sans leading-relaxed">
                      <Square className="w-3 h-3 fill-[#8634DE] text-[#8634DE] shrink-0" strokeWidth={2} />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>

            </div>

          </div>
        </motion.div>

      </div>
    </div>
  );
}
