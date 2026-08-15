"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useAnimationFrame, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

// --- DATA ---
const HERO_TX = [
  { id: 1, type: 'positive', amount: '+₹45,000', label: 'Freelance', x: -240, y: 80, z: 80, scale: 0.9 },
  { id: 2, type: 'negative', amount: '-₹12,500', label: 'UPI Transfer', x: 220, y: -40, z: 120, scale: 0.85 },
  { id: 3, type: 'positive', amount: '+₹3,00,000', label: 'Bonus', x: 260, y: 120, z: 30, scale: 1.05 },
  { id: 4, type: 'neutral', amount: '₹1,50,000', label: 'Salary', x: -260, y: -30, z: -10, scale: 0.95 },
  { id: 5, type: 'negative', amount: '-₹40,000', label: 'Rent', x: 180, y: -160, z: -40, scale: 0.8 },
];

const MONTH_DATA = [
  { month: "JANUARY", weeklyData: [{ score: 642, label: "Stable activity", type: "neutral" }, { score: 644, label: "Stable activity", type: "neutral" }, { score: 646, label: "Stable activity", type: "neutral" }, { score: 645, label: "Stable activity", type: "neutral" }], bottomTitle: "Standard monthly cycle", transactions: [{ date: "Jan 04", category: "UPI Transfer", amount: "-₹12,500" }, { date: "Jan 15", category: "Investments", amount: "-₹30,000" }] },
  { month: "FEBRUARY", weeklyData: [{ score: 650, label: "New activity detected", type: "positive" }, { score: 655, label: "New activity detected", type: "positive" }, { score: 660, label: "New activity detected", type: "positive" }, { score: 665, label: "New activity detected", type: "positive" }], bottomTitle: "Additional income source detected", transactions: [{ date: "Feb 08", category: "Freelance", amount: "₹45,000" }, { date: "Feb 20", category: "AIRBNB", amount: "₹55,000" }] },
  { month: "MARCH", weeklyData: [{ score: 660, label: "Monitoring activity", type: "warning" }, { score: 650, label: "Monitoring activity", type: "warning" }, { score: 640, label: "Monitoring activity", type: "warning" }, { score: 630, label: "Monitoring activity", type: "warning" }], bottomTitle: "New home loan detected", transactions: [{ date: "Mar 05", category: "Consulting", amount: "₹80,000" }, { date: "Mar 10", category: "Home Loan EMI", amount: "-₹85,000" }] },
  { month: "APRIL", weeklyData: [{ score: 620, label: "High outflow", type: "negative" }, { score: 610, label: "High outflow", type: "negative" }, { score: 600, label: "High outflow", type: "negative" }, { score: 595, label: "High outflow", type: "negative" }], bottomTitle: "Unusual expense detected", transactions: [{ date: "Apr 12", category: "Medical", amount: "-₹1,20,000" }, { date: "Apr 15", category: "Credit Card", amount: "-₹45,000" }] },
];

const getActivityColors = (type: string) => {
  switch(type) {
    case 'positive': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    case 'negative': return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
    case 'warning': return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    case 'neutral': default: return 'bg-black/20 border-black/40 text-gray-300';
  }
};
const getTxColors = (amount: string) => amount.includes('-') ? 'bg-rose-500/10 text-rose-400' : 'bg-[#192b23] text-[#22c55e]';

