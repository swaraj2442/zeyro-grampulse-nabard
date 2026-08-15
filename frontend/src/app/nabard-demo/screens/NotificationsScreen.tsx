"use client";

import React, { useState, useMemo } from 'react';
import { 
  Filter, Download, RefreshCw, Sparkles, TrendingUp, TrendingDown,
  Activity, ArrowUpRight, ArrowDownRight, ArrowRight, Wallet, AlertTriangle, 
  Banknote, Target, ChevronRight, Play, Eye, MoreVertical, LayoutTemplate, 
  Calendar, FileText, CheckCircle2, CloudRain, Clock, Users, FileSpreadsheet, Search,
  ChevronDown, HelpCircle, Thermometer, ShieldAlert, BarChart2, Droplets, Sun, Bell, Settings,
  Check
} from 'lucide-react';
import { 
  LineChart, Line, ResponsiveContainer 
} from 'recharts';

// --- MOCK DATA ---

const MINI_CHART_DATA_1 = [{val: 20}, {val: 25}, {val: 22}, {val: 30}, {val: 28}, {val: 35}];
const MINI_CHART_DATA_2 = [{val: 40}, {val: 35}, {val: 50}, {val: 45}, {val: 60}, {val: 55}];
const MINI_CHART_DATA_3 = [{val: 50}, {val: 45}, {val: 40}, {val: 30}, {val: 25}, {val: 20}];

const ALERTS_FEED = [
  {
    id: 1,
    icon: AlertTriangle,
    iconColor: 'text-red-500 bg-red-50 border-red-100',
    title: 'Repayment risk increased for 8 enterprises',
    desc: 'Enterprises in Satara district show weakening repayment behaviour.',
    ent: 'Shree Ganesh Dairy, Satara',
    time: 'May 24, 2024 11:20 AM',
    prio: 'Critical',
    prioColor: 'text-red-700 bg-red-50 border-red-100',
    source: 'Risk Engine',
    category: 'Risk'
  },
  {
    id: 2,
    icon: Thermometer,
    iconColor: 'text-orange-500 bg-orange-50 border-orange-100',
    title: 'Heatwave alert for Sangli district',
    desc: 'High temperature expected in next 3 days may impact field visits.',
    ent: 'Sangli District',
    time: 'May 24, 2024 10:15 AM',
    prio: 'High',
    prioColor: 'text-red-600 bg-red-50 border-red-100',
    source: 'Climate Monitor',
    category: 'Climate'
  },
  {
    id: 3,
    icon: Users,
    iconColor: 'text-green-600 bg-green-50 border-green-100',
    title: 'Field officer offline for more than 24 hours',
    desc: 'Vijay Patil (Sangli) has been offline since May 23, 08:15 AM.',
    ent: 'Vijay Patil (FO), Sangli',
    time: 'May 24, 2024 09:45 AM',
    prio: 'Medium',
    prioColor: 'text-orange-700 bg-orange-50 border-orange-100',
    source: 'Field Operations',
    category: 'Operations'
  },
  {
    id: 4,
    icon: TrendingDown,
    iconColor: 'text-orange-500 bg-orange-50 border-orange-100',
    title: 'Market price drop detected',
    desc: 'Milk procurement price dropped by 6% in Kolhapur market.',
    ent: 'Kolhapur District',
    time: 'May 24, 2024 09:10 AM',
    prio: 'Medium',
    prioColor: 'text-orange-700 bg-orange-50 border-orange-100',
    source: 'Market Feed',
    category: 'Market'
  },
  {
    id: 5,
    icon: Sparkles,
    iconColor: 'text-purple-600 bg-purple-50 border-purple-100',
    title: 'AI anomaly detected in expense entries',
    desc: 'Unusual pattern in expense submissions for Rural Mart Services.',
    ent: 'Rural Mart Services, Sangli',
    time: 'May 24, 2024 08:30 AM',
    prio: 'High',
    prioColor: 'text-red-600 bg-red-50 border-red-100',
    source: 'AI Engine',
    category: 'AI'
  },
];

const INSIGHTS = [
  { icon: AlertTriangle, text: 'Most unresolved alerts are concentrated in Satara and Sangli districts.', val: '92% Confidence', act: 'Review districts', color: 'text-red-500 bg-red-50 border-red-100' },
  { icon: HelpCircle, text: 'Three notifications relate to enterprises already on the watchlist.', val: '88% Confidence', act: 'View watchlist', color: 'text-orange-500 bg-orange-50 border-orange-100' },
  { icon: CloudRain, text: 'Climate alerts may require intervention review.', val: '76% Confidence', act: 'Review Interventions', color: 'text-blue-500 bg-blue-50 border-blue-100' },
  { icon: Users, text: 'Repeated offline issues for 5 field officers. Connectivity follow-up recommended.', val: '82% Confidence', act: 'Contact officers', color: 'text-green-500 bg-green-50 border-green-100' },
  { icon: TrendingUp, text: 'Risk alerts show increasing trend compared to last week.', val: '79% Confidence', act: 'View risk dashboard', color: 'text-purple-500 bg-purple-50 border-purple-100' },
];

