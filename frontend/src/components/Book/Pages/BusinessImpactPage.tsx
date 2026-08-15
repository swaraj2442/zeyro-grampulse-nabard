"use client";
import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function BusinessImpactPage({ isActive }: { isActive: boolean }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <div className="h-full w-full p-8 pt-12 flex flex-col">
      <motion.h2 
        initial={{ opacity: 0, y: -10 }} 
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        className="text-2xl font-bold mb-8 text-[#89dbc2] border-b border-[#205b53] pb-2 uppercase tracking-wider"
      >
        Business Impact
      </motion.h2>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate={isActive ? "visible" : "hidden"}
        className="grid grid-cols-2 gap-4 flex-1 content-start"
      >
        {[
          { label: 'Loan Approval Speed', val: 41, up: true },
          { label: 'Fraud Reduction', val: 34, up: false },
          { label: 'Customer Retention', val: 22, up: true },
          { label: 'Revenue Growth', val: 18, up: true },
          { label: 'Risk Reduction', val: 29, up: false },
          { label: 'Processing Cost', val: 36, up: false },
        ].map((item, i) => (
          <motion.div 
            key={i} 
            variants={itemVariants} 
            className="flex flex-col items-center justify-center p-4 bg-[#17332e] bg-opacity-90 border border-white/10 rounded-xl relative overflow-hidden group hover:bg-white/10 transition-colors"
          >
            {/* Subtle glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#89dbc2]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-center gap-2 mb-2 z-10">
              {item.up ? <TrendingUp size={16} className="text-[#89dbc2]" /> : <TrendingDown size={16} className="text-[#35b89a]" />}
              <span className={`text-2xl font-bold ${item.up ? 'text-white' : 'text-white/80'}`}>
                {isActive && (
                  <>
                    {item.up ? '+' : '-'}
                    <CountUp end={item.val} duration={2} />%
                  </>
                )}
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-wide opacity-60 text-center z-10">{item.label}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
