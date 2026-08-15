"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';

const SIGNALS = [
  "BNPL and earned wage access",
  "Rent, utilities, telecom",
  "Subscriptions",
  "Vacations",
  "Gig work",
  "New expenses",
  "Purchasing patterns",
  "And more"
];

export default function CashflowSignals() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <section className="w-full bg-[#f4efe6] text-gray-900 py-24 flex items-center justify-center border-t border-black/5">
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="max-w-6xl mx-auto px-6 w-full flex flex-col"
      >
        
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-20">
          <p className="text-sm font-semibold text-gray-900 mb-6">
            Stay ahead with leading signals
          </p>
          <h2 className="text-[40px] md:text-5xl lg:text-[56px] font-medium tracking-tight leading-[1.1] max-w-4xl text-gray-500">
            <span className="text-gray-900">Move from reactive to </span>
            <span className="text-[#22c55e]">proactive</span>
            <span className="text-gray-900"> across the </span>
            <span className="text-gray-900">entire lifecycle</span>
          </h2>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-12 md:gap-y-0">
          
          {/* Left Side */}
          <motion.div variants={itemVariants} className="md:col-span-4 md:pr-16 lg:pr-24">
            <p className="text-[22px] md:text-2xl text-gray-600 font-normal leading-snug tracking-tight">
              Real-time visibility into financial obligations and behaviors
            </p>
          </motion.div>

          {/* Right Side Grid */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:border-l border-black/10">
            {SIGNALS.map((signal, index) => {
              // Add top border for all except the first row
              const hasTopBorder = index > 1;
              return (
                <motion.div 
                  variants={itemVariants}
                  key={index} 
                  className={`
                    flex items-center py-6 px-2 sm:px-8
                    ${hasTopBorder ? 'border-t border-black/10' : ''}
                    ${index % 2 === 0 ? 'sm:border-r border-black/10' : ''}
                  `}
                >
                  <div className="w-[2px] h-4 bg-[#22c55e] mr-4 opacity-80" />
                  <span className="text-gray-700 text-base font-normal">{signal}</span>
                </motion.div>
              );
            })}
          </div>
          
        </div>
        
      </motion.div>
    </section>
  );
}