const ACTIONS = [
  { title: 'Review Critical Alerts', sub: '23 alerts need attention', icon: ShieldAlert, color: 'text-red-700 bg-red-50 border-red-100' },
  { title: 'Mark as Resolved', sub: 'Resolve selected notifications', icon: Check, color: 'text-green-700 bg-green-50 border-green-100' },
  { title: 'Assign Task', sub: 'Create task from alert', icon: Calendar, color: 'text-blue-700 bg-blue-50 border-blue-100' },
  { title: 'View Enterprise Twin', sub: 'Deep dive into enterprise', icon: FileText, color: 'text-slate-700 bg-slate-50 border-slate-100' },
  { title: 'Create Intervention', sub: 'Start new intervention', icon: Activity, color: 'text-purple-700 bg-purple-50 border-purple-100' },
  { title: 'Configure Rules', sub: 'Manage notification rules', icon: Settings, color: 'text-orange-700 bg-orange-50 border-orange-100' },
];

const HISTORY_DATA = [
  { id: '1', note: 'Repayment risk increased for 8 enterprises', cat: 'Risk', ent: 'Shree Ganesh Dairy, Satara', prio: 'Critical', pCol: 'text-red-700 bg-red-50 border-red-100', created: 'May 24, 2024 11:20 AM', status: 'Unresolved', sCol: 'text-red-700 bg-red-50 border-red-100', assigned: 'Rahul More (FO)', resolved: '—', source: 'Risk Engine' },
  { id: '2', note: 'Heatwave alert for Sangli district', cat: 'Climate', ent: 'Sangli District', prio: 'High', pCol: 'text-red-600 bg-red-50 border-red-100', created: 'May 24, 2024 10:15 AM', status: 'Requires Action', sCol: 'text-orange-700 bg-orange-50 border-orange-100', assigned: 'Priya S. (FO)', resolved: '—', source: 'Climate Monitor' },
  { id: '3', note: 'Field officer offline for more than 24 hours', cat: 'Operations', ent: 'Vijay Patil (FO), Sangli', prio: 'Medium', pCol: 'text-orange-700 bg-orange-50 border-orange-100', created: 'May 24, 2024 09:45 AM', status: 'Unresolved', sCol: 'text-red-700 bg-red-50 border-red-100', assigned: '—', resolved: '—', source: 'Field Operations' },
  { id: '4', note: 'Market price drop detected', cat: 'Market', ent: 'Kolhapur District', prio: 'Medium', pCol: 'text-orange-700 bg-orange-50 border-orange-100', created: 'May 24, 2024 09:10 AM', status: 'Informational', sCol: 'text-blue-700 bg-blue-50 border-blue-100', assigned: '—', resolved: '—', source: 'Market Feed' },
  { id: '5', note: 'AI anomaly detected in expense entries', cat: 'AI', ent: 'Rural Mart Services, Sangli', prio: 'High', pCol: 'text-red-600 bg-red-50 border-red-100', created: 'May 24, 2024 08:30 AM', status: 'Requires Action', sCol: 'text-orange-700 bg-orange-50 border-orange-100', assigned: 'Anil Patil (FO)', resolved: '—', source: 'AI Engine' },
  { id: '6', note: 'System maintenance scheduled', cat: 'System', ent: 'All Districts', prio: 'Low', pCol: 'text-green-700 bg-green-50 border-green-100', created: 'May 24, 2024 07:30 AM', status: 'Resolved', sCol: 'text-green-700 bg-green-50 border-green-100', assigned: '—', resolved: 'May 24, 2024 08:05 AM', source: 'System' },
  { id: '7', note: 'Weekly performance report available', cat: 'Reports', ent: 'All Districts', prio: 'Low', pCol: 'text-green-700 bg-green-50 border-green-100', created: 'May 24, 2024 07:00 AM', status: 'Resolved', sCol: 'text-green-700 bg-green-50 border-green-100', assigned: '—', resolved: 'May 24, 2024 07:10 AM', source: 'Reports Engine' },
];

