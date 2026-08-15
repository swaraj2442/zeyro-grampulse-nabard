"use client";

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import RomanFooter from '@/components/Home/RomanFooter';
import BFSGetStarted from '@/components/BFS/BFSGetStarted';

const customEaseOut: [number, number, number, number] = [0.23, 1, 0.32, 1];

const SECTIONS = [
  { id: 'introduction', title: '00. Introduction & API Promise' },
  { id: 'product-catalog', title: 'Product Catalog Overview' },
  { id: 'product-01', title: '01. Credit Underwriting' },
  { id: 'product-02', title: '02. Transaction Enrichment' },
  { id: 'product-03', title: '03. Cashflow Monitoring' },
  { id: 'product-04', title: '04. Device & Behavioural' },
  { id: 'product-05', title: '05. AI Agent Suite' },
  { id: 'product-06', title: '06. FinDoc Analyser' },
  { id: 'use-cases', title: '10 Workflow Use Cases' },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('introduction');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeProductTab, setActiveProductTab] = useState<string>('p1');

  const { scrollY } = useScroll();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  useMotionValueEvent(scrollY, 'change', () => {
    const sections = SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean);
    const targetLine = 220;

    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= targetLine) {
          setActiveSection(section.id);
          break;
        }
      }
    }
  });

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -100;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };



  return (
    <div className="w-full min-h-screen bg-[#fcfbf8] text-slate-900 font-dm-sans selection:bg-[#8634DE] selection:text-white">
      {/* Navigation */}
      <Navigation dynamicBlend={false} />

      {/* Hero Header */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 px-6 bg-gradient-to-b from-[#f5f1e8] to-[#fcfbf8] border-b border-slate-200/60 overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: customEaseOut }}
            className="flex flex-col items-start gap-4"
          >
            <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1 rounded-full bg-[#8634DE]/10 border border-[#8634DE]/20 text-[#8634DE] text-xs font-semibold tracking-wide uppercase">
              <span>Zeyro Developer Documentation</span>
              <span className="hidden sm:inline">•</span>
              <span>v1.0 • B2B India</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-slate-900 font-space-grotesk">
              Zeyro Intelligence Catalog
            </h1>

            <p className="text-lg md:text-xl text-slate-600 max-w-3xl leading-relaxed font-light">
              Six intelligence products. Ten use cases. One unified API — <em>built natively for Indian banks, NBFCs, fintechs, and digital lenders.</em>
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-3 text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold break-words">
                <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Sub-250ms API Latency Guarantee
              </span>
              <span className="hidden sm:inline">•</span>
              <span>10+ Intelligence Models</span>
              <span className="hidden sm:inline">•</span>
              <button onClick={() => setModalOpen(true)} className="text-[#8634DE] hover:underline font-semibold flex items-center gap-1">
                Request API Key &rarr;
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Layout Container */}
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Table of Contents Sidebar */}
          <aside className="lg:col-span-3 sticky top-28 hidden lg:block border-l-2 border-slate-200/80 pl-4 py-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 font-space-grotesk">
              Developer Index
            </p>
            <nav className="flex flex-col gap-2.5 text-sm">
              {SECTIONS.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollTo(section.id)}
                    className={`text-left transition-all duration-200 text-xs md:text-sm ${
                      isActive
                        ? 'text-[#8634DE] font-semibold translate-x-1'
                        : 'text-slate-500 hover:text-slate-900 font-normal'
                    }`}
                  >
                    {section.title}
                  </button>
                );
              })}
            </nav>

            <div className="mt-8 pt-6 border-t border-slate-200/60 space-y-3">
              <button
                onClick={() => setModalOpen(true)}
                className="w-full bg-[#8634DE] hover:bg-[#772ac9] text-white py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Request API Access</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          </aside>

          {/* Content Area */}
          <main className="lg:col-span-9 space-y-16">
            
            {/* 00. INTRODUCTION */}
            <section id="introduction" className="scroll-mt-28 space-y-6">
              <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 font-space-grotesk">
                  00 · Introduction
                </h2>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 text-slate-600">B2B • INDIA</span>
              </div>

              <h3 className="text-xl font-medium text-slate-800 font-space-grotesk">
                Financial intelligence infrastructure for banks.
              </h3>

              <p className="text-base md:text-[17px] leading-relaxed text-slate-700">
                Zeyro Intelligence is India&apos;s financial intelligence infrastructure — a suite of six intelligence products delivered via a unified API that enables banks, NBFCs, and fintechs to ingest financial data and transform it into production-ready intelligence.
              </p>

              <p className="text-base md:text-[17px] leading-relaxed text-slate-700">
                Where legacy fintech data platforms provide raw data pipes, Zeyro provides <strong>intelligence primitives</strong> — enriched, reasoned, explainable outputs that your systems can act on directly. Underwriting decisions, fraud signals, cashflow alerts, document parsing, and autonomous agent actions — all from a single integration.
              </p>

              {/* API Promise Callout Box */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900 to-slate-900 text-white shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300 font-space-grotesk">API Promise & Infrastructure</span>
                  <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/20 text-emerald-300 font-mono">99.9% Uptime SLA</span>
                </div>
                <p className="text-sm md:text-base text-slate-200 leading-relaxed font-light">
                  Sub-250ms API response. 10+ intelligence models. Enterprise SLA. TypeScript and Python SDKs. Deploy on Zeyro managed cloud, your cloud (AWS/Azure/GCP), or private on-premises infrastructure.
                </p>
              </div>
            </section>

            {/* PRODUCT CATALOG OVERVIEW TABLE */}
            <section id="product-catalog" className="scroll-mt-28 space-y-6">
              <div className="pb-3 border-b border-slate-200">
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 font-space-grotesk">
                  Product Catalog Overview
                </h2>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
                <table className="w-full text-left text-xs md:text-sm whitespace-nowrap md:whitespace-normal">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-space-grotesk uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">No.</th>
                      <th className="py-3.5 px-4 font-bold">Product</th>
                      <th className="py-3.5 px-4 font-bold">Description</th>
                      <th className="py-3.5 px-4 font-bold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {[
                      { no: '01', name: 'Credit Underwriting', desc: 'Behavioural credit intelligence beyond bureau scores', status: 'Generally Available', ga: true, id: 'product-01' },
                      { no: '02', name: 'Transaction Enrichment', desc: 'Real-time merchant classification and behavioural signals', status: 'Generally Available', ga: true, id: 'product-02' },
                      { no: '03', name: 'Cashflow Monitoring', desc: 'Continuous AA-linked income and liability tracking', status: 'Private Beta', ga: false, id: 'product-03' },
                      { no: '04', name: 'Device & Behavioural Intelligence', desc: 'Alternate data for thin-file and NTC borrowers', status: 'Private Beta', ga: false, id: 'product-04' },
                      { no: '05', name: 'AI Agent Suite', desc: 'Autonomous financial agents for complex decisioning workflows', status: 'Private Beta', ga: false, id: 'product-05' },
                      { no: '06', name: 'FinDoc Analyser', desc: 'Document parsing for bank statements, GST, ITR, and financial filings', status: 'Private Beta', ga: false, id: 'product-06' },
                    ].map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors cursor-pointer" onClick={() => scrollTo(p.id)}>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#8634DE]">{p.no}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900 font-space-grotesk">{p.name}</td>
                        <td className="py-3.5 px-4 text-slate-600">{p.desc}</td>
                        <td className="py-3.5 px-4 text-right">
                          <span className={`inline-block whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-semibold ${p.ga ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-purple-50 text-purple-700 border border-purple-200'}`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* PRODUCT 01: CREDIT UNDERWRITING */}
            <section id="product-01" className="scroll-mt-28 space-y-6">
              <div className="pb-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 font-space-grotesk">
                  Product 01 · Credit Underwriting
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Generally Available (GA)
                </span>
              </div>

              <p className="text-base md:text-lg italic text-slate-600 font-light">
                Move beyond bureau scores. Behavioural intelligence, cashflow analysis, and explainable risk signals for faster, more accurate lending decisions.
              </p>

              <p className="text-base md:text-[17px] leading-relaxed text-slate-700">
                India&apos;s 9,500+ NBFCs and digital lenders collectively serve a credit market of over ₹54 trillion in AUM — yet the MSME credit gap stands at $380 billion. The majority of this gap exists because bureau-only underwriting cannot assess thin-file or new-to-credit (NTC) borrowers. Zeyro&apos;s Credit Underwriting product closes this gap.
              </p>

              <h4 className="text-lg font-semibold text-slate-900 font-space-grotesk pt-2">Core Capabilities</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Behavioural Financial Score (BFS)', desc: 'Proprietary risk score trained on UPI transaction patterns, NACH compliance, account balance velocity, and payment behaviour — specifically for thin-file MSME & NTC segments.' },
                  { title: 'Multi-Bureau Intelligence', desc: 'Normalized pull and reconciliation across all 4 RBI-licensed bureaus: CIBIL TransUnion, CRIF High Mark, Experian, and Equifax.' },
                  { title: 'AA-Powered Cashflow Underwriting', desc: 'Bank account data sourced via RBI Account Aggregator framework (FIP-FIU consent model) parsed into income, EMI obligations, and surplus.' },
                  { title: 'GST Intelligence Layer', desc: 'GSTR-1 & GSTR-3B cross-validated against AA bank credits. Revenue declared vs. revenue received reconciliation.' },
                  { title: 'AI-Assisted CAM Output', desc: 'Structured Credit Assessment Memo equivalent with risk triggers, income validation, and eligibility estimates aligned with NBFC policies.' },
                  { title: 'Explainable Decisioning', desc: 'Fully traceable source data outputs designed for RBI model explainability expectations, CICRA 2005, and DPDP Act 2023 compliance.' },
                ].map((cap, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
                    <h5 className="text-sm font-semibold text-slate-900 font-space-grotesk">{cap.title}</h5>
                    <p className="text-xs md:text-sm text-slate-600 leading-normal">{cap.desc}</p>
                  </div>
                ))}
              </div>

              {/* Supported Lending Products */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <h5 className="text-sm font-semibold text-slate-900 font-space-grotesk">Supported Lending Products:</h5>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    'MSME Working Capital', 'Consumer Personal Loans', 'Microfinance & JLG', 
                    'Supply Chain Finance', 'Commercial Lending', 'Co-lending FLDG', 'Portfolio Review (EWS)'
                  ].map((item, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* API Reference Table */}
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                <div className="bg-slate-900 px-4 py-3 text-white font-mono text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                  <span className="break-words">POST /v1/underwriting/score</span>
                  <span className="text-slate-400 sm:text-white">Avg Latency &lt; 250ms</span>
                </div>
                <div className="p-4 text-xs md:text-sm space-y-3 md:space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 border-b border-slate-100 pb-3 md:pb-2 gap-1 md:gap-0">
                    <span className="font-semibold text-slate-500">Inputs</span>
                    <span className="md:col-span-2 text-slate-800 font-mono break-words">AA consent token, bureau pull consent, GSTIN, PAN, Aadhaar (KYC)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 border-b border-slate-100 pb-3 md:pb-2 gap-1 md:gap-0">
                    <span className="font-semibold text-slate-500">Outputs</span>
                    <span className="md:col-span-2 text-slate-800 font-mono break-words">BFS score (0–1000), risk tier, income estimate, CAM draft, anomaly flags</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-0">
                    <span className="font-semibold text-slate-500">SDKs</span>
                    <span className="md:col-span-2 text-slate-800 font-mono break-words">Python (zeyro-python), TypeScript (zeyro-js)</span>
                  </div>
                </div>
              </div>
            </section>

            {/* PRODUCT 02: TRANSACTION ENRICHMENT */}
            <section id="product-02" className="scroll-mt-28 space-y-6">
              <div className="pb-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 font-space-grotesk">
                  Product 02 · Transaction Enrichment
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Generally Available (GA)
                </span>
              </div>

              <p className="text-base md:text-lg italic text-slate-600 font-light">
                Transform raw transaction strings into real-time behavioural signals — merchant identity, category, intent, and anomaly context.
              </p>

              <p className="text-base md:text-[17px] leading-relaxed text-slate-700">
                Every UPI transfer, NEFT credit, debit card spend, or NACH debit is raw text. Zeyro&apos;s Transaction Enrichment product converts this unstructured ledger data into structured intelligence — merchant identity, spending category, intent classification, behavioural patterns, and anomaly signals — in real time.
              </p>

              <h4 className="text-lg font-semibold text-slate-900 font-space-grotesk pt-2">Core Capabilities</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Merchant Intelligence', desc: 'Normalize & identify merchants from raw UPI VPA strings, narrations, and card swipes. Covers 10M+ Indian merchant identities.' },
                  { title: 'Spending Category Taxonomy', desc: 'Tag transactions to structured categories: F&B, travel, EMI, rent, utilities, healthcare, education, for retail & MSME.' },
                  { title: 'Income & Credit Detection', desc: 'Identify salary credits, UPI business receipts, GST settlements, and loan disbursals from transaction narratives.' },
                  { title: 'Behavioural Signal Extraction', desc: 'Derive signals: late-night spend velocity, recurring vs. impulse ratio, merchant loyalty index, and peer benchmarking.' },
                  { title: 'Anomaly & Velocity Flags', desc: 'Real-time alerts for high transaction velocity, unusual merchant categories, sudden drawdowns, and round-number transfers.' },
                  { title: 'Longitudinal Financial Memory', desc: 'Persistent financial context layer that improves over sessions — enabling personalization and predictive modeling.' },
                ].map((cap, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
                    <h5 className="text-sm font-semibold text-slate-900 font-space-grotesk">{cap.title}</h5>
                    <p className="text-xs md:text-sm text-slate-600 leading-normal">{cap.desc}</p>
                  </div>
                ))}
              </div>

              {/* API Reference Table */}
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                <div className="bg-slate-900 px-4 py-3 text-white font-mono text-xs font-semibold flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-0">
                  <span className="break-words">POST /v1/enrich/transaction (single) · POST /v1/enrich/batch (bulk)</span>
                  <span className="text-slate-400 md:text-white shrink-0">Throughput: 10M tx/day</span>
                </div>
                <div className="p-4 text-xs md:text-sm space-y-3 md:space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 border-b border-slate-100 pb-3 md:pb-2 gap-1 md:gap-0">
                    <span className="font-semibold text-slate-500">Inputs</span>
                    <span className="md:col-span-2 text-slate-800 font-mono break-words">Raw narrative string, amount, date, account ID</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-0">
                    <span className="font-semibold text-slate-500">Outputs</span>
                    <span className="md:col-span-2 text-slate-800 font-mono break-words">Merchant name, MCC category, intent tag, income flag, anomaly score</span>
                  </div>
                </div>
              </div>
            </section>

            {/* PRODUCT 03: CASHFLOW MONITORING */}
            <section id="product-03" className="scroll-mt-28 space-y-6">
              <div className="pb-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 font-space-grotesk">
                  Product 03 · Cashflow Monitoring
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                  Private Beta
                </span>
              </div>

              <p className="text-base md:text-lg italic text-slate-600 font-light">
                Continuous, AA-linked income and liability tracking for lenders, banks, and wealth platforms.
              </p>

              <p className="text-base md:text-[17px] leading-relaxed text-slate-700">
                Static bank statement analysis gives you a snapshot. Cashflow Monitoring gives you a live feed — continuously tracking income patterns, EMI obligations, NACH mandate compliance, account balance trends, and early warning triggers across an AA-consented borrower population.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Continuous AA-Linked Monitoring', desc: 'Persist AA consent for real-time or scheduled refreshes via FIP-FIU without repeated borrower friction.' },
                  { title: 'EMI & Obligation Intelligence', desc: 'Map outgoing NACH mandates & standing instructions. Calculate dynamic FOIR (Fixed Obligation to Income Ratio).' },
                  { title: 'Early Warning System (EWS)', desc: 'Webhook alerts for NACH bounces, income drops > X%, balance dips, or new high-value debits.' },
                  { title: 'Portfolio-Level Dashboards', desc: 'Aggregate cashflow intelligence across your monitored portfolio. Run cohort analysis & identify systemic stress.' },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
                    <h5 className="text-sm font-semibold text-slate-900 font-space-grotesk">{item.title}</h5>
                    <p className="text-xs md:text-sm text-slate-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* PRODUCT 04: DEVICE & BEHAVIOURAL */}
            <section id="product-04" className="scroll-mt-28 space-y-6">
              <div className="pb-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 font-space-grotesk">
                  Product 04 · Device & Behavioural Intelligence
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                  Private Beta
                </span>
              </div>

              <p className="text-base md:text-lg italic text-slate-600 font-light">
                Alternate data signals for thin-file and NTC borrowers — device metadata, app behaviour, and digital footprint analysis.
              </p>

              <p className="text-base md:text-[17px] leading-relaxed text-slate-700">
                India has 500 million+ people with thin or no credit files. Device & Behavioural Intelligence provides alternate data signals that extend underwriting reach into NTC, rural, and informal segments where bureau data is structurally absent.
              </p>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs md:text-sm text-amber-950 flex items-start gap-3">
                <span className="font-bold text-amber-800 shrink-0 font-space-grotesk">BOOSTER SIGNAL:</span>
                <span>Designed to be used as a booster alongside the BFS Credit Underwriting score for NTC & thin-file borrowers.</span>
              </div>
            </section>

            {/* PRODUCT 05: AI AGENT SUITE */}
            <section id="product-05" className="scroll-mt-28 space-y-6">
              <div className="pb-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 font-space-grotesk">
                  Product 05 · AI Agent Suite
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                  Private Beta
                </span>
              </div>

              <p className="text-base md:text-lg italic text-slate-600 font-light">
                Autonomous financial agents with persistent memory, contextual reasoning, and tool orchestration for complex financial workflows.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Credit Sentinel', role: 'Autonomous Underwriting Agent' },
                  { name: 'Fraud Watchdog', role: 'Real-time Fraud Investigation Agent' },
                  { name: 'Collections Oracle', role: 'Intelligent Collections Agent' },
                  { name: 'Wellness Advisor', role: 'Consumer Financial Health Agent' },
                  { name: 'Compliance Guard', role: 'Regulatory & KYC Monitoring Agent' },
                  { name: 'Onboarding Bot', role: 'Hinglish & Regional Onboarding Agent' },
                ].map((agent, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
                    <h5 className="text-sm font-semibold text-[#8634DE] font-space-grotesk">{agent.name}</h5>
                    <p className="text-xs text-slate-600">{agent.role}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* PRODUCT 06: FINDOC ANALYSER */}
            <section id="product-06" className="scroll-mt-28 space-y-6">
              <div className="pb-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 font-space-grotesk">
                  Product 06 · FinDoc Analyser
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                  Private Beta
                </span>
              </div>

              <p className="text-base md:text-lg italic text-slate-600 font-light">
                Parse and extract structured intelligence from bank statements, GST filings, ITR, financial statements, payslips, and KYC documents in seconds.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  'Bank Statement Analyser', 'GST Analyser (GSTR 1/3B)', 'ITR & Form 26AS',
                  'P&L & Balance Sheet', 'Payslip & EPFO Analyser', 'KYC & KYB Document Parser'
                ].map((doc, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 text-center">
                    {doc}
                  </div>
                ))}
              </div>
            </section>

            {/* 10 WORKFLOW USE CASES MATRIX */}
            <section id="use-cases" className="scroll-mt-28 space-y-6">
              <div className="pb-3 border-b border-slate-200">
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 font-space-grotesk">
                  10 Workflow Use Cases
                </h2>
              </div>

              <div className="space-y-3">
                {[
                  { id: '01', domain: 'Lending', name: 'Credit Underwriting', desc: 'Go beyond bureau scores with behavioural intelligence, cashflow analysis, and explainable risk signals across MSME & consumer.' },
                  { id: '02', domain: 'Banking', name: 'Digital Banking Intelligence', desc: 'Deliver personalized banking experiences with transaction enrichment and real-time customer intelligence.' },
                  { id: '03', domain: 'Insurance', name: 'Underwriting & Risk Intelligence', desc: 'Assess risk using financial behaviour, income stability, spending patterns, and claims signals.' },
                  { id: '04', domain: 'Fintech', name: 'Embedded Financial Intelligence', desc: 'Add transaction enrichment, merchant intelligence, and categorization to any app with one API.' },
                  { id: '05', domain: 'Wealth', name: 'Wealth & Investment Intelligence', desc: 'Build intelligent investment experiences with financial profiling and cashflow forecasting.' },
                  { id: '06', domain: 'Accounting', name: 'Accounting Automation', desc: 'Transform invoices, bank statements, and GST records into structured data for reconciliation.' },
                  { id: '07', domain: 'AI Agents', name: 'Financial AI Agents', desc: 'Power autonomous agents with persistent financial memory and decision workflows.' },
                  { id: '08', domain: 'Fraud', name: 'Fraud & Anomaly Detection', desc: 'Detect unusual behaviour, suspicious transactions, and financial anomalies in real-time.' },
                  { id: '09', domain: 'Compliance', name: 'Compliance & Ops', desc: 'Automate KYC, KYB, AML monitoring, and audit workflows aligned to RBI & DPDP Act.' },
                  { id: '10', domain: 'Enterprise', name: 'Enterprise Decision Intelligence', desc: 'Unify fragmented financial data across banking, ERP, and internal systems.' },
                ].map((uc, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm flex items-start gap-4">
                    <span className="font-mono text-xs font-bold text-[#8634DE] shrink-0 mt-0.5">{uc.id}</span>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-900 font-space-grotesk">{uc.name}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">{uc.domain}</span>
                      </div>
                      <p className="text-xs md:text-sm text-slate-600">{uc.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>



          </main>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#6321d2]">
        <RomanFooter />
      </div>

      {/* Waitlist / Get Started Modal */}
      <BFSGetStarted isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
