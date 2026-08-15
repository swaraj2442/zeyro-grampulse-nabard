"use client";

import React, { useState, useMemo } from 'react';
import { 
  Filter, Download, RefreshCw, Sparkles, TrendingUp, TrendingDown,
  Activity, ArrowUpRight, ArrowDownRight, ArrowRight, Wallet, AlertTriangle, 
  Banknote, Target, ChevronRight, Play, Eye, MoreVertical, LayoutTemplate, 
  Calendar, FileText, CheckCircle2, CloudRain, Clock, Users, FileSpreadsheet, Search,
  ChevronDown, HelpCircle, Thermometer, ShieldAlert, BarChart2, Droplets, Check, X, Info
} from 'lucide-react';
import { 
  LineChart, Line, ResponsiveContainer 
} from 'recharts';
import { Screen } from '../GramPulseApp';

interface Props {
  navigateTo: (s: Screen, ent?: string) => void;
}

// --- MOCK DATA ---

const MINI_CHART_DATA_1 = [{val: 20}, {val: 25}, {val: 22}, {val: 30}, {val: 28}, {val: 35}];
const MINI_CHART_DATA_2 = [{val: 40}, {val: 35}, {val: 50}, {val: 45}, {val: 60}, {val: 55}];
const MINI_CHART_DATA_3 = [{val: 50}, {val: 45}, {val: 40}, {val: 30}, {val: 25}, {val: 20}];

const QUEUE_CARDS = [
  {
    id: 'REQ-00912',
    prio: 'High Priority',
    prioColor: 'text-red-700 bg-red-50 border-red-100',
    title: 'Lending Decision',
    ent: 'Shree Ganesh Dairy',
    loc: 'Kolhapur',
    reqBy: 'Rahul More (FO)',
    amount: '₹ 4,50,000',
    submitted: 'May 20, 2024 10:15 AM',
    due: 'May 22, 2024',
    dueCol: 'text-red-600 font-bold',
    rec: 'Approve',
    conf: '92% Confidence'
  },
  {
    id: 'REQ-00913',
    prio: 'Medium Priority',
    prioColor: 'text-orange-700 bg-orange-50 border-orange-100',
    title: 'Intervention Approval',
    ent: 'Sai Agri Producers Co.',
    loc: 'Satara',
    reqBy: 'Sneha Jadhav (FO)',
    amount: '—',
    submitted: 'May 20, 2024 01:20 PM',
    due: 'May 23, 2024',
    dueCol: 'text-gray-500',
    rec: 'Approve',
    conf: '81% Confidence'
  },
  {
    id: 'REQ-00914',
    prio: 'Medium Priority',
    prioColor: 'text-orange-700 bg-orange-50 border-orange-100',
    title: 'Field Visit Approval',
    ent: 'Maa Bhavani Traders',
    loc: 'Pune',
    reqBy: 'Amit Patil (FO)',
    amount: '—',
    submitted: 'May 21, 2024 09:05 AM',
    due: 'May 24, 2024',
    dueCol: 'text-gray-500',
    rec: 'Approve',
    conf: '78% Confidence'
  },
  {
    id: 'REQ-00915',
    prio: 'Low Priority',
    prioColor: 'text-green-700 bg-green-50 border-green-100',
    title: 'Task Approval',
    ent: 'Rural Mart Services',
    loc: 'Sangli',
    reqBy: 'Priya S. (FO)',
    amount: '—',
    submitted: 'May 21, 2024 10:30 AM',
    due: 'May 24, 2024',
    dueCol: 'text-gray-500',
    rec: 'Approve',
    conf: '75% Confidence'
  },
  {
    id: 'REQ-00916',
    prio: 'Low Priority',
    prioColor: 'text-green-700 bg-green-50 border-green-100',
    title: 'Operational Request',
    ent: 'Rajesh Kirana Stores',
    loc: 'Solapur',
    reqBy: 'Vijay Patil (FO)',
    amount: '—',
    submitted: 'May 22, 2024 02:10 PM',
    due: 'May 25, 2024',
    dueCol: 'text-gray-500',
    rec: 'Approve',
    conf: '64% Confidence'
  },
];

