"use client";

import React, { useState, useMemo } from 'react';
import { 
  Filter, Download, RefreshCw, Sparkles, TrendingUp, TrendingDown,
  Activity, ArrowUpRight, ArrowDownRight, ArrowRight, Wallet, AlertTriangle, 
  Banknote, Target, ChevronRight, Play, Eye, MoreVertical, LayoutTemplate, 
  Calendar, FileText, CheckCircle2, CloudRain, Clock, Users, FileSpreadsheet, Search,
  ChevronDown, HelpCircle, Thermometer, ShieldAlert, BarChart2, Droplets, Percent, ShieldCheck, ShoppingBag,
  Sliders, Info, Zap
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

const SCENARIO_COMPARISON_DATA = [
  { name: 'Now', baseline: 124.6, best: 124.6, stress: 124.6, max: 130, min: 118 },
  { name: '3M', baseline: 132.0, best: 142.5, stress: 110.2, max: 155, min: 95 },
  { name: '6M', baseline: 141.2, best: 158.0, stress: 98.4, max: 175, min: 82 },
  { name: '9M', baseline: 148.5, best: 172.4, stress: 86.8, max: 190, min: 70 },
  { name: '12M', baseline: 154.2, best: 185.0, stress: 78.2, max: 205, min: 62 },
];

const SENSITIVITY_DATA = [
  { name: 'Cashflow Stability', val: 0.68, color: '#10b981' },
  { name: 'Repayment Behaviour', val: 0.54, color: '#10b981' },
  { name: 'Rainfall Variability', val: -0.41, color: '#ef4444' },
  { name: 'Market Demand', val: 0.32, color: '#f97316' },
  { name: 'Interest Rate Movement', val: -0.21, color: '#ef4444' },
  { name: 'Input Cost Inflation', val: -0.18, color: '#ef4444' },
];

const PROBABILITY_DATA = [
  { name: 'Baseline', value: 50, color: '#10b981' },
  { name: 'Best Case', value: 30, color: '#3b82f6' },
  { name: 'Stress Case', value: 20, color: '#ef4444' },
];

const MONTE_CARLO_DATA = Array.from({ length: 25 }, (_, i) => {
  const x = -100 + i * 12.5;
  // bell-curve distribution approximation
  const dist = Math.exp(-Math.pow((i - 12), 2) / 18);
  const count = Math.round(dist * 18 + Math.random() * 2);
  return { net: x, count };
});

const WATERFALL_DATA = [
  { name: 'Baseline Outcome', val: 124.6, isTotal: true },
  { name: 'Cashflow Impact', val: -48.2, isTotal: false },
  { name: 'Rainfall Impact', val: -32.1, isTotal: false },
  { name: 'Repayment Impact', val: -26.8, isTotal: false },
  { name: 'Market Impact', val: -14.3, isTotal: false },
  { name: 'Stress Case Outcome', val: 78.2, isTotal: true },
];

const TIMELINE = [
  {
    title: '30 Days Outlook',
    badge: 'Baseline',
    badgeColor: 'bg-[#f0fdf4] text-green-700 border-green-200',
    net: '₹ 12.6 Cr',
    npa: '2.82%',
    repay: '-1.2%',
    conf: '87%',
    act: 'Monitor Closely'
  },
  {
    title: '90 Days Outlook',
    badge: 'Baseline',
    badgeColor: 'bg-[#f0fdf4] text-green-700 border-green-200',
    net: '₹ 34.8 Cr',
    npa: '2.95%',
    repay: '-2.4%',
    conf: '86%',
    act: 'Strengthen Cashflows'
  },
  {
    title: '180 Days Outlook',
    badge: 'Baseline',
    badgeColor: 'bg-[#f0fdf4] text-green-700 border-green-200',
    net: '₹ 68.7 Cr',
    npa: '3.18%',
    repay: '-3.6%',
    conf: '85%',
    act: 'Targeted Interventions'
  },
  {
    title: '365 Days Outlook',
    badge: 'Baseline',
    badgeColor: 'bg-[#f0fdf4] text-green-700 border-green-200',
    net: '₹ 124.6 Cr',
    npa: '3.42%',
    repay: '-5.1%',
    conf: '86%',
    act: 'Proactive Support'
  },
];

const ENTERPRISES = [
  { id: '1', name: 'Shree Ganesh Dairy', dist: 'Satara', sector: 'Dairy', base: '12,40,000', best: '15,80,000', stress: '8,90,000', npa: '4.32%', repay: '-6.4%', conf: '88%', rec: 'Strengthen Cashflow', recCol: 'text-green-700 bg-green-50 border-green-100', update: 'May 24, 2024 08:15 AM' },
  { id: '2', name: 'Sai Agri Producers Co.', dist: 'Sangli', sector: 'Agriculture', base: '-45,000', best: '25,000', stress: '-1,25,000', npa: '5.21%', repay: '-9.2%', conf: '84%', rec: 'Provide Support', recCol: 'text-blue-700 bg-blue-50 border-blue-100', update: 'May 24, 2024 08:15 AM' },
  { id: '3', name: 'Maa Bhavani Traders', dist: 'Pune', sector: 'Food Processing', base: '80,000', best: '1,35,000', stress: '35,000', npa: '3.78%', repay: '-4.1%', conf: '85%', rec: 'Monitor Closely', recCol: 'text-yellow-700 bg-yellow-50 border-yellow-100', update: 'May 24, 2024 08:15 AM' },
  { id: '4', name: 'Rural Mart Services', dist: 'Kolhapur', sector: 'Rural Retail', base: '35,000', best: '70,000', stress: '5,000', npa: '6.12%', repay: '-10.6%', conf: '82%', rec: 'Immediate Action', recCol: 'text-red-700 bg-red-50 border-red-100', update: 'May 24, 2024 08:15 AM' },
  { id: '5', name: 'Vijay Kiran Stores', dist: 'Solapur', sector: 'Rural Retail', base: '-25,000', best: '16,000', stress: '-60,000', npa: '4.85%', repay: '-7.3%', conf: '86%', rec: 'Strengthen Cashflow', recCol: 'text-green-700 bg-green-50 border-green-100', update: 'May 24, 2024 08:15 AM' },
];

export default function ScenarioAnalysisScreen({ navigateTo }: Props) {
  const [search, setSearch] = useState('');

  const filteredEnterprises = useMemo(() => {
    return ENTERPRISES.filter(e => 
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.dist.toLowerCase().includes(search.toLowerCase()) ||
      e.sector.toLowerCase().includes(search.toLowerCase())
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
             <span className="text-gray-900">Scenario Analysis</span>
          </div>
          <h1 className="text-[20px] font-extrabold text-gray-900 leading-none">Scenario Analysis</h1>
          <p className="text-[11px] font-medium text-gray-400 mt-1">
             AI-powered scenario modeling to evaluate potential future outcomes across multiple variables and interventions.
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

      {/* 1. AI Scenario Summary */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#f0fdf4] border border-green-100 flex items-center justify-center shrink-0">
              <Sliders size={22} className="text-green-700" />
            </div>
            <div className="min-w-[130px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-0.5">Baseline Outcome</div>
              <div className="text-[18px] font-black text-gray-900">₹ 124.6 Cr</div>
              <div className="text-[9px] font-bold text-green-600 mt-0.5">↑ 8.6% vs last baseline</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 lg:flex lg:items-center gap-6 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100 pt-5 lg:pt-0 lg:pl-6">
            <div className="min-w-[90px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">Best Case Outcome</div>
              <div className="text-[18px] font-black text-gray-900 mt-0.5">₹ 158.3 Cr</div>
              <div className="text-[9px] font-bold text-green-600">↑ 26.8%</div>
            </div>
            <div className="min-w-[90px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">Stress Case Outcome</div>
              <div className="text-[18px] font-black text-gray-900 mt-0.5">₹ 78.2 Cr</div>
              <div className="text-[9px] font-bold text-red-500">↓ -23.4%</div>
            </div>
            <div className="min-w-[90px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">Scenario Confidence</div>
              <div className="text-[18px] font-black text-gray-900 mt-0.5">86%</div>
              <div className="text-[9px] font-bold text-green-600">High confidence</div>
            </div>
            <div className="min-w-[110px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">Primary Scenario Driver</div>
              <div className="text-[18px] font-black text-gray-900 mt-0.5">Cashflow Stability</div>
              <div className="text-[9px] font-bold text-gray-500">Most sensitive to repayment behaviour</div>
            </div>
            <div className="min-w-[110px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">Last Scenario Refresh</div>
              <div className="text-[14px] font-black text-gray-900 mt-0.5">May 24, 2024 08:15 AM</div>
              <div className="text-[9px] font-bold text-gray-400">Model updated yesterday</div>
            </div>
          </div>

          <div className="shrink-0 flex items-center self-stretch lg:border-l border-gray-100 lg:pl-6">
            <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-700 bg-white hover:bg-gray-50 ml-auto">
              Explain <ChevronDown size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Scenario KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { title: 'Net Portfolio Impact', val: '₹ 124.6 Cr', sub: 'Baseline', spark: MINI_CHART_DATA_1, color: '#10b981' },
          { title: 'Total Revenue Impact', val: '₹ 246.2 Cr', sub: 'Baseline', spark: MINI_CHART_DATA_1, color: '#10b981' },
          { title: 'Expected NPA Rate', val: '3.42%', sub: 'Baseline', spark: MINI_CHART_DATA_3, color: '#f97316' },
          { title: 'Avg. Repayment Capacity', val: '₹ 28.7 Cr', sub: 'Baseline', spark: MINI_CHART_DATA_1, color: '#10b981' },
          { title: 'Cashflow Stability Index', val: '0.71', sub: 'Baseline', spark: MINI_CHART_DATA_2, color: '#3b82f6' },
          { title: 'Intervention Effectiveness', val: '22.4%', sub: 'Improvement', spark: MINI_CHART_DATA_1, color: '#a855f7' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-[28px] p-4 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between h-[105px]">
            <div>
              <span className="text-[10px] font-extrabold text-gray-500 block leading-tight">{kpi.title}</span>
            </div>
            
            <div className="flex items-end justify-between gap-2">
              <div>
                <span className="text-[18px] font-black text-gray-900 block leading-none mb-1">{kpi.val}</span>
                <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-wider block">{kpi.sub}</span>
              </div>
              <div className="h-6 w-16 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={kpi.spark}>
                    <Line type="monotone" dataKey="val" stroke={kpi.color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Scenario Summary (Horizontal Theme) */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] mb-6 flex flex-col lg:flex-row items-center gap-6">
        {/* Left: Summary */}
        <div className="flex-1 flex gap-4 lg:pr-6 border-b lg:border-b-0 lg:border-r border-gray-50 pb-4 lg:pb-0">
          <div className="w-12 h-12 rounded-2xl bg-[#ecfdf5] flex items-center justify-center shrink-0">
            <Sparkles className="text-green-600" size={24} />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-gray-900 mb-1">AI Scenario Summary</h3>
            <p className="text-[12px] text-gray-600 leading-relaxed">
              <strong>Baseline outcome is projected at ₹ 124.6 Cr.</strong> Best case scenario is achievable with proactive interventions in 8 districts. Stress scenario indicates higher NPA risk under prolonged rainfall deficit and repayment delays.
            </p>
          </div>
        </div>

        {/* Middle: Confidence */}
        <div className="w-full lg:w-[180px] shrink-0 lg:px-4 border-b lg:border-b-0 lg:border-r border-gray-50 pb-4 lg:pb-0">
          <div className="bg-[#ecfdf5] border border-green-100 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle2 className="text-green-600 shrink-0" size={20} />
            <div>
              <div className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider mb-0.5">AI Confidence</div>
              <div className="text-[14px] font-black text-green-700">High (86%)</div>
            </div>
          </div>
        </div>

        {/* Right: Key Insights */}
        <div className="w-full lg:w-[300px] shrink-0 lg:pl-6">
          <h4 className="text-[11px] font-extrabold text-green-700 mb-3">Key Insights</h4>
          <ul className="space-y-2 mb-3">
            <li className="text-[11px] text-gray-600 flex items-start gap-1.5"><span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 shrink-0" /> Repayment behaviour improvement reduces NPA by up to 1.2%</li>
            <li className="text-[11px] text-gray-600 flex items-start gap-1.5"><span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 shrink-0" /> Irrigated enterprises outperform non-irrigated in all scenarios</li>
            <li className="text-[11px] text-gray-600 flex items-start gap-1.5"><span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 shrink-0" /> Support interventions show highest effectiveness in drought-prone areas</li>
          </ul>
          <button className="text-[11px] font-bold text-green-700 flex items-center gap-1 hover:underline">View full brief <ArrowRight size={12}/></button>
        </div>
      </div>

      {/* 3. Scenario Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Main Column (12 cols): Charts & Simulations */}
        <div className="lg:col-span-12 space-y-5">
          
          <div className="bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
            <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">Scenario Workspace</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Chart 1: Scenario Comparison */}
              <div className="flex flex-col col-span-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold text-gray-800">Scenario Comparison (Net Portfolio Impact)</span>
                </div>
                <div className="h-[140px] w-full bg-gray-50/50 rounded-2xl p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={SCENARIO_COMPARISON_DATA} margin={{ top: 5, right: 5, left: -25, bottom: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                      <YAxis domain={[50, 220]} tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                      <Area dataKey="max" stroke="none" fill="#dcfce7" fillOpacity={0.4} />
                      <Area dataKey="min" stroke="none" fill="#ffffff" fillOpacity={1.0} />
                      <Line type="monotone" dataKey="best" stroke="#10b981" strokeWidth={1.5} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="baseline" stroke="#3b82f6" strokeWidth={1.5} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={1.5} dot={{ r: 2 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-3 text-[8px] font-bold text-gray-500 mt-2">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Baseline</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Best Case</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> Stress Case</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-200 rounded-full"></span> Conf Interval</span>
                </div>
              </div>

              {/* Chart 2: Outcome Drivers Sensitivity */}
              <div className="flex flex-col col-span-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold text-gray-800">Outcome Drivers Sensitivity</span>
                </div>
                <div className="h-[140px] w-full bg-gray-50/50 rounded-2xl p-2 flex flex-col justify-center space-y-1.5">
                  {SENSITIVITY_DATA.map((d, i) => (
                    <div key={i} className="space-y-0.5">
                      <div className="flex justify-between text-[8px] font-bold text-gray-600">
                        <span>{d.name}</span>
                        <span className={d.val >= 0 ? 'text-green-600' : 'text-red-500'}>{d.val > 0 ? `+${d.val}` : d.val}</span>
                      </div>
                      <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden flex">
                        <div className="h-full rounded-full" style={{ width: `${Math.abs(d.val) * 100}%`, background: d.color }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart 3: Scenario Probability */}
              <div className="flex flex-col col-span-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold text-gray-800">Scenario Probability</span>
                </div>
                <div className="h-[120px] w-full bg-gray-50/50 rounded-2xl p-2 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={PROBABILITY_DATA} innerRadius={28} outerRadius={42} paddingAngle={2} dataKey="value">
                        {PROBABILITY_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[9px] font-black text-gray-900 leading-none">AI Expected</span>
                    <span className="text-[7px] font-bold text-gray-400 mt-0.5">Probability</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3 text-[8px] font-bold text-gray-500 mt-2">
                  {PROBABILITY_DATA.map((p, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }}></span> {p.name} <strong>{p.value}%</strong>
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Table 1: Scenario Variables & Assumptions */}
            <div className="bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <h3 className="text-[12px] font-extrabold text-gray-900 mb-3">Scenario Variables & Assumptions</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[9px]">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-extrabold uppercase">
                      <th className="pb-1.5">Variable</th>
                      <th className="pb-1.5">Baseline</th>
                      <th className="pb-1.5 text-green-600">Best Case</th>
                      <th className="pb-1.5 text-red-500">Stress Case</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-semibold text-gray-700">
                    <tr><td className="py-1">Rainfall (% Normal)</td><td>-5%</td><td className="text-green-600">+15%</td><td className="text-red-500">-25%</td></tr>
                    <tr><td className="py-1">Repayment Behaviour</td><td>Stable</td><td className="text-green-600">Improved</td><td className="text-red-500">Weakening</td></tr>
                    <tr><td className="py-1">Cashflow Stability</td><td>Moderate</td><td className="text-green-600">Strong</td><td className="text-red-500">Weak</td></tr>
                    <tr><td className="py-1">Market Demand</td><td>Moderate</td><td className="text-green-600">High</td><td className="text-red-500">Low</td></tr>
                    <tr><td className="py-1">Input Cost Inflation</td><td>5%</td><td className="text-green-600">3%</td><td className="text-red-500">10%</td></tr>
                    <tr><td className="py-1">Interest Rate</td><td>8.25%</td><td className="text-green-600">8.00%</td><td className="text-red-500">9.25%</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Simulation: Monte Carlo Simulation */}
            <div className="bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <h3 className="text-[12px] font-extrabold text-gray-900 mb-2">Monte Carlo Simulation (Net Portfolio Impact)</h3>
              
              <div className="h-[100px] w-full bg-gray-50/50 rounded-2xl p-1.5">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MONTE_CARLO_DATA} margin={{ top: 5, right: 5, left: -25, bottom: -10 }}>
                    <Bar dataKey="count" fill="#10b981" barSize={4} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-1 text-[8px] font-semibold text-gray-500 mt-2 border-t border-gray-50 pt-1.5">
                <div>P10 (10%): <strong className="text-red-500">-45.6</strong></div>
                <div>P50 (50%): <strong className="text-gray-900">118.4</strong></div>
                <div>P90 (90%): <strong className="text-green-600">182.7</strong></div>
                <div>Expected (F Cr): <strong className="text-gray-900">124.6</strong></div>
              </div>
            </div>

            {/* Waterfall: Impact Waterfall */}
            <div className="bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <h3 className="text-[12px] font-extrabold text-gray-900 mb-2">Impact Waterfall (Baseline vs Stress Case)</h3>
              
              <div className="space-y-1.5 flex-1 flex flex-col justify-center text-[9px] font-semibold">
                {WATERFALL_DATA.map((wf, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-gray-600 truncate max-w-[100px]">{wf.name}</span>
                    <span className={wf.val >= 0 ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
                      {wf.val > 0 ? `${wf.val} Cr` : `${wf.val} Cr`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 4. Scenario Timeline */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">Scenario Timeline</h3>
        
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {TIMELINE.map((time, idx) => (
              <div key={idx} className="bg-gray-50/50 border border-gray-100 hover:border-gray-200 rounded-2xl p-4 flex flex-col justify-between min-h-[140px] transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[12px] font-black text-gray-900">{time.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold border ${time.badgeColor}`}>{time.badge}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1 text-[9px] font-semibold text-gray-600 mb-3 border-t border-b border-gray-100/50 py-2">
                    <div><span className="text-gray-400 block text-[7px]">Net Impact</span><strong className="text-gray-900">{time.net}</strong></div>
                    <div><span className="text-gray-400 block text-[7px]">NPA Rate</span><strong className="text-gray-900">{time.npa}</strong></div>
                    <div><span className="text-gray-400 block text-[7px]">Repayment Impact</span><strong className="text-red-500">{time.repay}</strong></div>
                    <div><span className="text-gray-400 block text-[7px]">Confidence</span><strong className="text-green-600">{time.conf}</strong></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-bold text-gray-400">Recommended Action</span>
                  <button className="px-3 py-1 bg-white border border-green-200 text-green-700 rounded-lg text-[9px] font-extrabold hover:bg-green-50 transition-colors">
                    {time.act}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Recommended Actions Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { title: 'Run Monte Carlo', sub: 'Simulate 10,000 iterations', icon: Play, color: 'text-blue-500 bg-blue-50 border-blue-100' },
          { title: 'Adjust Variables', sub: 'Modify stress assumptions', icon: Sliders, color: 'text-green-700 bg-green-50 border-green-100' },
          { title: 'Apply Interventions', sub: 'Test policy responses', icon: Activity, color: 'text-purple-700 bg-purple-50 border-purple-100' },
          { title: 'Export Scenarios', sub: 'Download full model data', icon: FileSpreadsheet, color: 'text-slate-700 bg-slate-50 border-slate-100' },
          { title: 'Compare Districts', sub: 'Regional sensitivity analysis', icon: Target, color: 'text-orange-700 bg-orange-50 border-orange-100' },
          { title: 'Generate Executive Brief', sub: 'AI summary report', icon: FileText, color: 'text-red-700 bg-red-50 border-red-100' },
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

      {/* 6. Enterprise Scenario Impact (Table) */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-[13px] font-extrabold text-gray-900">Enterprise Scenario Impact</h3>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search enterprises, districts..." 
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
                <th className="pb-3">District</th>
                <th className="pb-3">Sector</th>
                <th className="pb-3 text-right">Baseline Outcome (₹)</th>
                <th className="pb-3 text-right">Best Case Outcome (₹)</th>
                <th className="pb-3 text-right">Stress Case Outcome (₹)</th>
                <th className="pb-3 text-center">NPA Rate (Stress)</th>
                <th className="pb-3 text-center">Repayment Impact (Stress)</th>
                <th className="pb-3 text-center">Scenario Confidence</th>
                <th className="pb-3">AI Recommendation</th>
                <th className="pb-3">Last Scenario Update</th>
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
                  <td className="py-3.5 text-[11px] font-semibold text-gray-500">{row.sector}</td>
                  <td className="py-3.5 text-[11px] font-bold text-gray-800 text-right">{row.base}</td>
                  <td className="py-3.5 text-[11px] font-bold text-green-600 text-right">{row.best}</td>
                  <td className="py-3.5 text-[11px] font-bold text-red-500 text-right">{row.stress}</td>
                  <td className="py-3.5 text-[11px] font-bold text-red-600 text-center">{row.npa}</td>
                  <td className="py-3.5 text-[11px] font-bold text-red-500 text-center">{row.repay}</td>
                  <td className="py-3.5 text-[11px] font-bold text-green-600 text-center">{row.conf}</td>

                  {/* Recommendation Badge */}
                  <td className="py-3.5">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold border ${row.recCol}`}>
                      {row.rec}
                    </span>
                  </td>

                  <td className="py-3.5 text-[10px] font-semibold text-gray-400">{row.update}</td>

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
            Showing 1 to {filteredEnterprises.length} of 3,842 enterprises
          </span>

          <div className="flex items-center gap-1 self-end sm:self-auto">
            <button className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-400 bg-white" disabled>&lt;</button>
            <button className="px-3 py-1.5 bg-green-50 border border-green-100 text-green-700 rounded-lg text-[10px] font-black">1</button>
            <button className="px-3 py-1.5 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500 bg-white hover:bg-gray-50">2</button>
            <button className="px-3 py-1.5 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500 bg-white hover:bg-gray-50">3</button>
            <span className="px-1.5 text-gray-400 text-[10px]">...</span>
            <button className="px-3 py-1.5 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500 bg-white hover:bg-gray-50">769</button>
            <button className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-500 bg-white hover:bg-gray-50">&gt;</button>
          </div>
        </div>

      </div>

    </div>
  );
}
