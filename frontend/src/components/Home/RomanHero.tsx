"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import BFSGetStarted from '@/components/BFS/BFSGetStarted';

const customEase = [0.16, 1, 0.3, 1] as const;

export default function RomanHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  const words = ["banks", "NBFCs", "fintechs", "insurance", "payments", "loans"];
  const [wordIndex, setWordIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Background Image Parallax (Gentle rise to perfectly flush at bottom)
  const imageY = useTransform(scrollYProgress, [0, 1], ['20%', '0%']);

  // Text Transformations (Pulling back and fading)
  const textY = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const textScale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={containerRef} className="relative h-[150vh] w-full">

      <div className="sticky top-0 w-full flex flex-col items-center pt-[15vh] md:pt-[22vh] px-6 pointer-events-none">

        {/* Foreground Content */}
        <motion.div
          style={{ y: textY, scale: textScale, opacity: textOpacity }}
          className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto"
        >


          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: customEase, delay: 0.1 }}
            className="text-[40px] leading-[1.1] sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tighter text-slate-900 mb-6"
            style={{ WebkitFontSmoothing: 'antialiased', fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            Financial <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-[linear-gradient(90deg,#1c69ff_0%,#8bb2ff_25%,#b48cf8_50%,#d875ff_75%,#ff6685_100%)]" style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', paddingRight: '4px', paddingLeft: '4px' }}>
              intelligence
            </span>
            <span className="block mt-2 md:mt-0 md:whitespace-nowrap md:translate-x-10 lg:translate-x-20">
              infrastructure for{' '}
              <span className="relative block md:inline-block w-full md:w-[280px] lg:w-[320px] h-[1.2em] align-bottom text-left font-light mt-2 md:mt-0" style={{ clipPath: 'inset(0 -100vw 0 0)', color: '#8634DE',fontFamily: 'var(--font-dm-sans), sans-serif'}}>
                <AnimatePresence>
                  <motion.span
                    key={wordIndex}
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -80, opacity: 0 }} style={{fontFamily: 'var(--font-space-grotesk), sans-serif'}}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 bottom-0 whitespace-nowrap"
                  >
                    {words[wordIndex]}.
                  </motion.span>
                </AnimatePresence>
              </span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: customEase, delay: 0.1 }}
            className="text-gray-500 max-w-2xl leading-relaxed mb-10 " style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontWeight: 400, fontSize: '17px' }}
          >
            Rome forged the first global economy, Zeyro brings innovation to the new global economy.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: customEase, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-4 pointer-events-auto w-full sm:w-auto"
          >
            <button
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#8634DE] hover:bg-[#772ac9] text-white font-normal text-sm tracking-wide shadow-lg shadow-[#8634DE]/25 hover:-translate-y-1 hover:shadow-[#8634DE]/40 active:scale-95 transition-all duration-200 inline-flex items-center justify-center gap-2 cursor-pointer"
              style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
            >
              Explore the Engine
            </button>
            <Link href="/docs" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-slate-700 font-normal text-sm tracking-wide shadow-sm border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all duration-200 cursor-pointer" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                View Documentation
              </button>
            </Link>
          </motion.div>
        </motion.div>

      </div>

      <BFSGetStarted isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  );
}
