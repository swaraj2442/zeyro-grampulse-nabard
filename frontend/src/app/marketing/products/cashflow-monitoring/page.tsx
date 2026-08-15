"use client";

import React, { useEffect } from 'react';
import Navigation from "@/components/Navigation";
import CashflowHero from "@/components/Cashflow/CashflowHero";
import RomanFooter from "@/components/Home/RomanFooter";

export default function CashflowMonitoringPage() {
  useEffect(() => {
    // Prevent browser from restoring previous scroll position on reload
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    // Force scroll to top
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#f4efe6] text-gray-900 font-sans selection:bg-[#35b89a] selection:text-white">
      <Navigation />

      <main>
        <CashflowHero />
      </main>
      
      <div className="bg-[#2596be] w-full">
        <RomanFooter />
      </div>
    </div>
  );
}
