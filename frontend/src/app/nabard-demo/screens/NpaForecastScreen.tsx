"use client";

import React, { useState, useMemo } from 'react';
import { 
  Filter, Download, RefreshCw, Sparkles, TrendingUp, TrendingDown,
  Activity, ArrowUpRight, ArrowDownRight, ArrowRight, Wallet, AlertTriangle, 
  Banknote, Target, ChevronRight, Play, Eye, MoreVertical, LayoutTemplate, 
  Calendar, FileText, CheckCircle2, CloudRain, Clock, Users, FileSpreadsheet, Search,
  ChevronDown, HelpCircle, Thermometer, ShieldAlert, BarChart2, Droplets, Percent, ShieldCheck, ShoppingBag
} from 'lucide-react';
import { 
  ComposedChart, LineChart, Line, Area, XAxis, YAxis, CartesianGrid, 
  ResponsiveContainer, ReferenceLine, ReferenceArea, Tooltip, Bar, Cell,
  PieChart, Pie, BarChart
} from 'recharts';
import { Screen } from '../GramPulseApp';

interface Props {
  navigateTo: (s: Screen, ent?: string) => void;
}

// --- MOCK DATA ---

const MINI_CHART_DATA_1 = [{val: 20}, {val: 25}, {val: 22}, {val: 30}, {val: 28}, {val: 35}];
const MINI_CHART_DATA_2 = [{val: 40}, {val: 35}, {val: 50}, {val: 45}, {val: 60}, {val: 55}];
const MINI_CHART_DATA_3 = [{val: 50}, {val: 45}, {val: 40}, {val: 30}, {val: 25}, {val: 20}];

const NPA_PROJECTION_DATA = [
  { name: 'Now', val: 1.5, min: 1.2, max: 1.8 },
  { name: '30D', val: 2.2, min: 1.8, max: 2.6 },
  { name: '90D', val: 2.7, min: 2.1, max: 3.3 },
  { name: '180D', val: 3.1, min: 2.4, max: 3.8 },
  { name: '365D', val: 3.42, min: 2.6, max: 4.2 },
];

const DELINQUENCY_PROGRESSION = [
  { name: 'New', current: 75, early: 15, delinquent: 6, high: 3, npa: 1 },
  { name: '30 Days', current: 65, early: 18, delinquent: 10, high: 5, npa: 2 },
  { name: '90 Days', current: 55, early: 20, delinquent: 12, high: 9, npa: 4 },
  { name: '180 Days', current: 48, early: 22, delinquent: 15, high: 10, npa: 5 },
  { name: '365 Days', current: 40, early: 25, delinquent: 18, high: 11, npa: 6 },
];

const DRIVERS = [
  { name: 'Repayment Behaviour', val: 2.12, status: 'High', color: 'bg-red-500' },
  { name: 'Cashflow Stability', val: 1.08, status: 'High', color: 'bg-red-500' },
  { name: 'Income Volatility', val: 0.74, status: 'Medium', color: 'bg-orange-500' },
  { name: 'Climate Impact', val: 0.46, status: 'Medium', color: 'bg-orange-400' },
  { name: 'Market Conditions', val: 0.32, status: 'Low', color: 'bg-green-500' },
  { name: 'Operational Delays', val: 0.18, status: 'Low', color: 'bg-green-400' },
];

const SIMULATION_DATA = [
  { name: 'Now', current: 1.50, action: 1.50 },
  { name: '30D', current: 2.20, action: 2.00 },
  { name: '90D', current: 2.70, action: 2.20 },
  { name: '180D', current: 3.08, action: 2.30 },
  { name: '365D', current: 3.42, after: 2.38 },
];

const RISK_DISTRIBUTION = [
  { name: 'Low Risk (0 - 0.5%)', value: 3126, color: '#10b981' },
  { name: 'Moderate Risk (0.5% - 1.5%)', value: 2654, color: '#eab308' },
  { name: 'High Risk (1.5% - 5%)', value: 1892, color: '#f97316' },
  { name: 'Critical Risk (> 5%)', value: 970, color: '#dc2626' },
];

