"use client";

import React from 'react';
import { 
  Filter, Download, RefreshCw, Sparkles, TrendingUp, TrendingDown,
  Activity, ArrowUpRight, ArrowDownRight, ArrowRight, Wallet, AlertTriangle, 
  Banknote, Target, ChevronRight, Play, Eye, MoreVertical, LayoutTemplate, 
  Calendar, FileText, CheckCircle2, CloudRain, Clock, Users, FileSpreadsheet, PieChart, Search
} from 'lucide-react';
import { 
  ComposedChart, LineChart, Line, Area, XAxis, YAxis, CartesianGrid, 
  ResponsiveContainer, ReferenceLine, ReferenceArea, Tooltip, Bar, Cell 
} from 'recharts';
import { Screen } from '../GramPulseApp';

interface Props {
  navigateTo: (s: Screen, ent?: string) => void;
}

// --- MOCK DATA ---

const MINI_CHART_DATA_1 = [{val: 20}, {val: 25}, {val: 22}, {val: 30}, {val: 28}, {val: 35}];
const MINI_CHART_DATA_2 = [{val: 40}, {val: 35}, {val: 50}, {val: 45}, {val: 60}, {val: 55}];
const MINI_CHART_DATA_3 = [{val: 50}, {val: 45}, {val: 40}, {val: 30}, {val: 25}, {val: 20}];

const INFLOW_DATA = [
  { name: 'Now', val: 30, min: 25, max: 35 },
  { name: '30D', val: 45, min: 35, max: 55 },
  { name: '90D', val: 55, min: 40, max: 70 },
  { name: '180D', val: 75, min: 55, max: 95 },
  { name: '365D', val: 90, min: 65, max: 115 },
];

const OUTFLOW_DATA = [
  { name: 'Now', val: 20, min: 18, max: 22 },
  { name: '30D', val: 25, min: 20, max: 30 },
  { name: '90D', val: 35, min: 28, max: 42 },
  { name: '180D', val: 45, min: 35, max: 55 },
  { name: '365D', val: 50, min: 38, max: 62 },
];

const NET_DATA = [
  { name: 'Now', val: 10, min: 5, max: 15 },
  { name: '30D', val: 20, min: 10, max: 30 },
  { name: '90D', val: 20, min: 5, max: 35 },
  { name: '180D', val: 30, min: 10, max: 50 },
  { name: '365D', val: 40, min: 15, max: 65 },
];

const SEASONAL_DATA = [
  { month: 'Apr', hist: -10, proj: -8, min: -15, max: -5 },
  { month: 'May', hist: -5, proj: -2, min: -10, max: 2 },
  { month: 'Jun', hist: 10, proj: 8, min: 5, max: 15 },
  { month: 'Jul', hist: 25, proj: 20, min: 15, max: 30 },
  { month: 'Aug', hist: 20, proj: 15, min: 10, max: 25 },
  { month: 'Sep', hist: 10, proj: 12, min: 5, max: 18 },
  { month: 'Oct', hist: -5, proj: -8, min: -15, max: 0 },
  { month: 'Nov', hist: -15, proj: -12, min: -20, max: -5 },
  { month: 'Dec', hist: -10, proj: -8, min: -15, max: -2 },
  { month: 'Jan', hist: 5, proj: 8, min: 0, max: 12 },
  { month: 'Feb', hist: 15, proj: 18, min: 10, max: 25 },
  { month: 'Mar', hist: 5, proj: 4, min: 0, max: 10 },
];

const LIQUIDITY_DATA = [
  { name: 'Now', val: 45, min: 40, max: 50 },
  { name: '30D', val: 50, min: 42, max: 58 },
  { name: '90D', val: 55, min: 45, max: 65 },
  { name: '180D', val: 65, min: 50, max: 80 },
  { name: '365D', val: 75, min: 55, max: 95 },
];

const DRIVERS = [
  { name: 'Income from Sales', val: 18.6, type: 'pos', w: '85%' },
  { name: 'Seasonal Income (Harvest)', val: 10.4, type: 'pos', w: '65%' },
  { name: 'Operating Expenses', val: -7.2, type: 'neg', w: '45%' },
  { name: 'Repayment Outflow', val: -5.6, type: 'neg', w: '35%' },
  { name: 'Other Expenses', val: -3.4, type: 'neg', w: '20%' },
];

