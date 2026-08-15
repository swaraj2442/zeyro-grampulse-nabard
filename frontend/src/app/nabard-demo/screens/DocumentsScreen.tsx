"use client";

import React, { useState, useMemo } from 'react';
import { 
  Filter, Download, RefreshCw, Sparkles, TrendingUp, TrendingDown,
  Activity, ArrowUpRight, ArrowDownRight, ArrowRight, Wallet, AlertTriangle, 
  Banknote, Target, ChevronRight, Play, Eye, MoreVertical, LayoutTemplate, 
  Calendar, FileText, CheckCircle2, CloudRain, Clock, Users, FileSpreadsheet, Search,
  ChevronDown, HelpCircle, Thermometer, ShieldAlert, BarChart2, Droplets, UploadCloud,
  FileCode, Image, FileImage, ShieldCheck, MailOpen, Upload
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

const CATEGORIES = [
  {
    title: 'KYC Documents',
    icon: FileText,
    iconColor: 'text-green-600 bg-green-50 border-green-100',
    count: '4,126',
    verified: 2984,
    pending: 612,
    missing: 530,
    pct: 92
  },
  {
    title: 'Loan Documents',
    icon: FileText,
    iconColor: 'text-blue-600 bg-blue-50 border-blue-100',
    count: '2,846',
    verified: 2102,
    pending: 384,
    missing: 360,
    pct: 88
  },
  {
    title: 'Statements',
    icon: FileText,
    iconColor: 'text-purple-600 bg-purple-50 border-purple-100',
    count: '2,756',
    verified: 2201,
    pending: 324,
    missing: 231,
    pct: 90
  },
  {
    title: 'Photos',
    icon: Image,
    iconColor: 'text-orange-600 bg-orange-50 border-orange-100',
    count: '1,856',
    verified: 1512,
    pending: 238,
    missing: 231,
    pct: 87
  },
  {
    title: 'Other Documents',
    icon: FileCode,
    iconColor: 'text-slate-600 bg-slate-50 border-slate-100',
    count: '1,262',
    verified: 943,
    pending: 284,
    missing: 35,
    pct: 91
  },
];

const DIRECTORY_DATA = [
  { id: '1', name: 'PAN Card', ent: 'Shree Ganesh Dairy', type: 'KYC Document', uploadedBy: 'Rahul More (FO)', subDate: 'May 24, 2024 11:20 AM', ver: 'Verified', vColor: 'text-green-700 bg-green-50 border-green-100', ext: 'Extracted', eColor: 'text-green-700 bg-green-50 border-green-100', status: 'Active', sColor: 'text-green-700 bg-green-50 border-green-100', lastUpdate: 'May 24, 2024 11:25 AM' },
  { id: '2', name: 'Bank Statement - Apr 2024', ent: 'Sai Agri Producers Co.', type: 'Statement', uploadedBy: 'Sneha Jadhav (FO)', subDate: 'May 24, 2024 10:05 AM', ver: 'Pending Review', vColor: 'text-orange-700 bg-orange-50 border-orange-100', ext: 'Extracted', eColor: 'text-green-700 bg-green-50 border-green-100', status: 'Active', sColor: 'text-green-700 bg-green-50 border-green-100', lastUpdate: 'May 24, 2024 10:08 AM' },
  { id: '3', name: 'Loan Agreement', ent: 'Maa Bhavani Traders', type: 'Loan Document', uploadedBy: 'Anil Patil (FO)', subDate: 'May 23, 2024 04:45 PM', ver: 'Pending Review', vColor: 'text-orange-700 bg-orange-50 border-orange-100', ext: 'Partial', eColor: 'text-orange-700 bg-orange-50 border-orange-100', status: 'Active', sColor: 'text-green-700 bg-green-50 border-green-100', lastUpdate: 'May 23, 2024 05:00 PM' },
  { id: '4', name: 'Income Proof', ent: 'Rural Mart Services', type: 'KYC Document', uploadedBy: 'Priya S. (FO)', subDate: 'May 23, 2024 03:30 PM', ver: 'Missing', vColor: 'text-red-700 bg-red-50 border-red-100', ext: '—', eColor: 'text-gray-400 bg-gray-50 border-gray-100', status: 'Missing', sColor: 'text-red-700 bg-red-50 border-red-100', lastUpdate: 'May 23, 2024 03:30 PM' },
  { id: '5', name: 'Electricity Bill', ent: 'Rajesh Kirana Stores', type: 'KYC Document', uploadedBy: 'Vijay Patil (FO)', subDate: 'May 22, 2024 02:15 PM', ver: 'Verified', vColor: 'text-green-700 bg-green-50 border-green-100', ext: 'Extracted', eColor: 'text-green-700 bg-green-50 border-green-100', status: 'Active', sColor: 'text-green-700 bg-green-50 border-green-100', lastUpdate: 'May 22, 2024 02:20 PM' },
  { id: '6', name: 'Cashflow Sheet - May 2024', ent: 'Shiv Shakti Enterprises', type: 'Other Document', uploadedBy: 'Mahesh K. (FO)', subDate: 'May 22, 2024 01:40 PM', ver: 'Pending Review', vColor: 'text-orange-700 bg-orange-50 border-orange-100', ext: 'Extracted', eColor: 'text-green-700 bg-green-50 border-green-100', status: 'Active', sColor: 'text-green-700 bg-green-50 border-green-100', lastUpdate: 'May 22, 2024 01:45 PM' },
];

export default function DocumentsScreen({ navigateTo }: Props) {
  const [search, setSearch] = useState('');

  const filteredDirectory = useMemo(() => {
    return DIRECTORY_DATA.filter(d => 
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.ent.toLowerCase().includes(search.toLowerCase()) ||
      d.uploadedBy.toLowerCase().includes(search.toLowerCase()) ||
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
             <span className="text-gray-900">Documents</span>
          </div>
          <h1 className="text-[20px] font-extrabold text-gray-900 leading-none">Documents</h1>
          <p className="text-[11px] font-medium text-gray-400 mt-1">
             Manage, review and analyze enterprise documents with AI-powered extraction and verification.
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

      {/* 1. AI Document Summary */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-[#f0fdf4] border border-green-100 flex items-center justify-center shrink-0">
              <div className="relative">
                <FileText size={22} className="text-green-700" />
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[7px] font-black px-0.5 rounded leading-none">AI</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Total Documents</span>
                <span className="text-gray-900 font-bold text-[18px] flex items-baseline gap-1">
                  12,846 <span className="text-[9px] font-bold text-green-600">↑ 1,268 vs last week</span>
                </span>
              </div>
              <p className="text-[12px] text-gray-700 leading-relaxed font-bold">
                 AI Insight: KYC documents are missing for 732 enterprises. 126 documents require verification due to data inconsistencies.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 lg:flex lg:items-center gap-6 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100 pt-5 lg:pt-0 lg:pl-6">
            <div className="min-w-[90px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">Pending Verification</div>
              <div className="text-[18px] font-black text-gray-900 mt-0.5">1,842</div>
              <div className="text-[9px] font-bold text-red-500">↑ 156 vs last week</div>
            </div>
            <div className="min-w-[90px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">Missing Documents</div>
              <div className="text-[18px] font-black text-gray-900 mt-0.5">732</div>
              <div className="text-[9px] font-bold text-red-500">↑ 48 vs last week</div>
            </div>
            <div className="min-w-[90px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">Recently Added</div>
              <div className="text-[18px] font-black text-gray-900 mt-0.5">864</div>
              <div className="text-[9px] font-bold text-green-600">↑ 214 vs last week</div>
            </div>
            <div className="min-w-[90px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">AI Extraction Status</div>
              <div className="text-[18px] font-black text-gray-900 mt-0.5">89.6%</div>
              <div className="text-[9px] font-bold text-green-600">↑ 4.2 pts vs last week</div>
            </div>
            <div className="min-w-[90px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">Document Health</div>
              <div className="text-[18px] font-black text-green-700 mt-0.5">Good</div>
              <div className="text-[9px] font-bold text-green-600">91.2% healthy</div>
            </div>
          </div>

          <div className="shrink-0 flex items-center self-stretch lg:border-l border-gray-100 lg:pl-6">
            <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-700 bg-white hover:bg-gray-50 ml-auto">
              Explain <ChevronDown size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Document KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { title: 'Total Documents', val: '12,846', trend: '↑ 10.8% vs last week', trendCol: 'text-green-600 bg-green-50 border-green-100', spark: MINI_CHART_DATA_1, color: '#10b981' },
          { title: 'Verified', val: '8,742', trend: '↑ 12.3% vs last week', trendCol: 'text-green-600 bg-green-50 border-green-100', spark: MINI_CHART_DATA_2, color: '#10b981' },
          { title: 'Pending Review', val: '1,842', trend: '↑ 9.6% vs last week', trendCol: 'text-purple-600 bg-purple-50 border-purple-100', spark: MINI_CHART_DATA_2, color: '#a855f7' },
          { title: 'Missing', val: '732', trend: '↑ 6.1% vs last week', trendCol: 'text-red-600 bg-red-50 border-red-100', spark: MINI_CHART_DATA_3, color: '#ef4444' },
          { title: 'Extraction Complete', val: '11,502', trend: '↑ 11.2% vs last week', trendCol: 'text-blue-600 bg-blue-50 border-blue-100', spark: MINI_CHART_DATA_1, color: '#3b82f6' },
          { title: 'Requiring Attention', val: '1,126', trend: '↑ 8.7% vs last week', trendCol: 'text-orange-600 bg-orange-50 border-orange-100', spark: MINI_CHART_DATA_2, color: '#f97316' },
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

      {/* 3. Document Workspace & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Workspace (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-extrabold text-gray-900">Document Workspace</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
            {CATEGORIES.map((cat, i) => (
              <div key={i} className="bg-white border border-gray-100 hover:border-gray-200 rounded-2xl p-4 flex flex-col justify-between min-h-[220px] transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${cat.iconColor}`}>
                      <cat.icon size={16} />
                    </div>
                  </div>

                  <span className="text-[12px] font-black text-gray-900 block leading-tight">{cat.title}</span>
                  <span className="text-[18px] font-black text-gray-800 block mt-2">{cat.count} <span className="text-[9px] font-bold text-gray-400">Docs</span></span>

                  <div className="mt-4 space-y-1.5 text-[9px] font-semibold text-gray-500">
                    <div className="flex justify-between"><span>Verified:</span><span className="text-gray-900 font-bold">{cat.verified}</span></div>
                    <div className="flex justify-between"><span>Pending Review:</span><span className="text-orange-500 font-bold">{cat.pending}</span></div>
                    <div className="flex justify-between"><span>Missing:</span><span className="text-red-500 font-bold">{cat.missing}</span></div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-50">
                  <div className="flex justify-between items-center text-[9px] font-extrabold text-gray-400 uppercase mb-1">
                    <span>Extraction</span>
                    <span className="text-green-600">{cat.pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-600 rounded-full" style={{ width: `${cat.pct}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="text-[10px] font-bold text-green-700 hover:underline flex items-center gap-1">
            View all categories <ArrowRight size={10} />
          </button>
        </div>

        {/* Right: AI Document Insights (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-extrabold text-gray-900">AI Document Insights</h3>
            <button className="text-green-700 text-[10px] font-bold hover:underline">View all insights</button>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {[
              { icon: AlertTriangle, text: 'KYC missing for 732 enterprises. PAN card or Address proof is missing.', color: 'text-red-500 bg-red-50 border-red-100', val: '92% Confidence', act: 'Request document', actCol: 'text-green-700 hover:text-green-800' },
              { icon: HelpCircle, text: '126 documents require verification. Possible data inconsistency detected.', color: 'text-orange-500 bg-orange-50 border-orange-100', val: '81% Confidence', act: 'Review now', actCol: 'text-green-700 hover:text-green-800' },
              { icon: CheckCircle2, text: 'Bank statement extraction completed. AI extracted 98.4% of key transaction fields.', color: 'text-green-500 bg-green-50 border-green-100', val: '95% Confidence', act: 'View extraction', actCol: 'text-green-700 hover:text-green-800' },
              { icon: Clock, text: 'Income documents may be outdated. 98 income proofs are older than 12 months.', color: 'text-orange-500 bg-orange-50 border-orange-100', val: '76% Confidence', act: 'Request updated', actCol: 'text-green-700 hover:text-green-800' },
              { icon: Users, text: '3 loan agreements pending upload. Enterprises with active loans missing documents.', color: 'text-blue-500 bg-blue-50 border-blue-100', val: '88% Confidence', act: 'Upload now', actCol: 'text-green-700 hover:text-green-800' }
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
                    <button className={`text-[8px] font-extrabold ${item.actCol} hover:underline`}>{item.act} →</button>
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
          { title: 'Upload Document', sub: 'Upload new document', icon: UploadCloud, color: 'text-blue-500 bg-blue-50 border-blue-100' },
          { title: 'Request Document', sub: 'Request from field officer', icon: MailOpen, color: 'text-green-700 bg-green-50 border-green-100' },
          { title: 'Review Extraction', sub: 'Validate AI extracted data', icon: Eye, color: 'text-orange-700 bg-orange-50 border-orange-100' },
          { title: 'Verify Document', sub: 'Approve document', icon: ShieldCheck, color: 'text-blue-700 bg-blue-50 border-blue-100' },
          { title: 'View Enterprise Twin', sub: 'Open enterprise profile', icon: Users, color: 'text-purple-700 bg-purple-50 border-purple-100' },
          { title: 'Generate Report', sub: 'Document summary report', icon: FileSpreadsheet, color: 'text-slate-700 bg-slate-50 border-slate-100' },
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

      {/* 6. Document Directory (Table) */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-[13px] font-extrabold text-gray-900">Document Directory</h3>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search documents, enterprises..." 
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
                <th className="pb-3">Document</th>
                <th className="pb-3">Enterprise</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Uploaded By</th>
                <th className="pb-3">Uploaded On</th>
                <th className="pb-3 text-center">Verification</th>
                <th className="pb-3 text-center">AI Extraction</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3">Last Updated</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredDirectory.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3.5"><input type="checkbox" className="rounded" /></td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-gray-400 shrink-0" />
                      <span 
                        onClick={() => navigateTo('twin', row.id)}
                        className="text-[11px] font-bold text-gray-800 hover:text-green-700 cursor-pointer hover:underline truncate max-w-[150px]"
                        title={row.name}
                      >
                        {row.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 text-[11px] font-semibold text-gray-500">{row.ent}</td>
                  <td className="py-3.5 text-[11px] font-semibold text-gray-500">{row.type}</td>
                  
                  {/* Uploaded By */}
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[9px] font-extrabold text-emerald-800 shrink-0">RD</div>
                      <span className="text-[11px] font-semibold text-gray-700">{row.uploadedBy}</span>
                    </div>
                  </td>

                  {/* Uploaded On */}
                  <td className="py-3.5 text-[10px] font-semibold text-gray-400">{row.subDate}</td>

                  {/* Verification Badge */}
                  <td className="py-3.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold border ${row.vColor}`}>
                      {row.ver}
                    </span>
                  </td>

                  {/* AI Extraction Badge */}
                  <td className="py-3.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold border ${row.eColor}`}>
                      {row.ext}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold border ${row.sColor}`}>
                      {row.status}
                    </span>
                  </td>

                  {/* Last Updated */}
                  <td className="py-3.5 text-[10px] font-semibold text-gray-400">{row.lastUpdate}</td>

                  {/* Actions */}
                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => navigateTo('twin', row.id)} className="p-1 hover:bg-gray-100 rounded text-gray-500" title="View Digital Twin"><Eye size={12} /></button>
                      <button className="p-1 hover:bg-gray-100 rounded text-gray-500" title="Download Document"><Download size={12} /></button>
                      <button className="p-1 hover:bg-gray-100 rounded text-gray-500" title="Upload Document"><Upload size={12} /></button>
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
            Showing 1 to {filteredDirectory.length} of 12,846 documents
          </span>

          <div className="flex items-center gap-1 self-end sm:self-auto">
            <button className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-400 bg-white" disabled>&lt;</button>
            <button className="px-3 py-1.5 bg-green-50 border border-green-100 text-green-700 rounded-lg text-[10px] font-black">1</button>
            <button className="px-3 py-1.5 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500 bg-white hover:bg-gray-50">2</button>
            <button className="px-3 py-1.5 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500 bg-white hover:bg-gray-50">3</button>
            <span className="px-1.5 text-gray-400 text-[10px]">...</span>
            <button className="px-3 py-1.5 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500 bg-white hover:bg-gray-50">2141</button>
            <button className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-500 bg-white hover:bg-gray-50">&gt;</button>
          </div>
        </div>

      </div>

    </div>
  );
}
