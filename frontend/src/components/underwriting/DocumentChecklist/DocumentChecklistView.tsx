"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, FileText } from 'lucide-react';
import { underwritingApi } from '@/services/underwritingApi';

export function DocumentChecklistView({ appId, onBack, onViewBFS, onOpenMemo, onOpenDocument }: {
  appId: string;
  onBack: () => void;
  onViewBFS: () => void;
  onOpenMemo: () => void;
  onOpenDocument: (doc: string) => void;
}) {
  const [appDetails, setAppDetails] = useState<any | null>(null);
  const [apiDocs, setApiDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadChecklistData() {
      setLoading(true);
      try {
        const [appRes, docsRes] = await Promise.all([
          underwritingApi.getApplicationById(appId).catch(() => null),
          underwritingApi.getDocumentChecklist(appId).catch(() => null),
        ]);

        if (isMounted) {
          if (appRes) setAppDetails(appRes);
          if (docsRes?.documents) setApiDocs(docsRes.documents);
        }
      } catch (err) {
        console.log('Error fetching document checklist from API');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadChecklistData();
    return () => { isMounted = false; };
  }, [appId]);

  const defaultMockDocs = [
    {
      name: 'CIBIL BUREAU REPORT',
      file: 'CIBIL_Report_Score_780.pdf',
      ok: false,
      issue: true,
      fields: [['Bureau Score', '780'], ['Active Loans', '2'], ['Enquiries (30d)', '3'], ['Confidence', '94% · High confidence']],
      issueText: '⚠ DISTRESS SIGNAL POSSIBLE: 3 hard enquiries in 30 days reduces RPS sub-score by 8 points. If any enquiries resulted in new credit, EMI obligations in ATP may be understated. Verify no new loans drawn before approving.',
      issueAction: '→ Zeyro agent requested clarification note from applicant.',
    },
    {
      name: 'BANK STATEMENT',
      file: 'HDFC_Bank_Statement_12M.pdf',
      ok: true,
      issue: false,
      fields: [['Bank Name', 'HDFC Bank'], ['Period', '12 Months'], ['Avg Balance', '₹4,82,100'], ['Confidence', '98% · High confidence']],
      issueText: '',
      issueAction: '',
    },
    {
      name: 'ITR RETURN ACKNOWLEDGEMENT',
      file: 'ITR_V_AY2024-25.pdf',
      ok: true,
      issue: false,
      fields: [['Assessment Year', '2024-25'], ['Gross Income', '₹18,50,000'], ['Tax Paid', '₹2,40,000'], ['Confidence', '96% · High confidence']],
      issueText: '',
      issueAction: '',
    },
    {
      name: 'BUSINESS PAN & GST CERTIFICATE',
      file: 'GSTIN_Registration_Certificate.pdf',
      ok: true,
      issue: false,
      fields: [['GSTIN Status', 'Active'], ['Filing Status', 'Regular'], ['State', 'Maharashtra'], ['Confidence', '99% · High confidence']],
      issueText: '',
      issueAction: '',
    },
  ];

  const rawDocs = apiDocs.length > 0 ? apiDocs.map((item: any) => ({
    name: item.docType ? item.docType.toUpperCase().replace(/_/g, ' ') : 'DOCUMENT',
    file: item.fileName || '[Verified Feed]',
    ok: item.status === 'verified',
    issue: item.status === 'flagged',
    fields: item.extractedFields ? Object.entries(item.extractedFields).map(([k, v]) => [k.replace(/([A-Z])/g, ' $1'), String(v)]) : [['Confidence', `${item.confidenceScore}% · High`]],
    issueText: item.flag?.consequenceDescription || 'Item flagged for review: verify potential risk factor before decision.',
    issueAction: '→ Zeyro agent requested reconciliation.',
  })) : defaultMockDocs;

  // Float flagged documents to top
  const docs = [...rawDocs].sort((a, b) => (b.issue ? 1 : 0) - (a.issue ? 1 : 0));
  const complete = docs.filter(d => d.ok).length;

  return (
    <div className="flex flex-col bg-white min-h-full border-t border-gray-200">
      {/* Document checklist */}
      <div className="bg-white">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2">
              Required Documents{' '}
              <span className="font-normal text-gray-500 text-[12px] bg-white border border-gray-200 px-2 py-0.5 rounded-full">3 of 4 complete</span>
            </h3>
            <p className="text-[12px] text-gray-500 mt-0.5">All documents read, verified, and cross-checked by Zeyro AI agent.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-colors">
              1 Flag Requires Attention
            </button>
          </div>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-[12px] flex items-center justify-center gap-2">
            <RefreshCw size={14} className="animate-spin" /> Loading document checklist...
          </div>
        ) : docs.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {docs.map((doc, i) => (
              <div 
                key={i} 
                onClick={() => onOpenDocument(doc.name)}
                className={`p-6 cursor-pointer transition-colors ${doc.issue ? 'border-l-[4px] border-l-amber-500 bg-amber-50/40 hover:bg-amber-50/60' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    {doc.ok ? (
                      <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold shrink-0">⚠</span>
                    )}
                    <div>
                      <span className="text-[13px] font-semibold text-gray-900 group-hover:underline">{doc.name}</span>
                      <span className="text-[11px] text-gray-400 ml-2">{doc.file}</span>
                    </div>
                  </div>
                  {doc.ok ? (
                    <span className="text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">Accepted</span>
                  ) : (
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full animate-pulse">Needs Review</span>
                  )}
                </div>

                {doc.issue && (
                  <div className="ml-7 mb-3 mt-1 bg-[#FFFBEB] border border-amber-200 border-l-[3px] border-l-amber-500 p-3 rounded-r-lg shadow-xs">
                    <span className="text-[10px] font-bold text-amber-800 tracking-wider flex items-center gap-1.5 mb-1">
                      ⚠ CIBIL HARD ENQUIRY FLAG
                    </span>
                    <p className="text-[12px] text-amber-950 leading-relaxed font-medium">
                      {doc.issueText}
                    </p>
                    <div className="mt-2 text-[11px] text-amber-800 font-semibold flex items-center justify-between">
                      <span>{doc.issueAction}</span>
                      <button className="bg-amber-200 hover:bg-amber-300 text-amber-900 text-[10px] px-2.5 py-1 rounded font-semibold transition-colors">
                        View Applicant Outreach Note
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-4 gap-2 pl-7">
                  {doc.fields.map(([label, val], j) => (
                    <div key={j}>
                      <div className="text-[9px] text-gray-400 uppercase tracking-wider font-medium">{label}</div>
                      <div className={`text-[11px] font-medium mt-0.5 ${
                        label.toLowerCase().includes('confidence') ? 'text-green-700 font-semibold' : 'text-gray-700'
                      }`}>
                        {val}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Missing 5th document indicator */}
            <div className="p-6 bg-gray-50/70 border-t border-dashed border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-[10px] shrink-0">○</span>
                <div>
                  <span className="text-[13px] font-medium text-gray-600">FORM 16 / SALARY SLIP (4th Item)</span>
                  <span className="text-[11px] text-gray-400 ml-2">Pending applicant upload</span>
                </div>
              </div>
              <button 
                onClick={() => alert('Outreach request sent to applicant')}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-xs"
              >
                Request from applicant
              </button>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400">
            <FileText size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-[13px] font-medium text-gray-600">No documents received yet</p>
            <p className="text-[11px] text-gray-400">Upload or fetch applicant documents to populate checklist.</p>
          </div>
        )}
      </div>
    </div>
  );
}
