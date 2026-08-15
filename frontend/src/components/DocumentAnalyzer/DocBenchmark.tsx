"use client";

import React from 'react';

const benchmarkData = [
  { name: 'Zeyro Parser', score: 88.0, color: 'bg-[#8634DE] border-x border-t border-black/20' },
  { name: 'Nanonets OCR-3', score: 87.4, color: 'bg-[#e6e8fc] border-x border-t border-black/20' },
  { name: 'GPT-5.5', score: 84.6, color: 'bg-[#e8f6e5] border-x border-t border-black/20' },
  { name: 'Datalab Marker', score: 83.2, color: 'bg-[#fce9d6] border-x border-t border-black/20' },
  { name: 'Nanonets OCR2+', score: 82.0, color: 'bg-[#fcf2c5] border-x border-t border-black/20' },
  { name: 'Claude Opus 4.7', score: 81.9, color: 'bg-[#f9e4e4] border-x border-t border-black/20' },
  { name: 'GPT-5.4', score: 81.0, color: 'bg-[#eff7ea] border-x border-t border-black/20' },
  { name: 'Qwen3-VL-Plus', score: 77.9, color: 'bg-[#e7e8fc] border-x border-t border-black/20' },
  { name: 'Gemini 3 Pro', score: 77.7, color: 'bg-[#cde0ff] border-x border-t border-black/20' },
  { name: 'Claude Sonnet 4.6', score: 73.9, color: 'bg-[#f3e4ee] border-x border-t border-black/20' },
  { name: 'LlamaParse (Agentic)', score: 73.5, color: 'bg-[#d3faef] border-x border-t border-black/20' },
  { name: 'Mistral Small 4', score: 69.6, color: 'bg-[#fad4aa] border-x border-t border-black/20' },
  { name: 'Landing AI', score: 69.5, color: 'bg-[#fceb8e] border-x border-t border-black/20' },
  { name: 'GLM-OCR', score: 68.4, color: 'bg-[#dfe5fc] border-x border-t border-black/20' },
  { name: 'Reducto (Agentic)', score: 66.0, color: 'bg-[#dce7fd] border-x border-t border-black/20' },
  { name: 'Extend (Agentic)', score: 64.0, color: 'bg-[#e8ebfc] border-x border-t border-black/20' },
  { name: 'Azure Doc Intelligence', score: 48.7, color: 'bg-[#eaf4e5] border-x border-t border-black/20' },
  { name: 'AWS Textract', score: 40.2, color: 'bg-[#faeedf] border-x border-t border-black/20' },
  { name: 'Unstructured', score: 39.9, color: 'bg-[#fdf4d5] border-x border-t border-black/20' },
];

export default function DocBenchmark() {
  return (
    <section className="bg-white font-sans">
      <div className="max-w-[1300px] mx-auto px-6 lg:px-0">
        <div className="w-full">

          {/* Header */}
          <div className="w-full border-t border-b border-gray-200">
            <div className="pt-20 pb-10 text-center max-w-3xl mx-auto">
              <div className="font-mono text-[14px] uppercase tracking-wider text-[#777] mb-6">
                [ BENCHMARK ]
              </div>
              <h2 className="text-[40px] md:text-[48px] xl:text-[48px] leading-[1.05] font-medium tracking-tight text-[#111] mb-5">
                State-of-the-art<br />document processing.
              </h2>
              <p className="text-[16px] text-[#5c5c5c] leading-relaxed max-w-2xl mx-auto">
                <span className="text-[#ff2a85] font-semibold">#1</span> in terms of accuracy against the leading frontier labs,<br className="hidden md:block" /> IDP vendors, and open-source vision models.
              </p>
            </div>
          </div>

          {/* Chart  */}
          <div className="w-full pt-12 pb-12 border-x border-b border-gray-200">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h3 className="text-[24px] font-space-grotesk font-bold tracking-tight mb-2">olmOCR — Overall Performance</h3>
                <p className="text-[12px] text-gray-500">Zeyro Parser vs. leading document parsing platforms and OCR-capable VLMs</p>
              </div>
              <div className="relative h-[340px] w-full flex items-end justify-between border-b border-l border-gray-200 pl-4 pb-0 mt-24">
                {/* Y-Axis Top Extension */}
                <div className="absolute -left-[1px] bottom-full h-20 w-[1px] bg-gray-200" />
                {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((tick) => (
                  <div key={tick} className="absolute w-full border-t border-[#f0f0f0] flex items-center" style={{ bottom: `${tick}%`, left: 0 }}>
                    {/* CSS Tick mark extending left of axis */}
                    <div className="absolute right-full w-[3.5px] border-t border-gray-600" />
                    {/* Number label */}
                    <span className="absolute right-full mr-2.5 text-[11px] text-[#6b7280] font-medium">{tick}</span>
                  </div>
                ))}

                <div className="absolute -left-[72px] top-1/2 -translate-y-1/2 -rotate-90 font-bold text-gray-800 tracking-wide text-[14.5px]">
                  Score (%)
                </div>

                <div className="relative z-10 flex items-end justify-around w-full h-full pb-0 px-2 gap-1.5">
                  {benchmarkData.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center justify-end h-full group w-full relative">
                      <div className={`text-[10.5px] font-bold mb-2 transition-all ${idx === 0 ? 'text-[#8634DE]' : 'text-gray-700'}`}>
                        {item.score.toFixed(1)}
                      </div>

                      <div
                        className={`w-[75%] ${item.color} transition-all duration-500 hover:brightness-95`}
                        style={{ height: `${item.score}%` }}
                      />

                      <div className="absolute top-[calc(100%+0px)] right-1/2 pr-1 rotate-[-32deg] origin-top-right whitespace-nowrap text-[10.5px] text-gray-600">
                        <span className={idx === 0 ? 'font-bold text-[#4a3aff]' : 'font-medium'}>{item.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center mt-22 text-[10px] text-gray-600 italic">
                <div>Source: olmocr==0.4.27 scorer (unmodified) on allenai/olmOCR-bench · Scores as of May 2026 · Higher is better</div>
                <div className="font-bold text-[#8634DE] not-italic">Zeyro AI</div>
              </div>

              <div className="text-center mt-8">
                <a href="#" className="inline-flex items-center text-[#ff2a85]/90 font-medium text-[15px] hover:opacity-80 transition-opacity">
                  Read the full benchmark <span className="ml-1.5 text-lg leading-none">→</span>
                </a>
                <p className="mt-5 text-[12px] text-[#9ca3af] italic">
                  Logos and trademarks are the property of their respective owners. Use does not imply endorsement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
