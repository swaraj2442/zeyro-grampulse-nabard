"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';

export default function CashflowIntegration() {
  return (
    <section className="w-full bg-[#f4efe6] text-gray-900 py-32 px-6 flex justify-center">
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-5xl rounded-3xl overflow-hidden p-[1px] shadow-2xl"
      >
        
        {/* Animated Moving Rainbow Border */}
        {/* We use a 1px padding wrapper, and this gradient sits behind the inner div.
            The maskImage makes it visible only at the top and fading out downwards. */}
        <motion.div 
          className="absolute inset-0 z-0 opacity-80"
          style={{
            background: 'linear-gradient(90deg, #06b6d4, #8b5cf6, #ec4899, #ef4444, #eab308, #22c55e, #06b6d4)',
            backgroundSize: '200% 100%',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 5%, transparent 60%)',
            maskImage: 'linear-gradient(to bottom, black 0%, black 5%, transparent 60%)'
          }}
          animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
          transition={{ duration: 4, ease: 'linear', repeat: Infinity }}
        />

        {/* Inner Card Content */}
        <div className="relative z-10 bg-[#111113] rounded-[23px] w-full h-full p-10 md:p-16 lg:p-20 flex flex-col md:flex-row items-center justify-between gap-12">
          
          {/* Left Side: Typography */}
          <div className="max-w-xl text-center md:text-left">
            <h2 className="text-4xl md:text-5xl lg:text-[52px] font-medium tracking-tight mb-6 leading-tight">
              <span className="text-gray-400">Your data. </span>
              <span className="text-white">Fully activated.</span>
            </h2>
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed">
              Run continuous cash flow monitoring across first-party CASA and Account Aggregator transaction data sources.
            </p>
          </div>

          {/* Right Side: Integration Widget */}
          <div className="bg-[#18181a] border border-white/5 rounded-2xl p-8 md:p-10 flex flex-col items-center justify-center min-w-[240px] shadow-2xl shrink-0 group">
            <p className="text-[#888] text-[10px] font-semibold tracking-widest uppercase mb-6 group-hover:text-gray-400 transition-colors">
              Easy Integration
            </p>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, ease: "linear", repeat: Infinity }}
            >
              <Settings className="w-12 h-12 text-gray-400 drop-shadow-[0_0_8px_rgba(255,255,255,0.1)] group-hover:text-white transition-colors duration-300" />
            </motion.div>
          </div>

        </div>

      </motion.div>
      
    </section>
  );
}
