"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

import creditUImg from '@/assests/images/creditu.webp';
import docaImg from '@/assests/images/doca.webp';
import tenrichImg from '@/assests/images/tenrich.webp';
import agenticCatImg from '@/assests/images/agenticcat.webp';
import cashflowImg from '@/assests/images/Cashflow.webp';
import behaviouralImg from '@/assests/images/Behavioural.webp';

const CATALOG_ITEMS = [
  {
    id: '01',
    title: 'Underwriting',
    short: 'Underwriting',
    description: 'Immutable ledger and advanced cash flow underwriting.',
    image: creditUImg,
    bgColor: 'bg-[#8634DE]'
  },
  {
    id: '02',
    title: 'Transaction Enrichment',
    short: 'Enrichment',
    description: 'Vertical-specific AI agent applications and APIs.',
    image: tenrichImg,
    bgColor: 'bg-[#8634DE]'
  },
  {
    id: '03',
    title: 'Cashflow Monitoring',
    short: 'Monitoring',
    description: 'Real-time cashflow intelligence with predictive cashflow analytics.',
    image: cashflowImg,
    bgColor: 'bg-[#8634DE]'
  },
  {
    id: '04',
    title: 'Device and Behvioural Intelligence',
    short: 'Context',
    description: 'The complete ecosystem and API network.',
    image: behaviouralImg,
    bgColor: 'bg-[#8634DE]'
  },
  {
    id: '05',
    title: 'AI Agent Suite',
    short: 'Agentic',
    description: 'The complete ecosystem and API network.',
    image: agenticCatImg,
    bgColor: 'bg-[#8634DE]'
  },
  {
    id: '06',
    title: 'FinDoc Analyser',
    short: 'Analysis',
    description: 'The complete ecosystem and API network.',
    image: docaImg,
    bgColor: 'bg-[#8634DE]'
  }
];

export default function ProductCatalog() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-loop every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CATALOG_ITEMS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-full max-w-[100rem] mx-auto px-6 md:pl-[280px] lg:pl-[320px] lg:pr-12 font-sans text-slate-900 bg-transparent flex flex-col justify-center pt-12 lg:pt-24 pb-4 lg:pb-8 pointer-events-auto">
      {/* Header Bar */}
      <div className="flex justify-between items-center pb-4 mb-12">
        <div className="flex items-center gap-2 text-xs font-normal tracking-widest uppercase text-gray-500" style={{ fontFamily: 'var(--font-dm-mono), monospace' }}>
          <span className="text-[#8634DE]">{'>'}</span> PRODUCT CATALOG
        </div>
        <div className="font-mono text-sm text-slate-400 font-medium">
          [{activeIndex + 1}/{CATALOG_ITEMS.length}]
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

        {/* Left Column - Copy & Menu */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          <div>
            <h2
              className="text-[36px] font-space-grotesk font-normal tracking-tight mb-6 leading-[1.15]"
            >
              All the building blocks to power <br />
              <span style={{ color: '#8634DE'}}>intelligent financial systems.</span>
            </h2>
            <p className="text-slate-500 text-[13px] font-dm-sans font-normal leading-relaxed mb-12">
              Intelligence primitives for understanding financial behaviour, enriching financial context, predicting outcomes, and enabling autonomous decision-making.
            </p>
          </div>

          {/* Interactive Menu List */}
          <div className="flex flex-col">
            {CATALOG_ITEMS.map((item, idx) => {
              const isActive = activeIndex === idx;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`group flex items-center justify-between text-left py-4 border-b transition-all duration-200 ease-out active:scale-[0.98] ${isActive ? 'text-[#8634DE]' : 'border-slate-200 hover:border-slate-400'
                    }`}
                >
                  <div className="flex items-center gap-6">
                    <span className={`font-mono text-xs ${isActive ? 'text-[#8634DE] font-normal' : 'text-slate-400'}`}>
                      {item.id}
                    </span>
                    <span
                      className={`text-[16px] font-space-grotesk font-normal transition-all duration-300 ${isActive ? 'text-slate-900' : 'text-slate-500'}`}
                    >
                      {item.title}
                    </span>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="w-1.5 h-1.5 bg-[#8634DE]"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column - Image Showcase */}
        <div className={`lg:col-span-8 flex flex-col min-h-[400px] lg:min-h-[500px] transition-colors duration-500 ${CATALOG_ITEMS[activeIndex].bgColor}`}>
          <div className="relative flex-grow flex items-center justify-center overflow-hidden">
            {/* White corners decoration removed */}

            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.02, filter: 'blur(4px)' }}
                transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                className="absolute inset-0 w-full h-full p-8 lg:p-16"
              >
                <div className="relative w-full h-full">
                  <Image
                    src={CATALOG_ITEMS[activeIndex].image}
                    alt={CATALOG_ITEMS[activeIndex].title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom text content block on the image block */}
          <div className="bg-slate-50 border-t border-slate-200 px-8 py-8 flex-col flex z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 8, filter: 'blur(2px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -8, filter: 'blur(2px)' }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="flex flex-col"
              >
                <div className="flex items-center justify-between w-full mb-4">
                  <div className="flex items-center gap-3 font-mono text-xs font-normal tracking-widest text-[#8634DE] uppercase">
                    <span>{CATALOG_ITEMS[activeIndex].id}</span>
                    <span>·</span>
                    <span>{CATALOG_ITEMS[activeIndex].short}</span>
                  </div>
                  
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-none border border-[#8634DE] text-[#8634DE] text-[11px] font-normal tracking-wider bg-transparent cursor-pointer font-dm-sans">
                    Know More
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1} />
                  </button>
                </div>

                <h3 className="text-3xl font-space-grotesk font-normal tracking-tight text-slate-900 mb-3">
                  {CATALOG_ITEMS[activeIndex].title}
                </h3>

                <p className="text-slate-500 text-[13px] font-dm-sans font-normal leading-relaxed max-w-xl">
                  {CATALOG_ITEMS[activeIndex].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
