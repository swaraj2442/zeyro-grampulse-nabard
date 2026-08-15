"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { bookData } from '../../../data/bookData';import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import CountUp from 'react-countup';

const lineData = [
  { name: 'Wk 1', acc: 82 },
  { name: 'Wk 2', acc: 88 },
  { name: 'Wk 3', acc: 92 },
  { name: 'Wk 4', acc: 95 },
  { name: 'Wk 5', acc: 97 },
  { name: 'Wk 6', acc: 98.6 },
];

export default function DriverSafetyPage({ isActive }: { isActive: boolean }) {
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
        AI Performance
      </motion.h2>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate={isActive ? "visible" : "hidden"}
        className="grid grid-cols-2 gap-4 mb-6"
      >
        {[
          { label: 'Accuracy', val: 98.6 },
          { label: 'Precision', val: 96.8 },
          { label: 'Recall', val: 96.2 },
          { label: 'F1 Score', val: 96.5 },
        ].map((item, i) => (
          <motion.div key={i} variants={itemVariants} className="flex flex-col items-center justify-center p-4 bg-[#17332e] bg-opacity-90 border border-white/5 rounded-xl relative overflow-hidden min-h-[100px]">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg className="w-[84px] h-[84px] -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.15" />
                <motion.circle 
                  cx="50" cy="50" r="46" fill="none" stroke="#89dbc2" strokeWidth="4" 
                  strokeDasharray="289" strokeDashoffset="289"
                  animate={isActive ? { strokeDashoffset: 289 - (289 * item.val) / 100 } : { strokeDashoffset: 289 }}
                  transition={{ duration: 2, delay: 0.5 + i * 0.1 }}
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-base font-bold text-white z-10 leading-none">
              {isActive && <CountUp end={item.val} decimals={1} duration={2} />}%
            </span>
            <span className="text-[9px] uppercase tracking-wide opacity-60 mt-1 z-10">{item.label}</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
        transition={{ delay: 0.8 }}
        className="flex-1 w-full bg-[#17332e] bg-opacity-90 rounded-xl border border-white/10 p-4 min-h-[180px] flex flex-col"
      >
        <h3 className="text-xs font-semibold mb-2 opacity-70">Accuracy Improvement</h3>
        <div className="flex-1 w-full relative min-h-[150px] mt-2">
          {isActive && (
            <div className="absolute inset-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 10}} axisLine={false} tickLine={false} />
                  <YAxis domain={[80, 100]} tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 10}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#17332e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#89dbc2' }}
                  />
                  <Line type="monotone" dataKey="acc" stroke="#89dbc2" strokeWidth={3} dot={{ r: 4, fill: '#35b89a' }} animationDuration={2000} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
