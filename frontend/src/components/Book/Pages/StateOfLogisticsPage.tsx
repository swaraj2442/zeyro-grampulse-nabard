"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import CountUp from 'react-countup';

const data = [
  { name: 'Digital', uv: 8.6 },
  { name: 'Card', uv: 5.1 },
  { name: 'UPI', uv: 4.8 },
  { name: 'Loans', uv: 3.4 },
  { name: 'Insure', uv: 1.9 },
  { name: 'Invest', uv: 1.0 },
];

import { bookData } from '../../../data/bookData';

export default function StateOfLogisticsPage({ isActive }: { isActive: boolean }) {
  const data = bookData.stateOfLogistics;
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="h-full w-full p-8 pt-12 flex flex-col">
      <motion.h2 
        initial={{ opacity: 0, y: -10 }} 
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        className="text-2xl font-bold mb-6 text-[#89dbc2] border-b border-[#205b53] pb-2 uppercase tracking-wider"
      >
        {data.title}
      </motion.h2>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate={isActive ? "visible" : "hidden"}
        className="grid grid-cols-2 gap-4 mb-8"
      >
        {data.stats.map((item, i) => (
          <motion.div key={i} variants={itemVariants} className="bg-[#17332e] bg-opacity-90  border border-white/10 p-3 rounded-lg flex flex-col">
            <span className="text-[10px] uppercase tracking-wider opacity-60 mb-1">{item.label}</span>
            <span className="text-lg font-bold text-white">
              {item.val}
            </span>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="flex-1 bg-[#17332e] bg-opacity-90  border border-white/10 rounded-xl p-4 flex flex-col"
      >
        <h3 className="text-sm font-semibold mb-4 text-[#89dbc2]">{data.chartTitle}</h3>
        <div className="flex-1 w-full relative min-h-[200px]">
          {isActive && (
            <div className="absolute inset-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 10}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 10}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#17332e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#89dbc2' }}
                  />
                  <Bar dataKey="uv" radius={[4, 4, 0, 0]} animationDuration={1500}>
                    {data.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#89dbc2' : '#35b89a'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