const TIMELINE = [
  {
    title: '30 Days Outlook',
    badge: 'Moderate Risk',
    badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    metrics: [
      { label: 'NPA Rate', val: '2.20%', color: 'text-yellow-600 font-bold' },
      { label: 'High-Risk', val: '612', color: 'text-gray-900' },
      { label: 'Recovery Prob.', val: '66%', color: 'text-gray-900 font-bold' },
      { label: 'AI Conf.', val: 'Moderate', color: 'text-yellow-600' },
    ],
    action: 'Monitor'
  },
  {
    title: '90 Days Outlook',
    badge: 'High Risk',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    metrics: [
      { label: 'NPA Rate', val: '2.70%', color: 'text-orange-600 font-bold' },
      { label: 'High-Risk', val: '1,284', color: 'text-gray-900' },
      { label: 'Recovery Prob.', val: '63%', color: 'text-gray-900 font-bold' },
      { label: 'AI Conf.', val: 'High', color: 'text-green-600' },
    ],
    action: 'Review'
  },
  {
    title: '180 Days Outlook',
    badge: 'High Risk',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    metrics: [
      { label: 'NPA Rate', val: '3.08%', color: 'text-orange-600 font-bold' },
      { label: 'High-Risk', val: '1,876', color: 'text-gray-900' },
      { label: 'Recovery Prob.', val: '60%', color: 'text-gray-900 font-bold' },
      { label: 'AI Conf.', val: 'High', color: 'text-green-600' },
    ],
    action: 'Intervene'
  },
  {
    title: '365 Days Outlook',
    badge: 'Severe Risk',
    badgeColor: 'bg-red-100 text-red-800 border-red-200',
    metrics: [
      { label: 'NPA Rate', val: '3.42%', color: 'text-red-600 font-bold' },
      { label: 'High-Risk', val: '2,516', color: 'text-gray-900' },
      { label: 'Recovery Prob.', val: '61%', color: 'text-gray-900 font-bold' },
      { label: 'AI Conf.', val: 'Critical', color: 'text-red-600 font-bold' },
    ],
    action: 'Monitor'
  },
];

const ACTIONS = [
  { title: 'Review High-Risk enterprises', sub: 'Deep dive into enterprises', icon: Target },
  { title: 'Create Intervention Plan', sub: 'Design preventive actions', icon: FileText },
  { title: 'Schedule Field Visit', sub: 'Visit top risk enterprises', icon: Calendar },
  { title: 'Adjust Lending Strategy', sub: 'Reduce risk exposure', icon: BarChart2 },
  { title: 'Generate NPA Forecast Report', sub: 'Download detailed report', icon: FileSpreadsheet },
  { title: 'Run Scenario Simulation', sub: 'Compare what-if scenarios', icon: Play },
];

const ENTERPRISES = [
  { id: '1', name: 'Shree Ganesh Dairy', dist: 'Satara', status: 'Repaying', prob: '6.24%', level: 'Critical', lColor: 'text-red-700 bg-red-50 border-red-100', rec: 'Immediate Intervention', recColor: 'text-red-700 bg-red-50 border-red-100', recovery: '32%', conf: '88%', lastUpdate: 'May 24, 2024 08:15 AM' },
  { id: '2', name: 'Sai Agri Producers Co.', dist: 'Sangli', sector: 'Agriculture', status: 'Delinquent (31-90 Days)', prob: '4.82%', level: 'High', lColor: 'text-red-600 bg-red-50 border-red-100', rec: 'Create Repayment Plan', recColor: 'text-orange-700 bg-orange-50 border-orange-100', recovery: '41%', conf: '86%', lastUpdate: 'May 24, 2024 08:15 AM' },
  { id: '3', name: 'Maa Bhavani Traders', dist: 'Pune', sector: 'Food Processing', status: 'Delinquent (1-30 Days)', prob: '3.12%', level: 'High', lColor: 'text-red-600 bg-red-50 border-red-100', rec: 'Monitor Closely', recColor: 'text-yellow-700 bg-yellow-50 border-yellow-100', recovery: '55%', conf: '85%', lastUpdate: 'May 24, 2024 08:15 AM' },
  { id: '4', name: 'Rural Mart Services', dist: 'Kolhapur', sector: 'Rural Retail', status: 'Repaying', prob: '0.78%', level: 'Low', lColor: 'text-green-700 bg-green-50 border-green-100', rec: 'Continue Monitoring', recColor: 'text-green-700 bg-green-50 border-green-100', recovery: '83%', conf: '88%', lastUpdate: 'May 24, 2024 08:15 AM' },
  { id: '5', name: 'Vijay Kiran Stores', dist: 'Solapur', sector: 'Agriculture', status: 'Delinquent (61-90 Days)', prob: '5.92%', level: 'Critical', lColor: 'text-red-700 bg-red-50 border-red-100', rec: 'Immediate Intervention', recColor: 'text-red-700 bg-red-50 border-red-100', recovery: '28%', conf: '90%', lastUpdate: 'May 24, 2024 08:15 AM' },
];

