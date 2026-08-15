"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function RomanRoadmapScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Layer 1: Foundation (0 - 0.33)
  const l1Opacity = useTransform(scrollYProgress, [0, 0.1, 0.25, 0.35], [0, 1, 1, 0]);
  const l1Y = useTransform(scrollYProgress, [0, 0.1, 0.25, 0.35], [50, 0, 0, -50]);

  // Layer 2: Architecture (0.33 - 0.66)
  const l2Opacity = useTransform(scrollYProgress, [0.25, 0.4, 0.55, 0.7], [0, 1, 1, 0]);
  const l2Y = useTransform(scrollYProgress, [0.25, 0.4, 0.55, 0.7], [50, 0, 0, -50]);

  // Layer 3: Empire (0.66 - 1)
  const l3Opacity = useTransform(scrollYProgress, [0.6, 0.8, 1], [0, 1, 1]);
  const l3Y = useTransform(scrollYProgress, [0.6, 0.8, 1], [50, 0, 0]);

  // Visual Object Transformations
  // A cube that rotates and splits
  const cubeRotateX = useTransform(scrollYProgress, [0, 1], [20, 360]);
  const cubeRotateY = useTransform(scrollYProgress, [0, 1], [45, 360]);
  const cubeScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.5, 1]);

  return (
    <section ref={containerRef} className="relative h-[400vh] bg-slate-900 w-full font-sans">
      
      {/* Sticky Viewport */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        
        {/* Background Ambient Glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <motion.div 
            className="w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] rounded-full blur-[120px]"
            style={{ 
              backgroundColor: useTransform(scrollYProgress, [0, 0.5, 1], ["#1e293b", "#1e3a8a", "#4c1d95"])
            }}
          />
        </div>

        {/* Central Transformative Visual */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
           <motion.div 
              style={{
                rotateX: cubeRotateX,
                rotateY: cubeRotateY,
                scale: cubeScale,
              }}
              className="w-48 h-48 md:w-64 md:h-64 relative preserve-3d"
           >
              {/* Foundation block (Layer 1) */}
              <motion.div 
                style={{ opacity: useTransform(scrollYProgress, [0, 0.25], [1, 0]) }}
                className="absolute inset-0 border border-slate-500 bg-slate-800/80 backdrop-blur-xl flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.1)] rounded-xl"
              >
                <div className="text-slate-300 font-serif tracking-widest text-xs">L-I</div>
              </motion.div>

              {/* Pillars (Layer 2) */}
              <motion.div 
                style={{ opacity: useTransform(scrollYProgress, [0.2, 0.35, 0.55, 0.7], [0, 1, 1, 0]) }}
                className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-4"
              >
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-blue-600/20 border border-blue-400/50 rounded-lg backdrop-blur-md shadow-[0_0_30px_rgba(59,130,246,0.2)]" />
                ))}
              </motion.div>

              {/* Glowing Neural Network (Layer 3) */}
              <motion.div 
                style={{ opacity: useTransform(scrollYProgress, [0.6, 0.75], [0, 1]) }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-full h-full rounded-full border-2 border-dashed border-indigo-400/60 animate-spin-slow flex items-center justify-center">
                   <div className="w-16 h-16 bg-indigo-500 rounded-full shadow-[0_0_100px_rgba(99,102,241,0.8)] flex items-center justify-center">
                     <span className="text-white font-bold text-xs tracking-widest">AI</span>
                   </div>
                </div>
              </motion.div>
           </motion.div>
        </div>

        {/* Text Overlays */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-6 h-full flex flex-col justify-center pointer-events-none">
          
          {/* Layer 1 Text */}
          <motion.div 
            style={{ opacity: l1Opacity, y: l1Y }}
            className="absolute left-6 md:left-24 top-1/2 -translate-y-1/2 max-w-md"
          >
            <div className="text-slate-400 text-xs font-bold tracking-[0.2em] mb-4 uppercase">Layer 1 : The Foundation</div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
              Advanced <br/>Cash Flow Underwriting.
            </h2>
            <p className="text-slate-300 leading-relaxed text-lg">
              The bedrock of the intelligence engine. We process risk signals directly from raw transaction data with sub-100ms behavioral tagging. 
            </p>
          </motion.div>

          {/* Layer 2 Text */}
          <motion.div 
            style={{ opacity: l2Opacity, y: l2Y }}
            className="absolute right-6 md:right-24 top-1/2 -translate-y-1/2 max-w-md text-right"
          >
            <div className="text-blue-400 text-xs font-bold tracking-[0.2em] mb-4 uppercase">Layer 2 : The Architecture</div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
              Vertical-Specific<br/>Agent Applications.
            </h2>
            <p className="text-slate-300 leading-relaxed text-lg">
              Real-time income assessment and accurate transaction categorization empower AI agents to act instantly on high-intent financial windows.
            </p>
          </motion.div>

          {/* Layer 3 Text */}
          <motion.div 
            style={{ opacity: l3Opacity, y: l3Y }}
            className="absolute left-6 md:left-24 top-1/2 -translate-y-1/2 max-w-md"
          >
            <div className="text-indigo-400 text-xs font-bold tracking-[0.2em] mb-4 uppercase">Layer 3 : The Empire</div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
              Financial Infrastructure<br/>for Agents.
            </h2>
            <p className="text-slate-300 leading-relaxed text-lg">
              The complete ecosystem. An API-first platform where hyper-personalized products and predictive models converge to build a bank for you.
            </p>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
