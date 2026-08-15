"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Activity, Building2, CheckCircle2, X, Bell, LogOut, Power } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { PipelineView } from '@/components/underwriting/ApplicationPipeline/PipelineView';
import { OverviewView } from '@/components/underwriting/Overview/OverviewView';
import { DocumentChecklistView } from '@/components/underwriting/DocumentChecklist/DocumentChecklistView';
import { DocumentViewerModal } from '@/components/underwriting/DocumentViewer/DocumentViewerModal';
import { BFSScoreView } from '@/components/underwriting/BFSScoreView/BFSScoreView';
import { CreditMemoView } from '@/components/underwriting/CreditMemo/CreditMemoView';
import { ChatPanel } from '@/components/underwriting/IntegratedChat/ChatPanel';
import { PortfolioInsightsView } from '@/components/portfolio/PortfolioInsightsView';
import { AgentLogsPanel } from '@/components/portfolio/AgentLogsPanel';
import { DecisionLogView } from '@/components/decisions/DecisionLogView';
import { OverrideHistoryView } from '@/components/decisions/OverrideHistoryView';
import { ConditionsTrackerView } from '@/components/decisions/ConditionsTrackerView';
import { PipelineSettingsView } from '@/components/underwriting/PipelineSettingsView';
import { useUnderwritingStream, underwritingApi } from '@/services/underwritingApi';
import { ProductionAccessRequestInput } from '@/types/underwriting';

// ─── Navigation Types ──────────────────────────────────────────────────────────

type CenterView = 'pipeline' | 'overview' | 'checklist' | 'bfs' | 'creditmemo' | 'insights' | 'decisionlog' | 'overrides' | 'conditions' | 'settings';
type LeftNavItem =
  | 'pipeline' | 'overview' | 'documents' | 'bfs' | 'creditmemo'
  | 'decisionlog' | 'overrides' | 'conditions'
  | 'insights' | 'workload' | 'rejections' | 'settings';

interface UnderwritingWorkspaceProps {
  onBack: () => void;
}

