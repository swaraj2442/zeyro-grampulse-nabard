"use client";

import React from 'react';
import { motion } from 'framer-motion';
import HeroSlider from './HeroSlider';

export default function DocHero() {
  const customEaseOut = [0.23, 1, 0.32, 1] as const;

  return (
    <section className="relative bg-white mt-[72px] min-h-[760px] lg:min-h-[720px]">
      
      {/* Animated Colored Sliding Bottom Border */}
      <div className="absolute bottom-[-2px] left-0 right-0 z-20 pointer-events-none bg-white flex flex-col">
        {/* Top Dashed Line */}
        <div className="w-full h-[1px]" style={{ backgroundImage: 'repeating-linear-gradient(to right, #B3B3B3 0px, #B3B3B3 8px, transparent 8px, transparent 12px)' }}></div>
        
        {/* Top Line: Slides Right to Left */}
        <div className="w-full h-[16px] relative overflow-hidden flex items-center">
          <motion.div 
            animate={{ x: [0, -580] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 18 }}
            className="absolute left-0 h-[4.9px] w-[4000px]"
            style={{
              backgroundImage: 'repeating-linear-gradient(to right, #E39851 0px, #E39851 23.3px, #744821 23.3px, #744821 46.85px, #E39851 48.85px, #E39851 68.35px, #EECA5C 70.35px, #EECA5C 135.35px, #D46EA6 135.35px, #D46EA6 168.2px, #EECA5C 168.2px, #EECA5C 233.5px, #E39851 233.5px, #E39851 255.7px, #744821 255.7px, #744821 281.25px, #E39851 281.25px, #E39851 303.4px, #EECA5C 303.4px, #EECA5C 367.6px, #D46EA6 367.6px, #D46EA6 400.55px, #EECA5C 400.55px, #EECA5C 457.95px, #E39851 457.95px, #E39851 477.85px, transparent 477.85px, transparent 580px)'
            }}
          />
        </div>
        
        {/* Middle Dashed Line */}
        <div className="w-full h-[1px]" style={{ backgroundImage: 'repeating-linear-gradient(to right, #B3B3B3 0px, #B3B3B3 8px, transparent 8px, transparent 12px)' }}></div>

        {/* Bottom Line: Slides Left to Right */}
        <div className="w-full h-[16px] relative overflow-hidden flex items-center">
          <motion.div 
            animate={{ x: [-580, 0] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 18 }}
            className="absolute left-0 h-[4.9px] w-[4000px]"
            style={{
              backgroundImage: 'repeating-linear-gradient(to right, #E39851 0px, #E39851 23.3px, #744821 23.3px, #744821 48.85px, #E39851 48.85px, #E39851 70.35px, #EECA5C 70.35px, #EECA5C 135.35px, #D46EA6 135.35px, #D46EA6 168.2px, #EECA5C 168.2px, #EECA5C 233.5px, #E39851 233.5px, #E39851 255.7px, #744821 255.7px, #744821 281.25px, #E39851 281.25px, #E39851 303.4px, #EECA5C 303.4px, #EECA5C 367.6px, #D46EA6 367.6px, #D46EA6 400.55px, #EECA5C 400.55px, #EECA5C 457.95px, #E39851 457.95px, #E39851 477.85px, transparent 477.85px, transparent 580px)'
            }}
          />
        </div>

        {/* Bottom Dashed Line */}
        <div className="w-full h-[1px]" style={{ backgroundImage: 'repeating-linear-gradient(to right, #B3B3B3 0px, #B3B3B3 8px, transparent 8px, transparent 12px)' }}></div>
      </div>

      <div className="relative mx-auto w-full max-w-[1300px] px-6 lg:px-0 h-full">
        {/* Vertical Dashed Dividers */}
        <div aria-hidden="true" className="hidden lg:block absolute top-0 bottom-[33px] left-0 border-l border-dashed border-[#E2E2E2] z-20 pointer-events-none"></div>
        <div aria-hidden="true" className="hidden lg:block absolute top-0 bottom-[33px] left-[618px] border-l border-dashed border-[#E2E2E2] z-20 pointer-events-none"></div>
        <div aria-hidden="true" className="hidden lg:block absolute top-0 bottom-[33px] right-[0px] border-l border-dashed border-[#E2E2E2] z-20 pointer-events-none"></div>
        
        {/* Background Isometric Grid (Only on the right side) */}
        <div className="absolute top-0 bottom-[33px] left-[618px] right-0 z-0 pointer-events-none overflow-hidden">
          <div 
            className="absolute inset-[-100%]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
              transform: 'rotateX(60deg) rotateZ(-45deg) translateZ(-40px)',
              transformOrigin: '50% 50%'
            }}
          />
        </div>

        <div className="relative z-10 grid grid-cols-1 items-stretch min-h-[520px] lg:h-full lg:grid-cols-[55px_499px_59px_682px] lg:grid-rows-1">
          <div aria-hidden="true" className="hidden lg:block"></div>
          
          <div className="relative z-10 py-10 lg:py-0 flex flex-col justify-center gap-6 sm:gap-8 lg:gap-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: customEaseOut }}
            >
              
              <h1 className="text-[40px] md:text-[48px] xl:text-[48px] leading-[1.05] font-medium tracking-tight text-[#111] mb-6" style={{ textWrap: 'balance' }}>
                Document Layer <br className="hidden lg:inline" />
                for Enterprise AI
              </h1>
              <p className="text-[14px] sm:text-[15px] lg:text-[16px] leading-normal text-black/65 max-w-[540px]">
                We turn PDFs, images, and spreadsheets into JSON and Markdown your LLMs and AI agents can reason over. Built on our proprietary dual-stream vision models.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: customEaseOut }}
              className="flex items-center gap-3 mt-2"
            >
              <button className="min-h-0 min-w-0 bg-[#191919] hover:bg-[#2a2a2a] border border-[#191919] px-3 py-2 sm:px-3.5 sm:py-2 lg:px-[14px] lg:py-[9px] rounded-[2px] text-[13px] sm:text-[14px] lg:text-[15px] font-medium tracking-[-0.02em] text-white transition-colors">
                Book a demo
              </button>
              <button className="min-h-0 min-w-0 border border-black hover:bg-black/[0.03] px-3 py-2 sm:px-3.5 sm:py-2 lg:px-[14px] lg:py-[9px] rounded-[2px] text-[13px] sm:text-[14px] lg:text-[15px] font-medium tracking-[-0.02em] text-black bg-transparent transition-colors">
                Read the docs
              </button>
            </motion.div>
          </div>

          <div aria-hidden="true" className="hidden lg:block"></div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative overflow-hidden aspect-square sm:aspect-[4/3] md:aspect-[5/4] lg:aspect-auto"
          >
             <HeroSlider />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