const DISTRICT_GEO_MOCK = [
  { name: 'Jalna', x: 230, y: 150, risk: 'Critical', score: 0.78, rain: '-18%', index: 0.72, impact: '₹ 8.6 Cr', color: '#dc2626' },
  { name: 'Beed', x: 210, y: 190, risk: 'Critical', score: 0.82, rain: '-24%', index: 0.78, impact: '₹ 11.2 Cr', color: '#dc2626' },
  { name: 'Nashik', x: 100, y: 110, risk: 'High', score: 0.68, rain: '-14%', index: 0.64, impact: '₹ 14.2 Cr', color: '#ea580c' },
  { name: 'Aurangabad', x: 170, y: 120, risk: 'High', score: 0.71, rain: '-16%', index: 0.68, impact: '₹ 10.4 Cr', color: '#ea580c' },
  { name: 'Jalgaon', x: 160, y: 70, risk: 'High', score: 0.65, rain: '-11%', index: 0.60, impact: '₹ 9.2 Cr', color: '#ea580c' },
  { name: 'Latur', x: 280, y: 230, risk: 'High', score: 0.69, rain: '-15%', index: 0.65, impact: '₹ 7.8 Cr', color: '#ea580c' },
  { name: 'Parbhani', x: 280, y: 170, risk: 'Moderate', score: 0.58, rain: '-8%', index: 0.52, impact: '₹ 6.4 Cr', color: '#eab308' },
  { name: 'Nanded', x: 330, y: 190, risk: 'Moderate', score: 0.52, rain: '-5%', index: 0.48, impact: '₹ 5.8 Cr', color: '#eab308' },
  { name: 'Pune Rural', x: 90, y: 210, risk: 'Low', score: 0.38, rain: '+8%', index: 0.32, impact: '₹ 3.1 Cr', color: '#10b981' },
  { name: 'Satara', x: 80, y: 260, risk: 'Low', score: 0.35, rain: '+12%', index: 0.28, impact: '₹ 2.4 Cr', color: '#10b981' },
  { name: 'Kolhapur', x: 80, y: 310, risk: 'Low', score: 0.28, rain: '+15%', index: 0.22, impact: '₹ 1.8 Cr', color: '#10b981' },
];

