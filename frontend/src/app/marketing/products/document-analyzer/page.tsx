"use client";

import React, { useEffect } from 'react';
import Navigation from "@/components/Navigation";
import DocHero from "@/components/DocumentAnalyzer/DocHero";
import DocProblem from "@/components/DocumentAnalyzer/DocProblem";
import DocCapabilities from "@/components/DocumentAnalyzer/DocCapabilities";
import DocBenchmark from "@/components/DocumentAnalyzer/DocBenchmark";
import DocArchitecture from "@/components/DocumentAnalyzer/DocArchitecture";
import DocWorkflow from "@/components/DocumentAnalyzer/DocWorkflow";
import DocFAQ from "@/components/DocumentAnalyzer/DocFAQ";
import DocContact from "@/components/DocumentAnalyzer/DocContact";
import RomanFooter from '@/components/Home/RomanFooter';



export default function DocumentAnalyzerPage() {
  useEffect(() => {
    // Prevent browser from restoring previous scroll position on reload
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    // Force scroll to top
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="w-full min-h-screen bg-white text-gray-900 font-sans selection:bg-[#ff2a85] selection:text-white overflow-x-clip">
      <Navigation forceSolid={true} />
      <main>
        <DocHero />
        
        {/* Container for everything below the Hero, with its own grid lines */}
        <div className="relative w-full">
          {/* Grid Lines (Left & Right continuous lines) using highly performant CSS backgrounds instead of border-dashed to prevent scroll lag on huge heights */}
          <div className="absolute inset-0 top-[20px] pointer-events-none hidden lg:flex justify-center z-0">
            <div 
              className="w-full max-w-[1300px] px-6 lg:px-0 h-full"
              style={{
                backgroundImage: `repeating-linear-gradient(to bottom, rgb(226 226 226) 0px, rgb(226 226 226) 4px, transparent 4px, transparent 8px), repeating-linear-gradient(to bottom, rgb(226 226 226) 0px, rgb(226 226 226) 4px, transparent 4px, transparent 8px)`,
                backgroundPosition: 'left top, right top',
                backgroundSize: '1px 100%, 1px 100%',
                backgroundRepeat: 'no-repeat',
                backgroundClip: 'content-box'
              }}
            />
          </div>
          
          <DocProblem />
          <DocCapabilities />
          <DocBenchmark />
          <DocArchitecture />
          <DocWorkflow />
          <DocFAQ />
          <DocContact />
        </div>

        <div className="bg-[#6321d2] w-full">
                <RomanFooter />
        </div>
      </main>
    </div>
  );
}
