"use client";

import React, { useEffect } from 'react';
import Navigation from "@/components/Navigation";
import BFSHero from "@/components/BFS/BFSHero";
import RomanFooter from "@/components/Home/RomanFooter";

export default function BehaviouralFinancialScorePage() {
  useEffect(() => {
    // Prevent browser from restoring previous scroll position on reload
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    // Force scroll to top
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="w-full min-h-screen bg-white text-gray-900 font-sans selection:bg-[#35b89a] selection:text-white">
      <Navigation />

      <main>
        <BFSHero />
      </main>
      <div className="bg-[#6321d2] w-full">
        <RomanFooter />
      </div>
    </div>
  );
}
