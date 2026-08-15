"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import CountUp from 'react-countup';

const radarData = [
  { subject: 'Income', A: 120, fullMark: 150 },
  { subject: 'Cash Flow', A: 98, fullMark: 150 },
  { subject: 'Credit', A: 86, fullMark: 150 },
  { subject: 'Risk', A: 99, fullMark: 150 },
  { subject: 'Behavior', A: 85, fullMark: 150 },
  { subject: 'Fraud', A: 65, fullMark: 150 },
];

export default function PredictiveMaintenancePage({ isActive }: { isActive: boolean }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
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
        className="text-2xl font-bold mb-6 text-[#89dbc2] border-b border-[#205b53] pb-2 uppercase tracking-wider"
      >
        Feature Engineering
      </motion.h2>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate={isActive ? "visible" : "hidden"}
        className="grid grid-cols-3 gap-2 mb-6"
      >
        {[
          { label: 'Risk', val: 420 },
          { label: 'Behavior', val: 2100 },
          { label: 'Merchant', val: 5800 },
          { label: 'Fraud', val: 2400 },
          { label: 'Lifestyle', val: 1830 },
          { label: 'Income', val: 240 },
        ].map((item, i) => (
          <motion.div key={i} variants={itemVariants} className="flex flex-col items-center justify-center p-2 bg-[#17332e] bg-opacity-90 border border-white/5 rounded-lg">
            <span className="text-[#35b89a] font-bold text-sm">
              {isActive && <CountUp end={item.val} duration={2} />}
            </span>
            <span className="text-[8px] uppercase tracking-wide opacity-60 text-center">{item.label}</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center mb-4"
      >
        <div className="text-xl font-bold text-[#89dbc2]">18,500+</div>
        <div className="text-[10px] uppercase tracking-widest opacity-50">Engineered Features</div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
        transition={{ delay: 0.8 }}
        className="flex-1 w-full bg-[#17332e] bg-opacity-90 rounded-xl border border-white/10 p-2 min-h-[220px]"
      >
        <h3 className="text-xs font-semibold text-center mt-2 opacity-70">Feature Importance</h3>
        <div className="flex-1 w-full relative min-h-[200px] mt-2">
          {isActive && (
            <div className="absolute inset-0">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 9 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                  <Radar name="Importance" dataKey="A" stroke="#89dbc2" fill="#35b89a" fillOpacity={0.5} animationDuration={1500} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
