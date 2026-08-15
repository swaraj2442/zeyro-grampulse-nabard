"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Server, Cloud, Laptop, ShieldCheck } from 'lucide-react';

const NoiseOverlay = () => (
  <div 
    className="absolute inset-0 z-0 pointer-events-none mix-blend-multiply opacity-[0.55]"
    style={{ 
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
    }}
  />
);

export default function ZeyroEnterprise() {
  return (
    <div className="w-full max-w-[100rem] mx-auto px-6 md:pl-[280px] lg:pl-[320px] lg:pr-12 pt-4 pb-16 pointer-events-auto bg-transparent flex flex-col items-start">
      {/* Header Bar */}
      <div className="w-full flex justify-between items-center mb-12">
        <div className="flex items-center gap-2 text-xs font-normal tracking-widest uppercase text-gray-500" style={{ fontFamily: 'var(--font-dm-mono), monospace' }}>
          <span className="text-[#8634DE]">{'>'}</span> ENTERPRISE
        </div>
      </div>

      {/* Title Section */}
      <div className="w-full text-center mb-16 flex flex-col items-center">
        <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            viewport={{ once: true, margin: "-50px" }}
            className="text-[30px] font-space-grotesk font-normal tracking-tight text-slate-900 mb-6 leading-[1.1]"
        >
          Zeyro Intelligence works<br /> <span className="text-[#8634DE]">wherever your business operates.</span>
        </motion.h2>
        <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
            viewport={{ once: true, margin: "-50px" }}
            className="text-slate-500 text-[13px] font-dm-sans font-normal max-w-2xl leading-relaxed text-center"
        >
          Deploy securely across your cloud, private infrastructure, or hybrid environments with enterprise-grade security, governance, and complete control over your financial intelligence stack.
        </motion.p>
      </div>

      {/* Grid Section */}
      <div className="w-full max-w-6xl border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm flex flex-col">
        
        {/* Top Row: 3 Cols */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          
          {/* Card 1: On Premises */}
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
             viewport={{ once: true, margin: "-50px" }}
             className="group relative p-6 md:p-8 flex flex-col overflow-hidden bg-white hover:bg-slate-50/50 transition-colors"
          >
            {/* Gradient & Noise */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(134,52,222,0.3)_0%,_transparent_70%)] opacity-80 group-hover:opacity-100 transition-opacity duration-700 z-0"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-[#8634DE]/15 via-transparent to-transparent z-0"></div>
            <NoiseOverlay />
            
            <div className="relative z-10 flex flex-col justify-between h-[130px] mb-6">
              <div>
                <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-[#8634DE] border border-[#8634DE]/20 bg-[#8634DE]/10 px-3 py-1.5 rounded-sm">
                  <span>01</span> <span className="text-[#8634DE]/60">/</span> <span>MANAGED CLOUD</span>
                </div>
              </div>
              <div className="relative w-14 h-14 flex items-center justify-center">
                 <div className="absolute inset-0 bg-[#8634DE]/90 blur-xl opacity-20 rounded-full"></div>
                 <Server className="w-10 h-10 text-[#8634DE] relative z-10" fill="currentColor" strokeWidth={1} />
              </div>
            </div>
            
            <div className="relative z-10 flex-1 flex flex-col justify-start">
              <h3 className="text-xl font-space-grotesk font-normal text-slate-900 mb-2 tracking-tight">Fully managed by Zeyro.</h3>
              <p className="text-slate-500 font-dm-sans font-normal text-[13px] leading-relaxed">
                Deploy instantly on our secure cloud infrastructure with automatic scaling, monitoring, upgrades, and high availability. Managed infrastructure. Enterprise reliability. Zero operational overhead.
              </p>
            </div>
          </motion.div>

          {/* Card 2: Your Cloud */}
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
             viewport={{ once: true, margin: "-50px" }}
             className="group relative p-6 md:p-8 flex flex-col overflow-hidden bg-white hover:bg-slate-50/50 transition-colors"
          >
            {/* Gradient & Noise */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(134,52,222,0.25)_0%,_transparent_70%)] opacity-80 group-hover:opacity-100 transition-opacity duration-700 z-0"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#8634DE]/15 via-transparent to-transparent z-0"></div>
            <NoiseOverlay />
            
            <div className="relative z-10 flex flex-col justify-between h-[130px] mb-6">
              <div>
                <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-[#8634DE] border border-[#8634DE]/20 bg-[#8634DE]/10 px-3 py-1.5 rounded-sm">
                  <span>02</span> <span className="text-[#8634DE]/60">/</span> <span>YOUR CLOUD</span>
                </div>
              </div>
              <div className="relative w-14 h-14 flex items-center justify-center">
                 <div className="absolute inset-0 bg-[#8634DE]/90 blur-xl opacity-20 rounded-full"></div>
                 <Cloud className="w-12 h-12 text-[#8634DE] relative z-10" fill="currentColor" strokeWidth={1} />
              </div>
            </div>
            
            <div className="relative z-10 flex-1 flex flex-col justify-start">
              <h3 className="text-xl font-space-grotesk font-normal text-slate-900 mb-2 tracking-tight">Deploy in your own cloud.</h3>
              <p className="text-slate-500 font-dm-sans font-normal text-[13px] leading-relaxed">
                Run Zeyro inside your AWS, Azure, or Google Cloud environment while maintaining complete ownership of your infrastructure, networking, and compliance. Your cloud. Your policies. Your data.
              </p>
            </div>
          </motion.div>

          {/* Card 3: Local */}
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
             viewport={{ once: true, margin: "-50px" }}
             className="group relative p-6 md:p-8 flex flex-col overflow-hidden bg-white hover:bg-slate-50/50 transition-colors"
          >
            {/* Gradient & Noise */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(134,52,222,0.3)_0%,_transparent_70%)] opacity-80 group-hover:opacity-100 transition-opacity duration-700 z-0"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-[#8634DE]/15 via-transparent to-transparent z-0"></div>
            <NoiseOverlay />
            
            <div className="relative z-10 flex flex-col justify-between h-[130px] mb-6">
              <div>
                <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-[#8634DE] border border-[#8634DE]/20 bg-[#8634DE]/10 px-3 py-1.5 rounded-sm">
                  <span>03</span> <span className="text-[#8634DE]/60">/</span> <span>PRIVATE DEPLOYMENT</span>
                </div>
              </div>
              <div className="relative w-14 h-14 flex items-center justify-center">
                 <div className="absolute inset-0 bg-[#8634DE]/90 blur-xl opacity-20 rounded-full"></div>
                 <Laptop className="w-10 h-10 text-[#8634DE] relative z-10" fill="currentColor" strokeWidth={1} />
              </div>
            </div>
            
            <div className="relative z-10 flex-1 flex flex-col justify-start">
              <h3 className="text-xl font-space-grotesk font-normal text-slate-900 mb-2 tracking-tight">Deploy on your infrastructure.</h3>
              <p className="text-slate-500 font-dm-sans font-normal text-[13px] leading-relaxed">
                For regulated industries requiring maximum control, deploy within your private cloud or on-premises environment while keeping sensitive financial data inside your security perimeter. Built for banks, insurers, enterprises, and regulated institutions.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Bottom Row: 2 Cols */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 border-t border-slate-200">
          
          {/* Card 4: SOC 2 & Card 5: GDPR (Commented out)
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
             viewport={{ once: true, margin: "-50px" }}
             className="group p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-white"
          >
            <div className="w-20 h-20 sm:w-28 sm:h-28 shrink-0 border border-slate-100 rounded-lg flex flex-col items-center justify-center bg-slate-50/50 shadow-[inset_0_0_20px_rgba(0,0,0,0.02)] relative group-hover:shadow-[inset_0_0_20px_rgba(134,52,222,0.05)] transition-shadow">
               <ShieldCheck className="w-8 h-8 text-[#8634DE] mb-1" strokeWidth={1.5} />
               <div className="text-[10px] font-bold tracking-widest text-[#8634DE]">SOC2</div>
               <div className="w-8 h-[1px] bg-[#8634DE] my-0.5"></div>
               <div className="text-[7px] uppercase tracking-widest text-[#8634DE]">Compliant</div>
               <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-slate-200"></div>
               <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-slate-200"></div>
               <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-slate-200"></div>
               <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-slate-200"></div>
            </div>
            <div>
              <h3 className="text-2xl font-space-grotesk font-normal text-slate-900 mb-3 tracking-tight">SOC 2 Certified</h3>
              <p className="text-slate-500 font-dm-sans font-normal text-[13px] leading-relaxed">
                Independent audit confirming that we safeguard your data with the highest security standards.
              </p>
            </div>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
             viewport={{ once: true, margin: "-50px" }}
             className="group p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-white"
          >
            <div className="w-20 h-20 sm:w-28 sm:h-28 shrink-0 rounded-full flex flex-col items-center justify-center bg-slate-50/50 shadow-[inset_0_0_20px_rgba(0,0,0,0.02)] relative border border-dashed border-slate-200 group-hover:shadow-[inset_0_0_20px_rgba(134,52,222,0.05)] group-hover:border-[#8634DE]/30 transition-all">
               <div className="absolute inset-0 flex items-center justify-center animate-[spin_30s_linear_infinite]">
                 {[...Array(12)].map((_, i) => (
                   <div 
                     key={i} 
                     className="absolute w-2 h-2 text-[#8634DE]"
                     style={{
                       transform: `rotate(${i * 30}deg) translateY(-24px) sm:translateY(-32px)`
                     }}
                   >
                     <svg viewBox="0 0 24 24" fill="currentColor" className="w-2 h-2 sm:w-3 sm:h-3 -mt-2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                   </div>
                 ))}
               </div>
               <div className="text-sm sm:text-base font-bold tracking-widest text-[#8634DE] relative z-10">GDPR</div>
            </div>
            <div>
              <h3 className="text-2xl font-space-grotesk font-normal text-slate-900 mb-3 tracking-tight">GDPR Compliant</h3>
              <p className="text-slate-500 font-dm-sans font-normal text-[13px] leading-relaxed">
                Compliant with EU data protection, ensuring your personal information is handled with care and transparency.
              </p>
            </div>
          </motion.div>
          */}
          
        </div>
      </div>
    </div>
  );
}
