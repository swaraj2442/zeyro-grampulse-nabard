"use client";

import React, { useState, useMemo } from 'react';
import { 
  Filter, Download, RefreshCw, Sparkles, TrendingUp, TrendingDown,
  Activity, ArrowUpRight, ArrowDownRight, ArrowRight, Wallet, AlertTriangle, 
  Banknote, Target, ChevronRight, Play, Eye, MoreVertical, LayoutTemplate, 
  Calendar, FileText, CheckCircle2, CloudRain, Clock, Users, FileSpreadsheet, Search,
  ChevronDown, HelpCircle, Thermometer, ShieldAlert, BarChart2, Droplets, UploadCloud,
  FileCode, Image, FileImage, ShieldCheck, MailOpen, Upload, Phone, Settings, Wrench, RotateCw
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

const COLLECTION_TYPES = [
  { name: 'Cashflow Entry', count: '856', trend: '↑ 18.3%', color: 'text-green-600 bg-green-50 border-green-100', spark: MINI_CHART_DATA_1, sparkColor: '#10b981' },
  { name: 'Income', count: '742', trend: '↑ 12.4%', color: 'text-blue-600 bg-blue-50 border-blue-100', spark: MINI_CHART_DATA_2, sparkColor: '#3b82f6' },
  { name: 'Expense', count: '693', trend: '↓ 10.7%', color: 'text-orange-600 bg-orange-50 border-orange-100', spark: MINI_CHART_DATA_3, sparkColor: '#f97316' },
  { name: 'Savings', count: '518', trend: '↑ 14.1%', color: 'text-purple-600 bg-purple-50 border-purple-100', spark: MINI_CHART_DATA_2, sparkColor: '#a855f7' },
  { name: 'Repayment', count: '1,124', trend: '↑ 16.2%', color: 'text-green-600 bg-green-50 border-green-100', spark: MINI_CHART_DATA_1, sparkColor: '#10b981' },
  { name: 'GPS Sync', count: '426', trend: '↓ 5.8%', color: 'text-red-655 bg-red-50 border-red-100', spark: MINI_CHART_DATA_3, sparkColor: '#ef4444' },
];

const DIRECTORY_DATA = [
  { id: '1', ent: 'Shree Ganesh Dairy', officer: 'Rahul More', dist: 'Kolhapur', type: 'Cashflow Entry', captured: 'May 24, 2024 11:30 AM (Offline)', syncStatus: 'Pending', sColor: 'text-purple-700 bg-purple-50 border-purple-100', lastSync: '—', quality: 'Good', qColor: 'text-green-700 bg-green-50 border-green-100', review: 'Pending Review', rColor: 'text-orange-700 bg-orange-50 border-orange-100' },
  { id: '2', ent: 'Sai Agri Producers Co.', officer: 'Sneha Jadhav', dist: 'Satara', type: 'Income', captured: 'May 24, 2024 10:15 AM (Offline)', syncStatus: 'Uploading', sColor: 'text-blue-700 bg-blue-50 border-blue-100', lastSync: 'May 25, 2024 08:12 AM', quality: 'Good', qColor: 'text-green-700 bg-green-50 border-green-100', review: 'Reviewed', rColor: 'text-green-700 bg-green-50 border-green-100' },
  { id: '3', ent: 'Maa Bhavani Traders', officer: 'Anil Patil', dist: 'Pune', type: 'Expense', captured: 'May 23, 2024 04:45 PM (Offline)', syncStatus: 'Failed', sColor: 'text-red-700 bg-red-50 border-red-100', lastSync: 'May 24, 2024 07:25 AM', quality: 'Needs Attention', qColor: 'text-orange-700 bg-orange-50 border-orange-100', review: 'Pending Review', rColor: 'text-orange-700 bg-orange-50 border-orange-100' },
  { id: '4', ent: 'Rural Mart Services', officer: 'Priya S.', dist: 'Sangli', type: 'Savings', captured: 'May 24, 2024 09:20 AM (Offline)', syncStatus: 'Processing', sColor: 'text-orange-700 bg-orange-50 border-orange-100', lastSync: 'May 25, 2024 08:05 AM', quality: 'Good', qColor: 'text-green-700 bg-green-50 border-green-100', review: 'Reviewed', rColor: 'text-green-700 bg-green-50 border-green-100' },
  { id: '5', ent: 'Rajesh Kirana Stores', officer: 'Vijay Patil', dist: 'Solapur', type: 'Repayment', captured: 'May 23, 2024 06:10 PM (Offline)', syncStatus: 'Synced', sColor: 'text-green-700 bg-green-50 border-green-100', lastSync: 'May 24, 2024 09:40 AM', quality: 'Good', qColor: 'text-green-700 bg-green-50 border-green-100', review: 'Completed', rColor: 'text-green-700 bg-green-50 border-green-100' },
  { id: '6', ent: 'Shiv Shakti Enterprises', officer: 'Mahesh K.', dist: 'Beed', type: 'GPS Sync', captured: 'May 23, 2024 03:25 PM (Offline)', syncStatus: 'Failed', sColor: 'text-red-700 bg-red-50 border-red-100', lastSync: 'May 23, 2024 03:40 PM', quality: 'Poor', qColor: 'text-red-700 bg-red-50 border-red-100', review: 'Requires Action', rColor: 'text-red-700 bg-red-50 border-red-100' },
];

export default function OfflineCollectionScreen({ navigateTo }: Props) {
  const [search, setSearch] = useState('');

  const filteredDirectory = useMemo(() => {
    return DIRECTORY_DATA.filter(d => 
      d.ent.toLowerCase().includes(search.toLowerCase()) ||
      d.officer.toLowerCase().includes(search.toLowerCase()) ||
      d.dist.toLowerCase().includes(search.toLowerCase()) ||
      d.type.toLowerCase().includes(search.toLowerCase())
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
             <span className="text-gray-900">Offline Collection</span>
          </div>
          <h1 className="text-[20px] font-extrabold text-gray-900 leading-none">Offline Collection</h1>
          <p className="text-[11px] font-medium text-gray-400 mt-1">
             Monitor and manage offline data collected by field officers and synchronization status.
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

      {/* 1. AI Collection Summary */}
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
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Pending Sync</span>
                <span className="text-gray-900 font-bold text-[18px] flex items-baseline gap-1">
                  612 <span className="text-[9px] font-bold text-red-500">↓ 68 vs yesterday</span>
                </span>
              </div>
              <p className="text-[12px] text-gray-700 leading-relaxed font-bold">
                 AI Insight: Sync delays are high in Sangli and Beed districts due to poor connectivity. 
                 23 field officers have been offline for more than 24 hours.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 lg:flex lg:items-center gap-6 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100 pt-5 lg:pt-0 lg:pl-6">
            <div className="min-w-[90px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">Synced Today</div>
              <div className="text-[18px] font-black text-gray-900 mt-0.5">1,842</div>
              <div className="text-[9px] font-bold text-green-600">↑ 256 vs yesterday</div>
            </div>
            <div className="min-w-[90px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">Failed Sync</div>
              <div className="text-[18px] font-black text-gray-900 mt-0.5">68</div>
              <div className="text-[9px] font-bold text-red-500">↓ 12 vs yesterday</div>
            </div>
            <div className="min-w-[90px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">Awaiting Review</div>
              <div className="text-[18px] font-black text-gray-900 mt-0.5">174</div>
              <div className="text-[9px] font-bold text-green-600">↑ 16 vs yesterday</div>
            </div>
            <div className="min-w-[100px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">Field Officers Offline</div>
              <div className="text-[18px] font-black text-gray-900 mt-0.5">23</div>
              <div className="text-[9px] font-bold text-red-500">↑ 3 vs yesterday</div>
            </div>
            <div className="min-w-[90px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">Data Health</div>
              <div className="text-[18px] font-black text-green-700 mt-0.5">Good</div>
              <div className="text-[9px] font-bold text-green-600">91.6% healthy</div>
            </div>
          </div>

          <div className="shrink-0 flex items-center self-stretch lg:border-l border-gray-100 lg:pl-6">
            <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-700 bg-white hover:bg-gray-50 ml-auto">
              Explain <ChevronDown size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Collection KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { title: 'Pending Sync', val: '612', trend: '↓ 9.8% vs last week', trendCol: 'text-red-600 bg-red-50 border-red-100', spark: MINI_CHART_DATA_1, color: '#a855f7' },
          { title: 'Synced', val: '1,842', trend: '↑ 14.6% vs last week', trendCol: 'text-green-600 bg-green-50 border-green-100', spark: MINI_CHART_DATA_2, color: '#10b981' },
          { title: 'Failed', val: '68', trend: '↓ 7.3% vs last week', trendCol: 'text-red-600 bg-red-50 border-red-100', spark: MINI_CHART_DATA_3, color: '#ef4444' },
          { title: 'Awaiting Review', val: '174', trend: '↑ 12.1% vs last week', trendCol: 'text-green-600 bg-green-50 border-green-100', spark: MINI_CHART_DATA_1, color: '#f97316' },
          { title: 'Offline Officers', val: '23', trend: '↑ 15.0% vs last week', trendCol: 'text-red-600 bg-red-50 border-red-100', spark: MINI_CHART_DATA_2, color: '#3b82f6' },
          { title: 'Sync Success Rate', val: '91.6%', trend: '↑ 3.4 pts vs last week', trendCol: 'text-green-600 bg-green-50 border-green-100', spark: MINI_CHART_DATA_1, color: '#10b981' },
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

      {/* 3. Sync & Collection Overview & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Sync Overview (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">Sync & Collection Overview</h3>
            
            {/* Sync Flow Diagram */}
            <div className="flex items-center justify-between bg-gray-50/50 rounded-2xl p-4 border border-gray-100 max-w-[640px] mx-auto mb-6">
              {[
                { label: 'Pending', count: '612', pct: '37.2%', color: 'text-purple-600 bg-purple-50' },
                { label: 'Uploading', count: '286', pct: '17.4%', color: 'text-blue-600 bg-blue-50' },
                { label: 'Processing', count: '198', pct: '12.0%', color: 'text-orange-600 bg-orange-50' },
                { label: 'Synced', count: '1,842', pct: '+112.0%', color: 'text-green-600 bg-green-50' },
                { label: 'Failed', count: '68', pct: '4.1%', color: 'text-red-600 bg-red-50' },
              ].map((step, idx) => (
                <React.Fragment key={idx}>
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[12px] border border-gray-100 ${step.color}`}>
                      {step.count}
                    </div>
                    <span className="text-[10px] font-black text-gray-800 mt-1.5">{step.label}</span>
                    <span className="text-[8px] font-semibold text-gray-400">{step.pct}</span>
                  </div>
                  {idx < 4 && (
                    <div className="text-gray-300 font-normal text-[14px] pb-5">→</div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Collection Types Breakdown Grid */}
            <div className="border-t border-gray-100 pt-5">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-4">Collection Types (This Week)</span>
              
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {COLLECTION_TYPES.map((type, i) => (
                  <div key={i} className="bg-gray-50/30 border border-gray-100 rounded-xl p-3 flex flex-col justify-between h-[85px]">
                    <div>
                      <span className="text-[9px] font-bold text-gray-500 block leading-tight">{type.name}</span>
                      <span className="text-[14px] font-black text-gray-800 block mt-1">{type.count}</span>
                    </div>
                    <div className="flex items-center justify-between gap-1 mt-2">
                      <span className="text-[8px] font-bold text-green-600 bg-green-50 border border-green-100 px-1 rounded">{type.trend}</span>
                      <div className="h-4 w-8 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={type.spark}>
                            <Line type="monotone" dataKey="val" stroke={type.sparkColor} strokeWidth={1} dot={false} isAnimationActive={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right: AI Data Quality Insights (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-extrabold text-gray-900">AI Data Quality Insights</h3>
            <button className="text-green-700 text-[10px] font-bold hover:underline">View all insights</button>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {[
              { icon: AlertTriangle, text: 'Missing data in cashflow entries. 126 records are missing expense details.', val: '89% Confidence', act: 'Review now', color: 'text-red-500 bg-red-50 border-red-100' },
              { icon: Clock, text: 'Delayed synchronization. 39 submissions are pending sync for over 48 hours.', val: '82% Confidence', act: 'Retry sync', color: 'text-orange-500 bg-orange-50 border-orange-100' },
              { icon: RotateCw, text: 'Repeated failed sync attempts. 8 officers have repeated failures due to connectivity.', val: '78% Confidence', act: 'Contact officer', color: 'text-purple-500 bg-purple-50 border-purple-100' },
              { icon: BarChart2, text: 'Unusual data collection gaps. Income data collection dropped in 3 tehsils.', val: '74% Confidence', act: 'Investigate', color: 'text-blue-500 bg-blue-50 border-blue-100' },
              { icon: Users, text: 'Officers requiring connectivity follow-up. 23 officers have been offline for more than 24 hours.', val: '72% Confidence', act: 'Follow up now', color: 'text-green-500 bg-green-50 border-green-100' }
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
          { title: 'Retry Sync', sub: 'Retry failed/pending sync', icon: RotateCw, color: 'text-blue-500 bg-blue-50 border-blue-100' },
          { title: 'Review Submission', sub: 'Review data requiring attention', icon: Eye, color: 'text-green-700 bg-green-50 border-green-100' },
          { title: 'Contact Field Officer', sub: 'Reach out to offline officers', icon: Phone, color: 'text-orange-700 bg-orange-50 border-orange-100' },
          { title: 'Resolve Data Issue', sub: 'Fix data quality problems', icon: Wrench, color: 'text-blue-700 bg-blue-50 border-blue-100' },
          { title: 'View Enterprise', sub: 'Open enterprise profile', icon: Users, color: 'text-purple-700 bg-purple-50 border-purple-100' },
          { title: 'Export Collection Report', sub: 'Download collection summary', icon: FileSpreadsheet, color: 'text-slate-700 bg-slate-50 border-slate-100' },
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

      {/* 6. Offline Submission Directory (Table) */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-[13px] font-extrabold text-gray-900">Offline Submission Directory</h3>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search enterprises, officers..." 
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
                <th className="pb-3">Enterprise</th>
                <th className="pb-3">Field Officer</th>
                <th className="pb-3">District</th>
                <th className="pb-3">Collection Type</th>
                <th className="pb-3">Captured At</th>
                <th className="pb-3 text-center">Sync Status</th>
                <th className="pb-3">Last Sync</th>
                <th className="pb-3 text-center">Data Quality</th>
                <th className="pb-3 text-center">Review Status</th>
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
                      {row.ent}
                    </span>
                  </td>
                  <td className="py-3.5 text-[11px] font-semibold text-gray-700">{row.officer}</td>
                  <td className="py-3.5 text-[11px] font-semibold text-gray-500">{row.dist}</td>
                  <td className="py-3.5 text-[11px] font-semibold text-gray-500">{row.type}</td>
                  
                  {/* Captured At */}
                  <td className="py-3.5 text-[10px] font-semibold text-gray-600">
                    {row.captured.split(' (')[0]} <span className="text-red-500 font-bold">({row.captured.split(' (')[1]}</span>
                  </td>

                  {/* Sync Status Badge */}
                  <td className="py-3.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold border ${row.sColor}`}>
                      {row.syncStatus}
                    </span>
                  </td>

                  {/* Last Sync */}
                  <td className="py-3.5 text-[10px] font-semibold text-gray-400">{row.lastSync}</td>

                  {/* Data Quality Badge */}
                  <td className="py-3.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold border ${row.qColor}`}>
                      {row.quality}
                    </span>
                  </td>

                  {/* Review Status Badge */}
                  <td className="py-3.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold border ${row.rColor}`}>
                      {row.review}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => navigateTo('twin', row.id)} className="p-1 hover:bg-gray-100 rounded text-gray-500" title="View Digital Twin"><Eye size={12} /></button>
                      <button className="p-1 hover:bg-gray-100 rounded text-gray-500" title="Retry Sync"><RotateCw size={12} /></button>
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
            Showing 1 to {filteredDirectory.length} of 612 records
          </span>

          <div className="flex items-center gap-1 self-end sm:self-auto">
            <button className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-400 bg-white" disabled>&lt;</button>
            <button className="px-3 py-1.5 bg-green-50 border border-green-100 text-green-700 rounded-lg text-[10px] font-black">1</button>
            <button className="px-3 py-1.5 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500 bg-white hover:bg-gray-50">2</button>
            <button className="px-3 py-1.5 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500 bg-white hover:bg-gray-50">3</button>
            <span className="px-1.5 text-gray-400 text-[10px]">...</span>
            <button className="px-3 py-1.5 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500 bg-white hover:bg-gray-50">103</button>
            <button className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-500 bg-white hover:bg-gray-50">&gt;</button>
          </div>
        </div>

      </div>

    </div>
  );
}