export default function NpaForecastScreen({ navigateTo }: Props) {
  const [search, setSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>('Jalna');
  const [zoomLevel, setZoomLevel] = useState(1);

  const activeDistrictInfo = useMemo(() => {
    return DISTRICT_GEO_MOCK.find(d => d.name === selectedDistrict) || DISTRICT_GEO_MOCK[0];
  }, [selectedDistrict]);

  const filteredEnterprises = useMemo(() => {
    return ENTERPRISES.filter(e => 
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.dist.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="space-y-5 pb-12 w-full max-w-[1600px] mx-auto overflow-x-hidden">
      
      {/* Breadcrumb & Top Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
             <span>Forecasting</span>
             <span className="text-gray-300 font-normal">/</span>
             <span className="text-gray-900">NPA Forecast</span>
          </div>
          <h1 className="text-[20px] font-extrabold text-gray-900 leading-none">NPA Forecast</h1>
          <p className="text-[11px] font-medium text-gray-400 mt-1">
             AI-powered prediction of future portfolio delinquency and non-performing asset risk across 30, 90, 180 and 365-day horizons.
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

      {/* 1. AI NPA Summary */}
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
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Predicted Portfolio NPA (365 Days)</span>
                <span className="text-red-600 font-bold text-[13px] flex items-center gap-1">
                  3.42% <span className="text-[9px] font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">↑ 0.48 pts vs last forecast</span>
                </span>
              </div>
              <p className="text-[12px] text-gray-700 leading-relaxed font-bold">
                 AI Insight: NPA rate is expected to increase to 3.42% in 365 days. Repayment behaviour and cashflow instability are the key drivers. 
                 1,284 enterprises are at high risk and require proactive intervention.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:items-center gap-6 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100 pt-5 lg:pt-0 lg:pl-6">
            <div className="min-w-[90px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">High-Risk Enterprises</div>
              <div className="text-[18px] font-black text-gray-900 mt-0.5">1,284</div>
              <div className="text-[9px] font-bold text-red-500">↑ 164 vs last forecast</div>
            </div>
            <div className="min-w-[90px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">Forecast Horizon</div>
              <div className="text-[18px] font-black text-gray-900 mt-0.5">365 Days</div>
              <div className="text-[9px] font-bold text-gray-500">Multiple horizon prediction</div>
            </div>
            <div className="min-w-[90px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">AI Confidence</div>
              <div className="text-[18px] font-black text-gray-900 mt-0.5">86%</div>
              <div className="text-[9px] font-bold text-green-600">High confidence</div>
            </div>
            <div className="min-w-[95px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">Primary Default Driver</div>
              <div className="text-[18px] font-black text-gray-900 mt-0.5">Repayment Behaviour</div>
              <div className="text-[9px] font-bold text-orange-500">Weakening repayment patterns</div>
            </div>
          </div>

          <div className="shrink-0 flex items-center self-stretch lg:border-l border-gray-100 lg:pl-6">
            <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-700 bg-white hover:bg-gray-50 ml-auto">
              Explain <ChevronDown size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. NPA Forecast KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { 
            title: 'Forecasted NPA Rate', 
            sub: '(365 Days)', 
            val: '3.42%', 
            trend: '↑ 0.48 pts vs last', 
            trendCol: 'text-red-600 bg-red-50 border-red-100', 
            spark: MINI_CHART_DATA_1, 
            sparkColor: '#ef4444' 
          },
          { 
            title: 'High-Risk Enterprises', 
            sub: 'Active Risk List', 
            val: '1,284', 
            trend: '↑ 164 vs last forecast', 
            trendCol: 'text-red-600 bg-red-50 border-red-100', 
            spark: MINI_CHART_DATA_2, 
            sparkColor: '#ef4444' 
          },
          { 
            title: 'Watchlist Enterprises', 
            sub: 'Stage 2 Assets', 
            val: '2,816', 
            trend: '↑ 221 vs last forecast', 
            trendCol: 'text-orange-600 bg-orange-50 border-orange-100', 
            spark: MINI_CHART_DATA_2, 
            sparkColor: '#f97316' 
          },
          { 
            title: 'Expected Recovery Rate', 
            sub: 'Post-Default Recovery', 
            val: '61.3%', 
            trend: '↑ 3.6 pts vs last forecast', 
            trendCol: 'text-green-600 bg-green-50 border-green-100', 
            spark: MINI_CHART_DATA_3, 
            sparkColor: '#10b981' 
          },
          { 
            title: 'Portfolio Risk Exposure', 
            sub: 'Estimated Exposure at Default', 
            val: '₹ 124.6 Cr', 
            trend: '↑ ₹ 18.2 Cr vs last', 
            trendCol: 'text-red-600 bg-red-50 border-red-100', 
            spark: MINI_CHART_DATA_1, 
            sparkColor: '#ef4444' 
          },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white border border-gray-100 rounded-[28px] p-4 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between h-[105px]">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-gray-500 block leading-tight">{kpi.title}</span>
                <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-wider block mt-0.5">{kpi.sub}</span>
              </div>
            </div>
            
            <div className="flex items-end justify-between gap-2">
              <div>
                <span className="text-[18px] font-black text-gray-900 block leading-none mb-1.5">{kpi.val}</span>
                <span className={`inline-flex items-center text-[8px] font-extrabold px-1.5 py-0.5 rounded-full border ${kpi.trendCol}`}>
                  {kpi.trend}
                </span>
              </div>
              <div className="h-6 w-16 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={kpi.spark}>
                    <Line type="monotone" dataKey="val" stroke={kpi.sparkColor} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. NPA Forecast Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Workspace Column: Charts & Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          <div className="bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
            <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">NPA Forecast Workspace</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Chart 1: Portfolio NPA Projection */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold text-gray-800">Portfolio NPA Projection</span>
                  <div className="flex items-center gap-1.5 text-[8px] font-bold text-gray-400">
                    <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full"></span> Forecast
                  </div>
                </div>
                <div className="h-[120px] w-full bg-gray-50/50 rounded-2xl p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={NPA_PROJECTION_DATA} margin={{ top: 5, right: 5, left: -25, bottom: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 6]} ticks={[1, 2, 3, 4, 5, 6]} tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                      <Area dataKey="max" stroke="none" fill="#fee2e2" fillOpacity={0.4} />
                      <Area dataKey="min" stroke="none" fill="#ffffff" fillOpacity={1.0} />
                      <Line type="monotone" dataKey="val" stroke="#dc2626" strokeWidth={1.5} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Delinquency Progression Forecast */}
              <div className="flex flex-col col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold text-gray-800">Delinquency Progression Forecast</span>
                  <div className="flex items-center gap-1.5 text-[7px] font-bold text-gray-400">
                    <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full"></span> Cur
                    <span className="inline-block w-1.5 h-1.5 bg-yellow-400 rounded-full"></span> EW
                    <span className="inline-block w-1.5 h-1.5 bg-orange-400 rounded-full"></span> Del
                    <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full"></span> High
                    <span className="inline-block w-1.5 h-1.5 bg-red-700 rounded-full"></span> NPA
                  </div>
                </div>
                <div className="h-[120px] w-full bg-gray-50/50 rounded-2xl p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={DELINQUENCY_PROGRESSION} layout="vertical" margin={{ top: 5, right: 5, left: -20, bottom: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                      <Bar dataKey="current" stackId="a" fill="#10b981" barSize={8} />
                      <Bar dataKey="early" stackId="a" fill="#eab308" />
                      <Bar dataKey="delinquent" stackId="a" fill="#f97316" />
                      <Bar dataKey="high" stackId="a" fill="#ef4444" />
                      <Bar dataKey="npa" stackId="a" fill="#7f1d1d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Risk Driver Breakdown */}
            <div className="bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <h3 className="text-[12px] font-extrabold text-gray-900 mb-4">Risk Driver Breakdown</h3>
              <div className="space-y-3 flex-1 flex flex-col justify-center">
                {DRIVERS.map((driver, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-[9px] font-bold text-gray-600">
                      <span>{driver.name}</span>
                      <span className="text-gray-900">+{driver.val} pts</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${driver.color}`} style={{ width: `${(driver.val / 2.5) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Intervention Impact Simulation */}
            <div className="bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[12px] font-extrabold text-gray-900">Intervention Impact Simulation</h3>
              </div>
              <div className="h-[120px] w-full bg-gray-50/50 rounded-2xl p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={SIMULATION_DATA} margin={{ top: 5, right: 5, left: -25, bottom: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 4]} ticks={[1, 2, 3, 4]} tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                    <Line type="monotone" dataKey="current" stroke="#dc2626" strokeWidth={1.5} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="action" stroke="#10b981" strokeWidth={1.5} strokeDasharray="3 3" dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[8px] font-semibold text-gray-400 mt-2 flex justify-between">
                <span>Projection: <strong className="text-red-500">3.42%</strong></span>
                <span>With Intervention: <strong className="text-green-600">2.38%</strong></span>
              </div>
            </div>

            {/* Risk Distribution by Enterprise */}
            <div className="bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <h3 className="text-[12px] font-extrabold text-gray-900 mb-3">Risk Distribution by Enterprise</h3>
              
              <div className="flex items-center justify-center h-[90px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={RISK_DISTRIBUTION}
                      innerRadius={25}
                      outerRadius={38}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {RISK_DISTRIBUTION.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[12px] font-black text-gray-900 leading-none">8,642</span>
                  <span className="text-[7px] font-bold text-gray-400 mt-0.5">Total</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[8px] font-extrabold text-gray-500 mt-2">
                {RISK_DISTRIBUTION.map((item, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: item.color }}></span>
                    <span className="truncate">{item.name.split(' (')[0]}: <strong>{Math.round((item.value / 8642) * 100)}%</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Middle Column: Interactive Heatmap (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] relative">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[13px] font-extrabold text-gray-900">District Risk Heatmap</h3>
                <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block mt-0.5">Predicted NPA Risk - 365 Days</span>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.15))} className="w-6 h-6 border border-gray-200 rounded-lg flex items-center justify-center text-[12px] font-bold hover:bg-gray-50">-</button>
                <button onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.15))} className="w-6 h-6 border border-gray-200 rounded-lg flex items-center justify-center text-[12px] font-bold hover:bg-gray-50">+</button>
              </div>
            </div>

            {/* Interactive SVG Heatmap container */}
            <div className="w-full h-[320px] bg-slate-50/50 rounded-2xl relative overflow-hidden flex items-center justify-center border border-slate-100">
              <svg className="w-[420px] h-[320px] transition-transform duration-300" style={{ transform: `scale(${zoomLevel})` }} viewBox="0 0 420 320">
                {/* Background Grid */}
                <path d="M 0,0 L 420,320" stroke="#f1f5f9" strokeWidth="0.5" />
                
                {/* Mock Maharashtra District Paths */}
                {DISTRICT_GEO_MOCK.map((dist, i) => (
                  <g key={i} className="cursor-pointer" onClick={() => setSelectedDistrict(dist.name)}>
                    <circle 
                      cx={dist.x} 
                      cy={dist.y} 
                      r={selectedDistrict === dist.name ? 22 : 16} 
                      fill={dist.color} 
                      fillOpacity={selectedDistrict === dist.name ? 0.85 : 0.65} 
                      stroke={selectedDistrict === dist.name ? '#ffffff' : 'transparent'}
                      strokeWidth={2}
                      className="transition-all hover:fill-opacity-90"
                    />
                    <text 
                      x={dist.x} 
                      y={dist.y + 3} 
                      textAnchor="middle" 
                      fill="#ffffff" 
                      fontSize={8} 
                      fontWeight="bold"
                      className="pointer-events-none"
                    >
                      {dist.name.substring(0, 4)}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Active District Information Tooltip */}
              {activeDistrictInfo && (
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur border border-gray-100 rounded-2xl p-3 shadow-md w-[140px] z-10">
                  <span className="text-[11px] font-black text-gray-900 block border-b border-gray-100 pb-1.5 mb-1.5">{activeDistrictInfo.name}</span>
                  <div className="space-y-1 text-[9px] font-semibold text-gray-600">
                    <div className="flex justify-between"><span>Risk Index:</span><span className="text-gray-900">{activeDistrictInfo.index}</span></div>
                    <div className="flex justify-between"><span>Rainfall Dev:</span><span className="text-red-500 font-bold">{activeDistrictInfo.rain}</span></div>
                    <div className="flex justify-between"><span>NPA Score:</span><span className="text-gray-900">{activeDistrictInfo.score}</span></div>
                    <div className="flex justify-between"><span>Exposure Impact:</span><span className="text-red-500 font-bold">{activeDistrictInfo.impact}</span></div>
                  </div>
                  <button className="text-[8px] font-extrabold text-green-700 hover:underline mt-2.5 flex items-center gap-1 w-full text-left">
                     View District Twin <ChevronRight size={8} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Map Legend */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 justify-center text-[9px] font-bold text-gray-500">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500"></span> Low</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yellow-400"></span> Moderate</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-orange-500"></span> High</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-600"></span> Critical</div>
            </div>
          </div>

        </div>

      </div>

      {/* 4. Forecast Timeline */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">Forecast Timeline</h3>
        
        <div className="relative">
          {/* Horizontal line */}
          <div className="absolute top-[45px] left-8 right-8 h-1 bg-gray-100 -z-10 rounded"></div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {TIMELINE.map((time, idx) => (
              <div key={idx} className="relative flex flex-col items-center">
                {/* Timeline node */}
                <div className="w-8 h-8 rounded-full bg-white border-4 border-green-500 shadow-sm flex items-center justify-center text-[12px] font-black text-green-700 mb-4">
                  {idx + 1}
                </div>

                {/* Content Box */}
                <div className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col justify-between min-h-[160px] transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[12px] font-black text-gray-900">{time.title}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold border ${time.badgeColor}`}>{time.badge}</span>
                    </div>

                    <div className="space-y-1.5 mb-4">
                      {time.metrics.map((met, mIdx) => (
                        <div key={mIdx} className="flex justify-between items-center text-[10px] font-semibold">
                          <span className="text-gray-400">{met.label}:</span>
                          <span className={met.color}>{met.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button className="w-full py-1.5 bg-[#16a34a] hover:bg-[#16a34a]/90 text-white rounded-xl text-[9px] font-black tracking-wide uppercase transition-all">
                    {time.action}
                  </button>
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
            <div className="w-8 h-8 rounded-xl bg-gray-50 group-hover:bg-green-50 border border-gray-100 group-hover:border-green-100 flex items-center justify-center text-gray-500 group-hover:text-green-700 transition-colors">
              <act.icon size={16} />
            </div>
            <div>
              <span className="text-[11px] font-black text-gray-900 block leading-tight group-hover:text-green-800 transition-colors">{act.title}</span>
              <span className="text-[9px] font-semibold text-gray-400 block mt-0.5">{act.sub}</span>
            </div>
          </button>
        ))}
      </div>

      {/* 6. AI NPA Insights */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[13px] font-extrabold text-gray-900">AI NPA Insights</h3>
          <button className="text-green-700 text-[10px] font-bold hover:underline">View all insights</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: AlertTriangle, text: '1,284 enterprises likely to become NPAs in next 90 days. Rising repayment delays and cashflow instability.', color: 'text-red-500 bg-red-50 border-red-100', val: '88% Confidence', actText: 'Review Now' },
            { icon: ArrowUpRight, text: 'Sangli and Solapur districts show increasing delinquency. NPA risk increased by 0.63 pts vs last forecast.', color: 'text-green-600 bg-green-50 border-green-100', val: '82% Confidence', actText: 'View Districts' },
            { icon: ShieldAlert, text: 'Repayment behaviour weakening in Retail Traders sector. Higher probability of default in next 60 days.', color: 'text-orange-500 bg-orange-50 border-orange-100', val: '79% Confidence', actText: 'Analyze Sector' },
            { icon: CloudRain, text: 'Below-normal rainfall may increase default probability. Climate stress impacting 642 enterprises.', color: 'text-blue-500 bg-blue-50 border-blue-100', val: '76% Confidence', actText: 'View Climate' },
            { icon: CheckCircle2, text: '412 enterprises likely to recover with timely intervention. High recovery probability with field engagement.', color: 'text-green-500 bg-green-50 border-green-100', val: '85% Confidence', actText: 'Prepare Plan' },
            { icon: Users, text: 'Risk clusters forming in 11 districts. Early intervention can reduce future NPA by 1.04 pts.', color: 'text-blue-500 bg-blue-50 border-blue-100', val: '84% Confidence', actText: 'View Clusters' },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col justify-between p-3.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-2xl transition-all h-[120px]">
              <div className="flex items-start gap-2.5">
                <div className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 ${item.color}`}>
                  <item.icon size={12} />
                </div>
                <span className="text-[10px] font-bold text-gray-700 leading-snug">{item.text}</span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100/50">
                <span className="text-[9px] font-extrabold text-green-600">{item.val}</span>
                <button className="text-[9px] font-extrabold text-green-700 hover:text-green-800 hover:underline flex items-center gap-0.5">
                  {item.actText} <ChevronRight size={10} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Enterprise NPA Forecast (Table) */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-[13px] font-extrabold text-gray-900">Enterprise NPA Forecast</h3>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search enterprises, districts..." 
                className="pl-8 pr-4 py-1.5 border border-gray-200 rounded-xl text-[11px] font-semibold focus:outline-none focus:border-green-300 w-[200px] transition-all bg-gray-50/50"
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
                <th className="pb-3">District</th>
                <th className="pb-3">Current Repayment Status</th>
                <th className="pb-3 text-center">Predicted NPA Probability</th>
                <th className="pb-3 text-center">Risk Level</th>
                <th className="pb-3 text-center">Recovery Probability</th>
                <th className="pb-3 text-center">Forecast Confidence</th>
                <th className="pb-3">AI Recommendation</th>
                <th className="pb-3">Last prediction Update</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredEnterprises.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3.5"><input type="checkbox" className="rounded" /></td>
                  <td className="py-3.5">
                    <span 
                      onClick={() => navigateTo('twin', row.id)}
                      className="text-[11px] font-bold text-gray-800 hover:text-green-700 cursor-pointer hover:underline"
                    >
                      {row.name}
                    </span>
                  </td>
                  <td className="py-3.5 text-[11px] font-semibold text-gray-500">{row.dist}</td>
                  <td className="py-3.5 text-[11px] font-semibold text-gray-700">{row.status}</td>
                  
                  {/* Probability */}
                  <td className="py-3.5 text-[11px] font-black text-center text-red-600">{row.prob}</td>

                  {/* Risk Level Badge */}
                  <td className="py-3.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold ${row.lColor}`}>
                      {row.level}
                    </span>
                  </td>

                  {/* Recovery Probability */}
                  <td className="py-3.5 text-[11px] font-extrabold text-gray-700 text-center">{row.recovery}</td>

                  {/* Confidence */}
                  <td className="py-3.5 text-[11px] font-bold text-green-600 text-center">{row.conf}</td>

                  {/* Recommendation */}
                  <td className="py-3.5">
                    <span className={`inline-block px-2 py-1 rounded-lg text-[9px] font-extrabold border ${row.recColor}`}>
                      {row.rec}
                    </span>
                  </td>

                  {/* Last Update */}
                  <td className="py-3.5 text-[10px] font-semibold text-gray-400">{row.lastUpdate}</td>

                  {/* Action Buttons */}
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
            Showing 1 to {filteredEnterprises.length} of {filteredEnterprises.length === ENTERPRISES.length ? '8,642' : filteredEnterprises.length} enterprises
          </span>

          <div className="flex items-center gap-1 self-end sm:self-auto">
            <button className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-400 bg-white" disabled>&lt;</button>
            <button className="px-3 py-1.5 bg-green-50 border border-green-100 text-green-700 rounded-lg text-[10px] font-black">1</button>
            <button className="px-3 py-1.5 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500 bg-white hover:bg-gray-50">2</button>
            <button className="px-3 py-1.5 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500 bg-white hover:bg-gray-50">3</button>
            <span className="px-1.5 text-gray-400 text-[10px]">...</span>
            <button className="px-3 py-1.5 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500 bg-white hover:bg-gray-50">1729</button>
            <button className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-500 bg-white hover:bg-gray-50">&gt;</button>
          </div>
        </div>

      </div>

    </div>
  );
}
