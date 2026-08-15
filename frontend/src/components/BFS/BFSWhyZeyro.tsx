"use client";

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const customEaseOut = [0.23, 1, 0.32, 1] as const;

export default function BFSWhyZeyro() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { duration: 0.5, ease: customEaseOut }
    }
  };

  return (
    <section className="w-full py-16 md:py-20 px-4 md:px-8 bg-[#f5f5f5] flex items-center justify-center overflow-hidden font-sans selection:bg-orange-500 selection:text-white">
      <div className="max-w-[1400px] w-full mx-auto" ref={ref}>
        {/* Header */}
        <motion.div 
          className="mb-10 md:mb-12 text-center md:text-left"
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.7, ease: customEaseOut }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-gray-900 leading-tight">
            <span className="text-gray-400">Bank-grade </span>
            <span className="text-gray-900 font-bold">security</span>
            <span className="text-gray-400">, seamless </span>
            <span className="text-gray-900 font-bold">integration</span>
            <span className="text-gray-400">, and enterprise-scale </span>
            <span className="text-gray-900 font-bold">reliability.</span>
          </h2>
        </motion.div>

        {/* Bento Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-5 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Left Card - Integration */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-3 rounded-3xl bg-white border border-gray-200 shadow-sm p-6 md:p-8 flex flex-col justify-between group relative overflow-hidden"
          >
            {/* Top Interactive Elements */}
            <div className="space-y-6 relative z-10">
              
              {/* API Snippet */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mt-1 sm:mt-2">API</div>
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4 font-mono text-[11px] sm:text-[12px] leading-relaxed text-gray-600 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex"><span className="text-gray-400 w-5 sm:w-6 select-none">01</span><span><span className="text-blue-600">BFS Score</span> = Zeyro.fetch(</span></div>
                  <div className="flex"><span className="text-gray-400 w-5 sm:w-6 select-none">02</span><span className="ml-4 text-orange-500">"USER_ID"</span>,</div>
                  <div className="flex"><span className="text-gray-400 w-5 sm:w-6 select-none">03</span><span className="ml-4 text-gray-600">headers</span>=&#123;<span className="text-orange-500">"Authorization"</span>:<span className="text-orange-500">"Bearer YOUR_API_KEY"</span>&#125;,</div>
                  <div className="flex"><span className="text-gray-400 w-5 sm:w-6 select-none">04</span><span className="ml-4 text-gray-600">params</span>=&#123;<span className="text-orange-500">"data_type"</span>: <span className="text-purple-600">"de_identified"</span>&#125;</div>
                  <div className="flex"><span className="text-gray-400 w-5 sm:w-6 select-none">05</span><span>)</span></div>
                </div>
              </div>

              {/* CRAs */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
                <div className="text-[10px] font-bold tracking-wider text-gray-400 uppercase w-6">CRAs</div>
                <div className="flex-1 flex gap-2 flex-wrap">
                  {['CIBIL', 'Experian', 'Equifax', 'CRIF'].map((cra) => (
                    <div key={cra} className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                      <span className="font-semibold text-gray-700 text-xs">{cra}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Text */}
            <div className="mt-8 md:mt-12 relative z-10">
              <h3 className="text-lg font-bold text-gray-900 mb-1.5">Easy Integration</h3>
              <p className="text-gray-500 text-[13px] leading-relaxed max-w-sm">
                Available via secure API and seamlessly integrated through India's leading aggregators, CRAs, and decision engines.
              </p>
            </div>

            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-100/50 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 opacity-0 group-hover:opacity-100"></div>
          </motion.div>

          {/* Right Stack */}
          <div className="md:col-span-2 flex flex-col gap-4">
            
            {/* Top Right - Security */}
            <motion.div 
              variants={itemVariants}
              className="flex-1 rounded-3xl overflow-hidden border border-gray-200 shadow-sm group hover:shadow-md transition-shadow duration-300 flex flex-col"
            >
              {/* Light amber header */}
              <div className="bg-amber-50 p-5 flex flex-col gap-4 flex-1">
                {/* Pulsing shield icon — communicates active/live protection */}
                <div className="relative w-10 h-10">
                  {/* Pulse ring */}
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-orange-200"
                    animate={{ scale: [1, 1.5, 1.5], opacity: [0.6, 0, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', repeatDelay: 0.6 }}
                  />
                  <div className="relative w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Staggered badges */}
                <motion.div
                  className="flex flex-wrap gap-2"
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } } }}
                >
                  {[
                    { label: 'RBI Compliant', color: 'text-orange-700 border-orange-300 bg-orange-100' },
                    { label: 'ISO 27001', color: 'text-blue-700 border-blue-300 bg-blue-100' },
                    { label: 'SOC 2 Type II', color: 'text-emerald-700 border-emerald-300 bg-emerald-100' },
                    { label: 'DPDP Ready', color: 'text-purple-700 border-purple-300 bg-purple-100' },
                  ].map((b) => (
                    <motion.span
                      key={b.label}
                      variants={{
                        hidden: { opacity: 0, y: 6, filter: 'blur(3px)' },
                        visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4, ease: customEaseOut } }
                      }}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${b.color}`}
                    >
                      {b.label}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
              {/* Text footer */}
              <div className="bg-white px-5 py-4 border-t border-amber-100">
                <h3 className="text-sm font-bold text-gray-900 mb-1">Safe and Secure</h3>
                <p className="text-gray-500 text-[12px] leading-relaxed">Purpose-built for strict RBI regulatory compliance, localized data residency, and ISO 27001 data security standards.</p>
              </div>
            </motion.div>

            {/* Bottom Right - Reliability */}
            <motion.div 
              variants={itemVariants}
              className="flex-1 rounded-3xl overflow-hidden border border-gray-200 shadow-sm group hover:shadow-md transition-shadow duration-300 flex flex-col"
            >
              {/* Light mint header */}
              <div className="bg-teal-50 p-5 flex flex-col gap-3 flex-1">
                {/* KPI pill */}
                <div className="inline-flex items-center gap-1.5 bg-teal-100 border border-teal-200 rounded-full px-3 py-1 w-fit">
                  <svg className="w-3 h-3 text-teal-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>
                  <span className="text-[11px] font-bold text-teal-700">+54% approval rate</span>
                </div>

                {/* Bar chart — bars grow UP from 0, communicating upward trend */}
                <div className="flex items-end gap-1 h-12">
                  {[40, 52, 45, 61, 58, 72, 68, 79, 75, 88, 85, 94].map((h, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-sm origin-bottom"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{
                        duration: 0.5,
                        delay: 0.4 + i * 0.04,
                        ease: customEaseOut
                      }}
                      style={{
                        height: `${h}%`,
                        background: i >= 9
                          ? 'linear-gradient(to top, #0d9488, #5eead4)'
                          : i >= 6
                          ? '#99f6e4'
                          : '#d0f4ee'
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-teal-400 font-medium">Q1</span>
                  <span className="text-[10px] text-teal-400 font-medium">Q4</span>
                </div>
              </div>
              {/* Text footer */}
              <div className="bg-white px-5 py-4 border-t border-teal-100">
                <h3 className="text-sm font-bold text-gray-900 mb-1">Experience You Can Bank On</h3>
                <p className="text-gray-500 text-[12px] leading-relaxed">Zeyro brings you behavioral cash flow underwriting with the enterprise-scale reliability that top Indian institutions count on.</p>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
