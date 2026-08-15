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

export default function PrivacyPolicy() {
  const links = [
    { id: "introduction", label: "Introduction" },
    { id: "1-scope-of-this-policy", label: "1. Scope Of This Policy" },
    { id: "2-information-we-collect", label: "2. Information We Collect" },
    { id: "3-how-we-use-information", label: "3. How We Use Information" },
    { id: "4-model-improvement-and-de-identified-data", label: "4. Model Improvement And De-Identified Data" },
    { id: "5-disclosure-of-information", label: "5. Disclosure Of Information" },
    { id: "6-data-storage,-security,-and-cross-border-transfer", label: "6. Data Storage, Security, And Cross-Border Transfer" },
    { id: "7-cookies-and-tracking-technologies", label: "7. Cookies And Tracking Technologies" },
    { id: "8-data-retention", label: "8. Data Retention" },
    { id: "9-your-rights", label: "9. Your Rights" },
    { id: "10-childrens-data", label: "10. Children'S Data" },
    { id: "11-changes-to-this-policy", label: "11. Changes To This Policy" },
    { id: "12-grievance-redressal-and-contact", label: "12. Grievance Redressal And Contact" },
    { id: "13-governing-law", label: "13. Governing Law" }
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
          <h1 className="text-5xl md:text-6xl text-slate-900 mb-6 tracking-tight font-space-grotesk font-medium">Privacy Policy</h1>
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
              <p className="mb-4 text-slate-600">This Privacy Policy explains how we collect, use, disclose, transfer, and otherwise process personal data in connection with: (a) your use of the Platform as a Business User, prospective customer, or website visitor; and (b) Zeyro&apos;s role as a technology infrastructure provider processing Financial Information on behalf of Business Users in connection with the Services.</p>
              <p className="mb-4 text-slate-600">This Privacy Policy is drafted with reference to the Digital Personal Data Protection Act, 2023 (&quot;DPDP Act&quot;), the Information Technology Act, 2000 and rules made thereunder, and, where applicable, the RBI Account Aggregator framework administered under the Sahamati specification.</p>
              <p className="mb-4 text-slate-600">By using the Platform, you consent to the collection and processing of information as described in this Privacy Policy. If you do not agree, please do not use the Platform.</p>
            </section>

            <Section id="1-scope-of-this-policy" title="1. SCOPE OF THIS POLICY">
              <h3 className="text-lg text-slate-800 mt-8 mb-3 tracking-tight">1.1 This Policy applies to personal data collected by Zeyro through:</h3>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(a)</span>
                <p className="m-0">the Platform (website, onboarding forms, dashboard, developer console, contact/enquiry forms); and</p>
              </div>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(b)</span>
                <p className="m-0">Zeyro&apos;s operation of the Services on behalf of Business Users, to the extent Zeyro processes End User Financial Information as a data processor.</p>
              </div>
              <h3 className="text-lg text-slate-800 mt-8 mb-3 tracking-tight">1.2 This Policy does not govern, and Zeyro is not responsible for, the data processing practices of:</h3>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(a)</span>
                <p className="m-0">Business Users themselves, in respect of how they collect consent from and process data of their own End Users;</p>
              </div>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(b)</span>
                <p className="m-0">Account Aggregators, Financial Information Providers, Financial Information Users, credit bureaus, or GST systems that Business Users integrate with independently; or</p>
              </div>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(c)</span>
                <p className="m-0">any third-party website or service linked from the Platform.</p>
              </div>
              <p className="mb-4 text-slate-600">You are encouraged to review the privacy practices of any Business User or third party you interact with separately from Zeyro.</p>
              <h3 className="text-lg text-slate-800 mt-8 mb-3 tracking-tight">1.3 Zeyro&apos;s Services and Platform are intended for use by businesses and their authorized personnel, not by individual consumers for personal use. Where Zeyro processes End User Financial Information on behalf of a Business User, it does so strictly as a data processor, acting on the instructions of that Business User, who remains the data fiduciary/controller responsible for obtaining valid consent from its End Users.</h3>
            </Section>

            <Section id="2-information-we-collect" title="2. INFORMATION WE COLLECT">
              <h3 className="text-lg text-slate-800 mt-8 mb-3 tracking-tight">2.1 Information Collected Directly From You (Business Users, Website Visitors)</h3>
              <p className="mb-4 text-slate-600">Name, work email, phone number, job title</p>
              <p className="mb-4 text-slate-600">Company name, company size, industry, company website</p>
              <p className="mb-4 text-slate-600">Onboarding responses (use case, data sources of interest, deployment preference, expected API usage)</p>
              <p className="mb-4 text-slate-600">Account credentials, API keys, workspace configuration</p>
              <p className="mb-4 text-slate-600">Billing and payment information (processed via our payment processor; card details are not stored by Zeyro)</p>
              <p className="mb-4 text-slate-600">Communications with our sales, support, or solutions architecture teams</p>
              <h3 className="text-lg text-slate-800 mt-8 mb-3 tracking-tight">2.2 Information Collected Automatically</h3>
              <p className="mb-4 text-slate-600">IP address, device and browser information, operating system</p>
              <p className="mb-4 text-slate-600">Cookies and similar tracking technologies (see Clause 7)</p>
              <p className="mb-4 text-slate-600">Usage data: pages visited, features used, API call patterns, error logs</p>
              <p className="mb-4 text-slate-600">Session and authentication logs, for security and fraud-prevention purposes</p>
              <h3 className="text-lg text-slate-800 mt-8 mb-3 tracking-tight">2.3 Customer Data Processed on Behalf of Business Users</h3>
              <p className="mb-4 text-slate-600">Where you are a Business User of the Services, you (or your integrated data sources — Account Aggregators, UPI rails, GST systems, bureaus, document uploads) may submit Financial Information relating to your End Users to the Platform for processing, which may include:</p>
              <p className="mb-4 text-slate-600">Bank statement and UPI transaction data</p>
              <p className="mb-4 text-slate-600">GST filings and business financial data</p>
              <p className="mb-4 text-slate-600">Bureau data (where provided by you)</p>
              <p className="mb-4 text-slate-600">Documents submitted for document intelligence processing</p>
              <p className="mb-4 text-slate-600">We process such Financial Information solely as instructed by you, for the purpose of generating Outputs (scores, risk signals, narratives) as described in our Terms of Service. We do not independently determine the purpose of processing such End User data.</p>
              <h3 className="text-lg text-slate-800 mt-8 mb-3 tracking-tight">2.4 Information We Do Not Collect</h3>
              <p className="mb-4 text-slate-600">We do not knowingly collect information from individuals under 18 years of age, and our Platform is not directed at consumers. We do not collect sensitive personal data (as defined under applicable law) through the website itself; any such data processed in connection with the Services is processed solely as instructed by, and on behalf of, the relevant Business User.</p>
            </Section>

            <Section id="3-how-we-use-information" title="3. HOW WE USE INFORMATION">
              <p className="mb-4 text-slate-600">We use the information described above to:</p>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(a)</span>
                <p className="m-0">create and manage your Zeyro account and workspace;</p>
              </div>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(b)</span>
                <p className="m-0">provide, operate, maintain, and improve the Platform and Services;</p>
              </div>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(c)</span>
                <p className="m-0">generate Outputs based on Customer Data submitted by Business Users, strictly per their instructions;</p>
              </div>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(d)</span>
                <p className="m-0">respond to enquiries, provide customer support, and communicate service updates;</p>
              </div>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(e)</span>
                <p className="m-0">send product updates, security notices, and (with consent, where required) marketing communications;</p>
              </div>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(f)</span>
                <p className="m-0">detect, investigate, and prevent fraud, abuse, and security incidents;</p>
              </div>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(g)</span>
                <p className="m-0">comply with applicable legal, regulatory, and contractual obligations;</p>
              </div>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(h)</span>
                <p className="m-0">conduct internal analytics, research, and product development, using aggregated or de-identified data wherever possible; and</p>
              </div>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(i)</span>
                <p className="m-0">with your consent, use de-identified outcome data to improve model performance across our consortium dataset (see Clause 4).</p>
              </div>
            </Section>

            <Section id="4-model-improvement-and-de-identified-data" title="4. MODEL IMPROVEMENT AND DE-IDENTIFIED DATA">
              <h3 className="text-lg text-slate-800 mt-8 mb-3 tracking-tight">4.1 Where a Business User elects to submit outcome labels (e.g., loan repayment outcomes) via the outcome-submission feature of the Services, Zeyro may use such data — after hashing user references and removing directly identifying fields — to train, validate, and improve its scoring models and consortium datasets.</h3>
              <h3 className="text-lg text-slate-800 mt-8 mb-3 tracking-tight">4.2 We do not use identifiable End User Financial Information for our own independent marketing, advertising, or profiling purposes.</h3>
              <h3 className="text-lg text-slate-800 mt-8 mb-3 tracking-tight">4.3 Business Users may opt out of contributing data to consortium model training, subject to the terms of their order form or partner agreement.</h3>
            </Section>

            <Section id="5-disclosure-of-information" title="5. DISCLOSURE OF INFORMATION">
              <h3 className="text-lg text-slate-800 mt-8 mb-3 tracking-tight">5.1 We do not sell, rent, or trade personal data or Customer Data.</h3>
              <h3 className="text-lg text-slate-800 mt-8 mb-3 tracking-tight">5.2 We may share information in the following circumstances:</h3>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(a)</span>
                <p className="m-0">Sub-processors and infrastructure providers: cloud hosting, data storage, key management, analytics (limited to operational/security analytics), email, and support tooling providers, engaged under contractual confidentiality and data protection obligations, and permitted to process data solely to enable our provision of Services.</p>
              </div>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(b)</span>
                <p className="m-0">Business Users: where you interact with the Platform as an End User via a Business User&apos;s product, relevant Outputs are shared with that Business User as instructed.</p>
              </div>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(c)</span>
                <p className="m-0">Legal and regulatory disclosure: where required by applicable law, regulation, court order, or a valid request from a governmental or regulatory authority (including RBI, DPDP Board, or law enforcement).</p>
              </div>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(d)</span>
                <p className="m-0">Corporate transactions: in connection with a merger, acquisition, financing, or sale of assets, subject to confidentiality obligations on the receiving entity.</p>
              </div>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(e)</span>
                <p className="m-0">With your consent: for any other purpose to which you expressly consent.</p>
              </div>
            </Section>

            <Section id="6-data-storage,-security,-and-cross-border-transfer" title="6. DATA STORAGE, SECURITY, AND CROSS-BORDER TRANSFER">
              <h3 className="text-lg text-slate-800 mt-8 mb-3 tracking-tight">6.1 Data localization. Zeyro stores and processes Customer Data and Financial Information within India, consistent with RBI data localization requirements and Account Aggregator framework obligations, unless otherwise agreed in writing with a Business User.</h3>
              <h3 className="text-lg text-slate-800 mt-8 mb-3 tracking-tight">6.2 Security measures. We implement administrative, technical, and physical safeguards designed to protect data against unauthorized access, disclosure, alteration, or destruction, including:</h3>
              <p className="mb-4 text-slate-600">Encryption in transit (TLS 1.3) and at rest (AES-256)</p>
              <p className="mb-4 text-slate-600">Role-based access control (RBAC) and the principle of least privilege</p>
              <p className="mb-4 text-slate-600">Network segmentation and VPC isolation</p>
              <p className="mb-4 text-slate-600">Audit logging of data access events</p>
              <p className="mb-4 text-slate-600">Periodic security reviews and vulnerability assessments</p>
              <p className="mb-4 text-slate-600">Secrets management via dedicated key-management infrastructure</p>
              <h3 className="text-lg text-slate-800 mt-8 mb-3 tracking-tight">6.3 No system can be guaranteed 100% secure. While we take reasonable measures to protect information, we cannot guarantee absolute security, and any transmission of data over the internet is at your own risk.</h3>
              <h3 className="text-lg text-slate-800 mt-8 mb-3 tracking-tight">6.4 Cross-border transfer. Where any limited transfer of non-Financial-Information personal data (e.g., business contact details of Business User personnel) occurs outside India for operational purposes (such as use of a global cloud or support tool), we ensure appropriate contractual safeguards are in place consistent with the DPDP Act.</h3>
            </Section>

            <Section id="7-cookies-and-tracking-technologies" title="7. COOKIES AND TRACKING TECHNOLOGIES">
              <h3 className="text-lg text-slate-800 mt-8 mb-3 tracking-tight">7.1 We use cookies and similar technologies on the Platform to:</h3>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(a)</span>
                <p className="m-0">enable core website and dashboard functionality;</p>
              </div>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(b)</span>
                <p className="m-0">remember your preferences and login session;</p>
              </div>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(c)</span>
                <p className="m-0">analyze website traffic and usage patterns (e.g., via analytics tools); and</p>
              </div>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(d)</span>
                <p className="m-0">measure the effectiveness of marketing communications.</p>
              </div>
              <h3 className="text-lg text-slate-800 mt-8 mb-3 tracking-tight">7.2 You may control or disable cookies through your browser settings; doing so may affect Platform functionality.</h3>
              <h3 className="text-lg text-slate-800 mt-8 mb-3 tracking-tight">7.3 We do not use cookies to track End User Financial Information processed via the Services.</h3>
            </Section>

            <Section id="8-data-retention" title="8. DATA RETENTION">
              <h3 className="text-lg text-slate-800 mt-8 mb-3 tracking-tight">8.1 Business User account data is retained for as long as your account remains active, and for a reasonable period thereafter to comply with legal, tax, audit, and dispute-resolution obligations.</h3>
              <h3 className="text-lg text-slate-800 mt-8 mb-3 tracking-tight">8.2 Raw Financial Information / Customer Data submitted for processing is retained only for as long as necessary to compute Outputs and is purged in accordance with our data minimization practice — by default within [48 hours / X days] of feature extraction, unless a longer period is required by applicable law, contractual agreement with the Business User, or ongoing dispute.</h3>
              <h3 className="text-lg text-slate-800 mt-8 mb-3 tracking-tight">8.3 De-identified/hashed outcome data used for consortium model training may be retained for longer periods necessary for model development, in de-identified form.</h3>
              <h3 className="text-lg text-slate-800 mt-8 mb-3 tracking-tight">8.4 Upon a valid deletion request or account termination, we will delete or anonymize personal data within a reasonable period (and in any event within the timeframe required under applicable law), except where retention is required for legal compliance, fraud prevention, or the resolution of disputes.</h3>
            </Section>

            <Section id="9-your-rights" title="9. YOUR RIGHTS">
              <p className="mb-4 text-slate-600">Subject to applicable law (including the DPDP Act), you may have the right to:</p>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(a)</span>
                <p className="m-0">access and obtain a copy of personal data we hold about you;</p>
              </div>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(b)</span>
                <p className="m-0">request correction of inaccurate or incomplete data;</p>
              </div>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(c)</span>
                <p className="m-0">request erasure of your personal data, subject to legal retention requirements;</p>
              </div>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(d)</span>
                <p className="m-0">withdraw consent for processing based on consent, without affecting the lawfulness of processing carried out prior to withdrawal;</p>
              </div>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(e)</span>
                <p className="m-0">nominate another individual to exercise your rights in the event of death or incapacity; and</p>
              </div>
              <div className="flex gap-3 mb-3 text-slate-600">
                <span className="shrink-0">(f)</span>
                <p className="m-0">lodge a grievance with our Grievance Officer (Clause 12) or, where unresolved, with the Data Protection Board of India or applicable regulator.</p>
              </div>
              <p className="mb-4 text-slate-600">To exercise these rights, contact us at connect@zeyro.in. We may request identity verification before actioning a request.</p>
              <p className="mb-4 text-slate-600">Note: Where personal data forms part of End User Financial Information processed on behalf of a Business User, requests relating to that data should generally be directed to the relevant Business User in the first instance, as they are the data fiduciary. We will support the Business User in fulfilling such requests as required under our processor obligations.</p>
            </Section>

            <Section id="10-childrens-data" title="10. CHILDREN&apos;S DATA">
              <p className="mb-4 text-slate-600">The Platform is intended for business use and is not directed at individuals under 18 years of age. We do not knowingly collect personal data from children. If we become aware that we have inadvertently collected such data, we will take steps to delete it promptly.</p>
            </Section>

            <Section id="11-changes-to-this-policy" title="11. CHANGES TO THIS POLICY">
              <p className="mb-4 text-slate-600">We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. Material changes will be notified via the Platform or by email to registered Business Users. The &quot;Last updated&quot; date at the top of this Policy indicates when it was last revised. Continued use of the Platform after an update constitutes acceptance of the revised Policy.</p>
            </Section>

            <Section id="12-grievance-redressal-and-contact" title="12. GRIEVANCE REDRESSAL AND CONTACT">
              <p className="mb-4 text-slate-600">If you have questions, concerns, or grievances relating to this Privacy Policy or our data practices, please contact:</p>
              <p className="mb-4 text-slate-600">General queries: connect@zeyro.in</p>
              <p className="mb-4 text-slate-600">Attention: Swaraj Chouriwar</p>
              <p className="mb-4 text-slate-600">Designation: Grievance Officer</p>
              <p className="mb-4 text-slate-600">Email: connect@zeyro.in</p>
              <p className="mb-4 text-slate-600">Address: Plot No. 254/A Nandniwas, New Ramdaspeth, Nagpur - 440010</p>
              <p className="mb-4 text-slate-600">We will endeavor to acknowledge grievances within twenty-four (24) hours and resolve them within fifteen (15) days, in accordance with applicable law.</p>
            </Section>

            <Section id="13-governing-law" title="13. GOVERNING LAW">
              <p className="mb-4 text-slate-600">This Privacy Policy is governed by the laws of India. Any disputes arising in connection with this Policy shall be subject to the exclusive jurisdiction of the courts at Gandhinagar, India, subject to the dispute resolution provisions of our Terms of Service.</p>
            </Section>

          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
