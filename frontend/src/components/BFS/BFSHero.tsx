"use client";

import React from 'react';
import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import Image from "next/image";
import heroBg from "@/assests/images/bfshero.webp";
import { Playfair_Display } from 'next/font/google';
import BFSGetStarted from './BFSGetStarted';

const playfair = Playfair_Display({ subsets: ['latin'], style: ['normal', 'italic'] });

export default function BFSHero() {
  const customEaseOut = [0.23, 1, 0.32, 1] as const;

  const [modalOpen, setModalOpen] = React.useState(false);

  return (
    <section className="pt-48 pb-24 px-6 relative overflow-hidden min-h-screen flex flex-col justify-center">
      <BFSGetStarted isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      
      {/* Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: customEaseOut }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={heroBg}
            alt="Zeyro Hero Background"
            fill
            priority
            className="object-cover object-center"
          />
        </motion.div>
        
        {/* Subtle dark gradient overlay to make yellow text legible */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, transform: "translateY(30px)", filter: "blur(12px)" }}
        animate={{ opacity: 1, transform: "translateY(0px)", filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: customEaseOut }}
        className="max-w-4xl mx-auto text-center relative z-10 drop-shadow-[0_4px_32px_rgba(0,0,0,0.3)] flex flex-col items-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: customEaseOut }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ead982]/20 border border-[#ead982]/50 text-[#ead982] text-xs font-bold uppercase tracking-[0.2em] mb-6 backdrop-blur-md"
        >
          <span className="w-2 h-2 rounded-full bg-[#ead982] animate-pulse" />
          Coming Soon
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, transform: "translateY(20px)" }}
          animate={{ opacity: 1, transform: "translateY(0px)" }}
          transition={{ delay: 0.2, duration: 0.7, ease: customEaseOut }}
          className={`text-5xl md:text-7xl font-normal text-[#ead982] leading-[1.1] mb-6 ${playfair.className}`}
        >
          Credit <br/>
          <span className="italic">
            Underwriting.
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ delay: 0.4, duration: 0.8, ease: customEaseOut }}
          className="text-xl text-[#ead982]/90 leading-relaxed mb-12 max-w-2xl mx-auto font-medium"
        >
          Move beyond traditional credit scores. Our models analyze behavioral patterns and operational logistics to predict financial reliability with unprecedented accuracy.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5, ease: customEaseOut }}
        >
          <button
            onClick={() => setModalOpen(true)}
            className="group relative flex items-center justify-center gap-2 bg-[#ead982] hover:bg-[#d6c265] text-black font-bold text-base md:text-lg px-8 py-4 rounded-xl border-[3px] border-[#ead982] hover:border-[#d6c265] transition-all active:scale-95 duration-200"
            style={{ boxShadow: '4px 4px 0px 0px #bda845' }}
          >
            <span className="tracking-wide uppercase">Get in touch</span>
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </motion.div>
        
      </motion.div>
    </section>
  );
}
