"use client";

import React, { useState } from 'react';
import { Settings, CheckCircle2, Sliders, ShieldAlert, Cpu, Save } from 'lucide-react';

export function PipelineSettingsView() {
  const [autoApproveScore, setAutoApproveScore] = useState<number>(62);
  const [autoRejectScore, setAutoRejectScore] = useState<number>(45);
  const [saved, setSaved] = useState<boolean>(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex flex-col bg-white min-h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-900 leading-tight flex items-center gap-2">
            <Settings size={20} className="text-gray-700" />
            Pipeline & BFS Policy Settings
          </h2>
          <p className="text-[12px] text-gray-500 mt-1">
            Configure automated underwriting thresholds, AI decision boundaries, and manual review criteria.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-[12px] font-semibold px-4 py-2 rounded-xl transition-colors shadow-xs"
        >
          <Save size={14} />
          <span>Save Settings</span>
        </button>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[12px] font-semibold flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>Pipeline settings saved successfully. Updated threshold rules across active queues.</span>
        </div>
      )}

      {/* Grid Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Automated BFS Thresholds */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-5">
          <h3 className="text-[14px] font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <Sliders size={16} className="text-blue-600" />
            BFS Score Decision Thresholds
          </h3>

          {/* Auto Approve Threshold */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[12px] font-bold text-emerald-950 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Auto-Approve BFS Threshold
              </label>
              <span className="text-[14px] font-black text-emerald-800 bg-white px-3 py-0.5 rounded-lg border border-emerald-200 shadow-2xs">
                Score ≥ {autoApproveScore}
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 mb-3 leading-relaxed">
              Applications with a composite BFS score at or above this value are routed for automatic approval.
            </p>
            <input
              type="range"
              min="50"
              max="90"
              value={autoApproveScore}
              onChange={e => setAutoApproveScore(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-emerald-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-semibold text-emerald-700 mt-1.5">
              <span>50 (Aggressive)</span>
              <span>62 (Default)</span>
              <span>90 (Strict)</span>
            </div>
          </div>

          {/* Auto Reject Threshold */}
          <div className="bg-red-50/60 border border-red-200/80 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[12px] font-bold text-red-950 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Auto-Reject BFS Threshold
              </label>
              <span className="text-[14px] font-black text-red-800 bg-white px-3 py-0.5 rounded-lg border border-red-200 shadow-2xs">
                Score ≤ {autoRejectScore}
              </span>
            </div>
            <p className="text-[11px] text-red-800 mb-3 leading-relaxed">
              Applications scoring at or below this value are automatically flagged for rejection due to credit risk.
            </p>
            <input
              type="range"
              min="20"
              max="55"
              value={autoRejectScore}
              onChange={e => setAutoRejectScore(Number(e.target.value))}
              className="w-full accent-red-600 cursor-pointer h-1.5 bg-red-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-semibold text-red-700 mt-1.5">
              <span>20 (Low Rejections)</span>
              <span>45 (Default)</span>
              <span>55 (Conservative)</span>
            </div>
          </div>

          {/* Manual Review Zone */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between text-[11.5px]">
            <div className="flex items-center gap-2.5">
              <span className="text-[16px]">⚖</span>
              <div>
                <p className="font-bold text-amber-950">Manual Underwriter Review Zone</p>
                <p className="text-[10.5px] text-amber-800 mt-0.5">Scores between {autoRejectScore + 1} and {autoApproveScore - 1} require human officer signoff.</p>
              </div>
            </div>
            <span className="text-[11px] font-bold bg-amber-200/90 text-amber-900 px-2.5 py-1 rounded-md border border-amber-300">
              {autoRejectScore + 1}–{autoApproveScore - 1}
            </span>
          </div>
        </div>

        {/* Card 2: AI Agent Control & Exception Rules */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-5">
          <h3 className="text-[14px] font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <Cpu size={16} className="text-purple-600" />
            AI Agent Execution Controls
          </h3>

          <div className="space-y-3 text-[12px]">
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">Auto-Draft Credit Memos</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Generate structured financial summaries automatically upon application submission.</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">Enabled</span>
            </div>

            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">CIBIL Hard Enquiry Tolerance</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Max allowed enquiries within 30 days before triggering policy exception.</p>
              </div>
              <span className="text-[11px] font-bold text-gray-900 bg-white px-2.5 py-1 rounded-md border border-gray-200">Max 2</span>
            </div>

            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">GST vs Bank Turnover Variance Limit</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Tolerance threshold for turnover discrepancies between GST returns and banking feeds.</p>
              </div>
              <span className="text-[11px] font-bold text-gray-900 bg-white px-2.5 py-1 rounded-md border border-gray-200">15% Variance</span>
            </div>

            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">Borrower WhatsApp Auto-Clarification</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Allow AI agent to send automated document requests over WhatsApp.</p>
              </div>
              <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">Draft Only</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px] text-gray-500">
            <span className="flex items-center gap-1"><ShieldAlert size={13} className="text-gray-400" /> Changes apply to all active pipeline queues</span>
            <span className="font-mono text-[10px]">Policy Config v2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
}
