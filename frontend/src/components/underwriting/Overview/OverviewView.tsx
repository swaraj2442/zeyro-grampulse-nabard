"use client";

import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Layers,
  ShieldCheck,
  Building2
} from 'lucide-react';

interface OverviewViewProps {
  appId: string;
  onNavigate: (view: 'checklist' | 'bfs' | 'creditmemo') => void;
  onOpenDocument: (doc: string) => void;
}

export function OverviewView({ appId, onNavigate, onOpenDocument }: OverviewViewProps) {
  return (
    <div className="flex flex-col bg-white min-h-full border-t border-gray-200 p-6 space-y-6">
      {/* Two Column Grid: Business Profile & Key Risk Drivers (Zero Header Duplications) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Business & Verification Profile */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
          <h3 className="text-[13px] font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 size={15} className="text-gray-600" />
            Entity & Verification Profile
          </h3>
          <div className="space-y-3 text-[12px]">
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Business Entity</span>
              <span className="font-semibold text-gray-900">Swastik Enterprises</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Requested Loan Amount</span>
              <span className="font-bold text-gray-900">₹4,20,000</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Loan Tenure</span>
              <span className="font-bold text-gray-900">36 Months</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Declared Purpose</span>
              <span className="font-medium text-gray-800">Home Renovation & Working Capital</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Bureau Score (CIBIL)</span>
              <span className="font-bold text-green-700">780 (Zero DPD)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Primary Bank Feed</span>
              <span className="font-medium text-gray-800">HDFC Bank (12M Verified)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Assigned Loan Officer</span>
              <span className="font-medium text-gray-800">Rahul Sharma</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Application Submitted</span>
              <span className="font-medium text-gray-800">18 Jul 2026, 10:34 AM</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-500">GST Registration</span>
              <span className="font-medium text-green-700">Active (Regular Filer)</span>
            </div>
          </div>
        </div>

        {/* Column 2: Key Risk Drivers & Mitigants */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-[13px] font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-600" />
              Risk Drivers & Mitigants
            </h3>
            <div className="space-y-3">
              <div className="p-3.5 bg-red-50/60 border border-red-200 rounded-xl">
                <div className="text-[11px] font-bold text-red-900 flex items-center gap-1.5">
                  <AlertTriangle size={13} className="text-red-600" />
                  Risk: 3 Hard CIBIL Enquiries (30 Days)
                </div>
                <p className="text-[11px] text-red-800 mt-1">
                  Reduces RPS sub-score by 8 points. Assessed as potential rate shopping.
                </p>
                <div className="mt-2 text-[10px] font-semibold text-green-800 bg-green-50 border border-green-200 px-2.5 py-1 rounded-md inline-block">
                  Mitigant: Applicant confirmed rate shopping; declaration attached.
                </div>
              </div>

              <div className="p-3.5 bg-green-50/60 border border-green-200 rounded-xl">
                <div className="text-[11px] font-bold text-green-900 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-green-600" />
                  Strength: 14 Consecutive Months Clean Inflow
                </div>
                <p className="text-[11px] text-green-800 mt-1">
                  Zero cheque bounces, stable monthly deposits, and 22% net savings rate.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
            <span className="flex items-center gap-1"><ShieldCheck size={13} className="text-green-600" /> Primary risk checks complete</span>
            <span className="font-mono text-[10px]">v2.1 AI Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
}