export default function CashflowScrollyFlow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });

  // --- MOUSE TRACKING (HERO) ---
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX / rect.width);
    mouseY.set(e.clientY / rect.height);
  };
  const springConfig = { damping: 40, stiffness: 100, mass: 0.5 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);
  
  // Base 3D rotation from mouse
  const baseRotateX = useTransform(springY, [0, 1], [15, -15]);
  const baseRotateY = useTransform(springX, [0, 1], [-15, 15]);

  // We manually update these via useAnimationFrame so they can't be useTransform (read-only)
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  
  // Continuous update trick to ensure rotateX/Y always respect both scroll AND mouse early on
  useAnimationFrame(() => {
    const scrollP = scrollYProgress.get();
    if (scrollP < 0.15) {
      const blend = 1 - (scrollP / 0.15);
      rotateX.set(baseRotateX.get() * blend);
      rotateY.set(baseRotateY.get() * blend);
    } else {
      rotateX.set(0);
      rotateY.set(0);
    }
  });

  // --- INTERPOLATIONS (STRICT SEQUENTIAL SCROLL) ---
  // 1. Hero Text scrolls UP out of viewport (No opacity fade)
  const heroTextOpacity = useMotionValue(1); 
  const heroTextY = useTransform(scrollYProgress, [0, 0.05, 0.25, 1], ["0vh", "0vh", "-80vh", "-80vh"]);
  
  // 2. Floating Transactions Explode Out
  const txExplodeMult = useTransform(scrollYProgress, [0, 0.05, 0.2, 1], [1, 1, 2.5, 2.5]);
  const txOpacity = useTransform(scrollYProgress, [0, 0.05, 0.2, 1], [1, 1, 0, 0]);

  // 3. Card moves right and expands (0.15 to 0.3)
  const cardX = useTransform(scrollYProgress, [0, 0.15, 0.3, 1], ["0vw", "0vw", "24vw", "24vw"]); 
  const cardY = useTransform(scrollYProgress, [0, 0.15, 0.3, 1], ["30vh", "30vh", "5vh", "5vh"]);
  const cardWidth = useTransform(scrollYProgress, [0, 0.15, 0.3, 1], ["340px", "340px", "448px", "448px"]); 
  const cardHeight = useTransform(scrollYProgress, [0, 0.15, 0.3, 1], ["400px", "400px", "520px", "520px"]); 
  
  // 4. Card Content swaps BEFORE it turns dark (Hero out early, Monitor in)
  const heroContentOpacity = useTransform(scrollYProgress, [0, 0.15, 0.2, 1], [1, 1, 0, 0]);
  const monitorContentOpacity = useTransform(scrollYProgress, [0, 0.2, 0.3, 1], [0, 0, 1, 1]);

  // 5. Card finally turns dark AFTER content swaps (0.25 to 0.35)
  const cardBgColor = useTransform(scrollYProgress, [0, 0.25, 0.35, 1], ["rgba(255, 255, 255, 0.7)", "rgba(255, 255, 255, 0.7)", "rgba(17, 17, 19, 1)", "rgba(17, 17, 19, 1)"]);
  const cardBorderColor = useTransform(scrollYProgress, [0, 0.25, 0.35, 1], ["rgba(255, 255, 255, 0.6)", "rgba(255, 255, 255, 0.6)", "rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.05)"]);
  const cardShadow = useTransform(scrollYProgress, [0, 0.25, 0.35, 1], ["0 40px 80px rgba(0,0,0,0.07)", "0 40px 80px rgba(0,0,0,0.07)", "0 25px 50px -12px rgba(0,0,0,0.5)", "0 25px 50px -12px rgba(0,0,0,0.5)"]);

  // 6. Monitoring Text scrolls UP into view and fades in
  const monitorTextOpacity = useTransform(scrollYProgress, [0, 0.15, 0.25, 1], [0, 0, 1, 1]);
  const monitorTextY = useTransform(scrollYProgress, [0, 0.15, 0.3, 1], ["100vh", "100vh", "0vh", "0vh"]);
  
  // Time
  const time = useMotionValue(0);
  useAnimationFrame((t) => time.set(t / 1000));

  // --- MONITORING LIVE TICKER STATE ---
  const [monthIndex, setMonthIndex] = useState(0);
  const [weekIndex, setWeekIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWeekIndex(prev => {
        if (prev === 3) {
          setMonthIndex(m => (m + 1) % 4);
          return 0;
        }
        return prev + 1;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const currentMonthData = MONTH_DATA[monthIndex];
  const targetScoreValue = currentMonthData.weeklyData[weekIndex].score;

  const score = useMotionValue(685);
  const roundedScore = useTransform(score, v => Math.round(v));
  const scoreColor = useTransform(score, [580, 620, 650, 700], ['#f43f5e', '#f59e0b', '#22c55e', '#22c55e']);
  const scoreBorderColor = useTransform(score, [580, 620, 650, 700], ['rgba(244,63,94,0.3)', 'rgba(245,158,11,0.3)', 'rgba(34,197,94,0.3)', 'rgba(34,197,94,0.3)']);
  const scoreShadow = useTransform(score, [580, 620, 650, 700], ['drop-shadow(0px 2px 4px rgba(244,63,94,0.3))','drop-shadow(0px 2px 4px rgba(245,158,11,0.3))','drop-shadow(0px 2px 4px rgba(34,197,94,0.3))','drop-shadow(0px 2px 4px rgba(34,197,94,0.3))']);
  const dotShadow = useTransform(score, [580, 620, 650, 700], ['drop-shadow(0 0 12px #f43f5e)','drop-shadow(0 0 12px #f59e0b)','drop-shadow(0 0 12px #22c55e)','drop-shadow(0 0 12px #22c55e)']);

  const pathData = useMotionValue("");
  const dotY = useMotionValue(110);
  const historyRef = useRef<number[]>(Array.from({length: 130}, () => 110));
  const lastUpdate = useRef(0);
  const targetY = useRef(110);

  useAnimationFrame((t) => {
    // Only tick the graph if we are somewhat near the monitoring view to save battery
    const current = score.get();
    const diff = targetScoreValue - current;
    if (Math.abs(diff) > 0.1) score.set(current + diff * 0.05);

    const TICK_RATE = 60;
    if (t - lastUpdate.current > TICK_RATE) {
      lastUpdate.current = t;
      const mappedScore = Math.min(Math.max(targetScoreValue, 580), 700);
      const mappedY = 160 - ((mappedScore - 580) / 120) * 120;
      if (Math.random() > 0.85) targetY.current = mappedY + (Math.random() * 12 - 6);
      
      const lastY = historyRef.current[historyRef.current.length - 1];
      let nextY = lastY + (targetY.current - lastY) * 0.05 + (Math.random() * 3 - 1.5);
      nextY = Math.max(20, Math.min(180, nextY));
      
      historyRef.current.push(nextY);
      historyRef.current.shift();
    }
    const progress = Math.min(1, Math.max(0, (t - lastUpdate.current) / TICK_RATE));
    const dx = progress * 5;
    let d = "";
    for (let i = 0; i < historyRef.current.length; i++) {
      const x = (i * 5) - 50 - dx;
      const y = historyRef.current[i];
      if (i === 0) d += `M ${x},${y}`; else d += ` L ${x},${y}`;
      if (x <= 300 && x + 5 > 300) {
        const nextY = historyRef.current[i+1] || y;
        const ratio = (300 - x) / 5;
        dotY.set(y + (nextY - y) * ratio);
      }
    }
    pathData.set(d);
  });

  return (
    <section ref={containerRef} className="w-full bg-[#f4efe6] relative h-[300vh]" onMouseMove={handleMouseMove}>
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center border-b border-black/5">
        
        {/* Background Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `linear-gradient(to right, black 1px, transparent 1px), linear-gradient(to bottom, black 1px, transparent 1px)`, backgroundSize: `40px 40px` }} />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#f4efe6_70%)]" />

        {/* --- HERO TEXT (Fades Out) --- */}
        <motion.div className="absolute top-[15vh] w-full text-center px-6 z-10" style={{ y: heroTextY, opacity: heroTextOpacity }}>

          <h1 className="text-5xl md:text-7xl font-medium tracking-tight mb-6 text-gray-900">
            Cash flow Monitoring
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Transform raw transaction data into real-time monitoring and powerful forecasting for your business.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button className="px-8 py-4 bg-gray-900 text-white rounded-full font-medium flex items-center gap-2 transition-transform duration-160 ease-out active:scale-[0.97] hover:bg-black shadow-lg shadow-black/10">
              Start building <ChevronRight size={18} />
            </button>
          </div>
        </motion.div>

        {/* --- MONITORING TEXT (Fades In, Left Side) --- */}
        <div className="absolute inset-0 flex items-center justify-center max-w-6xl mx-auto px-6 pointer-events-none">
          <motion.div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center" style={{ opacity: monitorTextOpacity, y: monitorTextY }}>
            <div className="pointer-events-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-white border border-black/10 flex items-center justify-center shadow-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 22H22L12 2Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 10L6 22H18L12 10Z" fill="black" fillOpacity="0.3"/></svg>
                </div>
                <span className="text-gray-600 font-medium">Cashflow</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-6 leading-tight">Continuous cash<br />flow monitoring</h2>
              <p className="text-lg text-gray-600 max-w-md mb-10">Track evolving customer financial conditions in real time</p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button className="px-6 py-3 bg-black text-white rounded-full font-medium flex items-center gap-2 transition-transform active:scale-[0.97] hover:bg-gray-800">Talk to our team <ChevronRight size={16} /></button>

              </div>
            </div>
            <div /> {/* Right column placeholder for the card */}
            <div />
          </motion.div>
        </div>

        <div className="absolute inset-0 w-full h-full pointer-events-none z-20 flex items-center justify-center">
          <motion.div 
            style={{
              perspective: 1200,
              x: cardX,
              y: cardY,
              width: cardWidth,
              height: cardHeight
            }} 
            className="relative flex items-center justify-center z-20"
          >
            <motion.div
              className="relative w-full h-full rounded-[24px] overflow-hidden backdrop-blur-2xl"
              style={{
                rotateX, rotateY, transformStyle: "preserve-3d",
                backgroundColor: cardBgColor as any, 
                borderColor: cardBorderColor as any,
                borderWidth: "1px",
                borderStyle: "solid",
                boxShadow: cardShadow as any,
              }}
            >
              {/* Background Glows */}
              <motion.div className="absolute inset-0 bg-[#22c55e]/20 blur-[100px] rounded-full" style={{ transform: "translateZ(-80px) scale(0.9)", opacity: heroContentOpacity }} />

              {/* --- HERO CONTENT (Fades Out) --- */}
              <motion.div className="absolute inset-0 p-8 flex flex-col items-center justify-center pointer-events-none" style={{ opacity: heroContentOpacity, transform: "translateZ(50px)" }}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#22c55e]/20 to-[#22c55e]/5 flex items-center justify-center mb-6 border border-[#22c55e]/20 shadow-inner">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 22H22L12 2Z" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 10L6 22H18L12 10Z" fill="#22c55e" fillOpacity="0.2"/></svg>
                </div>
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-gray-500 mb-3">BFS Score</p>
                <div className="text-7xl font-medium tracking-tighter text-gray-900 mb-6 tabular-nums">785</div>
                <div className="px-5 py-2 rounded-full bg-[#22c55e]/10 text-[#22c55e] text-sm font-medium border border-[#22c55e]/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]">Excellent health</div>
              </motion.div>

              {/* --- MONITORING CONTENT (Fades In) --- */}
              <motion.div className="absolute inset-0 flex flex-col p-4 md:p-6" style={{ opacity: monitorContentOpacity }}>
                <div className="bg-[#18181a] rounded-xl p-5 flex justify-between items-start relative z-10 border border-white/[0.03] shadow-lg">
                  <div>
                    <motion.p className="text-sm font-medium mb-2 tracking-wide" style={{ color: scoreColor }}>BFS Score</motion.p>
                    <motion.div className="border rounded-lg px-3 py-1 inline-block" style={{ borderColor: scoreBorderColor }}>
                      <motion.span className="text-3xl font-medium tabular-nums" style={{ color: scoreColor }}>{roundedScore}</motion.span>
                    </motion.div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <AnimatePresence mode="wait">
                      <motion.p key={currentMonthData.month} initial={{ opacity: 0, filter: "blur(4px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(4px)" }} className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-3">
                        {currentMonthData.month}
                      </motion.p>
                    </AnimatePresence>
                    <AnimatePresence mode="wait">
                      <motion.div key={currentMonthData.weeklyData[weekIndex].label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`border rounded-full px-3 py-1.5 backdrop-blur-sm ${getActivityColors(currentMonthData.weeklyData[weekIndex].type)}`}>
                        <span className="text-xs font-medium">{currentMonthData.weeklyData[weekIndex].label}</span>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                <div className="relative w-full h-[140px] my-2">
                  <svg viewBox="0 0 500 200" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    <line x1="150" y1="0" x2="150" y2="200" stroke="white" strokeOpacity="0.05" strokeDasharray="4 4" />
                    <line x1="300" y1="0" x2="300" y2="200" stroke="white" strokeOpacity="0.05" strokeDasharray="4 4" />
                    <motion.path d={pathData} style={{ stroke: scoreColor, filter: scoreShadow }} strokeWidth="2.5" fill="none" />
                    <motion.circle cx={300} cy={dotY} r="5" style={{ fill: scoreColor, filter: dotShadow }} />
                    <motion.circle cx={300} cy={dotY} r="2" fill="white" />
                  </svg>
                </div>

                <div className="bg-[#18181a] rounded-xl p-5 relative z-10 border border-white/[0.03] shadow-lg flex-1">
                  <AnimatePresence mode="wait">
                    <motion.div key={monthIndex} initial={{ opacity: 0, y: 10, filter: "blur(2px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -10, filter: "blur(2px)" }} transition={{ duration: 0.3 }}>
                      <h3 className="text-sm font-medium text-gray-300 mb-4">{currentMonthData.bottomTitle}</h3>
                      <div className="space-y-3">
                        {currentMonthData.transactions.map((tx, idx) => (
                          <div key={idx} className="flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-gray-500 w-12">{tx.date}</span>
                              <span className={`text-xs font-medium px-2 py-1 rounded ${getTxColors(tx.amount)}`}>{tx.category}</span>
                            </div>
                            <span className={`text-sm font-medium ${tx.amount.includes('-') ? 'text-gray-400' : 'text-gray-300'}`}>{tx.amount}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>

            </motion.div>

            {/* --- FLOATING TRANSACTIONS (HERO ONLY) --- */}
            {HERO_TX.map((tx, i) => {
              const explodeZ = useTransform(scrollYProgress, [0, 0.05, 0.2, 1], [tx.z, tx.z, tx.z + (tx.z > 0 ? 500 : -500), tx.z + (tx.z > 0 ? 500 : -500)]);
              const floatY = useTransform(time, t => tx.y + Math.sin(t * 1.5 + i) * 15);
              const getColors = (type: string) => {
                switch(type) {
                  case 'positive': return 'bg-emerald-50/90 text-emerald-700 border-emerald-200 shadow-emerald-900/5';
                  case 'negative': return 'bg-rose-50/90 text-rose-700 border-rose-200 shadow-rose-900/5';
                  case 'warning': return 'bg-amber-50/90 text-amber-700 border-amber-200 shadow-amber-900/5';
                  default: return 'bg-white/90 text-gray-700 border-gray-200 shadow-gray-900/5';
                }
              };
              // Manually explode X because combining it with rotate was complex. 
              // We'll map base X to an exploded X using scroll.
              const explodedX = useTransform(scrollYProgress, [0, 0.05, 0.2, 1], [tx.x, tx.x, tx.x * 3, tx.x * 3]);

              return (
                <motion.div
                  key={tx.id}
                  className={`absolute left-1/2 top-1/2 px-5 py-3 rounded-2xl border backdrop-blur-xl shadow-xl flex flex-col min-w-[150px] ${getColors(tx.type)}`}
                  style={{
                    x: explodedX, y: floatY, z: explodeZ, scale: tx.scale,
                    translateX: "-50%", translateY: "-50%", opacity: txOpacity
                  }}
                >
                  <span className="text-[10px] opacity-70 font-bold mb-1 tracking-widest uppercase">{tx.label}</span>
                  <span className="text-xl font-semibold tabular-nums tracking-tight">{tx.amount}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
