"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { FileText, CheckCircle, ShieldCheck, AlertTriangle, Landmark, Check, X, Database, Settings, Brain, Search, Target, Loader2 } from 'lucide-react';
import Interactive3DGraph from './Interactive3DGraph';



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

const Node = ({ title, icon, colorClass, borderClass, textClass, left, top, visible }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
    transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
    style={{ left, top }}
    className={`absolute flex items-center gap-2.5 px-4 py-2.5 rounded-xl border ${borderClass} ${colorClass} shadow-sm z-10 whitespace-nowrap`}
  >
    <div className={`${textClass} flex-shrink-0`}>{icon}</div>
    <span className={`text-[13px] font-bold tracking-wide ${textClass}`}>{title}</span>
  </motion.div>
);

const TreeLine = ({ start, end, visible }: any) => {
  const maxRadius = 16;
  const [sx, sy] = start;
  const [ex, ey] = end;
  
  const midX = sx + (ex - sx) / 2;
  const dirY = Math.sign(ey - sy);
  const absY = Math.abs(ey - sy);
  
  let d = '';
  if (absY === 0) {
    d = `M ${sx} ${sy} L ${ex} ${ey}`;
  } else {
    const r = Math.min(maxRadius, absY / 2, Math.abs(ex - sx) / 2);
    d = `M ${sx} ${sy} L ${midX - r} ${sy} Q ${midX} ${sy} ${midX} ${sy + dirY * r} L ${midX} ${ey - dirY * r} Q ${midX} ${ey} ${midX + r} ${ey} L ${ex} ${ey}`;
  }

  return (
    <motion.path
      d={d}
      fill="none"
      stroke="#cbd5e1"
      strokeWidth="2"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={visible ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
    />
  );
};

const FlowchartAnimation = ({ activeStep }: { activeStep: number }) => {
  const [seqIndex, setSeqIndex] = useState(0);

  useEffect(() => {
    if (activeStep === 1) {
      setSeqIndex(0);
      const interval = setInterval(() => {
        setSeqIndex(prev => prev + 1);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [activeStep]);



  const getCameraState = () => {
    if (seqIndex < 2) return { x: 0, y: 0 };
    if (seqIndex < 4) return { x: -150, y: 0 };
    if (seqIndex < 10) return { x: -400, y: 0 };
    if (seqIndex < 12) return { x: -550, y: 0 }; 
    if (seqIndex < 14) return { x: -700, y: -20 }; 
    if (seqIndex < 16) return { x: -800, y: -40 }; 
    if (seqIndex < 18) return { x: -900, y: -60 }; 
    return { x: -1100, y: -80 }; 
  };

  const baseColor = { colorClass: "bg-white", borderClass: "border-slate-200", textClass: "text-slate-700" };

  const nodes = [
    { id: 'n0', seq: 0, title: "User Loan Application", icon: <FileText size={16} />, colorClass: "bg-purple-50", borderClass: "border-purple-200", textClass: "text-purple-700", left: -100, top: -20 },
    { id: 'n1', seq: 2, title: "Financial Data Collection", icon: <Database size={16} />, ...baseColor, left: 150, top: -20 },
    { id: 'n2', seq: 4, title: "Data Enrichment & Eng", icon: <Settings size={16} />, ...baseColor, left: 400, top: -100 },
    { id: 'n3', seq: 6, title: "Credit Bureau Data", icon: <ShieldCheck size={16} />, ...baseColor, left: 400, top: -20 },
    { id: 'n4', seq: 8, title: "Banking Transactions", icon: <Landmark size={16} />, ...baseColor, left: 400, top: 60 },
    { id: 'n5', seq: 10, title: "Underwriting Agent", icon: <Brain size={16} />, colorClass: "bg-blue-50", borderClass: "border-blue-200", textClass: "text-blue-700", left: 650, top: -20 },
    { id: 'n6', seq: 12, title: "Auto-Approval", icon: <Check size={16} />, colorClass: "bg-emerald-50", borderClass: "border-emerald-200", textClass: "text-emerald-700", left: 900, top: 60 },
    { id: 'n7', seq: 16, title: "Manual Escalation", icon: <AlertTriangle size={16} />, colorClass: "bg-amber-50", borderClass: "border-amber-200", textClass: "text-amber-700", left: 900, top: 220 },
    { id: 'n8', seq: 14, title: "Rejection", icon: <X size={16} />, colorClass: "bg-rose-50", borderClass: "border-rose-200", textClass: "text-rose-700", left: 900, top: 140 },
    { 
      id: 'n9', 
      seq: 18, 
      title: seqIndex >= 19 ? "Report Generated" : "Generating Report...", 
      icon: seqIndex >= 19 ? <CheckCircle size={16} /> : <Loader2 className="animate-spin" size={16} />, 
      colorClass: seqIndex >= 19 ? "bg-emerald-50" : "bg-white", 
      borderClass: seqIndex >= 19 ? "border-emerald-200" : "border-slate-200", 
      textClass: seqIndex >= 19 ? "text-emerald-700" : "text-slate-700", 
      left: 1150, 
      top: 220 
    },
  ];

  const lines = [
    { id: 'l1', seq: 1, start: [100, 0], end: [150, 0] },
    { id: 'l2', seq: 3, start: [350, 0], end: [400, -80] },
    { id: 'l3', seq: 5, start: [350, 0], end: [400, 0] },
    { id: 'l4', seq: 7, start: [350, 0], end: [400, 80] },
    { id: 'l5a', seq: 9, start: [600, -80], end: [650, 0] },
    { id: 'l5b', seq: 9, start: [600, 0], end: [650, 0] },
    { id: 'l5c', seq: 9, start: [600, 80], end: [650, 0] },
    { id: 'l6', seq: 11, start: [750, 20], end: [900, 80] },
    { id: 'l7', seq: 15, start: [750, 20], end: [900, 240] },
    { id: 'l8', seq: 13, start: [750, 20], end: [900, 160] },
    { id: 'l9', seq: 17, start: [1100, 240], end: [1150, 240] },
  ];

  if (activeStep === 3) return null;

  const cam = getCameraState();

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
      <motion.div 
        className="relative max-md:scale-[0.55] sm:scale-[0.7] md:scale-100 origin-center"
        animate={{ x: cam.x, y: cam.y }}
        transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
        style={{ willChange: "transform" }}
      >
        <svg style={{ position: 'absolute', width: 1, height: 1, overflow: 'visible', zIndex: 0 }}>
          {lines.map((line) => (
            <TreeLine key={line.id} start={line.start} end={line.end} visible={seqIndex >= line.seq} />
          ))}
        </svg>

        {nodes.map((node) => (
          <Node key={node.id} {...node} visible={seqIndex >= node.seq} />
        ))}
      </motion.div>
    </div>
  );
};

export default function BFSDataAnimation() {
  const customEaseOut = [0.23, 1, 0.32, 1] as const;
  const isMobile = useMediaQuery('(max-width: 768px)');

  // 1: Processing, 2: Audit Complete
  const [activeStep, setActiveStep] = useState(1);
  const emilVariant: Variants = {
    hidden: { opacity: 0, scale: 0.96, filter: 'blur(4px)' },
    visible: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { type: "spring", bounce: 0, duration: 0.8 } }
  };

  const isHoveringReport = useRef(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let currentStep = 1;

    const loop = () => {
      setActiveStep(currentStep);
      
      if (currentStep === 1) {
        timeout = setTimeout(() => {
          currentStep = 2;
          loop();
        }, 10500); // 10.5 seconds for Flowchart
      } else {
        const checkHover = () => {
          if (isHoveringReport.current) {
            timeout = setTimeout(checkHover, 1000);
          } else {
            currentStep = 1;
            loop();
          }
        };
        timeout = setTimeout(checkHover, 10000); // 10 seconds for Report
      }
    };

    loop();
    return () => clearTimeout(timeout);
  }, []);




  const showReport = activeStep === 2;

  return (
    <section className="py-32 relative overflow-hidden bg-[#f5f5f5]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header */}
        <div className="text-left mb-16">
          <motion.div 
            initial={{ opacity: 0, transform: "translateY(20px)" }}
            whileInView={{ opacity: 1, transform: "translateY(0px)" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: customEaseOut }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#17332e] tracking-tight text-balance">The Intelligence Engine</h2>
            <p className="mt-4 text-lg max-w-2xl text-[#205b53]/80 font-medium leading-relaxed">
              Zeyro builds intelligence for credit underwriting powered by our proprietary models. Operating in an agentic environment, it delivers a complete end-to-end service while keeping every step of the decision-making process fully explainable.
            </p>
          </motion.div>
        </div>

        {/* Dynamic Multi-Stage Layout Container */}
        <div className="w-full max-w-[1100px] h-[600px] mx-auto rounded-[2rem] border border-gray-200 shadow-2xl overflow-hidden flex flex-col md:flex-row bg-[#f9f5f4] relative">
          
          {/* Panel 1: Obsidian Orb */}
          <motion.div 
            className="relative bg-[#f9f5f4] overflow-hidden flex-shrink-0"
            animate={{ 
              width: isMobile ? "100%" : (showReport ? "65%" : "100%"),
              height: isMobile ? (showReport ? "300px" : "100%") : "100%"
            }}
            transition={{ duration: 0.8, ease: customEaseOut }}
          >

            <AnimatePresence mode="wait">
              {activeStep === 1 && (
                <motion.div key="flowchart" exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.5 }} className="absolute inset-0 z-20">
                  <FlowchartAnimation activeStep={activeStep} />
                </motion.div>
              )}
            </AnimatePresence>

            <Interactive3DGraph activeStep={activeStep} />

            {/* Status Overlay */}
            <div className="absolute top-6 left-6 flex items-center gap-3">
              <div className="flex h-3 w-3 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeStep === 2 ? 'bg-green-400' : 'bg-blue-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${activeStep === 2 ? 'bg-green-500' : 'bg-blue-500'}`}></span>
              </div>
              <span className="text-xs font-mono text-gray-600 uppercase tracking-widest">
                {activeStep === 1 && "Processing..."}
                {activeStep === 2 && "Audit Complete"}
              </span>
            </div>
          </motion.div>

          {/* Panel 2: Clean Complex Report Form (Step 3) */}
          <AnimatePresence>
            {showReport && (
              <motion.div 
                initial={isMobile ? { height: 0, opacity: 0, width: "100%" } : { width: 0, opacity: 0, height: "100%" }}
                animate={isMobile ? { height: "300px", opacity: 1, width: "100%" } : { width: "35%", opacity: 1, height: "100%" }}
                exit={isMobile ? { height: 0, opacity: 0, width: "100%" } : { width: 0, opacity: 0, height: "100%" }}
                transition={{ duration: 0.8, ease: customEaseOut }}
                className={`bg-white ${isMobile ? 'border-t' : 'border-l'} border-gray-100 flex flex-col p-6 md:p-8 relative flex-shrink-0 ${isMobile ? 'w-full' : ''}`}
                onMouseEnter={() => {
                  isHoveringReport.current = true;
                }}
                onMouseLeave={() => {
                  isHoveringReport.current = false;
                }}
              >
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: isMobile ? 0.4 : 0.1, delayChildren: 0.4 } }
                  }}
                  className="h-full flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
                >
                  <motion.div variants={emilVariant} className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-500 bg-green-50">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 tracking-tight">Audit Report</h3>
                      <p className="text-xs text-gray-500 font-medium">Auto-generated Form</p>
                    </div>
                  </motion.div>

                  <div className="flex flex-col h-full">
                    
                    {/* Top Split Section */}
                    <motion.div 
                      variants={emilVariant}
                      className="flex gap-4 mb-6"
                    >
                      {/* Left: Image (House) */}
                      <div className="flex-1 bg-[#f9fafb] rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center p-4 h-32 relative group">
                        <img 
                          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80" 
                          alt="Modern House" 
                          className="w-full h-full object-cover rounded-xl transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>

                      {/* Right: Score / Approval Block */}
                      <div className="flex-1 bg-[#f8fafc] rounded-2xl border border-gray-100 p-4 h-32 flex flex-col justify-center">
                        <div className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full w-max mb-2">NEW - 2026</div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-blue-600 tracking-tighter">
                            <NumberTicker value={784} />
                          </span>
                          <span className="text-[9px] font-bold text-blue-600 uppercase">BFS SCORE</span>
                        </div>
                        <p className="text-xs font-bold text-gray-800 mt-1">Status: Approved</p>
                        <p className="text-[10px] text-gray-500 font-medium">Top 5% Tier</p>
                      </div>
                    </motion.div>

                    {/* Middle AI Summary Text */}
                    <motion.div 
                      variants={emilVariant}
                      className="mb-5"
                    >
                      <p className="text-[11px] text-gray-600 font-medium leading-relaxed">
                        Based on the applicant's profile and financial behavior, the probability of default is exceptionally low. The applicant shows healthy cash flow, manageable debt levels, and a highly consistent repayment history spanning 48 months.
                      </p>
                    </motion.div>
                    {/* Bottom 4 Small Metric Cards */}
                    <motion.div 
                      variants={emilVariant}
                      className="grid grid-cols-4 gap-2 mb-6"
                    >
                      {/* Card 1 */}
                      <div className="flex flex-col p-2.5 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <span className="text-[9px] text-gray-500 font-medium mb-1">Income Stability</span>
                        <span className="text-xs font-bold text-green-500">High</span>
                      </div>
                      
                      {/* Card 2 */}
                      <div className="flex flex-col p-2.5 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <span className="text-[9px] text-gray-500 font-medium mb-1">Repayment Cap</span>
                        <span className="text-xs font-bold text-green-500">Strong</span>
                      </div>

                      {/* Card 3 */}
                      <div className="flex flex-col p-2.5 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <span className="text-[9px] text-gray-500 font-medium mb-1">Debt to Income</span>
                        <span className="text-xs font-bold text-green-500">32%</span>
                      </div>

                      {/* Card 4 */}
                      <div className="flex flex-col p-2.5 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <span className="text-[9px] text-gray-500 font-medium mb-1">Cash Buffer</span>
                        <span className="text-xs font-bold text-green-500">Good</span>
                      </div>
                    </motion.div>
                    <motion.div variants={emilVariant} className="flex-1 space-y-3 mb-6">
                      <MetricCard 
                        title="Spending Velocity" 
                        status="High Variance" 
                        hex="#facc15" 
                        sparklines={{ d1: "M 0 10 Q 15 2 30 10 T 60 10", d2: "M 0 10 Q 15 15 30 10 T 60 10" }}
                        percentage="78%"
                        aiInsight="Significant erratic spending detected this month."
                        delay={0.4}
                      />
                      <MetricCard 
                        title="Income Stability" 
                        status="Verified" 
                        hex="#4ade80" 
                        sparklines={{ d1: "M 0 10 L 15 10 L 20 2 L 25 15 L 30 10 L 60 10", d2: "M 0 10 L 15 10 L 20 8 L 25 12 L 30 10 L 60 10" }}
                        percentage="92%"
                        aiInsight="Consistent direct deposits over 24 months."
                        delay={0.5}
                      />
                    </motion.div>
                    
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
        </div>
      </div>
    </section>
  );
}

