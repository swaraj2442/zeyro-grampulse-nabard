import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComposedChart, Area, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot, ReferenceArea } from 'recharts';

// ─── Shared Types ────────────────────────────────────────────────────────────
type AccountAlert = {
  id: string;
  type: 'inflow_drop' | 'bounce_risk' | 'critical_bounce' | 'salary_late' | 'dso_rising';
  severity: 'critical' | 'warning' | 'resolved';
  detail: string;
  timestamp: string;
};

type ForecastPoint = {
  date: string;
  balance: number;
  isProjected: boolean;
  isEmiDue?: boolean;
  isSalaryCredit?: boolean;
};

type AccountProfile = {
  id: string;         // e.g. ACC-5521
  appId: string;      // e.g. APP-2024-001
  userId: string;     // e.g. USR-8821
  name: string;
  type: 'Salaried' | 'Self-Employed' | 'MSME';
  bank: string;
  txnCount: number;
  lastSync: string;
  emiAmount: number;
  emiDueDay: number;
  surplusEmiRatio: number;
  bounceProbability: number;
  alerts: AccountAlert[];
  forecast: ForecastPoint[];
  metrics: { label: string; value: string; status: string; isWarning: boolean; insight: string }[];
  lastAnalysis: { ranAt: string; triggeredBy: string; duration: string; result: string; nextRun: string };
  consentExpiryDays: number;
  aa: { connected: boolean; label: string; details: string; lastSync: string; nextSync: string };
  pdf: { connected: boolean; label: string; details: string; lastSync: string; nextSync: string };
  other: { connected: boolean; name: string; label: string; details: string; lastSync: string; nextSync: string };
  models: { name: string; desc: string; val: string; color: string }[];
  features: {
    netCashflow: number;
    emiToInflowRatio: number;
    totalInflow: number;
    savingsRate: number | null;
    inflowConcentration: number | null;
    fixedObligationRatio: number | null;
    highRiskSpendRatio: number | null;
  };
};

// ─── Demo Data ────────────────────────────────────────────────────────────────
const ACCOUNT_PROFILES: AccountProfile[] = [
  {
    id: 'ACC-5521', appId: 'APP-2024-001', userId: 'USR-8821',
    name: 'Rahul M.', type: 'Salaried', bank: 'HDFC Bank SA',
    txnCount: 1847, lastSync: '2 mins ago', emiAmount: 18400, emiDueDay: 5,
    surplusEmiRatio: 1.41, bounceProbability: 12,
    alerts: [
      { id: 'a1', type: 'bounce_risk', severity: 'resolved', detail: 'Surplus recovered after salary credit on 1 Jun', timestamp: 'Jun 3, 2026' }
    ],
    forecast: [
      { date: 'Jul 1', balance: 26000, isProjected: false, isSalaryCredit: true },
      { date: 'Jul 5', balance: 7600, isProjected: false, isEmiDue: true },
      { date: 'Jul 10', balance: 21000, isProjected: false },
      { date: 'Jul 18', balance: 38000, isProjected: false },
      { date: 'Jul 25', balance: 31000, isProjected: true },
      { date: 'Aug 1', balance: 48500, isProjected: true, isSalaryCredit: true },
      { date: 'Aug 5', balance: 30100, isProjected: true, isEmiDue: true },
      { date: 'Aug 15', balance: 41000, isProjected: true },
    ],
    metrics: [
      { label: 'Avg Monthly Income', value: '₹1,24,500', status: 'Stable', isWarning: false, insight: 'Consistent salary credits on last working day each month. Reliable employment confirmed.' },
      { label: 'FOIR', value: '38.2%', status: 'Low Risk', isWarning: false, insight: 'Fixed Obligation to Income Ratio under 50% threshold. Healthy room for new debt.' },
      { label: 'Savings Rate', value: '18%', status: 'Healthy', isWarning: false, insight: 'Maintains consistent 18% savings rate. Strong financial discipline.' },
      { label: 'BNPL Exposure', value: '₹8,400/mo', status: 'Monitor', isWarning: false, insight: 'Moderate BNPL usage. Not alarming but worth watching for liquidity stress signals.' },
      { label: 'Hidden EMIs', value: '2 obligations', status: 'Review', isWarning: false, insight: 'Regular monthly deductions found not marked as EMIs. May increase actual debt burden.' },
    ],
    lastAnalysis: { ranAt: '18 Jul 2026 · 10:41 AM', triggeredBy: 'Scheduled (every 6 hours)', duration: '1.2s', result: 'No alerts raised · Score stable', nextRun: '18 Jul 2026 · 04:41 PM' },
    consentExpiryDays: 42,
    aa: { connected: true, label: 'HDFC Bank SA', details: '1,847 txns', lastSync: '2 mins ago', nextSync: '13 mins' },
    pdf: { connected: true, label: 'Salary Slips', details: '3 PDFs parsed', lastSync: 'Yesterday', nextSync: 'Manual only' },
    other: { connected: true, name: 'EPF / Payroll', label: 'Workday', details: 'Verified', lastSync: '1 week ago', nextSync: 'Weekly' },
    models: [
      { name: 'Merchant Categorization', desc: 'ML-driven retail spend clustering', val: '42 classes', color: 'bg-indigo-500' },
      { name: 'Salary Tracking', desc: 'Recurring deposit tracking', val: 'Active', color: 'bg-teal-500' },
    ],
    features: {
      netCashflow: 106100,
      emiToInflowRatio: 0.148,
      totalInflow: 124500,
      savingsRate: 0.18,
      inflowConcentration: null,
      fixedObligationRatio: 0.382,
      highRiskSpendRatio: 0,
    }
  },
  {
    id: 'ACC-5477', appId: 'APP-2024-047', userId: 'USR-5512',
    name: 'Priya S.', type: 'Self-Employed', bank: 'ICICI Bank CA',
    txnCount: 3214, lastSync: 'Today', emiAmount: 24000, emiDueDay: 10,
    surplusEmiRatio: 0.69, bounceProbability: 74,
    alerts: [
      { id: 'b1', type: 'inflow_drop', severity: 'critical', detail: 'Inflow dropped 40% below 3-month avg in Jun', timestamp: 'Jul 1, 2026' },
      { id: 'b2', type: 'bounce_risk', severity: 'critical', detail: 'Surplus ₹16,560 vs EMI ₹24,000 — ratio 0.69x', timestamp: 'Jul 10, 2026' },
    ],
    forecast: [
      { date: 'Jul 1', balance: 34000, isProjected: false },
      { date: 'Jul 10', balance: 10000, isProjected: false, isEmiDue: true },
      { date: 'Jul 18', balance: 16560, isProjected: false },
      { date: 'Jul 25', balance: 9000, isProjected: true },
      { date: 'Aug 1', balance: 22000, isProjected: true },
      { date: 'Aug 10', balance: -2000, isProjected: true, isEmiDue: true },
      { date: 'Aug 20', balance: 14000, isProjected: true },
    ],
    metrics: [
      { label: 'Avg Monthly Income', value: '₹2,18,000', status: 'Irregular', isWarning: true, insight: 'High variance in monthly deposits. Freelance income makes cashflow unpredictable.' },
      { label: 'FOIR', value: '51.6%', status: 'Elevated', isWarning: true, insight: 'Above 50% threshold. Over half of income already committed to obligations.' },
      { label: 'BNPL Exposure', value: '₹24,800/mo', status: 'High', isWarning: true, insight: 'Heavy BNPL usage — frequent short-term credit indicates recurring end-of-month stress.' },
      { label: 'Income Dip Months', value: '3 of 12', status: 'Review', isWarning: true, insight: 'Income dropped >30% in 3 of 12 months. Pattern indicates cyclical cash shortfalls.' },
      { label: 'Hidden EMIs', value: '5 obligations', status: 'Flag', isWarning: true, insight: 'Multiple recurring payments flagged as potential undisclosed loans. Impacts affordability.' },
    ],
    lastAnalysis: { ranAt: '18 Jul 2026 · 08:12 AM', triggeredBy: 'Alert trigger (inflow drop detected)', duration: '2.1s', result: '2 critical alerts raised', nextRun: '18 Jul 2026 · 02:12 PM' },
    consentExpiryDays: 7,
    aa: { connected: false, label: 'Not connected', details: 'Requires consent', lastSync: '—', nextSync: '—' },
    pdf: { connected: true, label: 'ICICI Bank CA', details: '12 PDFs parsed', lastSync: 'Today', nextSync: 'Manual only' },
    other: { connected: false, name: 'GSTN & ITR', label: 'ITR 2024 parsed', details: 'Offline', lastSync: '—', nextSync: '—' },
    models: [
      { name: 'Income Volatility', desc: 'Freelance deposit variance tracking', val: 'High Risk', color: 'bg-rose-400' },
      { name: 'Tax Return Crosscheck', desc: 'Matching ITR to bank deposits', val: 'Pending', color: 'bg-amber-400' },
    ],
    features: {
      netCashflow: -7440,
      emiToInflowRatio: 0.516,
      totalInflow: 218000,
      savingsRate: 0.04,
      inflowConcentration: null,
      fixedObligationRatio: 0.516,
      highRiskSpendRatio: 0.02,
    }
  },
  {
    id: 'ACC-5301', appId: 'APP-2023-301', userId: 'USR-3301',
    name: 'Sharma Textiles', type: 'MSME', bank: 'SBI CC + CA',
    txnCount: 6891, lastSync: '1 hr ago', emiAmount: 95000, emiDueDay: 1,
    surplusEmiRatio: 1.42, bounceProbability: 18,
    alerts: [
      { id: 'c1', type: 'dso_rising', severity: 'warning', detail: 'DSO increased from 45 to 72 days vs last quarter', timestamp: 'Jun 30, 2026' },
    ],
    forecast: [
      { date: 'Jul 1', balance: 890000, isProjected: false, isEmiDue: true },
      { date: 'Jul 10', balance: 1240000, isProjected: false },
      { date: 'Jul 18', balance: 1460000, isProjected: false },
      { date: 'Jul 25', balance: 1680000, isProjected: true },
      { date: 'Aug 1', balance: 1590000, isProjected: true, isEmiDue: true },
      { date: 'Aug 15', balance: 1820000, isProjected: true },
      { date: 'Aug 25', balance: 2050000, isProjected: true },
    ],
    metrics: [
      { label: 'Net Monthly Revenue', value: '₹14,60,000', status: 'Growing', isWarning: false, insight: 'Consistent MoM growth in revenue credits. Healthy, expanding business.' },
      { label: 'DSCR', value: '1.42x', status: 'Healthy', isWarning: false, insight: 'Business generates 42% more cash than needed to cover debt obligations.' },
      { label: 'DSO', value: '72 days', status: 'Rising', isWarning: true, insight: 'DSO increased from 45 to 72 days over last 3 quarters. Working capital stress signal.' },
      { label: 'Inflow Concentration', value: '64% single vendor', status: 'Warning', isWarning: true, insight: '64% of revenue from one vendor. Systemic risk if that vendor delays payment.' },
      { label: 'GST–Bank Crosscheck', value: 'Consistent', status: 'Verified', isWarning: false, insight: 'Bank deposits align closely with GST returns. Revenue authenticity confirmed.' },
    ],
    lastAnalysis: { ranAt: '18 Jul 2026 · 09:00 AM', triggeredBy: 'Scheduled (every 6 hours)', duration: '3.4s', result: '1 warning alert raised (DSO rising)', nextRun: '18 Jul 2026 · 03:00 PM' },
    consentExpiryDays: 89,
    aa: { connected: true, label: 'SBI CC + CA', details: '6,891 txns', lastSync: '1 hr ago', nextSync: '14 mins' },
    pdf: { connected: false, label: 'No PDFs', details: 'AA preferred', lastSync: '—', nextSync: 'N/A' },
    other: { connected: true, name: 'Tally / ERP', label: 'TallyPrime', details: '3-way sync', lastSync: '1 hr ago', nextSync: 'Hourly' },
    models: [
      { name: 'Entity Resolution', desc: 'Cross-referencing vendor & merchant IDs', val: '84,210 nodes', color: 'bg-indigo-500' },
      { name: 'GST Reconciliation', desc: 'Matching ledger entries to GST filings', val: 'Synced', color: 'bg-teal-500' },
    ],
    features: {
      netCashflow: 1365000,
      emiToInflowRatio: 0.065,
      totalInflow: 1460000,
      savingsRate: null,
      inflowConcentration: 0.64,
      fixedObligationRatio: null,
      highRiskSpendRatio: null,
    }
  },
];

