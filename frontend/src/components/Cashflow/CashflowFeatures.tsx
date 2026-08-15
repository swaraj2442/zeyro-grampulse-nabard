"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';

export default function CashflowFeatures() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <section className="w-full bg-[#f4efe6] text-gray-900 py-24 flex flex-col items-center justify-center space-y-20 lg:space-y-32">
      <div className="max-w-5xl mx-auto px-6 w-full flex flex-col space-y-20 lg:space-y-32">
        
        {/* Feature 1: Surface growth opportunities */}
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center"
        >
          {/* Left: Card (Stays Dark) */}
          <motion.div variants={itemVariants} className="order-2 lg:order-1 bg-[#111113] rounded-2xl p-6 md:p-8 border border-white/5 relative shadow-2xl">
            <p className="text-[#22c55e] text-[10px] font-semibold tracking-[0.2em] uppercase mb-6">
              New Income Source
            </p>
            
            <div className="flex flex-col">
              {/* Highlighted item */}
              <div className="border border-dashed border-[#22c55e] rounded-xl p-4 mb-2 bg-[#22c55e]/[0.02]">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-white text-sm mb-1">AIRBNB</div>
                    <div className="text-gray-500 text-xs">Apr 12 • 3:00 pm</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-[#22c55e] text-sm mb-1">+₹48,250</div>
                    <div className="text-gray-500 text-xs">₹7,20,500</div>
                  </div>
                </div>
              </div>

              {/* Normal item 1 */}
              <div className="p-4 mb-0 opacity-90">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-300 text-sm mb-1">NEFT Transfer</div>
                    <div className="text-[#555] text-xs">Mar 31 • 8:00 am</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-300 text-sm mb-1">+₹1,54,000</div>
                    <div className="text-[#555] text-xs">₹6,72,250</div>
                  </div>
                </div>
              </div>

              {/* Faded item 2 */}
              <div className="p-4 mb-0 opacity-50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-400 text-sm mb-1">NEFT Transfer</div>
                    <div className="text-[#444] text-xs">Mar 15 • 8:00 am</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-400 text-sm mb-1">+₹1,54,000</div>
                    <div className="text-[#444] text-xs">₹5,18,250</div>
                  </div>
                </div>
              </div>

              {/* Very faded item 3 */}
              <div className="p-4 opacity-20">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-500 text-sm mb-1">NEFT Transfer</div>
                    <div className="text-[#333] text-xs">Feb 28 • 8:00 am</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-500 text-sm mb-1">+₹1,54,000</div>
                    <div className="text-[#333] text-xs">₹3,64,250</div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>

          {/* Right: Text */}
          <motion.div variants={itemVariants} className="order-1 lg:order-2 lg:pl-8">
            <h3 className="text-3xl md:text-4xl font-medium tracking-tight mb-5 text-gray-900 leading-tight">
              Surface growth opportunities
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed max-w-md">
              Identify new income streams, life events, and emerging financial needs in real time.
            </p>
          </motion.div>
        </motion.div>


        {/* Feature 2: Intercept risk */}
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center"
        >
          {/* Left: Text */}
          <motion.div variants={itemVariants} className="order-1 lg:pr-8">
            <h3 className="text-3xl md:text-4xl font-medium tracking-tight mb-5 text-gray-900 leading-tight">
              Intercept risk
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed max-w-md">
              Intervene early with tools like forbearance, refinance, or payment deferrals to prevent defaults and keep customers on track.
            </p>
          </motion.div>

          {/* Right: Card */}
          <motion.div variants={itemVariants} className="order-2 bg-[#111113] rounded-2xl p-6 md:p-8 border border-white/5 relative shadow-2xl overflow-hidden">
            <div className="grid grid-cols-3 gap-4 h-full relative">
              
              {/* Dividers */}
              <div className="absolute top-0 bottom-0 left-1/3 w-[1px] border-l border-dashed border-white/10" />
              <div className="absolute top-0 bottom-0 left-2/3 w-[1px] border-l border-dashed border-white/10" />

              {/* Col 1: Recent Activity */}
              <div className="flex flex-col items-center justify-start pt-2 px-2">
                <p className="text-[#888] text-[9px] font-semibold tracking-widest uppercase mb-10 text-center">
                  Recent<br/>Activity
                </p>
                <div className="space-y-3 w-full flex flex-col items-center">
                  <div className="h-1.5 w-16 bg-[#222] rounded-full" />
                  <div className="h-1.5 w-20 bg-[#222] rounded-full" />
                  <div className="h-1.5 w-14 bg-[#222] rounded-full" />
                  <div className="h-1.5 w-16 bg-[#222] rounded-full opacity-50" />
                  <div className="h-1.5 w-12 bg-[#222] rounded-full opacity-30" />
                </div>
              </div>

              {/* Col 2: Risk Identified */}
              <div className="flex flex-col items-center justify-start pt-2 px-2">
                <p className="text-[#ef4444] text-[9px] font-semibold tracking-widest uppercase mb-10 text-center">
                  Risk<br/>Identified
                </p>
                <div className="w-14 h-14 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center mt-2 relative">
                  {/* Subtle pulsing background */}
                  <div className="absolute inset-0 rounded-full bg-[#ef4444]/20 animate-ping opacity-20" />
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 9V14" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M12 17.01L12.01 16.9989" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10.29 3.86001L1.82002 18C1.64539 18.3024 1.55299 18.6453 1.55201 18.9945C1.55103 19.3437 1.64151 19.6871 1.81445 19.9905C1.98738 20.2939 2.23675 20.5468 2.53773 20.7239C2.83871 20.901 3.18082 20.9962 3.53002 21H20.47C20.8192 20.9962 21.1613 20.901 21.4623 20.7239C21.7633 20.5468 22.0126 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86001C13.5318 3.56613 13.28 3.32284 12.9806 3.15451C12.6812 2.98618 12.3444 2.89874 12 2.89874C11.6556 2.89874 11.3188 2.98618 11.0194 3.15451C10.72 3.32284 10.4682 3.56613 10.29 3.86001Z" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* Col 3: Offer Assistance */}
              <div className="flex flex-col items-center justify-start pt-2 px-2">
                <p className="text-[#eab308] text-[9px] font-semibold tracking-widest uppercase mb-10 text-center">
                  Offer<br/>Assistance
                </p>
                <div className="w-full space-y-3">
                  <button className="w-full py-1.5 px-2 rounded bg-[#eab308]/5 border border-[#eab308]/20 text-[#eab308] text-[10px] font-medium tracking-wide hover:bg-[#eab308]/10 transition-colors">
                    Payment plan
                  </button>
                  <button className="w-full py-1.5 px-2 rounded bg-[#eab308]/5 border border-[#eab308]/20 text-[#eab308] text-[10px] font-medium tracking-wide hover:bg-[#eab308]/10 transition-colors">
                    Forbearance
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        </motion.div>


        {/* Feature 3: Recover smarter */}
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center"
        >
          {/* Left: Card */}
          <motion.div variants={itemVariants} className="order-2 lg:order-1 bg-[#111113] rounded-2xl pt-16 pb-4 border border-white/5 relative shadow-2xl overflow-hidden">
            
            {/* Floating Badge */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-[#1a1a1c] border border-white/10 rounded-lg px-4 py-2 flex items-center gap-3 shadow-lg z-10">
              <div className="w-2 h-2 rounded-full bg-[#22c55e] shadow-[0_0_8px_#22c55e]" />
              <span className="text-gray-300 text-sm font-medium">
                Next paycheck expected in <span className="text-white font-semibold">5 days</span>
              </span>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-5 border-t border-white/5 mt-4">
              
              {/* Row 1 */}
              <div className="aspect-square border-r border-b border-white/5 p-2 text-[#444] text-[10px] font-medium">30</div>
              <div className="aspect-square border-r border-b border-white/5 p-2 text-[#444] text-[10px] font-medium">31</div>
              <div className="aspect-square border-r border-b border-white/5 p-2 text-[#22c55e] text-[10px] font-medium bg-[#192b21]">1</div>
              <div className="aspect-square border-r border-b border-white/5 p-2 text-[#555] text-[10px] font-medium">2</div>
              <div className="aspect-square border-b border-white/5 p-2 text-[#555] text-[10px] font-medium">3</div>
              
              {/* Row 2 */}
              <div className="aspect-square border-r border-white/5 p-2 text-[#555] text-[10px] font-medium">6</div>
              <div className="aspect-square border-r border-white/5 p-2 text-[#555] text-[10px] font-medium">7</div>
              <div className="aspect-square border-r border-white/5 p-2 text-[#555] text-[10px] font-medium">8</div>
              <div className="aspect-square border-r border-white/5 p-2 text-[#555] text-[10px] font-medium">9</div>
              <div className="aspect-square p-2 text-[#555] text-[10px] font-medium">10</div>

            </div>

          </motion.div>

          {/* Right: Text */}
          <motion.div variants={itemVariants} className="order-1 lg:order-2 lg:pl-8">
            <h3 className="text-3xl md:text-4xl font-medium tracking-tight mb-5 text-gray-900 leading-tight">
              Recover smarter
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed max-w-md">
              Time collections outreach to when funds are available to boost outcomes and reduce friction.
            </p>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
