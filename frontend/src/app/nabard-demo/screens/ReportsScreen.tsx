"use client";

import React from 'react';
import { FileText, Map, Layers, Users, Download } from 'lucide-react';

const REPORTS = [
  { icon: FileText, title: 'Portfolio Summary',      desc: 'Complete portfolio health, loans, repayments and risk.',       color: 'text-blue-600',   bg: 'bg-blue-50'   },
  { icon: Map,      title: 'District Performance',   desc: 'District-level analysis and health trends.',                   color: 'text-green-700',  bg: 'bg-green-50'  },
  { icon: Layers,   title: 'Sector Performance',     desc: 'Sector-wise performance and risk trends.',                     color: 'text-amber-600',  bg: 'bg-amber-50'  },
  { icon: Users,    title: 'Officer Performance',    desc: 'Officer productivity, interventions, and growth insights.',    color: 'text-purple-600', bg: 'bg-purple-50' },
  { icon: FileText, title: 'NPA Risk Report',        desc: 'NPA forecast by district with enterprise-level drill-down.',  color: 'text-red-600',    bg: 'bg-red-50'    },
  { icon: FileText, title: 'Intervention Outcomes',  desc: 'Success rate analysis of all intervention types this quarter.', color: 'text-teal-600', bg: 'bg-teal-50'   },
];

export default function ReportsScreen() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[20px] font-bold text-gray-900">Reports</h1>
        <p className="text-[12px] text-gray-400 mt-0.5">Generate and download AI-powered reports · NABARD Maharashtra</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {REPORTS.map(r => {
          const Icon = r.icon;
          return (
            <div key={r.title} className="bg-white border border-gray-100/40 rounded-[24px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow">
              <div className={`w-9 h-9 rounded-xl ${r.bg} flex items-center justify-center mb-3`}>
                <Icon size={16} className={r.color} />
              </div>
              <div className="text-[14px] font-bold text-gray-900 mb-1.5">{r.title}</div>
              <p className="text-[11px] text-gray-500 leading-relaxed mb-4">{r.desc}</p>
              <button className="w-full flex items-center justify-center gap-1.5 border border-gray-100 rounded-xl py-2 text-[12px] font-medium text-gray-700 hover:bg-green-50 hover:border-green-300 hover:text-green-800 transition-colors">
                <Download size={12} /> Generate
              </button>
            </div>
          );
        })}
      </div>

      {/* Recent reports */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="text-[13px] font-bold text-gray-800">Recent Reports</div>
        </div>
        <div className="divide-y divide-gray-50">
          {[
            { name: 'Portfolio Summary — May 2026', generated: '29 May · 4:32 PM', size: '2.4 MB' },
            { name: 'Nashik District Performance — Q1 2026', generated: '1 Apr · 10:15 AM', size: '1.8 MB' },
            { name: 'Poultry Sector Risk Analysis', generated: '15 Mar · 2:00 PM', size: '3.1 MB' },
          ].map(r => (
            <div key={r.name} className="px-4 py-3 flex items-center justify-between">
              <div>
                <div className="text-[12px] font-medium text-gray-800">{r.name}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{r.generated} · {r.size}</div>
              </div>
              <button className="text-[11px] text-green-700 font-medium hover:underline flex items-center gap-1">
                <Download size={11} /> Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
