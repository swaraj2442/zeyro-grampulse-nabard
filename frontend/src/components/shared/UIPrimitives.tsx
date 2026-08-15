"use client";

import React from 'react';

export function Cite({ n, onClick }: { n: string; onClick?: () => void }) {
  return (
    <span
      onClick={onClick}
      className="inline-flex items-center bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[9px] font-semibold cursor-pointer hover:bg-gray-200 ml-0.5"
    >
      {n}
    </span>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-2">{children}</p>;
}

export function ProgressBar({ value }: { value: number }) {
  const color = value === 100 ? 'bg-green-600' : value >= 50 ? 'bg-blue-500' : 'bg-amber-400';
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[11px] text-gray-500 tabular-nums">{value}%</span>
    </div>
  );
}

export type ApplicationStatus =
  | 'ready'
  | 'ready_to_decide'
  | 'incomplete'
  | 'docs_incomplete'
  | 'flag_unresolved'
  | 'analysing'
  | 'collecting'
  | 'pending'
  | 'pending_review'
  | 'under_review'
  | 'submitted'
  | 'approved'
  | 'approved_with_conditions'
  | 'conditional'
  | 'rejected'
  | 'escalated'
  | 'draft'
  | 'withdrawn'
  | string;

export const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border?: string }> = {
  ready:                    { label: 'READY TO DECIDE',       bg: 'bg-[#166534]',   text: 'text-white'     },
  ready_to_decide:          { label: 'READY TO DECIDE',       bg: 'bg-[#166534]',   text: 'text-white'     },
  incomplete:               { label: 'DOCS INCOMPLETE',       bg: 'bg-[#B91C1C]',   text: 'text-white'     },
  docs_incomplete:          { label: 'DOCS INCOMPLETE',       bg: 'bg-[#B91C1C]',   text: 'text-white'     },
  flag_unresolved:          { label: 'FLAG UNRESOLVED',       bg: 'bg-red-50',      text: 'text-[#B91C1C]', border: 'border border-red-300' },
  analysing:                { label: 'ANALYSING...',          bg: 'bg-[#1D4ED8] animate-pulse', text: 'text-white' },
  collecting:               { label: 'COLLECTING DOCS',       bg: 'bg-gray-200',    text: 'text-gray-700'  },
  pending:                  { label: 'PENDING REVIEW',        bg: 'bg-[#B45309]',   text: 'text-white'     },
  pending_review:           { label: 'PENDING REVIEW',        bg: 'bg-[#B45309]',   text: 'text-white'     },
  under_review:             { label: 'UNDER REVIEW',          bg: 'bg-indigo-600',  text: 'text-white'     },
  submitted:                { label: 'SUBMITTED',             bg: 'bg-blue-500',    text: 'text-white'     },
  approved:                 { label: 'APPROVED',              bg: 'bg-[#15803D]',   text: 'text-white'     },
  approved_with_conditions: { label: 'CONDITIONAL',           bg: 'bg-[#C2410C]',   text: 'text-white'     },
  conditional:              { label: 'CONDITIONAL',           bg: 'bg-[#C2410C]',   text: 'text-white'     },
  rejected:                 { label: 'REJECTED',              bg: 'bg-[#4B5563]',   text: 'text-white'     },
  escalated:                { label: 'ESCALATED',             bg: 'bg-[#7C3AED]',   text: 'text-white'     },
  draft:                    { label: 'DRAFT',                 bg: 'bg-gray-400',    text: 'text-white'     },
  withdrawn:                { label: 'WITHDRAWN',             bg: 'bg-gray-500',    text: 'text-white'     },
};

export function StatusPill({ status }: { status: ApplicationStatus }) {
  const c = STATUS_CONFIG[status] || {
    label: (status || 'UNKNOWN').toUpperCase().replace(/_/g, ' '),
    bg: 'bg-gray-600',
    text: 'text-white',
  };

  return (
    <span className={`${c.bg} ${c.text} ${c.border || ''} text-[9px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap tracking-wide inline-flex items-center gap-1`}>
      {c.label}
    </span>
  );
}

