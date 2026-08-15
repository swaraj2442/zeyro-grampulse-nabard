"use client";

import React from 'react';

export default function DocArchitecture() {
  return (
    <section className="bg-white text-[#191919] font-sans pt-0 pb-0">
      <div className="max-w-[1300px] mx-auto px-6 lg:px-0">
        
        {/* Main Box */}
        <div className="border-b border-gray-200">
          {/* Header */}
          <div className="px-8 pb-8 pt-16 md:px-12 md:pb-12 md:pt-20 border-b border-gray-200">
            <div className="font-mono text-[14px] uppercase tracking-widest text-[#5c5c5c] mb-6">
              [ ARCHITECTURE DEEPDIVE ]
            </div>
            <h2 className="text-[40px] md:text-[48px] leading-[1.1] font-semibold tracking-tighter text-[#111] max-w-4xl">
              How the document layer is built.
            </h2>
          </div>

          {/* 3 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 border-x border-gray-200">
          
          {/* Col 1 */}
          <div className="px-8 md:px-12 py-12 md:py-12 border-b md:border-b-0 md:border-r border-gray-200">
            <div className="font-mono text-[11px] text-[#ff2a85] mb-6">
              [01]
            </div>
            <h3 className="text-[24px] font-medium tracking-tight mb-4">
              Attention-guided Heatmaps
            </h3>
            <p className="text-[15px] text-gray-500 leading-relaxed">
              Reads pages like a human, breaking them into typed regions: tables, figures, signatures, handwriting. Attention-guided heatmaps focus compute on pivot zones: numerical columns, merged cells, section headers. Multi-page tables stay whole, split rows rejoin, and clauses keep their hierarchy.
            </p>
          </div>

          {/* Col 2 */}
          <div className="px-8 md:px-12 py-12 md:py-12 border-b md:border-b-0 md:border-r border-gray-200">
            <div className="font-mono text-[11px] text-[#ff2a85] mb-6">
              [02]
            </div>
            <h3 className="text-[24px] font-medium tracking-tight mb-4">
              Dual-stream vision model
            </h3>
            <p className="text-[15px] text-gray-500 leading-relaxed">
              Two streams process the document in parallel. A data stream captures tokens, numbers, and entities; a layout stream captures image tokens, bounding boxes, alignment, and indentation hierarchy. A cross-attention layer fuses both, so the model reasons over content and structure together.
            </p>
          </div>

          {/* Col 3 */}
          <div className="px-8 md:px-12 py-12 md:py-12">
            <div className="font-mono text-[11px] text-[#ff2a85] mb-6">
              [03]
            </div>
            <h3 className="text-[24px] font-medium tracking-tight mb-4">
              Domain-specific decoder
            </h3>
            <p className="text-[15px] text-gray-500 leading-relaxed">
              The decoder learns each domain's native ontology across legal contracts, financial reports, healthcare records, regulatory filings. Trained on millions of enterprise documents, not synthetic data. Outputs are schema-conditioned with cross-field constraints, so totals match line items and references resolve.
            </p>
          </div>

          </div>
        </div>
      </div>
    </section>
  );
}
