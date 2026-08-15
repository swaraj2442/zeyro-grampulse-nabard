import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Shared Types ---
type EnrichmentProfile = {
  id: string;               
  appId: string;            
  name: string;             
  type: 'Salaried' | 'Self-Employed' | 'MSME';
  bank: string;
  txnCount: number;
  lastEnrichment: {
    ranAt: string;          
    txnsProcessed: number;
    accuracy: number;       
    flaggedCount: number;
    unclassifiedCount: number;
    nextRun: string;
  };
  consentExpiryDays: number;
  sources: {
    upi: { connected: boolean; txnsToday: number; lastSync: string; nextSync: string };
    aa: { connected: boolean; accounts: number; lastSync: string; nextSync: string };
    merchantDb: { connected: boolean; version: string; mccCount: number };
    enrichmentEngine: { connected: boolean; version: string; accuracy: number };
  };
  categoryDistribution: {
    label: string;
    percent: number;
    amountCr?: string;
    flagCount?: number;
    action?: string;
  }[];
  recentTransactions: EnrichedTransaction[];
  anomalies: AnomalyAlert[];
  behavioralMetrics: BehavioralMetric[];
  subscriptions: { name: string; amount: number; frequency: string; lastPaid: string; status: 'Active' | 'Paused' | 'Cancelled' }[];
  obligations: { name: string; amount: number; type: string; dueDate: string; riskLevel: 'Low' | 'Medium' | 'High' }[];
  merchantDependency?: { merchantName: string; dependencyScore: number; txnCount: number; spendRatio: number; frequency: string; }[];
};

type EnrichedTransaction = {
  id: string;               
  rawDescription: string;   
  enrichedCategory: string; 
  subCategory: string;      
  amount: number;
  direction: 'Debit' | 'Credit';
  merchantName: string | null;
  merchantTier: 'VERIFIED' | 'PROBABLE' | 'INFERRED' | null;
  confidence: number;       
  processedAt: string;
  anomalyFlags: string[];
  entityResolutionMs: number;
  location?: string;
  behavioralSignals?: {
    behaviorType: string;
    pattern: string;
    financialWindow: string;
    stateSignal: string;
    decisionTrigger: string;
    actionText: string;
  };
};

type AnomalyAlert = {
  id: string;
  type: 'round_trip' | 'velocity' | 'cash_spike' | 'merchant_flag' | 'gambling' | 'loan_stacking';
  severity: 'critical' | 'warning' | 'resolved';
  detail: string;
  txnId?: string;
  amount?: number;
  timestamp: string;
};

type BehavioralMetric = {
  label: string;
  value: string;
  status: string;
  isWarning: boolean;
  insight: string;
};


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

// --- Demo Data ---
export const ENRICHMENT_PROFILES: EnrichmentProfile[] = [
  {
    id: 'ACC-5521', appId: 'APP-2024-001',
    name: 'Rahul M.', type: 'Salaried', bank: 'HDFC Bank SA',
    txnCount: 1847,
    lastEnrichment: {
      ranAt: '18 Jul 2026 · 10:41 AM',
      txnsProcessed: 1847,
      accuracy: 0.974,
      flaggedCount: 2,
      unclassifiedCount: 3,
      nextRun: '18 Jul 2026 · 04:41 PM',
    },
    consentExpiryDays: 42,
    sources: {
      upi: { connected: true, txnsToday: 4821, lastSync: '2 mins ago', nextSync: '13 mins' },
      aa: { connected: true, accounts: 1, lastSync: '2 mins ago', nextSync: '13 mins' },
      merchantDb: { connected: true, version: 'v3.2', mccCount: 4200 },
      enrichmentEngine: { connected: true, version: 'v2.1', accuracy: 0.974 },
    },
    categoryDistribution: [
      { label: 'Income credits', percent: 34, amountCr: '₹52k total' },
      { label: 'EMI outflows', percent: 15, amountCr: '₹18.4k total' },
      { label: 'Essential spend', percent: 22 },
      { label: 'Discretionary spend', percent: 19 },
      { label: 'P2P transfers', percent: 7, flagCount: 2 },
      { label: 'Investments', percent: 2 },
      { label: 'Unclassified', percent: 1, action: '→ manual review' },
    ],
    recentTransactions: [
      { id: 'TXN-9912', rawDescription: 'UPI/SWIGGY/9821xxxxxx', enrichedCategory: 'Food', subCategory: 'Food Delivery', amount: 349, direction: 'Debit', merchantName: 'Swiggy', merchantTier: 'VERIFIED', confidence: 0.99, processedAt: '27 Sep 2025, 09:23 PM', anomalyFlags: [], entityResolutionMs: 3, location: 'KORAMANGALA, BENGALURU, KA (12.9279, 77.6271)', behavioralSignals: { behaviorType: 'Stress-driven spend', pattern: 'Late-night transaction spike (4th instance this week)', financialWindow: 'Mid-cycle (Day 18 of 30)', stateSignal: 'Elevated spend under high workload conditions', decisionTrigger: 'Delay credit exposure', actionText: 'Offer controlled-limit products or cooling-period nudges' } },
      { id: 'TXN-9891', rawDescription: 'UPI/ZEPTO/GROCERY', enrichedCategory: 'Groceries', subCategory: 'Delivery', amount: 1200, direction: 'Debit', merchantName: 'Zepto', merchantTier: 'VERIFIED', confidence: 0.97, processedAt: '14 Jul 2026, 08:12 AM', anomalyFlags: [], entityResolutionMs: 5, location: 'HSR LAYOUT, BENGALURU, KA', behavioralSignals: { behaviorType: 'Routine anchor spend', pattern: 'Weekly grocery transactions (₹800-₹1,200 range)', financialWindow: 'Post-salary stability phase (Day 5-7)', stateSignal: 'Consistent spend, low volatility, predictable cash flow', decisionTrigger: 'High subscription affinity', actionText: 'Enable recurring products or bundled financial services' } },
      { id: 'TXN-9834', rawDescription: 'NEFT/FLIPKART/PREMIUM', enrichedCategory: 'Shopping', subCategory: 'Electronics', amount: 48000, direction: 'Debit', merchantName: 'Flipkart', merchantTier: 'VERIFIED', confidence: 0.88, processedAt: '26 Jul 2026, 02:41 PM', anomalyFlags: ['round_trip_suspected'], entityResolutionMs: 12, location: 'BANDRA KURLA COMPLEX, MUMBAI', behavioralSignals: { behaviorType: 'Planned high-value spend', pattern: 'Post-salary accumulation followed by large transaction', financialWindow: 'Peak liquidity phase (Day 2-3)', stateSignal: 'High intent, financially prepared, low hesitation', decisionTrigger: 'Pre-approved credit or premium offering window', actionText: 'Maximize LTV through timely upsell' } },
    ],
    anomalies: [
      { id: 'an1', type: 'round_trip', severity: 'warning', detail: 'Matching credit ₹7,900 received 4 minutes after debit. Same device fingerprint.', txnId: 'TXN-9834', amount: 8200, timestamp: 'Jul 15, 2026' },
    ],
    behavioralMetrics: [
      { label: 'Merchant Diversity', value: '42 unique merchants', status: 'Normal', isWarning: false, insight: 'Healthy spread across merchant categories. No single merchant dependency detected.' },
      { label: 'Top Merchant Share', value: '18% (Zomato)', status: 'Monitor', isWarning: false, insight: 'Zomato accounts for 18% of discretionary spend. Within normal range for salaried urban profile.' },
      { label: 'Subscription Count', value: '6 active', status: 'Normal', isWarning: false, insight: '6 recurring merchant charges detected monthly. Netflix, Swiggy One, Amazon Prime among top 3.' },
      { label: 'P2P Transfer Ratio', value: '7%', status: 'Low', isWarning: false, insight: 'P2P transfers are 7% of total debits. No velocity anomaly. 1 round-trip flag under review.' },
      { label: 'High-Risk Merchant Spend', value: '₹0', status: 'Clean', isWarning: false, insight: 'No transactions to gambling, crypto, or betting platforms detected in last 90 days.' },
      { label: 'Payday Burn Rate', value: '31% in 72hrs', status: 'Monitor', isWarning: false, insight: '31% of salary spent within 72 hours of credit. Slightly elevated but within salaried cohort norm.' },
    ],
    subscriptions: [
      { name: 'Hotstar Premium', amount: 899, frequency: 'Annual', lastPaid: '12 Jul 2026', status: 'Active' },
      { name: 'Swiggy One', amount: 899, frequency: 'Quarterly', lastPaid: '01 May 2026', status: 'Active' },
      { name: 'Amazon Prime', amount: 1499, frequency: 'Annual', lastPaid: '22 Feb 2026', status: 'Active' },
    ],
    obligations: [
      { name: 'HDFC Home Loan', amount: 42500, type: 'Secured Loan', dueDate: '5th of every month', riskLevel: 'Low' },
      { name: 'SBI Credit Card', amount: 12000, type: 'Credit Card', dueDate: '18th of every month', riskLevel: 'Low' },
    ],
    merchantDependency: [
      { merchantName: 'Swiggy', dependencyScore: 82, txnCount: 14, spendRatio: 18, frequency: '3.5x / week' },
      { merchantName: 'Zepto', dependencyScore: 65, txnCount: 4, spendRatio: 12, frequency: 'Weekly' },
      { merchantName: 'Flipkart', dependencyScore: 45, txnCount: 3, spendRatio: 8, frequency: '3.0x / month' },
    ],
  },
  {
    id: 'ACC-5477', appId: 'APP-2024-047',
    name: 'Priya S.', type: 'Self-Employed', bank: 'ICICI Bank CA',
    txnCount: 3214,
    lastEnrichment: {
      ranAt: '18 Jul 2026 · 08:12 AM',
      txnsProcessed: 3214,
      accuracy: 0.891,
      flaggedCount: 11,
      unclassifiedCount: 18,
      nextRun: '18 Jul 2026 · 02:12 PM',
    },
    consentExpiryDays: 7,
    sources: {
      upi: { connected: true, txnsToday: 8240, lastSync: 'Today', nextSync: '6 hours' },
      aa: { connected: false, accounts: 0, lastSync: '—', nextSync: '—' },
      merchantDb: { connected: true, version: 'v3.2', mccCount: 4200 },
      enrichmentEngine: { connected: true, version: 'v2.1', accuracy: 0.891 },
    },
    categoryDistribution: [
      { label: 'Business income', percent: 42 },
      { label: 'P2P transfers', percent: 21, flagCount: 9 },
      { label: 'Essential spend', percent: 14 },
      { label: 'BNPL repayments', percent: 11 },
      { label: 'Cash withdrawals', percent: 7, flagCount: 2 },
      { label: 'High-risk spend', percent: 3, flagCount: 0 },
      { label: 'Unclassified', percent: 2, action: '→ manual review' },
    ],
    recentTransactions: [
      { id: 'TXN-8821', rawDescription: 'UPI/BNPL/LAZYPAY/8821xxxxxx', enrichedCategory: 'BNPL Repayment', subCategory: 'Short-term Credit', amount: 4200, direction: 'Debit', merchantName: 'LazyPay', merchantTier: 'VERIFIED', confidence: 0.96, processedAt: '17 Jul 2026, 11:22 AM', anomalyFlags: [], entityResolutionMs: 4, location: 'Online', behavioralSignals: { behaviorType: 'Debt Servicing', pattern: 'Bi-weekly BNPL clearance', financialWindow: 'Pre-salary phase (Day 25-28)', stateSignal: 'Credit cycling, managing multiple short-term lines', decisionTrigger: 'Offer consolidation', actionText: 'Trigger low-interest personal loan offer' } },
      { id: 'TXN-8790', rawDescription: 'UPI/P2P/Unknown/7741xxxxxx', enrichedCategory: 'P2P Transfer', subCategory: 'Unknown counterparty', amount: 12000, direction: 'Debit', merchantName: null, merchantTier: null, confidence: 0.61, processedAt: '14 Jul 2026, 09:18 PM', anomalyFlags: ['high_velocity_p2p', 'new_vpa'], entityResolutionMs: 48, location: 'Unknown', behavioralSignals: { behaviorType: 'High-velocity P2P', pattern: 'Sudden spike to new VPAs', financialWindow: 'Mid-cycle (Day 15)', stateSignal: 'Anomalous outflow, potential account takeover or fraud', decisionTrigger: 'Hold and verify', actionText: 'Flag for step-up authentication' } },
    ],
    anomalies: [
      { id: 'an2', type: 'velocity', severity: 'critical', detail: '9 P2P transfers to new VPAs in 48hrs — 5x above personal baseline.', timestamp: 'Jul 14, 2026' },
      { id: 'an3', type: 'cash_spike', severity: 'warning', detail: 'Cash withdrawals 2.8x above monthly average. 2 ATM transactions flagged.', timestamp: 'Jul 10, 2026' },
      { id: 'an4', type: 'loan_stacking', severity: 'critical', detail: '3 new BNPL obligations detected in last 30 days. Stacking signal confirmed.', timestamp: 'Jul 1, 2026' },
    ],
    behavioralMetrics: [
      { label: 'Merchant Diversity', value: '89 unique merchants', status: 'Elevated', isWarning: true, insight: 'Very high merchant spread — 89 unique VPAs in 30 days. May indicate unstructured spend or income mixing.' },
      { label: 'BNPL Merchant Count', value: '4 platforms', status: 'High', isWarning: true, insight: 'Active on LazyPay, ZestMoney, Simpl, and KreditBee simultaneously. Loan stacking risk.' },
      { label: 'New VPA Ratio (30d)', value: '34% new', status: 'Flag', isWarning: true, insight: '34% of counterparty VPAs are new this month vs. history. Velocity anomaly confirmed.' },
      { label: 'High-Risk Merchant Spend', value: '₹3,200/mo', status: 'Monitor', isWarning: true, insight: 'Small but present gambling platform spend detected. BFS cohort correlation with delinquency is elevated.' },
      { label: 'Unclassified Txn Rate', value: '2% (18 txns)', status: 'Review', isWarning: true, insight: '18 transactions could not be resolved to a known merchant entity. Queued for manual review.' },
      { label: 'P2P Velocity', value: '9 new VPAs / 48hrs', status: 'Critical', isWarning: true, insight: '5x above personal baseline. New counterparty velocity is the strongest fraud signal in this profile.' },
    ],
    subscriptions: [
      { name: 'Adobe Creative Cloud', amount: 4230, frequency: 'Monthly', lastPaid: '14 Jul 2026', status: 'Active' },
      { name: 'Spotify Premium', amount: 119, frequency: 'Monthly', lastPaid: '08 Jul 2026', status: 'Active' },
    ],
    obligations: [
      { name: 'LazyPay', amount: 4200, type: 'BNPL', dueDate: '18th of every month', riskLevel: 'High' },
      { name: 'ZestMoney', amount: 3500, type: 'BNPL', dueDate: '5th of every month', riskLevel: 'High' },
      { name: 'Personal Loan EMI', amount: 14500, type: 'Unsecured Loan', dueDate: '10th of every month', riskLevel: 'Medium' },
    ],
    merchantDependency: [
      { merchantName: 'LazyPay', dependencyScore: 91, txnCount: 2, spendRatio: 22, frequency: 'Bi-weekly' },
      { merchantName: 'ZestMoney', dependencyScore: 85, txnCount: 1, spendRatio: 15, frequency: 'Monthly' },
      { merchantName: 'Unknown P2P', dependencyScore: 78, txnCount: 9, spendRatio: 34, frequency: 'High Velocity' },
    ],
  },
  {
    id: 'ACC-5301', appId: 'APP-2023-301',
    name: 'Sharma Textiles', type: 'MSME', bank: 'SBI CC + CA',
    txnCount: 6891,
    lastEnrichment: {
      ranAt: '18 Jul 2026 · 09:00 AM',
      txnsProcessed: 6891,
      accuracy: 0.961,
      flaggedCount: 3,
      unclassifiedCount: 7,
      nextRun: '18 Jul 2026 · 03:00 PM',
    },
    consentExpiryDays: 89,
    sources: {
      upi: { connected: true, txnsToday: 14821, lastSync: '1 hr ago', nextSync: '14 mins' },
      aa: { connected: true, accounts: 2, lastSync: '1 hr ago', nextSync: '14 mins' },
      merchantDb: { connected: true, version: 'v3.2', mccCount: 4200 },
      enrichmentEngine: { connected: true, version: 'v2.1', accuracy: 0.961 },
    },
    categoryDistribution: [
      { label: 'Sales receipts', percent: 48, amountCr: '₹14.6L total' },
      { label: 'Vendor payouts', percent: 22, amountCr: '₹6.4L total' },
      { label: 'GST payments', percent: 8 },
      { label: 'Salary payroll', percent: 9 },
      { label: 'EMI (business loan)', percent: 7 },
      { label: 'Utilities + rent', percent: 5 },
      { label: 'Unclassified', percent: 1, action: '→ manual review' },
    ],
    recentTransactions: [
      { id: 'TXN-7701', rawDescription: 'NEFT/CLIENT/ARTEX FABRICS PVT LTD', enrichedCategory: 'Sales', subCategory: 'B2B Invoice Payment', amount: 840000, direction: 'Credit', merchantName: 'Artex Fabrics Pvt Ltd', merchantTier: 'PROBABLE', confidence: 0.91, processedAt: '18 Jul 2026, 09:00 AM', anomalyFlags: [], entityResolutionMs: 22, location: 'Mumbai, MH', behavioralSignals: { behaviorType: 'Key Client Inflow', pattern: 'Monthly large-ticket B2B receipt', financialWindow: 'Start of month liquidity event', stateSignal: 'Strong B2B health, high concentration risk', decisionTrigger: 'Working capital window', actionText: 'Offer invoice discounting for next cycle' } },
      { id: 'TXN-7688', rawDescription: 'RTGS/VENDOR/RAJESH MILLS/9901xxxxxx', enrichedCategory: 'Vendor Payout', subCategory: 'Raw Material Purchase', amount: 320000, direction: 'Debit', merchantName: 'Rajesh Mills', merchantTier: 'INFERRED', confidence: 0.74, processedAt: '17 Jul 2026, 04:15 PM', anomalyFlags: [], entityResolutionMs: 31, location: 'Surat, GJ', behavioralSignals: { behaviorType: 'Supply Chain Outflow', pattern: 'Routine vendor payment', financialWindow: 'Post-revenue clearance', stateSignal: 'Healthy supply chain operation', decisionTrigger: 'B2B Payments Optimization', actionText: 'Pitch automated vendor payout product' } },
    ],
    anomalies: [
      { id: 'an5', type: 'merchant_flag', severity: 'warning', detail: 'Primary client Artex Fabrics accounts for 64% of total inflow. Vendor concentration flag.', timestamp: 'Jun 30, 2026' },
    ],
    behavioralMetrics: [
      { label: 'Entity Resolution Rate', value: '96.1% verified', status: 'Strong', isWarning: false, insight: 'High counterparty resolution rate. Most B2B VPAs matched to known business entities.' },
      { label: 'Vendor Concentration (Top 1)', value: '64% single client', status: 'Warning', isWarning: true, insight: 'Artex Fabrics accounts for 64% of inflow. Single-client dependency is a systemic risk signal.' },
      { label: 'INFERRED Entity Ratio', value: '8% of txns', status: 'Monitor', isWarning: false, insight: '8% of transactions resolved to INFERRED tier entities. Async resolver jobs queued for these VPAs.' },
      { label: 'GST vs Bank Crosscheck', value: 'Consistent', status: 'Verified', isWarning: false, insight: 'Declared GST turnover aligns with bank inflows within 5% tolerance. Revenue authenticity confirmed.' },
      { label: 'Round-Trip Signals', value: 'None detected', status: 'Clean', isWarning: false, insight: 'No circular fund flow detected in last 90 days. No synthetic income signals.' },
      { label: 'Payroll Regularity', value: 'Day 1 every month', status: 'Consistent', isWarning: false, insight: 'Salary outflows consistent on the 1st of each month. Indicates stable payroll management.' },
    ],
    subscriptions: [
      { name: 'Zoho One', amount: 12500, frequency: 'Annual', lastPaid: '01 Apr 2026', status: 'Active' },
      { name: 'AWS Cloud Services', amount: 45000, frequency: 'Monthly', lastPaid: '03 Jul 2026', status: 'Active' },
      { name: 'Razorpay X', amount: 2500, frequency: 'Monthly', lastPaid: '05 Jul 2026', status: 'Active' },
    ],
    obligations: [
      { name: 'SBI Working Capital', amount: 150000, type: 'OD/CC Facility', dueDate: 'Revolving', riskLevel: 'Low' },
      { name: 'GST Payable', amount: 84000, type: 'Tax Liability', dueDate: '20th of every month', riskLevel: 'Low' },
    ],
    merchantDependency: [
      { merchantName: 'Artex Fabrics Pvt Ltd', dependencyScore: 96, txnCount: 4, spendRatio: 64, frequency: 'Weekly' },
      { merchantName: 'Rajesh Mills', dependencyScore: 72, txnCount: 6, spendRatio: 18, frequency: 'Weekly' },
    ],
  },
];

