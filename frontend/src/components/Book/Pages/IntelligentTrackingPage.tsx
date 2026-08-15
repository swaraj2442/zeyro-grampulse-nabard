"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

import { bookData } from '../../../data/bookData';

export default function IntelligentTrackingPage({ isActive }: { isActive: boolean }) {
  const data = bookData.intelligentTracking;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="h-full w-full p-8 pt-10 flex flex-col">
      <motion.h2 
        initial={{ opacity: 0, y: -10 }} 
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        className="text-2xl font-bold mb-4 text-[#89dbc2] border-b border-[#205b53] pb-2 uppercase tracking-wider"
      >
        {data.title}
      </motion.h2>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate={isActive ? "visible" : "hidden"}
        className="flex flex-col items-center justify-center flex-1 w-full relative"
      >
        {/* Animated glowing line behind steps */}
        {isActive && (
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: "100%" }}
            transition={{ duration: 2.5, ease: "linear" }}
            className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#35b89a] to-[#89dbc2] -z-10"
          />
        )}

        {data.steps.map((step, i) => (
          <React.Fragment key={i}>
            <motion.div 
              variants={stepVariants}
              className={`w-full max-w-[200px] py-2 px-3 rounded-lg text-center border ${
                step.highlight 
                  ? 'bg-[#1b4840] border-[#89dbc2] shadow-[0_0_15px_rgba(137,219,194,0.4)]' 
                  : 'bg-[#17332e] bg-opacity-90 border-white/10'
              }`}
            >
              <h3 className={`font-semibold ${step.highlight ? 'text-[#89dbc2]' : 'text-white'} text-[13px] leading-tight`}>{step.label}</h3>
              <p className="text-[9px] opacity-70 mt-0.5">{step.sub}</p>
            </motion.div>
            
            {i < data.steps.length - 1 && (
              <motion.div variants={stepVariants} className="text-[#35b89a] opacity-50 my-1">
                <ArrowDown size={14} />
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
}
