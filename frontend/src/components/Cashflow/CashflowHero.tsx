"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useAnimationFrame } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const TRANSACTIONS = [
  { id: 1, type: 'positive', amount: '+₹45,000', label: 'Freelance', x: -240, y: 80, z: 80, scale: 0.9 },
  { id: 2, type: 'negative', amount: '-₹12,500', label: 'UPI Transfer', x: 220, y: -40, z: 120, scale: 0.85 },
  { id: 3, type: 'positive', amount: '+₹3,00,000', label: 'Bonus', x: 260, y: 120, z: 30, scale: 1.05 },
  { id: 4, type: 'neutral', amount: '₹1,50,000', label: 'Salary', x: -260, y: -30, z: -10, scale: 0.95 },
  { id: 5, type: 'negative', amount: '-₹40,000', label: 'Rent', x: 180, y: -160, z: -40, scale: 0.8 },
];

export default function CashflowHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Scrollytelling mechanics
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Mouse tracking for Emil-style parallax
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX / rect.width);
    mouseY.set(e.clientY / rect.height);
  };

  // Spring physics for smooth, natural movement
  const springConfig = { damping: 40, stiffness: 100, mass: 0.5 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);
  
  // Convert mouse (0..1) to rotation degrees (-15..15)
  const rotateX = useTransform(springY, [0, 1], [15, -15]);
  const rotateY = useTransform(springX, [0, 1], [-15, 15]);

  // Scrollytelling transforms: things explode/fade as you scroll down
  const coreScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.7]);
  const coreOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  
  const textY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  // Continuous floating animation for the transactions
  const time = useMotionValue(0);
  useAnimationFrame((t) => {
    time.set(t / 1000);
  });

  return (
    <section 
      ref={containerRef}
      className="w-full bg-[#f4efe6] relative min-h-screen pb-12 flex flex-col justify-center"
      onMouseMove={handleMouseMove}
    >
      <div className="sticky top-0 min-h-screen w-full overflow-hidden flex flex-col items-center justify-center border-b border-black/5">
        
        {/* Background Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, black 1px, transparent 1px), linear-gradient(to bottom, black 1px, transparent 1px)`,
            backgroundSize: `40px 40px`
          }}
        />
        
        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#f4efe6_70%)]" />

        {/* Text Content */}
        <motion.div 
          className="relative z-30 text-center px-6 mt-[-5vh]"
          style={{ y: textY, opacity: textOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-[#8634DE]/10 border border-[#8634DE]/30 text-xs font-bold tracking-[0.2em] uppercase text-[#8634DE] backdrop-blur-md"
          >
            <span className="w-2 h-2 rounded-full bg-[#8634DE] animate-pulse" />
            Coming Soon
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
            className="text-5xl md:text-7xl font-medium tracking-tight mb-6 text-gray-900"
          >
            Master cash flow<br/>& forecasting
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto mb-10"
          >
            Transform raw transaction data into real-time monitoring and powerful forecasting for your business.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1], delay: 0.3 }}
            className="flex items-center justify-center gap-4"
          >
            <button className="px-8 py-4 bg-gray-900 text-white rounded-full font-medium flex items-center gap-2 transition-transform duration-160 ease-out active:scale-[0.97] hover:bg-black shadow-lg shadow-black/10">
              Start building
              <ChevronRight size={18} />
            </button>
          </motion.div>
        </motion.div>

        {/* 3D Interactive Scene */}
        <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[700px] pointer-events-none mt-[30vh] z-20">
          <motion.div 
            className="w-full h-full relative flex items-center justify-center"
            style={{ 
              perspective: 1200,
              scale: coreScale,
              opacity: coreOpacity
            }}
          >
            <motion.div
              className="relative w-[340px] h-[400px]"
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d"
              }}
            >
              {/* Background Glow */}
              <div 
                className="absolute inset-0 bg-[#22c55e]/20 blur-[100px] rounded-full"
                style={{ transform: "translateZ(-80px) scale(0.9)" }}
              />

              {/* Core Score Card */}
              <div 
                className="absolute inset-0 bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-8 flex flex-col items-center justify-center shadow-[0_40px_80px_rgba(0,0,0,0.07),inset_0_0_0_1px_rgba(255,255,255,0.5)]"
                style={{ transform: "translateZ(50px)" }}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#22c55e]/20 to-[#22c55e]/5 flex items-center justify-center mb-6 border border-[#22c55e]/20 shadow-inner">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 22H22L12 2Z" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 10L6 22H18L12 10Z" fill="#22c55e" fillOpacity="0.2"/>
                  </svg>
                </div>
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-gray-500 mb-3">BFS Score</p>
                <div className="text-7xl font-medium tracking-tighter text-gray-900 mb-6 tabular-nums">
                  685
                </div>
                <div className="px-5 py-2 rounded-full bg-[#22c55e]/10 text-[#22c55e] text-sm font-medium border border-[#22c55e]/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                  Excellent health
                </div>
              </div>

              {/* Floating Live Transactions */}
              {TRANSACTIONS.map((tx, i) => {
                // Scrollytelling: Cards explode outwards in X and Z as you scroll down
                const zExplode = useTransform(scrollYProgress, [0, 0.4], [tx.z, tx.z + (tx.z > 0 ? 400 : -400)]);
                const xExplode = useTransform(scrollYProgress, [0, 0.4], [tx.x, tx.x * 2.5]);
                // Continuous vertical bobbing based on time
                const floatY = useTransform(time, t => tx.y + Math.sin(t * 1.5 + i) * 15);

                const getColors = (type: string) => {
                  switch(type) {
                    case 'positive': return 'bg-emerald-50/90 text-emerald-700 border-emerald-200 shadow-emerald-900/5';
                    case 'negative': return 'bg-rose-50/90 text-rose-700 border-rose-200 shadow-rose-900/5';
                    case 'warning': return 'bg-amber-50/90 text-amber-700 border-amber-200 shadow-amber-900/5';
                    default: return 'bg-white/90 text-gray-700 border-gray-200 shadow-gray-900/5';
                  }
                };

                return (
                  <motion.div
                    key={tx.id}
                    className={`absolute left-1/2 top-1/2 px-5 py-3 rounded-2xl border backdrop-blur-xl shadow-xl flex flex-col min-w-[150px] ${getColors(tx.type)}`}
                    style={{
                      x: xExplode,
                      y: floatY,
                      z: zExplode,
                      scale: tx.scale,
                      translateX: "-50%",
                      translateY: "-50%",
                    }}
                  >
                    <span className="text-[10px] opacity-70 font-bold mb-1 tracking-widest uppercase">{tx.label}</span>
                    <span className="text-xl font-semibold tabular-nums tracking-tight">{tx.amount}</span>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