export function BFSBadge({ score }: { score?: number }) {
  if (score === undefined || score === null) return <span className="text-gray-400 text-[11px] font-mono">—</span>;
  const isGreen = score >= 62;
  const isAmber = score >= 45 && score < 62;
  const colorClass = isGreen
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : isAmber
    ? 'bg-amber-50 text-amber-800 border-amber-200'
    : 'bg-red-50 text-red-700 border-red-200';

  return (
    <span className={`inline-flex items-center justify-center px-2 h-6 rounded-md text-[11px] font-bold border font-mono ${colorClass}`}>
      BFS {score}
    </span>
  );
}

export type AIRecommendationType = 'Approve' | 'Conditional Approval' | 'Manual Review' | 'Request Information' | 'Reject';

export function AIRecommendationBadge({
  recommendation,
  score,
  confidence = 'Medium'
}: {
  recommendation: AIRecommendationType;
  score?: number;
  confidence?: 'High' | 'Medium' | 'Low';
}) {
  const config: Record<AIRecommendationType, { bg: string; text: string; border: string }> = {
    'Approve':              { bg: 'bg-emerald-50/70', text: 'text-emerald-800', border: 'border-emerald-200/60' },
    'Conditional Approval': { bg: 'bg-amber-50/70',   text: 'text-amber-900',   border: 'border-amber-200/60'   },
    'Manual Review':        { bg: 'bg-gray-100/80',   text: 'text-gray-800',    border: 'border-gray-200/80'    },
    'Request Information':  { bg: 'bg-gray-100/80',   text: 'text-gray-800',    border: 'border-gray-200/80'    },
    'Reject':               { bg: 'bg-red-50/70',     text: 'text-red-900',     border: 'border-red-200/60'     },
  };

  const style = config[recommendation] || config['Manual Review'];

  return (
    <div className={`max-w-full inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold truncate ${style.bg} ${style.text} ${style.border}`}>
      <span className="truncate">{recommendation}</span>
      {score !== undefined && (
        <span className="text-[10px] opacity-75 font-mono shrink-0">
          · BFS {score}
        </span>
      )}
    </div>
  );
}

export function RiskBadge({
  keyRisk,
  additionalCount = 0,
  severity = 'medium'
}: {
  keyRisk: string;
  additionalCount?: number;
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'none';
}) {
  const isClean = severity === 'none' || keyRisk.toLowerCase().includes('no critical');
  const isSevere = severity === 'critical' || severity === 'high';

  const badgeStyle = isClean
    ? 'bg-gray-50 text-gray-500 border-gray-200'
    : isSevere
    ? 'bg-red-50/60 text-red-900 border-red-200/80 font-semibold'
    : 'bg-gray-50 text-gray-800 border-gray-200 font-medium';

  return (
    <div className="max-w-full inline-flex items-center">
      <span className={`max-w-full inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] border truncate ${badgeStyle}`}>
        {!isClean && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSevere ? 'bg-red-500' : 'bg-amber-500'}`} />}
        <span className="truncate">{keyRisk}</span>
        {additionalCount > 0 && (
          <span className="text-[9.5px] font-bold text-gray-400 ml-0.5 shrink-0">
            +{additionalCount}
          </span>
        )}
      </span>
    </div>
  );
}

export function SLABadge({
  slaText,
  status = 'normal'
}: {
  slaText: string;
  status?: 'breached' | 'at_risk' | 'normal' | 'waiting';
}) {
  const styles = {
    breached: 'bg-red-50 text-red-800 border-red-200/80 font-semibold',
    at_risk:  'bg-amber-50/80 text-amber-900 border-amber-200/70 font-medium',
    normal:   'text-gray-500 font-medium',
    waiting:  'text-gray-500 font-medium',
  };

  if (status === 'normal' || status === 'waiting') {
    return <span className="text-[11px] text-gray-500 font-medium truncate block">{slaText}</span>;
  }

  return (
    <span className={`max-w-full inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] border truncate ${styles[status]}`}>
      {status === 'breached' && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse shrink-0" />}
      {status === 'at_risk' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />}
      <span className="truncate">{slaText}</span>
    </span>
  );
}

export function FileReadinessBar({
  percentage,
  subtext
}: {
  percentage: number;
  subtext?: string;
}) {
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-gray-800 transition-all" style={{ width: `${percentage}%` }} />
      </div>
      <span className="text-[11px] font-bold text-gray-700 tabular-nums">{percentage}%</span>
    </div>
  );
}
