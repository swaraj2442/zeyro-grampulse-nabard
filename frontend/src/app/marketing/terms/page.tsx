"use client";
import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useMotionValue, useMotionValueEvent } from 'framer-motion';
import Footer from '@/components/Footer';
import Image from 'next/image';
import headerImage from '@/assests/images/terms_bg.png';

const Section = ({ id, title, children }: { id: string, title: string, children: React.ReactNode }) => {
  return (
    <section id={id} className="mb-12 md:mb-16 scroll-mt-40 md:scroll-mt-32">
      <div className="mb-4 md:mb-6 relative pb-3 md:pb-4 border-b border-slate-200">
        <h2 className="text-xl md:text-2xl text-slate-900 tracking-tight font-space-grotesk">{title}</h2>
      </div>
      <div className="text-[15px] md:text-base leading-relaxed">
        {children}
      </div>
    </section>
  );
};

export default function TermsOfService() {
  const links = [
    { id: "introduction", label: "Introduction" },
    { id: "1-definitions", label: "1. Definitions" },
    { id: "2-acceptance-and-updates-to-terms", label: "2. Acceptance And Updates To Terms" },
    { id: "3-the-services", label: "3. The Services" },
    { id: "4-eligibility-and-registration", label: "4. Eligibility And Registration" },
    { id: "5-acceptable-use", label: "5. Acceptable Use" },
    { id: "6-customer-data-outputs-and-consent", label: "6. Customer Data, Outputs, And Consent" },
    { id: "7-consortium-data-and-model-improvement", label: "7. Consortium Data And Model Improvement" },
    { id: "8-intellectual-property", label: "8. Intellectual Property" },
    { id: "9-confidentiality", label: "9. Confidentiality" },
    { id: "10-fees-and-payment", label: "10. Fees And Payment" },
    { id: "11-third-party-links-and-integrations", label: "11. Third-Party Links And Integrations" },
    { id: "12-warranties-and-disclaimers", label: "12. Warranties And Disclaimers" },
    { id: "13-indemnification-and-limitation-of-liability", label: "13. Indemnification And Limitation Of Liability" },
    { id: "14-term-suspension-and-termination", label: "14. Term, Suspension, And Termination" },
    { id: "15-governing-law-and-dispute-resolution", label: "15. Governing Law And Dispute Resolution" },
    { id: "16-grievance-redressal", label: "16. Grievance Redressal" },
    { id: "17-miscellaneous", label: "17. Miscellaneous" }
  ];

  const [activeSection, setActiveSection] = useState<string>("introduction");
  
  const { scrollY } = useScroll();
  const activeSectionProgress = useMotionValue(0);

  useMotionValueEvent(scrollY, "change", () => {
    const sections = Array.from(document.querySelectorAll("section[id]"));
    if (sections.length === 0) return;
    
    let current = sections[0].id;
    const targetLine = 200;

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const rect = section.getBoundingClientRect();
      if (rect.top <= targetLine) {
        current = section.id;
      } else {
        break;
      }
    }

    const isBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
    if (isBottom) {
      current = sections[sections.length - 1].id;
    }

    setActiveSection((prev) => (prev !== current ? current : prev));

    const el = document.getElementById(current);
    if (el) {
      const rect = el.getBoundingClientRect();
      const windowHalf = window.innerHeight / 2;
      const scrolled = windowHalf - rect.top;
      let p = scrolled / rect.height;
      p = Math.max(0, Math.min(1, p));
      
      if (isBottom && current === links[links.length - 1].id) {
        p = 1;
      }
      
      activeSectionProgress.set(p);
    }
  });

  useEffect(() => {
    const sidebar = document.getElementById('sidebar-container');
    if (sidebar) {
      // Find the relative wrapper div to get correct height calculations
      const activeEl = sidebar.querySelector(`a[href="#${activeSection}"]`)?.parentElement;
      if (activeEl) {
        const activeRect = activeEl.getBoundingClientRect();
        const sidebarRect = sidebar.getBoundingClientRect();
        
        // Check if the item is out of view (with a 20px buffer)
        if (activeRect.top < sidebarRect.top + 20 || activeRect.bottom > sidebarRect.bottom - 20) {
          const scrollTop = sidebar.scrollTop + (activeRect.top - sidebarRect.top) - (sidebar.offsetHeight / 2) + (activeRect.height / 2);
          sidebar.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
          });
        }
      }
    }
  }, [activeSection]);

  return (
    <div className="min-h-screen bg-white font-dm-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Hero Section */}
      <div className="pt-24 pb-24 px-6 md:px-12 border-b border-slate-100 relative overflow-hidden">
        <Image src={headerImage} alt="Header Background" fill className="object-cover object-center pointer-events-none" priority />
        <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center justify-center">
          <h1 className="text-5xl md:text-6xl text-slate-900 mb-6 tracking-tight font-space-grotesk font-medium">Terms of Service</h1>
          <p className="text-sm md:text-base text-slate-600 font-dm-mono border-b border-slate-300 inline-block pb-1">Effective as of 17/07/2026</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-12 md:py-24">
        
        {/* Mobile Navigation Dropdown */}
        <div className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md py-4 px-6 -mx-6 mb-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] border-b border-slate-100 transition-all">
          <div className="relative">
            <select 
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-3.5 pr-10 outline-none appearance-none font-dm-sans transition-all cursor-pointer"
              value={activeSection}
              onChange={(e) => {
                const id = e.target.value;
                const element = document.getElementById(id);
                if (element) {
                  const offset = 120;
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - offset;
                  window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
              }}
            >
              <option value="" disabled>Jump to section...</option>
              {links.map(link => (
                <option key={link.id} value={link.id}>{link.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 md:gap-24 relative">
          
          {/* Sidebar */}
          <aside className="hidden md:block w-64 shrink-0">
            <div id="sidebar-container" className="sticky top-32 max-h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar pr-2">
              <nav className="flex flex-col font-dm-sans w-full">
                {links.map((link) => {
                  const isActive = activeSection === link.id;
                  return (
                    <div key={link.id} className="relative border-b border-slate-200">
                      <a
                        href={`#${link.id}`}
                        className={`block py-4 text-sm transition-colors duration-200 ease-out ${
                          isActive ? 'text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {link.label}
                      </a>
                      {isActive && (
                        <motion.div
                          className="absolute bottom-[-1px] left-0 h-[2px] bg-[#38BDF8] w-full"
                          style={{ scaleX: activeSectionProgress, transformOrigin: "left" }}
                        />
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-3xl">
            <section id="introduction" className="mb-16">
              <p className="mb-4 text-slate-600">ARTHAZEYRO TECHNOLOGIES PRIVATE LIMITED (&quot;Company,&quot; &quot;Zeyro,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), operates the website and platform available at <strong><a href="https://intelligence.zeyro.in/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">Zeyro</a></strong> (or such other domain as may be designated by the Company) and any related dashboards, APIs, SDKs, documentation, and developer tools made available in connection therewith (collectively, the &quot;Platform&quot;).</p>
              <p className="mb-4 text-slate-600">Please read these Terms of Service (&quot;Terms&quot; or &quot;TOS&quot;) carefully before accessing or using the Platform or availing of any Services (as defined below). By accessing, browsing, or using the Platform, or by clicking &quot;I Agree&quot; (or similar affirmation) during account creation, you irrevocably and unconditionally agree to be bound by these Terms, read together with our Privacy Policy available at <strong><a href="/privacy" className="hover:text-blue-600 transition-colors">privacy</a></strong>, any Data Processing Agreement executed with you, and any other applicable policies referenced herein (collectively, the &quot;Terms and Conditions&quot;). These Terms and Conditions govern the relationship between the Company and the User in connection with use of the Platform and shall supersede all prior oral or written communications on the subject.</p>
              <p className="mb-4 text-slate-600">THIS DOCUMENT IS AN ELECTRONIC RECORD in terms of the Information Technology Act, 2000, the rules made thereunder, and applicable provisions of the Indian Contract Act, 1872 and the Bharatiya Sakshya Adhiniyam, 2023, as amended. This electronic record is generated by a computer system and does not require any physical or digital signature.</p>
              <p className="mb-4 text-slate-800 font-semibold">IF YOU DO NOT AGREE TO BE BOUND BY THESE TERMS, PLEASE DO NOT ACCESS OR USE THE PLATFORM OR SERVICES.</p>
            </section>

            <Section id="1-definitions" title="1. DEFINITIONS">
              <p className="mb-4 text-slate-600"><strong className="text-slate-800">&quot;API&quot;</strong> means Zeyro&apos;s application programming interface(s), SDKs, and related developer tools made available to Users under these Terms or a separate written agreement.</p>
              <p className="mb-4 text-slate-600"><strong className="text-slate-800">&quot;Company Materials&quot;</strong> means all content, materials, models, scores, documentation, software, interfaces, designs, trademarks, and other proprietary assets made available on or through the Platform, whether owned by or licensed to the Company.</p>
              <p className="mb-4 text-slate-600">&quot;Confidential Information&quot; has the meaning set out in Clause 9.</p>
              <p className="mb-4 text-slate-600"><strong className="text-slate-800">&quot;Customer Data&quot;</strong> means any data, including Financial Information, that a User or its End Users submit to, or that is accessed by Zeyro through, the Platform or Services in connection with a User&apos;s use of the Services.</p>
              <p className="mb-4 text-slate-600"><strong className="text-slate-800">&quot;End User&quot;</strong> means an individual or entity who is a customer, applicant, or account holder of a User, and in respect of whom Financial Information is processed through the Services pursuant to valid consent obtained by the User or through the Account Aggregator framework.</p>
              <p className="mb-4 text-slate-600">&quot;Financial Information&quot; shall have the meaning ascribed to it under the Reserve Bank of India&apos;s Account Aggregator framework, and includes bank statements, UPI transaction data, GST data, bureau data, and other financial data processed through the Services.</p>
              <p className="mb-4 text-slate-600"><strong className="text-slate-800">&quot;Force Majeure Event&quot;</strong> means any event beyond the reasonable control of the Company, including unavailability of communication systems, cyberattack, pandemic, natural disaster, act of God, war, civil unrest, or governmental action.</p>
              <p className="mb-4 text-slate-600"><strong className="text-slate-800">&quot;Output&quot;</strong> means the scores, signals, assessments, risk narratives, adverse action codes, insights, or other derived intelligence artifacts generated by the Services based on Customer Data.</p>
              <p className="mb-4 text-slate-600"><strong className="text-slate-800">&quot;Platform&quot;</strong> means the website, dashboard, developer console, documentation, and any related web-based interfaces operated by the Company.</p>
              <p className="mb-4 text-slate-600"><strong className="text-slate-800">&quot;Services&quot;</strong> means the API-based financial intelligence services made available by the Company as described in Clause 3 and in the applicable order form, subscription plan, or partner agreement.</p>
              <p className="mb-4 text-slate-600"><strong className="text-slate-800">&quot;User,&quot; &quot;you,&quot; or &quot;your&quot;</strong> means any natural or legal person who registers for, accesses, or uses the Platform or Services. Where a natural person accesses the Platform on behalf of a business entity, references to &quot;User&quot; include that entity, and the natural person represents that they are authorized to bind that entity.</p>
            </Section>

            <Section id="2-acceptance-and-updates-to-terms" title="2. ACCEPTANCE AND UPDATES TO TERMS">
              <p className="mb-4 text-slate-600">2.1 By registering on, accessing, or using the Platform, you confirm that you have read, understood, and agree to be bound by these Terms.</p>
              <p className="mb-4 text-slate-600">2.2 The Company may amend, modify, or update these Terms at any time, with or without prior notice. The updated Terms shall be effective immediately upon posting on the Platform. You are responsible for reviewing these Terms periodically. Continued use of the Platform after any update constitutes your acceptance of the revised Terms.</p>
              <p className="mb-4 text-slate-600">2.3 Where changes are material (e.g., changes affecting data processing, liability, or pricing structure), the Company will make reasonable efforts to notify registered Users via email or in-Platform notice.</p>
            </Section>

            <Section id="3-the-services" title="3. THE SERVICES">
              <p className="mb-4 text-slate-600">3.1 Zeyro provides API-based financial intelligence infrastructure to regulated and unregulated business entities, including banks, NBFCs, fintechs, insurers, wealth platforms, and other enterprises (&quot;Business Users&quot;). The Services include, without limitation:</p>
              <p className="mb-4 text-slate-600">Transaction enrichment and merchant intelligence;</p>
              <p className="mb-4 text-slate-600">Behavioural intelligence, cashflow analysis, and credit signal generation (including the Behavioural Finance Score, Repayment Propensity Score, and Ability-to-Pay Index or their successor products);</p>
              <p className="mb-4 text-slate-600">Document intelligence and data extraction;</p>
              <p className="mb-4 text-slate-600">Fraud and anomaly detection signals;</p>
              <p className="mb-4 text-slate-600">AI agent infrastructure and orchestration tools; and</p>
              <p className="mb-4 text-slate-600">Such other Services as may be described in the applicable documentation, order form, or partner agreement.</p>
              <p className="mb-4 text-slate-600">3.2 Zeyro is not a lender, credit bureau, Account Aggregator, Loan Origination System, or Loan Management System. Zeyro does not make lending decisions, extend credit, or interact directly with End Users. Outputs generated by the Services are decision-support signals only; the User retains sole responsibility and discretion for any decision made using such Outputs, including credit, underwriting, fraud, or compliance decisions.</p>
              <p className="mb-4 text-slate-600">3.3 Where Zeyro&apos;s Services involve processing of Financial Information sourced via the Account Aggregator framework, GST systems, bureau data, or similar regulated data-sharing frameworks, Zeyro acts strictly as a technology and infrastructure service provider. Zeyro processes such data on the instructions of, and on behalf of, the User, and does not independently determine the purpose of processing such End User data.</p>
              <p className="mb-4 text-slate-600">3.4 Access to specific Services, rate limits, SLAs, and pricing shall be governed by the applicable order form, subscription plan, or partner agreement executed between the User and the Company. In the event of a conflict between these Terms and an executed order form or partner agreement, the order form or partner agreement shall prevail with respect to the subject matter thereof.</p>
            </Section>

            <Section id="4-eligibility-and-registration" title="4. ELIGIBILITY AND REGISTRATION">
              <p className="mb-4 text-slate-600">4.1 The Platform and Services are intended solely for use by business entities and their authorized representatives for legitimate business purposes. The Platform is not intended for use by consumers or individuals for personal, household, or non-commercial purposes.</p>
              <p className="mb-4 text-slate-600">4.2 By registering, you represent that: (a) you are at least 18 years of age and legally competent to contract under the Indian Contract Act, 1872; (b) if registering on behalf of an organization, you have the authority to bind that organization to these Terms; and (c) all registration information provided by you is accurate, current, and complete.</p>
              <p className="mb-4 text-slate-600">4.3 You are responsible for maintaining the confidentiality of your account credentials, API keys, and access tokens, and for all activities that occur under your account. You must notify Zeyro immediately of any unauthorized use of your account or any other breach of security.</p>
              <p className="mb-4 text-slate-600">4.4 Zeyro reserves the right to refuse registration, suspend, or terminate any account at its discretion, including where it reasonably believes the applicant does not meet eligibility criteria, has provided false information, or poses a compliance or security risk.</p>
            </Section>

            <Section id="5-acceptable-use" title="5. ACCEPTABLE USE">
              <p className="mb-4 text-slate-600">5.1 You agree to use the Platform and Services only for lawful business purposes and in compliance with these Terms and all applicable laws, including the Digital Personal Data Protection Act, 2023 (&quot;DPDP Act&quot;), the Information Technology Act, 2000, and applicable RBI, Sahamati/Account Aggregator, and sectoral regulatory frameworks.</p>
              <p className="mb-4 text-slate-600">5.2 Without limitation, you agree not to:</p>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(a)</span>
                <p className="m-0">use the Services to process Financial Information or personal data of any End User without a valid, lawful basis and, where applicable, valid Account Aggregator consent or equivalent consent artifact;</p>
              </div>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(b)</span>
                <p className="m-0">resell, sublicense, or provide the Services or Outputs to any third party as a standalone product without Zeyro&apos;s prior written consent;</p>
              </div>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(c)</span>
                <p className="m-0">reverse engineer, decompile, disassemble, or attempt to derive the source code, model weights, feature definitions, or underlying algorithms of the Services;</p>
              </div>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(d)</span>
                <p className="m-0">use the Services to build a directly competing product or to train a competing model using Zeyro&apos;s Outputs;</p>
              </div>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(e)</span>
                <p className="m-0">use any automated means (bots, scrapers, crawlers) to access the Platform beyond documented API usage;</p>
              </div>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(f)</span>
                <p className="m-0">attempt to gain unauthorized access to the Platform, other Users&apos; accounts, or Zeyro&apos;s infrastructure;</p>
              </div>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(g)</span>
                <p className="m-0">use the Services in a manner that violates the rights of any End User, including using Outputs to make decisions in a manner inconsistent with applicable fair-lending, non-discrimination, or explainability requirements;</p>
              </div>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(h)</span>
                <p className="m-0">transmit any unlawful, harmful, defamatory, or infringing content through the Platform;</p>
              </div>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(i)</span>
                <p className="m-0">exceed agreed rate limits or usage quotas in a manner intended to circumvent pricing; or</p>
              </div>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(j)</span>
                <p className="m-0">use the Services for any purpose involving weapons, illegal surveillance, or activity prohibited under applicable law.</p>
              </div>
              <p className="mb-4 text-slate-600">5.3 Zeyro reserves the right to suspend or terminate access, with or without notice, where it reasonably believes these Terms or applicable law have been violated, or where necessary to protect the Platform, other Users, or End Users.</p>
            </Section>

            <Section id="6-customer-data-outputs-and-consent" title="6. CUSTOMER DATA, OUTPUTS, AND CONSENT">
              <p className="mb-4 text-slate-600">6.1 You are solely responsible for obtaining all necessary rights, consents, and authorizations (including valid Account Aggregator consent artifacts, DPDP Act-compliant consent, or other lawful basis) required to submit Customer Data to the Services and to use the resulting Outputs, including for any End User whose data is processed.</p>
              <p className="mb-4 text-slate-600">6.2 As between the parties, the User is the data fiduciary/controller in respect of End User personal data submitted to the Services, and Zeyro acts as a data processor providing technical infrastructure, except to the limited extent Zeyro independently determines processing purposes for its own operational, security, or platform-improvement purposes as described in the Privacy Policy.</p>
              <p className="mb-4 text-slate-600">6.3 Zeyro does not sell Customer Data or End User Financial Information. Subject to Clause 7 (Consortium Data and Model Improvement), Zeyro will not use Customer Data for purposes unrelated to providing, securing, and improving the Services without your consent.</p>
              <p className="mb-4 text-slate-600">6.4 No raw Financial Information is returned via the API. Outputs consist of structured, derived intelligence artifacts (scores, signals, risk narratives, adverse action codes) only. Raw transaction-level data is retained internally solely for the purpose of feature computation and is purged in accordance with the retention schedule set out in the Privacy Policy or applicable Data Processing Agreement.</p>
              <p className="mb-4 text-slate-600">6.5 You acknowledge that Outputs are generated using statistical models and behavioural signals and may not be accurate, complete, or suitable for every use case. Zeyro does not guarantee any particular Output, score, or outcome, and you remain solely responsible for validating the suitability of Outputs for your specific regulatory, business, and risk context before relying on them for any decision.</p>
            </Section>

            <Section id="7-consortium-data-and-model-improvement" title="7. CONSORTIUM DATA AND MODEL IMPROVEMENT">
              <p className="mb-4 text-slate-600">7.1 Where you elect to submit anonymized or hashed outcome labels (e.g., loan repayment outcomes) to Zeyro under the applicable outcome-submission feature of the Services, you grant Zeyro a non-exclusive, royalty-free license to use such de-identified, aggregated data to train, validate, calibrate, and improve Zeyro&apos;s models and consortium datasets.</p>
              <p className="mb-4 text-slate-600">7.2 Data used for consortium model improvement shall be de-identified in accordance with Zeyro&apos;s data minimization practices (e.g., hashed user references, no directly identifying fields) before use in training pipelines, consistent with the Privacy Policy.</p>
              <p className="mb-4 text-slate-600">7.3 You may opt out of contributing outcome data to consortium model training by written notice to Zeyro, subject to any contrary provision in an executed order form or partner agreement.</p>
            </Section>

            <Section id="8-intellectual-property" title="8. INTELLECTUAL PROPERTY">
              <p className="mb-4 text-slate-600">8.1 All Company Materials, including the Zeyro name, logo, APIs, models, scoring methodologies, documentation, and Platform design, are the exclusive property of the Company or its licensors and are protected under applicable intellectual property laws.</p>
              <p className="mb-4 text-slate-600">8.2 Subject to your compliance with these Terms and payment of applicable fees, the Company grants you a limited, non-exclusive, non-transferable, revocable license to access and use the Platform and Services solely for your internal business purposes, in accordance with the applicable order form or partner agreement.</p>
              <p className="mb-4 text-slate-600">8.3 You retain all rights in Customer Data you submit to the Services. Except as set out in Clause 7, Zeyro claims no ownership over Customer Data.</p>
              <p className="mb-4 text-slate-600">8.4 Any feedback, suggestions, or ideas you provide regarding the Platform may be used by Zeyro without restriction, obligation, or compensation to you.</p>
            </Section>

            <Section id="9-confidentiality" title="9. CONFIDENTIALITY">
              <p className="mb-4 text-slate-600">9.1 Each party agrees to maintain the confidentiality of the other party&apos;s non-public business, technical, and financial information disclosed in connection with these Terms (&quot;Confidential Information&quot;), and to use such Confidential Information solely for purposes of performing its obligations under these Terms.</p>
              <p className="mb-4 text-slate-600">9.2 Confidentiality obligations shall not apply to information that: (a) is or becomes publicly available through no fault of the receiving party; (b) was rightfully known to the receiving party prior to disclosure; (c) is independently developed without use of the disclosing party&apos;s Confidential Information; or (d) is required to be disclosed by law or regulatory authority, provided reasonable notice is given where legally permissible.</p>
            </Section>

            <Section id="10-fees-and-payment" title="10. FEES AND PAYMENT">
              <p className="mb-4 text-slate-600">10.1 Fees for the Services shall be as set out in the applicable order form, subscription plan, or pricing page. Unless otherwise agreed, fees are billed on a per-assessment, subscription, or usage-tier basis and are exclusive of applicable taxes.</p>
              <p className="mb-4 text-slate-600">10.2 Fees are non-refundable except as expressly agreed in writing or as required by applicable law. Zeyro reserves the right to suspend Services for accounts with overdue payments, following reasonable notice.</p>
              <p className="mb-4 text-slate-600">10.3 Zeyro may revise its pricing from time to time; changes will not apply retroactively to an active, executed order form during its committed term unless otherwise stated therein.</p>
            </Section>

            <Section id="11-third-party-links-and-integrations" title="11. THIRD-PARTY LINKS AND INTEGRATIONS">
              <p className="mb-4 text-slate-600">11.1 The Platform may contain links to, or integrations with, third-party services (e.g., Account Aggregators, cloud infrastructure providers, payment processors). Zeyro does not control and is not responsible for the content, practices, or availability of such third parties.</p>
              <p className="mb-4 text-slate-600">11.2 Your use of any third-party service linked from or integrated with the Platform is governed by that third party&apos;s own terms and privacy policy.</p>
            </Section>

            <Section id="12-warranties-and-disclaimers" title="12. WARRANTIES AND DISCLAIMERS">
              <p className="mb-4 text-slate-600">12.1 The Platform and Services are provided on an &quot;as is&quot; and &quot;as available&quot; basis. To the maximum extent permitted by law, Zeyro disclaims all warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, accuracy, non-infringement, and uninterrupted or error-free operation.</p>
              <p className="mb-4 text-slate-600">12.2 Zeyro does not warrant that Outputs will be error-free, complete, or fit for any specific regulatory, credit, or business purpose. You are solely responsible for independently validating Outputs and for complying with applicable law (including fair-lending and explainability obligations) in your use of Outputs.</p>
              <p className="mb-4 text-slate-600">12.3 Nothing in these Terms constitutes investment, credit, legal, or regulatory advice.</p>
            </Section>

            <Section id="13-indemnification-and-limitation-of-liability" title="13. INDEMNIFICATION AND LIMITATION OF LIABILITY">
              <p className="mb-4 text-slate-600">13.1 Indemnification. You agree to defend, indemnify, and hold harmless the Company, its affiliates, and their respective officers, directors, employees, and agents from and against any claims, liabilities, losses, damages, and expenses (including reasonable attorneys&apos; fees) arising out of or relating to: (a) your use of the Platform or Services; (b) your breach of these Terms or applicable law; (c) your processing of End User data without valid consent or lawful basis; or (d) any decision made by you using Outputs.</p>
              <p className="mb-4 text-slate-600">13.2 Limitation of Liability. To the maximum extent permitted by applicable law, in no event shall Zeyro be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, including loss of profits, loss of data, or loss of business, arising out of or relating to these Terms or the Services, even if advised of the possibility of such damages.</p>
              <p className="mb-4 text-slate-600">13.3 Subject to Clause 13.2, Zeyro&apos;s aggregate liability arising out of or relating to these Terms and the Services shall not exceed the total fees paid by you to Zeyro in the twelve (12) months preceding the event giving rise to the claim, except with respect to breaches of confidentiality, data protection obligations, or indemnification obligations, or where liability cannot be limited under applicable law.</p>
              <p className="mb-4 text-slate-600">13.4 Zeyro shall not be liable for any failure or delay in performance caused by a Force Majeure Event.</p>
            </Section>

            <Section id="14-term-suspension-and-termination" title="14. TERM, SUSPENSION, AND TERMINATION">
              <p className="mb-4 text-slate-600">14.1 These Terms remain in effect for as long as you maintain an account or use the Platform, unless terminated earlier as set out herein.</p>
              <p className="mb-4 text-slate-600">14.2 Zeyro may suspend or terminate your access to the Platform or Services, with or without cause, upon reasonable notice (or immediately in case of a material breach, security risk, or non-payment).</p>
              <p className="mb-4 text-slate-600">14.3 You may terminate your account at any time by written notice to Zeyro, subject to any minimum term or notice period specified in an applicable order form.</p>
              <p className="mb-4 text-slate-600">14.4 Upon termination: (a) your right to access the Platform and Services ceases immediately; (b) outstanding fees remain payable; and (c) Clauses 6 (to the extent of data already processed), 8, 9, 12, 13, and 16 shall survive termination.</p>
            </Section>

            <Section id="15-governing-law-and-dispute-resolution" title="15. GOVERNING LAW AND DISPUTE RESOLUTION">
              <p className="mb-4 text-slate-600">15.1 These Terms shall be governed by and construed in accordance with the laws of India.</p>
              <p className="mb-4 text-slate-600">15.2 Any dispute arising out of or in connection with these Terms shall first be attempted to be resolved through good-faith negotiation between the parties. If unresolved within thirty (30) days, the dispute shall be referred to arbitration under the Arbitration and Conciliation Act, 1996, with a sole arbitrator appointed by mutual agreement of the parties, seated at Gandhinagar, India, with proceedings conducted in English.</p>
              <p className="mb-4 text-slate-600">15.3 Subject to Clause 15.2, the courts at Gandhinagar, India shall have exclusive jurisdiction over any matters not subject to arbitration, including applications for interim or injunctive relief.</p>
            </Section>

            <Section id="16-grievance-redressal" title="16. GRIEVANCE REDRESSAL">
              <p className="mb-4 text-slate-600">If you have any questions, concerns, or grievances relating to the Platform, these Terms, or the Company&apos;s practices, you may contact:</p>
              <p className="mb-4 text-slate-600">Grievance Officer:</p>
              <p className="mb-4 text-slate-600">Attention: Swaraj Chouriwar</p>
              <p className="mb-4 text-slate-600">Designation: Grievance Officer</p>
              <p className="mb-4 text-slate-600">Email: connect@zeyro.in</p>
              <p className="mb-4 text-slate-600">Address: Plot No. 254/A Nandniwas, New Ramdaspeth, Nagpur - 440010</p>
              <p className="mb-4 text-slate-600">Zeyro will endeavor to acknowledge grievances within twenty-four (24) hours and resolve them within fifteen (15) days, in accordance with its internal policies and applicable law.</p>
            </Section>

            <Section id="17-miscellaneous" title="17. MISCELLANEOUS">
              <p className="mb-4 text-slate-600">17.1 These Terms, together with the Privacy Policy and any executed order form or partner agreement, constitute the entire agreement between you and the Company with respect to the Platform and Services.</p>
              <p className="mb-4 text-slate-600">17.2 If any provision of these Terms is held invalid or unenforceable, the remaining provisions shall continue in full force and effect.</p>
              <p className="mb-4 text-slate-600">17.3 No waiver of any provision shall be effective unless in writing. Failure to enforce any right shall not constitute a waiver of that right.</p>
              <p className="mb-4 text-slate-600">17.4 You may not assign these Terms without Zeyro&apos;s prior written consent. Zeyro may assign these Terms in connection with a merger, acquisition, or sale of assets.</p>
              <p className="mb-4 text-slate-600">17.5 Nothing in these Terms creates any partnership, joint venture, agency, or employment relationship between the parties.</p>
              <p className="mb-4 text-slate-600">17.6 Notices under these Terms shall be in writing and delivered by email or posted on the Platform, and shall be deemed effective upon sending or posting.</p>
            </Section>


          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
