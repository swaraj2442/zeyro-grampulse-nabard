"use client";

import React, { useState } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';

const INDEX_ITEMS = [
  { id: 2, label: "Product catalog", numeral: "I" },
  { id: 6, label: "What we do", numeral: "II" },
  { id: 8, label: "How It Works", numeral: "III" },
  { id: 9, label: "Use Cases", numeral: "IV" },
  { id: 11, label: "Enterprise", numeral: "V" },
  // { id: 13, label: "Pricing", numeral: "VI" },
  // { id: 12, label: "Genesis", numeral: "VI" },
];

export default function RomanSidebar() {
  const { scrollYProgress } = useScroll();
  const [activeIndex, setActiveIndex] = useState(0);
  const [hideSidebar, setHideSidebar] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);

  // Map scroll progress to active section and hide before footer
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Hide when reaching the bottom (footer area, > 0.95)
    if (latest > 0.95) {
      setHideSidebar(true);
    } else {
      setHideSidebar(false);
    }
    
    // The paper tearing effect finishes around 0.115, so we reveal the index just before it finishes
    if (latest > 0.08) {
      setIsPastHero(true);
    } else {
      setIsPastHero(false);
    }
    // Determine active index dynamically by checking which section covers the middle of the screen
    if (typeof window !== 'undefined') {
      const middle = window.innerHeight / 2;
      for (const item of INDEX_ITEMS) {
        const el = document.getElementById(`layer-${item.id}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Check if the middle of the screen is within this section's vertical bounds
          if (rect.top <= middle && rect.bottom >= middle) {
            setActiveIndex(item.id);
            break;
          }
        }
      }
    }
  });

  const scrollToSection = (id: number) => {
    if (typeof window !== 'undefined') {
      const el = document.getElementById(`layer-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          // mix-blend-difference with cream text produces pure black on cream paper, and vivid lime on purple!
          className="fixed inset-y-0 left-0 w-64 z-[105] pointer-events-none mix-blend-difference text-[#f4efe6] hidden md:flex flex-col justify-between px-6 md:px-8 py-4 md:py-6"
        >
          {/* Top Left: Spacer (handled by Navigation) */}
          <div className="flex flex-col" />

          {/* Bottom Left: The Typographical Index */}
          <AnimatePresence mode="wait">
            {isPastHero && !hideSidebar && (
              <motion.div 
                initial={{ opacity: 0, filter: 'blur(24px) brightness(200%)', scale: 1.1, y: 40 }}
                animate={{ opacity: 1, filter: 'blur(0px) brightness(100%)', scale: 1, y: 0 }}
                exit={{ opacity: 0, filter: 'blur(12px) brightness(150%)', y: 20 }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col pb-4 origin-bottom-left"
              >
                <ul className="mb-8 flex flex-col gap-1 pointer-events-auto">
                  {INDEX_ITEMS.map((item) => {
                    const isActive = activeIndex === item.id;
                    return (
                      <li
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className="flex items-center justify-between font-light text-sm cursor-pointer group py-0.5"
                      >
                        <span 
                          className="tracking-tight transition-opacity duration-300 uppercase group-hover:opacity-100"
                          style={{ 
                            opacity: isActive ? 1 : 0.6,
                            fontFamily: 'var(--font-dm-mono), monospace'
                          }}
                        >
                          {item.label}
                        </span>
                        
                        {/* Dotted line connector */}
                        <div 
                          className="flex-grow mx-3 border-b border-dotted transition-opacity duration-300" 
                          style={{ 
                            borderColor: 'currentColor', 
                            opacity: isActive ? 0.5 : 0.2 
                          }} 
                        />
                        
                        <span 
                          className="text-sm transition-opacity duration-300 group-hover:opacity-100"
                          style={{ 
                            opacity: isActive ? 1 : 0.6,
                            fontFamily: 'var(--font-dm-mono), monospace'
                          }}
                        >
                          {item.numeral}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {/* Copyright Info */}
                <div className="flex flex-col text-[10px] font-semibold tracking-wider uppercase opacity-60 gap-1 pointer-events-auto">
                  <span>© 2026 • ZEYRO.</span>
                  <a href="/terms" className="hover:opacity-100 transition-opacity">Terms of Service</a>
                  <a href="/privacy" className="hover:opacity-100 transition-opacity">Privacy Policy</a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
    </>
  );
}
