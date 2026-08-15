"use client";

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: "What types of documents does Zeyro support?",
    answer: "Zeyro processes a wide range of formats including PDFs, images, spreadsheets, and scanned documents. It can handle mixed layouts such as tables, charts, forms, and handwritten content within a single file."
  },
  {
    question: "How is this different from traditional OCR?",
    answer: "Traditional OCR returns a flat stream of text. Zeyro uses vision models that understand structure tables stay as tables, sections stay grouped, and the output preserves the parent-child relationships your downstream LLMs need."
  },
  {
    question: "What kind of output does Zeyro generate?",
    answer: "Clean, LLM-ready Markdown and structured JSON, with confidence scores per field. Fully schema-validated outputs are available for extraction tasks where you need a guaranteed shape."
  },
  {
    question: "Can Zeyro run in our private VPC or on-prem?",
    answer: "Yes. We support both managed and air-gapped deployments. The same API and outputs work in either mode, so the integration code stays identical."
  },
  {
    question: "What does pricing look like?",
    answer: "Pricing is based on the number of pages processed, so charges scale with the volume of documents you run through Zeyro. Additional pages beyond your plan are billed at your plan's rate, and we offer flexible tiers with custom pricing and SLAs for high-volume pipelines."
  }
];

export default function DocFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-white font-sans">
      {/* Solid bordered gap between Workflow and FAQ */}
      <div className="max-w-[1300px] mx-auto px-6 lg:px-0">
        <div className="w-full h-10 md:h-16 border-x border-gray-200 bg-white"></div>
      </div>

      <div className="max-w-[1300px] mx-auto px-6 lg:px-0">
        <div className="flex flex-col md:flex-row w-full border-x border-y border-gray-200">

          {/* Left Column (approx 42% width matching image divider) */}
          <div className="w-full md:w-[41%] lg:w-[42%] pl-8 md:pl-12 pr-8 pt-8 md:pt-10 pb-14 md:pb-16 border-b md:border-b-0 md:border-r border-gray-200">
            <div className="md:sticky top-28">
              <div className="font-mono text-[14px] uppercase tracking-wider text-[#5c5c5c] mb-8">
                [ FAQS ]
              </div>
              <h2 className="text-[40px] md:text-[48px] xl:text-[48px] leading-[1.05] font-medium tracking-tight text-[#111]">
                Frequently<br />Asked
              </h2>
            </div>
          </div>

          {/* Right Column (approx 58% width) */}
          <div className="w-full md:w-[58%] lg:w-[58%] flex flex-col">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className={`border-b border-gray-200 last:border-b-0 pl-2 md:pl-3 lg:pl-4 pr-6 md:pr-10 lg:pr-12 py-7 md:py-8 cursor-pointer transition-colors ${isOpen ? 'bg-white' : 'hover:bg-gray-50/50'}`}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <div className="flex justify-between items-center gap-6 group">
                    <h3 className={`text-[16px] md:text-[18px] lg:text-[19px] font-space-grotesk font-normal pr-8 transition-colors ${isOpen ? 'text-black font-medium' : 'text-[#222] group-hover:text-black'}`}>
                      {faq.question}
                    </h3>
                    <div className="flex-shrink-0 flex items-center justify-center">
                      <motion.div
                        initial={false}
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {isOpen ? (
                          <Minus className="w-4 h-4 md:w-4.5 md:h-4.5 stroke-[1.25] text-[#444]" />
                        ) : (
                          <Plus className="w-4 h-4 md:w-4.5 md:h-4.5 stroke-[1.25] text-[#444] group-hover:text-black transition-colors" />
                        )}
                      </motion.div>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                          open: { opacity: 1, height: "auto" },
                          collapsed: { opacity: 0, height: 0 }
                        }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="text-[14.5px] md:text-[15px] text-gray-500 leading-[1.65] font-sans pr-8 md:pr-12 max-w-2xl pt-4">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