const HISTORY_DATA = [
  { id: '1', req: 'Lending Decision', ent: 'Shree Ganesh Dairy', reqBy: 'Rahul More (FO)', dec: 'Approved', decColor: 'text-green-700 bg-green-50 border-green-100', reviewer: 'Rohit Deshmukh', subDate: 'May 18, 2024 10:12 AM', decDate: 'May 18, 2024 04:32 PM', status: 'Completed', sColor: 'text-green-700 bg-green-50 border-green-100' },
  { id: '2', req: 'Intervention Approval', ent: 'Sai Agri Producers Co.', reqBy: 'Sneha Jadhav (FO)', dec: 'Approved', decColor: 'text-green-700 bg-green-50 border-green-100', reviewer: 'Rohit Deshmukh', subDate: 'May 17, 2024 01:05 PM', decDate: 'May 17, 2024 05:47 PM', status: 'Completed', sColor: 'text-green-700 bg-green-50 border-green-100' },
  { id: '3', req: 'Field Visit Approval', ent: 'Rural Mart Services', reqBy: 'Priya S. (FO)', dec: 'Request Info', decColor: 'text-orange-700 bg-orange-50 border-orange-100', reviewer: 'Rohit Deshmukh', subDate: 'May 17, 2024 11:20 AM', decDate: 'May 17, 2024 03:12 PM', status: 'Awaiting Info', sColor: 'text-orange-700 bg-orange-50 border-orange-100' },
  { id: '4', req: 'Task Approval', ent: 'Maa Bhavani Traders', reqBy: 'Amit Patil (FO)', dec: 'Rejected', decColor: 'text-red-700 bg-red-50 border-red-100', reviewer: 'Rohit Deshmukh', subDate: 'May 16, 2024 09:40 AM', decDate: 'May 16, 2024 11:28 AM', status: 'Completed', sColor: 'text-green-700 bg-green-50 border-green-100' },
  { id: '5', req: 'Operational Request', ent: 'Rajesh Kirana Stores', reqBy: 'Vijay Patil (FO)', dec: 'Approved', decColor: 'text-green-700 bg-green-50 border-green-100', reviewer: 'Rohit Deshmukh', subDate: 'May 16, 2024 02:15 PM', decDate: 'May 16, 2024 04:05 PM', status: 'Completed', sColor: 'text-green-700 bg-green-50 border-green-100' },
];

