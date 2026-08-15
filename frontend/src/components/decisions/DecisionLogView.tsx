"use client";

import React, { useState, useEffect } from 'react';
import { RefreshCw, FileText } from 'lucide-react';
import { underwritingApi } from '@/services/underwritingApi';

export const DECISION_COLORS: Record<string, { bg: string; text: string }> = {
  Approved:    { bg: 'bg-green-100',  text: 'text-green-700'  },
  Rejected:    { bg: 'bg-red-100',    text: 'text-red-700'    },
  Conditional: { bg: 'bg-amber-100',  text: 'text-amber-700'  },
  Escalated:   { bg: 'bg-blue-100',   text: 'text-blue-700'   },
};

export function DecisionLogView() {
  const [filter, setFilter] = useState<string>('ALL');
  const [logData, setLogData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const filters = ['ALL', 'Approved', 'Rejected', 'Conditional', 'Escalated'];

  useEffect(() => {
    let isMounted = true;
    async function loadLogs() {
      setLoading(true);
      try {
        const res = await underwritingApi.getDecisionLog();
        if (isMounted && Array.isArray(res)) {
          setLogData(res);
        }
      } catch (err) {
        if (isMounted) setLogData([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadLogs();
    return () => { isMounted = false; };
  }, []);

  const mockLogs = [
    { app: 'APP-2831', name: 'Acme Software Solutions Pvt Ltd', loan: '₹25.0L', type: 'MSME Unsecured', decision: 'Approved', conditions: 0, officer: 'Swaraj C.', score: 87, time: '10:45 AM' },
    { app: 'APP-2832', name: 'Rajesh Kumar', loan: '₹7.5L', type: 'Self Employed', decision: 'Conditional', conditions: 2, officer: 'Ananya S.', score: 64, time: '11:20 AM' },
    { app: 'APP-2833', name: 'TechCraft Logistics', loan: '₹45.0L', type: 'MSME Corporate', decision: 'Approved', conditions: 0, officer: 'Swaraj C.', score: 82, time: '01:15 PM' },
    { app: 'APP-2834', name: 'Vardhaman Textiles', loan: '₹15.0L', type: 'MSME Corporate', decision: 'Conditional', conditions: 3, officer: 'Rohan M.', score: 72, time: '02:30 PM' },
    { app: 'APP-2835', name: 'Greenwood Agro', loan: '₹30.0L', type: 'Agro MSME', decision: 'Approved', conditions: 1, officer: 'Swaraj C.', score: 78, time: '03:10 PM' },
    { app: 'APP-2837', name: 'Manoj Auto Services', loan: '₹4.0L', type: 'Self Employed', decision: 'Rejected', conditions: 0, officer: 'Rohan M.', score: 45, time: '04:05 PM' },
  ];

  const displayData = (logData && logData.length > 0) ? logData : mockLogs;
  const filtered = filter === 'ALL' ? displayData : displayData.filter(d => d.decision === filter);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[20px] font-semibold text-gray-900">Decision Log</h2>
        <p className="text-[13px] text-gray-500 mt-1">Full history of every decision made by the agent and loan officers.</p>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[11px] font-medium px-3 py-1.5 rounded-xl border transition-all ${
              filter === f
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-gray-400">{filtered.length} records</span>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-[1.4fr_70px_1fr_110px_100px_80px_60px] gap-2 px-5 py-2.5 bg-gray-50 border-b border-gray-200">
          {['APPLICANT','LOAN','TYPE','DECISION','OFFICER','BFS','TIME'].map(h => (
            <div key={h} className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">{h}</div>
          ))}
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-[12px] flex items-center justify-center gap-2">
            <RefreshCw size={14} className="animate-spin" /> Loading decision log audit trail...
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((row, idx) => {
            const dc = DECISION_COLORS[row.decision] || { bg: 'bg-gray-100', text: 'text-gray-700' };
            return (
              <div key={row.app || idx} className="grid grid-cols-[1.4fr_70px_1fr_110px_100px_80px_60px] gap-2 px-5 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center cursor-pointer">
                <div>
                  <div className="text-[13px] font-semibold text-gray-900">{row.name || 'Applicant'}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{row.app}</div>
                </div>
                <div className="text-[12px] font-medium text-gray-700">{row.loan}</div>
                <div className="text-[11px] text-gray-600">{row.type}</div>
                <div>
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${dc.bg} ${dc.text}`}>
                    {row.decision}
                  </span>
                  {row.conditions > 0 && (
                    <span className="ml-1 text-[9px] text-amber-600">+{row.conditions} cond.</span>
                  )}
                </div>
                <div className="text-[11px] text-gray-600">{row.officer}</div>
                <div>
                  <span className={`text-[12px] font-semibold ${row.score >= 62 ? 'text-green-700' : 'text-red-600'}`}>{row.score}</span>
                  <span className="text-[10px] text-gray-400">/100</span>
                </div>
                <div className="text-[11px] text-gray-400">{row.time}</div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-gray-400">
            <FileText size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-[13px] font-medium text-gray-600">No decision log records yet</p>
            <p className="text-[11px] text-gray-400">Underwriting decisions submitted by officers or AI agents will be audited here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
