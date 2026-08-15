"use client";
import React from 'react';
import { motion } from 'framer-motion';

import { bookData } from '../../../data/bookData';

export default function FinalPage({ isActive }: { isActive: boolean }) {
  const data = bookData.final;

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 bg-[#0d1d1a] relative overflow-hidden">
      
      {/* Animated gradients */}
      <motion.div 
        className="absolute top-0 left-0 w-[200%] h-[200%] opacity-20 pointer-events-none"
        animate={isActive ? { rotate: [0, 90, 0], scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 15, repeat: Infinity }}
        style={{
          background: 'radial-gradient(circle, #35b89a 0%, transparent 60%)',
          transformOrigin: 'center center'
        }}
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#35b89a] to-[#89dbc2] mb-10 flex items-center justify-center shadow-[0_0_30px_rgba(137,219,194,0.4)] z-10"
      >
        <span className="text-[#0d1d1a] font-bold text-4xl">Z</span>
      </motion.div>

      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="text-2xl font-bold text-center text-white leading-relaxed z-10 max-w-[80%]"
      >
        {data.tagline}
      </motion.h2>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1, delay: 1 }}
        className="mt-12 pt-8 border-t border-white/10 w-3/4 flex flex-col items-center z-10"
      >
        <p className="text-xl font-light tracking-[0.3em] text-[#89dbc2] mb-4">{data.company}</p>
        <p className="text-[10px] opacity-40 uppercase tracking-widest mb-1">{data.category}</p>
        <p className="text-xs opacity-60 font-mono">{data.year}</p>
      </motion.div>

    </div>
  );
}
