"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import Link from 'next/link';
import BFSGetStarted from '@/components/BFS/BFSGetStarted';

interface NavigationProps {
  forceSolid?: boolean;
  hideWordmark?: boolean;
  dynamicBlend?: boolean;
}

export default function Navigation({ forceSolid = false, hideWordmark = false, dynamicBlend = false }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const loginTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isScrolled, setIsScrolled] = useState(false);

  const { scrollY } = useScroll();

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.documentElement.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    // Default to 10vh, but if dynamicBlend is false (homepage), wait until the index/sidebar becomes visible (100vh)
    const threshold = typeof window !== 'undefined'
      ? (dynamicBlend ? window.innerHeight * 0.1 : window.innerHeight * 0.9)
      : 100;
    const shouldBeScrolled = latest > threshold;
    if (isScrolled !== shouldBeScrolled) {
      setIsScrolled(shouldBeScrolled);
    }
  });

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsProductsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsProductsOpen(false);
    }, 125);
  };

  const handleLoginMouseEnter = () => {
    if (loginTimeoutRef.current) clearTimeout(loginTimeoutRef.current);
    setIsLoginOpen(true);
  };

  const handleLoginMouseLeave = () => {
    loginTimeoutRef.current = setTimeout(() => {
      setIsLoginOpen(false);
    }, 125);
  };

  const customEaseOut: [number, number, number, number] = [0.25, 1, 0.5, 1];

  let textStyleClass = 'text-gray-900 md:mix-blend-difference md:text-white';
  if (forceSolid) {
    textStyleClass = 'text-gray-900 md:mix-blend-normal';
  } else if (isScrolled) {
    textStyleClass = 'text-gray-900 md:mix-blend-normal';
  } else if (dynamicBlend) {
    textStyleClass = 'text-white';
  }

  return (
    <>



      {/* LAYER 0: Glass Background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isScrolled || forceSolid ? 1 : 0 }}
        transition={{ duration: 0.4, ease: customEaseOut }}
        className={`fixed top-0 inset-x-0 h-[68px] z-[95] pointer-events-none hidden md:block ${forceSolid ? 'bg-white/90 backdrop-blur-md' : 'bg-white/90 backdrop-blur-md border-b border-gray-200/50'}`}
        style={forceSolid ? {
          backgroundImage: 'repeating-linear-gradient(to right, #B3B3B3 0px, #B3B3B3 8px, transparent 8px, transparent 12px)',
          backgroundPosition: 'bottom left',
          backgroundSize: '100% 1px',
          backgroundRepeat: 'no-repeat'
        } : undefined}
      />

      {/* LAYER 1: MIX BLEND (Inverted Text) */}
      <motion.nav
        initial={{ opacity: 0, transform: "translateY(-20px) translateZ(0)" }}
        animate={{ opacity: 1, transform: "translateY(0px) translateZ(0)" }}
        transition={{ duration: 0.8, ease: customEaseOut }}
        style={{ willChange: "transform, opacity" }}
        className={`fixed top-0 inset-x-0 z-[110] bg-transparent px-6 md:px-8 py-4 md:py-6 grid grid-cols-3 items-center pointer-events-none ${textStyleClass} font-dm-sans tracking-wider antialiased`}
      >
        <div className="flex items-center pointer-events-auto">
          {!hideWordmark && (
            <Link
              href="/"
              className="text-2xl font-[800] leading-none tracking-[0.01em] lowercase flex items-start no-underline hover:opacity-80 transition-opacity"
              style={{ fontFamily: 'var(--font-syne), sans-serif' }}
            >
              zeyro<span className="text-[8px] font-bold tracking-normal uppercase ml-[2px] mt-[2px] no-underline select-none">TM</span>
            </Link>
          )}
        </div>
        <div className="flex justify-center items-center pointer-events-none">
          <div className="hidden md:flex justify-center gap-6 sm:gap-8 text-[15px] font-extralight leading-[140%] relative z-10 items-center pointer-events-auto">
            <Link href="/" className="hover:opacity-70 transition duration-[160ms] ease-out py-1 active:scale-[0.97] origin-center inline-block">Home</Link>

            <div
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className="hover:opacity-70 transition duration-[160ms] ease-out py-1 active:scale-[0.97] origin-center flex items-center gap-1 cursor-pointer"
                onClick={() => setIsProductsOpen(!isProductsOpen)}
              >
                Products
                <motion.svg
                  width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  animate={{ transform: isProductsOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  transition={{ duration: 0.2, ease: customEaseOut }}
                >
                  <path d="m6 9 6 6 6-6" />
                </motion.svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right Area: Login (Commented out) & Get Started Button */}
        <div className="flex items-center justify-end gap-3 sm:gap-4 pointer-events-none">
          {/* Login hidden for now */}

            <div className="hidden md:flex px-3 sm:px-5 py-2 rounded-[6px] text-sm font-extralight opacity-0 pointer-events-none items-center gap-1.5">
              <span className="hidden sm:inline">Nabard</span>
            </div>

            <div className="hidden md:flex px-3 sm:px-5 py-2 rounded-[6px] text-sm font-extralight opacity-0 pointer-events-none items-center gap-1.5">
              <span className="hidden sm:inline">Get Started</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>

            {/* Mobile Hamburger (Blended) */}
            <button
              className="md:hidden w-10 h-10 rounded-xl border-[1.5px] border-current flex items-center justify-center pointer-events-auto z-[120] active:scale-90 transition-transform"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {isMobileMenuOpen ? (
                  <>
                    <path d="M18 6L6 18" />
                    <path d="M6 6l12 12" />
                  </>
                ) : (
                  <>
                    <line x1="4" x2="20" y1="12" y2="12" />
                    <line x1="4" x2="20" y1="6" y2="6" />
                    <line x1="4" x2="20" y1="18" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
      </motion.nav>

      {/* LAYER 2: NORMAL (Blue Button) */}
      <motion.nav
        initial={{ opacity: 0, transform: "translateY(-20px) translateZ(0)" }}
        animate={{ opacity: 1, transform: "translateY(0px) translateZ(0)" }}
        transition={{ duration: 0.8, ease: customEaseOut }}
        style={{ willChange: "transform, opacity" }}
        className="fixed top-0 inset-x-0 z-[111] bg-transparent px-6 md:px-12 py-4 grid grid-cols-3 items-center pointer-events-none font-dm-sans tracking-wider antialiased"
      >
        <div />
        <div className="flex justify-center items-center pointer-events-none">
          <div className="hidden md:flex justify-center gap-6 sm:gap-8 text-[15px] font-extralight leading-[140%] relative z-10 items-center pointer-events-none">
            {/* Placeholder for Home */}
            <div className="py-1 inline-block opacity-0">Home</div>

            {/* Placeholder for Products & Actual Dropdown */}
            <div className="relative">
              <div className="py-1 flex items-center gap-1 opacity-0 pointer-events-none">
                Products
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>

              <AnimatePresence>
                {isProductsOpen && (
                  <motion.div
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    initial={{ opacity: 0, filter: 'blur(4px)', transform: "scale(0.95) translateY(8px)" }}
                    animate={{ opacity: 1, filter: 'blur(0px)', transform: "scale(1) translateY(0px)" }}
                    exit={{ opacity: 0, filter: 'blur(4px)', transform: "scale(0.95) translateY(8px)" }}
                    transition={{ duration: 0.18, ease: customEaseOut }}
                    style={{ transformOrigin: "top center" }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-52 bg-white rounded-[6px] border border-gray-100 py-1.5 px-1 overflow-hidden pointer-events-auto"
                  >
                    <Link
                      href="/products/behavioural-financial-score"
                      className="block p-2 rounded-[4px] font-extralight text-xs text-slate-900 hover:text-blue-600 hover:bg-slate-50 transition-colors active:scale-[0.97] origin-center duration-[160ms]"
                      onClick={() => setIsProductsOpen(false)}
                    >
                      Credit Underwriting
                    </Link>
                    <Link
                      href="/products/transaction-enrichment"
                      className="block p-2 rounded-[4px] font-extralight text-xs text-slate-900 hover:text-blue-600 hover:bg-slate-50 transition-colors active:scale-[0.97] origin-center duration-[160ms]"
                      onClick={() => setIsProductsOpen(false)}
                    >
                      Transaction Enrichment
                    </Link>
                    <Link
                      href="/marketing/products/document-analyzer"
                      className="block p-2 rounded-[4px] font-extralight text-xs text-slate-900 hover:text-blue-600 hover:bg-slate-50 transition-colors active:scale-[0.97] origin-center duration-[160ms]"
                      onClick={() => setIsProductsOpen(false)}
                    >
                      Document Analyzer
                    </Link>
                    {/* <Link
                      href="/products/cashflow-monitoring"
                      className="block p-2 rounded-[4px] font-extralight text-xs text-slate-900 hover:text-blue-600 hover:bg-slate-50 transition-colors active:scale-[0.97] origin-center duration-[160ms]"
                      onClick={() => setIsProductsOpen(false)}
                    >
                      Cashflow Monitoring
                    </Link> */}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Area: Temporary Get Started Button */}
        <div className="flex items-center justify-end gap-3 sm:gap-4 pointer-events-none">
          <Link
            href="/nabard-demo"
            className="hidden md:flex relative overflow-hidden bg-emerald-600 text-white px-3 sm:px-5 py-2 rounded-[6px] text-sm font-extralight hover:scale-[1.02] active:scale-[0.97] transition-transform duration-[160ms] ease-out z-10 pointer-events-auto items-center gap-1.5"
          >
            <span className="hidden sm:inline">Nabard</span>
          </Link>

          {/* Actual Get Started Button */}
          <button
            onClick={() => setModalOpen(true)}
            className="hidden md:block relative overflow-hidden bg-[#8634DE] text-white px-3 sm:px-5 py-2 rounded-[6px] text-sm font-extralight hover:scale-[1.02] active:scale-[0.97] transition-transform duration-[160ms] ease-out z-10 pointer-events-auto"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <span className="hidden sm:inline">Get Started</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </span>
          </button>

          {/* Mobile Hamburger (Placeholder) */}
          <div className="md:hidden text-[15px] opacity-0 pointer-events-none w-[24px] h-[24px]">
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 -bottom-[20vh] w-[110vw] min-h-[120vh] bg-white/40 backdrop-blur-lg backdrop-saturate-150 z-[115] md:hidden pl-8 pr-[calc(2rem+10vw)] pt-32 pb-[calc(20vh+2rem)] flex flex-col justify-start gap-8 font-dm-sans overflow-hidden"
          >
            <Link
              href="/"
              className="absolute top-6 left-6 text-2xl font-[800] leading-none tracking-[0.01em] lowercase flex items-start text-slate-900 no-underline active:scale-95 transition-transform"
              style={{ fontFamily: 'var(--font-syne), sans-serif' }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              zeyro<span className="text-[8px] font-bold tracking-normal uppercase ml-[2px] mt-[2px] no-underline select-none">TM</span>
            </Link>

            <button
              className="absolute top-4 right-[calc(10vw+1.5rem)] w-10 h-10 rounded-xl flex items-center justify-center bg-slate-900 text-white active:scale-90 transition-transform z-[120] shadow-sm"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col gap-6 mt-2">
              <div className="flex flex-col gap-3">
                <Link href="/" className="text-[10px] font-normal text-slate-900 uppercase tracking-widest active:opacity-70 transition-opacity" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-normal text-slate-900 uppercase tracking-widest">Products</span>
                <div className="flex flex-col gap-3 pl-4 border-l border-slate-200 ml-1">
                  <Link href="/products/behavioural-financial-score" className="text-base font-light text-slate-600 active:opacity-70 transition-opacity" onClick={() => setIsMobileMenuOpen(false)}>Credit Underwriting</Link>
                  <Link href="/products/transaction-enrichment" className="text-base font-light text-slate-600 active:opacity-70 transition-opacity" onClick={() => setIsMobileMenuOpen(false)}>Transaction Enrichment</Link>
                  <Link href="/marketing/products/document-analyzer" className="text-base font-light text-slate-600 active:opacity-70 transition-opacity" onClick={() => setIsMobileMenuOpen(false)}>Document Analyzer</Link>
                  {/* <Link href="/products/cashflow-monitoring" className="text-base font-light text-slate-600 active:opacity-70 transition-opacity" onClick={() => setIsMobileMenuOpen(false)}>Cashflow Monitoring</Link> */}
                </div>
              </div>
            </div>

            <div className="mt-auto w-full flex flex-col gap-3">
              <Link
                href="/nabard-demo"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full bg-emerald-600 text-white px-5 py-2.5 rounded-[6px] text-[15px] font-light active:scale-[0.98] transition-transform flex items-center justify-center gap-2 group shadow-sm"
              >
                Nabard
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setModalOpen(true);
                }}
                className="w-full bg-[#8634DE] text-white px-5 py-2.5 rounded-[6px] text-[15px] font-light active:scale-[0.98] transition-transform flex items-center justify-center gap-2 group shadow-sm"
              >
                Get Started
                <svg className="group-active:translate-x-1 transition-transform" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BFSGetStarted isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
