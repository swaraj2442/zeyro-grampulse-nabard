"use client";

import React from 'react';
import { Layers, Clock, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DocProblem() {
  return (
    <section className="bg-white text-[#191919] font-sans pt-5 pb-0">
      <div className="max-w-[1300px] mx-auto px-6 lg:px-0">
        
        {/* Main Box */}
        <div className="border-x border-b border-gray-200 relative z-[40]">
          
          {/* Top Header */} 
          <div className="p-8 md:p-12 border-b border-gray-200 bg-[#f8f8f8]">
            <div className="font-mono text-[14px] uppercase tracking-widest text-[#5c5c5c] mb-8">
              [ PROBLEM STATEMENT ]
            </div>
            <h2 className="text-[40px] md:text-[48px] xl:text-[48px] leading-[1.05] font-medium tracking-tight text-[#111] max-w-4xl">
              Enterprises run on documents, not databases.
            </h2>
          </div>

          {/* Grid Container */}
          <div className="grid grid-cols-1 md:grid-cols-[6.4fr_4.5fr_4.6fr_4.3fr]">
            
            <div className="hidden md:flex border-r border-gray-200 relative items-center justify-center min-h-[380px] overflow-hidden">
            {/* 8-card 3D fan — perspective+rotateY, left-to-right reveal */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
              }}
            >
              {/* Outer bounding box matching the scaled width for perfect flex centering */}
              <div style={{ width: '338px', height: '100px', position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    top: '-100px',
                    left: '50%',
                    width: '965px',
                    height: '280px',
                    marginLeft: '-538.5px',
                    transform: 'scale(0.4) rotateX(-1deg) rotateY(45deg)',
                    transformOrigin: 'center center',
                  }}
                >

                {/* Card 1 — far left, landscape — APPEARS FIRST */}
                <motion.div
                  initial={{ opacity: 0 }} 
                  whileInView={{ opacity: 1, transition: { duration: 0.25, delay: 0.1 } }}
                  viewport={{ once: false, margin: '-50px' }}
                  transition={{ duration: 0.1 }}
                  style={{ position: 'absolute', left: '0px', top: '30px', width: '390px', height: '300px', transform: 'scaleX(0.75)  skewY(-14deg)', zIndex: 10 }}
                  className="bg-white border-[1px] border-gray-600 flex flex-col p-6 gap-[4px]"
                >
                  <div className="h-[5px] w-1/3 bg-gray-300 mb-2"></div>
                  <div className="h-[3px] w-full bg-gray-200"></div>
                  <div className="h-[3px] w-full bg-gray-200"></div>
                  <div className="h-[3px] w-11/12 bg-gray-200"></div>
                  <div className="h-[3px] w-full bg-gray-200"></div>
                  <div className="h-[3px] w-4/5 bg-gray-200"></div>
                  <div className="h-[3px] w-full bg-gray-200"></div>
                  <div className="h-[3px] w-3/4 bg-gray-200 mb-2"></div>

                  <div className="h-[3px] w-full bg-gray-200"></div>
                  <div className="h-[3px] w-full bg-gray-200"></div>
                  <div className="h-[3px] w-5/6 bg-gray-200"></div>
                  <div className="h-[3px] w-full bg-gray-200"></div>
                  <div className="h-[3px] w-11/12 bg-gray-200"></div>
                  <div className="h-[3px] w-4/5 bg-gray-200 mb-2"></div>

                  <div className="h-[3px] w-full bg-gray-200"></div>
                  <div className="h-[3px] w-11/12 bg-gray-200"></div>
                  <div className="h-[3px] w-full bg-gray-200"></div>
                  <div className="h-[3px] w-5/6 bg-gray-200"></div>
                  <div className="h-[3px] w-full bg-gray-200"></div>
                  <div className="h-[3px] w-3/4 bg-gray-200 mb-2"></div>

                  <div className="h-[3px] w-full bg-gray-200"></div>
                  <div className="h-[3px] w-full bg-gray-200"></div>
                  <div className="h-[3px] w-4/5 bg-gray-200"></div>
                  <div className="h-[3px] w-full bg-gray-200"></div>
                  <div className="h-[3px] w-11/12 bg-gray-200 mb-2"></div>

                  <div className="h-[3px] w-full bg-gray-200"></div>
                  <div className="h-[3px] w-5/6 bg-gray-200"></div>
                  <div className="h-[3px] w-3/4 bg-gray-200"></div>

                  <div className="mt-auto flex justify-between items-end">
                     <div className="flex flex-col gap-1 w-1/4">
                       <div className="h-[4px] w-full bg-gray-300"></div>
                       <div className="h-[2px] w-2/3 bg-gray-200"></div>
                     </div>
                     <div className="flex flex-col gap-1 w-1/4">
                       <div className="h-[4px] w-full bg-gray-300"></div>
                       <div className="h-[2px] w-3/4 bg-gray-200"></div>
                     </div>
                  </div>
                </motion.div>

                {/* Card 2 — portrait with chart */}
                <motion.div
                  initial={{ opacity: 0 }} 
                  whileInView={{ opacity: 1, transition: { duration: 0.25, delay: 0.3 } }}
                  viewport={{ once: false, margin: '-50px' }}
                  transition={{ duration: 0.1 }}
                  style={{ position: 'absolute', left: '110px', top: '107px', width: '390px', height: '160px', transform: 'scaleX(0.75)   skewY(-14deg)', zIndex: 20 }}
                  className="bg-white border-[1px] border-gray-600 flex flex-col p-6 gap-[4px]"
                >
                  <div className="h-[5px] w-2/3 bg-gray-300 mb-1"></div>
                  <div className="h-[3px] w-full bg-gray-200"></div>
                  <div className="h-[3px] w-full bg-gray-200"></div>
                  <div className="h-[3px] w-5/6 bg-gray-200"></div>
                  <div className="h-[3px] w-full bg-gray-200 mt-1"></div>
                  <div className="h-[3px] w-4/5 bg-gray-200"></div>
                  <div className="mt-2 flex-1 bg-gray-200 overflow-hidden flex items-end">
                    <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="w-full h-[65%]" style={{opacity:0.45}}>
                      <path d="M0,60 L0,35 L20,45 L40,20 L60,30 L80,10 L100,22 L100,60 Z" fill="#9ca3af"/>
                    </svg>
                  </div>
                </motion.div>

                {/* Card 3 — small portrait */}
                <motion.div
                  initial={{ opacity: 0 }} 
                  whileInView={{ opacity: 1, transition: { duration: 0.25, delay: 0.5 } }}
                  viewport={{ once: false, margin: '-50px' }}
                  transition={{ duration: 0.1 }}
                  style={{ position: 'absolute', left: '265px', top: '107px', width: '390px', height: '200px', transform: 'scaleX(0.75)   skewY(-14deg)', zIndex: 30 }}
                  className="bg-white border-[1px] border-gray-600 flex flex-col p-6 gap-[4px]"
                >
                  <div className="h-[5px] w-1/2 bg-gray-300 mb-1"></div>
                  <div className="h-[3px] w-full bg-gray-200"></div>
                  <div className="h-[3px] w-5/6 bg-gray-200"></div>
                  <div className="h-[24px] w-full bg-gray-300 mt-1"></div>
                  <div className="h-[3px] w-full bg-gray-200 mt-1"></div>
                  <div className="h-[3px] w-4/5 bg-gray-200"></div>
                  <div className="h-[3px] w-full bg-gray-200 mt-1"></div>
                  <div className="h-[3px] w-3/4 bg-gray-200"></div>
                  <div className="h-[3px] w-full bg-gray-200 mt-1"></div>
                  <div className="h-[3px] w-5/6 bg-gray-200"></div>
                  <div className="mt-auto h-[3px] w-1/3 bg-gray-300"></div>
                </motion.div>

                {/* Card 4 — portrait standard with block */}
                <motion.div
                  initial={{ opacity: 0 }} 
                  whileInView={{ opacity: 1, transition: { duration: 0.25, delay: 0.7 } }}
                  viewport={{ once: false, margin: '-50px' }}
                  transition={{ duration: 0.1 }}
                  style={{ position: 'absolute', left: '377px', top: '30px', width: '390px', height: '300px', transform: 'scaleX(0.75)   skewY(-14deg)', zIndex: 40 }}
                  className="bg-white border-[1px] border-gray-600 flex flex-col p-6 gap-[4px]"
                >
                  <div className="h-[5px] w-1/2 bg-gray-300 mb-1"></div>
                  <div className="h-[3px] w-full bg-gray-200"></div>
                  <div className="h-[3px] w-full bg-gray-200"></div>
                  <div className="h-[3px] w-5/6 bg-gray-200"></div>
                  <div className="h-[48px] w-full bg-gray-300 mt-1 mb-1"></div>
                  <div className="h-[3px] w-full bg-gray-200"></div>
                  <div className="h-[3px] w-4/5 bg-gray-200 mt-1"></div>
                  <div className="h-[3px] w-full bg-gray-200"></div>
                  <div className="h-[3px] w-3/4 bg-gray-200 mt-1"></div>
                  <div className="h-[3px] w-full bg-gray-200"></div>
                  <div className="h-[3px] w-5/6 bg-gray-200 mt-1"></div>
                  <div className="mt-auto h-[3px] w-2/5 bg-gray-300"></div>
                </motion.div>

                {/* Card 5 — CENTER PINK, tallest, frontmost */}
                <motion.div
                  initial={{ opacity: 0 }} 
                  whileInView={{ opacity: 1, transition: { duration: 0.25, delay: 0.9 } }}
                  viewport={{ once: false, margin: '-50px' }}
                  transition={{ duration: 0.1 }}
                  style={{ position: 'absolute', left: '512px', top: '30px', width: '390px', height: '300px', transform: 'scaleX(0.75)   skewY(-14deg) rotateX(25deg)', zIndex: 60 }}
                  className="bg-white border-[1px] border-gray-600 flex flex-col p-6 gap-[4px]"
                >
                  <div className="h-[5px] w-3/4 bg-[#f9c0d6] mb-1"></div>
                  <div className="h-[85px] w-full bg-[#f9c0d6] mb-2"></div>
                  <div className="h-[3px] w-full bg-[#f9c0d6]"></div>
                  <div className="h-[3px] w-full bg-[#f9c0d6]"></div>
                  <div className="h-[3px] w-5/6 bg-[#f9c0d6]"></div>
                  <div className="h-[3px] w-full bg-[#f9c0d6] mt-0.5"></div>
                  <div className="h-[3px] w-4/5 bg-[#f9c0d6]"></div>
                  <div className="h-[3px] w-full bg-[#f9c0d6]"></div>
                  <div className="h-[3px] w-3/4 bg-[#f9c0d6] mt-0.5"></div>
                  <div className="h-[3px] w-full bg-[#f9c0d6]"></div>
                  <div className="h-[3px] w-full bg-[#f9c0d6] mt-0.5"></div>
                  <div className="h-[3px] w-5/6 bg-[#f9c0d6]"></div>
                  <div className="h-[3px] w-full bg-[#f9c0d6] mt-0.5"></div>
                  <div className="h-[3px] w-4/5 bg-[#f9c0d6]"></div>
                  <div className="h-[3px] w-3/4 bg-[#f9c0d6] mt-1"></div>
                  <div className="h-[3px] w-1/2 bg-[#f9c0d6]"></div>
                  <div className="mt-auto h-[4px] w-1/3 bg-[#f9c0d6]"></div>
                </motion.div>

                {/* Card 6 — portrait standard with image block */}
                <motion.div
                  initial={{ opacity: 0 }} 
                  whileInView={{ opacity: 1, transition: { duration: 0.25, delay: 1.1 } }}
                  viewport={{ once: false, margin: '-50px' }}
                  transition={{ duration: 0.1 }}
                  style={{ position: 'absolute', left: '683px', top: '110px', width: '390px', height: '160px', transform: 'scaleX(0.75)   skewY(-14deg)', zIndex: 80, }}
                  className="bg-white border-[1px] border-gray-600 flex flex-col p-6 gap-[4px]"
                >
                  <div className="h-[5px] w-1/2 bg-gray-300 mb-1"></div>
                  <div className="h-[5px] w-1/2 bg-gray-300 mb-1"></div>
                  {/* Clearly Visible 3-Row Table */}
                  <div className="w-full border-[2px] border-gray-400 my-1 flex flex-col">
                    <div className="flex border-b-[2px] border-gray-400 p-1.5 gap-2 bg-gray-100">
                      <div className="h-[4px] w-1/3 bg-gray-400"></div>
                      <div className="h-[4px] w-1/3 bg-gray-400"></div>
                      <div className="h-[4px] w-1/3 bg-gray-400"></div>
                    </div>
                    <div className="flex border-b-[2px] border-gray-400 p-1.5 gap-2">
                      <div className="h-[3px] w-1/3 bg-gray-300"></div>
                      <div className="h-[3px] w-2/3 bg-gray-300"></div>
                      <div className="h-[3px] w-1/2 bg-gray-300"></div>
                    </div>
                    <div className="flex p-1.5 gap-2">
                      <div className="h-[3px] w-1/3 bg-gray-300"></div>
                      <div className="h-[3px] w-1/2 bg-gray-300"></div>
                      <div className="h-[3px] w-2/3 bg-gray-300"></div>
                    </div>
                  </div>
                  <div className="h-[15px] w-1/2 bg-gray-300 mb-1"></div>
                </motion.div>

                {/* Card 7 — landscape (wide/short) */}
                <motion.div
                  initial={{ opacity: 0 }} 
                  whileInView={{ opacity: 1, transition: { duration: 0.25, delay: 1.3 } }}
                  viewport={{ once: false, margin: '-50px' }}
                  transition={{ duration: 0.1 }}
                  style={{ position: 'absolute', left: '802px', top: '30px', width: '390px', height: '300px', transform: 'scaleX(0.75)   skewY(-14deg)', zIndex: 100 }}
                  className="bg-white border-[1px] border-gray-600 flex flex-col p-6 gap-[4px]"
                >
                  <div className="h-[5px] w-1/3 bg-gray-300 mb-3"></div>
                  
                  <div className="grid grid-cols-2 gap-4 flex-1">
                     {/* Left Column */}
                     <div className="flex flex-col gap-[4px]">
                       <div className="h-[32px] w-full bg-gray-200 mb-2"></div>
                       <div className="h-[3px] w-full bg-gray-200"></div>
                       <div className="h-[3px] w-full bg-gray-200"></div>
                       <div className="h-[3px] w-5/6 bg-gray-200"></div>
                       <div className="h-[3px] w-full bg-gray-200 mt-2"></div>
                       <div className="h-[3px] w-4/5 bg-gray-200"></div>
                       <div className="h-[3px] w-full bg-gray-200 mt-2"></div>
                       <div className="h-[3px] w-11/12 bg-gray-200"></div>
                       <div className="h-[3px] w-3/4 bg-gray-200"></div>
                       <div className="h-[3px] w-full bg-gray-200 mt-2"></div>
                       <div className="h-[3px] w-full bg-gray-200"></div>
                       <div className="h-[3px] w-5/6 bg-gray-200 mb-2"></div>
                       <div className="h-[3px] w-full bg-gray-200"></div>
                       <div className="h-[3px] w-11/12 bg-gray-200"></div>
                       <div className="h-[3px] w-full bg-gray-200"></div>
                       <div className="h-[3px] w-3/4 bg-gray-200"></div>
                       <div className="h-[3px] w-full bg-gray-200 mt-2"></div>
                       <div className="h-[3px] w-5/6 bg-gray-200"></div>
                       <div className="h-[3px] w-full bg-gray-200"></div>
                       <div className="h-[3px] w-4/5 bg-gray-200 mb-2"></div>
                       <div className="h-[3px] w-full bg-gray-200"></div>
                       <div className="h-[3px] w-full bg-gray-200"></div>
                     </div>

                     {/* Right Column */}
                     <div className="flex flex-col gap-[4px]">
                       <div className="h-[3px] w-full bg-gray-200"></div>
                       <div className="h-[3px] w-full bg-gray-200"></div>
                       <div className="h-[3px] w-4/5 bg-gray-200"></div>
                       <div className="h-[3px] w-full bg-gray-200 mt-2"></div>
                       <div className="h-[3px] w-full bg-gray-200"></div>
                       <div className="h-[3px] w-5/6 bg-gray-200"></div>
                       <div className="h-[3px] w-full bg-gray-200 mt-2"></div>
                       <div className="h-[3px] w-11/12 bg-gray-200"></div>
                       <div className="h-[3px] w-full bg-gray-200"></div>
                       <div className="h-[32px] w-full bg-gray-200 mt-2 mb-2"></div>
                       <div className="h-[3px] w-full bg-gray-200"></div>
                       <div className="h-[3px] w-3/4 bg-gray-200 mb-2"></div>
                       <div className="h-[3px] w-full bg-gray-200"></div>
                       <div className="h-[3px] w-11/12 bg-gray-200"></div>
                       <div className="h-[3px] w-full bg-gray-200"></div>
                       <div className="h-[3px] w-4/5 bg-gray-200"></div>
                       <div className="h-[3px] w-full bg-gray-200 mt-2"></div>
                       <div className="h-[3px] w-5/6 bg-gray-200"></div>
                       <div className="h-[3px] w-full bg-gray-200"></div>
                       <div className="h-[3px] w-11/12 bg-gray-200 mb-2"></div>
                     </div>
                  </div>
                  
                  <div className="mt-auto flex justify-between items-end">
                    <div className="h-[3px] w-1/4 bg-gray-300"></div>
                    <div className="h-[3px] w-1/6 bg-gray-200"></div>
                  </div>
                </motion.div>

                {/* Card 8 — far right portrait */}
                <motion.div
                  initial={{ opacity: 0 }} 
                  whileInView={{ opacity: 1, transition: { duration: 0.25, delay: 1.5 } }}
                  viewport={{ once: false, margin: '-50px' }}
                  transition={{ duration: 0.1 }}
                  style={{ position: 'absolute', left: '958px', top: '70px', width: '390px', height: '190px', transform: 'scaleX(0.75)   skewY(-14deg)', zIndex: 120 }}
                  className="bg-white border-[1px] border-gray-600 flex flex-col p-6 gap-[4px]"
                >
                  <div className="h-[5px] w-2/3 bg-gray-300 mb-1"></div>
                  <div className="h-[3px] w-full bg-gray-200"></div>
                  <div className="h-[3px] w-5/6 bg-gray-200"></div>
                  
                  <div className="grid grid-cols-2 gap-4 my-1 flex-1">
                     <div className="bg-gray-200 w-full h-full"></div>
                     <div className="bg-gray-200 w-full h-full"></div>
                  </div>

                  <div className="h-[3px] w-full bg-gray-200 mt-1"></div>
                  <div className="h-[3px] w-4/5 bg-gray-200"></div>
                  <div className="h-[3px] w-full bg-gray-200 mt-1"></div>
                  <div className="h-[3px] w-3/4 bg-gray-200"></div>
                  
                  <div className="mt-auto h-[3px] w-1/3 bg-gray-300"></div>
                </motion.div>

              </div>
            </div>
          </div>
        </div>

          {/* Stat 1 */}
          <div className="border-b md:border-b-0 md:border-r border-gray-200 p-4 flex flex-col min-h-[380px]">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 border border-gray-200 flex items-center justify-center rounded-sm">
                <Layers className="w-5 h-5 text-gray-700" />
              </div>
              <div className="font-mono text-[11px] text-gray-500">[1]</div>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-[48px] lg:text-[48px] font-space-grotesk font-medium tracking-tight leading-none text-[#111]">80%</div>
            </div>
            <div className="mt-auto">
              <p className="text-[13.5px] lg:text-[14px] text-gray-500 leading-relaxed">
                of enterprise data is unstructured. Most of it sits in PDFs, scans, and spreadsheets your LLMs can't read.
              </p>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="border-b md:border-b-0 md:border-r border-gray-200 p-4 flex flex-col min-h-[380px]">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 border border-gray-200 flex items-center justify-center rounded-sm">
                <Clock className="w-5 h-5 text-gray-700" />
              </div>
              <div className="font-mono text-[11px] text-gray-500">[2]</div>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-[48px] lg:text-[48px] font-space-grotesk font-medium tracking-tight leading-none text-[#111]">6+ months</div>
            </div>
            <div className="mt-auto">
              <p className="text-[13.5px] lg:text-[14px] text-gray-500 leading-relaxed">
                AI teams spend stitching parsers, OCR, and post-processing. Pipelines break the moment a layout changes.
              </p>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="p-4 flex flex-col min-h-[380px]">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 border border-gray-200 flex items-center justify-center rounded-sm">
                <Rocket className="w-5 h-5 text-gray-700" />
              </div>
              <div className="font-mono text-[11px] text-gray-500">[3]</div>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-[48px] lg:text-[48px] font-space-grotesk font-medium tracking-tight leading-none text-[#111]">&lt;10%</div>
            </div>
            <div className="mt-auto">
              <p className="text-[13.5px] lg:text-[14px] text-gray-500 leading-relaxed">
                of in-house document pipelines reach production. The rest stall in the pilot.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Row */}
        <div className="border-t border-gray-200 p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-[#f8f8f8]">
          <p className="text-[14px] lg:text-[14.5px] text-gray-500 leading-relaxed max-w-[950px]">
            LLMs exploded the use cases for unstructured data. Agents underwrite claims, copilots draft credit memos, RAG retrieves across thousand-page filings. Generic OCR and DIY pipelines are too static. You need a more dynamic interface, so we rebuilt the stack with vision models that read documents the way humans do.
          </p>
          <button className="flex-shrink-0 flex items-center gap-2 border border-gray-600 bg-white hover:bg-gray-50 px-6 py-3 rounded-sm text-[15px] font-medium transition-colors">
            Learn more <span>→</span>
          </button>
        </div>

        </div>

      </div>
    </section>
  );
}