// Sub-component for adding "live graph and stuff" to the clean report
const LiveSparkline = ({ color, d1, d2 }: { color: string, d1: string, d2: string }) => (
  <svg width="60" height="16" viewBox="0 0 60 16" className="opacity-70 overflow-visible">
    <motion.path 
      d={d1}
      fill="none" 
      stroke={color} 
      strokeWidth="1.5"
      strokeLinecap="round"
      animate={{ d: [d1, d2, d1] }}
      transition={{ duration: 1.5 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
    />
  </svg>
);

const NumberTicker = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let current = 0;
    const end = value;
    const duration = 1500;
    const stepTime = Math.abs(Math.floor(duration / end));
    
    const timer = setInterval(() => {
      current += 11;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [value]);
  return <>{count}</>;
};

const MetricCard = ({ title, status, hex, sparklines, percentage, aiInsight, delay }: any) => {
  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
      transition={{ ease: [0.23, 1, 0.32, 1], duration: 0.6 }}
      whileHover={{ scale: 0.98 }}
      className="flex flex-col p-4 rounded-2xl bg-white border border-gray-100 shadow-sm transition-all cursor-default hover:bg-gray-50/50"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse`} style={{ backgroundColor: hex }} />
          <span className="text-[11px] font-bold text-gray-700 uppercase tracking-widest">{title}</span>
        </div>
        <div className="flex flex-col items-end">
          <LiveSparkline color={hex} d1={sparklines.d1} d2={sparklines.d2} />
          <span className="text-[10px] font-semibold mt-1" style={{ color: hex }}>{status}</span>
        </div>
      </div>
      
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-3">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: percentage }}
          transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1], delay }}
          className="h-full rounded-full"
          style={{ backgroundColor: hex }}
        />
      </div>
      
      <div className="flex items-start gap-2 bg-[#f9fafb] rounded-lg p-2.5 border border-gray-100">
        <div className="mt-0.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <p className="text-[11px] text-gray-500 leading-tight font-medium">
          {aiInsight}
        </p>
      </div>
    </motion.div>
  );
};
