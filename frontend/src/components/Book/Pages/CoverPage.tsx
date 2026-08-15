"use client";
import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

import { bookData } from '../../../data/bookData';

export default function CoverPage({ isActive }: { isActive: boolean }) {
  const data = bookData.cover;
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center bg-[#0d1d1a] relative overflow-hidden">
      {/* Background Particles Placeholder */}
      <motion.div 
        className="absolute inset-0 opacity-20"
        animate={isActive ? { backgroundPosition: ["0% 0%", "100% 100%"] } : {}}
        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
        style={{ backgroundImage: 'radial-gradient(circle, #35b89a 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      />
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate={isActive ? "visible" : "hidden"}
        className="z-10 w-full flex flex-col items-center"
      >
        <motion.div variants={itemVariants} className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#35b89a] to-[#89dbc2] mb-8 flex items-center justify-center shadow-[0_0_20px_rgba(137,219,194,0.3)]">
          <span className="text-[#0d1d1a] font-bold text-3xl">Z</span>
        </motion.div>
        
        <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-[#89dbc2] ">
          {data.title}
        </motion.h1>
        
        <motion.h2 variants={itemVariants} className="text-lg sm:text-xl font-light opacity-90 text-white mb-12 max-w-[80%] leading-relaxed">
          {data.subtitle}
        </motion.h2>

        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-6 w-full max-w-[90%]">
          {data.metrics.map((metric, i) => (
            <div key={i} className="bg-[#17332e] bg-opacity-90  border border-white/10 p-4 rounded-xl flex flex-col items-center">
              <span className="text-2xl font-bold text-[#89dbc2]">
                {isActive && <CountUp end={metric.value} decimals={metric.decimals} duration={2} />}{metric.suffix}
              </span>
              <span className="text-[10px] uppercase tracking-wider opacity-70">{metric.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
