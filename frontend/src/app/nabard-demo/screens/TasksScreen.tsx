"use client";

import React, { useState, useMemo } from 'react';
import { 
  Filter, Download, RefreshCw, Sparkles, TrendingUp, TrendingDown,
  Activity, ArrowUpRight, ArrowDownRight, ArrowRight, Wallet, AlertTriangle, 
  Banknote, Target, ChevronRight, Play, Eye, MoreVertical, LayoutTemplate, 
  Calendar, FileText, CheckCircle2, CloudRain, Clock, Users, FileSpreadsheet, Search,
  ChevronDown, HelpCircle, Thermometer, ShieldAlert, BarChart2, Droplets, UploadCloud,
  FileCode, Image, FileImage, ShieldCheck, MailOpen, Upload, Phone, Settings, Wrench, RotateCw,
  UserPlus, RefreshCw as RefreshIcon, ArrowUp
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

const RECENT_TASKS = [
  { title: 'Repayment follow-up', ent: 'Shree Ganesh Dairy', loc: 'Kolhapur', status: 'Assigned', sCol: 'text-blue-700 bg-blue-50 border-blue-100', due: 'Due: May 22, 2024' },
  { title: 'Cashflow verification', ent: 'Sai Agri Producers Co.', loc: 'Satara', status: 'In Progress', sCol: 'text-purple-700 bg-purple-50 border-purple-100', due: 'Due: May 21, 2024' },
  { title: 'Document collection', ent: 'Maa Bhavani Traders', loc: 'Pune', status: 'New', sCol: 'text-green-700 bg-green-50 border-green-100', due: 'Due: May 23, 2024' },
  { title: 'Enterprise visit', ent: 'Rural Mart Services', loc: 'Sangli', status: 'Completed', sCol: 'text-slate-500 bg-slate-50 border-slate-100', due: 'Completed on May 18' },
];

const QUEUE_CARDS = [
  {
    id: 'T-001',
    prio: 'High Priority',
    prioColor: 'text-red-700 bg-red-50 border-red-100',
    conf: '92% Confidence',
    title: 'Repayment follow-up required',
    ent: 'Shree Ganesh Dairy',
    dist: 'Kolhapur',
    why: 'Repayment behaviour has weakened over the last monitoring period.',
    driver: 'Seasonal cash inflow',
    action: 'Contact enterprise and verify repayment plan.',
    due: 'Due: May 21, 2024',
    dueCol: 'text-red-600 font-bold'
  },
  {
    id: 'T-002',
    prio: 'Medium Priority',
    prioColor: 'text-orange-700 bg-orange-50 border-orange-100',
    conf: '78% Confidence',
    title: 'Cashflow verification',
    ent: 'Sai Agri Producers Co.',
    dist: 'Satara',
    why: 'Cashflow trend shows seasonal stress in next 30 days.',
    driver: 'Seasonal income drop',
    action: 'Verify cashflow and recommend working capital support.',
    due: 'Due: May 22, 2024',
    dueCol: 'text-orange-600 font-bold'
  },
  {
    id: 'T-003',
    prio: 'Medium Priority',
    prioColor: 'text-orange-700 bg-orange-50 border-orange-100',
    conf: '75% Confidence',
    title: 'Document collection',
    ent: 'Maa Bhavani Traders',
    dist: 'Pune',
    why: 'KYC documents are incomplete for this enterprise.',
    driver: 'Compliance risk',
    action: 'Collect pending documents on priority.',
    due: 'Due: May 23, 2024',
    dueCol: 'text-orange-600 font-bold'
  },
  {
    id: 'T-004',
    prio: 'Low Priority',
    prioColor: 'text-green-700 bg-green-50 border-green-100',
    conf: '60% Confidence',
    title: 'Enterprise visit',
    ent: 'Rural Mart Services',
    dist: 'Sangli',
    why: 'Regular monitoring visit is pending for this enterprise.',
    driver: 'Monitoring gap',
    action: 'Schedule visit in next 7 days.',
    due: 'Due: May 24, 2024',
    dueCol: 'text-green-600 font-bold'
  },
];

const DIRECTORY_DATA = [
  { id: '1', task: 'Repayment follow-up', ent: 'Shree Ganesh Dairy', dist: 'Kolhapur', type: 'Repayment', officer: 'Rahul More', prio: 'High', pCol: 'text-red-700 bg-red-50 border-red-100', status: 'Assigned', sCol: 'text-blue-700 bg-blue-50 border-blue-100', due: 'May 21, 2024', dueSub: '2 days left', subCol: 'text-red-500 font-bold', sla: 85, slaCol: 'bg-orange-500', lastUpdate: 'May 19, 2024 08:15 AM' },
  { id: '2', task: 'Cashflow verification', ent: 'Sai Agri Producers Co.', dist: 'Satara', type: 'Verification', officer: 'Sneha Jadhav', prio: 'Medium', pCol: 'text-orange-700 bg-orange-50 border-orange-100', status: 'In Progress', sCol: 'text-purple-700 bg-purple-50 border-purple-100', due: 'May 22, 2024', dueSub: '3 days left', subCol: 'text-orange-500 font-bold', sla: 90, slaCol: 'bg-green-600', lastUpdate: 'May 19, 2024 07:45 AM' },
  { id: '3', task: 'Document collection', ent: 'Maa Bhavani Traders', dist: 'Pune', type: 'Documentation', officer: 'Anil Patil', prio: 'Medium', pCol: 'text-orange-700 bg-orange-50 border-orange-100', status: 'New', sCol: 'text-green-700 bg-green-50 border-green-100', due: 'May 23, 2024', dueSub: '4 days left', subCol: 'text-green-600 font-bold', sla: 70, slaCol: 'bg-orange-500', lastUpdate: 'May 18, 2024 07:30 AM' },
  { id: '4', task: 'Enterprise visit', ent: 'Rural Mart Services', dist: 'Sangli', type: 'Field Visit', officer: 'Priya S.', prio: 'Low', pCol: 'text-green-700 bg-green-50 border-green-100', status: 'Completed', sCol: 'text-slate-500 bg-slate-50 border-slate-100', due: 'May 20, 2024', dueSub: 'Completed', subCol: 'text-green-600 font-bold', sla: 100, slaCol: 'bg-green-600', lastUpdate: 'May 18, 2024 06:15 PM' },
  { id: '5', task: 'Income confirmation', ent: 'Rajesh Kirana Stores', dist: 'Solapur', type: 'Verification', officer: 'Vijay Patil', prio: 'High', pCol: 'text-red-700 bg-red-50 border-red-100', status: 'Assigned', sCol: 'text-blue-700 bg-blue-50 border-blue-100', due: 'May 21, 2024', dueSub: '2 days left', subCol: 'text-red-500 font-bold', sla: 80, slaCol: 'bg-orange-500', lastUpdate: 'May 19, 2024 06:10 AM' },
];

export default function TasksScreen({ navigateTo }: Props) {
  const [search, setSearch] = useState('');

  const filteredDirectory = useMemo(() => {
    return DIRECTORY_DATA.filter(d => 
      d.task.toLowerCase().includes(search.toLowerCase()) ||
      d.ent.toLowerCase().includes(search.toLowerCase()) ||
      d.officer.toLowerCase().includes(search.toLowerCase()) ||
      d.dist.toLowerCase().includes(search.toLowerCase())
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
             <span className="text-gray-900">Tasks</span>
          </div>
          <h1 className="text-[20px] font-extrabold text-gray-900 leading-none">Tasks</h1>
          <p className="text-[11px] font-medium text-gray-400 mt-1">
             Manage, prioritize and track operational tasks across your region.
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

      {/* 1. AI Task Summary */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-[#f0fdf4] border border-green-100 flex items-center justify-center shrink-0">
              <div className="relative">
                <Activity size={22} className="text-green-700" />
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[7px] font-black px-0.5 rounded leading-none">AI</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Pending Tasks</span>
                <span className="text-gray-900 font-bold text-[18px] flex items-baseline gap-1">
                  312 <span className="text-[9px] font-bold text-red-500">↓ 24 vs yesterday</span>
                </span>
              </div>
              <p className="text-[12px] text-gray-700 leading-relaxed font-bold">
                 AI Insight: Repayment follow-up tasks have increased by 18% due to weakened repayment behaviour in 34 enterprises across 5 districts. 
                 Prioritizing these tasks can reduce future risk.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 lg:flex lg:items-center gap-6 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100 pt-5 lg:pt-0 lg:pl-6">
            <div className="min-w-[90px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">Overdue Tasks</div>
              <div className="text-[18px] font-black text-gray-900 mt-0.5">48</div>
              <div className="text-[9px] font-bold text-red-500">↑ 8 vs yesterday</div>
            </div>
            <div className="min-w-[90px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">Tasks Due Today</div>
              <div className="text-[18px] font-black text-gray-900 mt-0.5">76</div>
              <div className="text-[9px] font-bold text-green-600">↑ 12 vs yesterday</div>
            </div>
            <div className="min-w-[90px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">Completion Rate</div>
              <div className="text-[18px] font-black text-gray-900 mt-0.5">78.4%</div>
              <div className="text-[9px] font-bold text-green-600">↑ 4.6 pts vs last week</div>
            </div>
            <div className="min-w-[90px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">SLA Health</div>
              <div className="text-[18px] font-black text-green-700 mt-0.5">Good</div>
              <div className="text-[9px] font-bold text-green-600">92.3% on track</div>
            </div>
            <div className="min-w-[95px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">AI Task Priority</div>
              <div className="text-[18px] font-black text-[#6366f1] mt-0.5">High</div>
              <div className="text-[9px] font-bold text-[#6366f1]">Focus on repayment follow-ups</div>
            </div>
          </div>

          <div className="shrink-0 flex items-center self-stretch lg:border-l border-gray-100 lg:pl-6">
            <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-700 bg-white hover:bg-gray-50 ml-auto">
              Explain <ChevronDown size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Task KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { title: 'Total Tasks', val: '1,842', trend: '↑ 16.8% vs last week', trendCol: 'text-green-600 bg-green-50 border-green-100', spark: MINI_CHART_DATA_1, color: '#10b981' },
          { title: 'Pending', val: '312', trend: '↑ 12.4% vs last week', trendCol: 'text-blue-600 bg-blue-50 border-blue-100', spark: MINI_CHART_DATA_2, color: '#3b82f6' },
          { title: 'In Progress', val: '524', trend: '↑ 8.6% vs last week', trendCol: 'text-purple-600 bg-purple-50 border-purple-100', spark: MINI_CHART_DATA_2, color: '#a855f7' },
          { title: 'Completed', val: '976', trend: '↑ 24.5% vs last week', trendCol: 'text-green-600 bg-green-50 border-green-100', spark: MINI_CHART_DATA_1, color: '#10b981' },
          { title: 'Overdue', val: '48', trend: '↑ 11.1% vs last week', trendCol: 'text-red-600 bg-red-50 border-red-100', spark: MINI_CHART_DATA_3, color: '#ef4444' },
          { title: 'SLA Compliance', val: '92.3%', trend: '↑ 3.7 pts vs last week', trendCol: 'text-green-600 bg-green-50 border-green-100', spark: MINI_CHART_DATA_1, color: '#10b981' },
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

      {/* 3. Task Workflow & Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Task Workflow (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">Task Workflow</h3>
            
            {/* Workflow state flow indicators */}
            <div className="flex items-center justify-between bg-gray-50/50 rounded-2xl p-4 border border-gray-100 max-w-[540px] mx-auto mb-6">
              {[
                { label: 'New', count: '146', pct: '12.3%', color: 'text-green-700 bg-green-50' },
                { label: 'Assigned', count: '312', pct: '26.8%', color: 'text-blue-700 bg-blue-50' },
                { label: 'In Progress', count: '524', pct: '28.4%', color: 'text-purple-700 bg-purple-50' },
                { label: 'Completed', count: '976', pct: '53.0%', color: 'text-slate-700 bg-slate-50' },
                { label: 'Overdue', count: '48', pct: '2.6%', color: 'text-red-700 bg-red-50' },
              ].map((step, idx) => (
                <React.Fragment key={idx}>
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[11px] border border-gray-100 ${step.color}`}>
                      {step.count}
                    </div>
                    <span className="text-[10px] font-black text-gray-800 mt-1.5">{step.label}</span>
                    <span className="text-[8px] font-semibold text-gray-400">{step.pct}</span>
                  </div>
                  {idx < 4 && (
                    <div className="text-gray-300 font-normal text-[12px] pb-5">→</div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Recent Tasks in Workflow */}
            <div className="border-t border-gray-100 pt-5">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-4">Recent Tasks in Workflow</span>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {RECENT_TASKS.map((task, i) => (
                  <div key={i} className="bg-gray-50/30 border border-gray-100 rounded-xl p-3 flex flex-col justify-between h-[90px]">
                    <div>
                      <span className="text-[10px] font-black text-gray-900 block leading-tight">{task.title}</span>
                      <span className="text-[9px] font-bold text-gray-500 block mt-1">{task.ent}</span>
                      <span className="text-[8px] font-bold text-gray-400 block">{task.loc}</span>
                    </div>
                    <div className="flex justify-between items-baseline mt-2">
                      <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border ${task.sCol}`}>{task.status}</span>
                      <span className="text-[8px] font-bold text-gray-400">{task.due.split(': ')[1] || task.due}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
          <button className="text-[10px] font-bold text-green-700 hover:underline flex items-center gap-1 mt-4">
            View all tasks in workflow <ArrowRight size={10} />
          </button>
        </div>

        {/* Right: AI Prioritized Task Queue (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-extrabold text-gray-900">AI Prioritized Task Queue</h3>
            <button className="text-green-700 text-[10px] font-bold hover:underline">View all queue</button>
          </div>

          <div className="overflow-x-auto pb-2 flex gap-3 scrollbar-thin">
            {QUEUE_CARDS.map((card) => (
              <div key={card.id} className="min-w-[200px] bg-gray-50/50 hover:bg-gray-50 border border-gray-100 hover:border-gray-200 rounded-2xl p-4 flex flex-col justify-between h-[230px] transition-colors shrink-0">
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold border ${card.prioColor}`}>{card.prio.split(' ')[0]}</span>
                    <span className="text-[8px] font-bold text-green-600">{card.conf}</span>
                  </div>

                  <span className="text-[11px] font-black text-gray-900 block leading-tight">{card.title}</span>
                  <span className="text-[9px] font-bold text-gray-600 block mt-1">{card.ent}</span>
                  <span className="text-[8px] font-bold text-gray-400 block mb-2">{card.dist}</span>

                  <p className="text-[9px] font-semibold text-gray-500 leading-relaxed truncate-2-lines mb-2">
                    Why: {card.why}
                  </p>
                  
                  <div className="text-[8px] font-semibold text-gray-400">
                    Risk Driver: <strong className="text-gray-600 font-bold">{card.driver}</strong>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-gray-100/50 flex flex-col gap-1.5">
                  <div className="text-[8px] font-semibold text-green-700 bg-green-50 border border-green-100/50 p-1 rounded">
                    Action: {card.action}
                  </div>
                  <span className={`text-[8px] ${card.dueCol}`}>{card.due}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. Recommended Actions Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { title: 'Assign Task', sub: 'Assign to field officer', icon: UserPlus, color: 'text-blue-500 bg-blue-50 border-blue-100' },
          { title: 'Reassign Task', sub: 'Change task ownership', icon: RefreshIcon, color: 'text-green-700 bg-green-50 border-green-100' },
          { title: 'Escalate Task', sub: 'Escalate to higher authority', icon: ArrowUp, color: 'text-red-700 bg-red-50 border-red-100' },
          { title: 'Reschedule Task', sub: 'Change due date', icon: Calendar, color: 'text-orange-700 bg-orange-50 border-orange-100' },
          { title: 'View Enterprise Twin', sub: 'Deep dive into enterprise', icon: Users, color: 'text-purple-700 bg-purple-50 border-purple-100' },
          { title: 'Create Intervention', sub: 'Start new intervention', icon: Activity, color: 'text-slate-700 bg-slate-50 border-slate-100' },
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

      {/* 6. Task Directory (Table) */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-[13px] font-extrabold text-gray-900">Task Directory</h3>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search tasks, enterprises, officers..." 
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
                <th className="pb-3">Task</th>
                <th className="pb-3">Enterprise</th>
                <th className="pb-3">District</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Assigned Officer</th>
                <th className="pb-3 text-center">Priority</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3">Due Date</th>
                <th className="pb-3">SLA</th>
                <th className="pb-3">Last Updated</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredDirectory.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3.5"><input type="checkbox" className="rounded" /></td>
                  <td className="py-3.5">
                    <span 
                      onClick={() => navigateTo('twin', row.id)}
                      className="text-[11px] font-bold text-gray-800 hover:text-green-700 cursor-pointer hover:underline"
                    >
                      {row.task}
                    </span>
                  </td>
                  <td className="py-3.5 text-[11px] font-semibold text-gray-500">{row.ent}</td>
                  <td className="py-3.5 text-[11px] font-semibold text-gray-500">{row.dist}</td>
                  <td className="py-3.5 text-[11px] font-semibold text-gray-500">{row.type}</td>
                  
                  {/* Assigned Officer */}
                  <td className="py-3.5">
                    {row.officer ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[9px] font-extrabold text-emerald-800 shrink-0">RD</div>
                        <span className="text-[11px] font-semibold text-gray-700">{row.officer}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-450 font-bold">—</span>
                    )}
                  </td>

                  {/* Priority Badge */}
                  <td className="py-3.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold border ${row.pCol}`}>
                      {row.prio}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold border ${row.sCol}`}>
                      {row.status}
                    </span>
                  </td>

                  {/* Due Date */}
                  <td className="py-3.5">
                    <span className="text-[11px] font-semibold text-gray-800 block">{row.due}</span>
                    <span className={`text-[8px] ${row.subCol} block`}>{row.dueSub}</span>
                  </td>

                  {/* SLA Indicator */}
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-700 w-8">{row.sla}%</span>
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden shrink-0">
                        <div className={`h-full rounded-full ${row.slaCol}`} style={{ width: `${row.sla}%` }}></div>
                      </div>
                    </div>
                  </td>

                  {/* Last Updated */}
                  <td className="py-3.5 text-[10px] font-semibold text-gray-400">{row.lastUpdate}</td>

                  {/* Actions */}
                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
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
            Showing 1 to {filteredDirectory.length} of 1,842 tasks
          </span>

          <div className="flex items-center gap-1 self-end sm:self-auto">
            <button className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-400 bg-white" disabled>&lt;</button>
            <button className="px-3 py-1.5 bg-green-50 border border-green-100 text-green-700 rounded-lg text-[10px] font-black">1</button>
            <button className="px-3 py-1.5 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500 bg-white hover:bg-gray-50">2</button>
            <button className="px-3 py-1.5 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500 bg-white hover:bg-gray-50">3</button>
            <span className="px-1.5 text-gray-400 text-[10px]">...</span>
            <button className="px-3 py-1.5 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500 bg-white hover:bg-gray-50">185</button>
            <button className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-500 bg-white hover:bg-gray-50">&gt;</button>
          </div>
        </div>

      </div>

    </div>
  );
}
