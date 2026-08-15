"use client";

import React from 'react';
import { File, Columns, LayoutList, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DocCapabilities() {
  return (
    <section className="bg-white font-sans">
      <div className="max-w-[1300px] mx-auto px-6 lg:px-0">
        
        {/* Header Section */}
        <div className="pt-20 pb-14 text-center max-w-3xl mx-auto">
          <div className="font-mono text-[14px] uppercase tracking-wider text-[#5c5c5c] mb-6">
            [ CORE CAPABILITIES ]
          </div>
          <h2 className="text-[40px] md:text-[48px] xl:text-[48px] leading-[1.05] font-medium tracking-tight text-[#111] mb-8">
            Three capabilities.<br/>One document layer.
          </h2>
          <p className="text-[17px] text-gray-500 leading-relaxed max-w-2xl mx-auto">
            Parse, extract, and split. Use them standalone or chain them end-to-end. The same API runs a quick prototype and a production pipeline at scale.
          </p>
        </div>

        {/* Visual Panels Grid */}
        <div className="border border-gray-200 bg-white grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Panel: Scanning & Parsing */}
          <div className="border-r border-gray-200 p-8 md:p-12 relative overflow-hidden h-auto min-h-[300px] md:h-[450px] flex flex-col justify-start md:justify-center items-center bg-white">
            
            {/* Wrapper to scale down the entire composition */}
            <div className="relative w-full max-w-[430px] mx-auto flex flex-col items-center transform scale-[0.75] sm:scale-[0.8] lg:scale-[0.85] xl:scale-[0.9] origin-top md:origin-center">
              
              {/* Faded background placeholder UI - Left */}
              <div className="absolute top-[-17px] -left-[285px] w-[260px] opacity-[1] pointer-events-none hidden md:block transform scale-[0.8] origin-right">
                 {/* Top Tab */}
                 <div className="w-30 h-8 border border-gray-300 bg-white mb-2 flex items-center justify-center ml-3">
                    <div className="w-25 h-4 bg-[linear-gradient(90deg,#d1d5db,30%,#ffffff,70%,#d1d5db)] bg-[length:200%_100%] animate-shimmer"></div>
                 </div>
                 
                 {/* Main Box */}
                 <div className="w-full border border-gray-300 bg-white flex flex-col pt-6 pb-4 px-2 gap-1">
                    {/* Chart Box */}
                    <div className="w-full h-[70px] border border-gray-300 relative">
                       <svg className="w-full h-full text-gray-300 absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <path d="M0,85 L15,85 L25,45 L35,45 L40,75 L45,75 L50,45 L65,45 L75,20 L85,20 L90,45 L100,45" fill="none" stroke="currentColor" strokeWidth="1" shapeRendering="crispEdges" vectorEffect="non-scaling-stroke" strokeLinejoin="miter" />
                       </svg>
                    </div>
                    
                    {/* Bottom Skeleton Bar */}
                    <div className="w-28 h-2.5 bg-[linear-gradient(90deg,#d1d5db,30%,#ffffff,70%,#d1d5db)] bg-[length:200%_100%] animate-shimmer ml-1"></div>
                 </div>
              </div>

              {/* Faded background placeholder UI - Right */}
              <div className="absolute top-[-20px] -right-[230px] w-[200px] opacity-[1] pointer-events-none hidden md:block transform scale-[0.8] origin-left">
                 {/* Top Header Box */}
                 <div className="w-full bg-white border border-gray-300 p-1.5 flex gap-2 items-center mb-1.5">
                    <div className="w-3.5 h-3.5 bg-[linear-gradient(90deg,#d1d5db,30%,#fafafa,70%,#d1d5db)] bg-[length:200%_100%] animate-shimmer"></div>
                    <div className="flex-1 h-2.5 bg-[linear-gradient(90deg,#d1d5db,30%,#fafafa,70%,#d1d5db)] bg-[length:200%_100%] animate-shimmer"></div>
                 </div>
                 
                 {/* Main Content Box */}
                 <div className="w-full bg-white border border-gray-300 p-2 flex flex-col gap-2">
                    {/* Short Title Bar */}
                    <div className="w-20 h-2 bg-[linear-gradient(90deg,#d1d5db,30%,#fafafa,70%,#d1d5db)] bg-[length:200%_100%] mb-0 animate-shimmer"></div>
                    
                    {/* Grid: 4 rows, 2 columns */}
                    <div className="flex flex-col gap-1">
                       <div className="flex gap-1 h-[25px]">
                          <div className="flex-[1] border border-gray-300"></div>
                          <div className="flex-1 border border-gray-300"></div>
                       </div>
                       <div className="flex gap-1 h-[25px]">
                          <div className="flex-[1] border border-gray-300"></div>
                          <div className="flex-1 border border-gray-300"></div>
                       </div>
                       <div className="flex gap-1 h-[25px]">
                          <div className="flex-[1] border border-gray-300"></div>
                          <div className="flex-1 border border-gray-300"></div>
                       </div>
                       <div className="flex gap-1 h-[25px]">
                          <div className="flex-[1] border border-gray-300"></div>
                          <div className="flex-1 border border-gray-300"></div>
                       </div>
                    </div>
                    
                    {/* Bottom Text Bars */}
                    <div className="flex flex-col gap-1 mt-1">
                       <div className="flex justify-between gap-2">
                          <div className="flex-1 h-2 bg-[linear-gradient(90deg,#d1d5db,30%,#fafafa,70%,#d1d5db)] bg-[length:200%_100%] animate-shimmer"></div>
                          <div className="w-6 h-2 bg-[linear-gradient(90deg,#d1d5db,30%,#fafafa,70%,#d1d5db)] bg-[length:200%_100%] animate-shimmer"></div>
                       </div>
                       <div className="w-20 h-2 bg-[linear-gradient(90deg,#d1d5db,30%,#fafafa,70%,#d1d5db)] bg-[length:200%_100%] animate-shimmer"></div>
                    </div>
                 </div>
              </div>

              {/* Center Main UI */}
              <div className="relative z-10 w-full flex flex-col items-center">
                
                <div className="w-full flex justify-start">
                  {/* File Tab */}
                  <div className="flex items-center gap-2 font-mono text-[11.5px] text-gray-800 bg-[#f5f5f5] py-2 px-3 w-max mb-3">
                    <File className="w-[14px] h-[14px] text-gray-600" strokeWidth={1.5} />
                    financial_report_q4.pdf
                  </div>
                </div>
                
                {/* Orange Box */}
                <div className="border-[1px] border-[#fc8106] w-full bg-white p-2.5 md:p-3 relative [clip-path:inset(-10px_-4px_0px_-4px)]">
                  <h4 className="font-mono text-[13px] font-medium tracking-wide mb-1.5 text-[#191919] px-0.5 relative z-10">REVENUE TREND</h4>
                  
                  <div className="flex gap-4 w-full h-[100px] mb-1.5 relative">
                    {/* Scanner Beam restricted to this container */}
                    <div className="absolute -left-[14px] md:-left-[16px] -right-[14px] md:-right-[16px] h-[100px] pointer-events-none animate-[scan_3s_ease-in-out_infinite] z-20 flex flex-col">
                       <div className="w-full h-[1.5px] bg-[#f09440]"></div>
                       <div className="w-full flex-1 bg-gradient-to-b from-[#ffefe0] to-transparent px-[4px] bg-clip-content"></div>
                    </div>

                    {/* Left Table */}
                    <div className="flex-[0.9] flex flex-col font-mono text-[10.5px] text-[#555] border border-[#ebebeb] bg-white">
                      <div className="flex flex-1 border-b border-gray-200">
                        <span className="flex-1 border-r border-gray-200 flex items-center px-2">Q1</span>
                        <span className="flex-[1.2] flex items-center justify-end px-2 font-medium text-gray-700">$1.2M</span>
                      </div>
                      <div className="flex flex-1 border-b border-gray-200">
                        <span className="flex-1 border-r border-gray-200 flex items-center px-2">Q2</span>
                        <span className="flex-[1.2] flex items-center justify-end px-2 font-medium text-gray-700">$1.35M</span>
                      </div>
                      <div className="flex flex-1 border-b border-gray-200">
                        <span className="flex-1 border-r border-gray-200 flex items-center px-2">Q3</span>
                        <span className="flex-[1.2] flex items-center justify-end px-2 font-medium text-gray-700">$1.4M</span>
                      </div>
                      <div className="flex flex-1">
                        <span className="flex-1 border-r border-gray-200 flex items-center px-2">Q4</span>
                        <span className="flex-[1.2] flex items-center justify-end px-2 font-medium text-gray-700">$1.67M</span>
                      </div>
                    </div>
                    
                    {/* Right Chart */}
                    <div className="flex-[1.1] relative overflow-hidden border border-[#ebebeb] bg-white">
                      <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                         <path d="M0,75 L10,75 L15,45 L30,45 L35,75 L40,75 L45,50 L60,50 L70,20 L80,20 L90,45 L100,45 L100,100 L0,100 Z" fill="#ffebdd" fillOpacity="1" />
                         <path d="M0,75 L10,75 L15,45 L30,45 L35,75 L40,75 L45,50 L60,50 L70,20 L80,20 L90,45 L100,45" fill="none" stroke="#fea25a" strokeWidth="1.2" />
                      </svg>
                    </div>
                  </div>

                  <p className="text-[12px] text-[#333] font-mono leading-relaxed px-0.5">
                    The quarterly report highlights consistent growth across all divisions...
                  </p>
                </div>
                
                {/* Connecting Line */}
                <div className="w-[1px] h-[20px] border-l-[1.2px] border-dashed border-[#fc8106]"></div>
                
                {/* Scanning Banner */}
                <div className="border-[1px] border-[#fc8106] bg-white h-[38px] w-full flex justify-between items-center px-3">
                  {/* Left Equalizer */}
                  <div className="flex items-center gap-1">
                    <div className="w-[3px] h-2.5 bg-gray-200 animate-equalizer [animation-delay:-0.2s]"></div>
                    <div className="w-[3px] h-3.5 bg-gray-200 animate-equalizer [animation-delay:-0.8s]"></div>
                    <div className="w-[3px] h-4 bg-gray-200 animate-equalizer [animation-delay:-0.5s]"></div>
                    <div className="w-[3px] h-3.5 bg-[#fc8106] animate-equalizer [animation-delay:-1.1s]"></div>
                    <div className="w-[3px] h-4 bg-[#fc8106] animate-equalizer [animation-delay:-0.1s]"></div>
                    <div className="w-[3px] h-4 bg-[#f9a67a] animate-equalizer [animation-delay:-0.7s]"></div>
                  </div>
                  
                  {/* Text */}
                  <div className="text-[#a44200] font-mono text-[12px] font-medium tracking-[0.2em] flex items-center mt-[1px]">
                    SCANNING & PARSING<span className="inline-block w-[24px] tracking-[0.1em] text-left animate-dots ml-1"></span>
                  </div>
                  
                  {/* Right Equalizer */}
                  <div className="flex items-center gap-1">
                    <div className="w-[3px] h-3.5 bg-gray-200 animate-equalizer [animation-delay:-0.6s]"></div>
                    <div className="w-[3px] h-4 bg-gray-200 animate-equalizer [animation-delay:-0.3s]"></div>
                    <div className="w-[3px] h-3 bg-[#fc8106] animate-equalizer [animation-delay:-0.9s]"></div>
                    <div className="w-[3px] h-4 bg-[#fc8106] animate-equalizer [animation-delay:-0.4s]"></div>
                    <div className="w-[3px] h-3.5 bg-[#f9a67a] animate-equalizer [animation-delay:-1.0s]"></div>
                    <div className="w-[3px] h-2.5 bg-[#f9a67a] animate-equalizer [animation-delay:-0.2s]"></div>
                  </div>
                </div>
                
                {/* Detected Details */}
                <div className="bg-[#f5f5f5] w-full text-center py-2 text-[13px] font-mono text-[#555] mt-0">
                  Detected: 4 tables · 2 figures · 847 text tokens
                </div>

              </div>
            </div>
          </div>

          {/* Right Panel: Extracting */}
          <div className="p-8 md:p-12 relative overflow-hidden h-auto min-h-[300px] md:h-[450px] flex flex-col justify-start md:justify-center items-center">
            
            {/* Wrapper to scale down the entire composition */}
            <div className="relative w-full max-w-[620px] mx-auto flex flex-col transform scale-[0.7] sm:scale-[0.75] lg:scale-[0.85] xl:scale-[0.9] origin-top md:origin-center">
              
              {/* Top Banner */}
              <div className="w-full flex items-center justify-between bg-[#f4f4f4] px-3 py-1.5 mb-3">
                <div className="flex items-center gap-2 font-mono text-[11px] font-medium text-[#111] tracking-wide">
                  <Columns className="w-3.5 h-3.5 text-gray-500" /> EXTRACTING...
                </div>
                <div className="flex">
                  <div className="w-2.5 h-[2.5px] bg-[#fc8106]"></div>
                  <div className="w-4 h-[2.5px] bg-gray-300"></div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex items-start justify-between w-full relative">
                
                {/* Connecting Lines Overlay (Independent of rows) */}
                <div className="absolute top-0 bottom-0 left-[220px] hidden md:flex flex-col justify-center gap-[24px] z-0 pointer-events-none">
                   <div className="w-[150px] h-[1px] bg-[#fc8106] relative">
                      <motion.div 
                        className="w-2.5 h-2.5 bg-[#fc8106] absolute top-1/2 -translate-y-1/2"
                        animate={{ left: ["0px", "150px"] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: 0 }}
                      />
                   </div>
                   <div className="w-[150px] h-[1px] bg-[#fc8106] relative">
                      <motion.div 
                        className="w-2.5 h-2.5 bg-[#fc8106] absolute top-1/2 -translate-y-1/2"
                        animate={{ left: ["0px", "150px"] }}
                        transition={{ duration: 2.8, repeat: Infinity, ease: "linear", delay: 0.4 }}
                      />
                   </div>
                   <div className="w-[150px] h-[1px] bg-[#fc8106] relative">
                      <motion.div 
                        className="w-2.5 h-2.5 bg-[#fc8106] absolute top-1/2 -translate-y-1/2"
                        animate={{ left: ["0px", "150px"] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "linear", delay: 0.1 }}
                      />
                   </div>
                   <div className="w-[150px] h-[1px] bg-[#fc8106] relative">
                      <motion.div 
                        className="w-2.5 h-2.5 bg-[#fc8106] absolute top-1/2 -translate-y-1/2"
                        animate={{ left: ["0px", "150px"] }}
                        transition={{ duration: 2.6, repeat: Infinity, ease: "linear", delay: 0.7 }}
                      />
                   </div>
                   <div className="w-[150px] h-[1px] bg-[#fc8106] relative">
                      <motion.div 
                        className="w-2.5 h-2.5 bg-[#fc8106] absolute top-1/2 -translate-y-1/2"
                        animate={{ left: ["0px", "150px"] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: "linear", delay: 0.3 }}
                      />
                   </div>
                </div>
                
                {/* Left Box: RAW INPUT */}
                <div 
                  className="w-[220px] min-h-[300px] flex flex-col border-[1.5px] border-[#fdc38a] p-2 relative shadow-sm z-10"
                  style={{
                    backgroundColor: '#fff8f2',
                    backgroundImage: 'linear-gradient(to right, #ffe2cd 1px, transparent 1px), linear-gradient(to bottom, #ffe2cd 1px, transparent 1px)',
                    backgroundSize: '12px 12px'
                  }}
                >
                  {/* Inner brackets */}
                  <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-[2px] border-l-[2px] border-[#fc8106]"></div>
                  <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-[2px] border-r-[2px] border-[#fc8106]"></div>
                  <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-[2px] border-l-[2px] border-[#fc8106]"></div>
                  <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-[2px] border-r-[2px] border-[#fc8106]"></div>
                  
                  {/* Inner White Card */}
                  <div className="bg-white border border-gray-300 relative z-10 w-full h-full min-h-[280px] flex flex-col">
                     {/* Header */}
                     <div className="bg-[#f2f2f2] py-1.5 px-2 flex justify-between items-center">
                       <span className="w-1.5 h-1.5 bg-gray-400/60"></span>
                       <span className="font-mono text-[11px] text-[#555] tracking-widest">[ RAW INPUT ]</span>
                       <span className="w-1.5 h-1.5 bg-gray-400/60"></span>
                     </div>
                     
                     {/* Content Rows */}
                     <div className="font-mono text-[13px] text-[#111] p-2 flex-1 flex flex-col gap-1">
                       <div className="flex justify-between relative">
                         <span>Vendor:</span>
                         <span className="relative">
                           Apex Industries
                         </span>
                       </div>
                       <div className="flex justify-between relative h-[20px] items-center">
                         <span>Date:</span>
                         <span className="relative">
                           02.14
                         </span>
                       </div>
                       <div className="flex justify-between relative h-[20px] items-center">
                         <span>Amount:</span>
                         <span className="relative">
                           $4,200
                         </span>
                       </div>
                       
                       {/* Divider acting as row 4 to match 'currency' */}
                       <div className="flex items-center h-[20px] w-full">
                         <div className="w-full h-[1px] bg-gray-300"></div>
                       </div>
                       
                       <div className="flex justify-between relative h-[20px] items-center">
                         <span>Invoice #:</span>
                         <span className="relative">
                           INV-0042
                         </span>
                       </div>
                       <div className="flex justify-between relative h-[20px] items-center">
                         <span>NET 30</span>
                         <span className="relative">
                           <span className="opacity-0">.</span>
                         </span>
                       </div>
                       
                       {/* Invisible spacer to match row 7 ('confidence') on the right */}
                       <div className="h-[20px]"></div>
                     </div>
                  </div>
                </div>

                {/* Right Box: EXTRACTED OUTPUT */}
                <div className="w-[220px] min-h-[300px] bg-white border border-gray-300 relative z-10 hidden md:flex flex-col">
                  
                  {/* Header */}
                  <div className="bg-[#f2f2f2] py-1.5 px-2 flex justify-between items-center">
                    <span className="w-1.5 h-1.5 bg-gray-400/60"></span>
                    <span className="font-mono text-[11px] text-[#555] tracking-widest">[ EXTRACTED OUTPUT ]</span>
                    <span className="w-1.5 h-1.5 bg-gray-400/60"></span>
                  </div>
                  
                  {/* Content Rows */}
                  <div className="font-mono text-[11px] text-[#111] p-2 flex-1 flex flex-col gap-[10px]">
                    <div>"vendor": "Apex Industries",</div>
                    <div>"date": "2024-02-14",</div>
                    <div>"amount": 4200,</div>
                    <div>"currency": "USD"</div>
                    <div>"invoice_id": "INV-0042"</div>
                    <div>"payment_terms": "NET_30",</div>
                    <div>"confidence": 0.98</div>
                  </div>
                </div>
                
              </div>
            </div>
          </div>

        </div>        
               
        {/* ----- PARSE & EXTRACT BAND ----- */}
        <div className="w-full bg-[#f9f9f9] border-x border-b border-gray-200 grid grid-cols-1 md:grid-cols-2">
            
            {/* Parse — left aligned in left half */}
            <div className="border-r border-gray-200 px-8 md:px-12 py-12 md:py-12">
              <h3 className="text-2xl font-space-grotesk font-medium tracking-tight mb-4">Parse</h3>
              <p className="text-[15px] text-gray-600 leading-relaxed max-w-md">
                Convert PDFs, scans, and images into LLM-ready Markdown. Vision models read text, tables, figures, and hierarchy in a single pass, preserving structure that OCR loses.
              </p>
            </div>
            
            {/* Extract — left aligned in right half */}
            <div className="px-8 md:px-12 py-12 md:py-12">
              <h3 className="text-2xl font-space-grotesk font-medium tracking-tight mb-4">Extract</h3>
              <p className="text-[15px] text-gray-600 leading-relaxed max-w-md">
                Pull the fields you need into JSON. One schema, every layout, with domain-awareness that knows a freight charge isn't a line item.
              </p>
            </div>

        </div>

        {/* ----- DOC SPLIT CONTENT ----- */}
        <div className="w-full border border-gray-200 flex flex-col md:flex-row">

          {/* LEFT: Split text pinned to bottom-left */}
          <div className="flex-1 px-8 md:px-12 flex flex-col justify-end pb-16 pt-14">
            <h3 className="text-2xl font-space-grotesk font-medium tracking-tight mb-3">Split</h3>
            <p className="text-[15px] text-gray-600 leading-relaxed max-w-sm">
              Break multi-document files into individual docs and long ones into retrievable chunks. Parent-child indexing keeps clauses with their preambles.
            </p>
          </div>

          {/* RIGHT: Graphic left-aligned in right half */}
          <div className="flex-1 flex justify-center md:justify-start pt-[90px] pb-14 overflow-hidden ml-0 md:-ml-54">
            <div className="relative flex items-center gap-24 scale-[0.55] sm:scale-[0.8] md:scale-105 origin-center md:origin-left">

              {/* Input Document */}
              <div className="w-[220px] flex flex-col gap-2 relative text-[10px] font-mono flex-shrink-0 z-10">
                <div className="border border-[#ff4d99]/85 bg-[#ff4d99]/20 px-2 py-1 text-gray-700 font-medium">
                  mixed_documents.pdf
                </div>
                <div className="bg-white border border-[#faa5cf] px-3 py-4 flex flex-col gap-4 relative overflow-hidden">
                  
                  {/* Scanner Box Effect */}
                  <motion.div 
                    className="absolute left-0 right-0 h-[90px] bg-gradient-to-b from-[#ff4d99]/20 to-[#ff4d99]/1 border-b-[1.5px] border-[#ff4d99]/17 pointer-events-none z-0"
                    animate={{ top: ["calc(0% - 42px)", "calc(100% - 42px)"] }}
                    transition={{ duration: 3.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                  />

                  {/* Row 1 */}
                  <div className="flex justify-between items-center text-gray-500 font-medium">
                    <div className="flex items-center gap-3">
                      <span>p.01</span>
                      <div className="flex flex-col gap-[2px]">
                        <div className="flex gap-4"><div className="h-[3px] w-[50px] bg-gray-300"/><div className="h-[3px] w-[20px] bg-gray-300"/></div>
                        <div className="flex gap-4"><div className="h-[3px] w-[40px] bg-gray-300"/><div className="h-[3px] w-[20px] bg-gray-300"/></div>
                        <div className="flex gap-4"><div className="h-[3px] w-[30px] bg-gray-300"/><div className="h-[3px] w-[20px] bg-gray-300"/></div>
                        <div className="flex gap-4"><div className="h-[4px] w-[90px] bg-gray-400"/></div>
                      </div>
                    </div>
                    <span className="border-[0.5px] border-[#ff91b9] text-gray-700 px-1.5 py-[1.5px] bg-[#ff4d99]/10 font-mono text-[8px] leading-none">INVOICE</span>
                  </div>
                  <div className="border-b border-dotted border-[#ff4d99]/30" />

                  {/* Row 2 */}
                  <div className="flex justify-between items-center text-gray-500 font-medium">
                    <div className="flex items-center gap-3">
                      <span>p.02</span>
                      <div className="flex flex-col gap-[2px]">
                        <div className="flex gap-4"><div className="h-[3px] w-[90px] bg-gray-300"/></div>
                        <div className="flex gap-4"><div className="h-[3px] w-[85px] bg-gray-300"/></div>
                        <div className="flex gap-4"><div className="h-[3px] w-[90px] bg-gray-300"/></div>
                        <div className="flex gap-4"><div className="h-[3px] w-[75px] bg-gray-300"/></div>
                        <div className="flex gap-4"><div className="h-[4px] w-[90px] bg-gray-300"/></div>
                      </div>
                    </div>
                    <span className="border-[0.5px]  border-[#ff91b9] text-gray-700 px-1.5 py-[1.5px] bg-[#ff4d99]/10 font-mono text-[8px] leading-none">CONTRACT</span>
                  </div>
                  <div className="border-b border-dotted border-[#ff4d99]/30" />

                  {/* Row 3 */}
                  <div className="flex justify-between items-center text-gray-500 font-medium">
                    <div className="flex items-center gap-3">
                      <span>p.03</span>
                      <div className="flex flex-col gap-[2px]">
                        <div className="flex gap-4"><div className="h-[3px] w-[60px] bg-gray-300"/><div className="h-[3px] w-[15px] bg-gray-300"/></div>
                        <div className="flex gap-4"><div className="h-[3px] w-[45px] bg-gray-300"/><div className="h-[3px] w-[15px] bg-gray-300"/></div>
                        <div className="flex gap-4"><div className="h-[3px] w-[50px] bg-gray-300"/><div className="h-[3px] w-[15px] bg-gray-300"/></div>
                        <div className="flex gap-4"><div className="h-[4px] w-[90px] bg-gray-400"/></div>
                      </div>
                    </div>
                    <span className="border-[0.5px] border-[#ff91b9] text-gray-700 px-1.5 py-[1.5px] bg-[#ff4d99]/10 font-mono text-[8px] leading-none">INVOICE</span>
                  </div>
                  <div className="border-b border-dotted border-[#ff4d99]/30" />

                  {/* Row 4 */}
                  <div className="flex justify-between items-center text-gray-500 font-medium">
                    <div className="flex items-center gap-8">
                      <span>p.04</span>
                      <div className="flex flex-col gap-[2px]">
                        <div className="flex gap-4"><div className="h-[3px] w-[40px] bg-gray-300"/></div>
                        <div className="flex gap-4"><div className="h-[3px] w-[30px] bg-gray-300"/></div>
                        <div className="flex gap-4"><div className="h-[3px] w-[50px] bg-gray-300"/></div>
                        <div className="flex gap-4"><div className="h-[4px] w-[30px] bg-gray-400"/></div>
                      </div>
                    </div>
                    <span className="border-[0.5px]  border-[#ff91b9] text-gray-700 px-1.5 py-[1.5px] bg-[#ff4d99]/10 font-mono text-[8px] leading-none">RECEIPT</span>
                  </div>
                  <div className="border-b border-dotted border-[#ff4d99]/30" />

                  {/* Row 5 */}
                  <div className="flex justify-between items-center text-gray-500 font-medium">
                    <div className="flex items-center gap-3">
                      <span>p.05</span>
                      <div className="flex flex-col gap-[2px]">
                        <div className="flex gap-4"><div className="h-[3px] w-[90px] bg-gray-300"/></div>
                        <div className="flex gap-4"><div className="h-[3px] w-[80px] bg-gray-300"/></div>
                        <div className="flex gap-4"><div className="h-[3px] w-[85px] bg-gray-300"/></div>
                        <div className="flex gap-4"><div className="h-[3px] w-[60px] bg-gray-300"/></div>
                        <div className="flex gap-4"><div className="h-[4px] w-[90px] bg-gray-300"/></div>
                      </div>
                    </div>
                    <span className="border-[0.5px]  border-[#ff91b9] text-gray-700 px-1.5 py-[1.5px] bg-[#ff4d99]/10 font-mono text-[8px] leading-none">CONTRACT</span>
                  </div>
                  <div className="border-b border-dotted border-[#ff4d99]/30" />

                  {/* Row 6 */}
                  <div className="flex justify-between items-center text-gray-500 font-medium">
                    <div className="flex items-center gap-6">
                      <span>p.06</span>
                      <div className="flex flex-col gap-[2px]">
                        <div className="flex gap-4"><div className="h-[3px] w-[55px] bg-gray-300"/></div>
                        <div className="flex gap-4"><div className="h-[3px] w-[45px] bg-gray-300"/></div>
                        <div className="flex gap-4"><div className="h-[3px] w-[35px] bg-gray-300"/></div>
                        <div className="flex gap-4"><div className="h-[4px] w-[40px] bg-gray-400"/></div>
                      </div>
                    </div>
                    <span className="border-[0.5px] border-[#ff91b9] text-gray-700 px-1.5 py-[1.5px] bg-[#ff4d99]/10 font-mono text-[8px] leading-none">RECEIPT</span>
                  </div>
                </div>
              </div>

              {/* Connecting Lines SVG — positioned absolutely over the gap */}
              <div className="absolute inset-0 pointer-events-none z-20">
                <svg className="w-full h-full" style={{ overflow: 'visible' }}>
                  {/* INVOICE rows → INVOICES */}
                  <motion.path d="M 206 60 C 266 58, 256 84, 306 84" fill="none" stroke="#ff4d99" strokeWidth="1.2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1, transition: { duration: 1.2, ease: "easeInOut", delay: 0.5 } }} viewport={{ once: false, amount: 0.2 }} transition={{ duration: 0.15 }} />
                  <motion.path d="M 206 168 C 266 168, 256 84, 306 84" fill="none" stroke="#ff4d99" strokeWidth="1.2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1, transition: { duration: 1.2, ease: "easeInOut", delay: 0.7 } }} viewport={{ once: false, amount: 0.2 }} transition={{ duration: 0.15 }} />                 
                  {/* CONTRACT rows → CONTRACTS */}                  
                  <motion.path d="M 206 113 C 266 113, 256 191, 306 191" fill="none" stroke="#ff4d99" strokeWidth="1.2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1, transition: { duration: 1.2, ease: "easeInOut", delay: 0.9 } }} viewport={{ once: false, amount: 0.2 }} transition={{ duration: 0.15 }} />
                  <motion.path d="M 206 274 C 266 274, 256 191, 306 191" fill="none" stroke="#ff4d99" strokeWidth="1.2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1, transition: { duration: 1.2, ease: "easeInOut", delay: 1.1 } }} viewport={{ once: false, amount: 0.2 }} transition={{ duration: 0.15 }} />     
                  {/* RECEIPT rows → RECEIPTS */}                 
                  <motion.path d="M 206 221 C 286 223, 246 297, 306 297" fill="none" stroke="#ff4d99" strokeWidth="1.2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1, transition: { duration: 1.2, ease: "easeInOut", delay: 1.3 } }} viewport={{ once: false, amount: 0.2 }} transition={{ duration: 0.15 }} />
                  <motion.path d="M 206 329 C 266 329, 266 297, 306 297" fill="none" stroke="#ff4d99" strokeWidth="1.2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1, transition: { duration: 1.2, ease: "easeInOut", delay: 1.5 } }} viewport={{ once: false, amount: 0.2 }} transition={{ duration: 0.15 }} />
                  {/* Right dots */}
                  <motion.circle cx="306" cy="84" r="2.5" fill="#ff4d99" initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: 1, opacity: 1, transition: { duration: 0.3, delay: 1.7 } }} viewport={{ once: false, amount: 0.2 }} transition={{ duration: 0.15 }} />
                  <motion.circle cx="306" cy="191" r="2.5" fill="#ff4d99" initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: 1, opacity: 1, transition: { duration: 0.3, delay: 1.7 } }} viewport={{ once: false, amount: 0.2 }} transition={{ duration: 0.15 }} />
                  <motion.circle cx="306" cy="297" r="2.5" fill="#ff4d99" initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: 1, opacity: 1, transition: { duration: 0.3, delay: 1.7 } }} viewport={{ once: false, amount: 0.2 }} transition={{ duration: 0.15 }} />
                </svg>
              </div>

              {/* Output Categories */}
              <div className="w-[245px] flex flex-col gap-[40px] relative z-10 text-[9px] font-mono flex-shrink-0 top-[10px]">
                {/* Invoices */}
                <motion.div 
                  className="flex flex-col gap-1.5 shadow-sm"
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0, transition: { duration: 0.8, delay: 2.0, ease: "easeOut" } }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="border border-[#ff4d99]/85 bg-[#ff4d99]/20 px-2 py-1 flex justify-between text-gray-700 font-medium">
                    <span>[ INVOICES ]</span> <span>2 files</span>
                  </div>
                  <div className="bg-white border border-[#faa5cf] p-1 flex flex-col gap-0.1">
                    <div className="flex items-center gap-1 text-gray-700 font-medium">
                      <div className="w-3.5 h-1.5 border-l border-b border-[#ff4d99] mb-0.5 ml-0.5 flex-shrink-0" />
                      <FileText className="w-3 h-3 text-gray-700 flex-shrink-0" />
                      <span>invoice_q3_001.pdf</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-700 font-medium">
                      <div className="w-3.5 h-1.5 border-l border-b border-[#ff4d99] mb-0.5 ml-0.5 flex-shrink-0" />
                      <FileText className="w-3 h-3 text-gray-700 flex-shrink-0" />
                      <span>invoice_q3_002.pdf</span>
                    </div>
                  </div>
                </motion.div>

                {/* Contracts */}
                <motion.div 
                  className="flex flex-col gap-1.5 shadow-sm"
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0, transition: { duration: 0.8, delay: 2.3, ease: "easeOut" } }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="border border-[#ff4d99]/85 bg-[#ff4d99]/20 px-2 py-1 flex justify-between text-gray-700 font-medium">
                    <span>[ CONTRACTS ]</span> <span>2 files</span>
                  </div>
                  <div className="bg-white border border-[#faa5cf] p-1 flex flex-col gap-0.1">
                    <div className="flex items-center gap-1 text-gray-700 font-medium">
                      <div className="w-3.5 h-1.5 border-l border-b border-[#ff4d99] mb-0.5 ml-0.5 flex-shrink-0" />
                      <FileText className="w-3 h-3 text-gray-700 flex-shrink-0" />
                      <span>contract_q3_001.pdf</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-700 font-medium">
                      <div className="w-3.5 h-1.5 border-l border-b border-[#ff4d99] mb-0.5 ml-0.5 flex-shrink-0" />
                      <FileText className="w-3 h-3 text-gray-700 flex-shrink-0" />
                      <span>contract_q3_002.pdf</span>
                    </div>
                  </div>
                </motion.div>

                {/* Receipts */}
                <motion.div 
                  className="flex flex-col gap-1.5 shadow-sm"
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0, transition: { duration: 0.8, delay: 2.5, ease: "easeOut" } }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="border border-[#ff4d99]/85 bg-[#ff4d99]/20 px-2 py-1 flex justify-between text-gray-700 font-medium">
                    <span>[ RECEIPTS ]</span> <span>2 files</span>
                  </div>
                  <div className="bg-white border border-[#faa5cf] p-1 flex flex-col gap-0.1">
                    <div className="flex items-center gap-1 text-gray-700 font-medium">
                      <div className="w-3.5 h-1.5 border-l border-b border-[#ff4d99] mb-0.5 ml-0.5 flex-shrink-0" />
                      <FileText className="w-3 h-3 text-gray-700 flex-shrink-0" />
                      <span>receipt_q3_001.pdf</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-700 font-medium">
                      <div className="w-3.5 h-1.5 border-l border-b border-[#ff4d99] mb-0.5 ml-0.5 flex-shrink-0" />
                      <FileText className="w-3 h-3 text-gray-700 flex-shrink-0" />
                      <span>receipt_q3_002.pdf</span>
                    </div>
                  </div>
                </motion.div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
