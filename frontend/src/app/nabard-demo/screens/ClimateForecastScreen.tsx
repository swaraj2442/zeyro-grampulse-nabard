"use client";

import React, { useState, useMemo } from 'react';
import { 
  Filter, Download, RefreshCw, Sparkles, TrendingUp, TrendingDown,
  Activity, ArrowUpRight, ArrowDownRight, ArrowRight, Wallet, AlertTriangle, 
  Banknote, Target, ChevronRight, Play, Eye, MoreVertical, LayoutTemplate, 
  Calendar, FileText, CheckCircle2, CloudRain, Clock, Users, FileSpreadsheet, Search,
  ChevronDown, HelpCircle, Thermometer, ShieldAlert, BarChart2, Droplets
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

const RISK_INDEX_DATA = [
  { name: 'Now', val: 0.35, min: 0.30, max: 0.40 },
  { name: '30D', val: 0.45, min: 0.40, max: 0.50 },
  { name: '90D', val: 0.58, min: 0.50, max: 0.65 },
  { name: '180D', val: 0.65, min: 0.55, max: 0.75 },
  { name: '365D', val: 0.68, min: 0.58, max: 0.80 },
];

const RAINFALL_DEV_DATA = [
  { name: 'Now', val: 0, min: -5, max: 5 },
  { name: '30D', val: -12, min: -18, max: -5 },
  { name: '90D', val: -18, min: -25, max: -10 },
  { name: '180D', val: -5, min: -15, max: 5 },
  { name: '365D', val: -2, min: -10, max: 10 },
];

const TEMP_ANOMALY_DATA = [
  { name: 'Now', val: 0.2, min: 0.1, max: 0.3 },
  { name: '30D', val: 0.5, min: 0.3, max: 0.7 },
  { name: '90D', val: 0.8, min: 0.5, max: 1.1 },
  { name: '180D', val: 1.2, min: 0.8, max: 1.6 },
  { name: '365D', val: 1.4, min: 0.9, max: 1.9 },
];

const INTERVENTION_IMPACT_DATA = [
  { name: 'Now', current: 0.35, after: 0.35 },
  { name: '30D', current: 0.42, after: 0.38 },
  { name: '90D', current: 0.55, after: 0.45 },
  { name: '180D', current: 0.62, after: 0.48 },
  { name: '365D', current: 0.68, after: 0.52 },
];

const DRIVERS = [
  { name: 'Rainfall Deficit', val: 0.72, color: 'bg-red-500' },
  { name: 'Flood Risk', val: 0.68, color: 'bg-orange-500' },
  { name: 'Drought Probability', val: 0.58, color: 'bg-orange-400' },
  { name: 'Temperature Stress', val: 0.49, color: 'bg-yellow-400' },
  { name: 'Water Availability', val: 0.41, color: 'bg-green-500' },
  { name: 'Seasonal Variability', val: 0.35, color: 'bg-green-400' },
];

const TIMELINE = [
  {
    title: '30 Days Outlook',
    badge: 'Moderate Risk',
    badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    metrics: [
      { label: 'District Risk', val: 'Moderate', color: 'text-yellow-600' },
      { label: 'Enterprise Exp.', val: '1,294', color: 'text-gray-900' },
      { label: 'Repayment Imp.', val: '₹ 24.6 Cr', color: 'text-gray-900 font-bold' },
      { label: 'AI Confidence', val: '86%', color: 'text-green-600' },
    ],
    action: 'Increase Monitoring'
  },
  {
    title: '90 Days Outlook',
    badge: 'High Risk',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    metrics: [
      { label: 'District Risk', val: 'High', color: 'text-orange-600' },
      { label: 'Enterprise Exp.', val: '2,436', color: 'text-gray-900' },
      { label: 'Repayment Imp.', val: '₹ 62.3 Cr', color: 'text-gray-900 font-bold' },
      { label: 'AI Confidence', val: '85%', color: 'text-green-600' },
    ],
    action: 'Prepare Interventions'
  },
  {
    title: '180 Days Outlook',
    badge: 'High Risk',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    metrics: [
      { label: 'District Risk', val: 'High', color: 'text-orange-600' },
      { label: 'Enterprise Exp.', val: '3,106', color: 'text-gray-900' },
      { label: 'Repayment Imp.', val: '₹ 96.8 Cr', color: 'text-gray-900 font-bold' },
      { label: 'AI Confidence', val: '83%', color: 'text-green-600' },
    ],
    action: 'Proactive Support'
  },
  {
    title: '365 Days Outlook',
    badge: 'Severe Risk',
    badgeColor: 'bg-red-100 text-red-800 border-red-200',
    metrics: [
      { label: 'District Risk', val: 'Severe', color: 'text-red-600 font-bold' },
      { label: 'Enterprise Exp.', val: '3,842', color: 'text-gray-900' },
      { label: 'Repayment Imp.', val: '₹ 124.6 Cr', color: 'text-gray-900 font-bold' },
      { label: 'AI Confidence', val: '81%', color: 'text-green-600' },
    ],
    action: 'Priority Intervention'
  },
];

const ACTIONS = [
  { title: 'Review High-Risk Districts', sub: 'Deep dive into climate risk', icon: Target },
  { title: 'Create Climate Intervention Plan', sub: 'Design preventive strategies', icon: FileText },
  { title: 'Schedule Preventive Field Visits', sub: 'Plan early enterprise visits', icon: Calendar },
  { title: 'Adjust Lending Strategy', sub: 'Reduce climate exposure', icon: BarChart2 },
  { title: 'Generate Climate Forecast Report', sub: 'Download detailed report', icon: FileSpreadsheet },
  { title: 'Run Scenario Simulation', sub: 'Compare what-if scenarios', icon: Play },
];

const ENTERPRISES = [
  { id: '1', name: 'Shree Ganesh Dairy', dist: 'Satara', sector: 'Dairy', exp: 'Moderate', risk: 'High', rainDep: 'Medium', vul: 0.72, revImp: '-12%', payImp: '-₹ 2.4 Cr', conf: '88%', rec: 'Increase Monitoring', lastUpdate: 'May 24, 2024 08:15 AM' },
  { id: '2', name: 'Sai Agri Producers Co.', dist: 'Sangli', sector: 'Agriculture', exp: 'High', risk: 'Moderate', rainDep: 'High', vul: 0.61, revImp: '-18%', payImp: '-₹ 4.0 Cr', conf: '85%', rec: 'Prepare Intervention', lastUpdate: 'May 24, 2024 08:15 AM' },
  { id: '3', name: 'Maa Bhavani Traders', dist: 'Pune', sector: 'Food Processing', exp: 'Low', risk: 'Low', rainDep: 'Low', vul: 0.89, revImp: '-6%', payImp: '-₹ 0.8 Cr', conf: '86%', rec: 'Monitor Closely', lastUpdate: 'May 24, 2024 08:15 AM' },
  { id: '4', name: 'Kunal Mart Services', dist: 'Kolhapur', sector: 'Rural Retail', exp: 'Moderate', risk: 'High', rainDep: 'Medium', vul: 0.69, revImp: '-14%', payImp: '-₹ 2.1 Cr', conf: '84%', rec: 'Increase Monitoring', lastUpdate: 'May 24, 2024 08:15 AM' },
  { id: '5', name: 'Vijay Kiran Stores', dist: 'Solapur', sector: 'Agriculture', exp: 'High', risk: 'High', rainDep: 'Severe', vul: 0.83, revImp: '-22%', payImp: '-₹ 3.6 Cr', conf: '81%', rec: 'Immediate Action', lastUpdate: 'May 24, 2024 08:15 AM' },
  { id: '6', name: 'Jai Malhar Cold Storage', dist: 'Jalgaon', sector: 'Food Processing', exp: 'High', risk: 'High', rainDep: 'High', vul: 0.79, revImp: '-16%', payImp: '-₹ 2.9 Cr', conf: '83%', rec: 'Prepare Intervention', lastUpdate: 'May 24, 2024 08:15 AM' },
  { id: '7', name: 'Vitthal Sugar Factory', dist: 'Solapur', sector: 'Agriculture', exp: 'Severe', risk: 'High', rainDep: 'Severe', vul: 0.88, revImp: '-25%', payImp: '-₹ 5.2 Cr', conf: '80%', rec: 'Immediate Action', lastUpdate: 'May 24, 2024 08:15 AM' },
];

const DISTRICT_GEO_MOCK = [
  { name: 'Jalna', x: 230, y: 150, risk: 'Severe', score: 0.78, rain: '-18%', index: 0.72, impact: '₹ 8.6 Cr', color: '#dc2626' },
  { name: 'Beed', x: 210, y: 190, risk: 'Severe', score: 0.82, rain: '-24%', index: 0.78, impact: '₹ 11.2 Cr', color: '#dc2626' },
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

export default function ClimateForecastScreen({ navigateTo }: Props) {
  const [search, setSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>('Jalna');
  const [zoomLevel, setZoomLevel] = useState(1);

  const activeDistrictInfo = useMemo(() => {
    return DISTRICT_GEO_MOCK.find(d => d.name === selectedDistrict) || DISTRICT_GEO_MOCK[0];
  }, [selectedDistrict]);

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
             <span className="text-gray-900">Climate Forecast</span>
          </div>
          <h1 className="text-[20px] font-extrabold text-gray-900 leading-none">Climate Forecast</h1>
          <p className="text-[11px] font-medium text-gray-400 mt-1">
             AI-powered climate forecasting and enterprise impact prediction across 30, 90, 180 and 365-day horizons.
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

      {/* 1. AI Climate Summary */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-[#f0fdf4] border border-green-100 flex items-center justify-center shrink-0">
              <div className="relative">
                <CloudRain size={22} className="text-green-700" />
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[7px] font-black px-0.5 rounded leading-none">AI</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Overall Climate Outlook</span>
                <span className="bg-red-50 text-red-700 border border-red-100 rounded-full px-2 py-0.5 text-[9px] font-bold leading-none">Elevated Risk</span>
              </div>
              <p className="text-[12px] text-gray-700 leading-relaxed font-bold">
                 Monsoon onset delayed with high probability of rainfall deficit in northern and central districts. 
                 Expect soil moisture levels to drop. 18 out of 36 districts exhibit high or critical climate risk markers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:items-center gap-6 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100 pt-5 lg:pt-0 lg:pl-6">
            <div className="min-w-[90px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">High-Risk Districts</div>
              <div className="text-[18px] font-black text-gray-900 mt-0.5">18</div>
              <div className="text-[9px] font-bold text-red-500">Out of 36 districts</div>
            </div>
            <div className="min-w-[90px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">Forecast Horizon</div>
              <div className="text-[18px] font-black text-gray-900 mt-0.5">365 Days</div>
              <div className="text-[9px] font-bold text-gray-500">Multiple horizon model</div>
            </div>
            <div className="min-w-[90px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">AI Confidence</div>
              <div className="text-[18px] font-black text-gray-900 mt-0.5">87%</div>
              <div className="text-[9px] font-bold text-green-600">High confidence</div>
            </div>
            <div className="min-w-[90px]">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">Primary Driver</div>
              <div className="text-[18px] font-black text-gray-900 mt-0.5">Rainfall Deficit</div>
              <div className="text-[9px] font-bold text-orange-500">Monsoon delay indicator</div>
            </div>
          </div>

          <div className="shrink-0 flex items-center self-stretch lg:border-l border-gray-100 lg:pl-6">
            <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-700 bg-white hover:bg-gray-50 ml-auto">
              Explain <ChevronDown size={12} />
            </button>
          </div>
        </div>

        {/* Sources pill row */}
        <div className="flex flex-wrap items-center gap-1.5 mt-5 pt-4 border-t border-gray-100">
          <span className="text-[10px] font-bold text-gray-400 mr-2 uppercase">Forecast Sources:</span>
          {['IMD Forecast', 'Satellite Rainfall', 'Historical Weather', 'Enterprise History', 'Cashflow Model', 'Climate Risk Engine', 'Market Intelligence', 'Remote Sensing'].map((source, i) => (
            <span key={i} className="bg-gray-50 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-gray-100/50 hover:bg-gray-100 cursor-pointer transition-colors">
              {source}
            </span>
          ))}
        </div>
      </div>

      {/* 2. Climate Risk KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { 
            title: 'Climate Risk Index', 
            sub: '(365 Days)', 
            val: '0.68', 
            trend: '+0.12 vs last', 
            trendCol: 'text-green-600 bg-green-50 border-green-100', 
            up: true, 
            spark: MINI_CHART_DATA_1, 
            sparkColor: '#10b981' 
          },
          { 
            title: 'High Exposure Districts', 
            sub: 'Exposure Level', 
            val: '14', 
            trend: '+2 vs last forecast', 
            trendCol: 'text-green-600 bg-green-50 border-green-100', 
            up: true, 
            spark: MINI_CHART_DATA_2, 
            sparkColor: '#10b981' 
          },
          { 
            title: 'Enterprises at Risk', 
            sub: 'Portfolio Count', 
            val: '3,842', 
            trend: '+412 vs last forecast', 
            trendCol: 'text-red-600 bg-red-50 border-red-100', 
            up: true, 
            spark: MINI_CHART_DATA_2, 
            sparkColor: '#ef4444' 
          },
          { 
            title: 'Expected Repayment Impact', 
            sub: 'Projected Loss', 
            val: '₹ 124.6 Cr', 
            trend: '+18.3% vs last', 
            trendCol: 'text-red-600 bg-red-50 border-red-100', 
            up: false, 
            spark: MINI_CHART_DATA_3, 
            sparkColor: '#ef4444' 
          },
          { 
            title: 'Predicted Intervention Need', 
            sub: 'Actions Required', 
            val: '1,276', 
            trend: '+154 vs last forecast', 
            trendCol: 'text-green-600 bg-green-50 border-green-100', 
            up: true, 
            spark: MINI_CHART_DATA_1, 
            sparkColor: '#10b981' 
          },
          { 
            title: 'Forecast Confidence', 
            sub: 'AI Model Reliability', 
            val: '87%', 
            trend: 'High confidence', 
            trendCol: 'text-green-600 bg-green-50 border-green-100', 
            up: true, 
            spark: MINI_CHART_DATA_2, 
            sparkColor: '#10b981',
            textOnly: true
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

      {/* 3. Climate Forecast Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Workspace Column: Charts & Vulnerability Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          <div className="bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
            <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">Climate Forecast Workspace</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Chart 1: Climate Risk Forecast */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold text-gray-800">Climate Risk Forecast</span>
                  <div className="flex items-center gap-1.5 text-[8px] font-bold text-gray-400">
                    <span className="inline-block w-1.5 h-1.5 bg-green-600 rounded-full"></span> Forecast
                    <span className="inline-block w-1.5 h-1.5 bg-green-200 rounded-full"></span> Range
                  </div>
                </div>
                <div className="h-[120px] w-full bg-gray-50/50 rounded-2xl p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={RISK_INDEX_DATA} margin={{ top: 5, right: 5, left: -25, bottom: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 1]} ticks={[0.2, 0.4, 0.6, 0.8, 1.0]} tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                      <Area dataKey="max" stroke="none" fill="#dcfce7" fillOpacity={0.4} />
                      <Area dataKey="min" stroke="none" fill="#ffffff" fillOpacity={1.0} />
                      <Line type="monotone" dataKey="val" stroke="#16a34a" strokeWidth={1.5} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Rainfall Deviation */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold text-gray-800">Rainfall Deviation (%)</span>
                  <div className="flex items-center gap-1.5 text-[8px] font-bold text-gray-400">
                    <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full"></span> Forecast
                  </div>
                </div>
                <div className="h-[120px] w-full bg-gray-50/50 rounded-2xl p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={RAINFALL_DEV_DATA} margin={{ top: 5, right: 5, left: -25, bottom: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                      <YAxis domain={[-40, 40]} ticks={[-40, -20, 0, 20, 40]} tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                      <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="2 2" />
                      <Area dataKey="max" stroke="none" fill="#dbeafe" fillOpacity={0.4} />
                      <Area dataKey="min" stroke="none" fill="#ffffff" fillOpacity={1.0} />
                      <Line type="monotone" dataKey="val" stroke="#2563eb" strokeWidth={1.5} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3: Temperature Projection */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold text-gray-800">Temp Anomaly (°C)</span>
                  <div className="flex items-center gap-1.5 text-[8px] font-bold text-gray-400">
                    <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full"></span> Anomaly
                  </div>
                </div>
                <div className="h-[120px] w-full bg-gray-50/50 rounded-2xl p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={TEMP_ANOMALY_DATA} margin={{ top: 5, right: 5, left: -25, bottom: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 2.0]} ticks={[0.5, 1.0, 1.5, 2.0]} tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                      <Area dataKey="max" stroke="none" fill="#fee2e2" fillOpacity={0.4} />
                      <Area dataKey="min" stroke="none" fill="#ffffff" fillOpacity={1.0} />
                      <Line type="monotone" dataKey="val" stroke="#dc2626" strokeWidth={1.5} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>

          {/* Vulnerability Row Cards */}
          <div className="bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
            <h3 className="text-[12px] font-extrabold text-gray-900 mb-4">Enterprise Climate Vulnerability</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { title: 'Highly Resilient', val: '1,842', pct: '48%', color: 'text-green-700 bg-green-50 border-green-100' },
                { title: 'Moderately Exposed', val: '1,538', pct: '28%', color: 'text-yellow-700 bg-yellow-50 border-yellow-100' },
                { title: 'High Exposure', val: '932', pct: '15%', color: 'text-orange-700 bg-orange-50 border-orange-100' },
                { title: 'Critical Exposure', val: '386', pct: '9%', color: 'text-red-700 bg-red-50 border-red-100' },
              ].map((card, i) => (
                <div key={i} className={`p-4 rounded-2xl border ${card.color} flex flex-col justify-between h-[80px]`}>
                  <span className="text-[10px] font-bold block leading-none">{card.title}</span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-[18px] font-black leading-none">{card.val}</span>
                    <span className="text-[10px] font-extrabold">{card.pct}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Climate Driver Breakdown */}
            <div className="bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <h3 className="text-[12px] font-extrabold text-gray-900 mb-4">Climate Driver Breakdown</h3>
              <div className="space-y-3 flex-1 flex flex-col justify-center">
                {DRIVERS.map((driver, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-600">
                      <span>{driver.name}</span>
                      <span className="text-gray-900">{driver.val}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${driver.color}`} style={{ width: `${driver.val * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Intervention Impact Forecast */}
            <div className="bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[12px] font-extrabold text-gray-900">Intervention Impact Forecast (365 Days)</h3>
                <div className="flex flex-col text-[8px] font-bold text-gray-400 gap-0.5 items-end">
                  <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> Current Projection</div>
                  <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> After Intervention</div>
                </div>
              </div>
              <div className="h-[150px] w-full bg-gray-50/50 rounded-2xl p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={INTERVENTION_IMPACT_DATA} margin={{ top: 5, right: 5, left: -25, bottom: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 1]} tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                    <Line type="monotone" dataKey="current" stroke="#f97316" strokeWidth={1.5} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="after" stroke="#10b981" strokeWidth={1.5} strokeDasharray="3 3" dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>

        {/* Middle Column: Interactive Heatmap (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] relative">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[13px] font-extrabold text-gray-900">District Climate Risk Heatmap</h3>
                <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block mt-0.5">365 Days projection horizon</span>
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
                    <div className="flex justify-between"><span>Exposure Score:</span><span className="text-gray-900">{activeDistrictInfo.score}</span></div>
                    <div className="flex justify-between"><span>Rainfall Dev:</span><span className="text-red-500 font-bold">{activeDistrictInfo.rain}</span></div>
                    <div className="flex justify-between"><span>Enterprise Risk:</span><span className="text-gray-900">{activeDistrictInfo.index}</span></div>
                    <div className="flex justify-between"><span>Repay Impact:</span><span className="text-red-500 font-bold">{activeDistrictInfo.impact}</span></div>
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
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500"></span> Very Low (0-0.22)</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-400"></span> Low (0.22-0.40)</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yellow-400"></span> Moderate (0.40-0.60)</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-orange-500"></span> High (0.60-0.80)</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-600"></span> Severe (0.80-1.00)</div>
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

      {/* 6. AI Climate Insights & Predictors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left column: AI Climate Insights (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[13px] font-extrabold text-gray-900">AI Climate Insights</h3>
            <button className="text-green-700 text-[10px] font-bold hover:underline">View all insights</button>
          </div>

          <div className="space-y-4">
            {[
              { icon: CloudRain, text: 'Northern districts entering drought watch in next 90 days. Rainfall deficit likely to impact 612 enterprises.', color: 'text-blue-500 bg-blue-50 border-blue-100', val: '86% Review Districts' },
              { icon: ShieldAlert, text: 'Flood exposure increasing along river-basins. 1,042 enterprises in flood-prone zones.', color: 'text-red-500 bg-red-50 border-red-100', val: '89% Monitor Now' },
              { icon: Thermometer, text: 'Heat stress may reduce seasonal productivity. Temperature anomalies expected to rise.', color: 'text-orange-500 bg-orange-50 border-orange-100', val: '83% View Impact' },
              { icon: Target, text: 'Irrigated enterprises projected to outperform rain-fed by 12-15%.', color: 'text-green-500 bg-green-50 border-green-100', val: '88% View Insights' },
              { icon: BarChart2, text: 'Climate-sensitive sectors require immediate lending review.', color: 'text-purple-500 bg-purple-50 border-purple-100', val: '84% Review Sectors' },
              { icon: CheckCircle2, text: 'Preventive interventions can reduce repayment risk by up to 22%.', color: 'text-green-500 bg-green-50 border-green-100', val: '90% Create Plan' },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-2xl transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 ${item.color}`}>
                    <item.icon size={12} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-700 leading-snug">{item.text}</span>
                </div>
                <button className="text-[9px] font-extrabold text-green-700 bg-green-50 hover:bg-green-100 border border-green-100 rounded-lg px-2 py-1 shrink-0 text-center">
                  {item.val}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Why AI predicts this (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <h3 className="text-[13px] font-extrabold text-gray-900 mb-5">Why AI predicts this</h3>
          
          <div className="space-y-4 flex-1 flex flex-col justify-between">
            {/* Predictor drivers */}
            <div className="space-y-2.5">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase">Top Climate Drivers (Top 5)</div>
              <div className="flex items-center gap-1.5">
                {[100, 85, 70, 50, 30].map((w, idx) => (
                  <div key={idx} className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-600 rounded-full" style={{ width: `${w}%` }}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* General metrics */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center text-[11px] font-semibold">
                <span className="text-gray-400">Similar Historical Seasons:</span>
                <span className="text-gray-900 font-bold">2018, 2019, 2021 (Moderate Drought)</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-semibold">
                <span className="text-gray-400">Confidence Interval:</span>
                <span className="text-gray-900 font-bold">0.52 - 0.84</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-semibold">
                <span className="text-gray-400">Alternative Scenario:</span>
                <span className="text-gray-900 font-bold">Low Rainfall Scenario</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-semibold">
                <span className="text-gray-400">AI Model Version:</span>
                <span className="text-gray-900 font-bold">ClimateRisk v3.2.1</span>
              </div>
            </div>

            {/* Model status freshness bar */}
            <div className="pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center text-[10px] font-extrabold text-gray-400 uppercase mb-2">
                <span>Data Freshness</span>
                <span className="text-green-600">92%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-600 rounded-full" style={{ width: '92%' }}></div>
              </div>
              <div className="text-[9px] font-bold text-gray-400 mt-1">Updated 12 hours ago</div>
            </div>
          </div>

        </div>

      </div>

      {/* 7. Enterprise Climate Forecast (Table) */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-[13px] font-extrabold text-gray-900">Enterprise Climate Forecast</h3>
          
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
                <th className="pb-3">Sector</th>
                <th className="pb-3 text-center">Exposure</th>
                <th className="pb-3 text-center">Climate Risk</th>
                <th className="pb-3 text-center">Rain Dependency</th>
                <th className="pb-3 text-center">Vuln. Score</th>
                <th className="pb-3 text-center">Revenue Impact</th>
                <th className="pb-3 text-center">Repayment Impact</th>
                <th className="pb-3 text-center">Confidence</th>
                <th className="pb-3">AI Recommendation</th>
                <th className="pb-3">Last Update</th>
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
                  
                  {/* Exposure Badge */}
                  <td className="py-3.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                      row.exp === 'High' || row.exp === 'Severe' ? 'bg-red-50 text-red-700' :
                      row.exp === 'Moderate' ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'
                    }`}>
                      {row.exp}
                    </span>
                  </td>

                  {/* Climate Risk Badge */}
                  <td className="py-3.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                      row.risk === 'High' ? 'bg-red-50 text-red-700' :
                      row.risk === 'Moderate' ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'
                    }`}>
                      {row.risk}
                    </span>
                  </td>

                  {/* Rainfall Dependency Badge */}
                  <td className="py-3.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                      row.rainDep === 'High' || row.rainDep === 'Severe' ? 'bg-red-50 text-red-700' :
                      row.rainDep === 'Medium' ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'
                    }`}>
                      {row.rainDep}
                    </span>
                  </td>

                  {/* Vulnerability Score */}
                  <td className={`py-3.5 text-[11px] font-black text-center ${
                    row.vul >= 0.8 ? 'text-red-600' : row.vul >= 0.6 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {row.vul}
                  </td>

                  {/* Revenue Impact */}
                  <td className="py-3.5 text-[11px] font-extrabold text-red-500 text-center">{row.revImp}</td>

                  {/* Repayment Impact */}
                  <td className="py-3.5 text-[11px] font-black text-red-500 text-center">{row.payImp}</td>

                  {/* Confidence */}
                  <td className="py-3.5 text-[11px] font-bold text-green-600 text-center">{row.conf}</td>

                  {/* Recommendation */}
                  <td className="py-3.5">
                    <button className="text-[10px] font-extrabold text-green-700 hover:text-green-800 hover:underline">
                      {row.rec}
                    </button>
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
            Showing 1 to {filteredEnterprises.length} of {filteredEnterprises.length === ENTERPRISES.length ? '3,842' : filteredEnterprises.length} enterprises
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
