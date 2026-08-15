"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Database, BrainCircuit, Network, ChevronRight, User, Briefcase, Landmark } from 'lucide-react';

export default function ZeyroHowItWorks() {
  return (
    <div className="w-full max-w-[100rem] mx-auto px-6 md:pl-[280px] lg:pl-[320px] lg:pr-12 pt-4 lg:pt-8 pb-6 lg:pb-12 pointer-events-auto">
      {/* Existing Section */}
      <div id="layer-8">
        {/* Header Bar */}
        <div className="w-full flex justify-between items-center mb-12">
          <div className="flex items-center gap-2 text-xs font-normal tracking-widest uppercase text-gray-500" style={{ fontFamily: 'var(--font-dm-mono), monospace' }}>
            <span className="text-[#8634DE]">{'>'}</span> HOW IT WORKS
          </div>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <h2 className="text-[30px] md:text-3xl font-space-grotesk font-normal tracking-tight text-slate-900">
            How it <span className="text-[#8634DE]">works.</span>
          </h2>
          <p className="text-slate-500 text-[13px] font-dm-sans font-normal max-w-sm leading-relaxed">
          From fragmented financial data to production ready intelligence in 5 simple steps.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 bg-slate-200 border border-slate-200 gap-[1px] rounded-[40px] overflow-hidden shadow-sm">
        
        {/* Card 1: Integrate */}
        <div className="bg-white flex flex-col group">
          {/* Visual Area */}
          <div className="bg-indigo-50/50 min-h-[200px] md:min-h-[240px] lg:aspect-[21/9] relative overflow-hidden flex items-center justify-center p-4">
            {/* Mock Code Window */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="w-full max-w-sm bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700"
            >
              <div className="bg-slate-800 px-3 py-1.5 flex items-center gap-2 text-[10px] text-slate-400 font-mono border-b border-slate-700">
                <div className="flex gap-1 mr-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500/80"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-500/80"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500/80"></div>
                </div>
                agent_init.ts
              </div>
              <div className="p-3 md:p-5 text-xs font-mono text-[#8634DE]/60 leading-relaxed overflow-x-auto">
                <div><span className="text-slate-400">// 1. Install the SDK</span></div>
                <div className="text-white mb-4">npm install zeyro</div>
                <div><span className="text-slate-400">// 2. Initialize the client</span></div>
                <div><span className="text-emerald-400">import</span> {'{'} Zeyro {'}'} <span className="text-emerald-400">from</span> <span className="text-amber-300">"zeyro"</span>;</div>
                <div className="mt-4"><span className="text-emerald-400">const</span> zeyro = <span className="text-emerald-400">new</span> <span className="text-[#8634DE]/40">Zeyro</span>();</div>
              </div>
            </motion.div>
          </div>
          {/* Text Area */}
          <div className="p-4 md:p-5 flex-grow">
            <div className="text-[#8634DE] text-[10px] font-normal tracking-[0.2em] mb-2 uppercase flex items-center gap-2">
              <span>01</span> <span className="text-[#8634DE]/60">/</span> <span>Connect</span>
            </div>
            <h3 className="text-[24px] font-space-grotesk font-normal text-slate-900 mb-1.5 tracking-tight">Connect your financial ecosystem.</h3>
            <p className="text-slate-400 font-dm-sans font-light leading-relaxed text-[12px]">
              Unified connectors for banking, AA, GST, accounting, bureau, payment gateways, enterprise systems, and proprietary data.
            </p>
          </div>
        </div>

        {/* Card 2: Ingest */}
        <div className="bg-white flex flex-col group">
          {/* Visual Area */}
          <div className="bg-indigo-50/50 min-h-[200px] md:min-h-[240px] lg:aspect-[21/9] relative overflow-hidden flex items-center justify-center p-4">
            <div className="relative w-full h-[200px] flex items-center justify-center overflow-hidden">
               <div className="relative w-[160px] h-[100px]">
                 
                 {/* Shape 1: Top Left */}
                 <motion.div
                   className="absolute inset-0 bg-indigo-400 z-10 flex items-start justify-start p-2"
                   style={{ clipPath: "polygon(0% 0%, 55% 0%, 40% 60%, 0% 45%)" }}
                   animate={{ 
                     x: [-80, 0, 0, -80, -80], 
                     y: [-60, 0, 0, -60, -60], 
                     rotate: [-45, 0, 0, -45, -45],
                     opacity: [0, 1, 1, 0, 0] 
                   }}
                   transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", times: [0, 0.25, 0.8, 0.9, 1] }}
                 >
                   <span className="text-[7px] font-bold text-white uppercase tracking-wider pl-1 pt-1 opacity-90">Normalize</span>
                 </motion.div>

                 {/* Shape 2: Top Right */}
                 <motion.div
                   className="absolute inset-0 bg-purple-400 z-10 flex items-start justify-end p-2"
                   style={{ clipPath: "polygon(55% 0%, 100% 0%, 100% 65%, 40% 60%)" }}
                   animate={{ 
                     x: [80, 0, 0, 80, 80], 
                     y: [-50, 0, 0, -50, -50], 
                     rotate: [45, 0, 0, 45, 45],
                     opacity: [0, 1, 1, 0, 0] 
                   }}
                   transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", times: [0, 0.25, 0.8, 0.9, 1] }}
                 >
                   <span className="text-[7px] font-bold text-white uppercase tracking-wider pr-1 pt-1 opacity-90">Enrich</span>
                 </motion.div>

                 {/* Shape 3: Bottom Right */}
                 <motion.div
                   className="absolute inset-0 bg-[#8634DE] z-10 flex items-end justify-end p-2"
                   style={{ clipPath: "polygon(40% 60%, 100% 65%, 100% 100%, 30% 100%)" }}
                   animate={{ 
                     x: [60, 0, 0, 60, 60], 
                     y: [80, 0, 0, 80, 80], 
                     rotate: [90, 0, 0, 90, 90],
                     opacity: [0, 1, 1, 0, 0] 
                   }}
                   transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", times: [0, 0.25, 0.8, 0.9, 1] }}
                 >
                   <span className="text-[7px] font-bold text-white uppercase tracking-wider pr-1 pb-1 opacity-90">Classify</span>
                 </motion.div>

                 {/* Shape 4: Bottom Left */}
                 <motion.div
                   className="absolute inset-0 bg-violet-400 z-10 flex items-end justify-start p-2"
                   style={{ clipPath: "polygon(0% 45%, 40% 60%, 30% 100%, 0% 100%)" }}
                   animate={{ 
                     x: [-70, 0, 0, -70, -70], 
                     y: [70, 0, 0, 70, 70], 
                     rotate: [-90, 0, 0, -90, -90],
                     opacity: [0, 1, 1, 0, 0] 
                   }}
                   transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", times: [0, 0.25, 0.8, 0.9, 1] }}
                 >
                   <span className="text-[7px] font-bold text-white uppercase tracking-wider pl-1 pb-1 opacity-90">Link</span>
                 </motion.div>

                 {/* Final Unified Block: Structured Intelligence */}
                 <motion.div
                   className="absolute inset-0 bg-gradient-to-br from-[#8634DE] to-indigo-600 rounded-xl shadow-[0_10px_30px_-5px_rgba(134,52,222,0.6)] z-20 flex flex-col items-center justify-center border border-white/20"
                   animate={{ 
                     opacity: [0, 0, 1, 1, 0, 0],
                     scale: [0.95, 0.95, 1.05, 1.05, 0.95, 0.95]
                   }}
                   transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", times: [0, 0.25, 0.35, 0.75, 0.85, 1] }}
                 >
                   <Database className="w-5 h-5 text-white mb-1.5 opacity-90" strokeWidth={1.5} />
                   <span className="text-white text-[8px] font-bold tracking-widest uppercase text-center leading-tight">Structured<br/>Intelligence</span>
                 </motion.div>
                 
                 {/* Glowing Aura Behind the assembled block */}
                 <motion.div
                   className="absolute inset-0 bg-[#8634DE] rounded-xl blur-2xl z-0 pointer-events-none"
                   animate={{ opacity: [0, 0, 0.4, 0.4, 0, 0] }}
                   transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", times: [0, 0.25, 0.35, 0.75, 0.85, 1] }}
                 />
               </div>
            </div>
          </div>
          <div className="p-4 md:p-5 flex-grow">
            <div className="text-[#8634DE] text-[10px] font-normal tracking-[0.2em] mb-2 uppercase flex items-center gap-2">
              <span>02</span> <span className="text-[#8634DE]/60">/</span> <span>Understand</span>
            </div>
            <h3 className="text-[24px] font-space-grotesk font-normal text-slate-900 mb-1.5 tracking-tight">Transform data into financial context.</h3>
            <p className="text-slate-400 font-dm-sans font-light leading-relaxed text-[12px]">
              Normalize, enrich, classify, and link fragmented financial information into structured intelligence.            </p>
          </div>
        </div>

        {/* Card 3: Understand */}
        <div className="bg-white flex flex-col group">
          {/* Visual Area */}
          <div className="bg-indigo-50/50 min-h-[200px] md:min-h-[240px] lg:aspect-[21/9] relative overflow-hidden flex items-center justify-center p-4">
            <div className="relative w-full max-w-[200px] aspect-square flex items-center justify-center scale-90">
               <motion.div 
                  className="absolute w-16 h-16 bg-white rounded-2xl shadow-xl border border-slate-100 flex items-center justify-center z-10"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
               >
                 <BrainCircuit className="w-6 h-6 text-violet-500" strokeWidth={1.5} />
               </motion.div>
               <motion.div 
                  className="absolute w-28 h-28 border border-violet-200/50 rounded-full" 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-violet-400 rounded-full shadow-lg shadow-violet-400/50" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 bg-[#8634DE]/70 rounded-full shadow-lg shadow-[#8634DE]/50" />
               </motion.div>
               <motion.div 
                  className="absolute w-40 h-40 border border-violet-200/30 rounded-full"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
               >
                  <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-fuchsia-400 rounded-full shadow-lg shadow-fuchsia-400/50" />
               </motion.div>
            </div>
          </div>
          <div className="p-4 md:p-5 flex-grow">
            <div className="text-[#8634DE] text-[10px] font-normal tracking-[0.2em] mb-2 uppercase flex items-center gap-2">
              <span>03</span> <span className="text-[#8634DE]/60">/</span> <span>Learn</span>
            </div>
            <h3 className="text-[24px] font-space-grotesk font-normal text-slate-900 mb-1.5 tracking-tight">Intelligence that improves over time.</h3>
            <p className="text-slate-400 font-dm-sans font-light leading-relaxed text-[12px]">
              Every interaction strengthens customer, business, and financial understanding through adaptive behavioural intelligence.            </p>
          </div>
        </div>

        {/* Card 4: Execute */}
        <div className="bg-white flex flex-col group">
          {/* Visual Area */}
          <div className="bg-indigo-50/50 min-h-[300px] md:min-h-[240px] lg:aspect-[21/9] relative overflow-hidden flex items-center justify-center p-4">
            {/* The Report Card - Wrapped in a scaler to prevent overflow */}
            <div className="scale-[0.8] sm:scale-[0.85] md:scale-90 lg:scale-[0.85] origin-center w-full flex justify-center">
              <motion.div 
                className="w-full max-w-[280px] bg-white/40 backdrop-blur-md rounded-xl shadow-[0_16px_40px_rgb(0,0,0,0.03)] overflow-hidden flex flex-col font-sans"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {/* Header */}
                <div className="p-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-900/90 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-sm">
                    <BrainCircuit className="w-4 h-4 text-[#8634DE]" strokeWidth={2} />
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Zeyro Intelligence Engine
                  </div>
                </div>

                {/* Subheader */}
                <div className="bg-white/30 px-3 py-2 flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-700">Decision Ready</span>
                  <svg className="w-3.5 h-3.5 text-[#8634DE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>

                {/* Key-Value List */}
                <div className="p-3 flex flex-col gap-2.5">
                  <motion.div 
                    className="flex justify-between items-start gap-4" 
                    animate={{ opacity: [0, 1, 1, 0], y: [5, 0, 0, 0] }} 
                    transition={{ duration: 6, repeat: Infinity, times: [0, 0.1, 0.9, 1], ease: "easeOut" }}
                  >
                    <span className="text-[9.5px] text-slate-500 whitespace-nowrap">Financial Context</span>
                    <span className="text-[9.5px] text-slate-800 font-medium text-right">Consistent Income & Low Debt</span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex justify-between items-start gap-4" 
                    animate={{ opacity: [0, 0, 1, 1, 0], y: [5, 5, 0, 0, 0] }} 
                    transition={{ duration: 6, repeat: Infinity, times: [0, 0.15, 0.25, 0.9, 1], ease: "easeOut" }}
                  >
                    <span className="text-[9.5px] text-slate-500 whitespace-nowrap">Predictive Risk</span>
                    <span className="text-[9.5px] text-slate-800 font-medium text-right leading-[1.3]">High likelihood of repayment<br/>(Top 15% tier)</span>
                  </motion.div>

                  <motion.div 
                    className="flex justify-between items-start gap-4" 
                    animate={{ opacity: [0, 0, 1, 1, 0], y: [5, 5, 0, 0, 0] }} 
                    transition={{ duration: 6, repeat: Infinity, times: [0, 0.3, 0.4, 0.9, 1], ease: "easeOut" }}
                  >
                    <span className="text-[9.5px] text-slate-500 whitespace-nowrap leading-[1.3]">Confidence<br/>Score</span>
                    <span className="text-[9.5px] text-[#8634DE] font-bold text-right leading-[1.3]">94% (Very High)</span>
                  </motion.div>

                  <motion.div 
                    className="flex justify-between items-start gap-4" 
                    animate={{ opacity: [0, 0, 1, 1, 0], y: [5, 5, 0, 0, 0] }} 
                    transition={{ duration: 6, repeat: Infinity, times: [0, 0.45, 0.55, 0.9, 1], ease: "easeOut" }}
                  >
                    <span className="text-[9.5px] text-slate-500 whitespace-nowrap">Model Explanation</span>
                    <span className="text-[9.5px] text-slate-800 font-medium text-right leading-[1.3]">Strong behavioural indicators<br/>offset limited credit history.</span>
                  </motion.div>
                </div>

                {/* Footer section */}
                <div className="p-3 flex flex-col gap-3">
                  <motion.div 
                    className="flex justify-between items-center gap-4" 
                    animate={{ opacity: [0, 0, 1, 1, 0], y: [5, 5, 0, 0, 0] }} 
                    transition={{ duration: 6, repeat: Infinity, times: [0, 0.6, 0.7, 0.9, 1], ease: "easeOut" }}
                  >
                    <span className="text-[9.5px] text-slate-400">Decision Trigger</span>
                    <span className="text-[9.5px] font-bold text-emerald-600">Approved for Premium Tier</span>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-indigo-600 text-white text-[9px] font-medium py-2.5 px-3 rounded text-center leading-tight shadow-sm origin-center relative overflow-hidden flex items-center justify-center gap-1.5"
                    animate={{ opacity: [0, 0, 1, 1, 1, 0], scale: [1, 1, 1, 0.94, 1, 1] }} 
                    transition={{ duration: 6, repeat: Infinity, times: [0, 0.6, 0.65, 0.75, 0.85, 1], ease: "easeInOut" }}
                  >
                    Execute Automated Workflow
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      animate={{ 
                        opacity: [0, 0, 0, 1, 0, 0], 
                        x: [0, 0, 0, 0, 40, 40], 
                        y: [0, 0, 0, 0, -40, -40],
                        scale: [0.5, 0.5, 0.5, 1, 1, 1]
                      }}
                      transition={{ 
                        duration: 6, 
                        repeat: Infinity, 
                        times: [0, 0.65, 0.74, 0.75, 0.85, 1], 
                        ease: "easeOut" 
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-200">
                        <path d="m22 2-7 20-4-9-9-4Z"/>
                        <path d="M22 2 11 13"/>
                      </svg>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
          <div className="p-4 md:p-5 flex-grow">
            <div className="text-[#8634DE] text-[10px] font-normal tracking-[0.2em] mb-2 uppercase flex items-center gap-2">
              <span>04</span> <span className="text-[#8634DE]/60">/</span> <span>REASON</span>
            </div>
            <h3 className="text-[24px] font-space-grotesk font-normal text-slate-900 mb-1.5 tracking-tight">AI that understands financial decisions.</h3>
            <p className="text-slate-400 font-dm-sans font-light leading-relaxed text-[13px]">
              Combine behavioural signals, financial history, and predictive models to generate explainable, decision-ready intelligence.
            </p>
            </div>
        </div>

        {/* Card 5: Real-time Traversal (Full Width) */}
        <div className="bg-[#8634DE] md:col-span-2 flex flex-col md:flex-row relative overflow-hidden group">
          {/* Purple Gradient Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#a855f7_0%,_#8634DE_55%,_#581c87_100%)] pointer-events-none" />
          
          {/* Subtle noise/texture overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

          {/* Text Area (Left) */}
          <div className="p-8 md:p-14 md:w-[55%] flex flex-col justify-center relative z-10">
            <div className="text-white/90 text-[10px] font-normal tracking-[0.2em] mb-2 uppercase flex items-center gap-2">
              <span>05</span> <span className="text-white/50">/</span> <span>REAL-TIME INTELLIGENCE</span>
            </div>
            <h3 className="text-[24px] font-space-grotesk font-normal text-white mb-1.5 tracking-tight">
              Sub-second financial intelligence.<br />Every request.
            </h3>
            <p className="text-white/80 font-dm-sans font-light leading-relaxed text-[13px] max-w-[420px]">
              Every query is enriched with behavioural context, financial history, predictive signals, and real-time reasoning—delivering production-ready intelligence when it matters most.
            </p>
          </div>

          {/* Visual Area (Right - Phone) */}
          <div className="relative md:w-[45%] min-h-[340px] md:min-h-[420px] flex items-end justify-center md:justify-end md:pr-16 overflow-hidden pt-12 md:pt-16 pointer-events-none">
             
             {/* Glowing orb behind phone */}
             <div className="absolute top-1/2 right-20 w-64 h-64 bg-fuchsia-400/30 rounded-full blur-[80px]" />

             {/* Phone outline */}
             <motion.div 
               initial={{ y: 80, scale: 0.95, opacity: 0 }}
               whileInView={{ y: 0, scale: 1, opacity: 1 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ type: "spring", duration: 0.8, bounce: 0.2 }}
               className="relative w-[280px] h-[320px] md:w-[320px] md:h-[380px] rounded-t-[40px] border-[5px] border-b-0 border-[#f5f8ff] bg-gradient-to-b from-[#a855f7] to-[#7e22ce] flex flex-col shadow-2xl relative z-10 overflow-hidden"
             >
               {/* Inner bezel highlight */}
               <div className="absolute inset-0 rounded-t-[34px] border-[2px] border-b-0 border-white/20 pointer-events-none" />

               {/* Phone Status Bar */}
               <div className="flex justify-between items-center px-6 pt-3.5 pb-2 text-white relative z-20">
                 <span className="text-[11px] font-semibold tracking-wide font-sans">9:41</span>
                 {/* Dynamic Island */}
                 <div className="w-[85px] h-5 bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-3 shadow-[inset_0_-1px_3px_rgba(255,255,255,0.2)]">
                    <div className="w-[8px] h-[8px] bg-white/10 rounded-full absolute right-2 top-1.5" />
                 </div>
                 <div className="flex items-center gap-1.5 opacity-90">
                   <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                   <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14.5c0-2.8 2.2-5 5-5 .36 0 .71.04 1.05.11L23.64 7c-3.3-2.67-7.46-4-11.64-4-4.18 0-8.34 1.33-11.64 4L2.45 9.1c3.1-2.4 6.8-3.6 10.55-3.6 3.75 0 7.45 1.2 10.55 3.6l1.2-1.55c-3.47-2.73-7.77-4.15-12.05-4.15-4.28 0-8.58 1.42-12.05 4.15L0 9.53C3.6 6.7 8.1 5 12 5s8.4 1.7 12 4.53l-2.09 2.7c-.55-.15-1.12-.23-1.71-.23-3.9 0-7 3.1-7 7H15.5z"/></svg>
                 </div>
               </div>

               {/* Chat Interface */}
               <div className="flex-1 px-5 pt-6 flex flex-col gap-5 relative z-10">
                 
                 {/* Search Bar */}
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.2, type: "spring", stiffness: 100, damping: 20 }}
                   className="w-full flex items-center justify-between bg-white/10 backdrop-blur-md border border-white/20 rounded-full pl-4 pr-1.5 py-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                 >
                   <span className="text-[9px] text-white/90 font-medium">Analyze recent spend behaviour for User #8291</span>
                   <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white/10 shadow-sm shrink-0">
                     <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                   </div>
                 </motion.div>

                 {/* User Chat Bubble */}
                 <motion.div 
                   initial={{ opacity: 0, x: 15 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.4, type: "spring", stiffness: 100, damping: 20 }}
                   className="self-end flex items-end gap-2 max-w-[85%]"
                 >
                   <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl rounded-tr-sm px-4 py-3 text-[10px] text-white/95 leading-relaxed shadow-lg">
                     Analyze recent spend behaviour<br/>for User #8291
                   </div>
                   <div className="w-6 h-6 rounded-full bg-[#3b82f6] flex items-center justify-center shrink-0 border border-white/20 shadow-md">
                     <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                   </div>
                 </motion.div>

                 {/* Assistant Chat Bubble */}
                 <motion.div 
                   initial={{ opacity: 0, x: -15 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.6, type: "spring", stiffness: 100, damping: 20 }}
                   className="self-start flex items-end gap-2 max-w-[90%]"
                 >
                   <div className="w-6 h-6 rounded-full bg-[#1c69ff] flex items-center justify-center shrink-0 shadow-lg border border-white/20 relative z-10">
                     <span className="text-white font-bold text-[10px]">Z</span>
                   </div>
                   <div className="bg-[#002f99]/40 backdrop-blur-md border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 text-[10px] text-white/95 leading-[1.6] shadow-xl relative z-10 font-medium border-l-white/20 border-t-white/20">
                     User shows a 40% spike in late-<br/>night food delivery over 3 weeks.<br/>Recommend delaying credit limits.
                   </div>
                 </motion.div>
               </div>
               
             </motion.div>
          </div>
        </div>

      </div>
      {/* End layer-8 */}
      </div>
    </div>
  );
}
