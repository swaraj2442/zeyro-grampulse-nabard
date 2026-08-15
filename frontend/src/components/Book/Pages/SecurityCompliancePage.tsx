"use client";
import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { bookData } from '../../../data/bookData';import { ShieldAlert, Zap, Users } from 'lucide-react';

export default function SecurityCompliancePage({ isActive }: { isActive: boolean }) {
  const data = bookData.securityCompliance;
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="h-full w-full p-8 pt-12 flex flex-col relative overflow-hidden">
      {/* Animated network background */}
      <motion.div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        animate={isActive ? { rotate: [0, 5, 0], scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 10, repeat: Infinity }}
      >
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          {[...Array(10)].map((_, i) => (
            <circle key={`bg-${i}`} cx={Math.random()*100} cy={Math.random()*100} r="1" fill="#fff" />
          ))}
          {[...Array(15)].map((_, i) => (
            <line 
              key={`line-${i}`} 
              x1={Math.random()*100} y1={Math.random()*100} 
              x2={Math.random()*100} y2={Math.random()*100} 
              stroke="#89dbc2" strokeWidth="0.2" opacity="0.5" 
            />
          ))}
        </svg>
      </motion.div>

      <motion.h2 
        initial={{ opacity: 0, y: -10 }} 
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        className="text-2xl font-bold mb-8 text-[#89dbc2] border-b border-[#205b53] pb-2 uppercase tracking-wider relative z-10"
      >
        Fraud Intelligence
      </motion.h2>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate={isActive ? "visible" : "hidden"}
        className="flex flex-col gap-6 relative z-10"
      >
        <motion.div variants={itemVariants} className="bg-[#17332e] bg-opacity-90  border border-white/10 p-5 rounded-xl flex items-center shadow-[0_0_20px_rgba(137,219,194,0.1)]">
          <div className="p-3 bg-[#1b4840] rounded-full mr-4 text-[#89dbc2]">
            <ShieldAlert size={24} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest opacity-60">Fraud Detected</div>
            <div className="text-2xl font-bold text-white">
              {isActive && <CountUp end={99.1} decimals={1} duration={2} />}%
            </div>
            <div className="text-[9px] text-[#35b89a]">False Positive: 0.8%</div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-[#17332e] bg-opacity-90  border border-white/10 p-5 rounded-xl flex items-center shadow-[0_0_20px_rgba(137,219,194,0.1)]">
          <div className="p-3 bg-[#1b4840] rounded-full mr-4 text-[#89dbc2]">
            <Zap size={24} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest opacity-60">Avg. Detection Time</div>
            <div className="text-2xl font-bold text-white">
              {isActive && <CountUp end={0.35} decimals={2} duration={2} />}s
            </div>
            <div className="text-[9px] text-[#35b89a]">18,420 Daily Alerts</div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-[#17332e] bg-opacity-90  border border-white/10 p-5 rounded-xl flex items-center shadow-[0_0_20px_rgba(137,219,194,0.1)]">
          <div className="p-3 bg-[#1b4840] rounded-full mr-4 text-[#89dbc2]">
            <Users size={24} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest opacity-60">High Risk Profiles</div>
            <div className="text-2xl font-bold text-white">
              {isActive && <CountUp end={42180} duration={2} separator="," />}
            </div>
            <div className="text-[9px] text-[#35b89a]">Continuously Monitored</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
