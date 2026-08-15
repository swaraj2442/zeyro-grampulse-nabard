"use client";

import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Plus, MoreVertical, RefreshCw, FolderOpen, ShieldAlert, CheckCircle2, Clock, SlidersHorizontal, Settings, X } from 'lucide-react';
import {
  StatusPill,
  ProgressBar,
  ApplicationStatus,
  BFSBadge,
  AIRecommendationBadge,
  AIRecommendationType,
  RiskBadge,
  SLABadge,
  FileReadinessBar
} from '@/components/shared/UIPrimitives';
import { underwritingApi } from '@/services/underwritingApi';
import { ApplicationItem } from '@/types/underwriting';

export interface Application {
  id: string;
  name: string;
  amount: string;
  type: string;
  subtype: string;
  facility: string;
  status: ApplicationStatus;
  stageName: string;
  bfsScore?: number;
  aiRecommendation: AIRecommendationType;
  aiConfidence?: 'High' | 'Medium' | 'Low';
  keyRisk: string;
  additionalRiskCount?: number;
  riskSeverity?: 'critical' | 'high' | 'medium' | 'low' | 'none';
  nextAction: string;
  fileReadiness: number;
  readinessSubtext?: string;
  slaText: string;
  slaStatus: 'breached' | 'at_risk' | 'normal' | 'waiting';
  queueTab: 'needs_review' | 'agent_handling' | 'waiting_applicant' | 'completed';
  progress: number;
  lastActivity: string;
  urgentNote?: string;
}