// --- Sub Components ---
const EnrichmentSearchBar: React.FC<{
  profiles: EnrichmentProfile[];
  selectedId: string | null;
  onSelect: (p: EnrichmentProfile) => void;
}> = ({ profiles, selectedId, onSelect }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filtered = profiles.filter(p =>
    [p.name, p.id, p.appId, p.bank, p.type]
      .some(v => v.toLowerCase().includes(query.toLowerCase()))
  );

  const selected = profiles.find(p => p.id === selectedId);

  const sevDot = (p: EnrichmentProfile) => {
    if (p.anomalies.some(a => a.severity === 'critical')) return 'bg-red-500';
    if (p.anomalies.some(a => a.severity === 'warning')) return 'bg-amber-400';
    return 'bg-green-500';
  };

  return (
    <div className="relative w-full font-sans">
      <div
        className="flex items-center gap-3 p-3 bg-white border border-[#E6E5DF] rounded-xl cursor-text shadow-[0_2px_12px_rgba(0,0,0,0.015)] hover:border-gray-300 transition-colors duration-[160ms]"
        onClick={() => setIsOpen(true)}
      >
        <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input
          type="text"
          placeholder="Search by name, ID, bank, or type…"
          value={query}
          onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          className="flex-1 text-[13px] outline-none bg-transparent text-gray-800 placeholder:text-gray-400 font-medium"
        />
        {selected && !query && (
          <div className="flex items-center gap-2 shrink-0 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
            <span className={`w-1.5 h-1.5 rounded-full ${sevDot(selected)}`} />
            <span className="text-[11px] font-semibold text-gray-700">{selected.name}</span>
            <span className="text-[10px] text-gray-400 font-mono">{selected.id}</span>
          </div>
        )}
        {query && (
          <button onClick={e => { e.stopPropagation(); setQuery(''); setIsOpen(false); }} className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
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
              <div className="max-h-56 overflow-y-auto divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <div className="p-4 text-center text-[12px] text-gray-400 font-medium">No accounts match "{query}"</div>
                ) : filtered.map(p => (
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
                      <span className="text-[10px] text-gray-400 mt-0.5">{p.bank} · {p.type} · {p.txnCount.toLocaleString()} txns</span>
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                      p.lastEnrichment.accuracy >= 0.95 ? 'bg-green-50 border-green-100 text-green-700'
                      : p.lastEnrichment.accuracy >= 0.85 ? 'bg-amber-50 border-amber-100 text-amber-700'
                      : 'bg-red-50 border-red-100 text-red-700'
                    }`}>{(p.lastEnrichment.accuracy * 100).toFixed(1)}% accuracy</div>
                  </button>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-gray-50 bg-gray-50/60 flex justify-between">
                <span className="text-[10px] font-medium text-gray-400">{filtered.length} account{filtered.length !== 1 ? 's' : ''} · {profiles.filter(p => p.anomalies.some(a => a.severity === 'critical')).length} critical anomalies</span>
                <span className="text-[10px] font-medium text-gray-400 font-mono">{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export const EnrichmentPortfolioOverview: React.FC = () => {
  const totalAccounts = ENRICHMENT_PROFILES.length;
  const totalTxnsToday = ENRICHMENT_PROFILES.reduce((acc, p) => acc + p.sources.upi.txnsToday, 0);
  const avgAccuracy = ENRICHMENT_PROFILES.reduce((acc, p) => acc + p.lastEnrichment.accuracy, 0) / totalAccounts;
  const totalAnomalies = ENRICHMENT_PROFILES.reduce((acc, p) => acc + p.anomalies.filter(a => a.severity !== 'resolved').length, 0);
  const criticalCount = ENRICHMENT_PROFILES.reduce((acc, p) => acc + p.anomalies.filter(a => a.severity === 'critical').length, 0);

  const generalCount = ENRICHMENT_PROFILES.filter(p => p.type !== 'MSME').length;
  const msmeCount = ENRICHMENT_PROFILES.filter(p => p.type === 'MSME').length;

  return (
    <div className="w-full bg-white border border-[#E6E5DF] rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.015)] mb-6 font-sans">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Enrichment Overview</h2>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-mono font-medium text-gray-400">Zeyro Enrichment Engine v2.1 · Live</span>
        </div>
      </div>
      <div className="flex gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Monitored</span>
          <span className="text-2xl font-bold text-gray-900">{totalAccounts}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Txns Today</span>
          <span className="text-2xl font-bold text-gray-900">{totalTxnsToday.toLocaleString()}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Avg Accuracy</span>
          <span className="text-2xl font-bold text-gray-900">{(avgAccuracy * 100).toFixed(1)}%</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Active Anomalies</span>
          <span className={`text-2xl font-bold ${criticalCount > 0 ? 'text-red-600' : 'text-amber-600'}`}>{totalAnomalies}</span>
        </div>
        <div className="flex-1 flex flex-col justify-center ml-4 border-l border-gray-100 pl-6">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Profile Mix</span>
          <div className="flex items-center gap-4 text-[11px] font-semibold text-gray-600">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-blue-400" />{generalCount} General Users</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-indigo-500" />{msmeCount} MSME</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const EnrichmentDataView: React.FC<{ data: any; selectedNode: string; onNavigateToOutput?: () => void }> = ({ data, selectedNode, onNavigateToOutput }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Salaried' | 'Self-Employed' | 'MSME'>('All');
  const [sortKey, setSortKey] = useState<'name' | 'accuracy' | 'anomalies' | 'consent' | 'txns' | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const profile = selectedId ? ENRICHMENT_PROFILES.find(p => p.id === selectedId) ?? null : null;

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filteredSorted = [...ENRICHMENT_PROFILES]
    .filter(p => typeFilter === 'All' || p.type === typeFilter)
    .filter(p => [p.name, p.id, p.appId, p.bank, p.type].some(v => v.toLowerCase().includes(searchQuery.toLowerCase())))
    .sort((a, b) => {
      if (!sortKey) return 0;
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortKey) {
        case 'name': return a.name.localeCompare(b.name) * dir;
        case 'accuracy': return (a.lastEnrichment.accuracy - b.lastEnrichment.accuracy) * dir;
        case 'anomalies': return (a.anomalies.filter(x => x.severity !== 'resolved').length - b.anomalies.filter(x => x.severity !== 'resolved').length) * dir;
        case 'consent': return (a.consentExpiryDays - b.consentExpiryDays) * dir;
        case 'txns': return (a.sources.upi.txnsToday - b.sources.upi.txnsToday) * dir;
        default: return 0;
      }
    });

  const SourceRow = ({ icon, title, subtitle, connected, badgeLabel, lastSync, nextSync, consentBadge }: {
    icon: React.ReactNode; title: string; subtitle: string; connected: boolean;
    badgeLabel: string; lastSync: string; nextSync: string; consentBadge?: number | null;
  }) => (
    <div className={`flex items-center justify-between p-3.5 border rounded-xl transition-colors duration-[160ms] ${
      connected ? 'bg-white border-gray-100 hover:border-gray-200 cursor-pointer' : 'bg-gray-50/50 border-dashed border-gray-200 opacity-70'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${connected ? 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-400'}`}>{icon}</div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`text-[13px] font-semibold ${connected ? 'text-gray-900' : 'text-gray-500'}`}>{title}</span>
            {consentBadge != null && connected && (
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${consentBadge <= 14 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                Consent · {consentBadge}d
              </span>
            )}
          </div>
          <span className="text-[10px] text-gray-400 font-medium">{subtitle}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        {connected ? (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border bg-green-50 border-green-100 text-green-700">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-widest">{badgeLabel}</span>
          </div>
        ) : (
          <button className="px-2.5 py-1 rounded-lg border border-gray-300 bg-white text-gray-600 text-[10px] font-semibold hover:border-gray-400 active:scale-95 transition-colors">Connect</button>
        )}
        <span className="text-[9px] text-gray-400 font-mono font-medium mt-1">Last · {lastSync}</span>
        {connected && nextSync !== '—' && <span className="text-[9px] text-gray-400 font-mono font-medium">Next · {nextSync}</span>}
      </div>
    </div>
  );

  const SortHeader = ({ label, col }: { label: string; col: typeof sortKey }) => (
    col ? (
      <button onClick={() => handleSort(col)} className="flex items-center gap-1 text-[9.5px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-700 transition-colors group">
        {label}
        <span className="flex flex-col gap-px opacity-40 group-hover:opacity-100 transition-opacity">
          <svg className={`w-2 h-2 ${sortKey === col && sortDir === 'asc' ? 'text-gray-900 opacity-100' : ''}`} viewBox="0 0 24 24" fill="currentColor"><path d="M12 5l7 7H5z"/></svg>
          <svg className={`w-2 h-2 ${sortKey === col && sortDir === 'desc' ? 'text-gray-900 opacity-100' : ''}`} viewBox="0 0 24 24" fill="currentColor"><path d="M12 19l-7-7h14z"/></svg>
        </span>
      </button>
    ) : <span className="text-[9.5px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
  );

  const PortfolioTableView = () => (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-white border border-[#E6E5DF] rounded-xl shadow-sm">
            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" placeholder="Filter by name, ID, bank, or type…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 text-[12px] outline-none bg-transparent text-gray-800 placeholder:text-gray-400 font-medium" />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"><svg className="w-2.5 h-2.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>}
          </div>
          <div className="flex gap-1 shrink-0">
            {(['All', 'Salaried', 'Self-Employed', 'MSME'] as const).map(t => (
              <button key={t} onClick={() => setTypeFilter(t === typeFilter ? 'All' : t)} className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors duration-[120ms] ${typeFilter === t ? 'bg-gray-900 text-white' : 'bg-white border border-[#E6E5DF] text-gray-500 hover:border-gray-300'}`}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border border-[#E6E5DF] rounded-xl overflow-hidden bg-white shadow-[0_2px_8px_rgba(0,0,0,0.015)]">
        <div className="grid grid-cols-[1.8fr_0.8fr_0.6fr_0.8fr_1.2fr_0.7fr_0.7fr_0.6fr] gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
          <SortHeader label="Account" col="name" />
          <SortHeader label="Type" col={null} />
          <SortHeader label="Sources" col={null} />
          <SortHeader label="Txns Today" col="txns" />
          <SortHeader label="Last Enrichment" col={null} />
          <SortHeader label="Accuracy" col="accuracy" />
          <SortHeader label="Anomalies" col="anomalies" />
          <SortHeader label="Consent" col="consent" />
        </div>

        {filteredSorted.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-[12px] font-medium text-gray-500">No accounts match <span className="font-mono text-gray-700">"{searchQuery}"</span></p>
            <button onClick={() => { setSearchQuery(''); setTypeFilter('All'); }} className="mt-2 text-[11px] text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">Clear filters</button>
          </div>
        ) : filteredSorted.map((p, idx) => {
          const anomalyCount = p.anomalies.filter(a => a.severity !== 'resolved').length;
          const hasCritical = p.anomalies.some(a => a.severity === 'critical');
          const sourceCount = [p.sources.upi.connected, p.sources.aa.connected, p.sources.merchantDb.connected, p.sources.enrichmentEngine.connected].filter(Boolean).length;
          return (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.22, delay: idx * 0.04 }}
              onClick={() => { setSelectedId(p.id); setSearchQuery(''); setTypeFilter('All'); setSortKey(null); }}
              className="w-full grid grid-cols-[1.8fr_0.8fr_0.6fr_0.8fr_1.2fr_0.7fr_0.7fr_0.6fr] gap-2 px-4 py-3.5 border-b border-gray-50 last:border-b-0 hover:bg-gray-50/60 transition-colors text-left group"
            >
              <div className="flex flex-col justify-center min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 shrink-0 rounded-full ${hasCritical ? 'bg-red-500' : anomalyCount > 0 ? 'bg-amber-400' : 'bg-green-500'}`} />
                  <span className="text-[12px] font-semibold text-gray-900 truncate group-hover:text-indigo-700 transition-colors">{p.name}</span>
                </div>
                <div className="flex items-center gap-1.5 pl-3.5 mt-0.5">
                  <span className="text-[9.5px] font-mono text-gray-400">{p.id}</span>
                  <span className="text-[8px] text-gray-300">·</span>
                  <span className="text-[9.5px] font-mono text-indigo-400">{p.appId}</span>
                </div>
              </div>
              <div className="flex items-center">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${p.type === 'MSME' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : p.type === 'Self-Employed' ? 'bg-purple-50 border-purple-100 text-purple-700' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>{p.type}</span>
              </div>
              <div className="flex items-center">
                <span className={`text-[11px] font-semibold font-mono ${sourceCount === 4 ? 'text-green-700' : sourceCount <= 2 ? 'text-red-600' : 'text-amber-700'}`}>{sourceCount}/4</span>
              </div>
              <div className="flex items-center">
                <span className="text-[10px] font-mono font-medium text-gray-700">{p.sources.upi.txnsToday.toLocaleString()}</span>
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[10px] font-mono font-medium text-gray-700">{p.lastEnrichment.ranAt.split('·')[1]?.trim()}</span>
                <span className="text-[9px] text-gray-400 font-medium">{p.lastEnrichment.txnsProcessed.toLocaleString()} txns · {p.lastEnrichment.flaggedCount} flagged</span>
              </div>
              <div className="flex items-center">
                <span className={`text-[11px] font-bold font-mono ${p.lastEnrichment.accuracy >= 0.95 ? 'text-green-700' : p.lastEnrichment.accuracy >= 0.85 ? 'text-amber-700' : 'text-red-600'}`}>{(p.lastEnrichment.accuracy * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center">
                <span className={`text-[11px] font-semibold font-mono ${hasCritical ? 'text-red-600' : anomalyCount > 0 ? 'text-amber-700' : 'text-green-700'}`}>{anomalyCount}</span>
              </div>
              <div className="flex items-center">
                <span className={`text-[10px] font-semibold font-mono ${p.consentExpiryDays <= 14 ? 'text-amber-700' : 'text-gray-500'}`}>{p.consentExpiryDays}d{p.consentExpiryDays <= 14 ? ' !' : ''}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
      <div className="flex items-center justify-between px-1 mt-2">
        <span className="text-[10px] font-medium text-gray-400">{filteredSorted.length} accounts · {ENRICHMENT_PROFILES.reduce((acc, p) => acc + p.anomalies.filter(a => a.severity === 'critical').length, 0)} critical anomalies</span>
        <span className="text-[10px] font-medium text-gray-400 font-mono">Click any row to inspect enrichment</span>
      </div>
    </div>
  );

  const SingleAccountView = ({ p }: { p: EnrichmentProfile }) => {
    const sourceCount = [p.sources.upi.connected, p.sources.aa.connected, p.sources.merchantDb.connected, p.sources.enrichmentEngine.connected].filter(Boolean).length;

    const sourceRows = p.type === 'MSME' ? [
      { icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>, title: 'UPI Feed (NPCI)', subtitle: `${p.sources.upi.txnsToday.toLocaleString()} txns today`, connected: p.sources.upi.connected, lastSync: p.sources.upi.lastSync, nextSync: p.sources.upi.nextSync, consentBadge: null },
      { icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, title: 'AA Bank Statement Feed', subtitle: `${p.sources.aa.accounts} business accounts`, connected: p.sources.aa.connected, lastSync: p.sources.aa.lastSync, nextSync: p.sources.aa.nextSync, consentBadge: p.consentExpiryDays },
      { icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>, title: 'Merchant Category DB', subtitle: `${p.sources.merchantDb.version} · ${p.sources.merchantDb.mccCount.toLocaleString()} MCC codes`, connected: p.sources.merchantDb.connected, lastSync: 'Current', nextSync: 'Auto-updated', consentBadge: null },
      { icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, title: 'Zeyro Enrichment Engine', subtitle: `${p.sources.enrichmentEngine.version} · ${(p.sources.enrichmentEngine.accuracy * 100).toFixed(1)}% accuracy`, connected: p.sources.enrichmentEngine.connected, lastSync: p.lastEnrichment.ranAt.split('·')[1]?.trim() ?? '—', nextSync: p.lastEnrichment.nextRun.split('·')[1]?.trim() ?? '—', consentBadge: null },
    ] : [
      { icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>, title: 'UPI Feed (NPCI)', subtitle: `${p.sources.upi.txnsToday.toLocaleString()} txns today`, connected: p.sources.upi.connected, lastSync: p.sources.upi.lastSync, nextSync: p.sources.upi.nextSync, consentBadge: null },
      { icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, title: 'AA Bank Statement Feed', subtitle: `${p.sources.aa.accounts > 0 ? p.sources.aa.accounts + ' accounts' : 'Consent required'}`, connected: p.sources.aa.connected, lastSync: p.sources.aa.lastSync, nextSync: p.sources.aa.nextSync, consentBadge: p.consentExpiryDays },
      { icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>, title: 'Merchant Category DB', subtitle: `${p.sources.merchantDb.version} · ${p.sources.merchantDb.mccCount.toLocaleString()} MCC codes`, connected: p.sources.merchantDb.connected, lastSync: 'Current', nextSync: 'Auto-updated', consentBadge: null },
      { icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, title: 'Zeyro Enrichment Engine', subtitle: `${p.sources.enrichmentEngine.version} · ${(p.sources.enrichmentEngine.accuracy * 100).toFixed(1)}% accuracy`, connected: p.sources.enrichmentEngine.connected, lastSync: p.lastEnrichment.ranAt.split('·')[1]?.trim() ?? '—', nextSync: p.lastEnrichment.nextRun.split('·')[1]?.trim() ?? '—', consentBadge: null },
    ];

    const pipelineSteps = p.type === 'MSME' ? [
      { name: 'Schema Validator', status: 'Pass', val: `${p.txnCount.toLocaleString()} records`, color: 'bg-green-500', lastRun: p.lastEnrichment.ranAt.split('·')[1]?.trim() ?? '—', freshness: 'Fresh' },
      { name: 'Entity Resolver', status: 'Active', val: `${(p.lastEnrichment.accuracy * 100).toFixed(1)}% hit rate`, color: 'bg-teal-500', lastRun: p.lastEnrichment.ranAt.split('·')[1]?.trim() ?? '—', freshness: 'Fresh' },
      { name: 'GST Reconciliation', status: 'Synced', val: 'Consistent', color: 'bg-indigo-500', lastRun: p.lastEnrichment.ranAt.split('·')[1]?.trim() ?? '—', freshness: 'Fresh' },
      { name: 'Vendor Concentration', status: 'Flag', val: '64% single client', color: 'bg-amber-500', lastRun: p.lastEnrichment.ranAt.split('·')[1]?.trim() ?? '—', freshness: 'Fresh' },
      { name: 'Anomaly Detector', status: p.lastEnrichment.flaggedCount > 0 ? 'Flagged' : 'Clear', val: `${p.lastEnrichment.flaggedCount} flags`, color: p.lastEnrichment.flaggedCount > 0 ? 'bg-amber-500' : 'bg-green-500', lastRun: p.lastEnrichment.ranAt.split('·')[1]?.trim() ?? '—', freshness: 'Fresh' },
    ] : [
      { name: 'Schema Validator', status: 'Pass', val: `${p.txnCount.toLocaleString()} records`, color: 'bg-green-500', lastRun: p.lastEnrichment.ranAt.split('·')[1]?.trim() ?? '—', freshness: 'Fresh' },
      { name: 'Entity Resolver', status: 'Active', val: `${(p.lastEnrichment.accuracy * 100).toFixed(1)}% hit rate`, color: 'bg-teal-500', lastRun: p.lastEnrichment.ranAt.split('·')[1]?.trim() ?? '—', freshness: 'Fresh' },
      { name: 'Merchant Categorizer', status: 'Active', val: '42 classes', color: 'bg-indigo-500', lastRun: p.lastEnrichment.ranAt.split('·')[1]?.trim() ?? '—', freshness: 'Fresh' },
      { name: 'BNPL Detector', status: p.type === 'Self-Employed' ? 'Flag' : 'Clear', val: p.type === 'Self-Employed' ? '4 platforms' : 'None', color: p.type === 'Self-Employed' ? 'bg-rose-500' : 'bg-green-500', lastRun: p.lastEnrichment.ranAt.split('·')[1]?.trim() ?? '—', freshness: 'Fresh' },
      { name: 'Anomaly Detector', status: p.lastEnrichment.flaggedCount > 0 ? 'Flagged' : 'Clear', val: `${p.lastEnrichment.flaggedCount} flags`, color: p.lastEnrichment.flaggedCount > 0 ? 'bg-amber-500' : 'bg-green-500', lastRun: p.lastEnrichment.ranAt.split('·')[1]?.trim() ?? '—', freshness: 'Fresh' },
    ];

    const catColors = ['bg-indigo-500', 'bg-blue-500', 'bg-teal-500', 'bg-emerald-500', 'bg-amber-500', 'bg-orange-500', 'bg-gray-400'];

    return (
      <motion.div key={p.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }} className="flex flex-col gap-5 font-sans">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedId(null)} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-500">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <span className="text-[13px] font-semibold text-gray-900">Sources & Pipelines</span>
            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-md border ${p.type === 'MSME' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : p.type === 'Self-Employed' ? 'bg-purple-50 border-purple-100 text-purple-700' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>{p.type}</span>
            <span className="text-[9.5px] font-mono font-medium text-gray-400">{p.id}</span>
          </div>
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${sourceCount === 4 ? 'bg-green-50 border-green-100 text-green-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>{sourceCount}/4 connected · Last sync {p.sources.upi.lastSync}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Data Sources</span>
            <div className="flex flex-col gap-2">
              {sourceRows.map((s, i) => <SourceRow key={i} {...s} badgeLabel="Active" />)}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Enrichment Pipeline</span>
            <div className="bg-white border border-[#E6E5DF] rounded-xl overflow-hidden shadow-sm h-full">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Processing Steps</span>
                <span className="text-[10px] font-mono text-gray-400 font-medium">{p.txnCount.toLocaleString()} records · {(p.lastEnrichment.accuracy * 100).toFixed(1)}% accuracy</span>
              </div>
              <div className="divide-y divide-[#F0EFEA]">
                {pipelineSteps.map((step, i) => (
                  <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <motion.div layoutId={`status-dot-${step.name}`} className={`w-2 h-2 rounded-full ${step.color} shrink-0`} />
                      <div className="flex flex-col">
                        <span className="text-[12px] font-semibold text-gray-900">{step.name}</span>
                        <motion.span layoutId={`status-text-${step.name}`} className="text-[10px] font-medium text-gray-500">{step.status}</motion.span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[12px] font-mono font-medium text-gray-800">{step.val}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] text-gray-400 font-mono">{step.lastRun}</span>
                        <span className={`text-[9px] font-semibold ${step.freshness === 'Fresh' ? 'text-green-600' : 'text-amber-600'}`}>· {step.freshness}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stacked Bar Chart for Category Distribution */}
        <div className="bg-white border border-[#E6E5DF] rounded-xl p-5 shadow-sm mt-2">
          <div className="flex justify-between items-end mb-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Category Distribution</span>
              <span className="text-[12px] font-medium text-gray-700">Enriched breakdown of {p.txnCount.toLocaleString()} transactions</span>
            </div>
            <span className="text-[10px] font-mono font-medium text-gray-400">Model v2.1</span>
          </div>
          
          <div className="flex h-3 w-full rounded-full overflow-hidden mb-5 gap-0.5">
            {p.categoryDistribution.map((cat, i) => (
              <div 
                key={i} 
                className={`h-full ${catColors[i % catColors.length]} opacity-90 hover:opacity-100 transition-opacity`} 
                style={{ width: `${cat.percent}%` }}
                title={`${cat.label}: ${cat.percent}%`}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-2">
            {p.categoryDistribution.map((cat, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className={`w-2 h-2 rounded-sm mt-1 shrink-0 ${catColors[i % catColors.length]}`} />
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-gray-900 leading-tight">{cat.label}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10.5px] font-mono text-gray-500">{cat.percent}%</span>
                    {cat.amountCr && <span className="text-[9px] text-green-600 font-semibold bg-green-50 px-1 rounded">{cat.amountCr}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </motion.div>
    );
  };

  return (
    <div className="w-full h-full font-sans">
      <EnrichmentPortfolioOverview />
      <div className="w-full">
        <AnimatePresence mode="wait">
          {!selectedId ? (
            <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <PortfolioTableView />
            </motion.div>
          ) : (
            <SingleAccountView key="single" p={profile!} />
          )}
        </AnimatePresence>
      </div>
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

export const EnrichmentInputView: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="bg-white rounded-xl border border-[#E6E5DF] p-8 text-center shadow-[0_2px_12px_rgba(0,0,0,0.015)] h-64 flex flex-col items-center justify-center">
        <svg className="w-8 h-8 text-gray-300 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <h3 className="text-[13px] font-semibold text-gray-900 mb-1">Raw Transaction Stream Configuration</h3>
        <p className="text-[11px] text-gray-500 max-w-sm">Connect upstream providers like NPCI or Account Aggregators to pipe raw ledger data into the enrichment engine.</p>
        <button className="mt-4 px-4 py-1.5 bg-gray-900 text-white text-[11px] font-semibold rounded-lg hover:bg-gray-800 transition-colors">Configure Inputs</button>
      </div>
    </div>
  );
};

export const EnrichmentOutputView: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  
  // Transaction specific filters
  const [txnSearchQuery, setTxnSearchQuery] = useState('');
  const [txnFilterCategory, setTxnFilterCategory] = useState('All');
  const [txnSortBy, setTxnSortBy] = useState('recent');
  const [expandedTxnId, setExpandedTxnId] = useState<string | null>(null);
  
  const selectedProfile = ENRICHMENT_PROFILES.find(p => p.id === selectedUserId);
  
  const filteredProfiles = ENRICHMENT_PROFILES.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'All' || p.type === filterType;
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    if (sortBy === 'txns') return b.txnCount - a.txnCount;
    if (sortBy === 'confidence') return b.lastEnrichment.accuracy - a.lastEnrichment.accuracy;
    return 0;
  });

  let displayTransactions = selectedProfile?.recentTransactions || [];
  if (selectedProfile) {
    displayTransactions = displayTransactions.filter(txn => {
      const q = txnSearchQuery.toLowerCase();
      const matchesSearch = 
        (txn.merchantName?.toLowerCase() || '').includes(q) ||
        (txn.location?.toLowerCase() || '').includes(q) ||
        txn.enrichedCategory.toLowerCase().includes(q) ||
        txn.subCategory.toLowerCase().includes(q) ||
        (txn.rawDescription || '').toLowerCase().includes(q);
      
      const matchesFilter = txnFilterCategory === 'All' || txn.enrichedCategory === txnFilterCategory;
      return matchesSearch && matchesFilter;
    }).sort((a, b) => {
      if (txnSortBy === 'amount_high') return b.amount - a.amount;
      if (txnSortBy === 'amount_low') return a.amount - b.amount;
      if (txnSortBy === 'confidence') return b.confidence - a.confidence;
      return 0; 
    });
  }

  const isListViewActive = searchQuery !== '' || filterType !== 'All' || sortBy !== 'recent';

  return (
    <div className="flex flex-col gap-6 font-sans h-full">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-[13px] font-semibold text-gray-900">{selectedProfile ? 'Per-Person Enrichment Feed' : 'Enriched Transaction Payload'}</h3>
          <p className="text-[11px] text-gray-500">{selectedProfile ? 'View raw ledger transactions mapped to categorized AI outputs.' : 'Standardized output format mapped to downstream consumers.'}</p>
        </div>
        <div className={`flex items-center gap-3 ${selectedProfile ? 'w-full max-w-[500px]' : 'w-[480px]'}`}>
          {selectedProfile ? (
            <div className="flex items-center gap-2 w-full">
              <div className="relative flex-1">
                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input 
                  type="text" 
                  placeholder="Search merchant, location..." 
                  value={txnSearchQuery}
                  onChange={(e) => setTxnSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-[11px] font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 shadow-sm transition-all"
                />
              </div>
              <select value={txnFilterCategory} onChange={e => setTxnFilterCategory(e.target.value)} className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-7 py-1.5 text-[11px] font-semibold text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 shadow-sm w-[110px]">
                <option value="All">Categories</option>
                <option value="Food">Food</option>
                <option value="Shopping">Shopping</option>
                <option value="Transport">Transport</option>
                <option value="Groceries">Groceries</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Income">Income</option>
                <option value="Transfers">Transfers</option>
              </select>
              <select value={txnSortBy} onChange={e => setTxnSortBy(e.target.value)} className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-7 py-1.5 text-[11px] font-semibold text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 shadow-sm w-[90px]">
                <option value="recent">Recent</option>
                <option value="amount_high">High ₹</option>
                <option value="amount_low">Low ₹</option>
                <option value="confidence">Accuracy</option>
              </select>
              <button 
                onClick={() => { setSelectedUserId(''); setTxnSearchQuery(''); setTxnFilterCategory('All'); setTxnSortBy('recent'); }}
                className="ml-1 flex items-center justify-center p-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors border border-gray-800 shadow-sm"
                title="Back to Portfolio"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full">
              <div className="relative flex-1">
                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input 
                  type="text" 
                  placeholder="Search user by name or ID..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-[11px] font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 shadow-sm transition-all"
                />
              </div>
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 text-[11px] font-semibold text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 shadow-sm">
                <option value="All">All Types</option>
                <option value="Salaried">Salaried</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="MSME">MSME</option>
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 text-[11px] font-semibold text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 shadow-sm">
                <option value="recent">Recent</option>
                <option value="txns">Most Txns</option>
                <option value="confidence">Accuracy</option>
              </select>
            </div>
          )}
        </div>
      </div>
      
      {!selectedProfile ? (
        isListViewActive ? (
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Search Results ({filteredProfiles.length})</span>
            <div className="flex flex-col gap-2">
              {filteredProfiles.length === 0 ? (
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-6 flex items-center justify-center text-[11px] text-gray-500">
                  No users found matching "{searchQuery}"
                </div>
              ) : (
                filteredProfiles.map(p => (
                  <div key={p.id} onClick={() => { setSelectedUserId(p.id); setSearchQuery(''); }} className="bg-white border border-[#E6E5DF] rounded-xl p-4 shadow-sm flex items-center justify-between hover:border-indigo-200 cursor-pointer transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-[11px] group-hover:bg-indigo-100 transition-colors">
                        {p.name.split(' ').map(n => n[0]).join('').substring(0,2)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[12px] font-semibold text-gray-900">{p.name}</span>
                        <span className="text-[10px] text-gray-500">{p.id} • {p.type}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-right">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Transactions</span>
                        <span className="text-[11px] font-semibold text-gray-900">{p.txnCount.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Confidence</span>
                        <span className="text-[11px] font-semibold text-green-600">{(p.lastEnrichment.accuracy * 100).toFixed(1)}%</span>
                      </div>
                      <svg className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Conversational Header */}
            <div className="bg-indigo-900 rounded-xl p-6 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-800 flex items-center justify-center shrink-0 border border-indigo-700">
                <svg className="w-5 h-5 text-indigo-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M12 18a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2z"/><path d="M4.93 4.93a2 2 0 0 1 2.83 0l1.41 1.41a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0L4.93 7.76a2 2 0 0 1 0-2.83z"/><path d="M16.24 16.24a2 2 0 0 1 2.83 0l1.41 1.41a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-1.41-1.41a2 2 0 0 1 0-2.83z"/><path d="M2 12a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/><path d="M18 12a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"/><path d="M4.93 19.07a2 2 0 0 1 0-2.83l1.41-1.41a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-1.41 1.41a2 2 0 0 1-2.83 0z"/><path d="M16.24 7.76a2 2 0 0 1 0-2.83l1.41-1.41a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-1.41 1.41a2 2 0 0 1-2.83 0z"/></svg>
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-[13px] font-bold text-white tracking-wide">Zeyro Engine: Portfolio Dissection Complete</h4>
                <p className="text-[12px] text-indigo-200 leading-relaxed max-w-3xl">
                  I have analyzed the complete transaction ledger for the current portfolio cohort. Out of <strong className="text-white">1.2M raw ledger entries</strong>, I successfully resolved <strong className="text-white">42.8k distinct merchant entities</strong> and extracted <strong className="text-white">142 behavioral vectors</strong> per user. The overall data quality is high, with a verified merchant resolution rate of 68%. However, I've flagged <strong className="text-amber-400">8.2% of transactions</strong> for elevated risk patterns, primarily driven by loan stacking and synthetic income anomalies.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Output Dissection 1 */}
              <div className="bg-white border border-[#E6E5DF] rounded-xl p-5 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold text-gray-900">Entity Resolution Dissection</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Merchant Tiers Output</span>
                  </div>
                </div>
                <p className="text-[11.5px] text-gray-600 leading-relaxed">
                  The engine standardizes messy UPI/NEFT descriptions into clean, categorized entity objects. The output payload includes a <code className="text-pink-600 bg-pink-50 px-1 py-0.5 rounded font-mono">merchantTier</code> field indicating resolution confidence:
                </p>
                <div className="flex flex-col gap-2 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between text-[11px]"><span className="text-gray-700"><strong>Verified</strong> (Direct API Match)</span><span className="font-mono text-green-600 font-bold">68%</span></div>
                  <div className="flex items-center justify-between text-[11px]"><span className="text-gray-700"><strong>Probable</strong> (Fuzzy String Match)</span><span className="font-mono text-blue-600 font-bold">21%</span></div>
                  <div className="flex items-center justify-between text-[11px]"><span className="text-gray-700"><strong>Inferred</strong> (Behavioral Pattern Match)</span><span className="font-mono text-amber-600 font-bold">8%</span></div>
                  <div className="flex items-center justify-between text-[11px]"><span className="text-gray-700"><strong>Unknown</strong> (Unclassified Raw String)</span><span className="font-mono text-gray-500 font-bold">3%</span></div>
                </div>
              </div>

              {/* Output Dissection 2 */}
              <div className="bg-white border border-[#E6E5DF] rounded-xl p-5 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold text-gray-900">Anomaly Array Dissection</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Risk Variables Output</span>
                  </div>
                </div>
                <p className="text-[11.5px] text-gray-600 leading-relaxed">
                  Every transaction passes through 18 heuristic risk models. When anomalous behavior is detected, the <code className="text-pink-600 bg-pink-50 px-1 py-0.5 rounded font-mono">anomalyFlags</code> array in the payload is populated. Portfolio impact:
                </p>
                <div className="flex flex-col gap-2 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between text-[11px]"><span className="text-gray-700"><strong>High Velocity P2P</strong> (Rapid transfers)</span><span className="font-mono text-red-600 font-bold">4.1%</span></div>
                  <div className="flex items-center justify-between text-[11px]"><span className="text-gray-700"><strong>Loan Stacking</strong> (Multiple active BNPLs)</span><span className="font-mono text-amber-600 font-bold">1.8%</span></div>
                  <div className="flex items-center justify-between text-[11px]"><span className="text-gray-700"><strong>Synthetic Income</strong> (Round-tripping)</span><span className="font-mono text-blue-600 font-bold">0.9%</span></div>
                  <div className="flex items-center justify-between text-[11px]"><span className="text-gray-700"><strong>Cash Spike</strong> (Elevated ATM reliance)</span><span className="font-mono text-gray-600 font-bold">1.4%</span></div>
                </div>
              </div>
            </div>

            {/* Output Dissection 3 (Full Width) */}
            <div className="bg-white border border-[#E6E5DF] rounded-xl p-5 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-bold text-gray-900">Behavioral Payload Dissection</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">Calculated Metrics Output</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="flex flex-col gap-2">
                  <span className="text-[11.5px] font-bold text-gray-900">Spend Categories</span>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    The engine maps 400+ MCC codes into 18 standardized macro-categories. We detected a high concentration in <strong>Essential Spend (34%)</strong> and <strong>P2P Transfers (22%)</strong> across this cohort.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[11.5px] font-bold text-gray-900">Recurring Obligations</span>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Subscriptions and EMIs are parsed into the <code className="text-pink-600 bg-pink-50 px-1 py-0.5 rounded font-mono">obligations</code> array. The engine inferred 3.4 active obligations per user, predicting cashflow bottlenecks with 91% accuracy.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[11.5px] font-bold text-gray-900">Temporal Burn Rates</span>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Salary detection algorithms trace the primary credit node, outputting metrics like <code className="text-pink-600 bg-pink-50 px-1 py-0.5 rounded font-mono">paydayBurnRate</code>. The portfolio averages a 42% burn within 72 hours of payroll.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="flex flex-col gap-3">
          {displayTransactions.length === 0 ? (
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-8 flex flex-col items-center justify-center text-center">
              <svg className="w-8 h-8 text-gray-300 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span className="text-[12px] font-semibold text-gray-600 mb-1">No transactions found</span>
              <span className="text-[11px] text-gray-400">Try adjusting your search or filters to see more results.</span>
            </div>
          ) : (
            displayTransactions.map((txn, i) => {
              const isExpanded = expandedTxnId === txn.id;
              return (
              <div key={txn.id} className={`bg-white border ${isExpanded ? 'border-indigo-300 shadow-md' : 'border-[#E6E5DF] shadow-sm'} rounded-xl overflow-hidden flex flex-col hover:border-indigo-300 transition-all`}>
                {/* COMPACT HEADER (Always visible) */}
                <div 
                  className="flex items-center justify-between p-3.5 cursor-pointer group bg-white"
                  onClick={() => setExpandedTxnId(isExpanded ? null : txn.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col w-[110px] shrink-0">
                      <span className="text-[10px] font-mono text-gray-400">{txn.processedAt.split(',')[0]}</span>
                      <span className="text-[12px] font-semibold text-gray-900 truncate pr-2" title={txn.merchantName || 'Unknown Merchant'}>
                        {txn.merchantName || 'Unknown Merchant'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1 bg-gray-50/80 rounded border border-gray-100">
                      <span className="text-[10px] font-bold text-gray-600">{txn.enrichedCategory}</span>
                      <span className="text-[9px] text-gray-400 font-medium px-1.5 bg-white rounded border border-gray-200">{txn.subCategory}</span>
                      {txn.anomalyFlags.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 ml-1" title="Flagged Anomaly" />}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <span className={`text-[12px] font-mono font-bold ${txn.direction === 'Credit' ? 'text-green-600' : 'text-gray-900'}`}>
                      {txn.direction === 'Credit' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                    </span>
                    <div className="flex items-center gap-1.5 w-[70px] justify-end">
                      <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">{(txn.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className={`p-1 rounded-md transition-colors ${isExpanded ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 group-hover:bg-gray-50 group-hover:text-gray-600'}`}>
                      <svg className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>

                {/* EXPANDED CONTENT (AI Payload) */}
                {isExpanded && (
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 border-t border-gray-100 bg-gray-50/30">
                    {/* RAW DATA (Left side) */}
                    <div className="p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg> Raw Webhook Data</span>
                          <span className="text-[10px] text-gray-400 font-mono">{txn.processedAt}</span>
                        </div>
                        <div className="flex flex-col gap-2 font-mono">
                          <div className="bg-white border border-gray-200 p-2.5 rounded shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                            <span className="text-[9px] font-bold text-gray-400 block mb-1">▶ RAW DESCRIPTION</span>
                            <span className="text-[10.5px] text-gray-700 break-all">{txn.rawDescription}</span>
                          </div>
                          {txn.location && (
                            <div className="bg-white border border-gray-200 p-2.5 rounded shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                              <span className="text-[9px] font-bold text-gray-400 block mb-1">▶ LOCATION (EXTRACTED)</span>
                              <span className="text-[10.5px] text-gray-700 break-words">{txn.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200/60">
                        <span className="text-[10px] font-semibold text-gray-500">Reported Amount:</span>
                        <span className={`text-[11px] font-mono font-bold ${txn.direction === 'Credit' ? 'text-green-600' : 'text-gray-900'}`}>
                          {txn.direction === 'Credit' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    {/* ENRICHED DATA (Right side) */}
                    <div className="p-4 bg-white flex flex-col justify-between relative overflow-hidden">
                      {txn.anomalyFlags.length > 0 && (
                        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                          <div className="absolute top-3 -right-6 bg-amber-500 text-white text-[8px] font-bold uppercase tracking-widest py-0.5 px-6 rotate-45 shadow-sm">Flagged</div>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-1.5">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            AI Enriched Output
                          </span>
                          <div className="flex gap-1.5 items-center">
                            <span className="text-[9px] font-mono text-gray-400">{txn.entityResolutionMs}ms</span>
                            <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 rounded-sm border border-green-100">{(txn.confidence * 100).toFixed(0)}% conf</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 mt-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-semibold text-gray-900">{txn.enrichedCategory}</span>
                            <span className="text-[10px] text-gray-400 font-medium px-2 bg-gray-100 rounded-full">{txn.subCategory}</span>
                          </div>
                          
                          {txn.merchantName && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                              <span className="text-[11px] font-semibold text-gray-700">{txn.merchantName}</span>
                              {txn.merchantTier && (
                                <span className="text-[8px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1 rounded uppercase">{txn.merchantTier}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* BEHAVIOUR ENRICHED SECTION */}
                      {txn.behavioralSignals && (
                        <div className="mt-4 border border-[#F4E1C1] rounded-xl overflow-hidden shadow-sm">
                          <div className="bg-[#FFF9F0] border-b border-[#F4E1C1] p-2.5 flex items-center justify-between">
                            <span className="text-[11px] font-bold text-gray-900">Behaviour Enriched</span>
                            <svg className="w-3.5 h-3.5 text-[#D49842]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                          </div>
                          <div className="bg-[#FFFCF8] p-3 flex flex-col gap-2.5">
                            <div className="flex items-start justify-between text-[10px]">
                              <span className="text-gray-500 w-[35%]">Behavior Type</span>
                              <span className="font-semibold text-gray-900 w-[65%] text-right">{txn.behavioralSignals.behaviorType}</span>
                            </div>
                            <div className="flex items-start justify-between text-[10px]">
                              <span className="text-gray-500 w-[35%]">Pattern</span>
                              <span className="font-medium text-gray-900 w-[65%] text-right">{txn.behavioralSignals.pattern}</span>
                            </div>
                            <div className="flex items-start justify-between text-[10px]">
                              <span className="text-gray-500 w-[35%]">Financial Window</span>
                              <span className="font-medium text-gray-900 w-[65%] text-right">{txn.behavioralSignals.financialWindow}</span>
                            </div>
                            <div className="flex items-start justify-between text-[10px]">
                              <span className="text-gray-500 w-[35%]">State Signal</span>
                              <span className="font-medium text-gray-900 w-[65%] text-right">{txn.behavioralSignals.stateSignal}</span>
                            </div>
                            <div className="flex items-start justify-between text-[10px] mt-1 pt-2 border-t border-[#F4E1C1]/50">
                              <span className="text-gray-500 w-[40%]">Decision Trigger</span>
                              <span className="font-bold text-[#E06E2B] w-[60%] text-right">{txn.behavioralSignals.decisionTrigger}</span>
                            </div>
                            <div className="mt-1 bg-[#FFF4EB] border border-[#FAD3B6] p-2 rounded text-[9.5px] font-medium text-[#D15F1C] text-center leading-tight">
                              {txn.behavioralSignals.actionText}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {txn.anomalyFlags.length > 0 && (
                        <div className="mt-3 bg-amber-50/50 border border-amber-100 rounded-lg p-2.5">
                          <span className="text-[9px] font-bold text-amber-700 uppercase tracking-widest block mb-1">Anomaly Reasoning</span>
                          <span className="text-[10.5px] text-amber-800 font-medium">Model detected a 99% match for anomalous behavior based on counterparty and timeframe.</span>
                        </div>
                      )}
                      {txn.anomalyFlags.length === 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-[10px] text-gray-400 font-medium">Mapped to Zeyro Taxonomy v3</span>
                          <span className="text-[10px] text-gray-400 font-mono">OK</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
          )}
        </div>
      )}
    </div>
  );
};

export const EnrichmentReportsView: React.FC<{ onAskZeyro?: (text: string) => void }> = ({ onAskZeyro }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [sortBy, setSortBy] = useState('recent');

  const selectedProfile = ENRICHMENT_PROFILES.find(p => p.id === selectedUserId);

  const filteredProfiles = ENRICHMENT_PROFILES.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'All' || p.type === filterType;
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    if (sortBy === 'txns') return b.txnCount - a.txnCount;
    if (sortBy === 'confidence') return b.lastEnrichment.accuracy - a.lastEnrichment.accuracy;
    return 0;
  });

  return (
    <div className="flex flex-col gap-6 font-sans h-full">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex flex-col gap-1">
            <h3 className="text-[13px] font-semibold text-gray-900">{selectedProfile ? 'Financial Patterns & Behavioral Report' : 'Enrichment Accuracy Reports'}</h3>
            <p className="text-[11px] text-gray-500">{selectedProfile ? 'Deep-dive into inferred behaviors, risk flags, and merchant dependency metrics.' : 'Download full historical exports of transaction categorization accuracy, unclassified logs, and model performance.'}</p>
          </div>
          <div className="flex gap-2">
            {selectedProfile && onAskZeyro && (
              <button 
                onClick={() => onAskZeyro(`Analyze the behavioral profile for ${selectedProfile.name} in detail.`)}
                className="px-4 py-1.5 bg-indigo-50 text-indigo-700 text-[11px] font-semibold rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1.5 border border-indigo-100"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Ask Zeyro
              </button>
            )}
            <button className="px-4 py-1.5 bg-gray-900 text-white text-[11px] font-semibold rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1.5">
              {selectedProfile ? (
                <>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export Full Dossier
                </>
              ) : (
                'Generate New Report'
              )}
            </button>
          </div>
        </div>

        {/* Search & Back Action */}
        <div className="flex gap-4">
          {!selectedProfile ? (
            <div className="flex items-center gap-3 w-full">
              <div className="relative flex-1">
                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input 
                  type="text" 
                  placeholder="Search portfolio by User Name or ID..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-[11px] font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 shadow-sm transition-all"
                />
              </div>
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-[11px] font-semibold text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 shadow-sm min-w-[140px]">
                <option value="All">All Profile Types</option>
                <option value="Salaried">Salaried</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="MSME">MSME</option>
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-[11px] font-semibold text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 shadow-sm min-w-[140px]">
                <option value="recent">Sort: Most Recent</option>
                <option value="txns">Sort: Transaction Volume</option>
                <option value="confidence">Sort: Model Accuracy</option>
              </select>
            </div>
          ) : (
            <button 
              onClick={() => { setSelectedUserId(''); setSearchQuery(''); setFilterType('All'); setSortBy('recent'); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 text-[11px] font-semibold rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Back to Portfolio Feed
            </button>
          )}
        </div>
      </div>

      {!selectedProfile ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2">
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Recently Enriched Profiles</h4>
            <span className="text-[10px] text-gray-400 font-medium">Auto-refreshes on new data</span>
          </div>
          
          <div className="flex flex-col gap-2">
            {filteredProfiles.map((p) => (
              <div key={p.id} className="bg-white border border-[#E6E5DF] rounded-xl p-3 shadow-sm flex items-center justify-between hover:border-indigo-200 transition-colors group cursor-pointer" onClick={() => setSelectedUserId(p.id)}>
                <div className="flex items-center gap-4 w-[250px]">
                  <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-[11px] group-hover:bg-indigo-100 transition-colors">
                    {p.name.split(' ').map(n => n[0]).join('').substring(0,2)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold text-gray-900 leading-tight">{p.name}</span>
                    <span className="text-[10px] text-gray-500">{p.id} • {p.type}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between flex-1 px-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Transactions</span>
                    <span className="text-[11px] font-semibold text-gray-900">{p.txnCount.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Accuracy</span>
                    <span className="text-[11px] font-semibold text-green-600">{(p.lastEnrichment.accuracy * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Last Synced</span>
                    <span className="text-[11px] font-mono text-gray-600">{p.lastEnrichment.ranAt.split('·')[0].trim()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pl-4 border-l border-gray-100">
                  <button className="px-4 py-1.5 bg-gray-50 text-gray-700 text-[11px] font-semibold rounded-lg hover:bg-gray-100 transition-colors border border-gray-200" onClick={(e) => { e.stopPropagation(); setSelectedUserId(p.id); }}>
                    View Profile
                  </button>
                  <button className="px-2 py-1.5 bg-indigo-50 text-indigo-700 text-[11px] font-semibold rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100" onClick={(e) => { e.stopPropagation(); }}>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Profile Header */}
          <div className="bg-gray-50/50 rounded-xl border border-gray-100 p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                {selectedProfile.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-gray-900">{selectedProfile.name}</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase bg-gray-200/50 px-1.5 py-0.5 rounded">{selectedProfile.type}</span>
                </div>
                <span className="text-[11px] text-gray-500">{selectedProfile.txnCount.toLocaleString()} enriched transactions • {selectedProfile.bank}</span>
              </div>
            </div>
            <div className="text-right flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Model Confidence</span>
              <span className="text-[13px] font-bold text-green-600">{(selectedProfile.lastEnrichment.accuracy * 100).toFixed(1)}%</span>
            </div>
          </div>
  
          {/* Category Distribution */}
          <div className="bg-white border border-[#E6E5DF] rounded-xl p-5 shadow-sm">
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Spend & Income Distribution</h4>
            <div className="flex h-3 w-full rounded-full overflow-hidden mb-5 gap-0.5">
              {selectedProfile.categoryDistribution.map((cat, i) => (
                <div 
                  key={i} 
                  className={`h-full opacity-90 transition-opacity ${
                    i === 0 ? 'bg-green-500' : i === 1 ? 'bg-indigo-500' : i === 2 ? 'bg-blue-400' : i === 3 ? 'bg-amber-400' : 'bg-gray-300'
                  }`} 
                  style={{ width: `${cat.percent}%` }}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-2">
              {selectedProfile.categoryDistribution.map((cat, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-sm mt-1 shrink-0 ${
                    i === 0 ? 'bg-green-500' : i === 1 ? 'bg-indigo-500' : i === 2 ? 'bg-blue-400' : i === 3 ? 'bg-amber-400' : 'bg-gray-300'
                  }`} />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-900 leading-tight">{cat.label}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10.5px] font-mono text-gray-500">{cat.percent}%</span>
                      {cat.flagCount && <span className="text-[9px] text-amber-600 font-semibold bg-amber-50 px-1 rounded">{cat.flagCount} flags</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
  
          {/* Extracted Subscriptions & Obligations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-[#E6E5DF] rounded-xl p-5 shadow-sm">
              <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Recurring Subscriptions</h4>
              <div className="flex flex-col gap-3">
                {selectedProfile.subscriptions.length === 0 ? (
                  <span className="text-[11px] text-gray-400 font-medium">No active subscriptions detected.</span>
                ) : (
                  selectedProfile.subscriptions.map((sub, i) => (
                    <div key={i} className="flex items-center justify-between pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-semibold text-gray-900">{sub.name}</span>
                        <span className="text-[10px] text-gray-500">{sub.frequency} • Last Paid: {sub.lastPaid}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[11px] font-semibold text-gray-900">₹{sub.amount.toLocaleString()}</span>
                        <span className={`text-[9px] font-bold uppercase ${sub.status === 'Active' ? 'text-green-600' : 'text-gray-400'}`}>{sub.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="bg-white border border-[#E6E5DF] rounded-xl p-5 shadow-sm">
              <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Financial Obligations (EMIs/BNPL)</h4>
              <div className="flex flex-col gap-3">
                {selectedProfile.obligations.length === 0 ? (
                  <span className="text-[11px] text-gray-400 font-medium">No active obligations detected.</span>
                ) : (
                  selectedProfile.obligations.map((obl, i) => (
                    <div key={i} className="flex items-center justify-between pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-semibold text-gray-900">{obl.name}</span>
                        <span className="text-[10px] text-gray-500">{obl.type} • Due: {obl.dueDate}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[11px] font-semibold text-gray-900">₹{obl.amount.toLocaleString()}</span>
                        <span className={`text-[9px] font-bold uppercase ${obl.riskLevel === 'Low' ? 'text-green-600' : obl.riskLevel === 'Medium' ? 'text-amber-600' : 'text-red-600'}`}>Risk: {obl.riskLevel}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Merchant Dependency */}
          {selectedProfile.merchantDependency && selectedProfile.merchantDependency.length > 0 && (
            <div className="bg-white border border-[#E6E5DF] rounded-xl p-5 shadow-sm">
              <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Merchant Dependency & Frequency</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedProfile.merchantDependency.map((dep, i) => (
                  <div key={i} className="flex flex-col gap-3 p-4 bg-gray-50/50 rounded-lg border border-gray-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] hover:border-indigo-200 transition-colors cursor-default">
                    <div className="flex items-start justify-between">
                      <span className="text-[12px] font-bold text-gray-900 truncate pr-2">{dep.merchantName}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${dep.dependencyScore >= 80 ? 'bg-amber-100 text-amber-700' : dep.dependencyScore >= 60 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-700'}`}>
                        Score: {dep.dependencyScore}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-600 font-medium">
                      <span>{dep.txnCount} Txns</span>
                      <span>{dep.spendRatio}% Share</span>
                      <span>{dep.frequency}</span>
                    </div>
                    {/* Visual bar for dependency */}
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full transition-all ${dep.dependencyScore >= 80 ? 'bg-amber-500' : dep.dependencyScore >= 60 ? 'bg-indigo-500' : 'bg-gray-400'}`} style={{ width: `${dep.dependencyScore}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
  
          {/* Behavioral Intelligence Profile */}
          <div className="bg-white border border-[#E6E5DF] rounded-xl p-6 shadow-sm flex flex-col gap-5 mt-2">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100">
                <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg>
              </div>
              <div className="flex flex-col">
                <h4 className="text-[14px] font-bold text-gray-900">Behavioral Intelligence Profile</h4>
                <p className="text-[11px] text-gray-500 font-medium">Synthesized from {selectedProfile.txnCount.toLocaleString()} enriched transactions.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Persona Summary */}
              <div className="col-span-1 lg:col-span-1 bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl p-5 text-white flex flex-col justify-between relative overflow-hidden shadow-inner">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500 rounded-full opacity-30 blur-2xl"></div>
                <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-indigo-500 rounded-full opacity-20 blur-2xl"></div>
                <div className="relative z-10 flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">Primary Persona</span>
                    <span className="text-[16px] font-bold text-white leading-tight">
                      {selectedProfile.behavioralMetrics[0]?.value || 'Standard Profile'}
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-100 leading-relaxed font-medium">
                    {selectedProfile.behavioralMetrics[0]?.insight || 'Stable transaction velocity with predictable recurring spending patterns.'}
                  </p>
                </div>
                
                <div className="relative z-10 mt-6 pt-4 border-t border-purple-700/50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">Spend Volatility</span>
                    <span className="text-[13px] font-bold text-white">{selectedProfile.behavioralMetrics[1]?.value || 'Low'}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">Risk Index</span>
                    <span className={`text-[13px] font-bold ${selectedProfile.obligations.length > 2 ? 'text-amber-400' : 'text-green-400'}`}>
                      {selectedProfile.obligations.length > 2 ? 'Elevated' : 'Stable'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Detailed Vectors */}
              <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedProfile.behavioralMetrics.slice(1).map((metric, i) => (
                  <div key={i} className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 flex flex-col gap-3 hover:bg-white hover:border-purple-200 hover:shadow-sm transition-all group">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{metric.label}</span>
                        <span className="text-[13px] font-bold text-gray-900 group-hover:text-purple-900 transition-colors">{metric.value}</span>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        metric.status === 'Normal' || metric.status === 'Clean' ? 'bg-green-50 text-green-700 border border-green-100' :
                        metric.status === 'Monitor' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        metric.status === 'Low' ? 'bg-gray-100 text-gray-600 border border-gray-200' :
                        'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {metric.status}
                      </span>
                    </div>
                    <div className="text-[10.5px] text-gray-600 font-medium leading-relaxed mt-auto group-hover:text-gray-800 transition-colors">
                      {metric.insight}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Subscriptions & Obligations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Subscriptions */}
            <div className="bg-white border border-[#E6E5DF] rounded-xl p-5 shadow-sm">
              <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Active Subscriptions</h4>
              <div className="flex flex-col gap-3">
                {selectedProfile.subscriptions?.map((sub, i) => (
                  <div key={i} className="flex items-center justify-between pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="flex flex-col">
                      <span className="text-[12px] font-semibold text-gray-900">{sub.name}</span>
                      <span className="text-[10px] text-gray-400">Last paid: {sub.lastPaid}</span>
                    </div>
                    <div className="text-right flex flex-col">
                      <span className="text-[12px] font-bold text-gray-900">₹{sub.amount.toLocaleString()}</span>
                      <span className="text-[9px] text-gray-400 uppercase tracking-wide">{sub.frequency}</span>
                    </div>
                  </div>
                ))}
                {!selectedProfile.subscriptions?.length && <span className="text-[11px] text-gray-400 italic">No subscriptions detected.</span>}
              </div>
            </div>

            {/* Obligations */}
            <div className="bg-white border border-[#E6E5DF] rounded-xl p-5 shadow-sm">
              <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Known Obligations</h4>
              <div className="flex flex-col gap-3">
                {selectedProfile.obligations?.map((obl, i) => (
                  <div key={i} className="flex items-center justify-between pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] font-semibold text-gray-900">{obl.name}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${obl.riskLevel === 'High' ? 'bg-red-50 text-red-600' : obl.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>{obl.riskLevel} Risk</span>
                      </div>
                      <span className="text-[10px] text-gray-400 mt-0.5">{obl.type} • Due: {obl.dueDate}</span>
                    </div>
                    <div className="text-right flex flex-col">
                      <span className="text-[12px] font-bold text-gray-900">₹{obl.amount.toLocaleString()}</span>
                      <span className="text-[9px] text-gray-400 uppercase tracking-wide">EMI / Due</span>
                    </div>
                  </div>
                ))}
                {!selectedProfile.obligations?.length && <span className="text-[11px] text-gray-400 italic">No obligations detected.</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

type ReportContextItem = {
  id: string;
  type: 'demographic' | 'spatial' | 'behavioral';
  title: string;
  summary: string;
  chartType: 'bar' | 'pie' | 'trend';
  stats?: { label: string; value: number; color: string }[];
};

const REPORT_SECTIONS: Record<'general' | 'msme', ReportContextItem[]> = {
  general: [
    {
      id: 'dem-gen-1',
      type: 'demographic',
      title: 'Gen-Z (18-24) vs BNPL Stacking',
      summary: 'Gen-Z cohort in Tier 1 cities exhibits 40% higher BNPL stacking (3+ active loans) compared to Millennials.',
      chartType: 'bar',
      stats: [{ label: 'Gen Z', value: 75, color: 'bg-indigo-500' }, { label: 'Millennials', value: 35, color: 'bg-blue-400' }, { label: 'Gen X', value: 15, color: 'bg-gray-300' }]
    },
    {
      id: 'spa-gen-1',
      type: 'spatial',
      title: 'Tier 2 Cities: Q-Commerce Dependency',
      summary: 'Users in Tier 2 cities (e.g. Surat, Jaipur) rely heavily on single Q-Commerce apps, with 68% showing >80 dependency scores on Zepto or Swiggy.',
      chartType: 'bar',
      stats: [{ label: 'Swiggy', value: 68, color: 'bg-orange-500' }, { label: 'Zepto', value: 45, color: 'bg-purple-500' }, { label: 'Blinkit', value: 20, color: 'bg-yellow-400' }]
    },
    {
      id: 'beh-gen-1',
      type: 'behavioral',
      title: 'Late Night Spenders & Subscription Churn',
      summary: 'Users with "Late-Night Spender" personas (txns 11PM-3AM) have a 3x higher subscription churn rate.',
      chartType: 'trend'
    }
  ],
  msme: [
    {
      id: 'dem-msme-1',
      type: 'demographic',
      title: 'Business Age vs Working Capital Stress',
      summary: 'Young MSMEs (<3 years) show 55% higher frequency of overlapping short-term credit lines compared to established businesses.',
      chartType: 'bar',
      stats: [{ label: '<3 Yrs', value: 85, color: 'bg-amber-500' }, { label: '3-7 Yrs', value: 40, color: 'bg-blue-400' }, { label: '7+ Yrs', value: 15, color: 'bg-green-500' }]
    },
    {
      id: 'spa-msme-1',
      type: 'spatial',
      title: 'Vendor Concentration in Manufacturing Hubs',
      summary: 'MSMEs in Surat and Tirupur show critical single-vendor dependencies (>60% of outflows to one supplier).',
      chartType: 'pie',
    },
    {
      id: 'beh-msme-1',
      type: 'behavioral',
      title: 'Invoice Discounting Affinity',
      summary: 'Businesses with consistent B2B receipts on Day 1-5 of the month are 4x more likely to convert on invoice discounting nudges.',
      chartType: 'trend'
    }
  ]
};

export const EnrichmentInsightsView: React.FC<{ onAskZeyro?: (text: string) => void }> = ({ onAskZeyro }) => {
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [insightType, setInsightType] = useState<'general' | 'msme'>('general');
  const [timeline, setTimeline] = useState('This Month');
  const { handleContextMenu, renderContextMenu } = useChartContextMenu(onAskZeyro);

  const dynamicData = React.useMemo(() => {
    switch (timeline) {
      case 'Today': return { timeText: "today's intraday", records: "4.2K", accuracy: "97.4%", anomalies: "12", entities: "1,204", msmeAccuracy: "96.1%", riskFlags: "8" };
      case 'This Week': return { timeText: "this week's", records: "45.1K", accuracy: "97.8%", anomalies: "145", entities: "12,450", msmeAccuracy: "96.5%", riskFlags: "92" };
      case 'This Year': return { timeText: "the 12-month", records: "2.4M", accuracy: "98.4%", anomalies: "8,210", entities: "84,210", msmeAccuracy: "97.1%", riskFlags: "4,120" };
      default: return { timeText: timeline === 'This Month' ? "this month's" : `the ${timeline}`, records: "185K", accuracy: "98.1%", anomalies: "410", entities: "24,100", msmeAccuracy: "96.8%", riskFlags: "240" };
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
                <motion.div layoutId="activeInsightTypeEnrichment" className="absolute inset-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-md border border-gray-200/50" initial={false} transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }} />
              )}
              <span className="relative z-10">General Retail</span>
            </button>
            <button 
              onClick={() => setInsightType('msme')}
              className={`relative px-4 py-1.5 text-[11px] font-semibold rounded-md transition-all duration-200 outline-none whitespace-nowrap ${insightType === 'msme' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {insightType === 'msme' && (
                <motion.div layoutId="activeInsightTypeEnrichment" className="absolute inset-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-md border border-gray-200/50" initial={false} transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }} />
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
              Zeyro Enrichment Intelligence
              <span className="text-[9px] font-mono font-normal text-green-500 uppercase tracking-widest bg-green-50 px-1.5 py-0.5 rounded border border-green-100 flex items-center gap-1">
                <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
                Analysis Complete
              </span>
            </span>
            I have analyzed {dynamicData.timeText} dataset across the {insightType === 'general' ? 'retail' : 'MSME'} portfolio. I found distinct behavioral patterns that reveal hidden liabilities and deep merchant dependencies. Here is my detailed report:
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
                  Retail Dataset Snapshot
                </h3>

                <div className="grid grid-cols-3 gap-6 font-sans border-b border-gray-100 pb-8">
                  <div className="flex flex-col justify-between">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Total Processed</span>
                    <div className="flex items-end gap-2 mt-2">
                      <span className="text-3xl font-bold text-gray-900 tracking-tighter">{dynamicData.records}</span>
                    </div>
                    <div className="w-full h-1 bg-[#E6E5DF] mt-4 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }} className="h-full bg-gray-900"></motion.div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Anomaly Distribution</span>
                    <div className="mt-3 flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[10px] font-semibold text-gray-700"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Round Tripping</span><span>62%</span></div>
                      <div className="flex justify-between items-center text-[10px] font-semibold text-gray-700"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400"></span> High Velocity</span><span>28%</span></div>
                      <div className="flex justify-between items-center text-[10px] font-semibold text-gray-700"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400"></span> Misc Risk</span><span>10%</span></div>
                    </div>
                    <div className="flex w-full h-1.5 mt-3 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '62%' }} transition={{ duration: 0.8, delay: 0.5 }} className="bg-amber-400"></motion.div>
                      <motion.div initial={{ width: 0 }} animate={{ width: '28%' }} transition={{ duration: 0.8, delay: 0.7 }} className="bg-rose-400"></motion.div>
                      <motion.div initial={{ width: 0 }} animate={{ width: '10%' }} transition={{ duration: 0.8, delay: 0.9 }} className="bg-blue-400"></motion.div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Model Accuracy</span>
                    <div className="flex items-end gap-2 mt-1">
                      <span className="text-3xl font-bold text-gray-900 tracking-tighter">{dynamicData.accuracy}</span>
                      <span className="text-[10px] text-green-600 font-bold mb-1.5 bg-green-100 px-1.5 py-0.5 rounded">High Confidence</span>
                    </div>
                    <div className="mt-2 text-[10px] text-gray-500 font-medium leading-relaxed">
                      Entity resolution success rate has climbed up to 98% this cycle with the latest merchant DB update.
                    </div>
                  </div>
                </div>
              </motion.section>

              <motion.section variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } } }} className="flex flex-col gap-4 group">
                <h3 className="font-sans font-bold text-gray-900 text-sm tracking-tight m-0 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>
                  1. Gen-Z (18-24) vs BNPL Stacking
                </h3>

                <div className="grid grid-cols-2 gap-8 items-center border-b border-gray-100 pb-8">
                  <div className="bg-[#FAF9F5] rounded-xl p-4 border border-[#E6E5DF] flex flex-col items-center justify-center h-40 relative group-hover:bg-[#F5F4F0] transition-colors">
                    <span className="absolute top-3 left-4 text-[9px] font-sans font-semibold text-gray-500 uppercase tracking-widest">Stacking Propensity</span>
                    <svg viewBox="0 0 200 80" className="w-full h-full pt-4 overflow-visible" onContextMenu={handleContextMenu}>
                      <line x1="0" y1="60" x2="200" y2="60" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                      <motion.rect initial={{ height: 0, y: 60 }} animate={{ height: 45, y: 15 }} transition={{ duration: 0.8, delay: 0.5 }} x="40" y="15" width="30" height="45" fill="#6366f1" rx="2" />
                      <text x="55" y="75" fontSize="8" fill="#64748b" textAnchor="middle" className="font-sans font-medium">Gen Z</text>
                      
                      <motion.rect initial={{ height: 0, y: 60 }} animate={{ height: 25, y: 35 }} transition={{ duration: 0.8, delay: 0.7 }} x="85" y="35" width="30" height="25" fill="#60a5fa" rx="2" />
                      <text x="100" y="75" fontSize="8" fill="#64748b" textAnchor="middle" className="font-sans font-medium">Millennials</text>

                      <motion.rect initial={{ height: 0, y: 60 }} animate={{ height: 10, y: 50 }} transition={{ duration: 0.8, delay: 0.9 }} x="130" y="50" width="30" height="10" fill="#cbd5e1" rx="2" />
                      <text x="145" y="75" fontSize="8" fill="#64748b" textAnchor="middle" className="font-sans font-medium">Gen X</text>
                      
                      <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 1.5 }} d="M 55,10 L 100,30 L 145,45" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="2 2" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p>
                      Our enrichment models parsing UPI recurring mandates have flagged a major trend: The 
                      <span className="font-semibold text-gray-900 bg-gray-50 px-1 rounded transition-colors group-hover:bg-indigo-50"> Gen-Z cohort (18-24) </span> 
                      in Tier 1 cities exhibits 40% higher BNPL stacking (3+ active short-term loans simultaneously) compared to Millennials.
                    </p>
                    <p>
                      This stacking behavior is rarely captured by traditional credit bureaus in real-time, leaving lenders blind to their actual monthly obligations. We advise capping unsecured exposure for this age group unless a verified salary stream is detected.
                    </p>
                  </div>
                </div>
              </motion.section>

              <motion.section variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } } }} className="flex flex-col gap-4 group">
                <h3 className="font-sans font-bold text-gray-900 text-sm tracking-tight m-0 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.6)]"></span>
                  2. Tier 2 Cities: Q-Commerce Dependency
                </h3>

                <div className="grid grid-cols-2 gap-8 items-center border-b border-gray-100 pb-8">
                  <div className="bg-[#FAF9F5] rounded-xl p-4 border border-[#E6E5DF] flex flex-col items-center justify-center h-40 relative group-hover:bg-[#F5F4F0] transition-colors">
                    <span className="absolute top-3 left-4 text-[9px] font-sans font-semibold text-gray-500 uppercase tracking-widest">Q-Commerce Monopoly</span>
                    <svg viewBox="0 0 100 100" className="w-24 h-24 mt-4" onContextMenu={handleContextMenu}>
                      <motion.circle initial={{ strokeDasharray: "0 100" }} animate={{ strokeDasharray: "68 32" }} transition={{ duration: 1, delay: 0.5 }} cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="20" strokeDashoffset="25" />
                      <motion.circle initial={{ strokeDasharray: "0 100" }} animate={{ strokeDasharray: "32 68" }} transition={{ duration: 1, delay: 0.5 }} cx="50" cy="50" r="40" fill="none" stroke="#a855f7" strokeWidth="20" strokeDashoffset="-43" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p>
                      Spatial enrichment data highlights that users in Tier 2 cities (e.g., Surat, Jaipur) rely heavily on single Q-Commerce applications for daily needs. Specifically, 
                      <span className="font-semibold text-gray-900 bg-gray-50 px-1 rounded transition-colors group-hover:bg-amber-50"> 68% show &gt;80 dependency scores </span> 
                      on either Zepto or Swiggy Instamart, with very little overlap.
                    </p>
                    <p>
                      This deep loyalty provides a prime opportunity for highly targeted, co-branded card offerings or exclusive cash-back rewards rather than generic retail discounts.
                    </p>
                  </div>
                </div>
              </motion.section>

              <motion.section variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } } }} className="flex flex-col gap-4 group">
                <h3 className="font-sans font-bold text-gray-900 text-sm tracking-tight m-0 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
                  3. Late Night Spenders & Subscription Churn
                </h3>

                <div className="flex flex-col gap-2">
                  <p>
                    Correlating transaction timestamps with merchant categories reveals that users with the 
                    <span className="font-semibold text-gray-900 bg-gray-50 px-1 rounded transition-colors group-hover:bg-rose-50"> "Late-Night Spender" </span> 
                    persona (frequent gaming/food txns between 11PM-3AM) have a 3x higher subscription churn rate on core financial products compared to morning transactors.
                  </p>
                  <p>
                    This cohort typically demonstrates highly impulsive spending. We recommend switching their EMI deduction cycles to the 1st of the month strictly, leaving no room for discretionary depletion.
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
                    </div>
                    <div className="w-full h-1 bg-[#E6E5DF] mt-4 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }} className="h-full bg-gray-900"></motion.div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Risk Flags</span>
                    <div className="mt-3 flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[10px] font-semibold text-gray-700"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Over-Leveraged</span><span>40%</span></div>
                      <div className="flex justify-between items-center text-[10px] font-semibold text-gray-700"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-500"></span> GST Mismatch</span><span>35%</span></div>
                      <div className="flex justify-between items-center text-[10px] font-semibold text-gray-700"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-pink-500"></span> Churn Risk</span><span>25%</span></div>
                    </div>
                    <div className="flex w-full h-1.5 mt-3 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '40%' }} transition={{ duration: 0.8, delay: 0.5 }} className="bg-indigo-500"></motion.div>
                      <motion.div initial={{ width: 0 }} animate={{ width: '35%' }} transition={{ duration: 0.8, delay: 0.7 }} className="bg-cyan-500"></motion.div>
                      <motion.div initial={{ width: 0 }} animate={{ width: '25%' }} transition={{ duration: 0.8, delay: 0.9 }} className="bg-pink-500"></motion.div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Model Accuracy</span>
                    <div className="flex items-end gap-2 mt-1">
                      <span className="text-3xl font-bold text-gray-900 tracking-tighter">{dynamicData.msmeAccuracy}</span>
                      <span className="text-[10px] text-green-600 font-bold mb-1.5 bg-green-100 px-1.5 py-0.5 rounded">Optimal</span>
                    </div>
                    <div className="mt-2 text-[10px] text-gray-500 font-medium leading-relaxed">
                      B2B transaction resolution is performing optimally thanks to the latest Tally ERP contextual sync.
                    </div>
                  </div>
                </div>
              </motion.section>

              <motion.section variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } } }} className="flex flex-col gap-4 group">
                <h3 className="font-sans font-bold text-gray-900 text-sm tracking-tight m-0 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
                  1. Business Age vs Working Capital Stress
                </h3>

                <div className="grid grid-cols-2 gap-8 items-center border-b border-gray-100 pb-8">
                  <div className="bg-[#FAF9F5] rounded-xl p-4 border border-[#E6E5DF] flex flex-col items-center justify-center h-40 relative group-hover:bg-[#F5F4F0] transition-colors">
                    <span className="absolute top-3 left-4 text-[9px] font-sans font-semibold text-gray-500 uppercase tracking-widest">Credit Line Overlap</span>
                    <svg viewBox="0 0 200 80" className="w-full h-full pt-4 overflow-visible" onContextMenu={handleContextMenu}>
                      <line x1="0" y1="60" x2="200" y2="60" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                      
                      <motion.rect initial={{ height: 0, y: 60 }} animate={{ height: 50, y: 10 }} transition={{ duration: 0.8, delay: 0.5 }} x="40" y="10" width="30" height="50" fill="#f59e0b" rx="2" />
                      <text x="55" y="75" fontSize="8" fill="#64748b" textAnchor="middle">{"<3 Yrs"}</text>
                      
                      <motion.rect initial={{ height: 0, y: 60 }} animate={{ height: 25, y: 35 }} transition={{ duration: 0.8, delay: 0.7 }} x="85" y="35" width="30" height="25" fill="#60a5fa" rx="2" />
                      <text x="100" y="75" fontSize="8" fill="#64748b" textAnchor="middle">{"3-7 Yrs"}</text>

                      <motion.rect initial={{ height: 0, y: 60 }} animate={{ height: 10, y: 50 }} transition={{ duration: 0.8, delay: 0.9 }} x="130" y="50" width="30" height="10" fill="#22c55e" rx="2" />
                      <text x="145" y="75" fontSize="8" fill="#64748b" textAnchor="middle">{"7+ Yrs"}</text>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p>
                      Young MSMEs (under 3 years of operation) demonstrate a 
                      <span className="font-semibold text-gray-900 bg-gray-50 px-1 rounded transition-colors group-hover:bg-amber-50"> 55% higher frequency </span> 
                      of tapping into overlapping short-term credit lines compared to established businesses.
                    </p>
                    <p>
                      This signals chronic working capital stress. We recommend introducing strict caps on concurrent OD facilities for businesses aged under 3 years to curb systemic default risks.
                    </p>
                  </div>
                </div>
              </motion.section>

              <motion.section variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } } }} className="flex flex-col gap-4 group">
                <h3 className="font-sans font-bold text-gray-900 text-sm tracking-tight m-0 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.6)]"></span>
                  2. Invoice Discounting Affinity
                </h3>

                <div className="border-b border-gray-100 pb-8 flex flex-col gap-2">
                  <p>
                    Behavioral tagging shows that businesses receiving consistent B2B receipts on Day 1-5 of the month are 
                    <span className="font-semibold text-gray-900 bg-gray-50 px-1 rounded transition-colors group-hover:bg-cyan-50"> 4x more likely to convert </span> 
                    on invoice discounting nudges presented in the third week of the month.
                  </p>
                  <p>
                    By timing these offerings accurately using our enrichment signals, the portfolio can boost cross-sell conversion dramatically without increasing marketing spend.
                  </p>
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
            style={{ top: selectionRect.bottom + 10, left: selectionRect.left + (selectionRect.width / 2) - 100 }}
          >
            <div className="bg-gray-900 text-white rounded-lg shadow-xl border border-gray-700 py-1 px-1 flex flex-col min-w-[200px]">
              <div className="px-3 py-1.5 border-b border-gray-800 text-[10px] font-medium text-gray-400">
                Selected: <span className="text-gray-200 truncate max-w-[150px] inline-block align-bottom">{selectedText}</span>
              </div>
              <button 
                onClick={() => {
                  if (onAskZeyro) {
                    onAskZeyro(`Explain the significance of this insight detail: "${selectedText}"`);
                    setSelectionRect(null);
                    window.getSelection()?.removeAllRanges();
                  }
                }}
                className="text-left px-3 py-2 text-xs font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 rounded-md"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Ask Zeyro
              </button>
            </div>
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45 border-l border-t border-gray-700"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
