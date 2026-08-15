"use client";

import React from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';

const PRICING_TIERS = [
  {
    name: "Developer",
    price: "$0",
    period: "forever",
    description: "Everything you need to start building and testing agents in development.",
    features: [
      "10,000 API requests / month",
      "Standard latency (500ms)",
      "Basic context retention",
      "Community support",
      "Standard models"
    ],
    buttonText: "Start building for free",
    highlight: false,
    delay: 0.1
  },
  {
    name: "Scale",
    price: "$49",
    period: "per month",
    description: "For production applications requiring low latency and advanced reasoning.",
    features: [
      "100,000 API requests / month",
      "Sub-300ms graph traversal",
      "Infinite context retention",
      "Priority email support",
      "Custom model fine-tuning"
    ],
    buttonText: "Upgrade to Scale",
    highlight: true,
    delay: 0.2
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "annual",
    description: "Sovereign deployment, SLA guarantees, and dedicated engineering support.",
    features: [
      "Unlimited API requests",
      "Sub-100ms dedicated endpoints",
      "VPC / On-prem deployment",
      "Dedicated Slack channel",
      "SOC2 & HIPAA compliance"
    ],
    buttonText: "Contact Sales",
    highlight: false,
    delay: 0.3
  }
];

export default function ZeyroPricing() {
  const containerRef = React.useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <div ref={containerRef} className="w-full flex flex-col max-w-[100rem] mx-auto px-6 md:pl-[280px] lg:pl-[320px] lg:pr-12 py-24 z-40 relative">
      {/* Header Bar */}
      <div className="w-full flex justify-between items-center mb-12">
        <div className="flex items-center gap-2 text-xs font-normal tracking-widest uppercase text-gray-500" style={{ fontFamily: 'var(--font-dm-mono), monospace' }}>
          <span className="text-[#8634DE]">{'>'}</span> PRICING
        </div>
      </div>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="w-full flex flex-col mb-16 max-w-5xl mx-auto"
      >
        <div className="text-center flex flex-col items-center">
          <h2 className="text-[30px] font-space-grotesk font-normal tracking-tight text-slate-900 mb-6 leading-[1.1] text-center">
            Priced for <span className="text-[#8634DE]">scale.</span>
          </h2>
          <p className="text-slate-500 text-[13px] font-dm-sans font-normal max-w-2xl mx-auto leading-relaxed text-center">
            Start for free, upgrade when you need production latency and limitless context. No hidden fees, no complex tiers.
          </p>
        </div>
      </motion.div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full max-w-lg xl:max-w-5xl mx-auto">
        {PRICING_TIERS.map((tier, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.5, delay: tier.delay, ease: [0.23, 1, 0.32, 1] }}
            className={`relative flex flex-col rounded-3xl p-8 backdrop-blur-sm transition-transform duration-300 ease-out hover:-translate-y-2 group ${
              tier.highlight 
                ? 'bg-white border border-[#8634DE]/30 shadow-[0_10px_40px_-10px_rgba(134,52,222,0.15)] z-10 scale-105 xl:-my-4' 
                : 'bg-white border border-slate-200 hover:border-slate-300'
            }`}
          >
            {/* Highlight Glow Effect */}
            {tier.highlight && (
              <div className="absolute inset-0 bg-gradient-to-b from-[#8634DE]/10 to-transparent rounded-3xl pointer-events-none" />
            )}
            
            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">
              <h3 className="text-xl font-space-grotesk font-medium text-slate-900 mb-2">{tier.name}</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-space-grotesk font-medium text-slate-900">{tier.price}</span>
                <span className="text-sm font-dm-mono text-slate-500 uppercase tracking-wider">{tier.period}</span>
              </div>
              <p className="text-sm font-dm-sans text-slate-500 mb-8 min-h-[40px] leading-relaxed">
                {tier.description}
              </p>
              
              <ul className="flex flex-col gap-4 mb-8 flex-grow">
                {tier.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-3">
                    <div className={`mt-0.5 rounded-full p-1 ${tier.highlight ? 'bg-[#8634DE]/20' : 'bg-slate-100'}`}>
                      <Check className={`w-3 h-3 ${tier.highlight ? 'text-[#8634DE]' : 'text-slate-500'}`} strokeWidth={3} />
                    </div>
                    <span className="text-sm font-dm-sans text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>

            <button 
              className={`w-full py-3.5 px-4 rounded-xl font-dm-sans text-[13px] font-semibold tracking-wide flex items-center justify-center gap-2 transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] relative z-10 ${
                tier.highlight
                  ? 'bg-[#8634DE] hover:bg-[#722bc2] text-white shadow-lg'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
              }`}
            >
              {tier.buttonText}
              <ArrowRight className="w-4 h-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
            </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
