"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, Variants, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search, X, ArrowDownToLine, ArrowUpToLine, Wallet, CheckCircle, Building2, Gift } from 'lucide-react';

const emilVariant: Variants = {
  hidden: { opacity: 0, scale: 0.95, filter: 'blur(8px)' },
  visible: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { type: "spring", bounce: 0, duration: 0.85 } },
  exit: { opacity: 0, scale: 0.95, filter: 'blur(4px)', transition: { duration: 0.4 } }
};

const viewTransition: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, staggerChildren: 0.12 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

export default function BFSProcessFlow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });
  const [activeView, setActiveView] = useState<'consumer' | 'first-party'>('consumer');

  return (
    <section 
      ref={containerRef}
      className="w-full min-h-screen bg-[#f5f5f5] py-24 px-4 md:px-8 flex items-center justify-center relative overflow-hidden"
    >
      <div className="max-w-[1400px] w-full mx-auto relative flex flex-col gap-6">
        
        {/* Massive Container Card - Clean white theme framing the views */}
        <div className="w-full bg-white rounded-[32px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-200/50 p-8 md:p-10 min-h-[650px] flex flex-col relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none"></div>

          {/* Header & Toggle */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 relative z-20">
            <h2 className="text-2xl font-bold text-gray-900 hidden md:block tracking-tight">Cash Flow Underwriting</h2>
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm">
              <button 
                onClick={() => setActiveView('consumer')}
                className={`px-5 py-2 rounded-xl text-[13px] font-semibold transition-all duration-500 ${
                  activeView === 'consumer' 
                    ? 'bg-gray-900 text-white shadow-md' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Consumer-permissioned
              </button>
              <button 
                onClick={() => setActiveView('first-party')}
                className={`px-5 py-2 rounded-xl text-[13px] font-semibold transition-all duration-500 ${
                  activeView === 'first-party' 
                    ? 'bg-gray-900 text-white shadow-md' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                First-party
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeView === 'consumer' ? (
              <ConsumerView key="consumer" isInView={isInView} />
            ) : (
              <FirstPartyView key="first-party" />
            )}
          </AnimatePresence>

        </div>
      </div>
    </section>
  );
}

function ConsumerView({ isInView }: { isInView: boolean }) {
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={viewTransition}
      className="relative grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-1"
    >
      {/* Grid-Aligned Dotted Connectors - Overshoot technique for perfect masking */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none hidden lg:block z-0" style={{ minHeight: '600px' }}>
        {/* 1. Phone to Profile */}
        <line x1="10%" y1="28%" x2="50%" y2="28%" stroke="#f97316" strokeWidth="2" strokeDasharray="6 6" opacity="0.6" />
        
        {/* 2. Phone to API/Code Box */}
        <line x1="10%" y1="70%" x2="50%" y2="70%" stroke="#f97316" strokeWidth="2" strokeDasharray="6 6" opacity="0.6" />
        
        {/* 3. Profile to Platinum Card */}
        <line x1="40%" y1="28%" x2="90%" y2="28%" stroke="#f97316" strokeWidth="2" strokeDasharray="6 6" opacity="0.6" />
        
        {/* 4. Platinum Card down to Reward */}
        <line x1="78%" y1="20%" x2="78%" y2="55%" stroke="#f97316" strokeWidth="2" strokeDasharray="6 6" opacity="0.6" />
        
        {/* 5. Reward down to Approved Message */}
        <line x1="78%" y1="50%" x2="78%" y2="85%" stroke="#f97316" strokeWidth="2" strokeDasharray="6 6" opacity="0.6" />
      </svg>

      {/* Col 1: Phone Mockup */}
      <motion.div variants={emilVariant} className="relative z-10 flex justify-center md:col-span-4 lg:col-span-3">
        <div className="w-[280px] h-[560px] bg-white border-[8px] border-slate-900 rounded-[48px] shadow-2xl relative overflow-hidden flex flex-col">
          {/* Dynamic Island */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[85px] h-[25px] bg-black rounded-full z-30"></div>
          
          <div className="p-6 pt-12 flex-1 flex flex-col relative z-20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <ChevronLeft className="w-5 h-5 text-gray-900" />
                <h3 className="font-bold text-gray-900 text-lg tracking-tight">Select Bank</h3>
              </div>
            </div>

            <div className="relative mb-6">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input id="search-banks" name="search-banks" type="text" placeholder="Search Banks" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-9 pr-4 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto pb-6 scrollbar-hide">
              {[
                { name: 'SBI' },
                { name: 'HDFC Bank', active: true },
                { name: 'ICICI Bank' },
                { name: 'Axis Bank' },
                { name: 'Kotak' },
                { name: 'Yes Bank' }
              ].map((bank) => (
                <div key={bank.name} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  bank.active ? 'border-orange-500 bg-orange-50 shadow-sm' : 'border-gray-200 bg-white hover:border-orange-300'
                }`}>
                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center shadow-sm overflow-hidden p-1 shrink-0">
                    <span className="text-xs font-bold text-gray-700">{bank.name.charAt(0)}</span>
                  </div>
                  <span className={`text-sm font-semibold ${bank.active ? 'text-orange-700' : 'text-gray-700'}`}>{bank.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Col 2: Profile & Code */}
      <div className="flex flex-col gap-6 relative z-10 md:col-span-4 lg:col-span-4 h-full justify-center">
        {/* Member Profile */}
        <motion.div variants={emilVariant} className="bg-white rounded-2xl p-5 shadow-xl shadow-gray-200/50 border border-gray-200 relative">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-gray-900 text-sm">Member Profile</h3>
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-semibold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Powered by</span>
              <span className="text-[14px] tracking-tight text-gray-900 leading-none" style={{ fontFamily: 'var(--font-syne)', fontWeight: 800 }}>Zeyro</span>
            </div>
          </div>

          <div className="flex justify-between items-end mb-4 pb-4 border-b border-gray-100">
            <div>
              <div className="font-bold text-gray-900 text-base mb-0.5">Shreya Sharma</div>
              <div className="text-[11px] text-gray-500">Senior Manager @ ABC Corp</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">BFS Score</div>
              <div className="font-bold text-xl text-blue-600 leading-none">754</div>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="text-[10px] font-bold text-gray-900 uppercase tracking-wider mb-2">Key Factors</div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Income</span>
              <span className="font-semibold text-gray-900">₹20,24,240.45</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Savings</span>
              <span className="font-semibold text-gray-900">₹4,25,160.00</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">EMI Commitments</span>
              <span className="font-semibold text-gray-900">₹15,430.20</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Spend Behaviour</span>
              <span className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Stable</span>
            </div>
          </div>
        </motion.div>

        {/* Code Snippet - macOS Terminal style */}
        <motion.div variants={emilVariant} className="bg-white rounded-xl shadow-xl shadow-gray-200/50 border border-gray-200 overflow-hidden relative">
          <div className="bg-gray-50 px-3 py-2 flex items-center gap-1.5 border-b border-gray-200">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
            <span className="ml-3 text-[10px] font-mono text-gray-500">Zeyro_data.py</span>
          </div>
          <div className="p-4 text-[11px] font-mono overflow-x-auto bg-white">
            <pre className="text-gray-800 leading-relaxed">
              <span className="text-gray-300 mr-2">01</span><span className="text-blue-600">customer</span> = <span className="text-purple-600">Zeyro.fetch</span>({`{`}{"\n"}
              <span className="text-gray-300 mr-2">02</span>  <span className="text-orange-500">"USER_ID"</span>,{"\n"}
              <span className="text-gray-300 mr-2">03</span>  headers: {`{`}<span className="text-orange-500">"Authorization"</span>: <span className="text-orange-500">"Bearer YOUR_API_KEY"</span>{`}`},{"\n"}
              <span className="text-gray-300 mr-2">04</span>  params: {`{`}<span className="text-orange-500">"data_type"</span>: <span className="text-orange-500">"de_identified"</span>{`}`}{"\n"}
              <span className="text-gray-300 mr-2">05</span>{`}`}).<span className="text-purple-600">json</span>(<span className="text-teal-600">ZEYRO_JSON_DATA</span>){"\n"}
              <span className="text-gray-300 mr-2">06</span>{"\n"}
              <span className="text-gray-300 mr-2">07</span><span className="text-pink-600">if</span> customer {">"} <span className="text-indigo-500">750</span>:{"\n"}
              <span className="text-gray-300 mr-2">08</span>  user_approved = <span className="text-blue-600">True</span>
            </pre>
          </div>
        </motion.div>
      </div>

      {/* Col 3: Elite Card & Approval */}
      <div className="flex flex-col gap-6 relative z-10 md:col-span-4 lg:col-span-5 h-full pt-8">
        {/* Frosty Platinum Business Card */}
        <motion.div variants={emilVariant} className="bg-gradient-to-br from-white via-blue-50 to-gray-200 rounded-2xl p-6 shadow-xl shadow-blue-900/5 border border-white aspect-[1.58/1] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
          
          <div className="flex justify-between items-center relative z-10">
            <h3 className="text-xl tracking-tighter text-gray-900 flex items-center gap-1.5">
              <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 800 }}>Zeyro</span> <span className="font-light opacity-80 text-blue-600 font-sans">Platinum</span>
            </h3>
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          
          <div className="w-10 h-7 bg-gray-200/80 rounded-md border border-gray-300 relative z-10 mt-6 backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent rounded-md"></div>
          </div>
          
          <div className="mt-auto relative z-10 flex justify-between items-end">
            <div>
              <div className="text-gray-800 font-mono text-base tracking-widest mb-1 font-semibold">•••• •••• •••• 5678</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Shreya</div>
            </div>
            <div className="text-xl font-black text-blue-600 italic tracking-tighter opacity-90">VISA</div>
          </div>
        </motion.div>

        {/* Rewards Widget */}
        <motion.div variants={emilVariant} className="bg-white rounded-2xl p-4 shadow-xl shadow-gray-200/50 border border-gray-200 flex items-center gap-4 relative">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Gift className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Zeyro Rewards Card</div>
            <div className="text-sm font-bold text-gray-900 mb-0.5">Earn 40,000 bonus points</div>
            <div className="text-xs text-gray-500">2x points on travel</div>
          </div>
        </motion.div>

        {/* Congratulations Notice */}
        <motion.div variants={emilVariant} className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-200 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div>
              <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Great news, Shreya!</h4>
              <h3 className="text-xl font-bold text-blue-600">You're approved!</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <span className="text-xl">🎉</span>
            </div>
          </div>
          
          <p className="text-xs text-gray-600 leading-relaxed relative z-10 pr-4 font-medium">
            Find out how you can start using rewards from your new card today.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

function FirstPartyView() {
  const [trajectoryMonths, setTrajectoryMonths] = useState(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']);

  useEffect(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const current = new Date().getMonth();
    setTrajectoryMonths(Array.from({ length: 6 }).map((_, i) => monthNames[(current + i) % 12]));
  }, []);

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={viewTransition}
      className="relative grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 pt-2"
    >
      {/* Left Column: Deep Analytics */}
      <motion.div variants={emilVariant} className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-200 flex flex-col justify-between h-full">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-bold text-gray-900 text-lg tracking-tight">Financial Pulse</h3>
          <div className="text-[10px] text-orange-600 font-semibold bg-orange-50 px-2.5 py-1 rounded-full">Last 30 Days</div>
        </div>

        {/* Custom Stat Blocks - Stacked tighter */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-200">
            <div className="text-[9px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">Revenue</div>
            <div className="text-sm font-bold text-green-600">₹8,42K</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-200">
            <div className="text-[9px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">OpEx</div>
            <div className="text-sm font-bold text-orange-600">₹3,90K</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-200">
            <div className="text-[9px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">Net Runway</div>
            <div className="text-sm font-bold text-blue-600">14 mo</div>
          </div>
        </div>

        {/* Donut & Legend */}
        <div className="mb-5 flex items-center gap-5">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="14" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="14" strokeDasharray="251.2" strokeDashoffset="150" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#eab308" strokeWidth="14" strokeDasharray="251.2" strokeDashoffset="200" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="14" strokeDasharray="251.2" strokeDashoffset="220" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="14" strokeDasharray="251.2" strokeDashoffset="240" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[9px] text-gray-400 font-bold uppercase">Burn</span>
              <span className="text-xs font-bold text-gray-900">100%</span>
            </div>
          </div>
          
          <div className="flex-1 grid grid-cols-1 gap-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-sm bg-[#f97316]"></div><span className="text-gray-700">Payroll</span></div>
              <span className="font-bold text-gray-600">40%</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-sm bg-[#eab308]"></div><span className="text-gray-700">Software</span></div>
              <span className="font-bold text-gray-600">20%</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-sm bg-[#ef4444]"></div><span className="text-gray-700">Marketing</span></div>
              <span className="font-bold text-gray-600">15%</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-sm bg-[#8b5cf6]"></div><span className="text-gray-700">Office Rent</span></div>
              <span className="font-bold text-gray-600">15%</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-sm bg-gray-200 border border-gray-300"></div><span className="text-gray-700">Other</span></div>
              <span className="font-bold text-gray-600">10%</span>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="mb-4">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">AI Insights</div>
          <div className="space-y-2">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-start gap-3">
              <div className="mt-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></div></div>
              <p className="text-[10.5px] text-gray-700 leading-snug">Marketing spend is up <span className="font-bold text-red-600">14% MoM</span>, largely driven by unoptimized ad campaigns.</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-start gap-3">
              <div className="mt-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div></div>
              <p className="text-[10.5px] text-gray-700 leading-snug">Software costs decreased by <span className="font-bold text-green-600">₹12.5K</span> after auto-canceling duplicate SaaS licenses.</p>
            </div>
          </div>
        </div>

        {/* Elegant Area Graph for Trajectory */}
        <div className="mt-2 flex-1 flex flex-col justify-end">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex justify-between items-end">
            <span>6 Month Trajectory</span>
            <span className="text-[9px] text-green-600 normal-case">+24% Trending</span>
          </div>
          <div className="relative w-full h-28 rounded-lg border border-gray-200 bg-gray-50 p-2 flex flex-col">
            <div className="relative flex-1 overflow-hidden">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between opacity-20 pointer-events-none">
                <div className="w-full border-t border-gray-400"></div>
                <div className="w-full border-t border-gray-400"></div>
                <div className="w-full border-t border-gray-400"></div>
              </div>
              
              {/* SVG Area Graph */}
              <svg className="absolute inset-0 w-full h-full preserve-3d" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path 
                  d="M 0 100 L 0 70 C 15 70, 20 50, 35 55 C 50 60, 65 35, 80 45 C 90 50, 95 20, 100 25 L 100 100 Z" 
                  fill="url(#orangeGradient)" 
                />
                <path 
                  d="M 0 70 C 15 70, 20 50, 35 55 C 50 60, 65 35, 80 45 C 90 50, 95 20, 100 25" 
                  fill="none" 
                  stroke="#f97316" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                />
              </svg>
              
              {/* Data points */}
              <div className="absolute left-[35%] top-[55%] w-1.5 h-1.5 bg-white border border-[#f97316] rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_8px_rgba(249,115,22,0.5)]"></div>
              <div className="absolute left-[80%] top-[45%] w-1.5 h-1.5 bg-white border border-[#f97316] rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_8px_rgba(249,115,22,0.5)]"></div>
            </div>
            
            {/* X-axis labels */}
            <div className="flex justify-between items-end pt-1.5 px-1 text-[8px] font-bold text-gray-400 uppercase">
              {trajectoryMonths.map((month, idx) => (
                <span key={idx}>{month}</span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Column: Loan & Score */}
      <div className="flex flex-col gap-3 relative z-10">
        
        {/* Auto Loan Application */}
        <motion.div variants={emilVariant} className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden flex border border-gray-200">
          <div className="w-2/5 bg-gray-100 p-2 flex items-center justify-center">
            <img src="https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=400&q=80" alt="SUV" className="w-full object-contain" />
          </div>
          <div className="w-3/5 p-3 flex flex-col justify-center">
            <div className="bg-gray-100 border border-gray-200 text-gray-600 text-[9px] font-bold px-2 py-0.5 rounded w-max mb-1 uppercase tracking-wider">NEW - 2026</div>
            <div className="text-lg font-bold text-gray-900 mb-0 flex items-baseline gap-1">
              ₹25,45,000 <span className="text-[9px] text-gray-500 font-medium">Ex-Showroom</span>
            </div>
            <div className="text-[11px] font-semibold text-gray-700 mb-0">Mahindra XUV700 - AWD</div>
            <div className="text-[9px] text-gray-500">Est. 13/16 KMPL</div>
          </div>
        </motion.div>

        {/* Application Form Mockup */}
        <motion.div variants={emilVariant} className="bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="bg-gray-50 py-1.5 text-center border-b border-gray-200">
            <span className="text-[9px] font-bold text-gray-500 tracking-widest uppercase">Auto Loan Application</span>
          </div>
          <div className="grid grid-cols-2 p-3 gap-3">
            <div>
              <div className="text-[10px] font-bold text-gray-500 mb-2 border-b border-gray-200 pb-1.5">Type of loan</div>
              <div className="space-y-2">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-[2px] border border-gray-300"></div><span className="text-[10px] text-gray-500">Dealer purchase</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-[2px] border border-gray-300"></div><span className="text-[10px] text-gray-500">Private party</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-[2px] border border-orange-500 bg-orange-500 flex items-center justify-center"><CheckCircle className="w-2 h-2 text-white" /></div><span className="text-[10px] text-gray-900">Refinance</span></div>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-500 mb-2 border-b border-gray-200 pb-1.5">Application type</div>
              <div className="space-y-2">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-[2px] border border-orange-500 bg-orange-500 flex items-center justify-center"><CheckCircle className="w-2 h-2 text-white" /></div><span className="text-[10px] text-gray-900">Individual</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-[2px] border border-gray-300"></div><span className="text-[10px] text-gray-500">Joint</span></div>
              </div>
            </div>
          </div>
          
          <div className="px-3 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center gap-1">
                <div className="w-3.5 h-3.5 rounded-full bg-orange-500 flex items-center justify-center"><CheckCircle className="w-2 h-2 text-white" /></div>
                <span className="text-[6px] text-orange-500 font-bold max-w-[35px] text-center leading-tight uppercase">Personal</span>
              </div>
              <div className="h-[1px] bg-gray-200 flex-1 mx-2"></div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-3.5 h-3.5 rounded-full bg-white border border-gray-300 flex items-center justify-center text-[7px] text-gray-500 font-bold">2</div>
                <span className="text-[6px] text-gray-400 font-bold max-w-[35px] text-center leading-tight uppercase">Vehicle</span>
              </div>
              <div className="h-[1px] bg-gray-200 flex-1 mx-2"></div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-3.5 h-3.5 rounded-full bg-white border border-gray-300 flex items-center justify-center text-[7px] text-gray-500 font-bold">3</div>
                <span className="text-[6px] text-gray-400 font-bold max-w-[35px] text-center leading-tight uppercase">Verify</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Zeyro Score & Risk Factors - Clean standard stacking */}
        <motion.div variants={emilVariant} className="bg-white rounded-2xl p-4 shadow-xl shadow-gray-200/50 border border-gray-200 flex flex-col sm:flex-row gap-4 relative z-20">
          <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl border border-gray-200 min-w-[90px]">
            <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-1">BFS Rating</div>
            <div className="text-2xl font-black text-orange-500">892</div>
            <div className="text-[9px] text-green-600 font-bold mt-0.5">Tier 1</div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-[10px] font-bold text-gray-900 uppercase tracking-widest mb-2 border-b border-gray-200 pb-1.5">Approval Drivers</div>
            <div className="space-y-1.5">
              <div className="text-[10.5px] text-gray-600 flex items-start gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Strong Debt Service Coverage ({">"}1.25)</span>
              </div>
              <div className="text-[10.5px] text-gray-600 flex items-start gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Consistent M-o-M revenue growth</span>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