export default function UnderwritingWorkspace({ onBack }: UnderwritingWorkspaceProps) {
  const router = useRouter();
  const [agentActive, setAgentActive] = useState<boolean>(true);
  const [activeNav,   setActiveNav]   = useState<LeftNavItem>('pipeline');
  const [centerView,  setCenterView]  = useState<CenterView>('pipeline');
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [rightTab,    setRightTab]    = useState<'chat' | 'logs'>('chat');
  const [activeDocumentViewer, setActiveDocumentViewer] = useState<string | null>(null);
  const [sseStatus, setSseStatus]     = useState<string | null>(null);
  const [showProductionModal, setShowProductionModal] = useState<boolean>(false);
  const [requestSubmitted, setRequestSubmitted] = useState<boolean>(false);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState<boolean>(false);

  const [appDetails, setAppDetails] = useState<any | null>(null);
  const [bfsScoreData, setBfsScoreData] = useState<any | null>(null);
  const [scoreLoading, setScoreLoading] = useState<boolean>(false);

  // Decision State
  const [currentDecision, setCurrentDecision] = useState<string | null>(null);

  // Note Modal State
  const [showNoteModal, setShowNoteModal] = useState<boolean>(false);
  const [noteInputText, setNoteInputText] = useState<string>('');
  const [modalDecision, setModalDecision] = useState<string>('approved');
  const [noteSubmittedAlert, setNoteSubmittedAlert] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    if (!selectedApp) return;
    setScoreLoading(true);
    try {
      const [appRes, scoreRes] = await Promise.all([
        underwritingApi.getApplicationById(selectedApp).catch(() => null),
        underwritingApi.getBFSScore(selectedApp).catch(() => null),
      ]);
      setAppDetails(appRes);
      setBfsScoreData(scoreRes);
    } catch (err) {
      console.warn("Failed to fetch underwriting score details", err);
    } finally {
      setScoreLoading(false);
    }
  }, [selectedApp]);

  useEffect(() => {
    if (!selectedApp) {
      setAppDetails(null);
      setBfsScoreData(null);
      return;
    }
    loadData();
  }, [selectedApp, loadData]);

  // Form State
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState<'nbfc' | 'bank' | 'fintech'>('nbfc');
  const [monthlyVolume, setMonthlyVolume] = useState(1000);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // Handle SSE events from backend stream
  const handleStreamEvent = useCallback((eventType: string, data: any) => {
    console.log(`[SSE Event: ${eventType}]`, data);
    setSseStatus(`Live Event: ${eventType}`);
    if (eventType === 'bfs.updated') {
      loadData();
    }
    setTimeout(() => setSseStatus(null), 4000);
  }, [loadData]);

  // Connect Real-Time SSE Stream Hook
  useUnderwritingStream(selectedApp, handleStreamEvent);

  const handleProductionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ProductionAccessRequestInput = {
      organizationName: orgName || 'Enterprise Tenant',
      organizationType: orgType,
      expectedMonthlyApplications: Number(monthlyVolume),
      requestedCapabilities: ['account_aggregator', 'predictive_risk_model', 'credit_memo', 'rbi_audit'],
      contactName: contactName || 'Tenant Admin',
      contactEmail: contactEmail || 'admin@tenant.com',
    };

    try {
      await underwritingApi.requestProductionAccess(payload);
    } catch (err) {
      console.log('Production access request logged');
    }
    setRequestSubmitted(true);
    setTimeout(() => {
      setRequestSubmitted(false);
      setShowProductionModal(false);
    }, 2500);
  };

  const navSections: { label?: string; items: { key: LeftNavItem; label: string; badge?: string }[] }[] = selectedApp ? [
    { items: [
      { key: 'pipeline',   label: '← Back to Pipeline' }
    ]},
    { items: [
      { key: 'overview',   label: 'Overview' },
      { key: 'documents',  label: 'Document Checklist', badge: '3 of 4 ✓' },
      { key: 'bfs',        label: 'BFS Score View' },
      { key: 'creditmemo', label: 'Credit Memo' },
    ]}
  ] : [
    { label: 'Underwriting', items: [
      { key: 'pipeline',   label: 'Application Pipeline' },
    ]},
    { label: 'Decisions', items: [
      { key: 'decisionlog', label: 'Decision Log' },
      { key: 'overrides',   label: 'Override History' },
      { key: 'conditions',  label: 'Conditions Tracker' },
    ]},
    { label: 'Portfolio', items: [
      { key: 'insights',   label: 'Pipeline Insights' },
      { key: 'workload',   label: 'Team Workload' },
      { key: 'rejections', label: 'Rejection Analysis' },
    ]},
    { label: 'System', items: [
      { key: 'settings',   label: 'Pipeline Settings' },
    ]},
  ];

  const handleSelectApp = (id: string) => {
    setSelectedApp(id);
    setCenterView('overview');
    setActiveNav('overview');
  };

  const handleNav = (key: LeftNavItem) => {
    setActiveNav(key);
    if (key === 'pipeline') {
      setSelectedApp(null);
      setCenterView('pipeline');
    }
    else if (key === 'overview')    setCenterView('overview');
    else if (key === 'documents')   setCenterView('checklist');
    else if (key === 'bfs')         setCenterView('bfs');
    else if (key === 'creditmemo')  setCenterView('creditmemo');
    else if (['insights','workload','rejections'].includes(key)) setCenterView('insights');
    else if (key === 'decisionlog') setCenterView('decisionlog');
    else if (key === 'overrides')   setCenterView('overrides');
    else if (key === 'conditions')  setCenterView('conditions');
    else if (key === 'settings')    setCenterView('settings');
  };

  const renderCenter = () => {
    if (centerView === 'pipeline')   return <PipelineView onSelectApp={handleSelectApp} />;
    if (centerView === 'settings')   return <PipelineSettingsView />;
    if (centerView === 'overview')   return (
      <OverviewView
        appId={selectedApp || ''}
        onNavigate={(view) => {
          setCenterView(view);
          setActiveNav(view === 'checklist' ? 'documents' : view);
        }}
        onOpenDocument={setActiveDocumentViewer}
      />
    );
    if (centerView === 'checklist')  return (
      <DocumentChecklistView
        appId={selectedApp || ''}
        onBack={() => { setSelectedApp(null); setCenterView('pipeline'); setActiveNav('pipeline'); }}
        onViewBFS={() => { setCenterView('bfs'); setActiveNav('bfs'); }}
        onOpenMemo={() => { setCenterView('creditmemo'); setActiveNav('creditmemo'); }}
        onOpenDocument={setActiveDocumentViewer}
      />
    );
    if (centerView === 'bfs') return (
      <BFSScoreView
        appId={selectedApp || ''}
        onBack={() => { setCenterView('checklist'); setActiveNav('documents'); }}
        onOpenDocument={setActiveDocumentViewer}
      />
    );
    if (centerView === 'creditmemo') return (
      <CreditMemoView 
        appId={selectedApp || ''}
        onBack={() => { setCenterView('checklist'); setActiveNav('documents'); }} 
        onOpenDocument={setActiveDocumentViewer}
      />
    );
    if (centerView === 'insights')    return <PortfolioInsightsView />;
    if (centerView === 'decisionlog') return <DecisionLogView />;
    if (centerView === 'overrides')   return <OverrideHistoryView />;
    if (centerView === 'conditions')  return <ConditionsTrackerView />;
    return null;
  };

  // Sidebar Content Component
  const sidebarContent = (
    <div className="w-[230px] shrink-0 bg-[#F7F7F5] border-r border-gray-200 flex flex-col h-full min-h-0 overflow-y-auto no-scrollbar py-4">
      {/* Top Sidebar Back Button */}
      <div className="px-3 mb-3">
        <button
          onClick={() => {
            if (selectedApp || centerView !== 'pipeline') {
              setSelectedApp(null);
              setCenterView('pipeline');
              setActiveNav('pipeline');
            } else {
              onBack();
            }
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-[11.5px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-2xs group"
          title={selectedApp || centerView !== 'pipeline' ? "Return to Application Pipeline" : "Return to Agents Home Screen"}
        >
          <ArrowLeft size={13} className="text-gray-400 group-hover:text-gray-700 transition-colors shrink-0" />
          <span className="truncate">{selectedApp || centerView !== 'pipeline' ? 'Back to Pipeline' : 'Back to Agent Hub'}</span>
        </button>
      </div>

      {navSections.map((sec, idx) => (
        <div key={idx} className="mb-4 px-3">
          {sec.label && (
            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-2 px-2">{sec.label}</p>
          )}
          {sec.items.map(item => {
            const active = activeNav === item.key;
            const isBackLink = item.key === 'pipeline' && selectedApp;
            return (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className={`w-full text-left px-3 py-2 rounded-lg mb-1 text-[12px] transition-all flex items-center justify-between ${
                  active
                    ? 'bg-white font-semibold text-gray-900 shadow-xs border border-gray-200/80'
                    : 'text-gray-500 hover:bg-white/60 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  {!isBackLink && <span className="text-[8px]">{active ? '●' : '○'}</span>}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] bg-green-100 text-green-800 font-medium px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );

  // Sandbox Banner (Section 1) - Disabled
  const sandboxBanner = null;

  // Header Bar
  const headerBar = selectedApp ? (
    // Application detail header — compact single row + stepper
    <div className="bg-white border-b border-gray-200 px-5 py-2.5 shrink-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span className="text-[10px] font-mono font-bold text-gray-600 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded shrink-0">
            {appDetails?.appNumber || selectedApp || 'APP-2831'}
          </span>
          <span className="text-[14px] font-bold text-gray-900 truncate">{appDetails?.applicantName || 'Rajesh Kumar'}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowNoteModal(true)}
            className="bg-gray-900 text-white text-[11.5px] font-semibold px-3.5 py-1.5 rounded-xl hover:bg-gray-800 transition-colors shadow-xs"
          >
            Submit Decision
          </button>
        </div>
      </div>
    </div>
  ) : (
    // Home header — single row, no stacking
    <div className="h-[52px] bg-white border-b border-gray-200 flex items-center justify-between px-5 shrink-0 relative">
      <div className="flex items-center gap-2.5">
        <div>
          <h1 className="text-[15px] font-bold text-gray-900 leading-none">Underwriting Agent</h1>
        </div>
        {agentActive ? (
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10.5px] text-emerald-800 font-semibold">Agent Active</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span className="text-[10.5px] text-red-800 font-semibold">Agent Stopped</span>
          </div>
        )}
        <span className="hidden lg:block text-[11px] text-gray-400">18 Jul 2026, 10:41 AM</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden lg:block text-[11px] text-gray-400">Last run: 2 min ago</span>

        {/* Alerts Button */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsDropdown(v => !v)}
            className="flex items-center gap-1.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-[11.5px] font-medium px-2.5 py-1.5 rounded-xl transition-colors shadow-2xs"
          >
            <Bell size={13} className="text-gray-500" />
            <span>Alerts</span>
            <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-gray-200/80 leading-none">
              8
            </span>
          </button>

          {showAlertsDropdown && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowAlertsDropdown(false)}
              />
              {/* Dropdown */}
              <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-[12px] font-bold text-gray-900">Needs Attention Today</p>
                    <p className="text-[10.5px] text-gray-500 mt-0.5">8 applications require your action</p>
                  </div>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">Today</span>
                </div>
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => { setCenterView('pipeline'); setShowAlertsDropdown(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 transition-colors text-left group"
                  >
                    <span className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-[13px] shrink-0">✅</span>
                    <div>
                      <p className="text-[12px] font-semibold text-gray-900">3 Ready to Decide</p>
                      <p className="text-[10.5px] text-gray-500">Credit memo reviewed · BFS scored</p>
                    </div>
                    <span className="ml-auto text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md">3</span>
                  </button>
                  <button
                    onClick={() => { setCenterView('pipeline'); setShowAlertsDropdown(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-50 transition-colors text-left group"
                  >
                    <span className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-[13px] shrink-0">📄</span>
                    <div>
                      <p className="text-[12px] font-semibold text-gray-900">3 Docs Incomplete</p>
                      <p className="text-[10.5px] text-gray-500">Waiting on applicant uploads</p>
                    </div>
                    <span className="ml-auto text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md">3</span>
                  </button>
                  <button
                    onClick={() => { setCenterView('pipeline'); setShowAlertsDropdown(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors text-left group"
                  >
                    <span className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center text-[13px] shrink-0">🚩</span>
                    <div>
                      <p className="text-[12px] font-semibold text-gray-900">2 Flags Unresolved</p>
                      <p className="text-[10.5px] text-gray-500">CIBIL enquiry · income irregularity</p>
                    </div>
                    <span className="ml-auto text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded-md">2</span>
                  </button>
                </div>
                <div className="px-4 py-2.5 border-t border-gray-100">
                  <button
                    onClick={() => { setCenterView('pipeline'); setShowAlertsDropdown(false); }}
                    className="w-full text-[11.5px] font-semibold text-gray-700 hover:text-gray-900 transition-colors text-center"
                  >
                    View all in queue →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Logout & Kill Agent Button */}
        <button
          onClick={() => {
            setAgentActive(false);
            setTimeout(() => {
              router.push('/login');
            }, 600);
          }}
          className="flex items-center gap-1.5 border border-red-200 bg-red-50/70 hover:bg-red-100 text-red-700 text-[11.5px] font-semibold px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
          title="Kill active agent session and log out"
        >
          <Power size={13} className="text-red-600" />
          <span>Logout & Kill Agent</span>
        </button>
        <button
          onClick={() => handleNav('settings')}
          className="p-1.5 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition-colors text-[13px]"
          title="Pipeline & Policy Settings"
        >
          ⚙
        </button>
      </div>
    </div>
  );

  // Application L2 Score Breakdown Card
  const scoreBreakdown = (
    <div className="bg-white border-b border-gray-200 px-6 py-3 shrink-0 shadow-sm">
      {scoreLoading ? (
        <div className="flex items-center justify-center py-4 text-gray-400 text-[11px] gap-2">
          <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          Loading application score details...
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h3 className="text-[14px] font-bold text-gray-950 mb-3">
            Score Breakdown
          </h3>

          {/* Main Top Grid: Left (Composite Score) vs Right (3 Vertical Stat Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch mb-3">
            {/* Left Column: Composite Score Component */}
            <div className="bg-white border border-gray-200 px-6 py-4 rounded-xl flex items-center justify-between shadow-xs h-full relative overflow-hidden">
              <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider absolute top-3 left-5">Zeyro Composite Score</div>
              <div className="text-left shrink-0 mt-3">
                <div className={`text-[64px] font-black leading-none flex items-baseline gap-2 ${
                  (bfsScoreData?.riskTier || appDetails?.bfsSummary?.riskTier || 'medium') === 'low'
                    ? 'text-emerald-600'
                    : (bfsScoreData?.riskTier || appDetails?.bfsSummary?.riskTier || 'medium') === 'medium'
                    ? 'text-amber-500'
                    : 'text-red-600'
                }`}>
                  {bfsScoreData?.compositeScore || appDetails?.bfsSummary?.score || 54} <span className="text-[20px] font-semibold text-gray-400">/ 100</span>
                </div>
              </div>

              {/* Approved / Rejected Stamp Image */}
              <div className="animate-in fade-in zoom-in duration-200 flex items-center justify-center shrink-0">
                {(currentDecision || 'approved').includes('approve') ? (
                  <img src="/approve.png" alt="Approved" className="h-28 w-auto object-contain block drop-shadow-md" />
                ) : (
                  <img src="/rejected.png" alt="Rejected" className="h-28 w-auto object-contain block drop-shadow-md" />
                )}
              </div>
            </div>

            {/* Right Column: Three Stat Cards Stacked Vertically Top to Bottom */}
            <div className="flex flex-col gap-2">
              {/* RPS Card */}
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-xs flex items-center justify-between">
                <div className="text-[11px] font-semibold text-gray-600">RPS (Repayment Propensity)</div>
                <div className="text-[20px] font-bold text-gray-900 leading-none">
                  {bfsScoreData?.components?.rps?.score || 49} <span className="text-[11px] font-normal text-gray-400">/ 100</span>
                </div>
              </div>

              {/* BCS Card */}
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-xs flex items-center justify-between">
                <div className="text-[11px] font-semibold text-gray-600">BCS (Behavioural Cashflow)</div>
                <div className="text-[20px] font-bold text-gray-900 leading-none">
                  {bfsScoreData?.components?.bcs?.score || 58} <span className="text-[11px] font-normal text-gray-400">/ 100</span>
                </div>
              </div>

              {/* ATP Card */}
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-xs flex items-center justify-between">
                <div className="text-[11px] font-semibold text-gray-600">ATP (Ability to Pay)</div>
                <div className="text-[20px] font-bold text-gray-900 leading-none">
                  {bfsScoreData?.components?.atp?.score || 61} <span className="text-[11px] font-normal text-gray-400">/ 100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Factors & Recommendation Card */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">Top factors that capped this score:</div>
              <ol className="list-decimal pl-4 text-[11.5px] text-amber-900 space-y-0.5">
                {bfsScoreData?.riskSignals && bfsScoreData.riskSignals.length > 0 ? (
                  bfsScoreData.riskSignals.slice(0, 2).map((sig: any, i: number) => (
                    <li key={i}>{sig.text}</li>
                  ))
                ) : (
                  <>
                    <li>Distress borrowing signal (enquiry spike)</li>
                    <li>Income irregularity last quarter</li>
                  </>
                )}
              </ol>
            </div>
            <div className="md:border-l md:border-amber-200/80 md:pl-4">
              <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">Recommendation:</div>
              <p className="text-[11.5px] text-amber-950 leading-snug font-medium">
                Approve with Conditions — Verify salary account mandate & confirm no new credit line drawn prior to disbursal.
              </p>
            </div>
          </div>

          {/* Action Buttons & Decision Stamp */}
          <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCurrentDecision('approved');
                  underwritingApi.submitDecision(selectedApp || '', { decision: 'approved', decisionNotes: 'Approved via workspace' })
                    .catch(err => console.warn('Decision submit info:', err.message));
                }}
                className="bg-green-700 hover:bg-green-800 text-white text-[12px] font-semibold px-4 py-2 rounded-xl transition-colors shadow-xs"
              >
                Approve
              </button>
              <button
                onClick={() => {
                  setCurrentDecision('approved_with_conditions');
                  underwritingApi.submitDecision(selectedApp || '', { decision: 'approved_with_conditions', decisionNotes: 'Approved with conditions' })
                    .catch(err => console.warn('Decision submit info:', err.message));
                }}
                className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-[12px] font-semibold px-4 py-2 rounded-xl transition-colors shadow-xs"
              >
                Approve with conditions ▾
              </button>
              <button
                onClick={() => {
                  setCurrentDecision('rejected');
                  underwritingApi.submitDecision(selectedApp || '', { decision: 'rejected', decisionNotes: 'Rejected via workspace' })
                    .catch(err => console.warn('Decision submit info:', err.message));
                }}
                className="bg-white border border-red-200 text-red-600 hover:bg-red-50 text-[12px] font-semibold px-4 py-2 rounded-xl transition-colors shadow-xs"
              >
                Reject
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setCurrentDecision('escalated');
                  underwritingApi.submitDecision(selectedApp || '', { decision: 'escalated', decisionNotes: 'Escalated to credit head' })
                    .catch(err => console.warn('Decision submit info:', err.message));
                }}
                className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-[12px] font-semibold px-4 py-2 rounded-xl transition-colors shadow-xs"
              >
                Escalate to Credit Head
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Stat Cards — 4 Clean Underwriting Command Metrics
  const statCards = (
    <div className="flex gap-0 shrink-0 bg-white border-b border-gray-200">
      {/* Metric 1: Needs Decision */}
      <button
        onClick={() => setCenterView('pipeline')}
        className="flex-1 flex items-center gap-3.5 px-5 py-3.5 border-r border-gray-100 hover:bg-gray-50/80 transition-colors text-left group"
      >
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-gray-600">
          <span className="text-[13px]">⚡</span>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-gray-400 font-bold leading-none mb-1 uppercase tracking-wider">Needs Decision</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[24px] font-bold text-gray-900 leading-none">12</span>
            <span className="text-[10.5px] text-amber-700 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> ready for officer
            </span>
          </div>
        </div>
      </button>

      {/* Metric 2: SLA At Risk */}
      <button
        onClick={() => setCenterView('pipeline')}
        className="flex-1 flex items-center gap-3.5 px-5 py-3.5 border-r border-gray-100 hover:bg-gray-50/80 transition-colors text-left group"
      >
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-gray-600">
          <span className="text-[13px]">⏱</span>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-gray-400 font-bold leading-none mb-1 uppercase tracking-wider">SLA At Risk</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[24px] font-bold text-gray-900 leading-none">4</span>
            <span className="text-[10.5px] text-red-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" /> 1 breached · 3 due soon
            </span>
          </div>
        </div>
      </button>

      {/* Metric 3: Waiting on Applicant */}
      <div className="flex-1 flex items-center gap-3.5 px-5 py-3.5 border-r border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-gray-600">
          <span className="text-[13px]">📩</span>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-gray-400 font-bold leading-none mb-1 uppercase tracking-wider">Waiting on Applicant</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[24px] font-bold text-gray-900 leading-none">18</span>
            <span className="text-[10.5px] text-gray-500 font-medium">blocked for info</span>
          </div>
        </div>
      </div>

      {/* Metric 4: Agent-Handled */}
      <div className="flex-1 flex items-center gap-3.5 px-5 py-3.5">
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-gray-600">
          <span className="text-[13px]">🤖</span>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-gray-400 font-bold leading-none mb-1 uppercase tracking-wider">Agent-Handled</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[24px] font-bold text-gray-900 leading-none">27</span>
            <span className="text-[10.5px] text-gray-500 font-medium">automated</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Center Content
  const centerContent = (
    <div className={`w-full ${selectedApp ? 'p-0' : 'px-6 py-5'}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${centerView}-${selectedApp}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="w-full"
        >
          {renderCenter()}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  // Right Panel
  const rightPanelContent = (
    <div className="w-[380px] shrink-0 border-l border-gray-200 bg-white flex flex-col h-full overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 shrink-0">
        {(['chat', 'logs'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setRightTab(tab)}
            className={`flex-1 py-3.5 text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors ${
              rightTab === tab
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab === 'chat' ? 'Chat' : 'Agent Logs'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden p-4 flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={rightTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="flex-1 flex flex-col min-h-0"
          >
            {rightTab === 'chat'
              ? <ChatPanel appId={selectedApp || ''} />
              : <AgentLogsPanel />
            }
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );

  // Modals Container
  const modalsContent = (
    <>
      {activeDocumentViewer && (
        <DocumentViewerModal 
          documentName={activeDocumentViewer} 
          onClose={() => setActiveDocumentViewer(null)} 
        />
      )}

      {/* Production Access Modal */}
      {showProductionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="text-amber-600" size={18} />
                <h3 className="text-[16px] font-semibold text-gray-900">Request Production Access</h3>
              </div>
              <button onClick={() => setShowProductionModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>

            {requestSubmitted ? (
              <div className="py-8 text-center flex flex-col items-center">
                <CheckCircle2 size={36} className="text-green-600 mb-2" />
                <p className="text-[14px] font-semibold text-gray-900">Request Submitted</p>
                <p className="text-[12px] text-gray-500 mt-1">Our enterprise onboarding team will verify your tenant credentials.</p>
              </div>
            ) : (
              <form onSubmit={handleProductionSubmit} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-600">Organization Name</label>
                  <input
                    required
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    placeholder="e.g. Acme Capital NBFC"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[12px] outline-none focus:border-gray-400 mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600">Type</label>
                    <select
                      value={orgType}
                      onChange={e => setOrgType(e.target.value as any)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[12px] outline-none focus:border-gray-400 mt-1 bg-white"
                    >
                      <option value="nbfc">NBFC</option>
                      <option value="bank">Scheduled Bank</option>
                      <option value="fintech">Fintech Platform</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600">Monthly Applications</label>
                    <input
                      type="number"
                      value={monthlyVolume}
                      onChange={e => setMonthlyVolume(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[12px] outline-none focus:border-gray-400 mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-600">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    placeholder="admin@company.com"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[12px] outline-none focus:border-gray-400 mt-1"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gray-900 text-white text-[12px] font-semibold py-2.5 rounded-xl hover:bg-gray-700 transition-colors mt-2"
                >
                  Submit Production Access Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add Note & Confirm Decision Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[16px] font-bold text-gray-900">Add Underwriting Note & Confirm Decision</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">Application #{selectedApp}</p>
              </div>
              <button onClick={() => setShowNoteModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>

            {noteSubmittedAlert ? (
              <div className="py-8 text-center flex flex-col items-center">
                <CheckCircle2 size={40} className="text-green-600 mb-2" />
                <p className="text-[15px] font-bold text-gray-900">Decision & Note Recorded</p>
                <p className="text-[12px] text-gray-500 mt-1">Audit log updated and sync queued to underwriting backend service.</p>
              </div>
            ) : (
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  setCurrentDecision(modalDecision);
                  try {
                    await underwritingApi.submitDecision(selectedApp || '', {
                      decision: modalDecision,
                      decisionNotes: noteInputText,
                    });
                  } catch (err) {
                    console.log('Decision logged locally in sandbox mode');
                  }
                  setNoteSubmittedAlert(true);
                  setTimeout(() => {
                    setNoteSubmittedAlert(false);
                    setShowNoteModal(false);
                    setNoteInputText('');
                  }, 1800);
                }} 
                className="space-y-4"
              >
                <div>
                  <label className="text-[11.5px] font-semibold text-gray-700 block mb-1">Underwriter Notes & Rationale</label>
                  <textarea
                    required
                    rows={4}
                    value={noteInputText}
                    onChange={e => setNoteInputText(e.target.value)}
                    placeholder="Enter observation notes, verified income details, or conditions prior to disbursal..."
                    className="w-full border border-gray-200 rounded-xl p-3 text-[12px] outline-none focus:border-gray-400 bg-gray-50 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11.5px] font-semibold text-gray-700 block mb-1">Final Underwriting Decision</label>
                  <select
                    value={modalDecision}
                    onChange={e => setModalDecision(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[12px] font-semibold outline-none focus:border-gray-400 bg-white"
                  >
                    <option value="approved">Approve Application</option>
                    <option value="approved_with_conditions">Approve With Conditions</option>
                    <option value="rejected">Reject Application</option>
                    <option value="escalated">Escalate to Credit Head</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowNoteModal(false)}
                    className="px-4 py-2 rounded-xl text-[12px] font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gray-900 hover:bg-gray-800 text-white text-[12px] font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-xs"
                  >
                    Confirm & Record Decision
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );

  if (selectedApp) {
    return (
      <div className="flex h-screen bg-[#F7F7F5] overflow-hidden">
        {modalsContent}
        {sidebarContent}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative min-h-0">
          {sandboxBanner}
          {headerBar}
          <div className="flex-1 overflow-y-auto no-scrollbar min-h-0">
            {centerView === 'overview' && scoreBreakdown}
            {centerContent}
          </div>
        </div>
        {rightPanelContent}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F7F7F5] overflow-hidden">
      {modalsContent}
      {sidebarContent}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-h-0">
        {sandboxBanner}
        {headerBar}
        <div className="flex-1 flex overflow-hidden min-h-0">
          <div className="flex-1 overflow-y-auto no-scrollbar min-h-0">
            {centerContent}
          </div>
          {rightPanelContent}
        </div>
      </div>
    </div>
  );
}
