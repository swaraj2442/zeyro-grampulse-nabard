"use client";

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const customEaseOut = [0.23, 1, 0.32, 1] as const;

const steps = [
  {
    num: '01',
    text: 'Client pulls deposit account data through any data aggregator or directly from client systems.'
  },
  {
    num: '02',
    text: 'De-identified data is shared with Zeyro via data aggregators, decision engines, or secure, single-endpoint API connection.'
  },
  {
    num: '03',
    text: 'Data is processed and outputs are returned with sub-second response times and >99.9% availability.'
  },
  {
    num: '04',
    text: 'Client receives Zeyro products and uses them to determine credit approval, pricing, portfolio management, and more.'
  }
];

export default function BFSHowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: customEaseOut }
    }
  };

  return (
    <section className="w-full py-32 px-4 md:px-8 bg-[#f5f5f5] flex items-center justify-center overflow-hidden font-sans selection:bg-[#35b89a] selection:text-white">
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8" ref={ref}>
        
        {/* Left Column: Heading */}
        <motion.div 
          className="lg:col-span-4"
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
          transition={{ duration: 0.8, ease: customEaseOut }}
        >
          <div className="sticky top-32">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-gray-900 leading-tight">
              How it works
            </h2>
          </div>
        </motion.div>

        {/* Right Column: Steps */}
        <motion.div 
          className="lg:col-span-8 lg:pl-16"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div className="flex flex-col">
            {steps.map((step, index) => (
              <motion.div 
                key={step.num}
                variants={itemVariants}
                className={`flex items-start gap-6 py-10 ${index !== 0 ? 'border-t border-gray-200' : 'pt-0 lg:pt-10'}`}
              >
                {/* Number Badge */}
                <div className="flex-shrink-0 w-8 h-8 rounded border border-gray-200 bg-gray-50 flex items-center justify-center font-mono text-[11px] font-bold text-gray-500 shadow-sm">
                  {step.num}
                </div>
                
                {/* Step Text */}
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl">
                  {step.text}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