export default function ApprovalsScreen({ navigateTo }: Props) {
  const [search, setSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<string | null>('REQ-00912');

  const filteredHistory = useMemo(() => {
    return HISTORY_DATA.filter(h => 
      h.req.toLowerCase().includes(search.toLowerCase()) ||
      h.ent.toLowerCase().includes(search.toLowerCase()) ||
      h.reqBy.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="space-y-5 pb-12 w-full max-w-[1600px] mx-auto overflow-x-hidden">
      
      {/* Breadcrumb & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
             <span>Operations</span>
             <span className="text-gray-300 font-normal">/</span>
             <span className="text-gray-900">Approvals</span>
          </div>
          <h1 className="text-[20px] font-extrabold text-gray-900 leading-none">Approvals</h1>
          <p className="text-[11px] font-medium text-gray-400 mt-1">
             Review and approve requests that require your authorization.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-1.5 text-[11px] font-bold text-gray-700 bg-white hover:bg-gray-50 transition-all shadow-sm">
            <Filter size={12} /> Filters
          </button>
          <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-1.5 text-[11px] font-bold text-gray-700 bg-white hover:bg-gray-50 transition-all shadow-sm">
            <Download size={12} /> Export
          </button>
          <button className="flex items-center gap-1.5 bg-[#16a34a] hover:bg-[#16a34a]/90 text-white rounded-xl px-3.5 py-1.5 text-[11px] font-bold transition-all shadow-sm">
            <RefreshCw size={12} /> Generate Report
          </button>
        </div>
      </div>

      {/* 1. AI Approval Summary */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-[#f0fdf4] border border-green-100 flex items-center justify-center shrink-0">
              <div className="relative">
                <CheckCircle2 size={22} className="text-green-700" />
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[7px] font-black px-0.5 rounded leading-none">AI</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Pending Approvals</span>
                <span className="text-gray-900 font-bold text-[18px] flex items-baseline gap-1">
                  27 <span className="text-[9px] font-bold text-green-600">↑ 5 vs yesterday</span>
                </span>
              </div>
              <p className="text-[12px] text-gray-700 leading-relaxed font-bold">
                 AI Insight: Most approvals are related to Lending Decisions. 2 requests are at high risk of SLA breach. 
                 Review high priority items first to maintain approval efficiency.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 lg:flex lg:items-center gap-6 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100 pt-5 lg:pt-0 lg:pl-6">
            <div className="min-w-[90px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">High Priority</div>
              <div className="text-[18px] font-black text-gray-900 mt-0.5">8</div>
              <div className="text-[9px] font-bold text-red-500">↑ 2 vs yesterday</div>
            </div>
            <div className="min-w-[90px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">Due Today</div>
              <div className="text-[18px] font-black text-gray-900 mt-0.5">9</div>
              <div className="text-[9px] font-bold text-red-500">↑ 3 vs yesterday</div>
            </div>
            <div className="min-w-[100px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">Avg Approval Time</div>
              <div className="text-[18px] font-black text-gray-900 mt-0.5">18.6 hrs</div>
              <div className="text-[9px] font-bold text-green-600">↓ 2.4 hrs vs last week</div>
            </div>
            <div className="min-w-[90px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">SLA Status</div>
              <div className="text-[18px] font-black text-green-700 mt-0.5">Good</div>
              <div className="text-[9px] font-bold text-green-600">92.1% on track</div>
            </div>
            <div className="min-w-[95px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">AI Confidence</div>
              <div className="text-[18px] font-black text-gray-900 mt-0.5">87%</div>
              <div className="text-[9px] font-bold text-green-600">High confidence</div>
            </div>
          </div>

          <div className="shrink-0 flex items-center self-stretch lg:border-l border-gray-100 lg:pl-6">
            <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-700 bg-white hover:bg-gray-50 ml-auto">
              Explain <ChevronDown size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Approval KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { title: 'Pending Approvals', val: '27', trend: '↑ 15.6% vs last week', trendCol: 'text-green-600 bg-green-50 border-green-100', spark: MINI_CHART_DATA_1, color: '#10b981' },
          { title: 'High Priority', val: '8', trend: '↑ 14.3% vs last week', trendCol: 'text-red-600 bg-red-50 border-red-100', spark: MINI_CHART_DATA_2, color: '#ef4444' },
          { title: 'Approved', val: '132', trend: '↑ 18.7% vs last week', trendCol: 'text-green-600 bg-green-50 border-green-100', spark: MINI_CHART_DATA_1, color: '#10b981' },
          { title: 'Rejected', val: '12', trend: '↑ 11.1% vs last week', trendCol: 'text-red-600 bg-red-50 border-red-100', spark: MINI_CHART_DATA_3, color: '#ef4444' },
          { title: 'Awaiting Information', val: '14', trend: '↑ 7.7% vs last week', trendCol: 'text-orange-600 bg-orange-50 border-orange-100', spark: MINI_CHART_DATA_2, color: '#f97316' },
          { title: 'SLA Compliance', val: '92.1%', trend: '↑ 3.6 pts vs last week', trendCol: 'text-green-600 bg-green-50 border-green-100', spark: MINI_CHART_DATA_1, color: '#10b981' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-[28px] p-4 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between h-[105px]">
            <div>
              <span className="text-[10px] font-extrabold text-gray-500 block leading-tight">{kpi.title}</span>
            </div>
            
            <div className="flex flex-col gap-1.5 mt-2">
              <span className="text-[18px] font-black text-gray-900 leading-none">{kpi.val}</span>
              <div className="flex">
                <span className={`inline-flex text-[8px] font-extrabold px-2 py-0.5 rounded-full border ${kpi.trendCol} whitespace-nowrap`}>
                  {kpi.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Approval Queue & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Approval Queue (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-extrabold text-gray-900">Approval Queue</h3>
            <button className="text-[10px] font-bold text-green-700 hover:underline flex items-center gap-1">
              View all queue <ArrowRight size={10} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {QUEUE_CARDS.map((card) => (
              <div 
                key={card.id} 
                onClick={() => setSelectedRequest(card.id)}
                className={`bg-white border rounded-2xl p-3.5 flex flex-col justify-between min-h-[220px] cursor-pointer transition-all ${
                  selectedRequest === card.id ? 'border-green-500 ring-2 ring-green-500/10' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold border ${card.prioColor}`}>{card.prio.split(' ')[0]}</span>
                  </div>

                  <span className="text-[11px] font-black text-gray-900 block leading-tight">{card.title}</span>
                  <span className="text-[9px] font-bold text-gray-500 block mt-1">{card.ent}</span>
                  <span className="text-[8px] font-bold text-gray-400 block">{card.loc}</span>

                  <div className="mt-3 pt-3 border-t border-gray-50 space-y-1 text-[9px] font-semibold text-gray-500">
                    <div className="flex justify-between"><span>Req by:</span><span className="text-gray-900 truncate max-w-[50px]">{card.reqBy.split(' ')[0]}</span></div>
                    {card.amount !== '—' && (
                      <div className="flex justify-between"><span>Amount:</span><strong className="text-gray-900">{card.amount}</strong></div>
                    )}
                    <div className="flex justify-between"><span>Due:</span><span className={card.dueCol}>{card.due.split(',')[0]}</span></div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-gray-100/50 flex flex-col gap-0.5">
                  <div className="text-[8px] font-extrabold text-gray-400 uppercase">AI Recommendation</div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] font-black text-green-700">{card.rec}</span>
                    <span className="text-[8px] font-bold text-gray-400">{card.conf.split(' ')[0]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: AI Approval Insights (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-extrabold text-gray-900">AI Approval Insights</h3>
            <button className="text-green-700 text-[10px] font-bold hover:underline">View all insights</button>
          </div>

          <div className="space-y-3.5 flex-1 flex flex-col justify-center">
            {[
              { icon: AlertTriangle, text: '3 approvals require attention today. These items are due within 24 hours and at risk of SLA breach.', color: 'text-red-500 bg-red-50 border-red-100', val: '92% Confidence', act: 'Review now' },
              { icon: CheckCircle2, text: 'Two requests have sufficient supporting evidence. AI analysis indicates these can be approved with high confidence.', color: 'text-green-500 bg-green-50 border-green-100', val: '86% Confidence', act: 'Review now' },
              { icon: HelpCircle, text: 'One request requires additional information. Document verification is incomplete for this request.', color: 'text-orange-500 bg-orange-50 border-orange-100', val: '76% Confidence', act: 'Request info' },
              { icon: TrendingUp, text: 'Lending decision approvals are increasing. Approval volume is 18% higher compared to last week.', color: 'text-blue-500 bg-blue-50 border-blue-100', val: '74% Confidence', act: 'View details' }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-3">
                <div className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 ${item.color}`}>
                  <item.icon size={12} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-gray-700 leading-snug">{item.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] font-extrabold text-green-600">{item.val}</span>
                    <span className="text-gray-300 text-[8px] font-normal">•</span>
                    <button className="text-[8px] font-extrabold text-green-700 hover:underline">{item.act} →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. Recommended Actions Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { title: 'Review Approval', sub: 'Open selected request', icon: Eye, color: 'text-blue-500 bg-blue-50 border-blue-100' },
          { title: 'Approve', sub: 'Approve with AI guidance', icon: Check, color: 'text-green-700 bg-green-50 border-green-100' },
          { title: 'Reject', sub: 'Reject with reason', icon: X, color: 'text-red-700 bg-red-50 border-red-100' },
          { title: 'Request Information', sub: 'Ask for more details', icon: HelpCircle, color: 'text-orange-700 bg-orange-50 border-orange-100' },
          { title: 'Escalate', sub: 'Send to higher authority', icon: ArrowUpRight, color: 'text-purple-700 bg-purple-50 border-purple-100' },
          { title: 'View Enterprise Twin', sub: 'Deep dive into enterprise', icon: FileText, color: 'text-slate-700 bg-slate-50 border-slate-100' },
        ].map((act, i) => (
          <button key={i} className="bg-white border border-gray-100 hover:border-green-200 rounded-2xl p-4 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col items-start gap-2.5 text-left group">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${act.color} transition-colors`}>
              <act.icon size={16} />
            </div>
            <div>
              <span className="text-[11px] font-black text-gray-900 block leading-tight group-hover:text-green-800 transition-colors">{act.title}</span>
              <span className="text-[9px] font-semibold text-gray-400 block mt-0.5">{act.sub}</span>
            </div>
          </button>
        ))}
      </div>

      {/* 6. Approval History (Table) */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-[13px] font-extrabold text-gray-900">Approval History</h3>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search requests, enterprises, officers..." 
                className="pl-8 pr-4 py-1.5 border border-gray-200 rounded-xl text-[11px] font-semibold focus:outline-none focus:border-green-300 w-[240px] transition-all bg-gray-50/50"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all">
              <Filter size={12} /> Filters
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all">
              <Download size={12} /> Export
            </button>
            <button className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 rounded-xl text-[10px] font-bold text-gray-600 bg-white hover:bg-gray-50 shadow-sm transition-all ml-auto">
              Bulk Actions <ChevronDown size={10} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                <th className="pb-3 w-8"><input type="checkbox" className="rounded" /></th>
                <th className="pb-3">Request</th>
                <th className="pb-3">Enterprise</th>
                <th className="pb-3">Requested By</th>
                <th className="pb-3 text-center">Decision</th>
                <th className="pb-3">Reviewer</th>
                <th className="pb-3">Submitted</th>
                <th className="pb-3">Decided</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredHistory.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3.5"><input type="checkbox" className="rounded" /></td>
                  <td className="py-3.5">
                    <span 
                      onClick={() => navigateTo('twin', row.id)}
                      className="text-[11px] font-bold text-gray-800 hover:text-green-700 cursor-pointer hover:underline"
                    >
                      {row.req}
                    </span>
                  </td>
                  <td className="py-3.5 text-[11px] font-semibold text-gray-500">{row.ent}</td>
                  <td className="py-3.5 text-[11px] font-semibold text-gray-500">{row.reqBy}</td>
                  
                  {/* Decision Badge */}
                  <td className="py-3.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold border ${row.decColor}`}>
                      {row.dec}
                    </span>
                  </td>

                  {/* Reviewer */}
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[9px] font-extrabold text-emerald-800 shrink-0">RD</div>
                      <span className="text-[11px] font-semibold text-gray-700">{row.reviewer}</span>
                    </div>
                  </td>

                  {/* Submitted */}
                  <td className="py-3.5 text-[10px] font-semibold text-gray-400">{row.subDate}</td>
                  <td className="py-3.5 text-[10px] font-semibold text-gray-400">{row.decDate}</td>

                  {/* Status Badge */}
                  <td className="py-3.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold border ${row.sColor}`}>
                      {row.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => navigateTo('twin', row.id)} className="p-1 hover:bg-gray-100 rounded text-gray-500" title="View Digital Twin"><Eye size={12} /></button>
                      <button className="p-1 hover:bg-gray-100 rounded text-gray-400"><MoreVertical size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Custom Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-4 border-t border-gray-100">
          <span className="text-[11px] font-semibold text-gray-400">
            Showing 1 to {filteredHistory.length} of 132 requests
          </span>

          <div className="flex items-center gap-1 self-end sm:self-auto">
            <button className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-400 bg-white" disabled>&lt;</button>
            <button className="px-3 py-1.5 bg-green-50 border border-green-100 text-green-700 rounded-lg text-[10px] font-black">1</button>
            <button className="px-3 py-1.5 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500 bg-white hover:bg-gray-50">2</button>
            <button className="px-3 py-1.5 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500 bg-white hover:bg-gray-50">3</button>
            <span className="px-1.5 text-gray-400 text-[10px]">...</span>
            <button className="px-3 py-1.5 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500 bg-white hover:bg-gray-50">27</button>
            <button className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-500 bg-white hover:bg-gray-50">&gt;</button>
          </div>
        </div>

      </div>

    </div>
  );
}
