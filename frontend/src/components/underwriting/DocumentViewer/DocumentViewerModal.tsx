"use client";

import React, { useState, useEffect } from 'react';
import { underwritingApi } from '@/services/underwritingApi';
import { DocumentViewerPayload } from '@/types/underwriting';

export function DocumentViewerModal({ documentName, documentId = 'doc_101', onClose }: { documentName: string; documentId?: string; onClose: () => void }) {
  const [tab, setTab] = useState<'extracted' | 'raw'>('extracted');
  const [apiData, setApiData] = useState<DocumentViewerPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadDocumentViewer() {
      setLoading(true);
      try {
        const payload = await underwritingApi.getDocumentViewer(documentId);
        if (isMounted && payload) {
          setApiData(payload);
        }
      } catch (err) {
        console.log('Document viewer API offline');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDocumentViewer();
    return () => { isMounted = false; };
  }, [documentId]);

  return (
    <div className="fixed inset-0 z-50 flex bg-black/40 backdrop-blur-sm p-8">
      <div className="flex-1 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-[14px] font-semibold text-gray-900">PDF Document</span>
            <span className="text-[12px] text-gray-400">·</span>
            <span className="text-[13px] text-gray-600">{documentName}</span>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel (PDF) */}
          <div className="flex-1 bg-gray-100 border-r border-gray-200 flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-lg aspect-[1/1.4] bg-white shadow-sm border border-gray-200 rounded-md flex flex-col items-center justify-center p-8 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300 mb-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              <span className="text-[14px] text-gray-700 font-medium">
                {apiData?.signedFileUrl ? 'PDF Stream Ready' : 'Document PDF View'}
              </span>
              <span className="text-[11px] text-gray-400 mt-2">
                {apiData?.signedFileUrl || 'Connect backend storage feed to render document pages.'}
              </span>
            </div>
          </div>

          {/* Right Panel (Extraction) */}
          <div className="w-[420px] bg-white flex flex-col shrink-0">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-6 pt-4">
              <button
                onClick={() => setTab('extracted')}
                className={`pb-3 text-[12px] font-medium border-b-2 mr-6 ${tab === 'extracted' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Extracted fields
              </button>
              <button
                onClick={() => setTab('raw')}
                className={`pb-3 text-[12px] font-medium border-b-2 ${tab === 'raw' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Raw transcript
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <p className="text-[12px] text-gray-400 text-center py-8">Loading document extraction...</p>
              ) : tab === 'extracted' ? (
                <div className="flex flex-col gap-6">
                  {/* Confidence */}
                  {apiData && (
                    <div>
                      <div className="flex justify-between text-[11px] mb-1.5">
                        <span className="font-semibold text-green-700">Source-verified</span>
                        <span className="font-semibold text-green-700">{apiData.confidenceScore}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${apiData.confidenceScore}%` }} />
                      </div>
                    </div>
                  )}

                  {/* AA Cross Validation */}
                  {apiData?.crossValidation?.hasMismatch && (
                    <div className="border border-amber-200 rounded-xl overflow-hidden">
                      <div className="bg-amber-50 px-4 py-2 border-b border-amber-200">
                        <span className="text-[10px] font-bold text-amber-800 tracking-wider">AA CROSS-CHECK</span>
                      </div>
                      <div className="p-4 bg-white grid grid-cols-[1fr_auto] gap-y-2 text-[12px]">
                        <span className="text-gray-500">{apiData.crossValidation.sourceB.label}</span>
                        <span className="font-medium text-gray-900">{apiData.crossValidation.sourceB.value}</span>
                        <span className="text-gray-500">{apiData.crossValidation.sourceA.label}</span>
                        <span className="font-medium text-gray-900">{apiData.crossValidation.sourceA.value}</span>
                        <span className="text-amber-700 font-medium mt-1 pt-1 border-t border-amber-100">Gap</span>
                        <span className="text-amber-700 font-bold mt-1 pt-1 border-t border-amber-100 flex items-center gap-1">
                          ₹{apiData.crossValidation.gapAmount?.toLocaleString()} ({apiData.crossValidation.gapPercentage}%) <span className="bg-amber-100 text-amber-800 text-[9px] px-1 rounded">⚠</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Fields */}
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 tracking-wider mb-4">
                      EXTRACTED FIELDS ({apiData?.extractedFields?.length || 0})
                    </h4>
                    {apiData?.extractedFields && apiData.extractedFields.length > 0 ? (
                      <div className="grid grid-cols-[1fr_auto] gap-y-4 gap-x-4">
                        {apiData.extractedFields.map((field) => (
                          <React.Fragment key={field.key}>
                            <span className="text-[11px] text-gray-500 font-medium uppercase">{field.label}</span>
                            <span className="text-[13px] text-gray-900">{field.value}</span>
                          </React.Fragment>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[12px] text-gray-400 italic">No extracted fields available for this document.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-[11px] font-mono text-gray-600 whitespace-pre-wrap leading-relaxed">
                  No raw transcript available for this document.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
