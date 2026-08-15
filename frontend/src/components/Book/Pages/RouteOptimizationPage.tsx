"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { bookData } from '../../../data/bookData';
export default function RouteOptimizationPage({ isActive }: { isActive: boolean }) {
  const data = bookData.routeOptimization;
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="h-full w-full p-8 pt-12 flex flex-col">
      <motion.h2 
        initial={{ opacity: 0, y: -10 }} 
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        className="text-2xl font-bold mb-6 text-[#89dbc2] border-b border-[#205b53] pb-2 uppercase tracking-wider"
      >
        Machine Learning
      </motion.h2>

      {/* SVG Neural Network Visualization */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1 }}
        className="w-full flex-1 min-h-[200px] mb-6 flex items-center justify-center relative overflow-hidden bg-black/20 rounded-xl border border-white/5"
      >
        {isActive && (
          <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
            {/* Connections */}
            {[0, 1, 2].map((i) => 
              [0, 1, 2, 3].map((j) => (
                <motion.line 
                  key={`line1-${i}-${j}`}
                  x1={80} y1={60 + i * 40} x2={160} y2={40 + j * 40}
                  stroke="rgba(53, 184, 154, 0.2)" strokeWidth="1"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: 0.5 + i * 0.1 }}
                />
              ))
            )}
            {[0, 1, 2, 3].map((i) => 
              [0, 1, 2].map((j) => (
                <motion.line 
                  key={`line2-${i}-${j}`}
                  x1={160} y1={40 + i * 40} x2={240} y2={60 + j * 40}
                  stroke="rgba(137, 219, 194, 0.2)" strokeWidth="1"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: 1 + i * 0.1 }}
                />
              ))
            )}
            {[0, 1, 2].map((i) => 
              [0, 1].map((j) => (
                <motion.line 
                  key={`line3-${i}-${j}`}
                  x1={240} y1={60 + i * 40} x2={320} y2={80 + j * 40}
                  stroke="rgba(137, 219, 194, 0.4)" strokeWidth="1.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: 1.5 + i * 0.1 }}
                />
              ))
            )}
            
            {/* Nodes */}
            {[0, 1, 2].map((i) => (
              <circle key={`node1-${i}`} cx={80} cy={60 + i * 40} r="4" fill="#35b89a" />
            ))}
            {[0, 1, 2, 3].map((i) => (
              <motion.circle 
                key={`node2-${i}`} cx={160} cy={40 + i * 40} r="5" fill="#89dbc2"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
            {[0, 1, 2].map((i) => (
              <motion.circle 
                key={`node3-${i}`} cx={240} cy={60 + i * 40} r="5" fill="#89dbc2"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 + i * 0.2 }}
              />
            ))}
            {[0, 1].map((i) => (
              <motion.circle 
                key={`node4-${i}`} cx={320} cy={80 + i * 40} r="6" fill="#fff"
                animate={{ filter: ["drop-shadow(0 0 2px #fff)", "drop-shadow(0 0 10px #89dbc2)", "drop-shadow(0 0 2px #fff)"] }}
                transition={{ duration: 2, repeat: Infinity, delay: 2 + i * 0.2 }}
              />
            ))}

            {/* Labels */}
            <text x="80" y="20" fill="#fff" fontSize="10" opacity="0.5" textAnchor="middle">Input</text>
            <text x="160" y="20" fill="#fff" fontSize="10" opacity="0.5" textAnchor="middle">256 Neurons</text>
            <text x="240" y="20" fill="#fff" fontSize="10" opacity="0.5" textAnchor="middle">128 Neurons</text>
            <text x="320" y="20" fill="#fff" fontSize="10" opacity="0.5" textAnchor="middle">Output</text>
          </svg>
        )}
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate={isActive ? "visible" : "hidden"}
        className="w-full bg-[#17332e] bg-opacity-90  rounded-xl border border-white/10 p-4"
      >
        <h3 className="text-sm font-semibold mb-3 text-[#89dbc2]">Model Information</h3>
        <div className="grid grid-cols-2 gap-y-3 gap-x-6">
          {[
            { label: 'Algorithm', val: 'Gradient Boosting' },
            { label: 'Samples', val: '19.6 Million' },
            { label: 'Epochs', val: '120' },
            { label: 'Batch Size', val: '1024' },
            { label: 'Learning Rate', val: '0.001' },
            { label: 'GPU', val: 'NVIDIA A100' },
          ].map((item, i) => (
            <motion.div key={i} variants={itemVariants} className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-[10px] uppercase opacity-50">{item.label}</span>
              <span className="text-[11px] font-mono text-white">{item.val}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