const TIMELINE = [
  {
    title: '30 Days Outlook', icon: Clock,
    metrics: [
      { label: 'Net Cashflow', val: '₹ 6.2 Cr', color: 'text-gray-900' },
      { label: 'Liquidity', val: 'Watch', color: 'text-orange-500 bg-orange-50 px-2 py-0.5 rounded text-[10px]' },
      { label: 'Repayment Cap.', val: '₹ 6.8 Cr', color: 'text-gray-900' },
      { label: 'Stability', val: 'Medium', color: 'text-orange-500' },
    ],
    conf: 92,
    action: 'Monitor Closely'
  },
  {
    title: '90 Days Outlook', icon: Calendar,
    metrics: [
      { label: 'Net Cashflow', val: '₹ 24.8 Cr', color: 'text-gray-900' },
      { label: 'Liquidity', val: 'Stable', color: 'text-green-600 bg-green-50 px-2 py-0.5 rounded text-[10px]' },
      { label: 'Repayment Cap.', val: '₹ 28.7 Cr', color: 'text-gray-900' },
      { label: 'Stability', val: 'High', color: 'text-green-600' },
    ],
    conf: 89,
    action: 'Continue Monitoring'
  },
  {
    title: '180 Days Outlook', icon: CloudRain,
    metrics: [
      { label: 'Net Cashflow', val: '₹ 38.6 Cr', color: 'text-gray-900' },
      { label: 'Liquidity', val: 'Healthy', color: 'text-green-600 bg-green-50 px-2 py-0.5 rounded text-[10px]' },
      { label: 'Repayment Cap.', val: '₹ 42.3 Cr', color: 'text-gray-900' },
      { label: 'Stability', val: 'High', color: 'text-green-600' },
    ],
    conf: 82,
    action: 'Support Growth'
  }
];

const INSIGHTS = [
  { icon: AlertTriangle, text: '42 enterprises may face liquidity shortages in next 30 days.', sub: 'Lower cash inflow expected before harvest sales.', conf: 87, action: 'Review Now', color: 'text-red-500 bg-red-50' },
  { icon: Target, text: 'Cashflow expected to improve after 90 days.', sub: 'Post-harvest income and sales cycle improvement.', conf: 92, action: 'View Details', color: 'text-orange-500 bg-orange-50' },
  { icon: Clock, text: 'Repayment timing risk increasing in Sangli district.', sub: 'Higher repayment outflow vs expected inflow.', conf: 79, action: 'Analyze Risk', color: 'text-orange-500 bg-orange-50' },
  { icon: ArrowUpRight, text: '128 enterprises showing stable operating cashflow.', sub: 'Consistent income and controlled expenses.', conf: 88, action: 'View Enterprises', color: 'text-green-500 bg-green-50' },
  { icon: ArrowUpRight, text: 'Kolhapur and Pune districts show improving liquidity.', sub: 'Stronger market demand and income trends.', conf: 91, action: 'View Districts', color: 'text-purple-500 bg-purple-50' },
  { icon: AlertTriangle, text: 'Seasonal expense spike expected in June-July.', sub: 'Input costs and operational expenses may increase.', conf: 82, action: 'Prepare Now', color: 'text-blue-500 bg-blue-50' },
];

const TABLE_DATA = [
  { ent: 'Shree Ganesh Dairy', dist: 'Satara', cur: '1,24,000', for90: '2,35,000', liq: 'Stable', lColor: 'text-green-600 bg-green-50', rep: '2,68,000', conf: 90, cColor: 'text-green-600', ai: 'Monitor & Support', last: 'May 24, 2024 08:15 AM' },
  { ent: 'Sai Agri Producers Co.', dist: 'Sangli', cur: '-45,000', for90: '-10,000', liq: 'Stress', lColor: 'text-red-600 bg-red-50', rep: '15,000', conf: 78, cColor: 'text-orange-500', ai: 'Create Intervention', last: 'May 24, 2024 08:15 AM' },
  { ent: 'Maa Bhavani Traders', dist: 'Pune', cur: '80,000', for90: '1,65,000', liq: 'Healthy', lColor: 'text-green-600 bg-green-50', rep: '1,95,000', conf: 91, cColor: 'text-green-600', ai: 'Increase Limit', last: 'May 24, 2024 08:15 AM' },
  { ent: 'Rural Mart Services', dist: 'Kolhapur', cur: '35,000', for90: '85,000', liq: 'Stable', lColor: 'text-green-600 bg-green-50', rep: '95,000', conf: 88, cColor: 'text-green-600', ai: 'Monitor & Support', last: 'May 24, 2024 08:15 AM' },
  { ent: 'Vijay Kirana Stores', dist: 'Solapur', cur: '-25,000', for90: '5,000', liq: 'Watch', lColor: 'text-orange-600 bg-orange-50', rep: '35,000', conf: 76, cColor: 'text-orange-500', ai: 'Monitor Closely', last: 'May 24, 2024 08:15 AM' },
];

