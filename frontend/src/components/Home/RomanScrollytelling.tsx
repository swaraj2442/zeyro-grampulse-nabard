"use client";

import React, { useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import Navigation from '@/components/Navigation';
import RomanFooter from './RomanFooter';
import RomanSidebar from './RomanSidebar';
import ProductCatalog from './ProductCatalog';
import RomanHero from './RomanHero';
import ZeyroHowItWorks from './ZeyroHowItWorks';
import ZeyroWhatWeDo from './ZeyroWhatWeDo';
import ZeyroUseCases from './ZeyroUseCases';
import ZeyroLayer8CTA from './Zeyroclosing';
import ZeyroComparison from './Zeyropersonas';
import ZeyroEnterprise from './ZeyroEnterprise';
import ZeyroPricing from './ZeyroPricing';
import bgHome from '@/assests/images/bghome.png';
import bgOutlineHome from '@/assests/images/bgoutlinehome.png';

// Emil: Spring config for mouse parallax — snappy but with real momentum
const SPRING_CONFIG = { stiffness: 150, damping: 18, mass: 1 };

// Depth multipliers — higher = closer to camera = moves MORE with mouse
const DEPTH = {
  waves: 0.012,
  glow: 0.02,
  cube: 0.05,
};

// ─────────────────────────────────────────────────────────────────────────────
// TORN PAPER SVG PATH
// This is a hand-crafted irregular path that looks like crumpled/ripped paper.
// The path starts at top-left (0,0), goes right, then has a jagged torn edge
// at the bottom, then back to close the shape. This creates the "torn" silhouette.
// ─────────────────────────────────────────────────────────────────────────────
const TORN_PATH = `
  M 0,0
  L 1440,0
  L 1440,20
  L 1410,25 L 1380,18 L 1350,32 L 1320,25 L 1290,40 L 1260,35 
  L 1230,55 L 1200,48 L 1170,65 L 1140,60 L 1110,80 L 1080,72 
  L 1050,95 L 1020,85 L 990,110 L 960,105 L 930,125 L 900,118 
  L 870,140 L 840,130 L 810,155 L 780,145 L 750,165 L 720,158 
  L 690,165 L 660,155 L 630,150 L 600,140 L 570,145 L 540,130 
  L 510,135 L 480,120 L 450,125 L 420,105 L 390,110 L 360,90 
  L 330,95 L 300,75 L 270,80 L 240,60 L 210,65 L 180,45 
  L 150,50 L 120,30 L 90,35 L 60,15 L 30,20 L 10,0 L 0,5
  Z
`;

// Irregular, asymmetrical torn paper edge (diagonal slant)
const ASYMMETRIC_TEAR_PATH = `
  M 0,0
  L 1440,0
  L 1440,90
  L 1380,75 L 1320,85 L 1260,65 L 1200,75 
  L 1140,55 L 1080,65 L 1020,45 L 960,55 
  L 900,35 L 840,45 L 780,25 L 720,35 
  L 660,15 L 600,25 L 540,5 L 480,15 
  L 420,10 L 360,25 L 300,5 L 240,20 
  L 180,15 L 120,30 L 60,10 L 0,25
  Z
`;

export default function RomanScrollytelling() {
  const { scrollYProgress } = useScroll();
  
  // Track the footer's exact position on screen
  const footerRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress: footerProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"]
  });

  // ── MOUSE TRACKING ──────────────────────────────────────────────────────────
  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);
  const mouseX = useSpring(rawMouseX, SPRING_CONFIG);
  const mouseY = useSpring(rawMouseY, SPRING_CONFIG);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      rawMouseX.set((e.clientX / window.innerWidth) - 0.5);
      rawMouseY.set((e.clientY / window.innerHeight) - 0.5);
    };
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (mq.matches) window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [rawMouseX, rawMouseY]);

  // ── PAPER CUT ANIMATIONS ───────────────────────────────────────────────────
  // Paper 1 (Hero)
  // Peels up between 0% and 11.5% of total scroll.
  // Because it peels over ~115vh of scrolling but only moves 60vh, it moves at ~0.5x speed.
  // This gives it a beautiful, sticky parallax depth effect.
  const paper1Y = useTransform(scrollYProgress, [0, 0.115], ['0%', '-120%']);
  const paper1ContentY = useTransform(scrollYProgress, [0, 0.115], ['0%', '-20%']);

  // ── BACKGROUND SCROLL STATE ─────────────────────────────────────────────────
  // Scene A: Roman Hero waves — hard cut to invisible exactly when Paper 2 fully covers screen (0.24)
  // No fade window — instant swap hidden behind solid paper
  const waveOpacity = useTransform(scrollYProgress, [0, 0.239, 0.241, 1], [1, 1, 0, 0]);
  const waveScrollY = useTransform(scrollYProgress, [0, 0.45, 1], ['0%', '15%', '15%']);

  // Scene B: custom-element.webp — hard cuts in at exactly the same 0.24 moment.
  // User never sees the swap — Paper 2 is a completely opaque wall at this scroll point.
  const customElementOpacity = useTransform(scrollYProgress, [0, 0.239, 0.241, 1], [0, 0, 1, 1]);
  
  // Rises exactly in sync with the footer entering the viewport
  const sceneBScrollY = useTransform(footerProgress, [0, 1], ['0vh', '-65vh']);

  // Solid blocker between waves and monument — snaps opaque at 0.24, permanently blocking waves
  const waveBlockerOpacity = useTransform(scrollYProgress, [0, 0.239, 0.241, 1], [0, 0, 1, 1]);

  const cubeOpacity = useTransform(scrollYProgress, [0.1, 0.2], [0, 1]);
  const cubeScrollRotateX = useTransform(scrollYProgress, [0.1, 0.9], [20, 720]);
  const cubeScrollRotateY = useTransform(scrollYProgress, [0.1, 0.9], [45, 720]);
  const cubeScale = useTransform(scrollYProgress, [0.1, 0.4, 0.8], [0.8, 1.5, 1]);

  const l1BoxOpacity = useTransform(scrollYProgress, [0.1, 0.2], [1, 0]);
  const l2PillarsOpacity = useTransform(scrollYProgress, [0.2, 0.35, 0.45, 0.55], [0, 1, 1, 0]);
  const l3NetworkOpacity = useTransform(scrollYProgress, [0.6, 0.75], [0, 1]);

  const glowColor = useTransform(scrollYProgress, [0, 0.4, 0.8], ["#1e293b", "#1e3a8a", "#4c1d95"]);

  // ── PER-LAYER MOUSE PARALLAX ────────────────────────────────────────────────
  const waveParallaxX = useTransform(mouseX, (v) => `${v * (typeof window !== 'undefined' ? window.innerWidth : 1440) * DEPTH.waves}px`);
  const waveParallaxY = useTransform(mouseY, (v) => `${v * (typeof window !== 'undefined' ? window.innerHeight : 900) * DEPTH.waves}px`);
  const glowParallaxX = useTransform(mouseX, (v) => `${v * (typeof window !== 'undefined' ? window.innerWidth : 1440) * DEPTH.glow}px`);
  const glowParallaxY = useTransform(mouseY, (v) => `${v * (typeof window !== 'undefined' ? window.innerHeight : 900) * DEPTH.glow}px`);
  const cubeParallaxX = useTransform(mouseX, (v) => `${v * (typeof window !== 'undefined' ? window.innerWidth : 1440) * DEPTH.cube}px`);
  const cubeParallaxY = useTransform(mouseY, (v) => `${v * (typeof window !== 'undefined' ? window.innerHeight : 900) * DEPTH.cube}px`);
  const cubeTiltX = useTransform(mouseY, [-0.5, 0.5], [8, -8]);
  const cubeTiltY = useTransform(mouseX, [-0.5, 0.5], [-8, 8]);

  return (
    <div className="relative w-full bg-[#f4efe6] text-slate-900 font-sans overflow-x-hidden">
      <RomanSidebar />

      {/* ═══════════════════════════════════════════════════
          GLOBAL FIXED BACKGROUND — One unified stage
      ════════════════════════════════════════════════════ */}
      <div className="fixed inset-0 -left-2 -right-2 z-0 pointer-events-none overflow-hidden flex items-center justify-center bg-[#6221d2]">

        {/* Far Background Glow */}
        <motion.div
          className="absolute inset-0 blur-[160px] opacity-30"
          style={{ backgroundColor: glowColor, x: glowParallaxX, y: glowParallaxY }}
        />

        {/* Scene A: bghome.png — visible from page load through to Paper 2 arrival */}
        <motion.div
          style={{ opacity: waveOpacity, y: waveScrollY }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <motion.img
            src={bgHome.src}
            alt="Home Background"
            style={{ x: waveParallaxX, y: waveParallaxY }}
            className="w-full h-full object-cover object-center opacity-80 scale-[1.05]"
          />
        </motion.div>

        {/* Solid blocker — snaps opaque at 0.40, permanently hides waves behind monument */}
        <motion.div
          className="absolute inset-0 bg-[#6221d2]"
          style={{ opacity: waveBlockerOpacity }}
        />

        {/* Scene B: bgoutlinehome.png — swapped in silently while Paper 2 covers the screen */}
        <motion.div
          style={{ opacity: customElementOpacity, y: sceneBScrollY }}
          className="absolute inset-0 pointer-events-none"
        >
          {/* Wrapper to hold image for parallax */}
          <motion.div 
            className="absolute inset-0 w-full h-full flex flex-col justify-end"
            style={{ x: waveParallaxX, y: waveParallaxY }}
          >
            <img
              src={bgOutlineHome.src}
              alt="Home Background Outline"
              className="w-full h-full object-cover object-center opacity-80 scale-[1.05] block"
              style={{
                WebkitMaskImage: 'linear-gradient(to bottom, black calc(100% - 40px), transparent 100%)',
                maskImage: 'linear-gradient(to bottom, black calc(100% - 40px), transparent 100%)'
              }}
            />
          </motion.div>
        </motion.div>

        {/* 3D Intelligence Engine Removed - Replaced by custom-element.webp */}
      </div>
      {/* ═══════════════════════════════════════════════════
          PAPER 1 — HERO LAYER
      ════════════════════════════════════════════════════ */}
      <motion.div
        style={{ y: paper1Y }}
        className="fixed inset-0 z-20 pointer-events-none"
      >
        <div
          className="absolute top-0 -left-1 -right-1 h-[65vh] sm:h-[58vh] md:h-[50vh] shadow-[0_0_0_2px_#f4efe6]"
          style={{
            background: '#f4efe6'
          }}
        >
          {/* Slanted wavy edge — smooth, parabolic rolling hills, slanting heavily UP from left to right */}
          <svg
            className="absolute top-full left-0 w-full h-[50px] md:h-[100px] lg:h-[160px] pointer-events-none scale-x-[1.02]"
            viewBox="0 0 1440 160"
            preserveAspectRatio="none"
            fill="#f4efe6"
            style={{ marginTop: '-2px' }}
          >
            <path d="M 0,0 L 0,125 C 45,125 45,145 90,145 C 135,145 135,112 180,112 C 225,112 225,132 270,132 C 315,132 315,99 360,99 C 405,99 405,119 450,119 C 495,119 495,86 540,86 C 585,86 585,106 630,106 C 675,106 675,73 720,73 C 765,73 765,93 810,93 C 855,93 855,60 900,60 C 945,60 945,80 990,80 C 1035,80 1035,47 1080,47 C 1125,47 1125,67 1170,67 C 1215,67 1215,34 1260,34 C 1305,34 1305,54 1350,54 C 1395,54 1395,21 1440,21 L 1440,0 Z" />
          </svg>
        </div>

        <motion.div style={{ y: paper1ContentY }} className="absolute top-0 left-0 right-0 h-[65vh] sm:h-[58vh] md:h-[50vh] pointer-events-auto">
          <RomanHero />
        </motion.div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════
          NAVIGATION — Always on Top (highest z-index)
      ════════════════════════════════════════════════════ */}
      <Navigation hideWordmark={false} />

      {/* ═══════════════════════════════════════════════════
          SCROLL CONTENT FLOW (All layers in DOM)
      ════════════════════════════════════════════════════ */}
      <div className="relative z-30 pointer-events-none w-full flex flex-col">
        {/* --- 0. HERO SPACER --- */}
        <div id="layer-0" className="h-[75vh] md:h-[100vh]" />

        {/* --- I. FOUNDATION (Removed) --- */}
        <div id="layer-1" className="h-[75vh] md:h-[100vh]" />

        {/* === SOLID PAPER WRAPPER === */}
        {/* Wraps all paper sections to prevent the fixed background from shining through sub-pixel gaps during fast scrolling */}
        <div className="relative w-full bg-[#f4efe6] z-40 pointer-events-auto" style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
        
        {/* --- II. ARCHITECTURE (Product Catalog Paper) --- */}
        <section id="layer-2" className="relative w-full flex flex-col pointer-events-auto bg-[#f4efe6] shadow-[0_0_0_2px_#f4efe6] z-40 pt-12 pb-8">
          {/* Top scalloped edge */}
          <svg
            className="absolute bottom-full left-0 w-full h-[50px] md:h-[100px] lg:h-[160px] pointer-events-none -scale-y-100 scale-x-[1.02]"
            viewBox="0 0 1440 160"
            preserveAspectRatio="none"
            fill="#f4efe6"
            style={{ marginBottom: '-2px' }}
          >
            <path d="M 0,0 L 0,125 C 45,125 45,145 90,145 C 135,145 135,112 180,112 C 225,112 225,132 270,132 C 315,132 315,99 360,99 C 405,99 405,119 450,119 C 495,119 495,86 540,86 C 585,86 585,106 630,106 C 675,106 675,73 720,73 C 765,73 765,93 810,93 C 855,93 855,60 900,60 C 945,60 945,80 990,80 C 1035,80 1035,47 1080,47 C 1125,47 1125,67 1170,67 C 1215,67 1215,34 1260,34 C 1305,34 1305,54 1350,54 C 1395,54 1395,21 1440,21 L 1440,0 Z" />
          </svg>

          <ProductCatalog />
        </section>

        <section id="layer-6" className="relative w-full flex flex-col pointer-events-auto bg-[#f4efe6] shadow-[0_0_0_2px_#f4efe6] z-40">

          <div className="w-full flex flex-col">
            <ZeyroComparison />
            <ZeyroWhatWeDo />
          </div>
        </section>

        {/* --- VIII. HOW IT WORKS & IX. USE CASES (Paper 4) --- */}
        <section className="relative w-full flex flex-col pointer-events-auto bg-[#f4efe6] shadow-[0_0_0_2px_#f4efe6] z-40">

          <div className="w-full flex flex-col">
            <ZeyroHowItWorks />
            <ZeyroUseCases />
          </div>
        </section>

        {/* --- XI. ENTERPRISE & PRICING (Paper Section) --- */}
        <section id="layer-11" className="relative w-full flex flex-col items-center pointer-events-auto bg-[#f4efe6] shadow-[0_0_0_2px_#f4efe6] z-40">

          <ZeyroEnterprise />
          
          {/* <div className="w-full -mt-8 mb-12">
            <ZeyroPricing />
          </div> */}
          
          {/* Bottom irregular torn edge (transitions to footer) */}
          <svg
            className="absolute top-full left-0 w-full h-[60px] md:h-[80px] pointer-events-none scale-x-[1.02]"
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
            fill="#f4efe6"
            style={{ marginTop: '-1px' }}
          >
            <path d={ASYMMETRIC_TEAR_PATH} />
          </svg>
        </section>
        </div>

        {/* --- XII. GENESIS (CTA) --- */}
        <section id="layer-12" className="relative w-full pointer-events-auto bg-transparent z-40 mt-[10vh]">
          <ZeyroLayer8CTA />
        </section>

        {/* ── FOOTER ── */}
        <div ref={footerRef} className="relative z-20 w-full pointer-events-auto bg-transparent mt-[5vh]">
          <RomanFooter />
        </div>
      </div>
    </div>
  );
}
