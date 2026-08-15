"use client";

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, ComposedChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, PieChart, Pie, Cell } from 'recharts';
import { 
  Building, MapPin, Calendar, CheckCircle2, TrendingUp, TrendingDown,
  AlertTriangle, CreditCard, Activity, ShieldCheck, Target, ChevronDown,
  ArrowRight, Search, Menu, Filter, Info, Bell, FileText, Download,
  Share, Clock, DollarSign, Leaf, Sparkles, HeartPulse, ShieldAlert,
  Users, Factory, AlertCircle, Droplets, Droplet, Sun, Wind, Thermometer, Box, Star, CalendarDays, CheckCircle, Sprout, Cloud, CloudRain, ArrowDown, ArrowUp, Minus, BarChart2, Package, Waves, Store, ShoppingCart, Briefcase, Settings, ClipboardList, IndianRupee, Lock, Eye, RefreshCw
} from 'lucide-react';
import { useGramPulse } from '../store/GramPulseContext';
import { selectEnterpriseProfile, selectEnterpriseForecast } from '../store/gramPulseSelectors';
import apiClient from '../services/apiClient';
import { formatCurrency, formatPercent } from '../utils/formatters';
import farm_satellite_bg from '../../../assests/images/farm_satellite_bg.png';
import DataSourceBadge from '../components/DataSourceBadge';
import UnderwritingModal from '../components/UnderwritingModal';
import { useQuery } from '@tanstack/react-query';

interface Props { enterprise: string | null; onBack: () => void; }










function TableSparkline({ up }: { up: boolean }) {
  const data = Array.from({ length: 6 }, () => 50 + Math.random() * 50);
  const color = up ? '#16a34a' : '#ef4444';
  return (
    <div className="w-12 h-5">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data.map((v,i)=>({v,i}))}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}




