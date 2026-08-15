"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown, RefreshCw } from 'lucide-react';
import { SectionLabel } from '@/components/shared/UIPrimitives';
import { underwritingApi } from '@/services/underwritingApi';

export function PortfolioInsightsView() {
  const [insights, setInsights] = useState<any | null>(null);
  const [workload, setWorkload] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadPortfolioData() {
      setLoading(true);
      try {
        const [insightsRes, workloadRes] = await Promise.all([
          underwritingApi.getPortfolioInsights().catch(() => null),
          underwritingApi.getTeamWorkload().catch(() => null),
        ]);
        if (isMounted) {
          if (insightsRes) setInsights(insightsRes);
          if (Array.isArray(workloadRes)) setWorkload(workloadRes);
        }
      } catch (err) {
        console.log('Error loading portfolio insights');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadPortfolioData();
    return () => { isMounted = false; };
  }, []);

  const mockDecisions = [
    { label: 'Approved',    count: 142, val: '₹18.4Cr', color: 'bg-green-600', pct: 62, sub: [{ l: 'Direct Pass', v: '110', pct: 75 }, { l: 'Officer Approved', v: '32', pct: 25 }] },
    { label: 'Conditional', count: 54,  val: '₹6.2Cr',  color: 'bg-amber-400', pct: 24, sub: [{ l: 'Doc Pending', v: '38', pct: 70 }, { l: 'Collateral Needed', v: '16', pct: 30 }] },
    { label: 'Declined',    count: 32,  val: '₹4.1Cr',  color: 'bg-red-400',   pct: 14, sub: [{ l: 'High DPD', v: '20', pct: 60 }, { l: 'Low ATP Score', v: '12', pct: 40 }] },
  ];

  const mockRejections = [
    { r: 'CIBIL Bureau DPD Spike (>30 days)', n: 14, pct: 44 },
    { r: 'Insufficient Ability to Pay (ATP < 45)', n: 10, pct: 31 },
    { r: 'GST Sales & ITR Income Variance (>25%)', n: 5, pct: 16 },
    { r: 'Cheque Bounce / NSF Occurrences (>3)', n: 3, pct: 9 },
  ];

  const mockApprovalDrivers = [
    { r: 'Strong Net Cash Surplus & Low Existing EMI', n: 88, pct: 62 },
    { r: 'Clean Bureau Track Record (CIBIL Score > 750)', n: 34, pct: 24 },
    { r: 'Verified AA Statement & GST Reconciliation', n: 20, pct: 14 },
  ];

  const mockWorkload = [
    { name: 'Swaraj Chouriwar (Senior Credit Officer)', files: 12, val: '₹4.2Cr', load: 85, action: 3 },
    { name: 'Ananya Sharma (Underwriter)', files: 8, val: '₹2.8Cr', load: 60, action: 1 },
    { name: 'Rohan Mehta (Risk Analyst)', files: 15, val: '₹5.5Cr', load: 95, action: 4 },
  ];

  const decisions = (insights?.decisions && insights.decisions.length > 0) ? insights.decisions : mockDecisions;
  const rejections = (insights?.topRejectionReasons && insights.topRejectionReasons.length > 0) ? insights.topRejectionReasons : mockRejections;
  const approvalDrivers = (insights?.topApprovalDrivers && insights.topApprovalDrivers.length > 0) ? insights.topApprovalDrivers : mockApprovalDrivers;
  const teamWorkloadList = (workload && workload.length > 0) ? workload : mockWorkload;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[20px] font-semibold text-gray-900">Pipeline Insights</h2>
          <p className="text-[13px] text-gray-500 mt-1">Decisions, patterns, and team performance across your portfolio.</p>
        </div>
        <div className="text-right">
          <button className="flex items-center gap-1 border border-gray-200 rounded-xl px-3 py-2 text-[12px] text-gray-600 hover:bg-gray-50 transition-colors mb-1">
            Last 30 days <ChevronDown size={12} />
          </button>
          <div className="text-[12px] text-gray-600">
            Close rate from memo-ready: <span className="font-semibold text-gray-900">{insights?.closeRate || '0%'}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-400 text-[12px] flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-2xl">
          <RefreshCw size={14} className="animate-spin" /> Loading portfolio insights...
        </div>
      ) : (
        <>
          {/* Decisions */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <SectionLabel>Decisions Breakdown</SectionLabel>
            {decisions.map(({ label, count, val, color, pct, sub }: any) => (
              <div key={label} className="mb-4">
                <div className="flex items-center gap-3 mb-1.5">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${color}`} />
                  <span className="text-[13px] font-medium text-gray-700 w-24">{label}</span>
                  <span className="text-[13px] font-semibold text-gray-900 w-12">{count}</span>
                  <span className="text-[12px] text-gray-500 w-16">{val}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                {sub && sub.length > 0 && (
                  <div className="pl-9 flex flex-col gap-0.5">
                    {sub.map((s: any) => (
                      <div key={s.l} className="flex items-center gap-2">
                        <div className="w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${color} opacity-60`} style={{ width: `${s.pct}%` }} />
                        </div>
                        <span className="text-[10px] text-gray-400">{s.l} {s.v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Rejection reasons */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <SectionLabel>Top Rejection Reasons</SectionLabel>
            {rejections.length > 0 ? (
              rejections.map(({ r, n, pct }: any) => (
                <div key={r} className="flex items-center gap-3 mb-2">
                  <div className="w-44 text-[11px] text-gray-600 shrink-0">{r}</div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-[11px] text-gray-500 w-6 text-right shrink-0">{n}</div>
                </div>
              ))
            ) : (
              <p className="text-[12px] text-gray-400 italic">No rejection statistics logged yet.</p>
            )}
          </div>

          {/* Approval drivers */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <SectionLabel>Top Approval Drivers</SectionLabel>
            {approvalDrivers.length > 0 ? (
              approvalDrivers.map(({ r, n, pct }: any) => (
                <div key={r} className="flex items-center gap-3 mb-2">
                  <div className="w-44 text-[11px] text-gray-600 shrink-0">{r}</div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-[11px] text-gray-500 w-6 text-right shrink-0">{n}</div>
                </div>
              ))
            ) : (
              <p className="text-[12px] text-gray-400 italic">No approval driver statistics logged yet.</p>
            )}
          </div>

          {/* Team workload */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-gray-100 grid grid-cols-[1fr_50px_70px_120px_auto] gap-3 text-[9px] font-semibold text-gray-400 uppercase tracking-wider">
              <div>Officer</div><div>Files</div><div>Pipeline ₹</div><div>Load</div><div>Needs Action</div>
            </div>
            {teamWorkloadList.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {teamWorkloadList.map(({ name, files, val, load, action }: any) => (
                  <div key={name} className="grid grid-cols-[1fr_50px_70px_120px_auto] gap-3 px-5 py-3 items-center text-[12px]">
                    <div className="font-medium text-gray-800">{name}</div>
                    <div className="text-gray-500">{files}</div>
                    <div className="text-gray-500">{val}</div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${load >= 100 ? 'bg-red-400' : load >= 70 ? 'bg-amber-400' : 'bg-green-500'}`} style={{ width: `${load}%` }} />
                    </div>
                    <div className="text-[11px] text-amber-600 font-medium whitespace-nowrap">+ {action} need action</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="p-5 text-[12px] text-gray-400 italic">No loan officer workload data recorded.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
