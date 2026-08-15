"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { bookData } from '../../../data/bookData';

export default function FutureRoadmapPage({ isActive }: { isActive: boolean }) {
  const data = bookData.futureRoadmap;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="h-full w-full p-8 pt-12 flex flex-col relative overflow-hidden">
      {/* Background styling */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#35b89a] opacity-5 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2"></div>
      
      <motion.h2 
        initial={{ opacity: 0, y: -10 }} 
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        className="text-2xl font-bold mb-8 text-[#89dbc2] border-b border-[#205b53] pb-2 uppercase tracking-wider relative z-10"
      >
        {data.title}
      </motion.h2>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate={isActive ? "visible" : "hidden"}
        className="flex-1 flex flex-col justify-center gap-6 relative z-10"
      >
        {data.steps.map((step, i) => (
          <motion.div key={i} variants={itemVariants} className="flex items-center gap-4 group">
            <div className={`w-3 h-3 rounded-full ${step.highlight ? 'bg-[#89dbc2] animate-pulse shadow-[0_0_10px_#89dbc2]' : 'bg-[#1f4a42]'} group-hover:bg-[#35b89a] transition-colors`}></div>
            <div className={`flex-1 p-4 rounded-xl border ${step.highlight ? 'border-[#35b89a]/50 bg-[#35b89a]/10' : 'border-[#1f4a42] bg-[#0d1d1a]/50'} hover:border-[#35b89a]/80 transition-all`}>
              <div className="text-xs text-[#89dbc2] font-mono mb-1 opacity-80">{step.label}</div>
              <div className={`font-semibold ${step.highlight ? 'text-white' : 'text-gray-300'}`}>{step.sub}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