function DscrSparkline() {
  const data = Array.from({ length: 20 }, (_, i) => ({ v: 1.5 + Math.sin(i)*0.1 + i*0.02, i }));
  return (
    <div className="w-full h-12 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="v" stroke="#16a34a" strokeWidth={2.5} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}











function MiniSparkline({ color, isBad = false }: { color: string, isBad?: boolean }) {
  const data = Array.from({ length: 15 }, () => Math.random() * 10 + 50);
  const chartData = data.map((v, i) => ({ val: v, i }));
  return (
    <div className="w-full h-8 mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line type="monotone" dataKey="val" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const TABS = ['Risk Centre', 'Overview', 'Financial', 'Credit', 'Operations', 'Climate', 'Market', 'Timeline', 'AI Edition'];

export default function EnterpriseTwinScreen({ enterprise, onBack }: Props) {
  const { state } = useGramPulse();
  const [activeTab, setActiveTab] = useState('Risk Centre');
  const [showUnderwriting, setShowUnderwriting] = useState(false);
  
  const entId = enterprise || 'ENT-000124';

  const { data: twinData, isLoading } = useQuery({
    queryKey: ['digitalTwin', entId],
    queryFn: () => apiClient.getDigitalTwin(entId).then(res => res.data)
  });

  const profile: any = twinData?.identity;
  const metrics: any = (twinData as any)?.metrics;
  const forecast: any = twinData?.forecast;
  const earlyWarning = twinData?.earlyWarning;
  const dataMode = (twinData as any)?.dataMode || 'LIVE';
  const {
    RISK_TREND_DATA = [],
    CASHFLOW_DATA = [],
    DONUT_DATA = [],
    FINANCIAL_CASHFLOW_DATA = [],
    INFLOW_BREAKDOWN = [],
    OUTFLOW_BREAKDOWN = [],
    RECENT_TRANSACTIONS = [],
    ACTIVE_LOANS = [],
    REPAYMENT_DATA = [],
    CREDIT_UTILIZATION = [],
    PRODUCTION_DATA = [],
    HERD_DATA = [],
    FEED_DATA = [],
    RAINFALL_DATA = [],
    MILK_PRICE_DATA = [],
    FEED_PRICE_DATA = [],
    DEMAND_DATA = [],
    TIMELINE_EVENTS = [],
    AI_CASHFLOW_DATA = [],
    AI_CREDIT_HEALTH_DATA = []
  } = (twinData as any)?.twinDetails || {};

  if (isLoading || !profile) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-4 pb-8 w-full min-h-screen max-w-[1400px] mx-auto p-5 rounded-xl shadow-sm overflow-hidden relative bg-[#fafafa]">
      
      {/* Breadcrumb & Header Row */}
      <div className="bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center text-[11px] text-gray-500 mb-4 gap-1.5">
          <span className="cursor-pointer hover:text-gray-900" onClick={onBack}>Portfolio</span>
          <span>›</span>
          <span className="cursor-pointer hover:text-gray-900" onClick={onBack}>Enterprise Explorer</span>
          <span>›</span>
          <span className="cursor-pointer hover:text-gray-900" onClick={onBack}>Enterprise Twin</span>
          <span>›</span>
          <span className="text-gray-900 font-medium">{activeTab}</span>
        </div>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-[22px] font-bold text-gray-900">{profile.name}</h1>
              <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide uppercase">Active</span>
              <DataSourceBadge dataMode={dataMode} />
              <Star size={18} className="text-gray-500 cursor-pointer hover:text-yellow-400 transition-colors" />
            </div>
            
            <div className="flex items-center gap-4 text-[12px] text-gray-500">
              <div className="flex items-center gap-1"><Building size={14} /> {profile.sector}</div>
              <div className="flex items-center gap-1"><MapPin size={14} /> {profile.district}, {profile.state}</div>
              <div className="flex items-center gap-1"><Activity size={14} /> {entId}</div>
              <div className="flex items-center gap-1"><Calendar size={14} /> {profile.enterpriseType} | {profile.ownershipType}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-100 rounded-xl text-[12px] font-semibold text-gray-200 hover:bg-white/5 transition-colors">
              <Share size={14} /> Share
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-100 rounded-xl text-[12px] font-semibold text-gray-200 hover:bg-white/5 transition-colors">
              <Download size={14} /> Export
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#d9f99d] text-[#1c2a1c] rounded-xl text-[12px] font-semibold hover:bg-[#15803d] transition-colors shadow-sm">
              <FileText size={14} /> Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white backdrop-blur-md rounded-full p-1.5 gap-2 overflow-x-auto scrollbar-hide my-4 max-w-fit">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-[12px] font-bold whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab ? 'border-[#16a34a] text-green-700' : 'text-gray-600 hover:text-gray-900 rounded-full hover:bg-white'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      
      {activeTab === 'Overview' && (
        <div className="space-y-4 animate-in fade-in mt-4">
          {/* AI Summary Card */}
      <div className="bg-[#d9f99d]/10  border border-green-100 rounded-[32px] p-5 flex items-start gap-6 relative overflow-hidden mt-4">
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0 shadow-sm border border-green-200/50">
          <Sparkles size={24} className="text-green-700" />
        </div>
        
        <div className="flex-1 pr-4 border-r border-green-200/60">
          <h3 className="text-[14px] font-bold text-gray-900 mb-1.5">AI Summary</h3>
          <p className="text-[13px] text-green-800 leading-relaxed">
            Krishna Dairy Farm is healthy with strong cash-flow stability and on-time repayments. Milk prices increased while feed costs remain elevated. Projected cash balance stays positive over the next 6 months.
          </p>
        </div>
        
        <div className="shrink-0 px-4 border-r border-green-200/60 flex flex-col items-center justify-center">
          <CheckCircle2 size={28} className="text-green-700 mb-1" />
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">AI Confidence</div>
          <div className="text-[15px] font-extrabold text-green-700">High (92%)</div>
          <div className="text-[9px] text-gray-500 mt-1">Updated today, 08:30 AM</div>
        </div>
        
        <div className="flex-1 pl-2">
          <h3 className="text-[11px] font-bold text-gray-900 mb-2">AI Key Takeaways</h3>
          <ul className="space-y-1.5 mb-2">
            {['Cash-flow expected to remain positive in next 6 months', 'Repayment probability remains strong at 96%', 'Feed cost increase is the key risk driver', 'Continue monitoring rainfall in next 30 days'].map((point, i) => (
              <li key={i} className="text-[11px] text-green-800 flex items-start gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#16a34a] mt-1.5 shrink-0" />
                {point}
              </li>
            ))}
          </ul>
          <div className="text-right">
            <button className="text-green-700 text-[11px] font-bold hover:underline">View full AI brief →</button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-6 gap-4">
        {[
          { label: 'Risk Score', value: profile.riskScore || 'N/A', sub: '/ 100', delta: 'Live', dsub: '', icon: HeartPulse, color: '#16a34a', dcol: 'text-green-700' },
          { label: 'Forecast Deficit', value: forecast ? formatCurrency((forecast as any)?.earlyWarning?.forecastDeficit || 0) : 'N/A', sub: '', delta: 'Projected', dsub: '', icon: TrendingDown, color: '#16a34a', dcol: 'text-gray-500' },
          { label: 'Account Status', value: profile.accountStatus || 'N/A', sub: '', delta: profile.currentDpd > 0 ? `${profile.currentDpd} DPD` : 'Current', dsub: '', icon: ShieldCheck, color: '#16a34a', dcol: 'text-green-700' },
          { label: 'Risk Level', value: profile.riskLevel || 'N/A', sub: '', delta: 'Stable', dsub: '', icon: AlertTriangle, color: '#16a34a', dcol: 'text-gray-500' },
          { label: 'Warning Lead', value: `${profile.warningLeadTimeDays || 0} Days`, sub: '', delta: 'Alert', dsub: '', icon: ShieldAlert, color: '#ef4444', dcol: 'text-[#ef4444]' },
          { label: 'Data Source', value: profile.enterpriseDataSource || 'Live', sub: '', delta: 'Verified', dsub: '', icon: Users, color: '#a855f7', dcol: 'text-gray-500' },
        ].map((kpi, i) => (
          <div key={i} className="border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between bg-white relative overflow-hidden group hover:border-gray-100 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 rounded bg-white/5">
                <kpi.icon size={14} className="text-gray-500" />
              </div>
              <span className="text-[11px] font-semibold text-gray-600 truncate">{kpi.label}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[24px] font-bold text-gray-900">{kpi.value}</span>
              {kpi.sub && <span className="text-[12px] font-medium text-gray-500">{kpi.sub}</span>}
            </div>
            <div className={`text-[10px] font-bold flex items-center gap-1 mt-1 ${kpi.dcol}`}>
              {kpi.delta} <span className="text-gray-500 font-medium">{kpi.dsub}</span>
            </div>
            <MiniSparkline color={kpi.color} />
          </div>
        ))}
      </div>

      {/* Middle Content Grid */}
      <div className="grid grid-cols-12 gap-4">
        
        {/* Main Chart Section */}
        <div className="col-span-6 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[13px] font-bold text-gray-900 flex items-center gap-1.5">
              Cash-flow Forecast (₹) <AlertTriangle size={12} className="text-gray-500" />
            </h3>
          </div>
          
          <div className="flex items-center gap-4 text-[10px] font-semibold text-gray-500 mb-6 px-4">
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#22c55e]" /> Inflow</div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#f87171]" /> Outflow</div>
            <div className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-[#16a34a]" /> Net Cash-flow</div>
            <div className="flex items-center gap-1.5"><span className="w-4 h-0.5 border-t border-dashed border-[#16a34a]" /> Forecast</div>
          </div>

          <div className="flex-1 min-h-[220px] relative">
            {/* Forecast Overlay */}
            <div className="absolute top-0 right-0 bottom-6 w-[45%] bg-white/5/50 border-l border-dashed border-gray-300 pointer-events-none z-0 flex justify-center">
              <span className="text-[10px] font-bold text-gray-500 mt-2">Forecast Period</span>
            </div>
            
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={(forecast?.forecast as any[]) || CASHFLOW_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip cursor={{fill: 'transparent'}} />
                
                <Bar dataKey="operatingInflow" name="Inflow" fill="#86efac" barSize={8} radius={[2, 2, 0, 0]} stackId="a" />
                <Bar dataKey="operatingOutflow" name="Outflow" fill="#fca5a5" barSize={8} radius={[0, 0, 2, 2]} stackId="a" />
                
                <Line type="monotone" name="Closing Balance" dataKey="closingCashBalance" stroke="#16a34a" strokeWidth={2} dot={{ r: 4, fill: '#16a34a', strokeWidth: 0 }} />
                <Line type="monotone" name="After Debt Service" dataKey="cashAfterDebtService" stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={2} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex items-center justify-between bg-[#f0fdf4] border border-green-200 px-4 py-2.5 rounded-xl mt-4 text-[11px]">
            <div className="flex items-center gap-2 font-semibold text-[#15803d]">
              <CheckCircle2 size={14} className="text-green-700" />
              Forecast deficit is projected at {formatCurrency((forecast as any)?.earlyWarning?.forecastDeficit || 0)}.
            </div>
            <button className="text-green-700 font-bold hover:underline flex items-center gap-1">View detailed forecast <ArrowRight size={12} /></button>
          </div>
        </div>

        {/* Right Top Stack */}
        <div className="col-span-6 grid grid-cols-2 gap-4">
          
          {/* Credit Health */}
          <div className="bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
            <h3 className="text-[13px] font-bold text-gray-900 mb-4 flex items-center gap-1.5">Credit Health <AlertTriangle size={12} className="text-gray-500" /></h3>
            <div className="flex items-center gap-4">
              <div className="relative w-[110px] h-[110px] shrink-0">
                <PieChart width={110} height={110}>
                  <Pie data={DONUT_DATA} cx={55} cy={55} innerRadius={42} outerRadius={55} dataKey="value" stroke="none">
                    {DONUT_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[22px] font-bold text-gray-900">96%</span>
                  <span className="text-[8px] text-gray-500 uppercase font-bold text-center leading-tight">On-time<br/>Repayments</span>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                {[
                  { label: 'Current', val: '₹2,84,000', pct: '92%', col: '#16a34a' },
                  { label: '1-15 Days Past Due', val: '₹14,800', pct: '4.6%', col: '#f59e0b' },
                  { label: '16-30 Days Past Due', val: '₹6,800', pct: '2.1%', col: '#f97316' },
                  { label: '>30 Days Past Due', val: '₹5,000', pct: '1.5%', col: '#ef4444' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5 w-[90px]">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.col }} />
                      <span className="text-gray-600 font-medium truncate">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-1 justify-end">
                      <span className="font-bold text-gray-900">{item.val}</span>
                      <span className="text-gray-500">({item.pct})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enterprise Snapshot */}
          <div className="bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
            <h3 className="text-[13px] font-bold text-gray-900 mb-4">Enterprise Snapshot</h3>
            <div className="space-y-3 flex-1">
              {[
                { label: 'Constitution', val: profile.ownershipType },
                { label: 'Vintage', val: 'N/A' },
                { label: 'Sector', val: profile.sector },
                { label: 'Status', val: profile.accountStatus },
                { label: 'Data Source', val: profile.enterpriseDataSource },
                { label: 'Risk Model', val: (forecast?.provenance as any)?.riskEngineVersion || 'N/A' },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-gray-500">{row.label}</span>
                  <span className="text-[11px] font-bold text-gray-900">{row.val}</span>
                </div>
              ))}
            </div>
            <button className="text-green-700 text-[11px] font-bold flex items-center gap-1 mt-4 hover:underline">
              View full profile <ArrowRight size={12} />
            </button>
          </div>
        </div>

      </div>
      
      {/* Bottom Content Grid */}
      <div className="grid grid-cols-12 gap-4">
        
        {/* Climate Impact */}
        <div className="col-span-3 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <h3 className="text-[13px] font-bold text-gray-900 flex items-center gap-1.5 mb-2">Climate Impact <AlertTriangle size={12} className="text-gray-500" /></h3>
          <div className="flex items-end justify-between py-2">
            <div>
              <div className="text-[10px] text-gray-500 font-medium mb-1">Rainfall Deficit (vs Normal)</div>
              <div className="text-[28px] font-bold text-[#ef4444] leading-none">-24%</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-500 font-medium mb-0.5">Affected Districts</div>
              <div className="text-[14px] font-bold text-gray-900 mb-2">12</div>
              <div className="text-[10px] text-gray-500 font-medium mb-0.5">At Risk Enterprises</div>
              <div className="text-[14px] font-bold text-gray-900">96</div>
            </div>
          </div>
          <button className="text-green-700 text-[11px] font-bold flex items-center gap-1 mt-2 hover:underline">
            View climate details <ArrowRight size={12} />
          </button>
        </div>

        {/* Market Signals */}
        <div className="col-span-3 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <h3 className="text-[13px] font-bold text-gray-900 flex items-center gap-1.5 mb-4">Market Signals <AlertTriangle size={12} className="text-gray-500" /></h3>
          <div className="space-y-4">
            {[
              { label: 'Milk Price (₹/L)', val: '↑ 4.8%', icon: TrendingUp },
              { label: 'Feed Cost Index', val: '↑ 6.2%', icon: TrendingUp },
              { label: 'Maize Price (₹/qtl)', val: '↑ 2.1%', icon: TrendingUp },
            ].map((sig, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-[#f0fdf4] text-green-700"><sig.icon size={12} /></div>
                  <span className="text-[11px] font-semibold text-gray-200">{sig.label}</span>
                </div>
                <span className={`text-[11px] font-bold text-green-700`}>{sig.val}</span>
              </div>
            ))}
          </div>
          <button className="text-green-700 text-[11px] font-bold flex items-center gap-1 mt-4 hover:underline">
            View market dashboard <ArrowRight size={12} />
          </button>
        </div>

        {/* Recommended Actions */}
        <div className="col-span-3 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <h3 className="text-[13px] font-bold text-gray-900 mb-4">Recommended Actions</h3>
          <div className="space-y-3">
            {[
              { title: 'Continue regular monitoring', sub: 'Cash-flow outlook is healthy', tag: 'Low', col: 'text-green-700 bg-[#f0fdf4] border-green-200', icon: Activity },
              { title: 'Monitor feed cost impact', sub: 'Feed Cost Index up by 6.2%', tag: 'Medium', col: 'text-[#f59e0b] bg-[#fffbeb] border-[#fde68a]', icon: FileText },
              { title: 'Encourage digital collections', sub: 'UPI inflow share at 68%', tag: 'Low', col: 'text-green-700 bg-[#f0fdf4] border-green-200', icon: CheckCircle },
            ].map((act, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`p-1.5 rounded border ${act.col} mt-0.5`}><act.icon size={12} /></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-900">{act.title}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${act.col}`}>{act.tag}</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{act.sub}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="text-green-700 text-[11px] font-bold flex items-center gap-1 mt-4 hover:underline">
            View all actions <ArrowRight size={12} />
          </button>
        </div>

        {/* Timeline Preview */}
        <div className="col-span-3 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <h3 className="text-[13px] font-bold text-gray-900 mb-4">Timeline Preview</h3>
          <div className="relative pl-3 space-y-4">
            <div className="absolute top-1 bottom-2 left-3.5 w-px bg-gray-200"></div>
            {[
              { date: 'Apr 28, 2024', label: 'Repayment received', val: '₹35,000' },
              { date: 'May 05, 2024', label: 'Field visit completed', val: 'Satara branch' },
              { date: 'May 12, 2024', label: 'Intervention assigned', val: 'Working capital advisory' },
              { date: 'May 19, 2024', label: 'Milk price increased', val: '₹42.1 / L' },
            ].map((ev, i) => (
              <div key={i} className="flex gap-3 relative z-10">
                <div className="w-2 h-2 rounded-full bg-white border-2 border-[#16a34a] mt-1 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold text-gray-500">{ev.date}</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-[11px] font-bold text-gray-900">{ev.label}</span>
                    <span className="text-[10px] text-gray-600 font-medium ml-2 text-right">{ev.val}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="text-green-700 text-[11px] font-bold flex items-center gap-1 mt-4 hover:underline">
            View full timeline <ArrowRight size={12} />
          </button>
        </div>

      </div>
        </div>
      )}

      {activeTab === 'Financial' && (
        <div className="space-y-4 animate-in fade-in mt-4">
          <div className="space-y-4 animate-in fade-in">
          
          {/* AI Financial Summary Card */}
          <div className="bg-[#d9f99d]/10  border border-green-100 rounded-[32px] p-5 flex items-start gap-6 relative overflow-hidden shadow-sm">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0 shadow-sm border border-green-200/50">
              <Sparkles size={24} className="text-green-700" />
            </div>
            
            <div className="flex-1 pr-4 border-r border-green-200/60">
              <h3 className="text-[14px] font-bold text-gray-900 mb-2">AI Financial Summary</h3>
              <p className="text-[13px] text-gray-200 leading-relaxed font-medium">
                Cash-flow is stable with a projected surplus of ₹1.45 L in next 3 months.<br/>
                Inflow is driven by milk sales while feed cost remains the highest expense head.
              </p>
            </div>
            
            <div className="shrink-0 px-4 border-r border-green-200/60 flex flex-col items-center justify-center h-full">
              <div className="flex items-center gap-2 mb-1 border border-green-200 bg-white px-3 py-1.5 rounded-xl shadow-sm">
                <ShieldCheck size={20} className="text-green-700" />
                <div>
                  <div className="text-[9px] font-extrabold text-gray-500 uppercase tracking-wider mb-0.5">AI Confidence</div>
                  <div className="text-[14px] font-extrabold text-green-700">High (92%)</div>
                </div>
              </div>
              <div className="text-[9px] text-gray-500 mt-2 font-medium">Updated today, 08:30 AM</div>
            </div>
            
            <div className="flex-1 pl-2">
              <h3 className="text-[11px] font-bold text-green-700 mb-2">Key Takeaways</h3>
              <ul className="space-y-1.5 mb-2">
                {['Average monthly surplus: ₹0.48 L', 'Operating margin improved by 4.6% vs last 3 months', 'Working capital days: 28 days', 'Maintain feed cost ratio below 65%'].map((point, i) => (
                  <li key={i} className="text-[11px] text-gray-200 flex items-start gap-1.5 font-medium">
                    <span className="w-1 h-1 rounded-full bg-[#16a34a] mt-1.5 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
              <div className="text-right">
                <button className="text-green-700 text-[11px] font-bold hover:underline flex items-center gap-1 justify-end w-full">View AI Explanation <ArrowRight size={12} /></button>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-6 gap-4">
            {[
              { label: 'Avg. Monthly Inflow', val: '₹2.86 L', pct: '↑ 8.2%', dsub: 'vs last 3 months', col: 'text-green-600', up: true, icon: TrendingDown, icol: 'text-green-600 border-green-200 bg-green-50' },
              { label: 'Avg. Monthly Outflow', val: '₹2.38 L', pct: '↑ 6.1%', dsub: 'vs last 3 months', col: 'text-green-600', up: false, icon: TrendingUp, icol: 'text-orange-500 border-orange-200 bg-orange-50' },
              { label: 'Avg. Monthly Surplus', val: '₹0.48 L', pct: '↑ 12.4%', dsub: 'vs last 3 months', col: 'text-green-600', up: true, icon: TrendingDown, icol: 'text-green-600 border-green-200 bg-green-50' },
              { label: 'Cash Balance (Current)', val: '₹2.84 L', pct: '↑ 9.3%', dsub: 'vs last month', col: 'text-green-600', up: true, icon: FileText, icol: 'text-green-600 border-green-200 bg-green-50' },
              { label: 'Operating Margin', val: '18.6%', pct: '↑ 4.6%', dsub: 'vs last 3 months', col: 'text-green-600', up: true, icon: Activity, icol: 'text-green-600 border-green-200 bg-green-50' },
              { label: 'Working Capital Days', val: '28', pct: 'Stable', dsub: '', col: 'text-gray-500', up: true, icon: Clock, icol: 'text-green-600 border-green-200 bg-green-50' },
            ].map((kpi, i) => (
              <div key={i} className="bg-white  border border-gray-100 rounded-[32px] p-4 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1.5 rounded-full border ${kpi.icol} bg-white shadow-sm`}><kpi.icon size={12} className="opacity-80" /></div>
                  <span className="text-[11px] font-extrabold text-gray-500 truncate">{kpi.label}</span>
                </div>
                <div className="text-[22px] font-extrabold text-gray-900 mb-1 leading-none">{kpi.val}</div>
                <div className={`text-[10px] font-bold flex items-center gap-1 ${kpi.col}`}>
                  {kpi.pct} <span className="text-gray-500 font-medium">{kpi.dsub}</span>
                </div>
                <MiniSparkline color={kpi.up ? '#16a34a' : '#ef4444'} />
              </div>
            ))}
          </div>

          {/* Middle Row */}
          <div className="grid grid-cols-12 gap-4">
            {/* Cash-flow Trend */}
            <div className="col-span-4 bg-white  border border-gray-100 rounded-[32px] p-4 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[13px] font-extrabold text-gray-900">Cash-flow Trend</h3>
                <select className="text-[10px] border border-gray-100 rounded-md px-2 py-1 text-gray-600 font-medium focus:outline-none"><option>Next 3 Months</option></select>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500 mb-4 px-2">
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#22c55e]" /> Inflow (₹ L)</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#f87171]" /> Outflow (₹ L)</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#16a34a]" /> Net Cash-flow (₹ L)</div>
              </div>
              <div className="flex-1 min-h-[160px] relative">
                <div className="absolute top-0 right-0 bottom-5 w-[45%] bg-orange-50/30 border-l border-dashed border-gray-300 pointer-events-none z-0 flex justify-center">
                  <span className="text-[10px] font-bold text-gray-500 mt-2 bg-white/80 px-2 py-0.5 rounded backdrop-blur-sm">Forecast Period</span>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={FINANCIAL_CASHFLOW_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: 600 }} axisLine={false} tickLine={false} ticks={[-1.0, -0.5, 0, 0.5, 1.0, 1.5, 2.0, 3.0]} tickFormatter={(v) => v === 0 ? '0' : `${v}L`} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="inflow" fill="#86efac" barSize={8} radius={[2, 2, 0, 0]} stackId="a" />
                    <Bar dataKey="outflow" fill="#fca5a5" barSize={8} radius={[0, 0, 2, 2]} stackId="a" />
                    <Line type="monotone" dataKey="net" stroke="#16a34a" strokeWidth={2} dot={{ r: 3, fill: '#16a34a', strokeWidth: 0 }} />
                    <Line type="monotone" dataKey="forecast" stroke="#16a34a" strokeDasharray="4 4" strokeWidth={2} dot={{ r: 3, fill: '#16a34a', strokeWidth: 0 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-between mt-3 text-[10px]">
                <div className="flex items-center gap-1.5 font-semibold text-[#15803d]">
                  <CheckCircle2 size={12} className="text-green-700" />
                  Cash-flow is projected to remain positive with average monthly surplus of ₹0.48 L...
                </div>
                <button className="text-green-700 font-bold hover:underline whitespace-nowrap ml-2 flex items-center gap-1">View full forecast <ArrowRight size={10} /></button>
              </div>
            </div>

            {/* Inflow Breakdown */}
            <div className="col-span-3 bg-white  border border-gray-100 rounded-[32px] p-4 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">Inflow Breakdown (Last 3 Months)</h3>
              <div className="flex items-center gap-4 flex-1">
                <div className="relative w-[110px] h-[110px] shrink-0">
                  <PieChart width={110} height={110}>
                    <Pie data={INFLOW_BREAKDOWN} cx={55} cy={55} innerRadius={42} outerRadius={55} dataKey="value" stroke="none">
                      {INFLOW_BREAKDOWN.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[14px] font-extrabold text-gray-900">₹8.58 L</span>
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Total Inflow</span>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  {INFLOW_BREAKDOWN.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-gray-900 font-bold truncate">{item.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-gray-500 font-bold">{item.value}%</span>
                        <span className="font-extrabold text-gray-900">{item.amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View inflow details <ArrowRight size={10} /></button>
            </div>

            {/* Outflow Breakdown */}
            <div className="col-span-3 bg-white  border border-gray-100 rounded-[32px] p-4 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">Outflow Breakdown (Last 3 Months)</h3>
              <div className="flex items-center gap-4 flex-1">
                <div className="relative w-[110px] h-[110px] shrink-0">
                  <PieChart width={110} height={110}>
                    <Pie data={OUTFLOW_BREAKDOWN} cx={55} cy={55} innerRadius={42} outerRadius={55} dataKey="value" stroke="none">
                      {OUTFLOW_BREAKDOWN.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[14px] font-extrabold text-gray-900">₹7.14 L</span>
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Total Outflow</span>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  {OUTFLOW_BREAKDOWN.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-gray-900 font-bold truncate">{item.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-gray-500 font-bold">{item.value}%</span>
                        <span className="font-extrabold text-gray-900">{item.amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View outflow details <ArrowRight size={10} /></button>
            </div>

            {/* Cash Summary */}
            <div className="col-span-2 bg-white  border border-gray-100 rounded-[32px] p-4 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">Cash Summary</h3>
              <div className="space-y-4 flex-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-500 font-bold">Opening Balance</span>
                  <span className="font-extrabold text-gray-900">₹2.36 L</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-500 font-bold">Net Cash-flow (This Month)</span>
                  <span className="font-extrabold text-green-700">₹0.48 L</span>
                </div>
                <div className="flex justify-between items-center text-[11px] border-b border-gray-100 pb-3">
                  <span className="text-gray-500 font-bold">Closing Balance (Projected)</span>
                  <span className="font-extrabold text-gray-900">₹2.84 L</span>
                </div>
                <div className="flex justify-between items-center text-[11px] pt-1">
                  <span className="text-gray-500 font-bold">Min. Cash Balance (Next 3 M)</span>
                  <span className="font-extrabold text-gray-900">₹2.12 L</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-500 font-bold">Max. Cash Balance (Next 3 M)</span>
                  <span className="font-extrabold text-gray-900">₹3.28 L</span>
                </div>
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View cash projection <ArrowRight size={10} /></button>
            </div>
          </div>

          {/* Bottom Row 1 */}
          <div className="grid grid-cols-12 gap-4">
            {/* Key Financial Ratios */}
            <div className="col-span-3 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-5">Key Financial Ratios</h3>
              <div className="grid grid-cols-3 gap-3 flex-1">
                <div>
                  <div className="text-[10px] text-gray-500 font-bold mb-1.5 truncate">Feed Cost Ratio</div>
                  <div className="text-[18px] font-extrabold text-gray-900">62%</div>
                  <div className="text-[9px] font-bold text-green-600 mt-1 flex items-center gap-0.5">↓ 2% <span className="text-gray-500 font-medium">vs last 3 months</span></div>
                  <div className="mt-2"><TableSparkline up={true} /></div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 font-bold mb-1.5 truncate">Operating Margin</div>
                  <div className="text-[18px] font-extrabold text-gray-900">18.6%</div>
                  <div className="text-[9px] font-bold text-green-600 mt-1 flex items-center gap-0.5">↑ 4.6% <span className="text-gray-500 font-medium">vs last 3 months</span></div>
                  <div className="mt-2"><TableSparkline up={true} /></div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 font-bold mb-1.5 truncate">Cash-Conversion Cycle</div>
                  <div className="text-[18px] font-extrabold text-gray-900">28 Days</div>
                  <div className="text-[9px] font-bold text-green-600 mt-1 flex items-center gap-0.5">↓ 3 days <span className="text-gray-500 font-medium">vs last 3 months</span></div>
                  <div className="mt-2"><TableSparkline up={true} /></div>
                </div>
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View all ratios <ArrowRight size={10} /></button>
            </div>

            {/* Monthly Cash-flow Forecast */}
            <div className="col-span-4 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[13px] font-extrabold text-gray-900">Monthly Cash-flow Forecast</h3>
                <span className="text-[10px] text-gray-500 font-bold">(₹ Lakh)</span>
              </div>
              <div className="flex-1">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] text-gray-500 font-bold">
                      <th className="pb-2.5">Month</th>
                      <th className="pb-2.5">Inflow</th>
                      <th className="pb-2.5">Outflow</th>
                      <th className="pb-2.5">Net Cash-flow</th>
                      <th className="pb-2.5 text-right">Closing Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-[11px]">
                    <tr>
                      <td className="py-2.5 text-gray-200 font-bold">May '24</td><td className="font-medium text-gray-600">2.92</td><td className="font-medium text-gray-600">2.44</td>
                      <td className="py-2.5"><div className="flex items-center gap-2"><span className="w-10 h-1.5 rounded-full bg-green-500"/><span className="font-extrabold text-green-700">+0.48</span></div></td>
                      <td className="py-2.5 text-right font-extrabold text-gray-900">2.84</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-gray-200 font-bold">Jun '24 (P)</td><td className="font-medium text-gray-600">2.85</td><td className="font-medium text-gray-600">2.36</td>
                      <td className="py-2.5"><div className="flex items-center gap-2"><span className="w-10 h-1.5 rounded-full bg-green-500"/><span className="font-extrabold text-green-700">+0.49</span></div></td>
                      <td className="py-2.5 text-right font-extrabold text-gray-900">3.33</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-gray-200 font-bold">Jul '24 (P)</td><td className="font-medium text-gray-600">2.88</td><td className="font-medium text-gray-600">2.40</td>
                      <td className="py-2.5"><div className="flex items-center gap-2"><span className="w-10 h-1.5 rounded-full bg-green-500"/><span className="font-extrabold text-green-700">+0.48</span></div></td>
                      <td className="py-2.5 text-right font-extrabold text-gray-900">3.81</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View full forecast <ArrowRight size={10} /></button>
            </div>

            {/* Cash-flow Drivers */}
            <div className="col-span-3 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-5">Cash-flow Drivers (Next 3 Months)</h3>
              <div className="space-y-4 flex-1">
                {[
                  { icon: Building, title: 'Milk price increase', impact: '+₹0.35 L', tag: 'Positive', tagCol: 'text-green-700 bg-green-100', iconCol: 'text-green-600 border-green-200 bg-white' },
                  { icon: Building, title: 'Feed cost increase', impact: '-₹0.28 L', tag: 'Negative', tagCol: 'text-red-700 bg-red-100', iconCol: 'text-orange-500 border-orange-200 bg-white' },
                  { icon: Building, title: 'Rainfall deficit impact', impact: '-₹0.12 L', tag: 'Negative', tagCol: 'text-red-700 bg-red-100', iconCol: 'text-orange-500 border-orange-200 bg-white' },
                ].map((drv, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-full border ${drv.iconCol}`}><drv.icon size={12} /></div>
                      <span className="text-[11px] font-bold text-gray-900">{drv.title}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] font-extrabold text-gray-900">{drv.impact}</span>
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${drv.tagCol}`}>{drv.tag}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View all drivers <ArrowRight size={10} /></button>
            </div>

            {/* AI Recommendation */}
            <div className="col-span-2 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col relative overflow-hidden">
              <h3 className="text-[12px] font-extrabold text-gray-900 flex items-center gap-1.5 mb-4">
                <Sparkles size={16} className="text-green-700" /> AI Recommendation
              </h3>
              <ul className="text-[12px] text-gray-200 leading-relaxed flex-1 space-y-2 list-disc pl-4 marker:text-gray-500 font-medium">
                <li>Maintain feed cost ratio below 65% and monitor rainfall impact in Satara.</li>
                <li>Continue timely repayments to keep risk level low.</li>
              </ul>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View recommended actions <ArrowRight size={10} /></button>
            </div>
          </div>

          {/* Bottom Row 2 */}
          <div className="grid grid-cols-12 gap-4">
            {/* Recent Transactions */}
            <div className="col-span-6 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-5">Recent Transactions</h3>
              <div className="flex-1">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] text-gray-500 font-bold">
                      <th className="pb-2.5">Date</th>
                      <th className="pb-2.5">Particulars</th>
                      <th className="pb-2.5">Type</th>
                      <th className="pb-2.5">Amount (₹)</th>
                      <th className="pb-2.5">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-[11px]">
                    {RECENT_TRANSACTIONS.map((tx, i) => (
                      <tr key={i}>
                        <td className="py-3 text-gray-600 font-medium">{tx.date}</td>
                        <td className="py-3 text-gray-900 font-bold">{tx.particular}</td>
                        <td className="py-3 text-gray-500">{tx.type}</td>
                        <td className={`py-3 font-extrabold ${tx.amount.startsWith('+') ? 'text-green-700' : 'text-gray-900'}`}>{tx.amount}</td>
                        <td className="py-3 text-gray-500 font-medium">{tx.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-3 flex items-center gap-1">View all transactions <ArrowRight size={10} /></button>
            </div>

            {/* Timeline Preview (Horizontal) */}
            <div className="col-span-6 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-8">Timeline Preview</h3>
              <div className="flex-1 relative px-6 flex items-center justify-between">
                <div className="absolute left-10 right-10 h-px bg-gray-200 top-[18px] z-0"></div>
                <div className="flex justify-between w-full relative z-10 -mt-2">
                  {[
                    { label: 'Milk price', sub: 'Increased', val: '₹42.1 / L', date: 'May 10, 2024', col: 'text-orange-500 border-orange-200 bg-orange-50', icon: Building },
                    { label: 'Feed cost', sub: 'Increase', val: '+6.2%', date: 'May 12, 2024', col: 'text-orange-500 border-orange-200 bg-orange-50', icon: Building },
                    { label: 'Repayment', sub: 'received', val: '₹35,000', date: 'May 19, 2024', col: 'text-green-600 border-green-200 bg-green-50', icon: CheckCircle },
                    { label: 'Field visit', sub: 'completed', val: 'Satara branch', date: 'May 20, 2024', col: 'text-blue-500 border-blue-200 bg-blue-50', icon: Users },
                    { label: 'Intervention', sub: 'assigned', val: 'Advisory', date: 'May 21, 2024', col: 'text-purple-500 border-purple-200 bg-purple-50', icon: ShieldCheck },
                  ].map((evt, i) => (
                    <div key={i} className="flex flex-col items-center w-24 text-center">
                      <div className={`w-9 h-9 rounded-full border flex items-center justify-center mb-3 ${evt.col} bg-white relative z-10 shadow-sm`}>
                        <evt.icon size={14} className="opacity-80" />
                      </div>
                      <div className="text-[10px] font-bold text-gray-900 leading-tight mb-0.5">{evt.label}</div>
                      <div className="text-[10px] font-medium text-gray-500 leading-tight mb-1.5">{evt.sub}</div>
                      <div className="text-[11px] font-extrabold text-gray-900 mb-1.5">{evt.val}</div>
                      <div className="text-[9px] font-bold text-gray-500 mt-1">{evt.date}</div>
                    </div>
                  ))}
                </div>
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View full timeline <ArrowRight size={10} /></button>
            </div>
          </div>
        </div>
        </div>
      )}

      {activeTab === 'Credit' && (
        <div className="space-y-4 animate-in fade-in mt-4">
          <div className="space-y-4 animate-in fade-in">
          
          {/* AI Credit Summary Card */}
          <div className="bg-[#d9f99d]/10  border border-green-100 rounded-[32px] p-5 flex items-start gap-6 relative overflow-hidden shadow-sm mt-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0 shadow-sm border border-green-200/50">
              <Sparkles size={24} className="text-green-700" />
            </div>
            
            <div className="flex-1 pr-4 border-r border-green-200/60">
              <h3 className="text-[14px] font-bold text-gray-900 mb-2">AI Credit Summary</h3>
              <p className="text-[13px] text-gray-200 leading-relaxed font-medium">
                Repayment behaviour is strong with 96% on-time repayments.<br/>
                Low risk of delinquency in next 90 days. Continue monitoring rainfall impact on feed cost and maintain cash-flow buffer.
              </p>
            </div>
            
            <div className="shrink-0 px-4 border-r border-green-200/60 flex flex-col items-center justify-center h-full">
              <div className="flex items-center gap-2 mb-1 border border-green-200 bg-white px-3 py-1.5 rounded-xl shadow-sm">
                <ShieldCheck size={20} className="text-green-700" />
                <div>
                  <div className="text-[9px] font-extrabold text-gray-500 uppercase tracking-wider mb-0.5">AI Confidence</div>
                  <div className="text-[14px] font-extrabold text-green-700">High (92%)</div>
                </div>
              </div>
              <div className="text-[9px] text-gray-500 mt-2 font-medium">Updated today, 08:30 AM</div>
            </div>
            
            <div className="flex-1 pl-2">
              <h3 className="text-[11px] font-bold text-green-700 mb-2">Key Credit Takeaways</h3>
              <ul className="space-y-1.5 mb-2">
                {['Repayment probability remains strong at 96%', 'No overdue instalments in current loan', 'Low delinquency risk in next 90 days', 'Maintain working capital buffer'].map((point, i) => (
                  <li key={i} className="text-[11px] text-gray-200 flex items-start gap-1.5 font-medium">
                    <span className="w-1 h-1 rounded-full bg-[#16a34a] mt-1.5 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
              <div className="text-right">
                <button className="text-green-700 text-[11px] font-bold hover:underline flex items-center gap-1 justify-end w-full">View AI Explanation <ArrowRight size={10} /></button>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-6 gap-4">
            {[
              { label: 'Repayment Probability', sub: '(Next 90 Days)', val: '96%', pct: '↑ 4%', dsub: 'vs last month', col: 'text-green-600', up: true, icon: ShieldCheck, icol: 'text-green-600 border-green-200 bg-green-50' },
              { label: 'Delinquency Risk', sub: '(Next 90 Days)', val: '1.2%', pct: '↓ 0.3%', dsub: 'vs last month', col: 'text-red-500', up: true, icon: ShieldAlert, icol: 'text-red-500 border-red-200 bg-red-50' },
              { label: 'EMI Coverage Ratio', sub: '(Next 3 Months)', val: '1.78x', pct: '↑ 0.18x', dsub: 'vs last month', col: 'text-green-600', up: true, icon: Activity, icol: 'text-green-600 border-green-200 bg-green-50' },
              { label: 'Days Past Due', sub: '', val: '0 Days', pct: 'No change', dsub: '', col: 'text-gray-500', up: true, icon: CalendarDays, icol: 'text-purple-600 border-purple-200 bg-purple-50', flat: true },
              { label: 'Restructure Probability', sub: '(Next 90 Days)', val: '0.8%', pct: '↓ 0.2%', dsub: 'vs last month', col: 'text-orange-500', up: true, icon: AlertTriangle, icol: 'text-orange-500 border-orange-200 bg-orange-50', sparkCol: '#f97316' },
              { label: 'Credit Health Score', sub: '', val: '84', valSub: '/ 100', pct: '↑ 6 pts', dsub: 'vs last month', col: 'text-green-600', up: true, icon: HeartPulse, icol: 'text-green-600 border-green-200 bg-green-50' },
            ].map((kpi, i) => (
              <div key={i} className="bg-white  border border-gray-100 rounded-[32px] p-4 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-md border ${kpi.icol} bg-white shadow-sm`}><kpi.icon size={12} className="opacity-80" /></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-extrabold text-gray-600 leading-tight truncate">{kpi.label}</span>
                    {kpi.sub && <span className="text-[9px] font-medium text-gray-500">{kpi.sub}</span>}
                  </div>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <div className="text-[22px] font-extrabold text-gray-900 mb-1 leading-none">{kpi.val}</div>
                  {kpi.valSub && <div className="text-[11px] font-bold text-gray-500">{kpi.valSub}</div>}
                </div>
                <div className={`text-[10px] font-bold flex items-center gap-1 ${kpi.col}`}>
                  {kpi.pct} {kpi.dsub && <span className="text-gray-500 font-medium">{kpi.dsub}</span>}
                </div>
                <MiniSparkline color={kpi.flat ? '#c084fc' : (kpi.sparkCol || (kpi.up ? '#16a34a' : '#ef4444'))} />
              </div>
            ))}
          </div>

          {/* Middle Row */}
          <div className="grid grid-cols-12 gap-4">
            
            {/* Active Loans */}
            <div className="col-span-5 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-5">Active Loans</h3>
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 text-[9px] text-gray-500 font-bold uppercase tracking-wide">
                      <th className="pb-2">Loan Account</th>
                      <th className="pb-2">Product</th>
                      <th className="pb-2">Sanction Amount</th>
                      <th className="pb-2">Outstanding</th>
                      <th className="pb-2">Interest Rate</th>
                      <th className="pb-2">Tenure</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-[10px]">
                    {ACTIVE_LOANS.map((loan, i) => (
                      <tr key={i}>
                        <td className="py-2.5 text-gray-600 font-bold">{loan.acc}</td>
                        <td className="py-2.5 text-gray-900 font-medium">{loan.product}</td>
                        <td className="py-2.5 text-gray-900 font-bold">{loan.sanction}</td>
                        <td className="py-2.5 text-gray-900 font-bold">{loan.out}</td>
                        <td className="py-2.5 text-gray-600 font-bold">{loan.roi}</td>
                        <td className="py-2.5 text-gray-600 font-bold">{loan.tenure}</td>
                        <td className="py-2.5"><span className="bg-green-50 text-green-700 border border-green-100 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase">{loan.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View all loan accounts <ArrowRight size={10} /></button>
            </div>

            {/* Repayment Performance */}
            <div className="col-span-5 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-4">Repayment Performance (Last 12 Months)</h3>
              <div className="flex items-center gap-4 text-[9px] font-bold text-gray-500 mb-4">
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#22c55e]" /> On-time</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#f59e0b]" /> Overdue 1-30</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#ef4444]" /> Overdue &gt; 30</div>
              </div>
              <div className="flex-1 min-h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={REPAYMENT_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="onTime" stackId="a" fill="#22c55e" barSize={10} />
                    <Bar dataKey="late1" stackId="a" fill="#f59e0b" barSize={10} />
                    <Bar dataKey="late2" stackId="a" fill="#ef4444" barSize={10} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div>
                  <div className="text-[9px] text-gray-500 font-bold mb-0.5">On-time Repayments</div>
                  <div className="text-[14px] font-extrabold text-gray-900">96%</div>
                </div>
                <div>
                  <div className="text-[9px] text-gray-500 font-bold mb-0.5">Overdue 1-30 Days</div>
                  <div className="text-[14px] font-extrabold text-gray-900">4%</div>
                </div>
                <div>
                  <div className="text-[9px] text-gray-500 font-bold mb-0.5">Overdue &gt; 30 Days</div>
                  <div className="text-[14px] font-extrabold text-gray-900">0%</div>
                </div>
              </div>
            </div>

            {/* Credit Exposure */}
            <div className="col-span-2 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">Credit Exposure</h3>
              <div className="space-y-5 flex-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-500 font-bold">Total Exposure</span>
                  <span className="font-extrabold text-gray-900">₹3.32 L</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-500 font-bold">Outstanding Principal</span>
                  <span className="font-extrabold text-gray-900">₹3.67 L</span>
                </div>
                <div className="flex justify-between items-center text-[11px] pb-3">
                  <span className="text-gray-500 font-bold">Unutilized Limit</span>
                  <span className="font-extrabold text-gray-900">₹0.83 L</span>
                </div>
                <div className="flex justify-between items-center text-[11px] pt-4 border-t border-gray-100">
                  <span className="text-gray-500 font-bold">Total Exposure</span>
                  <span className="font-extrabold text-gray-900">₹4.50 L</span>
                </div>
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View exposure details <ArrowRight size={10} /></button>
            </div>
          </div>

          {/* Bottom Row 1 */}
          <div className="grid grid-cols-12 gap-4">
            
            {/* DSCR */}
            <div className="col-span-3 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="text-[13px] font-extrabold text-gray-900">Debt Service Coverage Ratio (DSCR)</h3>
                <AlertCircle size={12} className="text-gray-500" />
              </div>
              <div className="text-[10px] text-gray-500 font-medium mb-3">Next 3 Months Forecast</div>
              
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-[22px] font-extrabold text-gray-900 leading-none">1.78x</div>
                  <div className="text-[11px] font-extrabold text-green-700 mt-1">Good</div>
                </div>
                <div className="text-[10px] text-gray-500 font-bold">vs last month <span className="text-green-700">↑ 0.18x</span></div>
              </div>
              
              <div className="flex-1"><DscrSparkline /></div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View DSCR trend <ArrowRight size={10} /></button>
            </div>

            {/* Credit Utilization */}
            <div className="col-span-3 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-5">Credit Utilization</h3>
              <div className="flex items-center gap-4 flex-1">
                <div className="relative w-[110px] h-[110px] shrink-0">
                  <PieChart width={110} height={110}>
                    <Pie data={CREDIT_UTILIZATION} cx={55} cy={55} innerRadius={42} outerRadius={55} dataKey="value" stroke="none">
                      {CREDIT_UTILIZATION.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[20px] font-extrabold text-gray-900">82%</span>
                    <span className="text-[9px] text-gray-500 font-bold mt-0.5">Utilized</span>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex flex-col text-[10px]">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-[#16a34a]" />
                      <span className="text-gray-900 font-bold">Utilized</span>
                    </div>
                    <div className="font-extrabold text-gray-900 pl-3">₹3.67 L (82%)</div>
                  </div>
                  <div className="flex flex-col text-[10px]">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-gray-200" />
                      <span className="text-gray-900 font-bold">Unutilized</span>
                    </div>
                    <div className="font-extrabold text-gray-900 pl-3">₹0.83 L (18%)</div>
                  </div>
                </div>
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View limits & utilization <ArrowRight size={10} /></button>
            </div>

            {/* Top Risk Drivers */}
            <div className="col-span-3 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">Top Risk Drivers</h3>
              <div className="space-y-4 flex-1">
                {[
                  { title: 'Feed cost increase', tag: 'Medium', col: 'text-orange-600 bg-orange-50 border border-orange-100' },
                  { title: 'Rainfall deficit impact', tag: 'Low', col: 'text-green-600 bg-green-50 border border-green-100' },
                  { title: 'Milk price volatility', tag: 'Low', col: 'text-green-600 bg-green-50 border border-green-100' },
                  { title: 'Working capital buffer', tag: 'Low', col: 'text-green-600 bg-green-50 border border-green-100' },
                ].map((drv, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-900">{drv.title}</span>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${drv.col}`}>{drv.tag}</span>
                  </div>
                ))}
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View all risk drivers <ArrowRight size={10} /></button>
            </div>

            {/* Next Payment Due */}
            <div className="col-span-3 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">Next Payment Due</h3>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
                    <CalendarDays size={20} className="text-green-700" />
                  </div>
                  <div>
                    <div className="text-[14px] font-extrabold text-gray-900 mb-0.5">May 28, 2024</div>
                    <div className="text-[11px] font-bold text-green-700">7 Days Left</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div>
                    <div className="text-[10px] text-gray-500 font-bold mb-1">Amount</div>
                    <div className="text-[14px] font-extrabold text-gray-900">₹35,000</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-500 font-bold mb-1">EMI Account</div>
                    <div className="text-[11px] font-bold text-gray-200">LN-2022-00124</div>
                  </div>
                </div>
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View repayment schedule <ArrowRight size={10} /></button>
            </div>
          </div>

          {/* Bottom Row 2 */}
          <div className="col-span-12 bg-white  border border-gray-100 rounded-[32px] p-4 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between group cursor-pointer hover:border-green-200 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} className="text-green-700" />
              </div>
              <div>
                <div className="text-[12px] font-extrabold text-gray-900 mb-0.5">Credit Alerts</div>
                <div className="text-[11px] text-gray-600 font-medium">No active credit alerts. Great! No overdue payments or critical risks at this time.</div>
              </div>
            </div>
            <button className="text-green-700 text-[11px] font-bold group-hover:underline flex items-center gap-1 pr-2">View all alerts <ArrowRight size={10} /></button>
          </div>

        </div>
        </div>
      )}

      {activeTab === 'Operations' && (
        <div className="space-y-4 animate-in fade-in mt-4">
          <div className="space-y-4 animate-in fade-in">
          
          {/* AI Operations Summary Card */}
          <div className="bg-[#d9f99d]/10  border border-green-100 rounded-[32px] p-5 flex items-start gap-6 relative overflow-hidden shadow-sm mt-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0 shadow-sm border border-green-200/50">
              <Sparkles size={24} className="text-green-700" />
            </div>
            
            <div className="flex-1 pr-4 border-r border-green-200/60">
              <h3 className="text-[14px] font-bold text-gray-900 mb-2">AI Operations Summary</h3>
              <p className="text-[13px] text-gray-200 leading-relaxed font-medium">
                Milk production is stable with high quality output.<br/>
                Feed efficiency is optimal but feed cost is elevated.<br/>
                Maintain herd health and streamline milking operations.
              </p>
            </div>
            
            <div className="shrink-0 px-4 border-r border-green-200/60 flex flex-col items-center justify-center h-full">
              <div className="flex items-center gap-2 mb-1 border border-green-200 bg-white px-3 py-1.5 rounded-xl shadow-sm">
                <ShieldCheck size={20} className="text-green-700" />
                <div>
                  <div className="text-[9px] font-extrabold text-gray-500 uppercase tracking-wider mb-0.5">AI Confidence</div>
                  <div className="text-[14px] font-extrabold text-green-700">High (92%)</div>
                </div>
              </div>
              <div className="text-[9px] text-gray-500 mt-2 font-medium">Updated today, 08:30 AM</div>
            </div>
            
            <div className="flex-1 pl-2">
              <h3 className="text-[11px] font-bold text-green-700 mb-2">Key Operational Takeaways</h3>
              <ul className="space-y-1.5 mb-2">
                {['Milk yield per animal improved by 4.6%', 'Feed conversion efficiency is optimal', '2 animals due for health check', 'Milking efficiency can be improved by 8%'].map((point, i) => (
                  <li key={i} className="text-[11px] text-gray-200 flex items-start gap-1.5 font-medium">
                    <span className="w-1 h-1 rounded-full bg-[#16a34a] mt-1.5 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
              <div className="text-right">
                <button className="text-green-700 text-[11px] font-bold hover:underline flex items-center gap-1 justify-end w-full">View AI Explanation <ArrowRight size={10} /></button>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-6 gap-4">
            {[
              { label: 'Milk Production', sub: '(Daily Avg.)', val: '1,245 L', pct: '↑ 4.6%', dsub: 'vs last month', col: 'text-green-600', up: true, icon: Droplets, icol: 'text-green-600 border-green-200 bg-green-50' },
              { label: 'Milk Quality', sub: '(Avg. Fat %)', val: '4.2%', pct: '↑ 0.2 pts', dsub: 'vs last month', col: 'text-green-600', up: true, icon: Droplet, icol: 'text-purple-600 border-purple-200 bg-purple-50', sparkCol: '#8b5cf6' },
              { label: 'Feed Conversion Efficiency', sub: '', val: '1.41', pct: '↑ 2.1%', dsub: 'vs last month', col: 'text-green-600', up: true, icon: Target, icol: 'text-green-600 border-green-200 bg-green-50' },
              { label: 'Feed Cost / Litre', sub: '', val: '₹22.8', pct: '↑ 3.6%', dsub: 'vs last month', col: 'text-red-500', up: false, icon: ShieldAlert, icol: 'text-red-500 border-red-200 bg-red-50' },
              { label: 'Herd Health Score', sub: '', val: '92', valSub: '/ 100', pct: '↑ 3 pts', dsub: 'vs last month', col: 'text-green-600', up: true, icon: HeartPulse, icol: 'text-green-600 border-green-200 bg-green-50' },
              { label: 'Milking Efficiency', sub: '', val: '78%', pct: '↓ 2%', dsub: 'vs last month', col: 'text-red-500', up: false, icon: ShieldAlert, icol: 'text-red-500 border-red-200 bg-red-50' },
            ].map((kpi, i) => (
              <div key={i} className="bg-white  border border-gray-100 rounded-[32px] p-4 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-md border ${kpi.icol} bg-white shadow-sm`}><kpi.icon size={12} className="opacity-80" /></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-extrabold text-gray-600 leading-tight truncate">{kpi.label}</span>
                    {kpi.sub && <span className="text-[9px] font-medium text-gray-500">{kpi.sub}</span>}
                  </div>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <div className="text-[22px] font-extrabold text-gray-900 mb-1 leading-none">{kpi.val}</div>
                  {kpi.valSub && <div className="text-[11px] font-bold text-gray-500">{kpi.valSub}</div>}
                </div>
                <div className={`text-[10px] font-bold flex items-center gap-1 ${kpi.col}`}>
                  {kpi.pct} {kpi.dsub && <span className="text-gray-500 font-medium">{kpi.dsub}</span>}
                </div>
                <MiniSparkline color={kpi.sparkCol || (kpi.up ? '#16a34a' : '#ef4444')} />
              </div>
            ))}
          </div>

          {/* Middle Row */}
          <div className="grid grid-cols-12 gap-4">
            
            {/* Production Trend */}
            <div className="col-span-5 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-4">Production Trend</h3>
              <div className="flex items-center gap-4 text-[9px] font-bold text-gray-500 mb-4">
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#16a34a]" /> Milk Production (L)</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#8b5cf6]" /> Avg. Fat %</div>
              </div>
              <div className="flex-1 min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={PRODUCTION_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: 600 }} axisLine={false} tickLine={false} ticks={[0, 500, 1000, 1500, 2000]} tickFormatter={(v)=>v===0?'0':`${v/1000}K`} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: 600 }} axisLine={false} tickLine={false} ticks={[3.5, 4.0, 4.5, 5.0, 5.5]} tickFormatter={(v)=>`${v}%`} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Line yAxisId="left" type="monotone" dataKey="prod" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3, fill: '#16a34a', strokeWidth: 0 }} isAnimationActive={false} />
                    <Line yAxisId="right" type="monotone" dataKey="fat" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 0 }} isAnimationActive={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View production analytics <ArrowRight size={10} /></button>
            </div>

            {/* Herd Composition */}
            <div className="col-span-3 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">Herd Composition</h3>
              <div className="flex items-center gap-4 flex-1">
                <div className="relative w-[110px] h-[110px] shrink-0">
                  <PieChart width={110} height={110}>
                    <Pie data={HERD_DATA} cx={55} cy={55} innerRadius={42} outerRadius={55} dataKey="val" stroke="none">
                      {HERD_DATA.map((entry, i) => <Cell key={i} fill={entry.col} />)}
                    </Pie>
                  </PieChart>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[20px] font-extrabold text-gray-900">68</span>
                    <span className="text-[9px] text-gray-500 font-bold mt-0.5">Total Animals</span>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  {HERD_DATA.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.col }} />
                        <span className="text-gray-900 font-bold truncate">{item.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-extrabold text-gray-900">{item.val}</span>
                        <span className="text-gray-500 font-bold">({item.pct})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View herd details <ArrowRight size={10} /></button>
            </div>

            {/* Health Alerts */}
            <div className="col-span-4 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">Health Alerts</h3>
              <div className="space-y-4 flex-1">
                {[
                  { tag: 'Medium', title: '2 animals due for vaccination', sub: 'Next due on May 24, 2024', tagCol: 'text-orange-600 bg-orange-50 border-orange-100' },
                  { tag: 'Low', title: '1 animal showing reduced feed intake', sub: 'Monitor closely', tagCol: 'text-green-600 bg-green-50 border-green-100' },
                  { tag: 'Low', title: 'Regular deworming schedule due', sub: 'Next due on May 28, 2024', tagCol: 'text-green-600 bg-green-50 border-green-100' },
                ].map((alert, i) => (
                  <div key={i} className="flex items-start gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border mt-0.5 ${alert.tagCol}`}>{alert.tag}</span>
                    <div className="flex-1">
                      <div className="text-[11px] font-bold text-gray-900 mb-0.5">{alert.title}</div>
                      <div className="text-[10px] font-medium text-gray-500">{alert.sub}</div>
                    </div>
                    <button className="text-green-700 text-[10px] font-bold hover:underline shrink-0 pt-0.5">View</button>
                  </div>
                ))}
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View all health alerts <ArrowRight size={10} /></button>
            </div>

          </div>

          {/* Bottom Row 1 */}
          <div className="grid grid-cols-12 gap-4">
            
            {/* Feed Overview */}
            <div className="col-span-4 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">Feed Overview (Last 7 Days)</h3>
              <div className="flex items-center gap-4 flex-1">
                <div className="relative w-[110px] h-[110px] shrink-0">
                  <PieChart width={110} height={110}>
                    <Pie data={FEED_DATA} cx={55} cy={55} innerRadius={42} outerRadius={55} dataKey="val" stroke="none">
                      {FEED_DATA.map((entry, i) => <Cell key={i} fill={entry.col} />)}
                    </Pie>
                  </PieChart>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[18px] font-extrabold text-gray-900">3.24</span>
                    <span className="text-[11px] font-bold text-gray-900">MT</span>
                    <span className="text-[9px] text-gray-500 font-bold mt-0.5">Total Feed</span>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  {FEED_DATA.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.col }} />
                        <span className="text-gray-900 font-bold truncate">{item.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-extrabold text-gray-900">{item.val} MT</span>
                        <span className="text-gray-500 font-bold">({item.pct})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View feed analytics <ArrowRight size={10} /></button>
            </div>

            {/* Operational Efficiency */}
            <div className="col-span-4 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">Operational Efficiency</h3>
              <div className="space-y-5 flex-1">
                {[
                  { label: 'Milking Time / Day', val: '3.2 hrs', pct: '↓ 5%', col: 'text-green-600' },
                  { label: 'Labor Productivity', val: '28 L / Labor', pct: '↑ 6%', col: 'text-green-600' },
                  { label: 'Equipment Utilization', val: '82%', pct: '↑ 4%', col: 'text-green-600' },
                  { label: 'Shed Cleanliness Score', val: '90 / 100', pct: '↑ 5 pts', col: 'text-green-600' },
                ].map((eff, i) => (
                  <div key={i} className="flex justify-between items-center text-[11px]">
                    <span className="text-gray-600 font-bold">{eff.label}</span>
                    <div className="flex items-center gap-4 w-[120px] justify-between">
                      <span className="font-extrabold text-gray-900">{eff.val}</span>
                      <span className={`font-bold ${eff.col} flex items-center gap-1`}>{eff.pct} <span className="text-[9px] text-gray-500 font-medium">vs last month</span></span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View efficiency details <ArrowRight size={10} /></button>
            </div>

            {/* Upcoming Operations */}
            <div className="col-span-4 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">Upcoming Operations</h3>
              <div className="space-y-4 flex-1">
                {[
                  { title: 'Vaccination Due', date: 'May 24, 2024', badge: '2 Animals', bcol: 'bg-purple-50 text-purple-600 border-purple-100' },
                  { title: 'Deworming Schedule', date: 'May 28, 2024', badge: 'All Animals', bcol: 'bg-purple-50 text-purple-600 border-purple-100' },
                  { title: 'Feed Stock Review', date: 'May 30, 2024', badge: 'Review', bcol: 'bg-purple-50 text-purple-600 border-purple-100' },
                  { title: 'Breeding Check', date: 'Jun 02, 2024', badge: '3 Animals', bcol: 'bg-purple-50 text-purple-600 border-purple-100' },
                ].map((op, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={14} className="text-gray-500" />
                      <span className="font-bold text-gray-900">{op.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-gray-900">{op.date}</span>
                      <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded border ${op.bcol}`}>{op.badge}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View full operations calendar <ArrowRight size={10} /></button>
            </div>

          </div>

          {/* Bottom Row 2 */}
          <div className="col-span-12 bg-white  border border-gray-100 rounded-[32px] p-4 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between group cursor-pointer hover:border-green-200 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} className="text-green-700" />
              </div>
              <div>
                <div className="text-[12px] font-extrabold text-gray-900 mb-0.5">Operational Insight</div>
                <div className="text-[11px] text-gray-600 font-medium">Maintain current feed quality and monitor animal health to sustain production growth.</div>
              </div>
            </div>
            <button className="text-green-700 text-[11px] font-bold group-hover:underline flex items-center gap-1 pr-2">View all recommendations <ArrowRight size={10} /></button>
          </div>

        </div>
        </div>
      )}

      {activeTab === 'Climate' && (
        <div className="space-y-4 animate-in fade-in mt-4">
          <div className="space-y-4 animate-in fade-in">
          
          {/* AI Climate Summary Card */}
          <div className="bg-[#d9f99d]/10  border border-green-100 rounded-[32px] p-5 flex items-start gap-6 relative overflow-hidden shadow-sm mt-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0 shadow-sm border border-green-200/50">
              <Sprout size={24} className="text-green-700" />
            </div>
            
            <div className="flex-1 pr-4 border-r border-green-200/60">
              <h3 className="text-[14px] font-bold text-gray-900 mb-2">AI Climate Summary</h3>
              <p className="text-[13px] text-gray-200 leading-relaxed font-medium">
                Rainfall is below normal in Satara. Current conditions may impact fodder availability and milk yield.<br/>
                Monitor rainfall closely and plan fodder procurement to reduce climate risk.
              </p>
            </div>
            
            <div className="shrink-0 px-4 border-r border-green-200/60 flex flex-col items-center justify-center h-full">
              <div className="flex items-center gap-2 mb-1 border border-green-200 bg-white px-3 py-1.5 rounded-xl shadow-sm">
                <Cloud size={20} className="text-green-700" />
                <div>
                  <div className="text-[9px] font-extrabold text-gray-500 uppercase tracking-wider mb-0.5">Climate Risk Level</div>
                  <div className="text-[14px] font-extrabold text-green-700">Low</div>
                </div>
              </div>
              <div className="text-[9px] text-gray-500 mt-2 font-medium">Updated today, 08:30 AM</div>
            </div>
            
            <div className="flex-1 pl-2">
              <h3 className="text-[11px] font-bold text-green-700 mb-2">Key Climate Takeaways</h3>
              <ul className="space-y-1.5 mb-2">
                {['Rainfall deficit of 24% vs normal', 'High temperature days expected to increase', 'Low risk of extreme weather in next 30 days', 'Fodder availability may reduce in Jun-Jul'].map((point, i) => (
                  <li key={i} className="text-[11px] text-gray-200 flex items-start gap-1.5 font-medium">
                    <span className="w-1 h-1 rounded-full bg-[#16a34a] mt-1.5 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
              <div className="text-right">
                <button className="text-green-700 text-[11px] font-bold hover:underline flex items-center gap-1 justify-end w-full">View AI Explanation <ArrowRight size={10} /></button>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-6 gap-4">
            {[
              { label: 'Rainfall', sub: '(vs Normal)', val: '-24%', pct: 'vs last 30 days', col: 'text-gray-500', up: false, icon: CloudRain, icol: 'text-blue-500 border-blue-200 bg-blue-50', sparkCol: '#ef4444' },
              { label: 'Avg. Temperature', sub: '', val: '32.4°C', pct: '↑ 1.3°C', dsub: 'vs last month', col: 'text-green-600', up: true, icon: Thermometer, icol: 'text-green-600 border-green-200 bg-green-50' },
              { label: 'Humidity', sub: '', val: '68%', pct: '↑ 4%', dsub: 'vs last month', col: 'text-green-600', up: true, icon: Droplets, icol: 'text-blue-500 border-blue-200 bg-blue-50' },
              { label: 'Heat Stress Days', sub: '', val: '2 Days', pct: '↑ 1 day', dsub: 'vs last month', col: 'text-red-500', up: false, icon: Sun, icol: 'text-orange-500 border-orange-200 bg-orange-50', sparkCol: '#ef4444' },
              { label: 'Extreme Weather Risk', sub: '', val: 'Low', pct: 'Next 30 days', col: 'text-gray-500', up: true, icon: Wind, icol: 'text-blue-500 border-blue-200 bg-blue-50', sparkCol: '#16a34a' },
              { label: 'Fodder Availability', sub: '', val: 'Adequate', pct: 'Current Status', col: 'text-gray-500', up: true, icon: Leaf, icol: 'text-green-600 border-green-200 bg-green-50' },
            ].map((kpi, i) => (
              <div key={i} className="bg-white  border border-gray-100 rounded-[32px] p-4 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-md border ${kpi.icol} bg-white shadow-sm`}><kpi.icon size={12} className="opacity-80" /></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-extrabold text-gray-600 leading-tight truncate">{kpi.label}</span>
                    {kpi.sub && <span className="text-[9px] font-medium text-gray-500">{kpi.sub}</span>}
                  </div>
                </div>
                <div className="text-[22px] font-extrabold text-gray-900 mt-1 mb-1 leading-none">{kpi.val}</div>
                <div className={`text-[10px] font-bold flex items-center gap-1 ${kpi.col}`}>
                  {kpi.pct} {kpi.dsub && <span className="text-gray-500 font-medium">{kpi.dsub}</span>}
                </div>
                <MiniSparkline color={kpi.sparkCol || (kpi.up ? '#16a34a' : '#ef4444')} />
              </div>
            ))}
          </div>

          {/* Middle Row */}
          <div className="grid grid-cols-12 gap-4">
            
            {/* Rainfall Trend */}
            <div className="col-span-5 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-4">Rainfall Trend</h3>
              <div className="flex items-center gap-4 text-[9px] font-bold text-gray-500 mb-4">
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#16a34a]" /> Actual (mm)</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#a855f7]" /> Normal (mm)</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 border-t-2 border-dashed border-[#16a34a]" /> Forecast (mm)</div>
              </div>
              <div className="flex-1 min-h-[160px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={RAINFALL_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: 600 }} axisLine={false} tickLine={false} ticks={[0, 50, 100, 150, 200]} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="actual" fill="#16a34a" barSize={8} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="normal" fill="#a855f7" barSize={8} radius={[2, 2, 0, 0]} />
                    <Line type="monotone" dataKey="forecast" stroke="#16a34a" strokeDasharray="3 3" strokeWidth={2} dot={{ r: 3, fill: '#16a34a', strokeWidth: 0 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-between bg-[#f0fdf4] border border-green-200 px-3 py-2 rounded-xl mt-4 text-[10px]">
                <div className="flex items-start gap-2 font-semibold text-[#15803d]">
                  <Cloud size={14} className="text-green-700 mt-0.5 shrink-0" />
                  <span>Rainfall is 24% below normal in the last 30 days.<br/>Jun-Jul forecast indicates below normal rainfall.</span>
                </div>
                <button className="text-green-700 font-bold hover:underline flex items-center gap-1 shrink-0 ml-2">View rainfall details <ArrowRight size={10} /></button>
              </div>
            </div>

            {/* Climate Impact */}
            <div className="col-span-4 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">Climate Impact on Enterprise</h3>
              <div className="space-y-4 flex-1">
                {[
                  { icon: Droplet, title: 'Milk Yield Impact', sub: 'May reduce by 3-5% if rainfall deficit persists', tag: 'Low Risk', col: 'text-green-600', icol: 'text-blue-500 border-blue-200 bg-blue-50', spark: '#16a34a' },
                  { icon: Leaf, title: 'Feed Cost Impact', sub: 'Feed cost may increase due to low fodder availability', tag: 'Medium Risk', col: 'text-orange-600', icol: 'text-green-600 border-green-200 bg-green-50', spark: '#f97316' },
                  { icon: Droplet, title: 'Water Availability', sub: 'Water sources adequate for next 30 days', tag: 'Low Risk', col: 'text-green-600', icol: 'text-blue-500 border-blue-200 bg-blue-50', spark: '#16a34a' },
                  { icon: ShieldAlert, title: 'Disease Risk', sub: 'Low risk of climate induced diseases', tag: 'Low Risk', col: 'text-green-600', icol: 'text-red-500 border-red-200 bg-red-50', spark: '#16a34a' },
                ].map((imp, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`p-1.5 rounded border ${imp.icol} shrink-0`}><imp.icon size={12} /></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[11px] font-bold text-gray-900">{imp.title}</span>
                        <span className={`text-[9px] font-extrabold ${imp.col}`}>{imp.tag}</span>
                      </div>
                      <div className="text-[9px] text-gray-500 font-medium mb-1 line-clamp-1">{imp.sub}</div>
                      <div className="h-4"><MiniSparkline color={imp.spark} /></div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View all climate impacts <ArrowRight size={10} /></button>
            </div>

            {/* Climate Risk Score */}
            <div className="col-span-3 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">Climate Risk Score</h3>
              <div className="flex-1 flex flex-col items-center justify-center -mt-6">
                <div className="relative w-40 h-24 flex justify-center overflow-hidden">
                  <div className="absolute w-[160px] h-[160px] rounded-full border-[12px] border-[#f3f4f6]" />
                  <div className="absolute w-[160px] h-[160px] rounded-full border-[12px] border-[#16a34a] border-b-transparent border-r-transparent -rotate-45" />
                  <div className="absolute bottom-0 flex flex-col items-center">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[32px] font-extrabold text-gray-900 leading-none">72</span>
                      <span className="text-[12px] font-bold text-gray-500">/ 100</span>
                    </div>
                    <span className="text-[11px] font-extrabold text-gray-200 mt-1">Low Risk</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 mb-4 px-2">
                <div className="flex items-center justify-between text-[9px] font-bold">
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#16a34a]"/> Low Risk (0-40)</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#22c55e]"/> Moderate (41-70)</div>
                </div>
                <div className="flex items-center justify-between text-[9px] font-bold">
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#f97316]"/> High (71-90)</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#ef4444]"/> Very High (91-100)</div>
                </div>
              </div>
              <div className="text-[9px] text-gray-500 font-medium text-center mb-4 leading-relaxed px-2">
                Risk score is based on rainfall, temperature, extreme events and seasonal forecasts.
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline flex items-center justify-center gap-1 w-full mt-auto">View risk methodology <ArrowRight size={10} /></button>
            </div>

          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-12 gap-4">
            
            {/* Seasonal Forecast */}
            <div className="col-span-5 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">Seasonal Forecast (Next 3 Months)</h3>
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 text-[9px] text-gray-500 font-bold uppercase tracking-wide">
                      <th className="pb-3">Month</th>
                      <th className="pb-3">Rainfall Outlook</th>
                      <th className="pb-3">Temperature Outlook</th>
                      <th className="pb-3">Impact Outlook</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-[10px]">
                    {[
                      { m: 'Jun 2024', r: 'Below Normal', rIcon: ArrowDown, rCol: 'text-red-500', t: 'Above Normal', tIcon: ArrowUp, tCol: 'text-red-500', i: 'Feed availability may reduce' },
                      { m: 'Jul 2024', r: 'Below Normal', rIcon: ArrowDown, rCol: 'text-red-500', t: 'Above Normal', tIcon: ArrowUp, tCol: 'text-red-500', i: 'Monitor water & fodder' },
                      { m: 'Aug 2024', r: 'Normal', rIcon: Minus, rCol: 'text-gray-500', t: 'Normal', tIcon: Minus, tCol: 'text-gray-500', i: 'Favorable conditions' },
                    ].map((row, i) => (
                      <tr key={i}>
                        <td className="py-3 text-gray-200 font-bold">{row.m}</td>
                        <td className="py-3 font-bold text-gray-900"><div className="flex items-center gap-1.5">{row.r} <row.rIcon size={10} className={row.rCol} /></div></td>
                        <td className="py-3 font-bold text-gray-900"><div className="flex items-center gap-1.5">{row.t} <row.tIcon size={10} className={row.tCol} /></div></td>
                        <td className="py-3 text-gray-600 font-medium">{row.i}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View detailed forecast <ArrowRight size={10} /></button>
            </div>

            {/* Climate Alerts */}
            <div className="col-span-4 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">Climate Alerts</h3>
              <div className="space-y-4 flex-1">
                {[
                  { icon: AlertTriangle, title: 'Rainfall deficit likely to continue', sub: 'Satara District', date: 'May 18, 2024', col: 'text-orange-600 bg-orange-50 border-orange-100' },
                  { icon: AlertCircle, title: 'Heat index may increase next week', sub: 'Satara District', date: 'May 17, 2024', col: 'text-green-600 bg-green-50 border-green-100' },
                  { icon: CheckCircle, title: 'No extreme weather expected', sub: 'Next 30 days', date: 'May 15, 2024', col: 'text-green-600 bg-green-50 border-green-100' },
                ].map((alt, i) => (
                  <div key={i} className="flex items-start justify-between pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded border mt-0.5 ${alt.col}`}><alt.icon size={12} /></div>
                      <div>
                        <div className="text-[11px] font-bold text-gray-900 mb-0.5">{alt.title}</div>
                        <div className="text-[10px] text-gray-500 font-medium">{alt.sub}</div>
                      </div>
                    </div>
                    <div className="text-[9px] text-gray-500 font-bold shrink-0">{alt.date}</div>
                  </div>
                ))}
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View all alerts <ArrowRight size={10} /></button>
            </div>

            {/* Recommended Actions */}
            <div className="col-span-3 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">Recommended Actions</h3>
              <div className="space-y-4 flex-1">
                {[
                  { title: 'Plan fodder procurement for Jun-Jul', tag: 'High', col: 'text-red-700 bg-red-500/20 border-red-500/30' },
                  { title: 'Optimize water usage in operations', tag: 'Medium', col: 'text-orange-700 bg-orange-50 border-orange-100' },
                  { title: 'Monitor milk yield and animal health', tag: 'Low', col: 'text-green-700 bg-green-50 border-green-100' },
                ].map((act, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CalendarDays size={14} className="text-gray-500 shrink-0" />
                    <div className="text-[11px] font-bold text-gray-900 flex-1 leading-tight">{act.title}</div>
                    <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded border shrink-0 ${act.col}`}>{act.tag}</span>
                  </div>
                ))}
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View all actions <ArrowRight size={10} /></button>
            </div>

          </div>

          {/* Bottom Banner */}
          <div className="col-span-12 bg-white  border border-gray-100 rounded-[32px] p-4 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between group cursor-pointer hover:border-green-200 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} className="text-green-700" />
              </div>
              <div>
                <div className="text-[12px] font-extrabold text-gray-900 mb-0.5">Climate Resilience</div>
                <div className="text-[11px] text-gray-600 font-medium">Current climate risk is Low. Continue monitoring and adopt recommended actions to maintain resilience.</div>
              </div>
            </div>
            <button className="text-green-700 text-[11px] font-bold group-hover:underline flex items-center gap-1 pr-2">View resilience guide <ArrowRight size={10} /></button>
          </div>

        </div>
        </div>
      )}

      {activeTab === 'Market' && (
        <div className="space-y-4 animate-in fade-in mt-4">
          <div className="space-y-4 animate-in fade-in">
          
          {/* AI Market Summary Card */}
          <div className="bg-[#d9f99d]/10  border border-green-100 rounded-[32px] p-5 flex items-start gap-6 relative overflow-hidden shadow-sm mt-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0 shadow-sm border border-green-200/50">
              <BarChart2 size={24} className="text-green-700" />
            </div>
            
            <div className="flex-1 pr-4 border-r border-green-200/60">
              <h3 className="text-[14px] font-bold text-gray-900 mb-2">AI Market Summary</h3>
              <p className="text-[13px] text-gray-200 leading-relaxed font-medium">
                Milk prices are trending up in Satara. Demand is strong across Pune and Mumbai.<br/>
                Feed prices are stable with downward outlook. Overall market outlook is positive.
              </p>
            </div>
            
            <div className="shrink-0 px-4 border-r border-green-200/60 flex flex-col items-center justify-center h-full">
              <div className="flex items-center gap-2 mb-1 border border-green-200 bg-white px-3 py-1.5 rounded-xl shadow-sm">
                <Target size={20} className="text-green-700" />
                <div>
                  <div className="text-[9px] font-extrabold text-gray-500 uppercase tracking-wider mb-0.5">Market Opportunity</div>
                  <div className="text-[14px] font-extrabold text-green-700">High (78%)</div>
                </div>
              </div>
              <div className="text-[9px] text-gray-500 mt-2 font-medium">Updated today, 08:30 AM</div>
            </div>
            
            <div className="flex-1 pl-2">
              <h3 className="text-[11px] font-bold text-green-700 mb-2">Key Market Takeaways</h3>
              <ul className="space-y-1.5 mb-2">
                {['Milk price up by 4.8% in last 30 days', 'Strong demand from Pune and Mumbai markets', 'Feed prices expected to remain stable', 'Good opportunity to expand milk sales'].map((point, i) => (
                  <li key={i} className="text-[11px] text-gray-200 flex items-start gap-1.5 font-medium">
                    <span className="w-1 h-1 rounded-full bg-[#16a34a] mt-1.5 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
              <div className="text-right">
                <button className="text-green-700 text-[11px] font-bold hover:underline flex items-center gap-1 justify-end w-full">View AI Explanation <ArrowRight size={10} /></button>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-6 gap-4">
            {[
              { label: 'Avg. Milk Price', sub: '(₹/L)', val: '₹38.6', pct: '↑ 4.8%', dsub: 'vs last month', col: 'text-green-600', up: true, icon: Droplet, icol: 'text-blue-500 border-blue-200 bg-blue-50' },
              { label: 'Demand Index', sub: '', val: '84', valSub: '/ 100', pct: '↑ 6 pts', dsub: 'vs last month', col: 'text-green-600', up: true, icon: BarChart2, icol: 'text-purple-600 border-purple-200 bg-purple-50' },
              { label: 'Feed Price Index', sub: '', val: '112', valSub: '/ 100', pct: '↓ 1.2%', dsub: 'vs last month', col: 'text-red-500', up: false, icon: Package, icol: 'text-orange-500 border-orange-200 bg-orange-50', sparkCol: '#ef4444' },
              { label: 'Market Competition', sub: '', val: 'Moderate', pct: 'Stable', dsub: '', col: 'text-gray-500', up: true, icon: ShieldCheck, icol: 'text-purple-600 border-purple-200 bg-purple-50', sparkCol: '#a855f7' },
              { label: 'Market Opportunity', sub: '', val: '78%', pct: '↑ 8 pts', dsub: 'vs last month', col: 'text-green-600', up: true, icon: Target, icol: 'text-green-600 border-green-200 bg-green-50' },
              { label: 'Price Volatility', sub: '(30D)', val: 'Low', pct: 'Stable', dsub: '', col: 'text-gray-500', up: true, icon: Waves, icol: 'text-blue-500 border-blue-200 bg-blue-50' },
            ].map((kpi, i) => (
              <div key={i} className="bg-white  border border-gray-100 rounded-[32px] p-4 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-md border ${kpi.icol} bg-white shadow-sm shrink-0`}><kpi.icon size={12} className="opacity-80" /></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-extrabold text-gray-600 leading-tight truncate">{kpi.label}</span>
                    {kpi.sub && <span className="text-[9px] font-medium text-gray-500">{kpi.sub}</span>}
                  </div>
                </div>
                <div className="flex items-baseline gap-1 mt-1 mb-1">
                  <div className="text-[22px] font-extrabold text-gray-900 leading-none">{kpi.val}</div>
                  {kpi.valSub && <div className="text-[11px] font-bold text-gray-500">{kpi.valSub}</div>}
                </div>
                <div className={`text-[10px] font-bold flex items-center gap-1 ${kpi.col}`}>
                  {kpi.pct} {kpi.dsub && <span className="text-gray-500 font-medium">{kpi.dsub}</span>}
                </div>
                <MiniSparkline color={kpi.sparkCol || (kpi.up ? '#16a34a' : '#ef4444')} />
              </div>
            ))}
          </div>

          {/* Middle Row */}
          <div className="grid grid-cols-12 gap-4">
            
            {/* Milk Price Trend */}
            <div className="col-span-5 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-4">Milk Price Trend (₹/L)</h3>
              <div className="flex items-center gap-4 text-[9px] font-bold text-gray-500 mb-4">
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#16a34a]" /> Satara</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#a855f7]" /> Pune</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#3b82f6]" /> Mumbai</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 border-t-2 border-dashed border-[#16a34a]" /> Forecast</div>
              </div>
              <div className="flex-1 min-h-[160px] relative">
                <div className="absolute top-0 right-0 bottom-5 w-[35%] bg-orange-50/40 border-l border-dashed border-gray-300 pointer-events-none z-0 flex justify-center">
                  <span className="text-[9px] font-bold text-gray-500 mt-2 bg-white/80 px-1.5 py-0.5 rounded backdrop-blur-sm">Forecast Period</span>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MILK_PRICE_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[30, 50]} tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: 600 }} axisLine={false} tickLine={false} ticks={[30, 35, 40, 45, 50]} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Line type="monotone" dataKey="satara" stroke="#16a34a" strokeWidth={2} dot={{ r: 3, fill: '#16a34a', strokeWidth: 0 }} isAnimationActive={false} />
                    <Line type="monotone" dataKey="pune" stroke="#a855f7" strokeWidth={2} dot={{ r: 3, fill: '#a855f7', strokeWidth: 0 }} isAnimationActive={false} />
                    <Line type="monotone" dataKey="mumbai" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-between bg-[#f0fdf4] border border-green-200 px-3 py-2 rounded-xl mt-4 text-[10px]">
                <div className="flex items-center gap-2 font-semibold text-[#15803d]">
                  <Sprout size={14} className="text-green-700" />
                  Milk prices are expected to remain positive over the next 3 months.
                </div>
                <button className="text-green-700 font-bold hover:underline flex items-center gap-1 shrink-0 ml-2">View price forecast <ArrowRight size={10} /></button>
              </div>
            </div>

            {/* Demand by Market */}
            <div className="col-span-3 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">Demand by Market <span className="text-gray-500 font-medium text-[10px]">(Last 30 Days)</span></h3>
              <div className="flex flex-col items-center flex-1">
                <div className="relative w-[130px] h-[130px] shrink-0 mb-6">
                  <PieChart width={130} height={130}>
                    <Pie data={DEMAND_DATA} cx={65} cy={65} innerRadius={50} outerRadius={65} dataKey="value" stroke="none">
                      {DEMAND_DATA.map((entry, i) => <Cell key={i} fill={entry.col} />)}
                    </Pie>
                  </PieChart>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[20px] font-extrabold text-gray-900">72.4%</span>
                    <span className="text-[9px] text-gray-500 font-bold mt-0.5 text-center leading-tight">Total Demand<br/>Share</span>
                  </div>
                </div>
                <div className="w-full space-y-3">
                  {DEMAND_DATA.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.col }} />
                        <span className="text-gray-900 font-bold">{item.name}</span>
                      </div>
                      <span className="text-gray-500 font-bold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center justify-start gap-1">View demand insights <ArrowRight size={10} /></button>
            </div>

            {/* Feed Price Trend */}
            <div className="col-span-4 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-4">Feed Price Trend (₹/Quintal)</h3>
              <div className="flex items-center gap-4 text-[9px] font-bold text-gray-500 mb-4">
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#16a34a]" /> Concentrate</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#a855f7]" /> Fodder</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#3b82f6]" /> Oil Cake</div>
              </div>
              <div className="flex-1 min-h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={FEED_PRICE_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: 600 }} axisLine={false} tickLine={false} ticks={[0, 500, 1000, 1500, 2000]} tickFormatter={(v)=>v===0?'0':`${v/1000}K`} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Line type="monotone" dataKey="concentrate" stroke="#16a34a" strokeWidth={2} dot={{ r: 3, fill: '#16a34a', strokeWidth: 0 }} isAnimationActive={false} />
                    <Line type="monotone" dataKey="fodder" stroke="#a855f7" strokeWidth={2} dot={{ r: 3, fill: '#a855f7', strokeWidth: 0 }} isAnimationActive={false} />
                    <Line type="monotone" dataKey="oilcake" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-between mt-4 text-[10px]">
                <div className="font-semibold text-gray-600">Feed prices are expected to remain stable.</div>
                <button className="text-green-700 font-bold hover:underline flex items-center gap-1">View feed outlook <ArrowRight size={10} /></button>
              </div>
            </div>

          </div>

          {/* Bottom Row 1 */}
          <div className="grid grid-cols-12 gap-4">
            
            {/* Top Milk Buyers */}
            <div className="col-span-5 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-5">Top Milk Buyers</h3>
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 text-[9px] text-gray-500 font-bold uppercase tracking-wide">
                      <th className="pb-2.5">Buyer</th>
                      <th className="pb-2.5">Location</th>
                      <th className="pb-2.5">Avg. Price (₹/L)</th>
                      <th className="pb-2.5">Trend (30D)</th>
                      <th className="pb-2.5">Demand Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-[10px]">
                    {[
                      { buyer: 'Gokul Dairy', loc: 'Pune', price: '39.2', trend: '↑ 4.6%', share: '28%' },
                      { buyer: 'Warana Dairy', loc: 'Kolhapur', price: '38.8', trend: '↑ 4.2%', share: '18%' },
                      { buyer: 'Mumbai Milk Union', loc: 'Mumbai', price: '40.1', trend: '↑ 5.1%', share: '16%' },
                      { buyer: 'Local Collection', loc: 'Satara', price: '35.4', trend: '↑ 3.2%', share: '12%' },
                      { buyer: 'Other Buyers', loc: '-', price: '37.6', trend: '↑ 2.8%', share: '26%' },
                    ].map((row, i) => (
                      <tr key={i}>
                        <td className="py-3 text-gray-900 font-bold">{row.buyer}</td>
                        <td className="py-3 text-gray-600 font-medium">{row.loc}</td>
                        <td className="py-3 text-gray-900 font-extrabold">{row.price}</td>
                        <td className="py-3 text-green-600 font-bold">{row.trend}</td>
                        <td className="py-3 text-gray-600 font-bold">{row.share}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View all buyers <ArrowRight size={10} /></button>
            </div>

            {/* Market Intelligence */}
            <div className="col-span-4 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">Market Intelligence</h3>
              <div className="space-y-5 flex-1">
                {[
                  { icon: Store, title: 'Pune demand strong', sub: 'Hotels and sweet shops increasing procurement', tag: 'Positive', tagCol: 'text-green-600', icol: 'text-green-600 bg-green-50 border-green-100' },
                  { icon: ShoppingCart, title: 'Mumbai prices firm', sub: 'Urban demand and processing units active', tag: 'Positive', tagCol: 'text-green-600', icol: 'text-green-600 bg-green-50 border-green-100' },
                  { icon: Package, title: 'Fodder supply normal', sub: 'Good availability in local markets', tag: 'Neutral', tagCol: 'text-blue-500', icol: 'text-blue-500 bg-blue-50 border-blue-100' },
                  { icon: Users, title: 'Competition moderate', sub: 'Few new players entering Satara market', tag: 'Neutral', tagCol: 'text-blue-500', icol: 'text-purple-500 bg-purple-50 border-purple-100' },
                ].map((intel, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`p-1.5 rounded border mt-0.5 shrink-0 ${intel.icol}`}><intel.icon size={12} /></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[11px] font-bold text-gray-900">{intel.title}</span>
                        <span className={`text-[9px] font-extrabold ${intel.tagCol}`}>{intel.tag}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 font-medium leading-tight">{intel.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View full market intelligence <ArrowRight size={10} /></button>
            </div>

            {/* Market Outlook */}
            <div className="col-span-3 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">Market Outlook <span className="text-gray-500 font-medium text-[10px]">(Next 3 Months)</span></h3>
              <div className="space-y-5 flex-1">
                {[
                  { label: 'Milk Price Outlook', tag: 'Positive', tagCol: 'text-green-600', sub: 'Expected to increase by 3-6%' },
                  { label: 'Demand Outlook', tag: 'Positive', tagCol: 'text-green-600', sub: 'Strong demand from urban markets' },
                  { label: 'Feed Price Outlook', tag: 'Stable', tagCol: 'text-gray-600', sub: 'Prices expected to remain stable' },
                  { label: 'Market Opportunity', tag: 'High', tagCol: 'text-green-600', sub: 'Good opportunity to expand sales' },
                ].map((out, i) => (
                  <div key={i} className="flex flex-col gap-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-200">{out.label}</span>
                      <span className={`text-[10px] font-extrabold ${out.tagCol}`}>{out.tag}</span>
                    </div>
                    <span className="text-[9px] text-gray-500 font-medium leading-tight">{out.sub}</span>
                  </div>
                ))}
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View detailed outlook <ArrowRight size={10} /></button>
            </div>

          </div>

          {/* Bottom Row 2 */}
          <div className="grid grid-cols-12 gap-4">
            
            {/* Recommended Actions */}
            <div className="col-span-4 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">Recommended Actions</h3>
              <div className="space-y-4 flex-1">
                {[
                  { title: 'Increase milk collection during peak demand period in Pune and Mumbai', tag: 'High', col: 'text-red-700 bg-red-500/20 border-red-500/30' },
                  { title: 'Explore long-term supply agreement with Gokul Dairy', tag: 'Medium', col: 'text-orange-700 bg-orange-50 border-orange-100' },
                  { title: 'Monitor feed prices and maintain inventory levels', tag: 'Low', col: 'text-green-700 bg-green-50 border-green-100' },
                ].map((act, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CalendarDays size={14} className="text-gray-500 shrink-0 mt-0.5" />
                    <div className="text-[11px] font-bold text-gray-900 flex-1 leading-tight">{act.title}</div>
                    <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded border shrink-0 ${act.col}`}>{act.tag}</span>
                  </div>
                ))}
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View all actions <ArrowRight size={10} /></button>
            </div>

            {/* Market Alerts */}
            <div className="col-span-4 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">Market Alerts</h3>
              <div className="space-y-4 flex-1">
                {[
                  { icon: AlertTriangle, title: 'Milk price rising trend', date: 'May 18, 2024', col: 'text-orange-600 bg-orange-50 border-orange-100' },
                  { icon: AlertCircle, title: 'Pune demand spike', date: 'May 17, 2024', col: 'text-green-600 bg-green-50 border-green-100' },
                  { icon: CheckCircle, title: 'Feed prices stable', date: 'May 16, 2024', col: 'text-green-600 bg-green-50 border-green-100' },
                ].map((alt, i) => (
                  <div key={i} className="flex items-center justify-between pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded border ${alt.col}`}><alt.icon size={12} /></div>
                      <div className="text-[11px] font-bold text-gray-900">{alt.title}</div>
                    </div>
                    <div className="text-[9px] text-gray-500 font-bold shrink-0">{alt.date}</div>
                  </div>
                ))}
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View all alerts <ArrowRight size={10} /></button>
            </div>

            {/* Timeline Preview */}
            <div className="col-span-4 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">Timeline Preview</h3>
              <div className="space-y-4 flex-1 relative pl-2">
                <div className="absolute top-2 bottom-2 left-[11px] w-px bg-gray-200 z-0"></div>
                {[
                  { title: 'Milk price increase expected', date: 'May 20, 2024', col: 'border-[#16a34a]' },
                  { title: 'Pune demand peak', date: 'May 25, 2024', col: 'border-[#16a34a]' },
                  { title: 'Feed price review', date: 'May 30, 2024', col: 'border-[#16a34a]' },
                  { title: 'Market analysis update', date: 'Jun 05, 2024', col: 'border-gray-400' },
                ].map((tl, i) => (
                  <div key={i} className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full bg-white border-2 shrink-0 ${tl.col}`} />
                      <div className="text-[11px] font-bold text-gray-900">{tl.title}</div>
                    </div>
                    <div className="text-[9px] text-gray-500 font-bold shrink-0">{tl.date}</div>
                  </div>
                ))}
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View full timeline <ArrowRight size={10} /></button>
            </div>

          </div>

        </div>
        </div>
      )}

      {activeTab === 'Timeline' && (
        <div className="space-y-4 animate-in fade-in mt-4">
          <div className="space-y-6 animate-in fade-in mt-4">
          
          {/* AI Timeline Summary Card */}
          <div className="bg-[#d9f99d]/10  border border-green-100 rounded-[32px] p-5 flex items-start gap-6 relative overflow-hidden shadow-sm">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0 shadow-sm border border-green-200/50">
              <Clock size={24} className="text-green-700" />
            </div>
            
            <div className="flex-1 pr-4 border-r border-green-200/60">
              <h3 className="text-[14px] font-bold text-gray-900 mb-2">AI Timeline Summary</h3>
              <p className="text-[13px] text-gray-200 leading-relaxed font-medium">
                Krishna Dairy Farm has shown steady growth with improved financial and operational performance.<br/>
                Monitor upcoming payments and seasonal events.
              </p>
            </div>
            
            <div className="shrink-0 px-6 border-r border-green-200/60 flex flex-col items-center justify-center h-full">
              <div className="text-[9px] font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">Enterprise Journey</div>
              <div className="flex items-center gap-1.5 border border-green-200 bg-white px-3 py-1.5 rounded-xl shadow-sm text-green-700">
                <TrendingUp size={16} />
                <span className="text-[13px] font-extrabold">Stable Growth</span>
              </div>
              <div className="text-[9px] text-gray-500 mt-2 font-medium">Updated today, 08:30 AM</div>
            </div>
            
            <div className="flex-1 pl-2">
              <h3 className="text-[11px] font-bold text-green-700 mb-2">Key Timeline Takeaways</h3>
              <ul className="space-y-1.5 mb-2">
                {['Repayment behaviour remains strong', 'Milk production trending upward', 'Monsoon may impact feed availability in Jun-Jul', 'Market demand expected to remain positive'].map((point, i) => (
                  <li key={i} className="text-[11px] text-gray-200 flex items-start gap-1.5 font-medium">
                    <span className="w-1 h-1 rounded-full bg-[#16a34a] mt-1.5 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
              <div className="text-right">
                <button className="text-green-700 text-[11px] font-bold hover:underline flex items-center gap-1 justify-end w-full">View AI Explanation <ArrowRight size={10} /></button>
              </div>
            </div>
          </div>

          {/* Main Grid Content */}
          <div className="grid grid-cols-12 gap-8">
            
            {/* Left Panel: Timeline */}
            <div className="col-span-8 bg-white  border border-gray-100 rounded-[32px] p-6 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between mb-8">
                <div className="border border-gray-100 rounded-xl px-3 py-1.5 text-[11px] font-bold text-gray-200 flex items-center gap-2 cursor-pointer hover:bg-white/5">
                  All Events <ChevronDown size={12} className="text-gray-500" />
                </div>
              </div>

              <div className="pl-4">
                {TIMELINE_EVENTS.map((evt: any, i: number) => {
                  let IconComponent = Sparkles;
                  if (evt.icon === 'CheckCircle2') IconComponent = CheckCircle2;
                  if (evt.icon === 'Info') IconComponent = Info;
                  if (evt.icon === 'AlertTriangle') IconComponent = AlertTriangle;
                  if (evt.icon === 'CalendarDays') IconComponent = CalendarDays;

                  return (
                  <div key={i} className="flex gap-6 relative">
                    <div className="w-12 text-[10px] font-bold text-gray-500 text-right leading-tight pt-1 whitespace-pre-wrap shrink-0">
                      {evt.date}
                    </div>
                    <div className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-gray-900 ${evt.iconCol} relative z-10 shadow-sm border-[2px] border-white shrink-0`}>
                        <IconComponent size={12} strokeWidth={3} />
                      </div>
                      <div className={`w-[2px] flex-1 ${evt.lineCol}`} />
                    </div>
                    <div className="flex-1 pb-10 flex justify-between items-start pt-0.5">
                      <div>
                        <div className="flex items-center gap-3 mb-1.5">
                          <span className="text-[14px] font-extrabold text-gray-900">{evt.title}</span>
                          <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded border ${evt.catCol}`}>{evt.cat}</span>
                        </div>
                        <div className="text-[12px] text-gray-600 font-medium">{evt.desc}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-[13px] font-extrabold text-gray-900">{evt.val}</span>
                        <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded border ${evt.statusCol}`}>{evt.status}</span>
                      </div>
                    </div>
                  </div>
                )})}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
                <span className="text-[11px] font-bold text-gray-500">Showing 7 of 7 events</span>
                <button className="text-green-700 text-[11px] font-bold hover:underline flex items-center gap-1 border border-green-200 px-3 py-1.5 rounded-xl bg-[#f0fdf4]">View Full Timeline <ArrowRight size={10} /></button>
              </div>
            </div>

            {/* Right Panel: Side Widgets */}
            <div className="col-span-4 space-y-6">
              
              {/* Top Controls */}
              <div className="flex items-center justify-between">
                <div className="flex bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                  {['1M','3M','6M','1Y','All'].map((t, idx) => (
                    <button key={t} className={`px-3 py-1.5 text-[10px] font-bold border-r border-gray-100 last:border-r-0 hover:bg-white/5 transition-colors ${idx === 1 ? 'text-green-700 bg-[#f0fdf4]' : 'text-gray-600 bg-white'}`}>
                      {t}
                    </button>
                  ))}
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-100 rounded-xl text-[11px] font-bold text-gray-200 hover:bg-white/5 bg-white shadow-sm">
                  <Download size={12} /> Download Timeline
                </button>
              </div>

              {/* Event Impact Overview */}
              <div className="bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
                <h3 className="text-[13px] font-extrabold text-gray-900 mb-5">Event Impact Overview <span className="text-[10px] font-medium text-gray-500">(Last 3 Months)</span></h3>
                <div className="space-y-4">
                  {[
                    { icon: Briefcase, title: 'Financial Events', val: 12, tag: 'Positive', tagCol: 'text-green-700 bg-green-50 border-green-100', iconCol: 'text-green-600 bg-green-50 border-green-100' },
                    { icon: Settings, title: 'Operational Events', val: 18, tag: 'Neutral', tagCol: 'text-blue-700 bg-blue-50 border-blue-100', iconCol: 'text-blue-600 bg-blue-50 border-blue-100' },
                    { icon: CloudRain, title: 'Climate Events', val: 6, tag: 'Mixed', tagCol: 'text-orange-700 bg-orange-50 border-orange-100', iconCol: 'text-orange-600 bg-orange-50 border-orange-100' },
                    { icon: TrendingUp, title: 'Market Events', val: 9, tag: 'Positive', tagCol: 'text-green-700 bg-green-50 border-green-100', iconCol: 'text-purple-600 bg-purple-50 border-purple-100' }
                  ].map((ev, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${ev.iconCol}`}>
                          <ev.icon size={14} />
                        </div>
                        <span className="text-[11px] font-bold text-gray-900">{ev.title}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[13px] font-extrabold text-gray-900">{ev.val}</span>
                        <span className={`px-2 py-0.5 rounded border text-[9px] font-extrabold w-14 text-center ${ev.tagCol}`}>{ev.tag}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Key Events */}
              <div className="bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
                <h3 className="text-[13px] font-extrabold text-gray-900 mb-5">Upcoming Key Events</h3>
                <div className="space-y-5">
                  {[
                    { icon: CalendarDays, title: 'EMI Payment Due', date: 'May 28, 2024', val: '₹35,000', tag: 'Upcoming', tagCol: 'text-purple-700 bg-purple-50 border-purple-100' },
                    { icon: CloudRain, title: 'Monsoon Onset', date: 'Jun 05, 2024', val: 'Seasonal Event', tag: 'Upcoming', tagCol: 'text-purple-700 bg-purple-50 border-purple-100' },
                    { icon: ClipboardList, title: 'Feed Stock Review', date: 'Jun 10, 2024', val: 'Review', tag: 'Upcoming', tagCol: 'text-purple-700 bg-purple-50 border-purple-100' },
                  ].map((upc, i) => (
                    <div key={i} className="flex items-start justify-between pb-5 border-b border-gray-50 last:pb-0 last:border-0">
                      <div className="flex gap-3">
                        <upc.icon size={14} className="text-gray-500 mt-0.5" />
                        <div>
                          <div className="text-[11px] font-bold text-gray-900 mb-0.5">{upc.title}</div>
                          <div className="text-[10px] font-bold text-gray-500">{upc.date}</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-[11px] font-extrabold text-gray-900">{upc.val}</span>
                        <span className={`px-1.5 py-0.5 rounded border text-[9px] font-extrabold ${upc.tagCol}`}>{upc.tag}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View all upcoming events <ArrowRight size={10} /></button>
              </div>

              {/* Timeline Insights */}
              <div className="bg-[#d9f99d]/10  border border-green-100 rounded-[32px] p-5 shadow-sm flex flex-col relative overflow-hidden">
                <h3 className="text-[12px] font-extrabold text-gray-900 flex items-center gap-1.5 mb-3">
                  <Sparkles size={16} className="text-green-700" /> Timeline Insights
                </h3>
                <p className="text-[12px] text-gray-700 leading-relaxed font-medium">{(forecast as any)?.earlyWarning?.summary || 'No risk summary available.'}</p>
                <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View AI insights <ArrowRight size={10} /></button>
              </div>

            </div>
          </div>
        </div>
        </div>
      )}

      {activeTab === 'AI Edition' && (
        <div className="space-y-4 animate-in fade-in mt-4">
          <div className="space-y-4 animate-in fade-in mt-4">
          
          {/* AI Overall Summary Card */}
          <div className="bg-[#d9f99d]/10  border border-green-100 rounded-[32px] p-5 flex items-start gap-6 relative overflow-hidden shadow-sm">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0 shadow-sm border border-green-200/50">
              <Sparkles size={24} className="text-green-700" />
            </div>
            
            <div className="flex-1 pr-4 border-r border-green-200/60">
              <h3 className="text-[14px] font-bold text-gray-900 mb-2">AI Overall Summary</h3>
              <p className="text-[13px] text-gray-200 leading-relaxed font-medium">
                Krishna Dairy Farm is performing well with strong repayment behaviour and improving operational efficiency. Cash flow outlook is positive with low risk of delinquency. Weather and market conditions are favourable.
              </p>
            </div>
            
            <div className="shrink-0 px-4 border-r border-green-200/60 flex flex-col items-center justify-center h-full">
              <div className="flex items-center gap-2 mb-1 border border-green-200 bg-white px-3 py-1.5 rounded-xl shadow-sm">
                <ShieldCheck size={20} className="text-green-700" />
                <div>
                  <div className="text-[9px] font-extrabold text-gray-500 uppercase tracking-wider mb-0.5">AI Confidence</div>
                  <div className="text-[14px] font-extrabold text-green-700">High (92%)</div>
                </div>
              </div>
              <div className="text-[9px] text-gray-500 mt-2 font-medium">Updated today, 08:30 AM</div>
            </div>
            
            <div className="flex-1 pl-2">
              <h3 className="text-[11px] font-bold text-green-700 mb-2">Key AI Takeaways</h3>
              <ul className="space-y-1.5 mb-2">
                {['Repayment probability remains strong at 96%', 'Milk production trending upward (+4.6%)', 'Rainfall normal: climate risk is low', 'Market demand strong with stable prices'].map((point, i) => (
                  <li key={i} className="text-[11px] text-gray-200 flex items-start gap-1.5 font-medium">
                    <span className="w-1 h-1 rounded-full bg-[#16a34a] mt-1.5 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
              <div className="text-right">
                <button className="text-green-700 text-[11px] font-bold hover:underline flex items-center gap-1 justify-end w-full">View AI Explanation <ArrowRight size={10} /></button>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-6 gap-4">
            {[
              { label: 'Health Score', sub: '', val: '84', valSub: '/ 100', pct: '↑ 6 pts', dsub: 'vs last month', col: 'text-green-600', up: true, icon: HeartPulse, icol: 'text-green-600 border-green-200 bg-green-50' },
              { label: 'Repayment Probability', sub: '', val: '96%', valSub: '', pct: '↑ 4%', dsub: 'vs last month', col: 'text-green-600', up: true, icon: ShieldCheck, icol: 'text-green-600 border-green-200 bg-green-50' },
              { label: 'Predicted Cashflow', sub: '(Next 3 Months)', val: '₹2.48 L', valSub: '', pct: '↑ 8.3%', dsub: 'vs last month', col: 'text-green-600', up: true, icon: Waves, icol: 'text-blue-500 border-blue-200 bg-blue-50' },
              { label: 'Risk Level', sub: '', val: 'Low', valSub: '', pct: 'Stable', dsub: '', col: 'text-gray-500', up: false, icon: AlertTriangle, icol: 'text-orange-500 border-orange-200 bg-orange-50', sparkCol: '#f97316' },
              { label: 'Climate Risk', sub: '', val: 'Low', valSub: '', pct: 'Stable', dsub: '', col: 'text-gray-500', up: true, icon: CloudRain, icol: 'text-green-600 border-green-200 bg-green-50' },
              { label: 'Market Outlook', sub: '', val: 'Positive', valSub: '', pct: 'Stable', dsub: '', col: 'text-gray-500', up: true, icon: BarChart2, icol: 'text-purple-600 border-purple-200 bg-purple-50', sparkCol: '#a855f7' },
            ].map((kpi, i) => (
              <div key={i} className="bg-white  border border-gray-100 rounded-[32px] p-4 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-extrabold text-gray-600 leading-tight">{kpi.label}</span>
                    {kpi.sub && <span className="text-[9px] font-medium text-gray-500">{kpi.sub}</span>}
                  </div>
                  <div className={`p-1.5 rounded-md border ${kpi.icol} bg-white shadow-sm shrink-0`}><kpi.icon size={12} className="opacity-80" /></div>
                </div>
                <div className="flex items-baseline gap-1 mt-1 mb-1">
                  <div className="text-[22px] font-extrabold text-gray-900 leading-none">{kpi.val}</div>
                  {kpi.valSub && <div className="text-[11px] font-bold text-gray-500">{kpi.valSub}</div>}
                </div>
                <div className={`text-[10px] font-bold flex items-center gap-1 ${kpi.col}`}>
                  {kpi.pct} {kpi.dsub && <span className="text-gray-500 font-medium">{kpi.dsub}</span>}
                </div>
                <MiniSparkline color={kpi.sparkCol || (kpi.up ? '#16a34a' : '#ef4444')} />
              </div>
            ))}
          </div>

          {/* Middle Row */}
          <div className="grid grid-cols-12 gap-4">
            
            {/* AI Cashflow Forecast */}
            <div className="col-span-5 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">AI Cashflow Forecast</h3>
              <div className="flex-1 flex gap-4">
                <div className="w-[120px] flex flex-col justify-center shrink-0">
                  <div className="text-[24px] font-extrabold text-gray-900 leading-none mb-1">₹2.48 L</div>
                  <div className="text-[10px] text-gray-500 font-bold mb-4">Net Cashflow (Next 3 Months)</div>
                  <div className="text-[11px] font-bold text-green-600 flex items-center gap-1">↑ 8.3% <span className="text-gray-500 font-medium">vs last month</span></div>
                </div>
                <div className="flex-1 relative -mt-6">
                  <div className="absolute top-0 right-0 flex flex-wrap items-center justify-end gap-3 text-[9px] font-bold text-gray-500 z-10 w-full pb-2">
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#16a34a]" /> Inflows</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ef4444]" /> Outflows</div>
                    <div className="flex items-center gap-1"><span className="w-3 h-0.5 border-t-2 border-[#a855f7]" /> Net Cashflow</div>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={AI_CASHFLOW_DATA} margin={{ top: 25, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 4]} tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: 600 }} axisLine={false} tickLine={false} ticks={[0, 1, 2, 3, 4]} tickFormatter={(v)=>v+'L'} />
                      <Tooltip cursor={{fill: 'transparent'}} />
                      <Bar dataKey="inflows" fill="#16a34a" barSize={16} radius={[2, 2, 0, 0]} />
                      <Bar dataKey="outflows" fill="#ef4444" barSize={16} radius={[2, 2, 0, 0]} />
                      <Line type="monotone" dataKey="net" stroke="#a855f7" strokeWidth={2} dot={{ r: 4, fill: '#a855f7', strokeWidth: 0 }} isAnimationActive={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View detailed forecast <ArrowRight size={10} /></button>
            </div>

            {/* AI Credit Health */}
            <div className="col-span-4 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">AI Credit Health</h3>
              <div className="flex-1 flex items-center gap-4">
                <div className="relative w-[110px] h-[110px] shrink-0">
                  <PieChart width={110} height={110}>
                    <Pie data={AI_CREDIT_HEALTH_DATA} cx={55} cy={55} innerRadius={42} outerRadius={55} dataKey="value" stroke="none">
                      <Cell fill="#16a34a" />
                      <Cell fill="#f3f4f6" />
                    </Pie>
                  </PieChart>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[20px] font-extrabold text-gray-900">96%</span>
                    <span className="text-[8px] text-gray-500 font-bold text-center leading-tight mt-0.5">Repayment<br/>Probability</span>
                  </div>
                </div>
                <div className="flex-1 space-y-3.5">
                  {[
                    { label: 'On-time Repayments', val: '96%', col: '#16a34a' },
                    { label: 'No Overdue Installments', val: '96%', col: '#ef4444' },
                    { label: 'Low Delinquency Risk', val: '96%', col: '#16a34a' },
                    { label: 'Strong Cashflow Coverage', val: '96%', col: '#16a34a' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.col }} />
                        <span className="text-gray-200 font-bold leading-tight">{item.label}</span>
                      </div>
                      <span className="text-gray-900 font-extrabold pl-2">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View credit details <ArrowRight size={10} /></button>
            </div>

            {/* AI Explanation */}
            <div className="col-span-3 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-5">AI Explanation (Why this Score?)</h3>
              <div className="flex-1">
                <div className="bg-[#f0fdf4] border border-green-200 rounded-xl p-3 text-[10px] text-gray-200 font-medium leading-relaxed mb-5 shadow-sm">
                  AI has analysed 27+ data points across financial, operational, climate and market signals.
                </div>
                <div className="space-y-3">
                  {[
                    'Consistent on-time repayments',
                    'Improved milk yield and feed efficiency',
                    'Normal rainfall and low climate risk',
                    'Strong demand and stable milk prices'
                  ].map((pt, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 size={12} className="text-green-700 shrink-0 mt-0.5" />
                      <span className="text-[11px] font-bold text-gray-900 leading-tight">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View full explanation <ArrowRight size={10} /></button>
            </div>

          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-12 gap-4">
            
            {/* Top AI Recommended Actions */}
            <div className="col-span-4 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">Top AI Recommended Actions</h3>
              <div className="space-y-4 flex-1">
                {[
                  { icon: Leaf, title: 'Optimize feed procurement', sub: 'AI suggests procurement in next 7 days for better prices', tag: 'High', col: 'text-red-700 bg-red-500/20 border-red-500/30', icol: 'text-green-600 bg-green-50 border-green-100' },
                  { icon: TrendingUp, title: 'Explore working capital enhancement', sub: 'Based on positive cashflow outlook', tag: 'Medium', col: 'text-orange-700 bg-orange-50 border-orange-100', icol: 'text-blue-600 bg-blue-50 border-blue-100' },
                  { icon: ShieldCheck, title: 'Consider livestock insurance', sub: 'Monsoon onset expected in early Jun', tag: 'Low', col: 'text-green-700 bg-green-50 border-green-100', icol: 'text-green-600 bg-green-50 border-green-100' },
                ].map((act, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`p-1.5 rounded border shrink-0 mt-0.5 ${act.icol}`}><act.icon size={14} /></div>
                    <div className="flex-1">
                      <div className="text-[11px] font-bold text-gray-900 mb-0.5">{act.title}</div>
                      <div className="text-[9px] text-gray-500 font-medium leading-tight">{act.sub}</div>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded border shrink-0 ${act.col}`}>{act.tag}</span>
                  </div>
                ))}
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View all actions <ArrowRight size={10} /></button>
            </div>

            {/* AI Timeline Preview */}
            <div className="col-span-4 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">AI Timeline Preview</h3>
              <div className="space-y-5 flex-1">
                {[
                  { icon: TrendingUp, title: 'Next Milk Collection Peak', date: 'May 28, 2024', col: 'text-green-600' },
                  { icon: CloudRain, title: 'Monsoon Onset Expected', date: 'Jun 05, 2024', col: 'text-blue-500' },
                  { icon: ClipboardList, title: 'Feed Price Review', date: 'Jun 10, 2024', col: 'text-gray-500' },
                  { icon: IndianRupee, title: 'Next EMI Due', date: 'May 28, 2024', col: 'text-purple-500' },
                ].map((tl, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <tl.icon size={16} className={tl.col} />
                      <div className="text-[11px] font-bold text-gray-900">{tl.title}</div>
                    </div>
                    <div className="text-[10px] text-gray-500 font-bold shrink-0">{tl.date}</div>
                  </div>
                ))}
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View full timeline <ArrowRight size={10} /></button>
            </div>

            {/* AI Market Signals */}
            <div className="col-span-4 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">AI Market Signals</h3>
              <div className="space-y-5 flex-1">
                {[
                  { icon: Lock, title: 'Milk Price Trend (30D)', tag: '↑ 4.8%', tagCol: 'text-green-700 bg-green-50 border-green-100' },
                  { icon: Activity, title: 'Demand Outlook', tag: 'Strong', tagCol: 'text-green-700 bg-green-50 border-green-100' },
                  { icon: Package, title: 'Feed Price Outlook', tag: 'Stable', tagCol: 'text-blue-700 bg-blue-50 border-blue-100' },
                  { icon: Target, title: 'Market Opportunity', tag: 'High', tagCol: 'text-green-700 bg-green-50 border-green-100' },
                ].map((sig, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-gray-500">
                      <sig.icon size={14} />
                      <div className="text-[11px] font-bold text-gray-900">{sig.title}</div>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded border shrink-0 ${sig.tagCol}`}>{sig.tag}</span>
                  </div>
                ))}
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View market insights <ArrowRight size={10} /></button>
            </div>

          </div>

          {/* Bottom Banner */}
          <div className="bg-white  border border-gray-100 rounded-[32px] p-4 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between group cursor-pointer hover:border-green-200 transition-colors">
            <div className="flex items-center gap-3">
              <Sparkles size={20} className="text-green-700" />
              <div>
                <div className="text-[12px] font-extrabold text-gray-900 mb-0.5">Powered by GramPulse AI</div>
                <div className="text-[11px] text-gray-600 font-medium">Continuous learning from 10M+ rural data points to deliver smarter insights.</div>
              </div>
            </div>
            <button className="text-gray-500 text-[11px] font-bold group-hover:text-gray-200 flex items-center gap-1 pr-2 transition-colors">How AI works <ArrowRight size={10} /></button>
          </div>

        </div>
        </div>
      )}

      
      {activeTab === 'Risk Centre' && (
        <div className="space-y-4 animate-in fade-in mt-4">
          <div className="flex justify-end">
            <button 
              onClick={() => setShowUnderwriting(true)}
              className="bg-[#d9f99d] text-[#1c2a1c] px-4 py-2 rounded-xl text-[12px] font-bold hover:bg-[#15803d] transition-colors shadow-sm flex items-center gap-2">
              <ShieldCheck size={14} /> Request Credit Assessment
            </button>
          </div>
          
          {/* AI Risk Summary */}
          <div className="bg-[#d9f99d]/10  border border-green-100 rounded-[32px] p-5 flex items-start gap-6 relative overflow-hidden shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#fee2e2] flex items-center justify-center shrink-0 shadow-sm border border-[#fca5a5]">
              <ShieldCheck size={24} className="text-[#ef4444]" />
            </div>
            
            <div className="flex-1 pr-4 border-r border-green-200/60">
              <h3 className="text-[14px] font-bold text-gray-900 mb-2">AI Risk Summary</h3>
              <p className="text-[13px] text-green-800 leading-relaxed font-medium">
                Overall risk is Low. Repayment probability is strong with stable cash flow and healthy operations. Continue monitoring monsoon impact and feed price volatility.
              </p>
            </div>
            
            <div className="shrink-0 px-6 border-r border-green-200/60 flex flex-col items-center justify-center h-full">
              <div className="flex items-center gap-3">
                <CloudRain size={24} className="text-green-700" />
                <div>
                  <div className="text-[10px] font-bold text-gray-500 mb-0.5">Overall Risk Level</div>
                  <div className="text-[15px] font-extrabold text-green-700">Low</div>
                </div>
              </div>
              <div className="text-[9px] text-gray-500 mt-2 font-medium">Updated today, 08:30 AM</div>
            </div>
            
            <div className="flex-1 pl-4">
              <h3 className="text-[11px] font-bold text-green-700 mb-2">Key Risk Takeaways</h3>
              <ul className="space-y-1.5 mb-2">
                {['Repayment probability remains strong at 96%', 'Climate risk is low for next 30 days', 'Feed price volatility is moderate', 'Market demand outlook is positive'].map((point, i) => (
                  <li key={i} className="text-[11px] text-green-800 flex items-start gap-1.5 font-medium">
                    <span className="w-1 h-1 rounded-full bg-[#16a34a] mt-1.5 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
              <div className="text-right">
                <button className="text-green-700 text-[11px] font-bold hover:underline flex items-center gap-1 justify-end w-full">View AI Explanation <ArrowRight size={10} /></button>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-6 gap-4">
            {[
              { label: 'Repayment Probability', val: '96%', pct: '↑ 4%', dsub: 'vs last month', col: 'text-green-600', icon: ShieldCheck, icol: 'text-green-600 border-green-200 bg-green-50', sparkCol: '#16a34a' },
              { label: 'Risk Score', val: '28', valSub: '/ 100', pct: '↑ 5 pts', dsub: 'vs last month', col: 'text-green-600', icon: AlertTriangle, icol: 'text-red-500 border-red-200 bg-red-50', sparkCol: '#16a34a' },
              { label: 'Probability of Default (PD)', val: '4%', pct: '↓ 2%', dsub: 'vs last month', col: 'text-green-600', icon: ShieldAlert, icol: 'text-red-500 border-red-200 bg-red-50', sparkCol: '#16a34a' },
              { label: 'Exposure at Risk', val: '₹6.20 L', pct: 'Stable', dsub: '', col: 'text-gray-500', icon: IndianRupee, icol: 'text-purple-600 border-purple-200 bg-purple-50', sparkCol: '#a855f7' },
              { label: 'Early Warning Signals', val: '2', pct: '↓ 1', dsub: 'vs last month', col: 'text-green-600', icon: AlertTriangle, icol: 'text-orange-500 border-orange-200 bg-orange-50', sparkCol: '#f97316' },
              { label: 'Watchlist Status', val: 'Normal', pct: 'Stable', dsub: '', col: 'text-gray-500', icon: Eye, icol: 'text-green-600 border-green-200 bg-green-50', sparkCol: '#16a34a' },
            ].map((kpi, i) => (
              <div key={i} className="bg-white  border border-gray-100 rounded-[32px] p-4 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] font-extrabold text-gray-600 leading-tight pr-2">{kpi.label}</div>
                  <div className={`p-1.5 rounded-md border ${kpi.icol} bg-white shadow-sm shrink-0`}><kpi.icon size={12} className="opacity-80" /></div>
                </div>
                <div className="flex items-baseline gap-1 mt-1 mb-1">
                  <div className="text-[22px] font-extrabold text-gray-900 leading-none">{kpi.val}</div>
                  {kpi.valSub && <div className="text-[11px] font-bold text-gray-500">{kpi.valSub}</div>}
                </div>
                <div className={`text-[10px] font-bold flex items-center gap-1 ${kpi.col}`}>
                  {kpi.pct} {kpi.dsub && <span className="text-gray-500 font-medium">{kpi.dsub}</span>}
                </div>
                <MiniSparkline color={kpi.sparkCol} />
              </div>
            ))}
          </div>

          {/* Middle Row */}
          <div className="grid grid-cols-12 gap-4">
            {/* Risk Heat Map */}
            <div className="col-span-4 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-4">Risk Heat Map (Portfolio)</h3>
              <div className="flex-1 flex gap-4 mt-2">
                <div className="flex-1 flex flex-col relative">
                  <div className="absolute -left-4 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] font-bold text-gray-500">Risk Score</div>
                  
                  <div className="flex h-full w-full flex-col gap-1 pl-4">
                    {/* High Row */}
                    <div className="flex items-center gap-2 flex-1">
                      <div className="text-[9px] w-10 text-right text-gray-500 font-bold shrink-0">High</div>
                      <div className="flex-1 h-full bg-[#fca5a5] rounded-sm"></div>
                      <div className="flex-1 h-full bg-[#f87171] rounded-sm"></div>
                      <div className="flex-1 h-full bg-[#ef4444] rounded-sm"></div>
                    </div>
                    {/* Moderate Row */}
                    <div className="flex items-center gap-2 flex-1">
                      <div className="text-[9px] w-10 text-right text-gray-500 font-bold shrink-0">Moderate</div>
                      <div className="flex-1 h-full bg-[#fde047] rounded-sm"></div>
                      <div className="flex-1 h-full bg-[#fcd34d] rounded-sm"></div>
                      <div className="flex-1 h-full bg-[#f59e0b] rounded-sm"></div>
                    </div>
                    {/* Low Row */}
                    <div className="flex items-center gap-2 flex-1">
                      <div className="text-[9px] w-10 text-right text-gray-500 font-bold shrink-0">Low</div>
                      <div className="flex-1 h-full bg-[#bbf7d0] rounded-sm flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-[#16a34a] shadow-sm"></span>
                      </div>
                      <div className="flex-1 h-full bg-[#86efac] rounded-sm"></div>
                      <div className="flex-1 h-full bg-[#4ade80] rounded-sm"></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between pl-16 pr-2 mt-2 text-[9px] font-bold text-gray-500">
                    <span>Low</span>
                    <span>Moderate</span>
                    <span>High</span>
                  </div>
                  <div className="text-center pl-14 text-[9px] font-bold text-gray-500 mt-1">Impact</div>
                </div>
                
                <div className="w-[100px] flex flex-col justify-center gap-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ef4444]"></span>
                    <div>
                      <div className="text-[10px] font-bold text-gray-900">High Risk</div>
                      <div className="text-[9px] text-gray-500">4 Enterprises</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
                    <div>
                      <div className="text-[10px] font-bold text-gray-900">Moderate Risk</div>
                      <div className="text-[9px] text-gray-500">11 Enterprises</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#16a34a]"></span>
                    <div>
                      <div className="text-[10px] font-bold text-gray-900">Low Risk</div>
                      <div className="text-[9px] text-gray-500">42 Enterprises</div>
                    </div>
                  </div>
                </div>
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View all portfolio risks <ArrowRight size={10} /></button>
            </div>

            {/* Risk Drivers */}
            <div className="col-span-4 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">Risk Drivers</h3>
              <div className="space-y-4 flex-1">
                {[
                  { label: 'Repayment Behaviour', risk: 'Low Risk', icon: FileText, tagCol: 'text-green-700 bg-green-50 border-green-100' },
                  { label: 'Cash Flow Volatility', risk: 'Low Risk', icon: Waves, tagCol: 'text-green-700 bg-green-50 border-green-100' },
                  { label: 'Climate Exposure', risk: 'Low Risk', icon: CloudRain, tagCol: 'text-green-700 bg-green-50 border-green-100' },
                  { label: 'Market Volatility', risk: 'Medium Risk', icon: TrendingUp, tagCol: 'text-orange-700 bg-orange-50 border-orange-100' },
                  { label: 'Operational Efficiency', risk: 'Low Risk', icon: Settings, tagCol: 'text-green-700 bg-green-50 border-green-100' },
                ].map((dr, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-gray-500">
                      <div className="w-6 h-6 rounded-md bg-white/5 border border-gray-100 flex items-center justify-center">
                        <dr.icon size={12} className="text-green-700" />
                      </div>
                      <div className="text-[11px] font-bold text-gray-900">{dr.label}</div>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded border shrink-0 ${dr.tagCol}`}>{dr.risk}</span>
                  </div>
                ))}
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View risk driver details <ArrowRight size={10} /></button>
            </div>

            {/* Risk Trend */}
            <div className="col-span-4 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[13px] font-extrabold text-gray-900">Risk Trend (Last 6 Months)</h3>
              </div>
              <div className="flex items-center gap-4 text-[9px] font-bold text-gray-500 mb-2">
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#16a34a]" /> Risk Score</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#a855f7]" /> PD (%)</div>
              </div>
              <div className="flex-1 min-h-[140px] -ml-5">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={RISK_TREND_DATA} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: 600 }} axisLine={false} tickLine={false} dy={5} />
                    <YAxis yAxisId="left" tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: 600 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: 600 }} axisLine={false} tickLine={false} domain={[0, 8]} tickFormatter={(v)=>v+'%'} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Line yAxisId="left" type="monotone" dataKey="riskScore" stroke="#16a34a" strokeWidth={2} dot={{ r: 3, fill: '#16a34a', strokeWidth: 0 }} isAnimationActive={false} />
                    <Line yAxisId="right" type="monotone" dataKey="pd" stroke="#a855f7" strokeWidth={2} dot={{ r: 3, fill: '#a855f7', strokeWidth: 0 }} isAnimationActive={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-2 flex items-center gap-1">View trend analytics <ArrowRight size={10} /></button>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-12 gap-4">
            {/* Top Risk Alerts */}
            <div className="col-span-4 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">Top Risk Alerts</h3>
              <div className="space-y-4 flex-1">
                {[
                  { icon: AlertTriangle, title: 'Feed price volatility increased', sub: 'Milk production margins may compress', tag: 'Medium', date: 'May 18, 2024', col: 'text-orange-700 bg-orange-50 border-orange-100', icol: 'text-orange-500 bg-orange-50 border-orange-100' },
                  { icon: CloudRain, title: 'Monsoon onset expected', sub: 'Rainfall may impact fodder availability', tag: 'Low', date: 'May 17, 2024', col: 'text-green-700 bg-green-50 border-green-100', icol: 'text-green-600 bg-green-50 border-green-100' },
                  { icon: Activity, title: 'Milk collection volume fluctuation', sub: 'Monitor daily collection trend', tag: 'Low', date: 'May 16, 2024', col: 'text-green-700 bg-green-50 border-green-100', icol: 'text-blue-600 bg-blue-50 border-blue-100' },
                ].map((act, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`p-1.5 rounded border shrink-0 mt-0.5 ${act.icol}`}><act.icon size={14} /></div>
                    <div className="flex-1">
                      <div className="text-[11px] font-bold text-gray-900 mb-0.5">{act.title}</div>
                      <div className="text-[9px] text-gray-500 font-medium leading-tight mb-1">{act.sub}</div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded border shrink-0 ${act.col}`}>{act.tag}</span>
                        <span className="text-[9px] text-gray-500 font-bold">{act.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View all alerts <ArrowRight size={10} /></button>
            </div>

            {/* Recommended Actions */}
            <div className="col-span-4 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">Recommended Actions</h3>
              <div className="space-y-4 flex-1">
                {[
                  { icon: FileText, title: 'Lock feed price with supplier', tag: 'High', tagCol: 'text-red-700 bg-red-500/20 border-red-500/30', icol: 'text-green-600 bg-green-50 border-green-100' },
                  { icon: Package, title: 'Build fodder inventory before monsoon', tag: 'Medium', tagCol: 'text-orange-700 bg-orange-50 border-orange-100', icol: 'text-orange-500 bg-orange-50 border-orange-100' },
                  { icon: Activity, title: 'Monitor collection centre performance', tag: 'Low', tagCol: 'text-green-700 bg-green-50 border-green-100', icol: 'text-green-600 bg-green-50 border-green-100' },
                ].map((act, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded border shrink-0 ${act.icol}`}><act.icon size={14} /></div>
                      <div className="text-[11px] font-bold text-gray-900">{act.title}</div>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded border shrink-0 ${act.tagCol}`}>{act.tag}</span>
                  </div>
                ))}
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View all actions <ArrowRight size={10} /></button>
            </div>

            {/* Risk Timeline Preview */}
            <div className="col-span-4 bg-white  border border-gray-100 rounded-[32px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-6">Risk Timeline Preview</h3>
              <div className="space-y-5 flex-1">
                {[
                  { icon: Calendar, title: 'Feed Price Review', date: 'May 28, 2024', col: 'text-purple-500 bg-purple-50 border-purple-100' },
                  { icon: CloudRain, title: 'Monsoon Impact Assessment', date: 'Jun 05, 2024', col: 'text-blue-500 bg-blue-50 border-blue-100' },
                  { icon: IndianRupee, title: 'Repayment Due', date: 'Jun 20, 2024', col: 'text-purple-500 bg-purple-50 border-purple-100' },
                ].map((tl, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded border shrink-0 ${tl.col}`}><tl.icon size={14} /></div>
                      <div className="text-[11px] font-bold text-gray-900">{tl.title}</div>
                    </div>
                    <div className="text-[10px] text-gray-500 font-bold shrink-0">{tl.date}</div>
                  </div>
                ))}
              </div>
              <button className="text-green-700 text-[11px] font-bold hover:underline mt-4 flex items-center gap-1">View full timeline <ArrowRight size={10} /></button>
            </div>
          </div>

          {/* Bottom Banner */}
          <div className="bg-white  border border-gray-100 rounded-[32px] p-4 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between group cursor-pointer hover:border-green-200 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-green-50 border border-green-200">
                <ShieldCheck size={20} className="text-green-700" />
              </div>
              <div>
                <div className="text-[12px] font-extrabold text-green-700 mb-0.5">Continuous Risk Monitoring</div>
                <div className="text-[11px] text-gray-600 font-medium">GramPulse continuously monitors 100+ data points to detect risks early and support timely interventions.</div>
              </div>
            </div>
            <button className="text-green-700 text-[11px] font-bold group-hover:text-[#15803d] flex items-center gap-1 pr-2 transition-colors">How Risk Centre works <ArrowRight size={10} /></button>
          </div>

        </div>
      )}

      {/* FOOTER STRIP */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-6">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-green-700" />
          <div>
            <div className="text-[12px] font-bold text-gray-900">Secure. Compliant. Trusted.</div>
            <div className="text-[11px] text-gray-500">Bank-grade security with data privacy and regulatory compliance.</div>
          </div>
        </div>
        <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
          Last updated: May 19, 2024 08:30 AM
          <RefreshCw size={12} className="cursor-pointer hover:text-gray-600 ml-1" />
        </div>
      </div>
      
      {showUnderwriting && (
        <UnderwritingModal enterpriseId={entId} onClose={() => setShowUnderwriting(false)} />
      )}
    </div>
  );
}
