"use client";

import React from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const USE_CASES = [
  {
    id: "01",
    category: "LENDING",
    title: "Credit Underwriting",
    description: "Go beyond traditional credit scores with behavioural intelligence, cashflow analysis, document understanding, and explainable risk signals for faster, more accurate lending decisions."
  },
  {
    id: "02",
    category: "BANKING",
    title: "Digital Banking Intelligence",
    description: "Deliver personalized banking experiences with transaction enrichment, behavioural insights, financial memory, and real-time customer intelligence."
  },
  {
    id: "03",
    category: "INSURANCE",
    title: "Underwriting & Risk Intelligence",
    description: "Assess risk using financial behaviour, income stability, spending patterns, claims signals, and contextual intelligence to improve underwriting accuracy."
  },
  {
    id: "04",
    category: "FINTECH",
    title: "Embedded Financial Intelligence",
    description: "Add transaction enrichment, merchant intelligence, categorization, behavioural analytics, and AI-powered financial insights to your products with a single integration."
  },
  {
    id: "05",
    category: "WEALTH",
    title: "Wealth & Investment Intelligence",
    description: "Build intelligent investment experiences with financial profiling, portfolio context, cashflow forecasting, and personalized recommendation engines."
  },
  {
    id: "06",
    category: "ACCOUNTING",
    title: "Accounting Automation",
    description: "Transform invoices, bank statements, GST records, and financial documents into structured data for reconciliation, bookkeeping, and reporting."
  },
  {
    id: "07",
    category: "AI AGENTS",
    title: "Financial AI Agents",
    description: "Power autonomous agents with persistent financial memory, contextual reasoning, decision workflows, and tool orchestration for complex financial tasks."
  },
  {
    id: "08",
    category: "FRAUD",
    title: "Fraud & Anomaly Detection",
    description: "Detect unusual behaviour, suspicious transactions, identity risks, and financial anomalies using adaptive behavioural intelligence and real-time monitoring."
  },
  {
    id: "09",
    category: "COMPLIANCE",
    title: "Compliance & Financial Operations",
    description: "Automate KYC, KYB, AML monitoring, document verification, audit workflows, and regulatory reporting with explainable AI."
  },
  {
    id: "10",
    category: "ENTERPRISE",
    title: "Enterprise Decision Intelligence",
    description: "Unify fragmented financial data across banking, ERP, accounting, payments, and internal systems to power organization-wide financial decision-making."
  }
];

export default function ZeyroUseCases() {
  const carouselRef = React.useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-[100rem] mx-auto px-6 md:pl-[280px] lg:pl-[320px] lg:pr-12 pt-6 lg:pt-12 pb-6 lg:pb-12 pointer-events-auto">
      {/* New Use Cases Section */}
      <div id="layer-9" className="w-full flex flex-col">
        {/* Header Bar */}
        <div className="w-full flex justify-between items-center mb-12">
          <div className="flex items-center gap-2 text-xs font-normal tracking-widest uppercase text-gray-500" style={{ fontFamily: 'var(--font-dm-mono), monospace' }}>
            <span className="text-[#8634DE]">{'>'}</span> USE CASES
          </div>
        </div>

        {/* Title and Controls */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-8 gap-6">
          <h2 className="text-[30px] font-space-grotesk font-normal tracking-tight text-slate-900 leading-[1.1]">
            Built for every <span className="text-[#8634DE]">financial intelligence workflow.</span><br />
            From underwriting to autonomous financial agents.
          </h2>
          
          <div className="flex items-center gap-4">
            <button className="text-[10px] font-bold tracking-widest uppercase border border-slate-200 px-4 py-2.5 hover:bg-slate-50 transition-colors flex items-center gap-2 text-slate-900">
              ALL USE CASES <span className="text-slate-400 font-sans text-base">↗</span>
            </button>
            <div className="flex">
              <button 
                onClick={scrollLeft}
                className="border border-slate-200 p-2.5 hover:bg-slate-50 active:bg-slate-100 transition-colors text-slate-900 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={scrollRight}
                className="border border-slate-900 p-2.5 hover:bg-slate-50 active:bg-slate-100 transition-colors text-slate-900 flex items-center justify-center relative -ml-[1px] cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Cards Row */}
        <div ref={carouselRef} className="flex gap-4 overflow-x-auto pb-6 snap-x w-full" style={{ scrollbarWidth: 'none' }}>
          {USE_CASES.map((useCase, index) => {
            const isFirst = index === 0;
            return (
              <div 
                key={useCase.id}
                className={`min-w-[280px] w-[280px] md:min-w-[320px] md:w-[320px] p-6 md:p-8 flex flex-col aspect-[3/4.2] rounded-sm snap-start shrink-0 ${
                  isFirst 
                    ? 'bg-[#8634DE] border border-transparent' 
                    : 'bg-[#f8f9fa] border border-slate-200'
                }`}
              >
                <div className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-4 flex items-center gap-1.5 ${isFirst ? 'text-white' : 'text-[#8634DE]'}`}>
                  <span className={`w-1.5 h-1.5 block ${isFirst ? 'bg-white' : 'bg-[#8634DE]'}`}></span> {useCase.id} / {useCase.category}
                </div>
                
                <h3 className={`text-2xl font-space-grotesk font-normal mb-4 leading-tight tracking-tight ${isFirst ? 'text-white' : 'text-slate-900'}`}>
                  {useCase.title}
                </h3>
                
                <p className={`font-dm-sans font-normal text-[13px] leading-relaxed max-w-[240px] ${isFirst ? 'text-white/90' : 'text-slate-500'}`}>
                  {useCase.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