export default function NotificationsScreen() {
  const [search, setSearch] = useState('');
  const [activeFeedTab, setActiveFeedTab] = useState('All');

  const filteredFeed = useMemo(() => {
    if (activeFeedTab === 'All') return ALERTS_FEED;
    return ALERTS_FEED.filter(a => a.category === activeFeedTab);
  }, [activeFeedTab]);

  const filteredHistory = useMemo(() => {
    return HISTORY_DATA.filter(h => 
      h.note.toLowerCase().includes(search.toLowerCase()) ||
      h.ent.toLowerCase().includes(search.toLowerCase()) ||
      h.source.toLowerCase().includes(search.toLowerCase())
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
             <span className="text-gray-900">Notifications</span>
          </div>
          <h1 className="text-[20px] font-extrabold text-gray-900 leading-none">Notifications</h1>
          <p className="text-[11px] font-medium text-gray-400 mt-1">
             Monitor and manage alerts and important updates across operations.
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

      {/* 1. AI Notification Summary */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-[#f0fdf4] border border-green-100 flex items-center justify-center shrink-0">
              <div className="relative">
                <Bell size={22} className="text-green-700" />
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[7px] font-black px-0.5 rounded leading-none">AI</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Unread Alerts</span>
                <span className="text-gray-900 font-bold text-[18px] flex items-baseline gap-1">
                  128 <span className="text-[9px] font-bold text-red-500">↑ 18 vs yesterday</span>
                </span>
              </div>
              <p className="text-[12px] text-gray-700 leading-relaxed font-bold">
                 AI Insight: Risk and operational alerts have increased by 24% in Satara and Sangli districts. 
                 Three AI-prioritized alerts need immediate attention.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 lg:flex lg:items-center gap-6 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100 pt-5 lg:pt-0 lg:pl-6">
            <div className="min-w-[90px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">Critical Alerts</div>
              <div className="text-[18px] font-black text-gray-900 mt-0.5">23</div>
              <div className="text-[9px] font-bold text-red-500">↑ 5 vs yesterday</div>
            </div>
            <div className="min-w-[90px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">Requires Action</div>
              <div className="text-[18px] font-black text-gray-900 mt-0.5">76</div>
              <div className="text-[9px] font-bold text-red-500">↓ 9 vs yesterday</div>
            </div>
            <div className="min-w-[90px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">Resolved Today</div>
              <div className="text-[18px] font-black text-gray-900 mt-0.5">96</div>
              <div className="text-[9px] font-bold text-green-600">↑ 24 vs yesterday</div>
            </div>
            <div className="min-w-[90px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">AI Prioritized</div>
              <div className="text-[18px] font-black text-gray-900 mt-0.5">41</div>
              <div className="text-[9px] font-bold text-green-600">↑ 11 vs yesterday</div>
            </div>
            <div className="min-w-[90px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">Notification Health</div>
              <div className="text-[18px] font-black text-green-700 mt-0.5">Good</div>
              <div className="text-[9px] font-bold text-green-600">92.3% on track</div>
            </div>
          </div>

          <div className="shrink-0 flex items-center self-stretch lg:border-l border-gray-100 lg:pl-6">
            <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-700 bg-white hover:bg-gray-50 ml-auto">
              Explain <ChevronDown size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Notification KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { title: 'Total Notifications', val: '1,842', trend: '↑ 16.0% vs last week', trendCol: 'text-green-600 bg-green-50 border-green-100', spark: MINI_CHART_DATA_1, color: '#10b981' },
          { title: 'Unread', val: '128', trend: '↓ 12.4% vs last week', trendCol: 'text-red-600 bg-red-50 border-red-100', spark: MINI_CHART_DATA_2, color: '#ef4444' },
          { title: 'Critical', val: '23', trend: '↑ 24.2% vs last week', trendCol: 'text-red-600 bg-red-50 border-red-100', spark: MINI_CHART_DATA_2, color: '#ef4444' },
          { title: 'Requires Action', val: '76', trend: '↑ 15.6% vs last week', trendCol: 'text-green-600 bg-green-50 border-green-100', spark: MINI_CHART_DATA_1, color: '#10b981' },
          { title: 'Resolved', val: '342', trend: '↑ 18.7% vs last week', trendCol: 'text-green-600 bg-green-50 border-green-100', spark: MINI_CHART_DATA_1, color: '#10b981' },
          { title: 'AI Prioritized', val: '41', trend: '↑ 19.4% vs last week', trendCol: 'text-green-600 bg-green-50 border-green-100', spark: MINI_CHART_DATA_2, color: '#a855f7' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-[28px] p-4 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between h-[105px]">
            <div>
              <span className="text-[10px] font-extrabold text-gray-500 block leading-tight">{kpi.title}</span>
            </div>
            
            <div className="flex items-end justify-between gap-2">
              <div>
                <span className="text-[18px] font-black text-gray-900 block leading-none mb-1.5">{kpi.val}</span>
                <span className={`inline-flex items-center text-[8px] font-extrabold px-1.5 py-0.5 rounded-full border ${kpi.trendCol}`}>
                  {kpi.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Priority Feed & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Priority Feed (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-[13px] font-extrabold text-gray-900">Priority Notification Feed</h3>
            
            <div className="flex flex-wrap items-center gap-1">
              {['All', 'Risk', 'Climate', 'Market', 'Operations', 'AI', 'Reports', 'System'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFeedTab(tab)}
                  className={`px-3 py-1 rounded-xl text-[10px] font-bold border transition-colors ${
                    activeFeedTab === tab 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-white text-gray-500 border-gray-150 hover:bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredFeed.map((alert) => (
              <div key={alert.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-start justify-between gap-4 hover:border-gray-200 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${alert.iconColor}`}>
                    <alert.icon size={16} />
                  </div>
                  <div>
                    <span className="text-[12px] font-black text-gray-900 block leading-tight">{alert.title}</span>
                    <span className="text-[10px] font-semibold text-gray-600 block mt-1 leading-snug">{alert.desc}</span>
                    
                    <div className="flex items-center gap-3 mt-3 text-[9px] font-bold text-gray-400">
                      <span>{alert.ent}</span>
                      <span>•</span>
                      <span>{alert.time}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold border ${alert.prioColor}`}>{alert.prio}</span>
                  <span className="text-[9px] font-bold text-gray-400 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-lg">{alert.source}</span>
                </div>
              </div>
            ))}
          </div>

          <button className="text-[10px] font-bold text-green-700 hover:underline flex items-center gap-1">
            View all notifications <ArrowRight size={10} />
          </button>
        </div>

        {/* Right: AI Alert Insights (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-extrabold text-gray-900">AI Alert Insights</h3>
            <button className="text-green-700 text-[10px] font-bold hover:underline">View all insights</button>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {INSIGHTS.map((item, idx) => (
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
        {ACTIONS.map((act, i) => (
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

      {/* 6. Notification History (Table) */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-[13px] font-extrabold text-gray-900">Notification History</h3>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search notifications, enterprises, districts..." 
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
                <th className="pb-3">Notification</th>
                <th className="pb-3 text-center">Category</th>
                <th className="pb-3">Enterprise / District</th>
                <th className="pb-3 text-center">Priority</th>
                <th className="pb-3">Created</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3">Assigned To</th>
                <th className="pb-3">Resolved</th>
                <th className="pb-3">Source</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredHistory.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3.5"><input type="checkbox" className="rounded" /></td>
                  <td className="py-3.5">
                    <span 
                      className="text-[11px] font-bold text-gray-800 truncate max-w-[200px] block"
                      title={row.note}
                    >
                      {row.note}
                    </span>
                  </td>
                  <td className="py-3.5 text-center text-[11px] font-semibold text-gray-500">{row.cat}</td>
                  <td className="py-3.5 text-[11px] font-semibold text-gray-500">{row.ent}</td>
                  
                  {/* Priority Badge */}
                  <td className="py-3.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold border ${row.pCol}`}>
                      {row.prio}
                    </span>
                  </td>

                  {/* Created */}
                  <td className="py-3.5 text-[10px] font-semibold text-gray-400">{row.created}</td>

                  {/* Status Badge */}
                  <td className="py-3.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold border ${row.sCol}`}>
                      {row.status}
                    </span>
                  </td>

                  {/* Assigned To */}
                  <td className="py-3.5">
                    {row.assigned !== '—' ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[9px] font-extrabold text-emerald-800 shrink-0">RD</div>
                        <span className="text-[11px] font-semibold text-gray-700">{row.assigned}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-450 font-bold">—</span>
                    )}
                  </td>

                  {/* Resolved Date */}
                  <td className="py-3.5 text-[10px] font-semibold text-gray-400">{row.resolved}</td>

                  {/* Source */}
                  <td className="py-3.5 text-[10px] font-semibold text-gray-500">{row.source}</td>

                  {/* Actions */}
                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button className="p-1 hover:bg-gray-100 rounded text-gray-500" title="View details"><Eye size={12} /></button>
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
            Showing 1 to {filteredHistory.length} of 1,842 notifications
          </span>

          <div className="flex items-center gap-1 self-end sm:self-auto">
            <button className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-400 bg-white" disabled>&lt;</button>
            <button className="px-3 py-1.5 bg-green-50 border border-green-100 text-green-700 rounded-lg text-[10px] font-black">1</button>
            <button className="px-3 py-1.5 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500 bg-white hover:bg-gray-50">2</button>
            <button className="px-3 py-1.5 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500 bg-white hover:bg-gray-50">3</button>
            <span className="px-1.5 text-gray-400 text-[10px]">...</span>
            <button className="px-3 py-1.5 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500 bg-white hover:bg-gray-50">264</button>
            <button className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-500 bg-white hover:bg-gray-50">&gt;</button>
          </div>
        </div>

      </div>

    </div>
  );
}
