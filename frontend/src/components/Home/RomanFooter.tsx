"use client";

import React, { useState } from 'react';
import Link from 'next/link';

import { motion } from 'framer-motion';

export default function RomanFooter() {
  return (
    <footer className="w-full relative overflow-hidden bg-transparent text-white pt-24 pb-32 md:pb-48 selection:bg-slate-800 selection:text-white font-sans">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 mb-16 md:mb-24">
          {/* Left section */}
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            <h2 className="text-3xl md:text-[40px] font-bold tracking-tight mb-6 leading-[1.1] text-white font-serif">
              Built for the<br />Next Empire.
            </h2>
            <p className="text-white text-sm max-w-sm leading-relaxed">
              Zeyro is India's financial intelligence infrastructure. Powering the next generation of AI agents, credit platforms, and unified banking experiences.
            </p>
          </div>

          {/* Right section - Links Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div className="flex flex-col space-y-6">
              <h3 className="text-[10px] font-bold tracking-[0.15em] text-white uppercase">Product</h3>
              <div className="flex flex-col space-y-4 text-sm font-medium">
                <Link href="/products/behavioural-financial-score" className="text-white transition-colors">Credit Underwriting</Link>
                <Link href="/products/transaction-enrichment" className="text-white transition-colors">Transaction Enrichment</Link>
              </div>
            </div>

            <div className="flex flex-col space-y-6">
              <h3 className="text-[10px] font-bold tracking-[0.15em] text-white uppercase">Resources</h3>
              <div className="flex flex-col space-y-4 text-sm font-medium">
                <Link href="/docs" className="text-white transition-colors">Documentation</Link>
                {/* <a href="#" className="text-white transition-colors">Roadmap</a>
                <a href="#" className="text-white transition-colors">Case Studies</a> */}
              </div>
            </div>

            <div className="flex flex-col space-y-6">
              <h3 className="text-[10px] font-bold tracking-[0.15em] text-white uppercase">Company</h3>
              <div className="flex flex-col space-y-4 text-sm font-medium">
                {/* <Link href="#" className="text-white transition-colors">About Us</Link>
                <Link href="#" className="text-white transition-colors">Careers</Link> */}
                <Link href="/privacy" className="text-white transition-colors">Privacy</Link>
                <Link href="/terms" className="text-white transition-colors">Terms</Link>
              </div>
            </div>

            <div className="flex flex-col space-y-6">
              <h3 className="text-[10px] font-bold tracking-[0.15em] text-white uppercase">Connect</h3>
              <div className="flex flex-wrap gap-4 text-sm font-medium">
                {/* LinkedIn */}
                <a href="https://www.linkedin.com/company/zeyro/" target="_blank" rel="noopener noreferrer" className="text-white transition-transform active:scale-[0.92] origin-center duration-150 ease-out">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                {/* X (Twitter) */}
                <a href="https://x.com/zeyro_finance" target="_blank" rel="noopener noreferrer" className="text-white transition-transform active:scale-[0.92] origin-center duration-150 ease-out">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.965h-1.95z" />
                  </svg>
                </a>
                {/* Instagram */}
                <a href="https://www.instagram.com/zeyro_finance?igsh=MXB3N2UycG55ZzBlMw==" target="_blank" rel="noopener noreferrer" className="text-white transition-transform active:scale-[0.92] origin-center duration-150 ease-out">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex justify-end text-[10px] font-bold tracking-[0.15em] text-white uppercase relative z-20 -translate-y-6">
          © 2026 • ZEYRO INC. • ALL RIGHTS RESERVED
        </div>
      </div>

      {/* Massive text at the bottom */}
      <div className="absolute bottom-0 left-0 w-full flex justify-center items-end select-none pointer-events-none z-0">
        <h1 
          className="text-[15vw] text-white leading-none tracking-tighter m-0 p-0 translate-y-[10%]"
          style={{ 
            WebkitFontSmoothing: 'antialiased',
            fontFamily: 'var(--font-syne), sans-serif',
            fontWeight: 800
          }}
        >
          zeyro.
        </h1>
      </div>
    </footer>
  );
}
