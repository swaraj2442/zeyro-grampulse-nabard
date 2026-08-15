"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Square } from 'lucide-react';
import BFSGetStarted from '@/components/BFS/BFSGetStarted';

export default function ZeyroComparison() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="w-full h-full max-w-[100rem] mx-auto px-6 md:pl-[280px] lg:pl-[320px] lg:pr-12 font-sans flex flex-col justify-center pt-4 lg:pt-8 pb-6 lg:pb-12 pointer-events-auto">
      {/* Header Bar */}
      <div className="w-full flex justify-between items-center mb-12">
        <div className="flex items-center gap-2 text-xs font-normal tracking-widest uppercase text-gray-500" style={{ fontFamily: 'var(--font-dm-mono), monospace' }}>
          <span className="text-[#8634DE]">{'>'}</span> WHAT WE DO
        </div>
      </div>

      {/* Title block */}
      <div className="text-center mb-12 flex flex-col items-center">
        <h2 className="text-[36px] font-space-grotesk font-normal tracking-tight mb-6 leading-[1.15]">
          Bring your financial data. <span className="text-[#8634DE]">We build</span><span className="text-transparent bg-clip-text bg-[linear-gradient(90deg,#1c69ff_0%,#8bb2ff_25%,#b48cf8_50%,#d875ff_75%,#ff6685_100%)]" style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', paddingRight: '10px',fontSize:'36px' }}> intelligence.</span> <br />Your systems make better decisions.
        </h2>
        <p className="text-slate-500 text-[13px] font-dm-sans font-normal max-w-xl mt-1 leading-relaxed text-center">
          Build intelligent financial products without building the intelligence layer.</p>
      </div>

      <div className="flex flex-col md:flex-row items-stretch border border-slate-200 rounded-sm overflow-hidden bg-white/50 backdrop-blur-sm shadow-sm">
        {/* Left Side: The Zeyro API (B2B) */}
        <div className="group w-full md:w-1/2 bg-[#8634DE] p-5 md:p-6 text-white flex flex-col justify-between relative overflow-hidden cursor-pointer">
          {/* Dot grid pattern — fades in on hover */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.25) 1px, transparent 1px)',
              backgroundSize: '18px 18px',
            }}
          />
          {/* Subtle static vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_60%,_rgba(0,0,0,0.15)_100%)] pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 text-white/90 text-[9px] font-dm-mono font-normal tracking-[0.15em] uppercase mb-4">
              <div className="bg-white text-[#8634DE] px-1 py-0.5 rounded-sm text-[8px] font-black">{`{}`}</div>
              FOR DEVELOPERS & TEAMS
            </div>

            <h3 className="text-[30px] font-space-grotesk font-normal mb-2 tracking-tight">
              Zeyro Intelligence APIs
            </h3>

            <p className="text-white/90 text-[13px] font-dm-sans font-light mb-4 leading-relaxed max-w-sm" style={{ fontWeight: 300 }}>
              Unified APIs for financial understanding, behavioural intelligence and AI powered decisions.
            </p>

            {/* Stats Box */}
            <div className="border border-dashed border-white/30 rounded-sm p-3 mb-4">
              <div className="grid grid-cols-3 gap-0 text-center divide-x divide-white/20">
                <div className="px-1">
                  <div className="text-[20px] font-normal font-space-grotesk mb-0.5 tracking-tight">&lt;250ms</div>
                  <div className="text-[8px] text-white/70 font-normal font-dm-mono tracking-widest uppercase mt-0.5">API Response</div>
                </div>
                <div className="px-1">
                  <div className="text-[20px] font-normal font-space-grotesk mb-0.5 tracking-tight">10+</div>
                  <div className="text-[8px] text-white/70 font-normal font-dm-mono tracking-widest uppercase mt-0.5">Intelligence Models</div>
                </div>
                <div className="px-1">
                  <div className="text-[20px] font-normal font-space-grotesk mb-0.5 tracking-tight">Enterprise</div>
                  <div className="text-[8px] text-white/70 font-normal font-dm-mono tracking-widest uppercase mt-0.5">Scale Ready</div>
                </div>
              </div>
            </div>

            <div className="text-white/80 text-[10px] mb-4 font-medium">
              Enterprise SLA · SOC 2 Type II · TypeScript & Python SDKs
            </div>
          </div>

          <button 
            onClick={() => setModalOpen(true)} 
            className="relative z-10 w-full bg-white font-dm-sans text-[#8634DE] hover:bg-slate-50 transition-[transform,background-color] duration-200 ease-out active:scale-[0.97] text-xs font-normal py-2.5 px-4 rounded-sm flex items-center justify-center gap-2"
          >
            Get Started
            <svg className="w-3 h-3 transition-transform duration-200 ease-out group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

        {/* Right Side: Personal (B2C) */}
        <div className="group w-full md:w-1/2 p-5 md:p-6 bg-[#f5f8ff] flex flex-col justify-between relative overflow-hidden cursor-pointer">
          {/* Blue dot grid pattern — fades in on hover */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(134,52,222,0.12) 1px, transparent 1px)',
              backgroundSize: '18px 18px',
            }}
          />
          <div>
            <div className="flex items-center gap-2 text-slate-400 text-[9px] font-dm-mono font-normal tracking-[0.15em] uppercase mb-4 relative z-10">
              <div className="bg-[#8634DE] px-1 py-0.5 rounded-sm flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              FOR EVERYONE
            </div>

            <h3 className="text-[30px] font-space-grotesk font-normal text-slate-900 mb-2 tracking-tight relative z-10">
              Zeyro Personal Finance App
            </h3>

            <p className="text-slate-500 text-[13px] font-dm-sans font-light mb-4 leading-relaxed max-w-normal pr-4 relative z-10" style={{ fontWeight: 300 }}>
              One financial identity across everything you use. Powered by contextual reasoning, behavioural models, financial memory and explainable decision intelligence.
            </p>

            <div className="flex flex-col border-t border-b border-slate-200 py-1 mb-4 relative z-10">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
                  <X className="w-3 h-3 text-slate-700" strokeWidth={2.5} />
                  Zeyro App
                </div>
                <div className="text-slate-400 text-[10px] font-medium">Control panel</div>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
                  <Square className="w-3 h-3 text-slate-700 fill-slate-700" />
                  Claude · Cursor · OpenAI
                </div>
                <div className="text-slate-400 text-[10px] font-medium">AI plugins</div>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
                  <svg className="w-3 h-3 text-slate-700" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10zm-3-5a3 3 0 110-6 3 3 0 010 6z" /></svg>
                  Chrome Extension
                </div>
                <div className="text-slate-400 text-[10px] font-medium">One-click pay</div>
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-4 relative z-10">
              <span className="text-xl font-bold text-slate-900 tracking-tight">10,000+</span>
              <span className="text-slate-400 text-[10px] font-medium">power users</span>
            </div>
          </div>

          <a
            href="https://www.zeyro.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full relative z-10 inline-flex items-center justify-center gap-2 bg-[#8634DE] hover:bg-[#6826ae] transition-[transform,background-color] duration-200 ease-out active:scale-[0.97] text-white text-xs font-normal py-2.5 px-4 rounded-sm group font-dm-sans"
          >
            Get Personal Zeyro
            <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200 ease-out" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
      
      <BFSGetStarted isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