export function PipelineView({ onSelectApp }: { onSelectApp: (id: string) => void }) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'needs_review' | 'agent_handling' | 'waiting_applicant' | 'completed'>('needs_review');
  const [recommendationFilter, setRecommendationFilter] = useState<string>('ALL');
  const [slaFilter, setSlaFilter] = useState<string>('ALL');

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiConnected, setApiConnected] = useState<boolean>(false);

  // Pipeline BFS Threshold Settings State
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [autoApproveScore, setAutoApproveScore] = useState<number>(62);
  const [autoRejectScore, setAutoRejectScore] = useState<number>(45);
  const [settingsSaved, setSettingsSaved] = useState<boolean>(false);

  const fallbackPipeline: Application[] = [
    {
      id: 'APP-2847',
      name: 'Acme Software Solutions',
      amount: '₹42.0L',
      type: 'Business Loan',
      subtype: 'Corporate',
      facility: '₹42.0L Business Loan',
      status: 'ready_to_decide',
      stageName: 'Underwriting',
      bfsScore: 87,
      aiRecommendation: 'Conditional Approval',
      aiConfidence: 'High',
      keyRisk: 'Revenue concentration',
      additionalRiskCount: 2,
      riskSeverity: 'medium',
      nextAction: 'Review proposed conditions',
      fileReadiness: 85,
      readinessSubtext: 'Memo drafted · 2 conditions',
      slaText: 'Due in 1h',
      slaStatus: 'at_risk',
      queueTab: 'needs_review',
      progress: 85,
      lastActivity: 'Memo drafted · 13:50',
      urgentNote: 'Memo ready. High revenue concentration noted. Review 2 proposed disbursal conditions.',
    },
    {
      id: 'APP-2831',
      name: 'Rajesh Kumar',
      amount: '₹18.5L',
      type: 'Personal Loan',
      subtype: 'Salaried',
      facility: '₹18.5L Personal Loan',
      status: 'flag_unresolved',
      stageName: 'BFS Analysis',
      bfsScore: 64,
      aiRecommendation: 'Request Information',
      aiConfidence: 'Medium',
      keyRisk: 'Income mismatch',
      additionalRiskCount: 1,
      riskSeverity: 'high',
      nextAction: 'Approve clarification draft',
      fileReadiness: 35,
      readinessSubtext: 'Applicant note pending',
      slaText: 'Due in 28m',
      slaStatus: 'at_risk',
      queueTab: 'needs_review',
      progress: 35,
      lastActivity: 'Flag raised · 10:28',
      urgentNote: 'CIBIL enquiry spike & salary mismatch. Clarification note drafted for applicant approval.',
    },
    {
      id: 'APP-2833',
      name: 'TechCraft Logistics',
      amount: '₹4.2L',
      type: 'Business Loan',
      subtype: 'Corporate',
      facility: '₹4.2L Business Loan',
      status: 'docs_incomplete',
      stageName: 'KYC & Compliance',
      bfsScore: 82,
      aiRecommendation: 'Manual Review',
      aiConfidence: 'Medium',
      keyRisk: 'Missing salary slip',
      additionalRiskCount: 0,
      riskSeverity: 'medium',
      nextAction: 'Wait for bank statement',
      fileReadiness: 75,
      readinessSubtext: '1 document pending',
      slaText: '3h remaining',
      slaStatus: 'normal',
      queueTab: 'waiting_applicant',
      progress: 75,
      lastActivity: 'Doc requested via WhatsApp',
      urgentNote: 'Salary slip missing. Agent requested update via WhatsApp channel.',
    },
    {
      id: 'APP-2838',
      name: 'Vardhaman Textiles',
      amount: '₹85.0L',
      type: 'Business Loan',
      subtype: 'Corporate',
      facility: '₹85.0L Business Loan',
      status: 'conditional',
      stageName: 'Decision',
      bfsScore: 68,
      aiRecommendation: 'Conditional Approval',
      aiConfidence: 'High',
      keyRisk: 'GST–Bank Mismatch',
      additionalRiskCount: 1,
      riskSeverity: 'critical',
      nextAction: 'Escalate policy exception',
      fileReadiness: 90,
      readinessSubtext: 'Policy waiver required',
      slaText: 'SLA breached by 1h',
      slaStatus: 'breached',
      queueTab: 'needs_review',
      progress: 90,
      lastActivity: 'SLA Breached · 15:50',
      urgentNote: 'GST filing mismatch vs GSTR-3B. Requires credit head policy exception waiver.',
    },
    {
      id: 'APP-2835',
      name: 'Greenwood Agro',
      amount: '₹12.0L',
      type: 'Business Loan',
      subtype: 'MSME',
      facility: '₹12.0L Business Loan',
      status: 'approved',
      stageName: '✓ Complete',
      bfsScore: 79,
      aiRecommendation: 'Approve',
      aiConfidence: 'High',
      keyRisk: 'No Critical Risks',
      additionalRiskCount: 0,
      riskSeverity: 'none',
      nextAction: 'Auto-disbursal queued',
      fileReadiness: 100,
      readinessSubtext: 'Ready for decision',
      slaText: 'Completed',
      slaStatus: 'normal',
      queueTab: 'completed',
      progress: 95,
      lastActivity: 'Auto-approved · 15:50',
      urgentNote: 'Auto-approved at BFS 79. Disbursement ready.',
    },
    {
      id: 'APP-2836',
      name: 'Hindustan Gears',
      amount: '₹28.0L',
      type: 'Business Loan',
      subtype: 'Corporate',
      facility: '₹28.0L Business Loan',
      status: 'approved',
      stageName: '✓ Complete',
      bfsScore: 82,
      aiRecommendation: 'Approve',
      aiConfidence: 'High',
      keyRisk: 'No Critical Risks',
      additionalRiskCount: 0,
      riskSeverity: 'none',
      nextAction: 'Disbursed to borrower',
      fileReadiness: 100,
      readinessSubtext: 'Complete',
      slaText: 'Completed',
      slaStatus: 'normal',
      queueTab: 'completed',
      progress: 100,
      lastActivity: 'Disbursed · 15:50',
      urgentNote: 'Final approval complete and logged.',
    },
  ];

  useEffect(() => {
    let isMounted = true;
    async function fetchPipeline() {
      setLoading(true);
      try {
        const data = await underwritingApi.getApplications({ search });
        if (isMounted && data?.applications && data.applications.length > 0) {
          const mapped: Application[] = data.applications.map((item: ApplicationItem, idx: number) => {
            const fb = fallbackPipeline[idx % fallbackPipeline.length];
            const rawAmount = item.loanAmount ? (item.loanAmount / 100000).toFixed(1) : null;
            return {
              id: item.appNumber || item.id,
              name: item.applicantName,
              amount: rawAmount && parseFloat(rawAmount) > 0 ? `₹${rawAmount}L` : fb.amount,
              type: item.entityType === 'corporate' ? 'Business Loan' : 'Personal Loan',
              subtype: item.entityType === 'corporate' ? 'Corporate' : 'Salaried',
              facility: `${rawAmount && parseFloat(rawAmount) > 0 ? `₹${rawAmount}L` : fb.amount} ${item.entityType === 'corporate' ? 'Business Loan' : 'Personal Loan'}`,
              status: (item.status as ApplicationStatus) || fb.status,
              stageName: item.stage ? item.stage.replace(/_/g, ' ') : fb.stageName,
              bfsScore: item.bfsScore || fb.bfsScore,
              aiRecommendation: fb.aiRecommendation,
              aiConfidence: fb.aiConfidence,
              keyRisk: fb.keyRisk,
              additionalRiskCount: fb.additionalRiskCount,
              riskSeverity: fb.riskSeverity,
              nextAction: fb.nextAction,
              fileReadiness: item.progressPercentage || fb.fileReadiness,
              readinessSubtext: fb.readinessSubtext,
              slaText: fb.slaText,
              slaStatus: fb.slaStatus,
              queueTab: fb.queueTab,
              progress: item.progressPercentage || fb.progress,
              lastActivity: fb.lastActivity,
              urgentNote: fb.urgentNote,
            };
          });
          setApplications(mapped);
          setApiConnected(true);
        } else {
          setApplications(fallbackPipeline);
          setApiConnected(true);
        }
      } catch (err) {
        if (isMounted) {
          setApplications(fallbackPipeline);
          setApiConnected(false);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchPipeline();
    return () => { isMounted = false; };
  }, [search]);

  const STAGES = ['Docs Collection', 'KYC & Compliance', 'BFS Analysis', 'Underwriting', 'Decision'];

  const needsReviewApps = applications.filter(a => a.queueTab === 'needs_review');
  const agentHandlingApps = applications.filter(a => a.queueTab === 'agent_handling');
  const waitingApplicantApps = applications.filter(a => a.queueTab === 'waiting_applicant');
  const completedApps = applications.filter(a => a.queueTab === 'completed');

  const tabFiltered = applications.filter(a => a.queueTab === activeTab);
  const filtered = tabFiltered.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
    const matchesRec = recommendationFilter === 'ALL' || a.aiRecommendation === recommendationFilter;
    return matchesSearch && matchesRec;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Command Navigation Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Role-Based Command Tabs */}
          <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1 border border-gray-200/80 shrink-0">
            <button
              onClick={() => setActiveTab('needs_review')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'needs_review'
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Needs My Review ({needsReviewApps.length})
            </button>
            <button
              onClick={() => setActiveTab('agent_handling')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'agent_handling'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Agent Handling ({agentHandlingApps.length})
            </button>
            <button
              onClick={() => setActiveTab('waiting_applicant')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                activeTab === 'waiting_applicant'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Waiting on Applicant ({waitingApplicantApps.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                activeTab === 'completed'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Completed ({completedApps.length})
            </button>
          </div>
        </div>
      </div>

      {/* Search & Multi-criteria Command Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 flex-1 min-w-[200px] max-w-xs shadow-2xs">
          <Search size={13} className="text-gray-400 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search applicant name, app ID..."
            className="text-[12px] text-gray-700 outline-none bg-transparent flex-1 placeholder-gray-400"
          />
          {loading && <RefreshCw size={12} className="animate-spin text-gray-400" />}
        </div>

        {/* Filter: Recommendation */}
        <select
          value={recommendationFilter}
          onChange={e => setRecommendationFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-[11px] font-semibold text-gray-700 outline-none hover:border-gray-300 transition-colors shadow-2xs"
        >
          <option value="ALL">All Recommendations</option>
          <option value="Approve">Approve</option>
          <option value="Conditional Approval">Conditional Approval</option>
          <option value="Manual Review">Manual Review</option>
          <option value="Request Information">Request Information</option>
        </select>
      </div>

      {/* Main Command Centre Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="grid grid-cols-[1.8fr_1.1fr_1.8fr_1.8fr_1.1fr_24px] gap-4 px-5 py-3.5 bg-gray-50/90 border-b border-gray-200 items-center">
          {['APPLICANT', 'LOAN AMOUNT', 'AI RECOMMENDATION', 'KEY RISK / EXCEPTION', 'READINESS', ''].map(h => (
            <div key={h} className="text-[9.5px] font-bold text-gray-400 uppercase tracking-wider">{h}</div>
          ))}
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 text-[12px] flex items-center justify-center gap-2">
            <RefreshCw size={14} className="animate-spin" /> Loading underwriting command queue...
          </div>
        ) : filtered.length > 0 ? (
          filtered.map(app => (
            <div
              key={app.id}
              onClick={() => onSelectApp(app.id)}
              className="grid grid-cols-[1.8fr_1.1fr_1.8fr_1.8fr_1.1fr_24px] gap-4 px-5 py-4 border-b border-gray-100/80 cursor-pointer items-center group hover:bg-[#F9F9F7] transition-colors"
            >
              {/* Applicant */}
              <div className="min-w-0 overflow-hidden">
                <div className="text-[13px] font-bold text-gray-900 truncate group-hover:text-blue-700 transition-colors">{app.name}</div>
                <div className="text-[10.5px] text-gray-400 font-medium truncate">{app.id}</div>
              </div>

              {/* Loan Amount */}
              <div className="min-w-0 overflow-hidden text-[12.5px] font-bold text-gray-900 truncate">
                {app.amount}
              </div>

              {/* AI Recommendation */}
              <div className="min-w-0 overflow-hidden">
                <AIRecommendationBadge
                  recommendation={app.aiRecommendation}
                  score={app.bfsScore}
                  confidence={app.aiConfidence}
                />
              </div>

              {/* Key Risk / Exception */}
              <div className="min-w-0 overflow-hidden">
                <RiskBadge
                  keyRisk={app.keyRisk}
                  additionalCount={app.additionalRiskCount}
                  severity={app.riskSeverity}
                />
              </div>

              {/* File Readiness */}
              <div className="min-w-0 overflow-hidden">
                <FileReadinessBar
                  percentage={app.fileReadiness}
                  subtext={app.readinessSubtext}
                />
              </div>

              {/* Kebab Action Menu */}
              <button
                type="button"
                onClick={e => e.stopPropagation()}
                className="p-1 rounded-lg hover:bg-gray-200/70 transition-all opacity-40 group-hover:opacity-100 text-right shrink-0 ml-auto"
                title="More actions"
              >
                <MoreVertical size={13} className="text-gray-600" />
              </button>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <FolderOpen size={20} className="text-gray-400" />
            </div>
            <p className="text-[14px] font-semibold text-gray-800 mb-1">No applications in this tab</p>
            <p className="text-[12px] text-gray-500 max-w-sm">
              All applications in this view have been processed or do not match current filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function EmptySandboxState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8 py-16">
      <div className="w-20 h-20 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center mb-6">
        <div className="w-8 h-8 bg-gray-100 rounded-lg" />
      </div>
      <h3 className="text-[18px] font-semibold text-gray-900 mb-2">No applications yet.</h3>
      <p className="text-[13px] text-gray-500 max-w-sm leading-relaxed mb-8">
        Connect your Loan Origination System or create your first application manually to get started.
        Zeyro will read every document, score every applicant, and have a credit memo ready before
        your loan officer opens the file.
      </p>
      <div className="flex items-center gap-3 mb-6">
        <button className="bg-gray-900 text-white text-[12px] font-medium px-4 py-2.5 rounded-xl hover:bg-gray-700 transition-colors">
          Connect LOS via API →
        </button>
        <button className="border border-gray-200 text-[12px] font-medium px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
          Create application manually
        </button>
      </div>
    </div>
  );
}