const MiniSparkline = ({ data, color }: any) => (
  <div className="h-6 w-16">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line type="monotone" dataKey="val" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default function CashflowForecastScreen({ navigateTo }: Props) {
  return (
    <div className="space-y-6 pb-12 w-full max-w-[1600px] mx-auto overflow-x-hidden">
      
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold text-gray-500 mb-1 flex items-center gap-1">
             Forecasting <span className="text-gray-300">{">"}</span> <span className="text-gray-900">Cashflow Forecast</span>
          </div>
          <h1 className="text-[22px] font-bold text-gray-900 mb-1">Cashflow Forecast</h1>
          <div className="text-[11px] text-gray-500 font-medium">AI-powered cashflow forecasting across 30, 90, 180 and 365-day horizons.</div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-4 py-2 text-[12px] font-semibold text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors">
            <Filter size={14} /> Filters
          </button>
          <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-4 py-2 text-[12px] font-semibold text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors">
            <Download size={14} /> Export
          </button>
          <button className="flex items-center gap-1.5 border border-transparent rounded-xl px-4 py-2 text-[12px] font-semibold text-white bg-[#0f766e] hover:bg-[#0f766e]/90 shadow-sm transition-colors">
            <RefreshCw size={14} /> Generate Report
          </button>
        </div>
      </div>

      {/* 1. AI Cashflow Summary */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
         <div className="p-5 flex items-center gap-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center shrink-0 border border-green-200/50">
               <Sparkles size={24} className="text-emerald-600" />
            </div>
            
            <div className="flex-1 grid grid-cols-5 gap-6 border-r border-gray-100 pr-6">
               <div>
                  <div className="text-[10px] font-bold text-gray-500 mb-1">Expected Net Cashflow (90 Days)</div>
                  <div className="text-[18px] font-bold text-gray-900 leading-none mb-1.5">₹ 24.8 Cr</div>
                  <div className="text-[10px] font-bold text-green-600 flex items-center gap-0.5"><ArrowUpRight size={10}/> 12.4% <span className="text-gray-400 font-medium">vs last forecast</span></div>
               </div>
               <div>
                  <div className="text-[10px] font-bold text-gray-500 mb-1">Portfolio Liquidity Outlook</div>
                  <div className="text-[14px] font-bold text-green-600 mb-1.5 bg-green-50 px-2 py-0.5 rounded inline-block">Improving</div>
                  <div className="text-[9px] font-medium text-gray-500">Liquidity expected to improve gradually</div>
               </div>
               <div>
                  <div className="text-[10px] font-bold text-gray-500 mb-1">Forecast Horizon</div>
                  <div className="text-[14px] font-bold text-gray-900 mb-1.5">30 / 90 / 180 / 365 Days</div>
                  <div className="text-[9px] font-medium text-gray-500">Multiple horizon prediction</div>
               </div>
               <div>
                  <div className="text-[10px] font-bold text-gray-500 mb-1">Overall AI Confidence</div>
                  <div className="text-[18px] font-bold text-gray-900 mb-1.5">89%</div>
                  <div className="text-[9px] font-bold text-green-600">High confidence</div>
               </div>
               <div>
                  <div className="text-[10px] font-bold text-gray-500 mb-1">Primary Cashflow Driver</div>
                  <div className="text-[12px] font-bold text-gray-900 mb-1.5 leading-tight">Seasonal Income Increase</div>
                  <div className="text-[9px] font-medium text-gray-500 leading-tight">Driven by harvest season and sales cycle</div>
               </div>
            </div>

            <div className="w-[180px] shrink-0">
               <div className="text-[10px] font-bold text-gray-500 mb-1">Last Forecast Refresh</div>
               <div className="text-[12px] font-bold text-gray-900 mb-1.5">May 24, 2024 08:15 AM</div>
               <div className="text-[9px] font-medium text-gray-500 mb-3">Model updated yesterday</div>
               <button className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-[10px] font-bold text-gray-700 bg-white hover:bg-gray-50 w-full justify-center">
                  <Sparkles size={10} /> Explain
               </button>
            </div>
         </div>
         <div className="bg-emerald-50/50 border-t border-emerald-100/50 px-5 py-2.5 rounded-b-xl flex items-center gap-2">
            <span className="text-[10px] font-bold text-emerald-700">AI Insight:</span>
            <span className="text-[11px] font-medium text-gray-700">Cashflow is expected to improve in the next 90 days due to seasonal income rise post-harvest. 42 enterprises may face short-term liquidity stress in the next 30 days.</span>
         </div>
      </div>

      {/* 2. Cashflow KPIs */}
      <div>
         <h2 className="text-[13px] font-bold text-gray-900 mb-3 flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">2</span> Cashflow KPIs</h2>
         <div className="grid grid-cols-5 gap-4">
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[90px]">
               <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-5 h-5 rounded bg-green-50 flex items-center justify-center text-green-600"><Banknote size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">Net Cashflow Forecast (90 Days)</span>
               </div>
               <div className="flex items-end justify-between">
                  <div>
                     <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">₹ 24.8 Cr</div>
                     <div className="text-[9px] font-bold text-green-600 flex items-center gap-0.5"><ArrowUpRight size={10}/> 12.4% <span className="text-gray-400 font-semibold">vs last forecast</span></div>
                  </div>
                  <MiniSparkline data={MINI_CHART_DATA_1} color="#16a34a" />
               </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[90px]">
               <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center text-blue-600"><TrendingUp size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">Positive Cashflow Enterprises</span>
               </div>
               <div className="flex items-end justify-between">
                  <div>
                     <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">1,246</div>
                     <div className="text-[9px] font-bold text-green-600 flex items-center gap-0.5"><ArrowUpRight size={10}/> 14.6% <span className="text-gray-400 font-semibold">vs last forecast</span></div>
                  </div>
                  <MiniSparkline data={MINI_CHART_DATA_2} color="#2563eb" />
               </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[90px]">
               <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-5 h-5 rounded bg-red-50 flex items-center justify-center text-red-500"><TrendingDown size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">Cashflow Stress Cases</span>
               </div>
               <div className="flex items-end justify-between">
                  <div>
                     <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">162</div>
                     <div className="text-[9px] font-bold text-red-500 flex items-center gap-0.5"><ArrowDownRight size={10}/> 5.6% <span className="text-gray-400 font-semibold">vs last forecast</span></div>
                  </div>
                  <MiniSparkline data={MINI_CHART_DATA_3} color="#ef4444" />
               </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[90px]">
               <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-5 h-5 rounded bg-purple-50 flex items-center justify-center text-purple-600"><Wallet size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">Expected Repayment Capacity</span>
               </div>
               <div className="flex items-end justify-between">
                  <div>
                     <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">₹ 28.7 Cr</div>
                     <div className="text-[9px] font-bold text-green-600 flex items-center gap-0.5"><ArrowUpRight size={10}/> 8.3% <span className="text-gray-400 font-semibold">vs last forecast</span></div>
                  </div>
                  <MiniSparkline data={MINI_CHART_DATA_1} color="#9333ea" />
               </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[90px]">
               <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-5 h-5 rounded bg-orange-50 flex items-center justify-center text-orange-500"><AlertTriangle size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">Liquidity Risk</span>
               </div>
               <div className="flex items-end justify-between">
                  <div>
                     <div className="text-[18px] font-bold text-orange-500 leading-none mb-1">Medium</div>
                     <div className="text-[9px] font-bold text-orange-500 flex items-center gap-0.5"><ArrowDownRight size={10}/> 8.2% <span className="text-gray-400 font-semibold">vs last forecast</span></div>
                  </div>
                  <MiniSparkline data={MINI_CHART_DATA_2} color="#f97316" />
               </div>
            </div>
         </div>
      </div>

      {/* 3. Cashflow Forecast Workspace */}
      <div>
         <h2 className="text-[13px] font-bold text-gray-900 mb-3 flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">3</span> Cashflow Forecast Workspace</h2>
         <div className="grid grid-cols-3 gap-6">
            
            {/* Chart 1 */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
               <h3 className="text-[11px] font-bold text-gray-900 mb-4">Portfolio Cash Inflow Forecast</h3>
               <div className="flex items-center gap-4 text-[9px] font-semibold text-gray-500 mb-4 justify-center">
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Forecast</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-100 border border-blue-200"></span> Confidence Interval</div>
               </div>
               <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <ComposedChart data={INFLOW_DATA} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} tickFormatter={(val) => `₹${val}`} />
                        <Area type="monotone" dataKey="max" stroke="none" fill="#dbeafe" opacity={0.6} />
                        <Area type="monotone" dataKey="min" stroke="none" fill="#ffffff" opacity={1} />
                        <Line type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={2} dot={{r:3, fill:"#3b82f6", strokeWidth:0}} />
                     </ComposedChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Chart 2 */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
               <h3 className="text-[11px] font-bold text-gray-900 mb-4">Portfolio Cash Outflow Forecast</h3>
               <div className="flex items-center gap-4 text-[9px] font-semibold text-gray-500 mb-4 justify-center">
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Forecast</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-100 border border-blue-200"></span> Confidence Interval</div>
               </div>
               <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <ComposedChart data={OUTFLOW_DATA} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} tickFormatter={(val) => `₹${val}`} />
                        <Area type="monotone" dataKey="max" stroke="none" fill="#dbeafe" opacity={0.6} />
                        <Area type="monotone" dataKey="min" stroke="none" fill="#ffffff" opacity={1} />
                        <Line type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={2} dot={{r:3, fill:"#3b82f6", strokeWidth:0}} />
                     </ComposedChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Chart 3 */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
               <h3 className="text-[11px] font-bold text-gray-900 mb-4">Net Cashflow Projection</h3>
               <div className="flex items-center gap-4 text-[9px] font-semibold text-gray-500 mb-4 justify-center">
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Net Cashflow</div>
                  <div className="flex items-center gap-1"><span className="w-4 h-0 border-t border-dashed border-gray-400"></span> Break-even</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-100 border border-green-200"></span> Confidence Interval</div>
               </div>
               <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <ComposedChart data={NET_DATA} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} tickFormatter={(val) => `₹${val}`} />
                        <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
                        <Area type="monotone" dataKey="max" stroke="none" fill="#dcfce7" opacity={0.6} />
                        <Area type="monotone" dataKey="min" stroke="none" fill="#ffffff" opacity={1} />
                        <Line type="monotone" dataKey="val" stroke="#16a34a" strokeWidth={2} dot={{r:3, fill:"#16a34a", strokeWidth:0}} />
                     </ComposedChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Chart 4 */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
               <h3 className="text-[11px] font-bold text-gray-900 mb-4">Seasonal Cashflow Pattern</h3>
               <div className="flex items-center gap-4 text-[9px] font-semibold text-gray-500 mb-4 justify-center">
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400"></span> Historical Avg</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> This Year (Proj.)</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-50 border border-green-100"></span> Season Range</div>
               </div>
               <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <ComposedChart data={SEASONAL_DATA} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} tickFormatter={(val) => `₹${val}`} />
                        <ReferenceLine y={0} stroke="#e5e7eb" />
                        <Area type="monotone" dataKey="max" stroke="none" fill="#dcfce7" opacity={0.4} />
                        <Area type="monotone" dataKey="min" stroke="none" fill="#ffffff" opacity={1} />
                        <Line type="monotone" dataKey="hist" stroke="#9ca3af" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                        <Line type="monotone" dataKey="proj" stroke="#16a34a" strokeWidth={2} dot={{r:2, fill:"#16a34a", strokeWidth:0}} />
                     </ComposedChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Chart 5 */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
               <h3 className="text-[11px] font-bold text-gray-900 mb-4">Liquidity Outlook</h3>
               <div className="flex items-center gap-4 text-[9px] font-semibold text-gray-500 mb-4 justify-center">
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Liquidity Index</div>
                  <div className="flex items-center gap-1"><span className="w-4 h-0 border-t border-dashed border-gray-400"></span> Confidence Interval</div>
               </div>
               <div className="h-[180px] w-full relative">
                  {/* Background bands */}
                  <div className="absolute inset-0 flex flex-col pointer-events-none opacity-[0.03] -z-10 ml-6 mb-6">
                     <div className="flex-1 bg-green-500"></div>
                     <div className="flex-1 bg-green-300"></div>
                     <div className="flex-1 bg-yellow-400"></div>
                     <div className="flex-1 bg-red-500"></div>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                     <ComposedChart data={LIQUIDITY_DATA} margin={{ top: 5, right: 30, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} domain={[0, 100]} />
                        <ReferenceLine y={75} stroke="none" label={{ position: 'right', value: 'Healthy', fill: '#16a34a', fontSize: 9, fontWeight: 700 }} />
                        <ReferenceLine y={50} stroke="none" label={{ position: 'right', value: 'Stable', fill: '#059669', fontSize: 9, fontWeight: 700 }} />
                        <ReferenceLine y={25} stroke="none" label={{ position: 'right', value: 'Watch', fill: '#d97706', fontSize: 9, fontWeight: 700 }} />
                        <ReferenceLine y={5} stroke="none" label={{ position: 'right', value: 'Stress', fill: '#dc2626', fontSize: 9, fontWeight: 700 }} />
                        
                        <Area type="monotone" dataKey="max" stroke="none" fill="#dcfce7" opacity={0.6} />
                        <Area type="monotone" dataKey="min" stroke="none" fill="#ffffff" opacity={1} />
                        <Line type="monotone" dataKey="val" stroke="#16a34a" strokeWidth={2} dot={{r:3, fill:"#16a34a", strokeWidth:0}} />
                     </ComposedChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Chart 6 */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-bold text-gray-900">Cashflow Driver Breakdown <span className="text-gray-500 font-normal">(Impact on 90-Day Forecast)</span></h3>
                  <AlertTriangle size={12} className="text-gray-400" />
               </div>
               
               <div className="space-y-4 mt-8">
                  {DRIVERS.map((d, i) => (
                     <div key={i} className="flex items-center gap-4">
                        <div className="w-[120px] text-[9px] font-semibold text-gray-600 truncate">{d.name}</div>
                        <div className="flex-1 flex items-center justify-center relative h-3">
                           {/* Center line */}
                           <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-200"></div>
                           
                           {d.type === 'pos' ? (
                              <div className="w-1/2 flex justify-start ml-[50%]">
                                 <div className="h-2.5 bg-green-500 rounded-r-sm" style={{width: d.w}}></div>
                              </div>
                           ) : (
                              <div className="w-1/2 flex justify-end mr-[50%]">
                                 <div className="h-2.5 bg-red-500 rounded-l-sm" style={{width: d.w}}></div>
                              </div>
                           )}
                        </div>
                        <div className={`w-[40px] text-[9px] font-bold text-right ${d.type === 'pos' ? 'text-green-600' : 'text-red-600'}`}>
                           {d.type === 'pos' ? '+' : '-'} ₹ {Math.abs(d.val)} Cr
                        </div>
                     </div>
                  ))}
               </div>
            </div>

         </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-12 gap-6 items-start">
         
         {/* 4. Forecast Timeline */}
         <div className="col-span-5 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-[13px] font-bold text-gray-900 mb-4 flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">4</span> Forecast Timeline</h2>
            <div className="flex gap-4">
               {TIMELINE.map((col, i) => (
                  <div key={i} className="flex-1 flex flex-col relative">
                     <div className="flex items-center gap-1.5 mb-4 border-b border-gray-100 pb-2">
                        <col.icon size={14} className="text-green-600" />
                        <h3 className="text-[10px] font-bold text-gray-900">{col.title}</h3>
                     </div>
                     <div className="space-y-3 mb-6">
                        {col.metrics.map((m, j) => (
                           <div key={j} className="flex flex-col gap-1">
                              <span className="text-[9px] font-semibold text-gray-500">{m.label}</span>
                              <span className={`text-[11px] font-bold leading-none ${m.color}`}>{m.val}</span>
                           </div>
                        ))}
                     </div>
                     <div className="mt-auto pt-3 border-t border-gray-100 space-y-2">
                        <div className="flex justify-between items-center">
                           <span className="text-[9px] font-semibold text-gray-500">AI Confidence</span>
                           <span className="text-[9px] font-bold text-green-600">{col.conf}%</span>
                        </div>
                        <div className="flex flex-col gap-1">
                           <span className="text-[9px] font-semibold text-gray-500">Recommended Action</span>
                           <span className="text-[9px] font-bold text-indigo-600 leading-tight">{col.action}</span>
                        </div>
                     </div>
                     
                     {i < TIMELINE.length - 1 && (
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 text-gray-300">
                           <ArrowRight size={14} />
                        </div>
                     )}
                  </div>
               ))}
            </div>
         </div>

         {/* 5. AI Cashflow Insights */}
         <div className="col-span-4 bg-white border border-gray-100 rounded-xl p-5 shadow-sm h-full">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-[13px] font-bold text-gray-900 flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">5</span> AI Cashflow Insights</h2>
               <button className="text-[9px] font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-800">
                  View all insights <ArrowRight size={10} />
               </button>
            </div>
            
            <div className="space-y-4">
               {INSIGHTS.map((ins, i) => (
                  <div key={i} className="flex gap-3">
                     <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${ins.color}`}>
                        <ins.icon size={12} />
                     </div>
                     <div className="flex-1">
                        <div className="flex justify-between items-start mb-0.5">
                           <p className="text-[11px] font-bold text-gray-900 leading-snug">{ins.text}</p>
                           <span className="text-[9px] font-bold text-gray-500 shrink-0 ml-2">{ins.conf}% <span className="font-semibold text-gray-400">Confidence</span></span>
                        </div>
                        <p className="text-[10px] font-medium text-gray-600 mb-1">{ins.sub}</p>
                        <button className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-800">
                           {ins.action} <ArrowRight size={10} />
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* 6. Recommended Actions */}
         <div className="col-span-3 bg-white border border-gray-100 rounded-xl p-5 shadow-sm h-full">
            <h2 className="text-[13px] font-bold text-gray-900 mb-4 flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">6</span> Recommended Actions</h2>
            
            <div className="space-y-3">
               <button className="w-full flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 transition-colors text-left group">
                  <div className="w-7 h-7 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-white"><LayoutTemplate size={14}/></div>
                  <div>
                     <div className="text-[11px] font-bold text-gray-900 leading-none mb-1 group-hover:text-indigo-700">Review Enterprise Twin</div>
                     <div className="text-[9px] font-medium text-gray-500">Deep dive into enterprises</div>
                  </div>
               </button>
               
               <button className="w-full flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-200 transition-colors text-left group">
                  <div className="w-7 h-7 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-white"><Sparkles size={14}/></div>
                  <div>
                     <div className="text-[11px] font-bold text-gray-900 leading-none mb-1 group-hover:text-emerald-700">Create Intervention</div>
                     <div className="text-[9px] font-medium text-gray-500">Start preventive intervention</div>
                  </div>
               </button>
               
               <button className="w-full flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors text-left group">
                  <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-white"><Users size={14}/></div>
                  <div>
                     <div className="text-[11px] font-bold text-gray-900 leading-none mb-1 group-hover:text-blue-700">Schedule Field Visit</div>
                     <div className="text-[9px] font-medium text-gray-500">Visit at-risk enterprises</div>
                  </div>
               </button>
               
               <button className="w-full flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-200 transition-colors text-left group">
                  <div className="w-7 h-7 rounded bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:bg-white"><FileSpreadsheet size={14}/></div>
                  <div>
                     <div className="text-[11px] font-bold text-gray-900 leading-none mb-1 group-hover:text-purple-700">Generate Cashflow Report</div>
                     <div className="text-[9px] font-medium text-gray-500">Optimize lending exposure</div>
                  </div>
               </button>

               <button className="w-full flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-200 transition-colors text-left group">
                  <div className="w-7 h-7 rounded bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 group-hover:bg-white"><PieChart size={14}/></div>
                  <div>
                     <div className="text-[11px] font-bold text-gray-900 leading-none mb-1 group-hover:text-orange-700">Run Scenario Simulation</div>
                     <div className="text-[9px] font-medium text-gray-500">Compare what-if scenarios</div>
                  </div>
               </button>
            </div>
         </div>

      </div>

      {/* 7. Enterprise Cashflow Forecast */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
         <div className="flex items-center justify-between mb-4">
            <h2 className="text-[13px] font-bold text-gray-900 flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">7</span> Enterprise Cashflow Forecast</h2>
            <div className="flex items-center gap-2">
               <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search enterprises, districts..." className="pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg text-[10px] font-medium w-[200px] focus:outline-none focus:border-indigo-500" />
               </div>
               <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 text-[10px] font-bold"><Filter size={12}/> Filters</button>
               <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 text-[10px] font-bold"><Download size={12}/> Export</button>
               <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 text-[10px] font-bold">Bulk Actions <ChevronRight size={12} className="rotate-90"/></button>
               <button className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"><MoreVertical size={12}/></button>
            </div>
         </div>
         
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
               <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                     <th className="py-2.5 pl-3 pr-2"><input type="checkbox" className="rounded border-gray-300" /></th>
                     <th className="py-2.5 px-3 text-[10px] font-semibold text-gray-500">Enterprise</th>
                     <th className="py-2.5 px-3 text-[10px] font-semibold text-gray-500">District</th>
                     <th className="py-2.5 px-3 text-[10px] font-semibold text-gray-500 text-right">Current Cashflow (₹)</th>
                     <th className="py-2.5 px-3 text-[10px] font-semibold text-gray-500 text-right">Forecast Cashflow 90 Days (₹)</th>
                     <th className="py-2.5 px-3 text-[10px] font-semibold text-gray-500 text-center">Liquidity Status</th>
                     <th className="py-2.5 px-3 text-[10px] font-semibold text-gray-500 text-right">Repayment Capacity (₹)</th>
                     <th className="py-2.5 px-3 text-[10px] font-semibold text-gray-500 text-center">Confidence</th>
                     <th className="py-2.5 px-3 text-[10px] font-semibold text-gray-500">AI Recommendation</th>
                     <th className="py-2.5 px-3 text-[10px] font-semibold text-gray-500 text-right">Last Forecast Update</th>
                     <th className="py-2.5 px-3"></th>
                  </tr>
               </thead>
               <tbody>
                  {TABLE_DATA.map((row, i) => (
                     <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="py-3 pl-3 pr-2"><input type="checkbox" className="rounded border-gray-300" /></td>
                        <td className="py-3 px-3">
                           <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><LayoutTemplate size={10} /></div>
                              <span className="text-[11px] font-bold text-gray-900">{row.ent}</span>
                           </div>
                        </td>
                        <td className="py-3 px-3 text-[11px] font-medium text-gray-600">{row.dist}</td>
                        <td className={`py-3 px-3 text-[11px] font-bold text-right ${row.cur.includes('-') ? 'text-red-600' : 'text-gray-900'}`}>{row.cur}</td>
                        <td className={`py-3 px-3 text-[11px] font-bold text-right ${row.for90.includes('-') ? 'text-red-600' : 'text-gray-900'}`}>{row.for90}</td>
                        <td className="py-3 px-3 text-center">
                           <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${row.lColor}`}>{row.liq}</span>
                        </td>
                        <td className="py-3 px-3 text-[11px] font-bold text-gray-900 text-right">{row.rep}</td>
                        <td className={`py-3 px-3 text-[11px] font-bold text-center ${row.cColor}`}>{row.conf}%</td>
                        <td className={`py-3 px-3 text-[10px] font-bold ${row.cColor}`}>{row.ai}</td>
                        <td className="py-3 px-3 text-[10px] font-medium text-gray-500 text-right whitespace-nowrap">{row.last}</td>
                        <td className="py-3 px-3 text-right">
                           <div className="flex items-center justify-end gap-2 text-gray-400">
                              <button className="hover:text-indigo-600"><Eye size={14}/></button>
                              <button className="hover:text-indigo-600"><MoreVertical size={14}/></button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
         
         <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
            <div className="text-[10px] font-medium text-gray-500">Showing 1 to 5 of 152 enterprises</div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-1">
                  <button className="w-5 h-5 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50">{'<'}</button>
                  <button className="w-5 h-5 rounded border-transparent flex items-center justify-center text-[10px] font-bold text-indigo-600 bg-indigo-50">1</button>
                  <button className="w-5 h-5 rounded border-transparent flex items-center justify-center text-[10px] font-semibold text-gray-600 hover:bg-gray-50">2</button>
                  <button className="w-5 h-5 rounded border-transparent flex items-center justify-center text-[10px] font-semibold text-gray-600 hover:bg-gray-50">3</button>
                  <span className="text-gray-400 mx-1">...</span>
                  <button className="w-7 h-5 rounded border-transparent flex items-center justify-center text-[10px] font-semibold text-gray-600 hover:bg-gray-50">31</button>
                  <button className="w-5 h-5 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50">{'>'}</button>
               </div>
               <select className="border border-gray-200 rounded bg-white text-[10px] font-semibold text-gray-600 px-2 py-0.5 outline-none">
                  <option>10 / page</option>
               </select>
            </div>
         </div>
      </div>

    </div>
  );
}