// ─── useChartContextMenu Hook ──────────────────────────────────────────────────
export const useChartContextMenu = (onAskZeyro?: (text: string) => void) => {
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const closeMenu = () => setContextMenu(null);

  const renderContextMenu = () => (
    <AnimatePresence>
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={closeMenu} onContextMenu={(e) => { e.preventDefault(); closeMenu(); }} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            className="fixed z-50 bg-gray-900 text-white rounded-lg shadow-xl border border-gray-700 py-1 min-w-[140px]"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button 
              onClick={() => {
                onAskZeyro?.('Analyze this chart pattern in detail.');
                closeMenu();
              }}
              className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Ask Zeyro
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return { handleContextMenu, renderContextMenu };
};

// ─── AccountSearchBar ─────────────────────────────────────────────────────────
const AccountSearchBar: React.FC<{
  profiles: AccountProfile[];
  selectedId: string;
  onSelect: (p: AccountProfile) => void;
}> = ({ profiles, selectedId, onSelect }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filtered = profiles.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.id.toLowerCase().includes(query.toLowerCase()) ||
    p.appId.toLowerCase().includes(query.toLowerCase()) ||
    p.userId.toLowerCase().includes(query.toLowerCase()) ||
    p.bank.toLowerCase().includes(query.toLowerCase()) ||
    p.type.toLowerCase().includes(query.toLowerCase())
  );

  const selected = profiles.find(p => p.id === selectedId);

  const sevDot = (p: AccountProfile) => {
    if (p.alerts.some(a => a.severity === 'critical')) return 'bg-red-500';
    if (p.alerts.some(a => a.severity === 'warning')) return 'bg-amber-400';
    return 'bg-green-500';
  };

  return (
    <div className="relative w-full">
      <div
        className="flex items-center gap-3 p-3 bg-white border border-[#E6E5DF] rounded-xl cursor-text shadow-sm hover:border-gray-300 transition-colors"
        onClick={() => setIsOpen(true)}
      >
        <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input
          type="text"
          placeholder="Search by name, ID, bank, or type…"
          value={query}
          onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          className="flex-1 text-[13px] outline-none bg-transparent text-gray-800 placeholder:text-gray-400"
        />
        {selected && !query && (
          <div className="flex items-center gap-2 shrink-0">
            <span className={`w-2 h-2 rounded-full ${sevDot(selected)}`} />
            <span className="text-[11px] font-semibold text-gray-700">{selected.name}</span>
            <span className="text-[10px] text-gray-400 font-mono">{selected.id}</span>
          </div>
        )}
        {query && (
          <button onClick={e => { e.stopPropagation(); setQuery(''); setIsOpen(false); }} className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0 hover:bg-gray-200">
            <svg className="w-3 h-3 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        )}
      </div>
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
              className="absolute top-full mt-1.5 left-0 right-0 z-20 bg-white border border-[#E6E5DF] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] overflow-hidden"
            >
              {filtered.length === 0 ? (
                <div className="p-4 text-center text-[12px] text-gray-400">No accounts match "{query}"</div>
              ) : (
                <div className="max-h-56 overflow-y-auto divide-y divide-gray-50">
                  {filtered.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { onSelect(p); setIsOpen(false); setQuery(''); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${p.id === selectedId ? 'bg-gray-50' : ''}`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${sevDot(p)}`} />
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-semibold text-gray-900">{p.name}</span>
                          <span className="text-[10px] font-mono text-gray-400">{p.id}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-gray-400">{p.bank} · {p.type}</span>
                          <span className="text-[9px] font-mono text-gray-300">·</span>
                          <span className="text-[9.5px] font-mono text-indigo-400">{p.appId}</span>
                          <span className="text-[9px] font-mono text-gray-300">·</span>
                          <span className="text-[9.5px] font-mono text-gray-400">{p.userId}</span>
                        </div>
                      </div>
                      <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide border ${
                        p.bounceProbability >= 60 ? 'bg-red-50 border-red-100 text-red-700' :
                        p.bounceProbability >= 30 ? 'bg-amber-50 border-amber-100 text-amber-700' :
                        'bg-green-50 border-green-100 text-green-700'
                      }`}>{p.bounceProbability}% bounce</div>
                      {p.id === selectedId && <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </button>
                  ))}
                </div>
              )}
              <div className="px-4 py-2 border-t border-gray-50 bg-gray-50/60 flex justify-between">
                <span className="text-[10px] text-gray-400">{filtered.length} account{filtered.length !== 1 ? 's' : ''} · {profiles.filter(p => p.alerts.some(a => a.severity === 'critical')).length} critical alerts</span>
                <span className="text-[10px] text-gray-400 font-mono">{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── LastAnalysisBlock ────────────────────────────────────────────────────────
const LastAnalysisBlock = ({ profile }: { profile: AccountProfile }) => {
  const [isRunning, setIsRunning] = useState(false);
  const handleRunNow = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 2000);
  };

  return (
    <div className="flex items-start justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100 mb-6">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-gray-900">Last Analysis</span>
          <span className="text-[10px] text-gray-500 font-mono">{profile.lastAnalysis.ranAt}</span>
          <div className="w-1 h-1 rounded-full bg-gray-300" />
          <span className="text-[10px] text-gray-500">{profile.lastAnalysis.duration}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
          <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          {profile.lastAnalysis.triggeredBy}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-800 mt-0.5">
          <svg className="w-3.5 h-3.5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          {profile.lastAnalysis.result}
        </div>
      </div>
      
      <div className="flex flex-col items-end gap-2 min-w-[140px]">
        <button
          onClick={handleRunNow}
          disabled={isRunning}
          className={`flex-1 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-semibold transition-colors transition-transform duration-[160ms] ease-out active:scale-[0.97] ${
            isRunning
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-900 text-white hover:bg-black shadow-sm'
          }`}
        >
          {isRunning ? (
            <>
              <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
              Running...
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Run Analysis Now
            </>
          )}
        </button>
        <div className="text-[9px] text-gray-400 font-mono text-right w-full pr-1">
          Next scheduled: {profile.lastAnalysis.nextRun}
        </div>
      </div>
    </div>
  );
};

const CustomDropdown = ({ label, value, options, onChange }: { label: string, value: string, options: { label: string, value: string }[], onChange: (v: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  
  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [isOpen]);

  const selectedLabel = options.find(o => o.value === value)?.label || value;

  return (
    <div className="relative inline-block text-left z-10">
      <button
        ref={triggerRef}
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-[160ms] ease-out active:scale-[0.97] border shadow-sm ${
          isOpen ? 'bg-gray-100 border-gray-300 text-gray-900' : 'bg-white border-[#E6E5DF] text-gray-700 hover:border-gray-300'
        }`}
      >
        <span className="text-gray-400 font-normal">{label}:</span>
        <span>{selectedLabel}</span>
        <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
            className="absolute z-50 mt-1 w-48 rounded-xl bg-white/95 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 py-1 overflow-hidden"
            style={{ transformOrigin: 'top left' }}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`w-full text-left px-3 py-2 text-[11px] font-medium transition-colors duration-[120ms] flex items-center justify-between ${
                  value === opt.value ? 'bg-indigo-50/70 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {opt.label}
                {value === opt.value && <svg className="w-3.5 h-3.5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── CashflowDataView ─────────────────────────────────────────────────────────
export const CashflowDataView: React.FC<{ data: any, selectedNode: string, initialSelectedId?: string | null, onProfileSelect?: (id: string | null) => void, onNavigate?: (tab: 'OUTPUT' | 'REPORTS' | 'INPUT', id: string) => void }> = ({ data, selectedNode, initialSelectedId, onProfileSelect, onNavigate }) => {
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId || null);

  useEffect(() => {
    onProfileSelect?.(selectedId);
  }, [selectedId, onProfileSelect]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Salaried' | 'Self-Employed' | 'MSME'>('All');
  type SortKey = 'name' | 'type' | 'sources' | 'bounce' | 'consent' | 'netCashflow' | 'emiRatio' | 'inflow' | 'savingsRate' | 'inflowConc';
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  type RiskFilter = 'All' | 'highEmiRatio' | 'negativeCashflow' | 'highRiskSpend' | 'lowSavings' | 'vendorConc';
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('All');

  const profile = selectedId ? ACCOUNT_PROFILES.find(p => p.id === selectedId) : null;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortHeader = ({ label, sortable, col, align = 'left' }: { label: string, sortable?: boolean, col?: SortKey, align?: 'left' | 'right' }) => (
    <div 
      className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : ''} ${sortable ? 'cursor-pointer hover:text-gray-700 transition-colors active:scale-[0.97]' : ''}`}
      onClick={() => sortable && col && handleSort(col)}
    >
      <span>{label}</span>
      {sortable && col && (
        <span className="flex flex-col opacity-40">
          <svg className={`w-2 h-2 ${sortKey === col && sortDir === 'asc' ? 'text-gray-900 opacity-100' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15"/></svg>
          <svg className={`w-2 h-2 -mt-[2px] ${sortKey === col && sortDir === 'desc' ? 'text-gray-900 opacity-100' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
        </span>
      )}
    </div>
  );

  const SourceRow = ({ icon, title, subtitle, connected, badgeLabel, badgeColor, onConnect }: {
    icon: React.ReactNode; title: string; subtitle: string;
    connected: boolean; badgeLabel: string; badgeColor: string;
    onConnect?: () => void;
  }) => (
    <div className={`flex items-center justify-between p-4 border rounded-xl transition-colors duration-200 group ${
      connected
        ? 'bg-white border-gray-100 hover:border-gray-200 cursor-pointer'
        : 'bg-gray-50/60 border-dashed border-gray-200 opacity-70 hover:opacity-90'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
          connected ? `${badgeColor} opacity-90` : 'bg-gray-100 text-gray-400'
        }`}>{icon}</div>
        <div className="flex flex-col">
          <span className={`text-[13px] font-semibold ${connected ? 'text-gray-900' : 'text-gray-500'}`}>{title}</span>
          <span className="text-[11px] text-gray-400">{subtitle}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {connected ? (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border bg-green-50 border-green-100 text-green-700">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-widest">{badgeLabel}</span>
          </div>
        ) : (
          <button onClick={onConnect} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-gray-300 bg-white text-gray-600 text-[10px] font-semibold hover:border-gray-400 hover:bg-gray-50 active:scale-[0.97] transition-all duration-[120ms] shadow-sm">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            Connect
          </button>
        )}
      </div>
    </div>
  );

  const PortfolioTableView = () => {
    function compare<T>(a: T | null | undefined, b: T | null | undefined, dir: number): number {
      if (a == null && b == null) return 0;
      if (a == null) return 1;
      if (b == null) return -1;
      return a > b ? dir : a < b ? -dir : 0;
    }

    const filteredProfiles = ACCOUNT_PROFILES
      .filter(p => typeFilter === 'All' || p.type === typeFilter)
      .filter(p => {
        switch (riskFilter) {
          case 'highEmiRatio': return p.features.emiToInflowRatio > 0.45;
          case 'negativeCashflow': return p.features.netCashflow < 0;
          case 'highRiskSpend': return (p.features.highRiskSpendRatio ?? 0) > 0.01;
          case 'lowSavings': return p.features.savingsRate !== null && p.features.savingsRate < 0.1;
          case 'vendorConc': return (p.features.inflowConcentration ?? 0) > 0.5;
          default: return true;
        }
      })
      .filter(p => 
        [p.name, p.id, p.type].some(v => v.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .sort((a, b) => {
        if (!sortKey) return 0;
        const dir = sortDir === 'asc' ? 1 : -1;
        switch (sortKey) {
          case 'name': return a.name.localeCompare(b.name) * dir;
          case 'type': return a.type.localeCompare(b.type) * dir;
          case 'sources': {
            const aCnt = [a.aa.connected, a.pdf.connected, a.other.connected].filter(Boolean).length;
            const bCnt = [b.aa.connected, b.pdf.connected, b.other.connected].filter(Boolean).length;
            return (aCnt - bCnt) * dir;
          }
          case 'bounce': return (a.bounceProbability - b.bounceProbability) * dir;
          case 'consent': return (a.consentExpiryDays - b.consentExpiryDays) * dir;
          case 'netCashflow': return compare(a.features.netCashflow, b.features.netCashflow, dir);
          case 'emiRatio': return compare(a.features.emiToInflowRatio, b.features.emiToInflowRatio, dir);
          case 'inflow': return compare(a.features.totalInflow, b.features.totalInflow, dir);
          case 'savingsRate': return compare(a.features.savingsRate, b.features.savingsRate, dir);
          case 'inflowConc': return compare(a.features.inflowConcentration, b.features.inflowConcentration, dir);
          default: return 0;
        }
      });

    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-white border border-[#E6E5DF] rounded-xl shadow-sm">
              <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                type="text"
                placeholder="Search by name, ID, or type…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 text-[12px] outline-none bg-transparent text-gray-800 placeholder:text-gray-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors active:scale-[0.97]">
                  <svg className="w-2.5 h-2.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap mt-2">
            <CustomDropdown
              label="Type"
              value={typeFilter}
              onChange={(v) => setTypeFilter(v as any)}
              options={[
                { label: 'All Types', value: 'All' },
                { label: 'Salaried', value: 'Salaried' },
                { label: 'Self-Employed', value: 'Self-Employed' },
                { label: 'MSME', value: 'MSME' },
              ]}
            />
            
            <CustomDropdown
              label="Risk Flag"
              value={riskFilter}
              onChange={(v) => setRiskFilter(v as any)}
              options={[
                { label: 'Any', value: 'All' },
                { label: 'High EMI Ratio', value: 'highEmiRatio' },
                { label: 'Negative Cashflow', value: 'negativeCashflow' },
                { label: 'High-Risk Spend', value: 'highRiskSpend' },
                { label: 'Low Savings', value: 'lowSavings' },
                { label: 'Vendor Concentration', value: 'vendorConc' },
              ]}
            />
            
            <div className="flex items-center gap-1 ml-auto">
              <CustomDropdown
                label="Sort By"
                value={sortKey || 'name'}
                onChange={(v) => setSortKey(v as any)}
                options={[
                  { label: 'Name', value: 'name' },
                  { label: 'Consent Status', value: 'consent' },
                  { label: 'Bounce Risk', value: 'bounce' },
                  { label: 'Net Cashflow', value: 'netCashflow' },
                  { label: 'EMI / Inflow Ratio', value: 'emiRatio' },
                ]}
              />
              <button 
                onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
                className="w-7 h-7 rounded-lg border border-[#E6E5DF] bg-white flex items-center justify-center text-gray-500 hover:border-gray-300 hover:text-gray-900 transition-colors active:scale-[0.97] shadow-sm"
              >
                {sortDir === 'asc' ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-0 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm mt-2">
          {/* Table Header */}
          <div className="grid grid-cols-[2.5fr_1.2fr_1.2fr_1.2fr_1.2fr_1fr] gap-4 px-4 py-3 bg-gray-50/80 border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            <div>Account & App ID</div>
            <div>Consent Status</div>
            <div>Bounce Risk</div>
            <div>Net CF</div>
            <div>EMI/Inflow</div>
            <div className="text-right">Action</div>
          </div>
          
          {/* Table Rows */}
          {filteredProfiles.length === 0 ? (
            <div className="py-10 text-center border-dashed border-gray-200 rounded-b-xl bg-gray-50">
              <p className="text-[12px] font-medium text-gray-500">No accounts match your filters</p>
              <button onClick={() => { setSearchQuery(''); setTypeFilter('All'); setRiskFilter('All'); setSortKey(null); }} className="mt-1.5 text-[11px] text-indigo-600 font-semibold hover:text-indigo-800 transition-colors active:scale-[0.97]">Clear filters</button>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100">
              {filteredProfiles.map((p, idx) => {
                const hasCriticalAlert = p.alerts.some(a => a.severity === 'critical');
                
                return (
                  <motion.button
                    key={p.id}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.22, delay: idx * 0.04 }}
                    onClick={() => {
                      setSelectedId(p.id);
                      setSearchQuery('');
                      setTypeFilter('All');
                      setRiskFilter('All');
                      setSortKey(null);
                    }}
                    className="w-full grid grid-cols-[2.5fr_1.2fr_1.2fr_1.2fr_1.2fr_1fr] gap-4 px-4 py-3.5 items-center hover:bg-gray-50/60 transition-colors text-left group"
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{p.name}</span>
                        {hasCriticalAlert && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-gray-500">{p.id}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{p.type}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        {p.aa.connected ? (
                          <svg className="w-3.5 h-3.5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        ) : (
                          <svg className="w-3.5 h-3.5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        )}
                        <span className={`text-[11px] font-medium ${p.aa.connected ? 'text-gray-700' : 'text-amber-700'}`}>
                          {p.aa.connected ? 'AA Active' : 'Consent Req'}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">{p.consentExpiryDays} days left</span>
                    </div>

                    <div className="flex flex-col gap-1.5 pr-2">
                      <span className={`text-[11px] font-bold ${p.bounceProbability > 50 ? 'text-red-600' : p.bounceProbability > 15 ? 'text-amber-600' : 'text-green-600'}`}>
                        {p.bounceProbability}% Prob
                      </span>
                      <div className="w-full max-w-[60px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          style={{ transformOrigin: 'left' }}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: p.bounceProbability / 100 }}
                          transition={{ duration: 0.6, delay: idx * 0.05 + 0.2, ease: "easeOut" }}
                          className={`h-full w-full rounded-full ${
                            p.bounceProbability > 50 ? 'bg-red-500' : p.bounceProbability > 15 ? 'bg-amber-500' : 'bg-green-500'
                          }`}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <span className={`text-[10px] font-semibold font-mono ${
                        p.features.netCashflow < 0 ? 'text-red-600' : 'text-green-700'
                      }`}>
                        {p.features.netCashflow < 0 ? '−' : '+'}
                        {Math.abs(p.features.netCashflow) >= 100000
                          ? `₹${(Math.abs(p.features.netCashflow) / 100000).toFixed(1)}L`
                          : `₹${(Math.abs(p.features.netCashflow) / 1000).toFixed(0)}k`}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <span className={`text-[10px] font-semibold font-mono ${
                        p.features.emiToInflowRatio > 0.45 ? 'text-red-600' :
                        p.features.emiToInflowRatio > 0.35 ? 'text-amber-600' : 'text-gray-600'
                      }`}>
                        {(p.features.emiToInflowRatio * 100).toFixed(0)}%
                      </span>
                    </div>

                    <div className="flex justify-end">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        View <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const SingleAccountView = ({ p }: { p: AccountProfile }) => (
    <div className="flex flex-col gap-4">
      {/* Profile Header */}
      <div className="flex items-start justify-between bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] font-bold text-gray-900">{p.name}</h2>
            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${
              p.type === 'MSME' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' :
              p.type === 'Self-Employed' ? 'bg-purple-50 border-purple-100 text-purple-700' :
              'bg-blue-50 border-blue-100 text-blue-700'
            }`}>{p.type}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-medium text-gray-500">
            <span className="font-mono">{p.id}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>{p.bank}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>{p.txnCount.toLocaleString()} transactions</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="text-[12px] font-bold text-gray-900">EMI: ₹{p.emiAmount.toLocaleString()}</div>
          <div className="text-[10px] text-gray-500 font-medium">Due on {p.emiDueDay}th</div>
        </div>
      </div>

      <LastAnalysisBlock profile={p} />
      
      {/* Connected sources header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-gray-900">Data Pipelines</span>
        </div>
        {(() => {
          const total = 3;
          const cnt = [p.aa.connected, p.pdf.connected, p.other.connected].filter(Boolean).length;
          return (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
              cnt === total ? 'bg-green-50 border-green-100 text-green-700' :
              cnt === 0 ? 'bg-red-50 border-red-100 text-red-600' :
              'bg-amber-50 border-amber-100 text-amber-700'
            }`}>{cnt}/{total} active</span>
          );
        })()}
      </div>

      <div className="flex flex-col gap-2">
        {p.type === 'MSME' ? (
          <>
            <SourceRow onConnect={() => onNavigate && onNavigate('INPUT', p.id)} connected={p.aa.connected} title="GST Portal (GSTN feed)" subtitle={`${p.aa.label} · ${p.aa.details}`} badgeLabel="Active" badgeColor="bg-indigo-50 text-indigo-600" icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>} />
            <SourceRow onConnect={() => onNavigate && onNavigate('INPUT', p.id)} connected={p.pdf.connected} title="Tally / ERP" subtitle={`${p.pdf.label} · ${p.pdf.details}`} badgeLabel="Synced" badgeColor="bg-blue-50 text-blue-600" icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>} />
            <SourceRow onConnect={() => onNavigate && onNavigate('INPUT', p.id)} connected={p.other.connected} title="Trade Receivables" subtitle={`${p.other.label} · ${p.other.details}`} badgeLabel="Active" badgeColor="bg-purple-50 text-purple-600" icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>} />
          </>
        ) : p.type === 'Self-Employed' ? (
          <>
            <SourceRow onConnect={() => onNavigate && onNavigate('INPUT', p.id)} connected={p.aa.connected} title="Account Aggregator" subtitle={`${p.aa.label} · ${p.aa.details}`} badgeLabel="Active" badgeColor="bg-purple-50 text-purple-600" icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} />
            <SourceRow onConnect={() => onNavigate && onNavigate('INPUT', p.id)} connected={p.pdf.connected} title="ITR-2 / Form 16" subtitle={`${p.pdf.label} · ${p.pdf.details}`} badgeLabel="Parsed" badgeColor="bg-blue-50 text-blue-600" icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>} />
            <SourceRow onConnect={() => onNavigate && onNavigate('INPUT', p.id)} connected={p.other.connected} title="BNPL Aggregator" subtitle={`${p.other.label} · ${p.other.details}`} badgeLabel="Active" badgeColor="bg-indigo-50 text-indigo-600" icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>} />
          </>
        ) : (
          <>
            <SourceRow onConnect={() => onNavigate && onNavigate('INPUT', p.id)} connected={p.aa.connected} title="Account Aggregator" subtitle={`${p.aa.label} · ${p.aa.details}`} badgeLabel="Active" badgeColor="bg-purple-50 text-purple-600" icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} />
            <SourceRow onConnect={() => onNavigate && onNavigate('INPUT', p.id)} connected={p.pdf.connected} title="PDF Statements" subtitle={`${p.pdf.label} · ${p.pdf.details}`} badgeLabel="Parsed" badgeColor="bg-blue-50 text-blue-600" icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>} />
            <SourceRow onConnect={() => onNavigate && onNavigate('INPUT', p.id)} connected={p.other.connected} title={p.other.name} subtitle={`${p.other.label} · ${p.other.details}`} badgeLabel="Active" badgeColor="bg-indigo-50 text-indigo-600" icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>} />
          </>
        )}
      </div>
      
      <div className="bg-white border border-[#E6E5DF] rounded-xl overflow-hidden mt-2">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <span className="text-[11px] font-semibold text-gray-700 uppercase tracking-wider">Features Extracted</span>
          <span className="text-[10px] font-mono text-gray-400">{p.txnCount.toLocaleString()} records processed</span>
        </div>
        <div className="divide-y divide-[#F0EFEA]">
          {(p.type === 'MSME' ? [
            { name: 'GST Reconciliation', desc: 'Matching ledger entries to GST filings', val: 'Synced', color: 'bg-teal-500' },
            { name: 'DSO Tracker', desc: 'Days Sales Outstanding calculation', val: '72 days', color: 'bg-amber-500' },
            { name: 'Vendor Concentration', desc: 'Single vendor reliance analysis', val: '64%', color: 'bg-rose-500' },
            { name: 'Seasonal Pattern', desc: 'Historical cashflow dip detection', val: 'Oct-Nov', color: 'bg-indigo-500' },
          ] : p.type === 'Self-Employed' ? [
            { name: 'Income Volatility', desc: 'Deposit variance tracking', val: 'High Risk', color: 'bg-rose-400' },
            { name: 'Tax Return Crosscheck', desc: 'Matching ITR to bank deposits', val: 'Pending', color: 'bg-amber-400' },
            { name: 'Irregular Deposit Detector', desc: 'Anomaly detection for non-salary credits', val: 'Active', color: 'bg-teal-500' },
          ] : [
            { name: 'Merchant Categorization', desc: 'ML-driven retail spend clustering', val: '42 classes', color: 'bg-indigo-500' },
            { name: 'Salary Tracking', desc: 'Recurring deposit tracking', val: 'Active', color: 'bg-teal-500' },
          ]).map((model, idx) => (
            <div key={idx} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full ${model.color} shrink-0`} />
                <div className="flex flex-col">
                  <span className="text-[12px] font-medium text-gray-900">{model.name}</span>
                  <span className="text-[10px] text-gray-400">{model.desc}</span>
                </div>
              </div>
              <span className="text-[12px] font-mono font-medium text-gray-700">{model.val}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Call to action for Output */}
      {/* Call to action for Output */}
      {onNavigate && (
        <div className="mt-2 flex justify-end gap-2">
          <button 
            onClick={() => onNavigate('REPORTS', p.id)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-[12px] font-semibold hover:bg-blue-100 transition-colors active:scale-95 duration-150"
          >
            View Engineered Features 
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
          <button 
            onClick={() => onNavigate('OUTPUT', p.id)}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-[12px] font-semibold hover:bg-red-100 transition-colors active:scale-95 duration-150"
          >
            Alerts
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-4 font-sans relative">
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-gray-900">
          {selectedId ? 'Account Drill-Down' : 'Portfolio Cashflow Sources'}
        </h3>
        
        {/* Back button (drill-down mode only) */}
        <AnimatePresence>
          {selectedId && (
            <motion.button
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              onClick={() => setSelectedId(null)}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 hover:text-gray-900 transition-colors w-fit active:scale-95"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              All Accounts
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Mode switch */}
      <AnimatePresence mode="wait">
        {!selectedId ? (
          <motion.div key="portfolio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <PortfolioTableView />
          </motion.div>
        ) : profile ? (
          <motion.div key={selectedId} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}>
            <SingleAccountView p={profile} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

const DateFilterToolbar: React.FC<{
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
}> = ({ selectedFilter, onSelectFilter }) => {
  const [localFilter, setLocalFilter] = React.useState(selectedFilter);

  React.useEffect(() => {
    setLocalFilter(selectedFilter);
  }, [selectedFilter]);

  const handleSelect = (filter: string) => {
    setLocalFilter(filter);
    if (filter !== 'Custom Range') {
      onSelectFilter(filter);
    }
  };

  const filters = ['Today', 'This Week', 'This Month', 'This Year'];
  return (
    <div className="flex flex-col items-end gap-2 relative select-none">
      <div className="flex items-center gap-2">
        <div className="flex bg-gray-100/80 p-1 rounded-lg border border-gray-200/50">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => handleSelect(filter)}
              className={`relative px-3 py-1 text-[11px] font-semibold rounded-md transition-all duration-200 outline-none whitespace-nowrap ${
                localFilter === filter ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {localFilter === filter && (
                <motion.div
                  layoutId="activeTimelineFilter"
                  className="absolute inset-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-md border border-gray-200/50"
                  initial={false}
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                />
              )}
              <span className="relative z-10">{filter}</span>
            </button>
          ))}
        </div>
        
        <div className="relative">
          <select 
            className="appearance-none bg-white border border-gray-200/80 rounded-lg pl-3 pr-7 py-1 text-[11px] font-semibold text-gray-600 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.02)] h-[28px]"
            value={!filters.includes(localFilter) ? localFilter : ""}
            onChange={(e) => handleSelect(e.target.value)}
          >
            <option value="" disabled>Select Month or Range</option>
            <option value="Jan 2026">Jan 2026</option>
            <option value="Feb 2026">Feb 2026</option>
            <option value="Mar 2026">Mar 2026</option>
            <option value="Apr 2026">Apr 2026</option>
            <option value="May 2026">May 2026</option>
            <option value="Jun 2026">Jun 2026</option>
            <option value="Jul 2026">Jul 2026</option>
            <option disabled>───────</option>
            <option value="Custom Range">Custom Range...</option>
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {localFilter === 'Custom Range' && (
          <motion.div 
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex items-center gap-1.5 overflow-hidden origin-top-right w-fit"
          >
            <input type="month" className="bg-white border border-gray-200/80 rounded-md px-2 text-[11px] font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)] h-[28px] w-[105px] shrink-0" defaultValue="2025-10" />
            <span className="text-gray-400 text-[11px] font-semibold shrink-0">to</span>
            <input type="month" className="bg-white border border-gray-200/80 rounded-md px-2 text-[11px] font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)] h-[28px] w-[105px] shrink-0" defaultValue="2026-03" />
            <button onClick={() => onSelectFilter('Custom Range')} className="h-[28px] px-3 ml-0.5 bg-gray-900 text-white text-[11px] font-semibold rounded-md hover:bg-gray-800 transition-colors shadow-sm shrink-0 whitespace-nowrap">
              Apply
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


export const CashflowInsightsView: React.FC<{ onAskZeyro?: (text: string) => void }> = ({ onAskZeyro }) => {
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [insightType, setInsightType] = useState<'general' | 'msme'>('general');
  const [timeline, setTimeline] = useState('This Month');
  const { handleContextMenu, renderContextMenu } = useChartContextMenu(onAskZeyro);

  const dynamicData = React.useMemo(() => {
    switch (timeline) {
      case 'Today':
        return {
          timeText: "today's intraday",
          applicants: "4.2K",
          growth: "+2% DoD",
          foir: "37.1%",
          entities: "1,204",
          msmeGrowth: "+1% DoD",
          dscr: "1.3x"
        };
      case 'This Week':
        return {
          timeText: "this week's",
          applicants: "45.1K",
          growth: "+5% WoW",
          foir: "37.8%",
          entities: "12,450",
          msmeGrowth: "+2% WoW",
          dscr: "1.35x"
        };
      case 'This Year':
        return {
          timeText: "the 12-month",
          applicants: "2.4M",
          growth: "+12% YoY",
          foir: "38.4%",
          entities: "84,210",
          msmeGrowth: "+4% QoQ",
          dscr: "1.4x"
        };
      case 'Custom Range':
        return {
          timeText: "the custom selected",
          applicants: "750K",
          growth: "+6% vs prev",
          foir: "37.9%",
          entities: "32,500",
          msmeGrowth: "+2% vs prev",
          dscr: "1.36x"
        };
      default:
        return {
          timeText: timeline === 'This Month' ? "this month's" : `the ${timeline}`,
          applicants: "185K",
          growth: "+8% MoM",
          foir: "38.1%",
          entities: "24,100",
          msmeGrowth: "+3% MoM",
          dscr: "1.38x"
        };
    }
  }, [timeline]);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionRect(rect);
      setSelectedText(selection.toString().trim());
    } else {
      setSelectionRect(null);
      setSelectedText('');
    }
  };

  const handleAsk = () => {
    if (onAskZeyro && selectedText) {
      onAskZeyro(selectedText);
      window.getSelection()?.removeAllRanges();
      setSelectionRect(null);
      setSelectedText('');
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans relative select-text" onMouseUp={handleMouseUp}>
      {renderContextMenu()}
      
      {/* Header Section */}
      <div className="flex justify-between items-end gap-6 border-b border-gray-100 pb-5 select-none">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-[#111111]">Auto-Generated Insights</h2>
            <p className="text-xs text-gray-400">Deep dive into behavioral patterns detected across the {insightType === 'general' ? 'retail' : 'business'} dataset.</p>
          </div>
          
          <div className="flex bg-gray-100/80 p-1 rounded-lg border border-gray-200/50 w-fit">
            <button 
              onClick={() => setInsightType('general')}
              className={`relative px-4 py-1.5 text-[11px] font-semibold rounded-md transition-all duration-200 outline-none whitespace-nowrap ${insightType === 'general' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {insightType === 'general' && (
                <motion.div layoutId="activeInsightType" className="absolute inset-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-md border border-gray-200/50" initial={false} transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }} />
              )}
              <span className="relative z-10">General Retail</span>
            </button>
            <button 
              onClick={() => setInsightType('msme')}
              className={`relative px-4 py-1.5 text-[11px] font-semibold rounded-md transition-all duration-200 outline-none whitespace-nowrap ${insightType === 'msme' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {insightType === 'msme' && (
                <motion.div layoutId="activeInsightType" className="absolute inset-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-md border border-gray-200/50" initial={false} transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }} />
              )}
              <span className="relative z-10">MSME Business</span>
            </button>
          </div>
        </div>
        
        <div className="flex shrink-0">
          <DateFilterToolbar selectedFilter={timeline} onSelectFilter={setTimeline} />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center shrink-0 shadow-md mt-1">
             <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          </div>
          <div className="bg-white border border-[#E6E5DF] rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.015)] text-[13px] text-gray-800 leading-relaxed max-w-2xl rounded-tl-sm relative group hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300">
            <span className="font-semibold block mb-1.5 flex items-center gap-2">
              Zeyro Core
              <span className="text-[9px] font-mono font-normal text-green-500 uppercase tracking-widest bg-green-50 px-1.5 py-0.5 rounded border border-green-100 flex items-center gap-1">
                <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
                Analysis Complete
              </span>
            </span>
            I have analyzed {dynamicData.timeText} transaction dataset across the {insightType === 'general' ? 'retail' : 'MSME'} portfolio. I found distinct macro-behavioral patterns that deviate from traditional underwriting assumptions. Here is my detailed report:
          </div>
        </motion.div>

        <motion.div 
          key={insightType} 
          initial="hidden" 
          animate="show" 
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.15, delayChildren: 0.3 }
            }
          }}
          className="ml-12 flex flex-col gap-12 text-[13px] leading-[1.8] text-gray-700 font-serif group/report"
        >
          {insightType === 'general' ? (
            <>
              <motion.section variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } } }} className="flex flex-col gap-5">
                <h3 className="font-sans font-bold text-gray-900 text-sm tracking-tight m-0 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  Retail Portfolio Snapshot
                </h3>

                <div className="grid grid-cols-3 gap-6 font-sans border-b border-gray-100 pb-8">
                  <div className="flex flex-col justify-between">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Total Applicants</span>
                    <div className="flex items-end gap-2 mt-2">
                      <span className="text-3xl font-bold text-gray-900 tracking-tighter">{dynamicData.applicants}</span>
                      <span className="text-[10px] text-green-600 font-bold mb-1.5 flex items-center"><svg className="w-3 h-3 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg> {dynamicData.growth}</span>
                    </div>
                    <div className="w-full h-1 bg-[#E6E5DF] mt-4 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }} className="h-full bg-gray-900"></motion.div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Cohort Distribution</span>
                    <div className="mt-3 flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[10px] font-semibold text-gray-700"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400"></span> Salaried</span><span>45%</span></div>
                      <div className="flex justify-between items-center text-[10px] font-semibold text-gray-700"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Pensioner</span><span>32%</span></div>
                      <div className="flex justify-between items-center text-[10px] font-semibold text-gray-700"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400"></span> Gig Worker</span><span>23%</span></div>
                    </div>
                    <div className="flex w-full h-1.5 mt-3 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '45%' }} transition={{ duration: 0.8, delay: 0.5 }} className="bg-blue-400"></motion.div>
                      <motion.div initial={{ width: 0 }} animate={{ width: '32%' }} transition={{ duration: 0.8, delay: 0.7 }} className="bg-amber-400"></motion.div>
                      <motion.div initial={{ width: 0 }} animate={{ width: '23%' }} transition={{ duration: 0.8, delay: 0.9 }} className="bg-rose-400"></motion.div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Average FOIR</span>
                    <div className="flex items-end gap-2 mt-1">
                      <span className="text-3xl font-bold text-gray-900 tracking-tighter">{dynamicData.foir}</span>
                      <span className="text-[10px] text-amber-600 font-bold mb-1.5 bg-amber-100 px-1.5 py-0.5 rounded">Elevated</span>
                    </div>
                    <div className="mt-2 text-[10px] text-gray-500 font-medium leading-relaxed">
                      The aggregate FOIR has crept up by 400bps compared to last quarter, heavily influenced by gig workers.
                    </div>
                  </div>
                </div>


              </motion.section>

              <motion.section variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } } }} className="flex flex-col gap-4 group">
                <h3 className="font-sans font-bold text-gray-900 text-sm tracking-tight m-0 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse shadow-[0_0_8px_rgba(251,113,133,0.6)]"></span>
                  1. Volatility Swings in Gig Worker Segments
                </h3>

                <div className="grid grid-cols-2 gap-8 items-center border-b border-gray-100 pb-8">
                  <div className="bg-[#FAF9F5] rounded-xl p-4 border border-[#E6E5DF] flex flex-col items-center justify-center h-40 relative group-hover:bg-[#F5F4F0] transition-colors">
                    <span className="absolute top-3 left-4 text-[9px] font-sans font-semibold text-gray-500 uppercase tracking-widest">Monthly Inflows</span>
                    <svg viewBox="0 0 200 80" className="w-full h-full pt-4 overflow-visible" onContextMenu={handleContextMenu}>
                      <defs>
                        <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#fb7185" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <line x1="0" y1="20" x2="200" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="0" y1="60" x2="200" y2="60" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                      <motion.path initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }} d="M 0,60 L 30,55 L 60,70 L 90,20 L 120,65 L 150,15 L 180,68 L 200,60" fill="none" stroke="#fb7185" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.5 }} d="M 0,60 L 30,55 L 60,70 L 90,20 L 120,65 L 150,15 L 180,68 L 200,60 L 200,80 L 0,80 Z" fill="url(#roseGradient)" />
                      <circle cx="90" cy="20" r="4" fill="#fb7185" className="animate-pulse" />
                      <circle cx="150" cy="15" r="4" fill="#fb7185" className="animate-pulse" />
                      <text x="90" y="10" fontSize="9" fill="#fb7185" textAnchor="middle" className="font-sans font-medium">Festive Peak</text>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p>
                      Over the past 6 months, we observed a pattern where profiles categorized under the 
                      <span className="font-semibold text-gray-900 bg-gray-50 px-1 rounded transition-colors group-hover:bg-rose-50"> Gig Worker </span> segment 
                      experience income volatility swings exceeding 40% month-over-month. Inflows peak dramatically around festive seasons but plummet during monsoons.
                    </p>
                    <p>
                      This severe lack of normalization creates a synthetic risk flag in FOIR models. We recommend introducing a 
                      <span className="italic text-gray-900 bg-gray-100 px-1 rounded transition-colors group-hover:bg-rose-50 group-hover:text-rose-700"> buffer-reserve requirement </span> 
                      during underwriting to smooth out these seasonal valleys.
                    </p>
                  </div>
                </div>
              </motion.section>

              <motion.section variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } } }} className="flex flex-col gap-4 group">
                <h3 className="font-sans font-bold text-gray-900 text-sm tracking-tight m-0 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shadow-[0_0_8px_rgba(45,212,191,0.6)]"></span>
                  2. Hidden Liabilities: BNPL Overload
                </h3>

                <div className="grid grid-cols-2 gap-8 items-center border-b border-gray-100 pb-8">
                  <div className="bg-[#FAF9F5] rounded-xl p-4 border border-[#E6E5DF] flex flex-col items-center justify-center h-40 relative group-hover:bg-[#F5F4F0] transition-colors">
                    <span className="absolute top-3 left-4 text-[9px] font-sans font-semibold text-gray-500 uppercase tracking-widest">EMI Composition</span>
                    <svg viewBox="0 0 200 100" className="w-full h-full pt-4">
                      <motion.rect initial={{ height: 0, y: 90 }} animate={{ height: 20, y: 70 }} transition={{ duration: 0.8, delay: 0.5 }} x="40" y="70" width="40" height="20" fill="#94a3b8" rx="2" />
                      <text x="60" y="98" fontSize="9" fill="#64748b" textAnchor="middle" className="font-sans font-medium">Reported</text>
                      
                      <motion.rect initial={{ height: 0, y: 90 }} animate={{ height: 20, y: 70 }} transition={{ duration: 0.8, delay: 0.5 }} x="120" y="70" width="40" height="20" fill="#94a3b8" rx="2" />
                      <motion.rect initial={{ height: 0, y: 70 }} animate={{ height: 50, y: 20 }} transition={{ duration: 0.8, delay: 1 }} x="120" y="20" width="40" height="50" fill="#2dd4bf" rx="2" />
                      <text x="140" y="98" fontSize="9" fill="#64748b" textAnchor="middle" className="font-sans font-medium">Actual</text>
                      
                      <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 1.8 }} d="M 120,40 L 95,40" fill="none" stroke="#2dd4bf" strokeWidth="1" strokeDasharray="2 2" />
                      <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} x="90" y="42" fontSize="9" fill="#14b8a6" textAnchor="end" className="font-sans font-bold">+18% BNPL Load</motion.text>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p>
                      Our transaction clustering engine detected an unusual density of micro-repayments (sub-₹2,000) occurring between the 1st and 5th of every month. These are primarily directed towards payment gateways associated with leading Buy-Now-Pay-Later providers.
                    </p>
                    <p>
                      Because these are not formally reported to the credit bureau immediately, they form a layer of 
                      <span className="font-semibold text-gray-900 bg-gray-50 px-1 rounded transition-colors group-hover:bg-teal-50"> Hidden Liability</span>. 
                      For applicants in the ₹4L-₹8L bracket, these hidden EMIs quietly consume up to 18% of their disposable income, rendering their bureau-reported FOIR artificially low.
                    </p>
                  </div>
                </div>
              </motion.section>

              <motion.section variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } } }} className="flex flex-col gap-4 group">
                <h3 className="font-sans font-bold text-gray-900 text-sm tracking-tight m-0 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shadow-[0_0_8px_rgba(192,132,252,0.6)]"></span>
                  3. Geographic Loan Concentration
                </h3>

                <div className="border-b border-gray-100 pb-8 flex flex-col gap-2">
                  <p>
                    Our geospatial clustering indicates a massive concentration of unsecured personal loans originating from Tier-2 cities in Karnataka and Tamil Nadu over the last 90 days. While origination volumes are up, the 
                    <span className="font-semibold text-gray-900 bg-gray-50 px-1 rounded transition-colors group-hover:bg-purple-50"> 30-day delinquency rate </span> 
                    in these specific zones has spiked by 1.8%.
                  </p>
                  <p>
                    This anomaly correlates strongly with localized shifts in auto-manufacturing and textile supply chain payouts. We advise tightening the geographic score modifier for unsecured debt in these PIN codes for the next quarter until macro stability resumes.
                  </p>
                </div>
              </motion.section>

              <motion.section variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } } }} className="flex flex-col gap-4 group">
                <h3 className="font-sans font-bold text-gray-900 text-sm tracking-tight m-0 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
                  4. EOM Salary Depletion & Repayment Timing
                </h3>

                <div className="grid grid-cols-2 gap-8 items-center border-b border-gray-100 pb-8">
                  <div className="bg-[#FAF9F5] rounded-xl p-4 border border-[#E6E5DF] flex flex-col items-center justify-center h-40 relative group-hover:bg-[#F5F4F0] transition-colors">
                    <span className="absolute top-3 left-4 text-[9px] font-sans font-semibold text-gray-500 uppercase tracking-widest">Account Balance Curve</span>
                    <svg viewBox="0 0 200 80" className="w-full h-full pt-4 overflow-visible" onContextMenu={handleContextMenu}>
                      <line x1="0" y1="60" x2="200" y2="60" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                      <motion.rect initial={{ width: 0 }} animate={{ width: 60 }} transition={{ duration: 1, delay: 0.5 }} x="0" y="10" height="50" fill="#fef3c7" opacity="0.5" />
                      <text x="30" y="55" fontSize="8" fill="#d97706" textAnchor="middle" className="font-sans font-medium uppercase">Safe Zone</text>
                      <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }} d="M 0,10 C 20,10 40,30 60,40 C 100,50 140,55 200,58" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx="0" cy="10" r="3" fill="#f59e0b" />
                      <circle cx="200" cy="58" r="3" fill="#f59e0b" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p>
                      Across the salaried applicant pool earning under ₹12L PA, the End-of-Month (EOM) account depletion rate is accelerating. By the 15th of the month, average balances fall below 20% of their incoming salary. 
                    </p>
                    <p>
                      This means that EMIs scheduled after the 15th face a 
                      <span className="font-semibold text-gray-900 bg-gray-50 px-1 rounded transition-colors group-hover:bg-amber-50"> 3.4x higher probability of bouncing </span> 
                      simply due to timing mismatch rather than true insolvency. We strongly recommend auto-aligning EMI collection mandates strictly between the 1st and 5th of the month for this cohort.
                    </p>
                  </div>
                </div>
              </motion.section>

              <motion.section variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } } }} className="flex flex-col gap-4 group">
                <h3 className="font-sans font-bold text-gray-900 text-sm tracking-tight m-0 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
                  5. Utility Bill Autopay Resilience
                </h3>

                <div className="flex flex-col gap-2">
                  <p>
                    While general spending shows high volatility, the data reveals that users with active, unbroken utility autopay mandates (Electricity, Broadband) for over 6 consecutive months have a 
                    <span className="font-semibold text-gray-900 bg-gray-50 px-1 rounded transition-colors group-hover:bg-emerald-50"> near-zero 90+ DPD default rate </span> 
                    on subsequent personal loans.
                  </p>
                  <p>
                    This recurring utility compliance acts as an incredibly strong proxy for financial discipline. The ML engine has automatically updated the feature weights, granting a +12 point score bump to applicants exhibiting this behavior.
                  </p>
                </div>
              </motion.section>
            </>
          ) : (
            <>
              <motion.section variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } } }} className="flex flex-col gap-5">
                <h3 className="font-sans font-bold text-gray-900 text-sm tracking-tight m-0 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                  MSME Business Snapshot
                </h3>

                <div className="grid grid-cols-3 gap-6 font-sans border-b border-gray-100 pb-8">
                  <div className="flex flex-col justify-between">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Total Entities</span>
                    <div className="flex items-end gap-2 mt-2">
                      <span className="text-3xl font-bold text-gray-900 tracking-tighter">{dynamicData.entities}</span>
                      <span className="text-[10px] text-green-600 font-bold mb-1.5 flex items-center"><svg className="w-3 h-3 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg> {dynamicData.msmeGrowth}</span>
                    </div>
                    <div className="w-full h-1 bg-[#E6E5DF] mt-4 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }} className="h-full bg-gray-900"></motion.div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Sector Distribution</span>
                    <div className="mt-3 flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[10px] font-semibold text-gray-700"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Manufacturing</span><span>40%</span></div>
                      <div className="flex justify-between items-center text-[10px] font-semibold text-gray-700"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-500"></span> Services</span><span>35%</span></div>
                      <div className="flex justify-between items-center text-[10px] font-semibold text-gray-700"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-pink-500"></span> Retail</span><span>25%</span></div>
                    </div>
                    <div className="flex w-full h-1.5 mt-3 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '40%' }} transition={{ duration: 0.8, delay: 0.5 }} className="bg-indigo-500"></motion.div>
                      <motion.div initial={{ width: 0 }} animate={{ width: '35%' }} transition={{ duration: 0.8, delay: 0.7 }} className="bg-cyan-500"></motion.div>
                      <motion.div initial={{ width: 0 }} animate={{ width: '25%' }} transition={{ duration: 0.8, delay: 0.9 }} className="bg-pink-500"></motion.div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Average DSCR</span>
                    <div className="flex items-end gap-2 mt-1">
                      <span className="text-3xl font-bold text-gray-900 tracking-tighter">{dynamicData.dscr}</span>
                      <span className="text-[10px] text-green-600 font-bold mb-1.5 bg-green-100 px-1.5 py-0.5 rounded">Healthy</span>
                    </div>
                    <div className="mt-2 text-[10px] text-gray-500 font-medium leading-relaxed">
                      Debt Service Coverage Ratio remains robust above 1.2x industry standard, though inventory turnover cycles are slightly elongating.
                    </div>
                  </div>
                </div>
              </motion.section>

              <motion.section variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } } }} className="flex flex-col gap-4 group">
                <h3 className="font-sans font-bold text-gray-900 text-sm tracking-tight m-0 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_8px_rgba(129,140,248,0.6)]"></span>
                  1. Entity Resolution in B2B Supply Chains
                </h3>

                <div className="grid grid-cols-2 gap-8 items-center border-b border-gray-100 pb-8">
                  <div className="bg-[#FAF9F5] rounded-xl p-4 border border-[#E6E5DF] flex flex-col items-center justify-center h-40 relative group-hover:bg-[#F5F4F0] transition-colors">
                    <span className="absolute top-3 left-4 text-[9px] font-sans font-semibold text-gray-500 uppercase tracking-widest">Network Concentration</span>
                    <svg viewBox="0 0 200 100" className="w-full h-full pt-2 overflow-visible">
                      <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} cx="100" cy="50" r="16" fill="#818cf8" />
                      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                        const angle = (i * Math.PI * 2) / 8;
                        const x = 100 + Math.cos(angle) * 45;
                        const y = 50 + Math.sin(angle) * 35;
                        return (
                          <g key={i}>
                            <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }} x1="100" y1="50" x2={x} y2={y} stroke="#c7d2fe" strokeWidth="1.5" />
                            <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 + i * 0.1, type: 'spring' }} cx={x} cy={y} r="4" fill="#a5b4fc" />
                          </g>
                        );
                      })}
                      <motion.circle initial={{ scale: 1, opacity: 0.5 }} animate={{ scale: 2, opacity: 0 }} transition={{ repeat: Infinity, duration: 2 }} cx="100" cy="50" r="16" fill="#818cf8" />
                      <text x="100" y="53" fontSize="10" fill="white" textAnchor="middle" className="font-sans font-bold">62%</text>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p>
                      By cross-referencing ledger entries from Tally ERP feeds with Sahamati AA bank statements for our MSME cohorts, we discovered that 
                      <span className="font-semibold text-gray-900 bg-gray-50 px-1 rounded transition-colors group-hover:bg-indigo-50"> 62% of Tier-3 manufacturers </span> 
                      rely heavily on just three primary raw material suppliers.
                    </p>
                    <p>
                      This vendor concentration poses a systemic supply chain risk. The 
                      <span className="italic text-gray-900 bg-gray-100 px-1 rounded transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-700"> GST Reconciliation Engine </span> 
                      has been configured to flag early warning signals if these key nodes exhibit delayed tax filings.
                    </p>
                  </div>
                </div>
              </motion.section>

              <motion.section variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } } }} className="flex flex-col gap-4 group">
                <h3 className="font-sans font-bold text-gray-900 text-sm tracking-tight m-0 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
                  2. GST vs Bank Statement Revenue Discrepancies
                </h3>

                <div className="border-b border-gray-100 pb-8 flex flex-col gap-2">
                  <p>
                    Our cross-verification pipeline identified that 18% of MSMEs in the retail sector are reporting 
                    <span className="font-semibold text-gray-900 bg-gray-50 px-1 rounded transition-colors group-hover:bg-red-50"> 20-30% lower revenue on GST returns </span> 
                    compared to the cash inflows actively hitting their current accounts.
                  </p>
                  <p>
                    While this artificially lowers their formal eligibility in traditional models, the ML pipeline recognizes the actual cashflow strength. We recommend triggering an automated "Cashflow Surrogate" override to approve credit limits based on actual bank deposits rather than purely reported GST turnover.
                  </p>
                </div>
              </motion.section>

              <motion.section variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } } }} className="flex flex-col gap-4 group">
                <h3 className="font-sans font-bold text-gray-900 text-sm tracking-tight m-0 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.6)]"></span>
                  3. Elongating Inventory Turnover Cycles
                </h3>

                <div className="grid grid-cols-2 gap-8 items-center border-b border-gray-100 pb-8">
                  <div className="bg-[#FAF9F5] rounded-xl p-4 border border-[#E6E5DF] flex flex-col items-center justify-center h-40 relative group-hover:bg-[#F5F4F0] transition-colors">
                    <span className="absolute top-3 left-4 text-[9px] font-sans font-semibold text-gray-500 uppercase tracking-widest">Days Sales Outstanding</span>
                    <svg viewBox="0 0 200 80" className="w-full h-full pt-4 overflow-visible" onContextMenu={handleContextMenu}>
                      <line x1="0" y1="60" x2="200" y2="60" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                      
                      <motion.rect initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} style={{ transformOrigin: "center 60px" }} transition={{ duration: 0.8, delay: 0.5, ease: [0.23, 1, 0.32, 1] }} x="20" y="40" width="20" height="20" fill="#67e8f9" rx="2" />
                      <motion.rect initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} style={{ transformOrigin: "center 60px" }} transition={{ duration: 0.8, delay: 0.6, ease: [0.23, 1, 0.32, 1] }} x="70" y="35" width="20" height="25" fill="#22d3ee" rx="2" />
                      <motion.rect initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} style={{ transformOrigin: "center 60px" }} transition={{ duration: 0.8, delay: 0.7, ease: [0.23, 1, 0.32, 1] }} x="120" y="25" width="20" height="35" fill="#06b6d4" rx="2" />
                      <motion.rect initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} style={{ transformOrigin: "center 60px" }} transition={{ duration: 0.8, delay: 0.8, ease: [0.23, 1, 0.32, 1] }} x="170" y="10" width="20" height="50" fill="#0891b2" rx="2" />
                      
                      <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1.2, ease: [0.23, 1, 0.32, 1] }} d="M 30,35 L 80,30 L 130,20 L 180,5" fill="none" stroke="#164e63" strokeWidth="2" strokeDasharray="4 4" />
                      
                      <text x="30" y="75" fontSize="8" fill="#94a3b8" textAnchor="middle">Q1</text>
                      <text x="80" y="75" fontSize="8" fill="#94a3b8" textAnchor="middle">Q2</text>
                      <text x="130" y="75" fontSize="8" fill="#94a3b8" textAnchor="middle">Q3</text>
                      <text x="180" y="75" fontSize="8" fill="#94a3b8" textAnchor="middle">Q4</text>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p>
                      Analysis of recurring B2B invoice clearing times shows that the average Days Sales Outstanding (DSO) for our manufacturing cohort has increased from 
                      <span className="font-semibold text-gray-900 bg-gray-50 px-1 rounded transition-colors group-hover:bg-cyan-50"> 45 days to 72 days </span> 
                      over the past four quarters.
                    </p>
                    <p>
                      This creates severe short-term working capital stress, even for highly profitable businesses. We recommend proactively offering targeted Invoice Discounting lines to MSMEs hitting the 60-day threshold before they request formal restructuring.
                    </p>
                  </div>
                </div>
              </motion.section>
            </>
          )}
        </motion.div>
      </div>

      {/* Floating Ask Zeyro Tooltip */}
      <AnimatePresence>
        {selectionRect && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed z-50 pointer-events-auto"
            style={{ 
              top: selectionRect.top - 45, 
              left: selectionRect.left + (selectionRect.width / 2) - 60 
            }}
          >
            <button
              onClick={handleAsk}
              className="bg-gray-900 text-white font-sans text-[11px] font-semibold px-4 py-2 rounded-lg shadow-xl hover:bg-black transition-colors flex items-center gap-2 group border border-gray-700"
            >
              <svg className="w-3.5 h-3.5 text-indigo-400 group-hover:animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              Ask Zeyro
            </button>
            {/* Tooltip Triangle */}
            <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 border-r border-b border-gray-700"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export const CashflowInputView: React.FC<{ initialSelectedId?: string | null, onSimulateProcess?: (text: string, customElement?: string) => void, onAddLog?: (text: string) => void }> = ({ initialSelectedId, onSimulateProcess, onAddLog }) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [mode, setMode] = useState<'connect' | 'monitor'>('connect');
  const [borrowerType, setBorrowerType] = useState('Salaried');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFiles(prev => [...prev, ...Array.from(e.target.files as FileList)]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setUploadedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleAnalyzeClick = () => {
    if (uploadedFiles.length === 0) return;
    setIsParsing(true);
    
    if (onSimulateProcess && onAddLog) {
      const fileNames = uploadedFiles.map(f => f.name).join(', ');
      onAddLog(`FILE_UPLOAD: Received ${uploadedFiles.length} files for processing: ${fileNames}`);
      // Only send the Thoughts UI message ONCE, not multiple text messages
      onSimulateProcess('', 'agent_thoughts');
      
      const thoughtsPool = [
        { conv: "Hmm, let's see what we have here...", prof: "Initializing document layout parser modules." },
        { conv: "Ooh, that's interesting. Seeing some irregular transaction patterns.", prof: "Detecting anomalous variance in standard cashflow streams." },
        { conv: "I see, I see... The GST mismatches are becoming clear now.", prof: "Cross-validating account aggregator feed against filed GST returns." },
        { conv: "Wait, let me double check these high-value transfers...", prof: "Running secondary checks on P2P and NEFT outliers." },
        { conv: "Alright, categorizing discretionary spending... looking good.", prof: "Applying merchant classification algorithms to debit transactions." },
        { conv: "That's a lot of cash withdrawals... let me flag that for a closer look.", prof: "Flagging excessive ATM withdrawal frequency for manual review." },
        { conv: "Okay, pulling up the liquidity patterns across the last 12 months.", prof: "Generating 12-month trailing liquidity matrix." },
        { conv: "Let me just quickly cross-reference this applicant ID with the database.", prof: "Executing identity and negative database cross-referencing." },
        { conv: "Hold on, the debt-to-income ratio looks a bit skewed here.", prof: "Calculating Fixed Obligation to Income Ratio (FOIR)." },
        { conv: "Just extracting the metadata from these documents, give me a second...", prof: "Extracting embedded PDF metadata and creation signatures." },
        { conv: "Interesting P2P payment patterns here, let me validate those.", prof: "Analyzing peer-to-peer velocity and recurrent counterparty risks." },
        { conv: "Almost got the full picture, just putting the pieces together...", prof: "Aggregating feature sets for final risk inference." }
      ];
      
      // Pick 4 random thoughts
      const pickedThoughts = [...thoughtsPool].sort(() => Math.random() - 0.5).slice(0, 4);
      
      pickedThoughts.forEach((thought, idx) => {
        setTimeout(() => {
          onAddLog(`SYNC||${thought.prof}||${thought.conv}`);
        }, (idx + 1) * 2000);
      });

      setTimeout(() => {
        onAddLog(`PIPELINE: Processing complete. Output generated successfully.`);
        setIsParsing(false);
        setUploadedFiles([]); // Reset back to empty state
        onSimulateProcess('', 'view_output_card');
      }, (pickedThoughts.length + 1) * 2000);
      
    } else {
      setTimeout(() => {
        setIsParsing(false);
        setUploadedFiles([]);
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {initialSelectedId && (() => {
        const p = ACCOUNT_PROFILES.find(x => x.id === initialSelectedId);
        if (!p) return null;
        return (
          <div className="bg-indigo-50 border border-indigo-100 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-indigo-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-indigo-950">{p.name}</span>
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border border-indigo-200 bg-white text-indigo-600">{p.type}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-indigo-700 font-medium">
                  <span className="font-mono">{p.id}</span>
                  <span className="w-1 h-1 rounded-full bg-indigo-300" />
                  <span>{p.bank}</span>
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white text-indigo-600 border border-indigo-100 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">Ready for Connect</span>
          </div>
        );
      })()}
      
      <div className="flex p-1 bg-gray-100/80 rounded-lg w-full mb-2">
        <button 
          onClick={() => setMode('connect')}
          className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-all duration-200 ${mode === 'connect' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >Connect Data Source</button>
        <button 
          onClick={() => setMode('monitor')}
          className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-all duration-200 ${mode === 'monitor' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >Add to Monitoring</button>
      </div>

      {mode === 'connect' ? (
        <>
          <div className="bg-white border border-[#E6E5DF] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col gap-5 text-xs">
        <h3 className="font-semibold text-gray-800 border-b pb-2">Connect Data Source</h3>
        
        {/* Connect via AA button */}
        <div className="flex flex-col gap-2">
          <span className="text-gray-600 font-medium">Account Aggregator</span>
          <button className="relative w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 px-4 py-2.5 rounded-lg font-medium transition-all duration-[160ms] ease-out active:scale-[0.97] origin-center shadow-sm group">
            <svg className="w-[18px] h-[18px] text-[#8634DE] group-hover:scale-110 transition-transform duration-[160ms] ease-out" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            Continue with Sahamati AA
          </button>
          <span className="text-[10px] text-gray-400 text-center mt-0.5">Securely connect your bank via RBI-regulated Account Aggregator</span>
        </div>

        <div className="flex flex-col gap-2 mt-1">
          <span className="text-gray-600 font-medium">Other Integrations</span>
          <div className="flex flex-col gap-2">
            {[
              { name: 'Tally Prime', type: 'ERP / Accounting', icon: 'M4 4h16v16H4V4z M4 9h16' },
              { name: 'Zoho Books', type: 'Cloud Accounting', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
              { name: 'Razorpay', type: 'Payment Gateway', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' }
            ].map((integration) => (
              <div key={integration.name} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all duration-200 group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-500 shadow-sm group-hover:text-blue-600 transition-colors">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={integration.icon} />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-800">{integration.name}</span>
                    <span className="text-[9px] text-gray-400 font-medium">{integration.type}</span>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-md text-[10px] font-bold text-gray-600 bg-white border border-gray-200 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-colors active:scale-95">
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-[10px] uppercase font-bold tracking-widest">or</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Upload statement */}
        <div className="flex flex-col gap-2">
          <span className="text-gray-600 font-medium">Manual Upload</span>
          
          <AnimatePresence mode="wait">
            {uploadedFiles.length === 0 ? (
              <motion.label
                key="empty-upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="border border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-colors duration-[160ms] ease-out cursor-pointer group active:scale-[0.99] origin-center hover:bg-blue-50/50 hover:border-blue-300"
              >
                <input type="file" multiple className="hidden" accept=".pdf,.md,.csv,.ipynb" onChange={handleFileUpload} />
                <div className="w-10 h-10 rounded-full border bg-slate-50 border-slate-100 flex items-center justify-center transition-colors duration-[160ms] ease-out group-hover:bg-blue-100 group-hover:border-blue-200">
                  <svg className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors duration-[160ms] ease-out" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-[160ms] ease-out">
                    Click to upload statements
                  </span>
                  <span className="text-gray-400 text-[10px] mt-0.5 font-light">
                    PDF, CSV, or MD formats
                  </span>
                </div>
              </motion.label>
            ) : (
              <motion.div
                key="file-grid"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                className="flex flex-col gap-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <AnimatePresence>
                    {uploadedFiles.map((file, index) => {
                      const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
                      return (
                        <motion.div
                          layout
                          key={`${file.name}-${index}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                          className="relative bg-white border border-gray-200 rounded-xl p-3 h-[110px] flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] group overflow-hidden"
                        >
                          {!isParsing && (
                            <button 
                              onClick={() => removeFile(index)} 
                              className="absolute top-2 right-2 w-6 h-6 rounded-full hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors duration-200 opacity-0 group-hover:opacity-100 z-20"
                              title="Remove file"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                            </button>
                          )}
                          
                          {/* Skeleton Loader for Shimmer effect */}
                          {isParsing ? (
                            <div className="flex flex-col gap-2 w-full h-full justify-start pt-1">
                              <motion.div 
                                animate={{ opacity: [0.3, 0.7, 0.3] }} 
                                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                className="h-3 bg-gray-200/80 rounded-[4px] w-4/5"
                              />
                              <motion.div 
                                animate={{ opacity: [0.3, 0.7, 0.3] }} 
                                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                                className="h-3 bg-gray-200/80 rounded-[4px] w-2/3"
                              />
                              <div className="flex-1" />
                              <motion.div 
                                animate={{ opacity: [0.3, 0.7, 0.3] }} 
                                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.4 }}
                                className="h-5 bg-gray-200/80 rounded-[6px] w-12"
                              />
                            </div>
                          ) : (
                            <>
                              {/* File Name */}
                              <div className="text-[12px] font-semibold text-gray-800 leading-[1.3] break-words pr-4 line-clamp-3">
                                {file.name}
                              </div>
                              
                              {/* Badge */}
                              <div className="flex items-center gap-1.5 mt-auto">
                                <div className="px-1.5 py-[3px] rounded text-[9px] font-bold tracking-widest text-gray-500 border border-gray-200 bg-gray-50 max-w-fit shadow-[0_1px_1px_rgba(0,0,0,0.01)]">
                                  {ext}
                                </div>
                              </div>
                            </>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  
                  {/* Add more button */}
                  {!isParsing && (
                    <label className="border border-dashed border-gray-300 rounded-xl p-3 h-[110px] flex flex-col items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer group active:scale-[0.98]">
                      <input type="file" multiple className="hidden" accept=".pdf,.md,.csv,.ipynb" onChange={handleFileUpload} />
                      <div className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center group-hover:border-gray-300 transition-colors">
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </div>
                      <span className="text-[10px] font-medium text-gray-500">Add more</span>
                    </label>
                  )}
                </div>
                
                <button 
                  onClick={handleAnalyzeClick}
                  disabled={isParsing}
                  className={`w-full py-2.5 rounded-lg text-xs font-semibold transition-all duration-[160ms] ease-out flex items-center justify-center gap-2 mt-2 ${
                    isParsing 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                      : 'bg-gray-900 text-white hover:bg-black active:scale-[0.97] shadow-sm'
                  }`}
                >
                  {isParsing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      Analysis in progress...
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5l10 -10"/></svg>
                      Analyze Documents
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Threshold Controls */}
      <div className="bg-white border border-[#E6E5DF] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] text-xs flex flex-col gap-4">
        <h3 className="font-semibold text-gray-800 border-b pb-2">Threshold Controls</h3>
        <div className="flex justify-between items-center border-b pb-2 border-gray-50">
          <span className="text-gray-600 font-medium">Minimum Average Balance</span>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">₹</span>
            <input type="number" defaultValue={5000} className="border border-gray-200 rounded-md p-1.5 pl-6 w-28 outline-none font-mono text-gray-700 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all duration-[160ms]" />
          </div>
        </div>
        <div className="flex justify-between items-center">
        </div>
      </div>
      </>
      ) : (
        <div className="bg-white border border-[#E6E5DF] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col gap-5 text-xs">
          <h3 className="font-semibold text-gray-800 border-b pb-2">Add to Monitoring Pool</h3>
          <div className="flex flex-col gap-3">
             <label className="flex flex-col gap-1.5"><span className="font-medium text-gray-700">Account ID</span><input type="text" placeholder="Pull from LOS" className="border border-gray-200 rounded-md p-1.5 outline-none font-mono focus:border-blue-400 focus:ring-1 focus:ring-blue-400" /></label>
             <label className="flex flex-col gap-1.5"><span className="font-medium text-gray-700">Borrower Type</span>
                <select value={borrowerType} onChange={e => setBorrowerType(e.target.value as any)} className="border border-gray-200 rounded-md p-1.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white">
                  <option value="Salaried">Salaried</option><option value="Self-Employed">Self-Employed</option><option value="MSME">MSME</option>
                </select>
             </label>
             <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5"><span className="font-medium text-gray-700">EMI Amount</span><div className="relative"><span className="absolute left-2 top-1.5 text-gray-400">₹</span><input type="number" className="w-full border border-gray-200 rounded-md p-1.5 pl-5 outline-none font-mono focus:border-blue-400 focus:ring-1 focus:ring-blue-400" /></div></label>
                <label className="flex flex-col gap-1.5"><span className="font-medium text-gray-700">EMI Due Day</span><input type="number" placeholder="1-28" min="1" max="28" className="border border-gray-200 rounded-md p-1.5 outline-none font-mono focus:border-blue-400 focus:ring-1 focus:ring-blue-400" /></label>
             </div>
             {borrowerType === 'Salaried' && (
                <>
                  <label className="flex flex-col gap-1.5"><span className="font-medium text-gray-700">Expected Salary Day</span><input type="number" placeholder="1-31" className="border border-gray-200 rounded-md p-1.5 outline-none font-mono focus:border-blue-400 focus:ring-1 focus:ring-blue-400" /></label>
                  <label className="flex flex-col gap-1.5"><span className="font-medium text-gray-700">Inflow Drop Threshold (%)</span><input type="number" defaultValue={30} className="border border-gray-200 rounded-md p-1.5 outline-none font-mono focus:border-blue-400 focus:ring-1 focus:ring-blue-400" /></label>
                </>
             )}
             {borrowerType === 'Self-Employed' && (
                <>
                  <label className="flex flex-col gap-1.5"><span className="font-medium text-gray-700">Income Volatility Tolerance</span>
                    <select className="border border-gray-200 rounded-md p-1.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white"><option>Low</option><option>Medium</option><option>High</option></select>
                  </label>
                  <label className="flex flex-col gap-1.5"><span className="font-medium text-gray-700">FOIR Ceiling (%)</span><input type="number" defaultValue={50} className="border border-gray-200 rounded-md p-1.5 outline-none font-mono focus:border-blue-400 focus:ring-1 focus:ring-blue-400" /></label>
                </>
             )}
             {borrowerType === 'MSME' && (
                <>
                  <label className="flex flex-col gap-1.5"><span className="font-medium text-gray-700">Debtor Days Threshold (DSO)</span><input type="number" defaultValue={45} className="border border-gray-200 rounded-md p-1.5 outline-none font-mono focus:border-blue-400 focus:ring-1 focus:ring-blue-400" /></label>
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"/><span className="font-medium text-gray-700">Enable GST Crosscheck</span></label>
                </>
             )}
             <button onClick={handleAnalyzeClick} disabled={isParsing} className="w-full py-2.5 bg-gray-900 text-white rounded-lg font-semibold hover:bg-black active:scale-[0.97] transition-all duration-[160ms] mt-2">Initialize Continuous Monitoring</button>
          </div>
        </div>
      )}
    </div>
  );
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { ease: [0.23, 1, 0.32, 1] as const, duration: 0.4 } }
};

const MetricRowWithInsight: React.FC<{
  label: string;
  value: string;
  status?: string;
  isWarning?: boolean;
  insight: React.ReactNode;
}> = ({ label, value, status, isWarning, insight }) => {
  return (
    <motion.div variants={itemVariants} className="flex flex-col border-b border-gray-100 pb-4 mb-1 group">
      <div className="flex justify-between items-center pb-2">
        <span className="text-gray-500 font-medium">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-gray-900 font-semibold">{value}</span>
          {status && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${
              isWarning
                ? 'bg-red-50 text-red-700'
                : status === 'Monitor' || status === 'Review' || status === 'Moderate' || status === 'Irregular'
                ? 'bg-amber-50 text-amber-700'
                : 'bg-green-50 text-green-700'
            }`}>
              {status}
            </span>
          )}
        </div>
      </div>
      <div className="pl-3 border-l-[3px] border-indigo-100/70">
        <div className="text-[12px] leading-relaxed text-gray-500 font-serif italic">
          <span className="font-sans font-semibold text-indigo-400 not-italic mr-1.5 text-[10px] uppercase tracking-widest block mb-1">What this means</span>
          {insight}
        </div>
      </div>
    </motion.div>
  );
};

const Sparkline = ({ data, color }: { data: number[], color: string }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 -5 100 110" preserveAspectRatio="none" className="w-16 h-6 overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="drop-shadow-sm transition-all duration-300"
      />
    </svg>
  );
};

export const CashflowReportView: React.FC<{ onAskZeyro?: (text: string) => void, initialSelectedId?: string | null, onProfileSelect?: (id: string | null) => void }> = ({ onAskZeyro, initialSelectedId = null, onProfileSelect }) => {
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);

  useEffect(() => {
    onProfileSelect?.(selectedId);
  }, [selectedId, onProfileSelect]);
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const [selectedText, setSelectedText] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Salaried' | 'Self-Employed' | 'MSME'>('All');
  type SortKey = 'name' | 'type' | 'bounce';
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const { handleContextMenu, renderContextMenu } = useChartContextMenu(onAskZeyro);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionRect(rect);
      setSelectedText(selection.toString().trim());
    } else {
      setSelectionRect(null);
      setSelectedText('');
    }
  };

  const handleAsk = () => {
    if (onAskZeyro && selectedText) {
      onAskZeyro(selectedText);
      window.getSelection()?.removeAllRanges();
      setSelectionRect(null);
      setSelectedText('');
    }
  };

  const profiles = {
    rahul: {
      name: 'Rahul M.', bank: 'HDFC Bank SA', period: '12 months · 1,847 txns', 
      incomeLabel: 'Avg Monthly Income', income: '₹1,24,500', incomeStatus: 'Stable',
      incomeInsight: 'Consistent salary credits detected on the last working day of each month. Indicates reliable employment and stable cash flow.',
      confidenceLabel: 'Income Confidence', confidence: '97.4%', confidenceStatus: 'High',
      confidenceInsight: 'High confidence means the system verified historical deposits with minimal variance in amount and date.',
      foirLabel: 'FOIR', foir: '38.2%', foirStatus: 'Low Risk',
      foirInsight: 'Fixed Obligation to Income Ratio (FOIR) is under the 50% threshold. The user has healthy room for new debt.',
      bnplLabel: 'BNPL Exposure', bnpl: '₹8,400/mo', bnplStatus: 'Monitor',
      bnplInsight: 'Moderate Buy Now Pay Later usage. While not alarming, frequent small loans can sometimes indicate short-term liquidity needs.',
      hiddenEmiLabel: 'Hidden EMIs Detected', hiddenEmi: '2 obligations', hiddenEmiStatus: 'Review',
      hiddenEmiInsight: 'Regular monthly deductions of consistent amounts were found that are not marked explicitly as EMIs. This might increase actual debt burden.',
      dipLabel: 'Income Irregularity', dip: '0 months', dipStatus: 'Clean',
      dipInsight: 'No months with significant income drops were detected. Financial behavior is predictable.',
      extraLabel: 'Savings Rate', extra: '18%', extraStatus: 'Healthy', extraWarning: false,
      extraInsight: 'Maintains a consistent 18% savings rate relative to inflows, indicating strong financial discipline.',
      topSpendLabel: 'Top Spend: Travel', topSpendVal: '₹18,200/mo',
      features: '1,048 attributes', indicatorColor: 'bg-green-500', indicatorText: 'Pre-bureau Risk Indicator - Low Risk · Score Ready · Bureau query not yet consumed', indicatorBorder: 'border-green-200', indicatorBg: 'bg-green-50',
      forecast: [
        { label: '3 Months', val: '₹3.8L', p10: '₹3.4L', p90: '₹4.2L', isWarning: false, title: 'Baseline Accumulation', trend: [2, 4, 5, 7, 9],
          base: '₹3.0L', drivers: [{ label: 'Stable Salary Credit', val: '+₹1.1L', type: 'pos' }, { label: 'Low FOIR (<40%)', val: '+₹0.2L', type: 'pos' }, { label: 'BNPL Obligations', val: '-₹0.5L', type: 'neg' }]
        },
        { label: '6 Months', val: '₹7.8L', p10: '₹7.0L', p90: '₹8.6L', isWarning: false, title: 'Bonus Included', trend: [9, 10, 11, 15, 17],
          base: '₹6.5L', drivers: [{ label: 'Historical Q2 Bonus', val: '+₹1.8L', type: 'pos' }, { label: 'Sustained Savings Rate', val: '+₹0.4L', type: 'pos' }, { label: 'Predicted Tax Outflow', val: '-₹0.9L', type: 'neg' }]
        },
        { label: '9 Months', val: '₹11.9L', p10: '₹10.5L', p90: '₹13.2L', isWarning: false, title: 'Steady Growth', trend: [17, 19, 21, 23, 25],
          base: '₹10.0L', drivers: [{ label: 'Compounding Interest', val: '+₹0.8L', type: 'pos' }, { label: 'No Major Outflows', val: '+₹1.4L', type: 'pos' }, { label: 'Inflation Adjustment', val: '-₹0.3L', type: 'neg' }]
        },
        { label: '12 Months', val: '₹15.8L', p10: '₹13.8L', p90: '₹17.5L', isWarning: false, title: 'Annual Milestone', trend: [25, 27, 30, 33, 36],
          base: '₹13.5L', drivers: [{ label: 'Consistent Monthly Savings', val: '+₹2.4L', type: 'pos' }, { label: 'Zero Hidden EMIs', val: '+₹0.5L', type: 'pos' }, { label: 'Depreciation / Fees', val: '-₹0.6L', type: 'neg' }]
        }
      ]
    },
    priya: {
      name: 'Priya S.', bank: 'ICICI Bank CA', period: '12 months · 3,214 txns', 
      incomeLabel: 'Avg Monthly Income', income: '₹2,18,000', incomeStatus: 'Irregular',
      incomeInsight: 'High variance in monthly deposits. Freelance or business income detected, which makes cash flow less predictable.',
      confidenceLabel: 'Income Confidence', confidence: '72.1%', confidenceStatus: 'Moderate',
      confidenceInsight: 'Moderate confidence due to irregular deposit schedules and varying amounts. Additional manual review might be required.',
      foirLabel: 'FOIR', foir: '51.6%', foirStatus: 'Elevated',
      foirInsight: 'FOIR is above the 50% threshold. Over half of the income is already committed to existing obligations, reducing capacity for new debt.',
      bnplLabel: 'BNPL Exposure', bnpl: '₹24,800/mo', bnplStatus: 'High',
      bnplInsight: 'High BNPL usage. Frequent reliance on short-term credit often indicates cash flow stress toward the end of the month.',
      hiddenEmiLabel: 'Hidden EMIs Detected', hiddenEmi: '5 obligations', hiddenEmiStatus: 'Flag',
      hiddenEmiInsight: 'Multiple recurring payments flagged as potential undisclosed loans. This significantly impacts real affordability.',
      dipLabel: 'Income Dip Months', dip: '3 of 12', dipStatus: 'Review',
      dipInsight: 'Income dropped by more than 30% in 3 out of the last 12 months, indicating high volatility.',
      extraLabel: 'Inflow Volatility (6M)', extra: 'High', extraStatus: 'Review', extraWarning: true,
      extraInsight: 'Income fluctuates significantly, showing a high variance month-over-month. Makes capacity planning difficult.',
      topSpendLabel: 'Business Income %', topSpendVal: '84% of credits',
      features: '1,048 attributes', indicatorColor: 'bg-red-500', indicatorText: 'Pre-bureau Risk Indicator - Elevated · BNPL overload + irregular income · Manual review recommended', indicatorBorder: 'border-red-200', indicatorBg: 'bg-red-50',
      forecast: [
        { label: '3 Months', val: '₹4.2L', p10: '₹3.5L', p90: '₹5.0L', isWarning: false, title: 'Initial Build-up', trend: [3, 5, 8, 7, 9],
          base: '₹4.5L', drivers: [{ label: 'Pending Invoices', val: '+₹0.8L', type: 'pos' }, { label: 'High FOIR Deduction', val: '-₹0.7L', type: 'neg' }, { label: 'Irregular Income Penalty', val: '-₹0.4L', type: 'neg' }]
        },
        { label: '6 Months', val: '₹6.1L', p10: '₹4.8L', p90: '₹7.5L', isWarning: true, title: 'Volatility Impact', trend: [9, 8, 6, 5, 6],
          base: '₹7.5L', drivers: [{ label: 'Expected Freelance Base', val: '+₹1.5L', type: 'pos' }, { label: 'Historical Q2 Dip (30%)', val: '-₹1.8L', type: 'neg' }, { label: 'BNPL Over-reliance', val: '-₹1.1L', type: 'neg' }]
        },
        { label: '9 Months', val: '₹7.9L', p10: '₹5.5L', p90: '₹10.2L', isWarning: true, title: 'Recovery Phase', trend: [6, 7, 7, 8, 9],
          base: '₹10.5L', drivers: [{ label: 'Q3 Contract Renewals', val: '+₹2.0L', type: 'pos' }, { label: 'Hidden EMI Servicing', val: '-₹2.5L', type: 'neg' }, { label: 'High Volatility Discount', val: '-₹2.1L', type: 'neg' }]
        },
        { label: '12 Months', val: '₹10.4L', p10: '₹6.8L', p90: '₹14.5L', isWarning: true, title: 'High Variance', trend: [9, 10, 9, 11, 10],
          base: '₹14.0L', drivers: [{ label: 'Peak Season Credits', val: '+₹3.2L', type: 'pos' }, { label: 'Debt Service Drag', val: '-₹4.5L', type: 'neg' }, { label: 'Low Confidence Penalty', val: '-₹2.3L', type: 'neg' }]
        }
      ]
    },
    sharma: {
      name: 'Sharma Textiles', bank: 'SBI CC + CA', period: '12 months · 6,891 txns · 2 accounts', 
      incomeLabel: 'Net Monthly Revenue', income: '₹14,60,000', incomeStatus: 'Growing',
      incomeInsight: 'Consistent MoM growth in revenue credits. Indicates a healthy, expanding business.',
      confidenceLabel: 'Revenue Trend (3M)', confidence: '+18.4%', confidenceStatus: 'Positive',
      confidenceInsight: 'Recent 3-month trend shows strong upward momentum compared to the 12-month average.',
      foirLabel: 'Debt Service Ratio', foir: '1.42x', foirStatus: 'Healthy',
      foirInsight: 'Debt Service Coverage Ratio (DSCR) is 1.42x. The business generates 42% more cash than needed to cover debt obligations.',
      bnplLabel: 'Avg Min Balance', bnpl: '₹3,84,000', bnplStatus: 'Stable',
      bnplInsight: 'Maintains a healthy average minimum balance, providing a strong liquidity buffer against unexpected expenses.',
      hiddenEmiLabel: 'Seasonal Dip Detected', hiddenEmi: 'Oct-Nov', hiddenEmiStatus: 'Flag',
      hiddenEmiInsight: 'Historical data shows a consistent revenue dip during Oct-Nov. Loan structuring should account for this seasonality.',
      dipLabel: 'GST-Income Crosscheck', dip: 'Consistent', dipStatus: 'Verified',
      dipInsight: 'Bank deposits align closely with filed GST returns, confirming revenue authenticity.',
      extraLabel: 'Inflow Concentration', extra: '64%', extraStatus: 'Warning', extraWarning: true,
      extraInsight: '64% of revenue comes from a single vendor. High dependency risk.',
      topSpendLabel: '', topSpendVal: '',
      features: '1,048 attributes', indicatorColor: 'bg-green-500', indicatorText: 'Pre-bureau Risk Indicator - Low Risk · Strong cashflow · Seasonal pattern noted · Recommend 10-month repayment', indicatorBorder: 'border-green-200', indicatorBg: 'bg-green-50',
      forecast: [
        { label: '3 Months', val: '₹48.5L', p10: '₹42.0L', p90: '₹55.0L', isWarning: false, title: 'Strong Quarter', trend: [10, 12, 15, 18, 22],
          base: '₹40.0L', drivers: [{ label: '18% Revenue MoM Growth', val: '+₹9.5L', type: 'pos' }, { label: 'Verified GST Alignment', val: '+₹2.0L', type: 'pos' }, { label: 'Vendor Concentration Risk', val: '-₹3.0L', type: 'neg' }]
        },
        { label: '6 Months', val: '₹1.02Cr', p10: '₹85.0L', p90: '₹1.15Cr', isWarning: false, title: 'Scaling Up', trend: [22, 25, 29, 34, 40],
          base: '₹85.0L', drivers: [{ label: 'Healthy DSCR (1.42x)', val: '+₹18.0L', type: 'pos' }, { label: 'Compounding Margins', val: '+₹5.5L', type: 'pos' }, { label: 'OpEx Scaling', val: '-₹6.5L', type: 'neg' }]
        },
        { label: '9 Months', val: '₹1.68Cr', p10: '₹1.40Cr', p90: '₹1.95Cr', isWarning: false, title: 'Peak Seasonality', trend: [40, 42, 38, 45, 52],
          base: '₹1.50Cr', drivers: [{ label: 'Q3 Peak Demand', val: '+₹35.0L', type: 'pos' }, { label: 'Stable Base Retained', val: '+₹8.0L', type: 'pos' }, { label: 'Historical Oct-Nov Dip', val: '-₹25.0L', type: 'neg' }]
        },
        { label: '12 Months', val: '₹2.25Cr', p10: '₹1.80Cr', p90: '₹2.70Cr', isWarning: false, title: 'Annual Projection', trend: [52, 58, 65, 72, 80],
          base: '₹1.90Cr', drivers: [{ label: 'Sustained Expansion', val: '+₹45.0L', type: 'pos' }, { label: 'Liquidity Buffer', val: '+₹10.0L', type: 'pos' }, { label: 'Market Risk Discount', val: '-₹20.0L', type: 'neg' }]
        }
      ]
    }
  };

  const selectedGlobalProfile = selectedId ? ACCOUNT_PROFILES.find(p => p.id === selectedId) || ACCOUNT_PROFILES[0] : null;
  const profileKey = selectedGlobalProfile ? (selectedGlobalProfile.name.toLowerCase().includes('rahul') ? 'rahul' 
                     : selectedGlobalProfile.name.toLowerCase().includes('priya') ? 'priya' 
                     : 'sharma') : null;
  
  const activeData = profileKey ? profiles[profileKey as 'rahul' | 'priya' | 'sharma'] : null;

  return (
    <div className="flex flex-col gap-5 mt-2 font-sans relative select-text" onMouseUp={handleMouseUp}>
      {renderContextMenu()}
      {/* Search and Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-white border border-[#E6E5DF] rounded-xl shadow-sm">
            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              type="text"
              placeholder="Search reports by name, ID, or type…"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); if (e.target.value && selectedId) setSelectedId(null); }}
              className="flex-1 text-[12px] outline-none bg-transparent text-gray-800 placeholder:text-gray-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors active:scale-[0.97]">
                <svg className="w-2.5 h-2.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <CustomDropdown
              label="Type"
              value={typeFilter}
              onChange={(v) => { setTypeFilter(v as any); if (selectedId) setSelectedId(null); }}
              options={[
                { label: 'All Types', value: 'All' },
                { label: 'Salaried', value: 'Salaried' },
                { label: 'Self-Employed', value: 'Self-Employed' },
                { label: 'MSME', value: 'MSME' },
              ]}
            />
            
            <div className="flex items-center gap-1">
              <CustomDropdown
                label="Sort By"
                value={sortKey || 'bounce'}
                onChange={(v) => setSortKey(v as any)}
                options={[
                  { label: 'Bounce Risk', value: 'bounce' },
                  { label: 'Name', value: 'name' },
                  { label: 'Type', value: 'type' },
                ]}
              />
              <button 
                onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
                className="w-7 h-7 rounded-lg border border-[#E6E5DF] bg-white flex items-center justify-center text-gray-500 hover:border-gray-300 hover:text-gray-900 transition-colors active:scale-[0.97] shadow-sm"
              >
                {sortDir === 'asc' ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {searchQuery || typeFilter !== 'All' ? (
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-1">Search Results</span>
          {(() => {
            const filtered = ACCOUNT_PROFILES
              .filter(p => typeFilter === 'All' || p.type === typeFilter)
              .filter(p => [p.name, p.id, p.type].some(v => v.toLowerCase().includes(searchQuery.toLowerCase())))
              .sort((a, b) => {
                 let cmp = 0;
                 if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
                 else if (sortKey === 'type') cmp = a.type.localeCompare(b.type);
                 else cmp = a.bounceProbability - b.bounceProbability;
                 return sortDir === 'asc' ? cmp : -cmp;
              });
            
            if (filtered.length === 0) return (
              <div className="py-8 text-center border-dashed border-gray-200 rounded-xl bg-gray-50">
                <p className="text-[12px] font-medium text-gray-500">No reports match your filters</p>
              </div>
            );
            
            return (
              <div className="flex flex-col gap-2">
                {filtered.map(p => {
                  const isActive = p.id === selectedId;
                  const dot = p.alerts.some(a => a.severity === 'critical') ? 'bg-red-500' : p.alerts.some(a => a.severity === 'warning') ? 'bg-amber-400' : 'bg-green-500';
                  return (
                    <button key={p.id} onClick={() => setSelectedId(p.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-[160ms] ease-out active:scale-[0.98] ${
                        isActive ? 'border-gray-900 bg-gray-900 shadow-md group' : 'border-[#E6E5DF] bg-white hover:border-gray-300 group'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${dot}`} />
                        <div className="flex flex-col">
                          <span className={`text-[13px] font-semibold ${isActive ? 'text-white' : 'text-gray-900'}`}>{p.name}</span>
                          <span className={`text-[10px] font-mono ${isActive ? 'text-gray-300' : 'text-gray-400'}`}>{p.id} • {p.type}</span>
                        </div>
                      </div>
                      <span className={`text-[11px] font-semibold flex items-center gap-1 ${isActive ? 'text-gray-300' : 'text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity'}`}>
                        View Report <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })()}
        </div>
      ) : (
        /* Last 3 Reports */
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-1">Last 3 Reports</span>
          <div className="flex gap-2 overflow-x-auto pb-0.5">
            {ACCOUNT_PROFILES.slice(-3).map(p => {
            const isActive = p.id === selectedId;
            const dot = p.alerts.some(a => a.severity === 'critical') ? 'bg-red-500' : p.alerts.some(a => a.severity === 'warning') ? 'bg-amber-400' : 'bg-green-500';
            return (
              <button key={p.id} onClick={() => setSelectedId(p.id)}
                className={`flex flex-col gap-0.5 px-3 py-2.5 rounded-xl border text-left shrink-0 transition-all duration-[160ms] ease-out active:scale-[0.97] ${
                  isActive ? 'border-gray-900 bg-gray-900 shadow-md' : 'border-[#E6E5DF] bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                  <span className={`text-[12px] font-semibold ${isActive ? 'text-white' : 'text-gray-900'}`}>{p.name}</span>
                </div>
                <span className={`text-[10px] font-mono ${isActive ? 'text-gray-300' : 'text-gray-400'}`}>{p.id}</span>
              </button>
            );
          })}
        </div>
        </div>
      )}

      {!selectedId || !activeData ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-gray-50/60 border border-[#E6E5DF] border-dashed rounded-xl mt-2">
          <svg className="w-10 h-10 text-gray-300 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <h3 className="text-[13px] font-semibold text-gray-800">No Account Selected</h3>
          <p className="text-[11px] text-gray-500 mt-1 max-w-[220px]">Search for an account or select one from the strip above to view its detailed cashflow report.</p>
        </div>
      ) : (
        <div className="overflow-hidden text-sm flex flex-col mt-4">
        {/* Header */}
        <div className="flex items-center justify-between py-2 border-b-2 border-gray-900 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-gray-900 font-bold font-display text-lg tracking-tight">Cashflow Report</span>
          </div>
          <span className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">
            zeyro
          </span>
        </div>

        {/* Content Rows */}
        <motion.div 
          key={selectedId}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col pb-6 gap-2 text-[13px]"
        >
          
          <motion.div variants={itemVariants} className="flex justify-between items-center border-b border-gray-100 pb-3 mb-2">
            <span className="text-gray-500">Applicant</span>
            <span className="text-gray-900 font-semibold">{activeData.name} · <span className="font-normal text-gray-500">{activeData.bank}</span></span>
          </motion.div>
          <motion.div variants={itemVariants} className="flex justify-between items-center border-b border-gray-100 pb-3 mb-2">
            <span className="text-gray-500">Analysis Period</span>
            <span className="text-gray-900 font-medium">{activeData.period}</span>
          </motion.div>

          <motion.div variants={itemVariants} className="my-2 p-4 bg-white border border-gray-100/80 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <span className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-3 px-1 block">6-Month Cashflow Trajectory</span>
            <div 
              className="h-44 w-full cursor-grab active:cursor-grabbing" 
              onContextMenu={handleContextMenu}
              draggable={true}
              onDragStart={(e) => {
                const chartData = [
                  { month: 'Jan', inflow: 110000, outflow: 95000, balance: 45000 },
                  { month: 'Feb', inflow: 115000, outflow: 102000, balance: 58000 },
                  { month: 'Mar', inflow: 120000, outflow: 98000, balance: 80000 },
                  { month: 'Apr', inflow: 112000, outflow: 110000, balance: 82000 },
                  { month: 'May', inflow: 135000, outflow: 120000, balance: 97000 },
                  { month: 'Jun', inflow: 125000, outflow: 105000, balance: 117000 },
                ];
                e.dataTransfer.setData('text/plain', `Analyze this 6-Month Cashflow Trajectory for ${activeData.name}:\n\n${JSON.stringify(chartData, null, 2)}`);
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={[
                  { month: 'Jan', inflow: 110000, outflow: 95000, balance: 45000 },
                  { month: 'Feb', inflow: 115000, outflow: 102000, balance: 58000 },
                  { month: 'Mar', inflow: 120000, outflow: 98000, balance: 80000 },
                  { month: 'Apr', inflow: 112000, outflow: 110000, balance: 82000 },
                  { month: 'May', inflow: 135000, outflow: 120000, balance: 97000 },
                  { month: 'Jun', inflow: 125000, outflow: 105000, balance: 117000 },
                ]} margin={{ top: 6, right: 0, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rptBalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.18}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={8} />
                  <YAxis yAxisId="l" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} tickFormatter={v => `₹${v/1000}k`} />
                  <YAxis yAxisId="r" orientation="right" axisLine={false} tickLine={false} tick={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '11px' }}
                    formatter={(v: any) => typeof v === 'number' ? `₹${v.toLocaleString()}` : v}
                  />
                  <Bar yAxisId="l" dataKey="inflow" fill="#3b82f6" radius={[3,3,0,0]} maxBarSize={24} name="Inflow" />
                  <Bar yAxisId="l" dataKey="outflow" fill="#bfdbfe" radius={[3,3,0,0]} maxBarSize={24} name="Outflow" />
                  <Area yAxisId="r" type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={2} fill="url(#rptBalGrad)" dot={false} name="Net Balance" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <MetricRowWithInsight 
            label={activeData.incomeLabel} value={activeData.income} status={activeData.incomeStatus} 
            isWarning={activeData.incomeStatus === 'Irregular'} insight={activeData.incomeInsight} 
          />
          
          <MetricRowWithInsight 
            label={activeData.confidenceLabel} value={activeData.confidence} status={activeData.confidenceStatus} 
            isWarning={activeData.confidenceStatus === 'Moderate' || activeData.confidenceStatus === 'Low'} insight={activeData.confidenceInsight} 
          />
          
          <MetricRowWithInsight 
            label={activeData.foirLabel} value={activeData.foir} status={activeData.foirStatus} 
            isWarning={activeData.foirStatus === 'Elevated' || activeData.foirStatus === 'High'} insight={activeData.foirInsight} 
          />
          
          <MetricRowWithInsight 
            label={activeData.bnplLabel} value={activeData.bnpl} status={activeData.bnplStatus} 
            isWarning={activeData.bnplStatus === 'High'} insight={activeData.bnplInsight} 
          />
          
          <MetricRowWithInsight 
            label={activeData.hiddenEmiLabel} value={activeData.hiddenEmi} status={activeData.hiddenEmiStatus} 
            isWarning={activeData.hiddenEmiStatus === 'Flag'} insight={activeData.hiddenEmiInsight} 
          />
          
          <MetricRowWithInsight 
            label={activeData.dipLabel} value={activeData.dip} status={activeData.dipStatus} 
            isWarning={activeData.dipStatus === 'Review' || activeData.dipStatus === 'Flag'} insight={activeData.dipInsight} 
          />
          
          <MetricRowWithInsight 
            label={activeData.extraLabel} value={activeData.extra} status={activeData.extraStatus} 
            isWarning={activeData.extraWarning} insight={activeData.extraInsight} 
          />

          {activeData.topSpendLabel && (
            <motion.div variants={itemVariants} className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-gray-500">{activeData.topSpendLabel}</span>
              <span className="text-gray-900 font-medium">{activeData.topSpendVal}</span>
            </motion.div>
          )}
          
          <motion.div variants={itemVariants} className="flex justify-between items-center pb-1 pt-2">
            <span className="text-gray-500">BSA Features Generated</span>
            <span className="text-gray-900 font-medium">{activeData.features}</span>
          </motion.div>

          {/* Indicator Box */}
          <motion.div variants={itemVariants} className={`mt-4 p-3.5 rounded-xl border border-opacity-40 flex items-center gap-3 relative overflow-hidden group transition-all duration-300 hover:shadow-sm ${
            activeData.indicatorColor.includes('green') ? 'border-green-200 bg-green-50/40' : 
            activeData.indicatorColor.includes('red') ? 'border-red-200 bg-red-50/40' : 
            'border-blue-200 bg-blue-50/40'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1.2s] ease-in-out" />
            <div className="relative flex items-center justify-center w-3 h-3 shrink-0">
              <div className={`absolute inset-0 rounded-full ${activeData.indicatorColor} opacity-25 animate-ping`} />
              <div className={`w-1.5 h-1.5 rounded-full ${activeData.indicatorColor}`} />
            </div>
            <span className="text-gray-700 font-medium text-xs tracking-wide relative z-10">{activeData.indicatorText}</span>
          </motion.div>

          {/* Cash Flow Forecast - SHAP Visualization */}
          <motion.div variants={itemVariants} className="mt-5 flex flex-col gap-3">
            <span className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-1 px-1 flex items-center justify-between">
              <span>Projected Cash Flow</span>
              <span className="text-gray-400 font-medium normal-case flex items-center gap-1.5 opacity-70">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                Hover to see ML impact drivers
              </span>
            </span>
            <div className="flex flex-col gap-2.5">
              {activeData.forecast.map((f: any, i: number) => (
                <motion.div 
                  key={i} 
                  variants={itemVariants}
                  className="flex flex-col bg-white border border-gray-100/80 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-gray-200 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group overflow-hidden"
                >
                  <div className="flex items-start gap-4 p-4 relative z-10 bg-white">
                    <div className="flex flex-col gap-1 min-w-[85px] pt-1">
                      <span className="text-[9.5px] text-gray-400 font-bold uppercase tracking-wider">{f.label}</span>
                      <span className={`font-semibold font-mono tracking-tight text-[15px] transition-transform duration-300 origin-left group-hover:scale-105 ${f.isWarning ? 'text-red-500' : 'text-gray-900'}`}>{f.val}</span>
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-gray-800">
                          {f.title}
                        </span>
                        <div className="opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                          <Sparkline data={f.trend} color={f.isWarning ? '#ef4444' : '#6366f1'} />
                        </div>
                      </div>
                      
                      {/* Base Value Line */}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] text-gray-400 font-medium">Base Prediction:</span>
                        <span className="text-[11px] font-mono text-gray-500">{f.base}</span>
                        {f.p10 && f.p90 && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-200">|</span>
                            <span className="text-[10px] text-gray-400 font-medium">P10:</span>
                            <span className="text-[11px] font-mono text-gray-500">{f.p10}</span>
                            <span className="text-gray-200">|</span>
                            <span className="text-[10px] text-gray-400 font-medium">P90:</span>
                            <span className="text-[11px] font-mono text-gray-500">{f.p90}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SHAP Explanation - Expands smoothly on hover via grid-template-rows */}
                  <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]">
                    <div className="overflow-hidden">
                      <div className="px-4 pb-4 pt-0 flex gap-4">
                        <div className="min-w-[85px] shrink-0"></div>
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100/50 w-full mt-1">
                          {f.drivers.map((d: any, idx: number) => (
                            <div key={idx} className={`flex items-center gap-1.5 px-2 py-1 rounded shadow-[0_1px_2px_rgba(0,0,0,0.02)] border ${
                              d.type === 'pos' 
                                ? 'text-emerald-700 bg-emerald-50/50 border-emerald-100/80' 
                                : 'text-rose-700 bg-rose-50/50 border-rose-100/80'
                            }`}>
                              <span className="text-[10px] font-mono font-bold tracking-tight">{d.val}</span>
                              <span className="text-[9.5px] font-medium opacity-80">{d.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
        </motion.div>
        </div>
      )}

      {/* Selection Popover */}
      <AnimatePresence>
        {selectionRect && selectedText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, filter: 'blur(2px)' }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed z-50 flex items-center gap-2 bg-gray-900 text-white px-3 py-2 rounded-xl shadow-xl border border-gray-700"
            style={{
              top: selectionRect.top - 48,
              left: selectionRect.left + (selectionRect.width / 2),
              transform: 'translateX(-50%)'
            }}
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[11px] font-medium truncate max-w-[120px] text-gray-300">
                "{selectedText}"
              </span>
            </div>
            <div className="w-px h-4 bg-gray-700 mx-1" />
            <button 
              onClick={handleAsk}
              className="text-[11px] font-bold text-white hover:text-blue-400 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Ask Zeyro
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── CashflowForecastMiniChart ────────────────────────────────────────────────
const CashflowForecastMiniChart: React.FC<{ profile: AccountProfile }> = ({ profile }) => {
  const historicalCount = profile.forecast.filter(p => !p.isProjected).length;
  
  // Enrich for MSME overlays and probabilistic P10/P50/P90
  const enrichedData = profile.forecast.map((p, i) => {
    const variance = p.isProjected ? 1 + ((i - historicalCount + 1) * 0.08) : 1;
    return {
      ...p,
      receivables: profile.type === 'MSME' ? p.balance * 0.85 + 50000 : undefined,
      p10: p.isProjected ? p.balance * (2 - Math.min(variance, 1.5)) : undefined,
      p50: p.isProjected ? p.balance : undefined,
      p90: p.isProjected ? p.balance * Math.min(variance, 1.5) : undefined,
      probRange: p.isProjected ? [p.balance * (2 - Math.min(variance, 1.5)), p.balance * Math.min(variance, 1.5)] : undefined
    };
  });
  
  const historical = enrichedData.filter(p => !p.isProjected);
  const projected = enrichedData.filter(p => p.isProjected);
  const lastH = historical[historical.length - 1];
  const projStitched = lastH ? [lastH, ...projected] : projected;

  const allVals = profile.forecast.map(p => p.balance);
  const minVal = Math.min(...allVals, ...enrichedData.map(d => d.p10 || d.balance));
  const maxVal = Math.max(...allVals, ...enrichedData.map(d => d.p90 || d.balance), profile.type === 'MSME' ? Math.max(...enrichedData.map(d => d.receivables || 0)) : 0);
  const emiDueDates = profile.forecast.filter(p => p.isEmiDue).map(p => p.date);
  const salaryDates = profile.forecast.filter(p => p.isSalaryCredit).map(p => p.date);

  const fmt = (v: number) => {
    if (Math.abs(v) >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
    if (Math.abs(v) >= 1000) return `₹${(v / 1000).toFixed(0)}k`;
    return `₹${v}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const val = payload[0]?.value ?? payload[1]?.value;
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg text-xs">
        <p className="font-semibold text-gray-500 mb-0.5">{label}</p>
        <p className={`font-bold ${val < 0 ? 'text-red-600' : 'text-gray-900'}`}>{fmt(val)}</p>
        {payload[0]?.payload?.p10 !== undefined && (
           <p className="text-gray-500 text-[10px] mt-1 flex justify-between gap-3 border-t pt-1 border-gray-100">
             <span>P10: {fmt(payload[0].payload.p10)}</span>
             <span>P90: {fmt(payload[0].payload.p90)}</span>
           </p>
        )}
        {payload[0]?.dataKey === 'receivables' && <p className="text-amber-600 text-[10px] mt-0.5">Trade Receivables</p>}
        {val < 0 && <p className="text-red-500 text-[10px]">⚠ Projected shortfall</p>}
        {emiDueDates.includes(label) && <p className="text-red-500 text-[10px] mt-0.5">EMI due — {fmt(profile.emiAmount)}</p>}
        {salaryDates.includes(label) && <p className="text-green-600 text-[10px] mt-0.5">✓ Salary credit</p>}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">30-Day Balance Forecast</span>
        <div className="flex items-center gap-3 text-[9.5px] text-gray-400">
          <span className="flex items-center gap-1"><span className="w-5 h-px bg-gray-900 inline-block" />Actual</span>
          <span className="flex items-center gap-1"><span className="w-5 h-px border-t-2 border-dashed border-indigo-400 inline-block" />Forecast</span>
          {profile.type === 'MSME' && <span className="flex items-center gap-1"><span className="w-5 h-px bg-amber-400 inline-block" />Receivables</span>}
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />EMI</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Salary</span>
        </div>
      </div>
      <div 
        className="h-40 w-full cursor-grab active:cursor-grabbing"
        draggable={true}
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', `Analyze this 30-Day Balance Forecast for ${profile.name}:\n\n${JSON.stringify(enrichedData, null, 2)}`);
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={enrichedData} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id={`fg-${profile.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 8.5, fill: '#9ca3af' }} dy={6} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8.5, fill: '#9ca3af' }} tickFormatter={fmt} domain={[Math.min(minVal * 1.15, -1000), maxVal * 1.12]} width={44} />
            <Tooltip content={<CustomTooltip />} />
            {minVal < 0 && <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} />}
            {emiDueDates.map(d => (
              <ReferenceLine key={d} x={d} stroke="#ef4444" strokeDasharray="3 2" strokeWidth={1.5}
                label={{ value: 'EMI', position: 'insideTopRight', fontSize: 7.5, fill: '#ef4444' }}
              />
            ))}
            <ReferenceLine y={profile.emiAmount * 1.2} stroke="#f59e0b" strokeDasharray="3 2" strokeWidth={1}
              label={{ value: '1.2x threshold', position: 'insideTopLeft', fontSize: 7.5, fill: '#f59e0b' }}
            />
            {profile.type === 'MSME' && historical.length > 2 && (
              <ReferenceArea x1={historical[historical.length - 2]?.date} x2={projected[1]?.date} fill="#fef08a" fillOpacity={0.3} />
            )}
            {profile.type === 'MSME' && (
              <Line dataKey="receivables" type="monotone" stroke="#fbbf24" strokeWidth={2} dot={false} activeDot={false} />
            )}
            {/* Probabilistic Area for P10/P90 */}
            <Area data={projStitched} type="monotone" dataKey="probRange" stroke="none" fill="#e0e7ff" fillOpacity={0.6} activeDot={false} />
            
            <Area data={historical} type="monotone" dataKey="balance" stroke="#111111" strokeWidth={2} fill={`url(#fg-${profile.id})`} dot={false} activeDot={{ r: 4, strokeWidth: 2 }} />
            <Line data={projStitched} type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={2} strokeDasharray="6 3" dot={false} activeDot={{ r: 4 }} />
            {salaryDates.map(d => {
              const pt = profile.forecast.find(p => p.date === d);
              if (!pt) return null;
              return <ReferenceDot key={d} x={d} y={pt.balance} r={5} fill="#10b981" stroke="white" strokeWidth={2} />;
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ─── CashflowOutputView ───────────────────────────────────────────────────────
export const CashflowOutputView: React.FC<{ onAskZeyro?: (text: string) => void, initialSelectedId?: string | null, onProfileSelect?: (id: string | null) => void }> = ({ onAskZeyro, initialSelectedId = null, onProfileSelect }) => {
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);

  useEffect(() => {
    onProfileSelect?.(selectedId);
  }, [selectedId, onProfileSelect]);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const [selectedText, setSelectedText] = useState('');
  
  const [alertSearch, setAlertSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'All' | 'critical' | 'warning'>('All');

  const { handleContextMenu, renderContextMenu } = useChartContextMenu(onAskZeyro);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionRect(rect);
      setSelectedText(selection.toString().trim());
    } else {
      setSelectionRect(null);
      setSelectedText('');
    }
  };

  const handleAsk = () => {
    if (onAskZeyro && selectedText) {
      onAskZeyro(selectedText);
      window.getSelection()?.removeAllRanges();
      setSelectionRect(null);
      setSelectedText('');
    }
  };
  const profile = selectedId ? ACCOUNT_PROFILES.find(p => p.id === selectedId) || null : null;
  const activeAlerts = profile ? profile.alerts.filter(a => !dismissedAlerts.includes(a.id)) : [];

  const emiDueDateLabel = (() => {
    if (!profile) return '';
    const today = new Date();
    const due = new Date(today.getFullYear(), today.getMonth(), profile.emiDueDay);
    if (due < today) due.setMonth(due.getMonth() + 1);
    const diff = Math.ceil((due.getTime() - today.getTime()) / 86400000);
    if (diff === 0) return 'Today'; if (diff === 1) return 'Tomorrow'; return `${diff} days`;
  })();

  const heroMetrics = profile ? [
    { label: 'Bounce Probability', value: `${profile.bounceProbability}%`, severity: profile.bounceProbability >= 60 ? 'critical' : profile.bounceProbability >= 30 ? 'warning' : 'ok' as const, sub: 'on next EMI date' },
    { label: 'Surplus / EMI', value: `${profile.surplusEmiRatio.toFixed(2)}x`, severity: profile.surplusEmiRatio < 1.0 ? 'critical' : profile.surplusEmiRatio < 1.2 ? 'warning' : 'ok' as const, sub: profile.surplusEmiRatio < 1.0 ? 'Below safe threshold' : profile.surplusEmiRatio < 1.2 ? 'Near 1.2x safe zone' : 'Safe zone' },
    { label: 'EMI Due In', value: emiDueDateLabel, severity: 'ok' as const, sub: `₹${profile.emiAmount.toLocaleString()} on day ${profile.emiDueDay}` },
  ] : [];

  const sevStyle: Record<string, { bg: string; border: string; val: string; sub: string }> = {
    critical: { bg: 'bg-red-50', border: 'border-red-200', val: 'text-red-700', sub: 'text-red-400' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', val: 'text-amber-700', sub: 'text-amber-400' },
    ok: { bg: 'bg-green-50', border: 'border-green-200', val: 'text-green-700', sub: 'text-green-500' },
  };

  const alertStyle: Record<string, { bg: string; border: string; dot: string; text: string }> = {
    critical: { bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500', text: 'text-red-700' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-100', dot: 'bg-amber-400', text: 'text-amber-700' },
    resolved: { bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-green-500', text: 'text-gray-600' },
  };

  const alertTypeLabel: Record<string, string> = {
    inflow_drop: 'Inflow Drop', bounce_risk: 'Bounce Risk', critical_bounce: 'Critical Bounce',
    salary_late: 'Salary Late', dso_rising: 'DSO Rising',
  };

  const oItemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { ease: [0.23, 1, 0.32, 1] as const, duration: 0.35 } }
  };



  return (
    <div className="flex flex-col gap-4 mt-2 font-sans relative select-text" onMouseUp={handleMouseUp}>
      {renderContextMenu()}
      
      {/* Search Bar matching Report View */}
      <AccountSearchBar profiles={ACCOUNT_PROFILES} selectedId={selectedId || ''} onSelect={p => { setSelectedId(p.id); setDismissedAlerts([]); }} />

      {!selectedId || !profile ? (
        <div className="flex flex-col gap-3 mt-4">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-1">Attention Required</h3>
            <div className="flex gap-2 items-center">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-[#E6E5DF] rounded-lg shadow-sm">
                <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input
                  type="text"
                  placeholder="Search alerts..."
                  value={alertSearch}
                  onChange={e => setAlertSearch(e.target.value)}
                  className="w-32 text-[10px] outline-none bg-transparent text-gray-800 placeholder:text-gray-400"
                />
                {alertSearch && (
                  <button onClick={() => setAlertSearch('')} className="w-3 h-3 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors active:scale-[0.97]">
                    <svg className="w-2 h-2 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                <CustomDropdown
                  label="Severity"
                  value={severityFilter}
                  onChange={(v) => setSeverityFilter(v as any)}
                  options={[
                    { label: 'All Alerts', value: 'All' },
                    { label: 'Critical', value: 'critical' },
                    { label: 'Warning', value: 'warning' }
                  ]}
                />
              </div>
            </div>
          </div>
          {(() => {
            const allAlerts = ACCOUNT_PROFILES.flatMap(p => p.alerts.map(a => ({...a, profile: p })))
              .filter(a => a.severity !== 'resolved')
              .filter(a => severityFilter === 'All' || a.severity === severityFilter)
              .filter(a => [a.profile.name, a.profile.id, alertTypeLabel[a.type], a.detail].some(v => v?.toLowerCase().includes(alertSearch.toLowerCase())))
              .sort((a, b) => a.severity === 'critical' ? -1 : 1);
            
            if (allAlerts.length === 0) {
              return (
                <div className="py-12 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50 flex flex-col items-center">
                   <svg className="w-8 h-8 text-gray-300 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                   <span className="text-[12px] font-medium text-gray-500">No active alerts match your filters.</span>
                   {(alertSearch || severityFilter !== 'All') && (
                     <button onClick={() => { setAlertSearch(''); setSeverityFilter('All'); }} className="mt-2 text-[11px] text-indigo-600 font-semibold hover:text-indigo-800 transition-colors active:scale-[0.97]">Clear filters</button>
                   )}
                </div>
              );
            }

            return allAlerts.map((alert, i) => (
              <button 
                key={`${alert.profile.id}-${alert.id}`}
                onClick={() => {
                  setSelectedId(alert.profile.id);
                  onAskZeyro?.(`Let's discuss the ${alert.type.replace('_', ' ')} alert for ${alert.profile.name} and solve this proactively.`);
                }}
                className="flex items-start gap-3 p-3 bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-left transition-all hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] group"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${alert.severity === 'critical' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex justify-between items-start w-full">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[13px] text-gray-900 group-hover:text-blue-600 transition-colors">{alert.profile.name}</span>
                      <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1 rounded">{alert.profile.id}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">{alert.timestamp}</span>
                  </div>
                  <span className="text-[12px] text-gray-600 leading-relaxed pr-4">{alert.detail}</span>
                </div>
              </button>
            ));
          })()}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-col gap-3"
          >
          {/* Hero Metric Cards */}
          <div className="grid grid-cols-3 gap-2">
            {heroMetrics.map((m, i) => {
              const s = sevStyle[m.severity];
              return (
                <motion.div
                  key={i}
                  variants={oItemVariants}
                  initial="hidden" animate="show"
                  transition={{ delay: i * 0.05 }}
                  className={`flex flex-col gap-0.5 p-3 rounded-xl border ${s.bg} ${s.border}`}
                >
                  <span className="text-[9px] text-gray-500 font-semibold uppercase tracking-wide">{m.label}</span>
                  <span className={`text-[20px] font-bold tracking-tight leading-none ${s.val}`}>{m.value}</span>
                  <span className={`text-[10px] mt-0.5 ${s.sub}`}>{m.sub}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Peer Comparison Strip */}
          <motion.div
            variants={oItemVariants}
            initial="hidden" animate="show"
            className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100"
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${profile.surplusEmiRatio > 1.2 ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-600'}`}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {profile.surplusEmiRatio > 1.2 ? (
                  <path d="M23 6l-9.5 9.5-5-5L1 18"/>
                ) : (
                  <path d="M23 18l-9.5-9.5-5 5L1 6"/>
                )}
              </svg>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <span className="text-[11px] font-medium text-gray-800">
                Surplus ratio is <span className="font-bold">{profile.surplusEmiRatio > 1.2 ? '14% higher' : '20% lower'}</span> than peers in <span className="font-bold">{profile.type}</span> segment.
              </span>
            </div>
          </motion.div>

          {/* Alerts — inline, no section header */}
          <AnimatePresence>
            {activeAlerts.map(alert => {
              const as_ = alertStyle[alert.severity];
              return (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border ${as_.bg} ${as_.border}`}
                >
                  <span className={`w-1.5 h-1.5 shrink-0 rounded-full ${as_.dot} ${alert.severity === 'critical' ? 'animate-pulse' : ''}`} />
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${as_.text}`}>{alertTypeLabel[alert.type]}</span>
                      <span className="text-[9px] text-gray-400 font-mono">{profile.id}</span>
                    </div>
                    <span className="text-[11px] text-gray-700 truncate">{alert.detail}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9px] text-gray-400">{alert.timestamp}</span>
                    <button onClick={() => setDismissedAlerts(prev => [...prev, alert.id])} className="text-[9px] font-semibold text-gray-400 hover:text-gray-700 transition-colors">✕</button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* 30-Day Forecast */}
          <div className="bg-white border border-gray-100 rounded-xl p-3" onContextMenu={handleContextMenu}>
            <CashflowForecastMiniChart profile={profile} />
          </div>

          {/* Metric Rows */}
          <div className="flex flex-col gap-1">
            {[...profile.metrics].sort((a, b) => {
              const orderMap: Record<string, string[]> = {
                'MSME': ['Net Monthly Revenue', 'DSO', 'DSCR', 'Inflow Concentration', 'GST–Bank Crosscheck'],
                'Self-Employed': ['Income Dip Months', 'Avg Monthly Income', 'FOIR', 'BNPL Exposure', 'Hidden EMIs'],
                'Salaried': ['Avg Monthly Income', 'Savings Rate', 'FOIR', 'BNPL Exposure', 'Hidden EMIs']
              };
              const order = orderMap[profile.type] || [];
              const idxA = order.indexOf(a.label);
              const idxB = order.indexOf(b.label);
              if (idxA === -1 && idxB === -1) return 0;
              if (idxA === -1) return 1;
              if (idxB === -1) return -1;
              return idxA - idxB;
            }).map((m, i) => (
              <MetricRowWithInsight key={i} label={m.label} value={m.value} status={m.status} isWarning={m.isWarning} insight={m.insight} />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
      )}

      {/* Selection Popover */}
      <AnimatePresence>
        {selectionRect && selectedText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, filter: 'blur(2px)' }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed z-50 flex items-center gap-2 bg-gray-900 text-white px-3 py-2 rounded-xl shadow-xl border border-gray-700"
            style={{
              top: selectionRect.top - 48,
              left: selectionRect.left + (selectionRect.width / 2),
              transform: 'translateX(-50%)'
            }}
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[11px] font-medium truncate max-w-[120px] text-gray-300">
                "{selectedText}"
              </span>
            </div>
            <div className="w-px h-4 bg-gray-700 mx-1" />
            <button 
              onClick={handleAsk}
              className="text-[11px] font-bold text-white hover:text-blue-400 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Ask Zeyro
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── CashflowPortfolioOverview ────────────────────────────────────────────────
export const CashflowPortfolioOverview: React.FC = () => {
  const totalMonitored = ACCOUNT_PROFILES.length;
  const accountsInAlert = ACCOUNT_PROFILES.filter(p => p.alerts.some(a => a.severity === 'critical')).length;
  const avgBounceProb = Math.round(ACCOUNT_PROFILES.reduce((acc, p) => acc + p.bounceProbability, 0) / (totalMonitored || 1));
  
  const greenCount = ACCOUNT_PROFILES.filter(p => p.bounceProbability < 30).length;
  const amberCount = ACCOUNT_PROFILES.filter(p => p.bounceProbability >= 30 && p.bounceProbability < 60).length;
  const redCount = ACCOUNT_PROFILES.filter(p => p.bounceProbability >= 60).length;

  const salariedCount = ACCOUNT_PROFILES.filter(p => p.type === 'Salaried').length;
  const selfEmployedCount = ACCOUNT_PROFILES.filter(p => p.type === 'Self-Employed').length;
  const msmeCount = ACCOUNT_PROFILES.filter(p => p.type === 'MSME').length;

  return (
    <div className="w-full bg-white border border-[#E6E5DF] rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.015)] mb-6 font-sans">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Portfolio Overview</h2>
        <div className="text-[10px] font-mono text-gray-400">Last refreshed: 08:31 AM</div>
      </div>

      <div className="flex gap-8">
        <div className="flex flex-col gap-1 w-24">
          <span className="text-[10px] font-semibold text-gray-500 uppercase">Monitored</span>
          <span className="text-2xl font-bold text-gray-900">{totalMonitored.toLocaleString()}</span>
        </div>
        
        <div className="flex flex-col gap-1 w-24">
          <span className="text-[10px] font-semibold text-gray-500 uppercase">Critical Alerts</span>
          <span className="text-2xl font-bold text-red-600">{accountsInAlert}</span>
        </div>
        
        <div className="flex flex-col gap-1 w-24">
          <span className="text-[10px] font-semibold text-gray-500 uppercase">Avg Bounce Risk</span>
          <span className="text-2xl font-bold text-gray-900">{avgBounceProb}%</span>
        </div>

        <div className="flex-1 flex flex-col justify-center ml-4 border-l border-gray-100 pl-8">
          <div className="flex justify-between items-center mb-1.5 text-[10px] font-semibold text-gray-500 uppercase">
            <span>Portfolio Health</span>
            <div className="flex gap-3 text-gray-900 font-mono">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />{greenCount}</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />{amberCount}</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />{redCount}</span>
            </div>
          </div>
          <div className="flex h-1.5 w-full rounded-full overflow-hidden mb-2">
            <div className="bg-green-500 h-full transition-all" style={{ width: `${(greenCount/(totalMonitored||1))*100}%` }} />
            <div className="bg-amber-400 h-full transition-all" style={{ width: `${(amberCount/(totalMonitored||1))*100}%` }} />
            <div className="bg-red-500 h-full transition-all" style={{ width: `${(redCount/(totalMonitored||1))*100}%` }} />
          </div>
          
          <div className="flex items-center gap-4 text-[10px] font-semibold text-gray-600 uppercase mt-1">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-400" /> {salariedCount} Salaried</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-purple-400" /> {selfEmployedCount} Self-Employed</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-indigo-500" /> {msmeCount} MSME</span>
          </div>
        </div>
      </div>
    </div>
  );
};
