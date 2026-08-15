"use client";

import React from 'react';
import { 
  Filter, Download, RefreshCw, TrendingUp, ArrowUpRight, ArrowDownRight, 
  Map, Clock, AlertTriangle, ShieldCheck, Check, ArrowUp, ArrowDown,
  Monitor, Award, Landmark, Eye, CloudRain, Droplets, Zap
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Screen } from '../GramPulseApp';

interface Props {
  navigateTo: (s: Screen, ent?: string) => void;
}

import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import { useGramPulseStore } from '../store/useGramPulseStore';

const MiniSparkline = ({ data, color }: any) => (
  <div className="h-6 w-16">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line type="monotone" dataKey="val" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// Helper to resolve icon component from string name
const getIcon = (name: string) => {
  switch (name) {
    case 'Monitor': return Monitor;
    case 'Award': return Award;
    case 'Landmark': return Landmark;
    case 'Eye': return Eye;
    default: return AlertTriangle;
  }
};

export default function SectorIntelligenceScreen({ navigateTo }: Props) {
  const { selectedState, selectedDistrict } = useGramPulseStore();

  const { data, isLoading } = useQuery({
    queryKey: ['sector-intelligence', selectedState, selectedDistrict],
    queryFn: () => apiClient.getSectorIntelligence({ state: selectedState, district: selectedDistrict }).then(res => res.data)
  });

  const MINI_CHART_DATA_1 = data?.miniCharts?.chart1 || data?.details?.MINI_CHART_DATA_1 || [];
  const MINI_CHART_DATA_2 = data?.miniCharts?.chart2 || data?.details?.MINI_CHART_DATA_2 || [];
  const MINI_CHART_DATA_3 = data?.miniCharts?.chart3 || data?.details?.MINI_CHART_DATA_3 || [];

  const SECTOR_PERFORMANCE_DATA = data?.sectorPerformanceData || data?.details?.SECTOR_PERFORMANCE_DATA || [];
  const MARKET_SHARE_DATA = data?.marketShareData || data?.details?.MARKET_SHARE_DATA || [];
  const TREND_DATA = data?.trendData || data?.details?.TREND_DATA || [];
  
  const SIGNALS = (data?.signals || data?.details?.SIGNALS || []).map((s: any) => ({
    ...s,
    icon: getIcon(s.iconType || s.icon)
  }));
  
  const RECOMMENDATIONS = data?.recommendations || data?.details?.RECOMMENDATIONS || [];
  const RISK_DATA = data?.riskData || data?.details?.RISK_DATA || [];
  const PERFORMANCE_DATA = data?.performanceData || data?.details?.PERFORMANCE_DATA || [];
  const GROWTH_TREND_DATA = data?.growthTrendData || data?.details?.GROWTH_TREND_DATA || [];
  const PIE_DATA = data?.pieData || data?.details?.PIE_DATA || [];
  const ACTIONS = data?.actions || data?.details?.ACTIONS || [];
  const WATCHLIST_DATA = data?.watchlistData || data?.details?.WATCHLIST_DATA || [];
  const SECTORS_DATA = data?.sectorsData || data?.details?.SECTORS_DATA || [];

  return (
    <div className="space-y-6 pb-12 w-full max-w-[1600px] mx-auto overflow-x-hidden">
      
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold text-gray-500 mb-1 flex items-center gap-1">
             Intelligence <span className="text-gray-300">{">"}</span> <span className="text-gray-900">Sector Intelligence</span>
          </div>
          <h1 className="text-[22px] font-bold text-gray-900 mb-1">Sector Intelligence</h1>
          <div className="flex items-center gap-4 text-[11px] text-gray-500 font-medium">
             <div className="flex items-center gap-1"><Map size={12}/> Sector Overview</div>
             <div className="flex items-center gap-1"><Clock size={12}/> Last Updated: Today, 08:30 AM</div>
          </div>
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

      {/* 1. AI Sector Summary */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
         <div className="grid grid-cols-12 gap-6 items-center">
            
            <div className="col-span-5 flex gap-4">
               <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100"><Monitor size={20} className="text-purple-600" /></div>
               <div>
                  <h2 className="text-[12px] font-bold text-gray-900 mb-2">AI Sector Summary</h2>
                  <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                     Dairy and allied activities are performing well across Maharashtra driven by stable demand and supportive prices. Crop production is moderate with regional variation due to rainfall. Rural services show steady growth with increasing digital adoption.
                  </p>
               </div>
            </div>

            <div className="col-span-3 border-l border-gray-100 pl-6 flex items-center gap-6">
               <div className="relative w-20 h-20">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                     <path className="text-gray-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                     <path className="text-green-500" strokeDasharray="70, 100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" />
                     <path className="text-purple-500" strokeDasharray="30, 100" strokeDashoffset="-70" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-[16px] font-bold text-gray-900 leading-none">70</span>
                     <span className="text-[9px] font-semibold text-green-600">Good</span>
                  </div>
               </div>
               <div>
                  <div className="text-[10px] font-bold text-gray-900 mb-1">Sector Opportunity Score</div>
                  <div className="flex items-center gap-4">
                     <div>
                        <div className="flex items-center gap-1 text-green-500 font-bold text-[11px]"><ArrowUpRight size={12}/> 7 pts</div>
                        <div className="text-[9px] text-gray-400 font-semibold">vs last week</div>
                     </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                     <span className="text-[9px] text-gray-400 font-semibold">Trend</span>
                  </div>
               </div>
            </div>

            <div className="col-span-4 border-l border-gray-100 pl-6">
               <h3 className="text-[11px] font-bold text-gray-900 mb-2">Key Takeaways</h3>
               <ul className="space-y-1.5">
                  <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 shrink-0"/><span className="text-[10px] font-medium text-gray-600">Dairy sector leads with strong demand & stable margins</span></li>
                  <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 shrink-0"/><span className="text-[10px] font-medium text-gray-600">Agri input costs are easing in most districts</span></li>
                  <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 shrink-0"/><span className="text-[10px] font-medium text-gray-600">Rural services show healthy credit growth</span></li>
                  <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 shrink-0"/><span className="text-[10px] font-medium text-gray-600">Opportunity in value addition and supply chain infra</span></li>
               </ul>
               <div className="text-right mt-1">
                  <button className="text-[10px] font-bold text-green-700 hover:text-green-800 flex items-center justify-end gap-1 ml-auto">View AI Explanation <ArrowUpRight size={10}/></button>
               </div>
            </div>

         </div>
      </div>

      {/* 2. Top KPIs */}
      <div className="grid grid-cols-6 gap-4">
         <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[90px]">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-green-50 flex items-center justify-center text-green-500"><Award size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">Top Performing Sector</span>
               </div>
            </div>
            <div className="flex items-end justify-between">
               <div>
                  <div className="text-[14px] font-bold text-gray-900 leading-tight">Dairy & Allied</div>
                  <div className="text-[10px] font-bold text-gray-500 mb-1">Score <span className="text-gray-900">82</span>/100</div>
                  <div className="text-[9px] font-bold text-green-500 flex items-center gap-0.5"><ArrowUp size={10}/> 8 pts <span className="text-gray-400 font-semibold ml-0.5">vs last week</span></div>
               </div>
            </div>
         </div>
         <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[90px]">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-purple-50 flex items-center justify-center text-purple-500"><TrendingUp size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">Average Growth (YoY)</span>
               </div>
            </div>
            <div className="flex items-end justify-between">
               <div>
                  <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">12.6%</div>
                  <div className="text-[9px] font-bold text-green-500 flex items-center gap-0.5"><ArrowUp size={10}/> 2.4% <span className="text-gray-400 font-semibold ml-0.5">vs last week</span></div>
               </div>
            </div>
         </div>
         <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[90px]">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center text-blue-500"><Landmark size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">Credit Exposure (₹ Cr)</span>
               </div>
            </div>
            <div className="flex items-end justify-between">
               <div>
                  <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">₹18,560 Cr</div>
                  <div className="text-[9px] font-bold text-green-500 flex items-center gap-0.5"><ArrowUp size={10}/> 6.3% <span className="text-gray-400 font-semibold ml-0.5">vs last week</span></div>
               </div>
            </div>
         </div>
         <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[90px]">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-green-50 flex items-center justify-center text-green-500"><ShieldCheck size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">Repayment Rate (Avg.)</span>
               </div>
            </div>
            <div className="flex items-end justify-between">
               <div>
                  <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">91%</div>
                  <div className="text-[9px] font-bold text-green-500 flex items-center gap-0.5"><ArrowUp size={10}/> 4 pts <span className="text-gray-400 font-semibold ml-0.5">vs last week</span></div>
               </div>
            </div>
         </div>
         <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[90px]">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-red-50 flex items-center justify-center text-red-500"><AlertTriangle size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">Risk Index (Avg.)</span>
               </div>
            </div>
            <div className="flex items-end justify-between">
               <div>
                  <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">42 <span className="text-[12px] text-gray-500">/100</span></div>
                  <div className="text-[9px] font-bold text-red-500 flex items-center gap-0.5"><ArrowUp size={10}/> 6 pts <span className="text-gray-400 font-semibold ml-0.5">vs last week</span></div>
               </div>
            </div>
         </div>
         <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[90px]">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-orange-50 flex items-center justify-center text-orange-500"><Eye size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">Watchlist Sectors</span>
               </div>
            </div>
            <div className="flex items-end justify-between">
               <div>
                  <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">3</div>
                  <div className="text-[9px] font-bold text-red-500 flex items-center gap-0.5"><ArrowUp size={10}/> 1 <span className="text-gray-400 font-semibold ml-0.5">vs last week</span></div>
               </div>
            </div>
         </div>
      </div>

      {/* 3. Middle Row: Charts */}
      <div className="grid grid-cols-12 gap-6">
         
         <div className="col-span-4 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-[12px] font-bold text-gray-900">Sector Performance Index <span className="font-normal text-gray-500">(vs last week)</span></h2>
               <div className="flex gap-4 text-[9px] font-semibold text-gray-500 w-[70px] justify-between">
                  <span>Score</span>
                  <span>Change</span>
               </div>
            </div>
            
            <div className="space-y-3">
               {SECTOR_PERFORMANCE_DATA.map((row: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                     <div className="w-[100px] text-[10px] font-semibold text-gray-600 truncate pr-2">{row.name}</div>
                     <div className="flex-1 mr-4 bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{width: row.width}}></div>
                     </div>
                     <div className="flex gap-4 w-[70px] justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-900">{row.score}</span>
                        <div className={`flex items-center gap-0.5 text-[10px] font-bold ${row.chgDir === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                           {row.chgDir === 'up' ? <ArrowUp size={10}/> : <ArrowDown size={10}/>} {row.change.replace('+ ', '').replace('- ', '')}
                        </div>
                     </div>
                  </div>
               ))}
            </div>
            
            <button className="text-[10px] font-bold text-green-700 mt-5 flex items-center gap-1 hover:text-green-800">
               View performance analysis <ArrowUpRight size={10} />
            </button>
         </div>

         <div className="col-span-4 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-[12px] font-bold text-gray-900 mb-4">Sector Growth Trend (YoY)</h2>
            <div className="flex items-center gap-4 mb-4 text-[9px] font-bold text-gray-500">
               <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div>Dairy & Allied</div>
               <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div>Crop Production</div>
               <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"></div>Rural Services</div>
            </div>
            <div className="h-[150px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={TREND_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                   <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} tickFormatter={(val) => `${val}%`} />
                   <Line type="monotone" dataKey="dairy" stroke="#10b981" strokeWidth={2} dot={{r:3, fill:"#10b981", strokeWidth:0}} />
                   <Line type="monotone" dataKey="crop" stroke="#3b82f6" strokeWidth={2} dot={{r:3, fill:"#3b82f6", strokeWidth:0}} />
                   <Line type="monotone" dataKey="rural" stroke="#a855f7" strokeWidth={2} dot={{r:3, fill:"#a855f7", strokeWidth:0}} />
                 </LineChart>
               </ResponsiveContainer>
            </div>
            <button className="text-[10px] font-bold text-green-700 mt-2 flex items-center gap-1 hover:text-green-800">
               View growth trends <ArrowUpRight size={10} />
            </button>
         </div>

         <div className="col-span-4 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-[12px] font-bold text-gray-900 mb-4">Credit Exposure by Sector</h2>
            <div className="h-[180px] w-full flex items-center gap-6">
               <div className="w-[120px] h-[120px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie data={MARKET_SHARE_DATA} innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value" stroke="none">
                           {MARKET_SHARE_DATA.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                        </Pie>
                     </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-[12px] font-bold text-gray-900 leading-none">₹18,560</span>
                     <span className="text-[10px] font-semibold text-gray-500 mt-1">Crore</span>
                  </div>
               </div>
               <div className="flex-1 flex flex-col gap-3 text-[9px] font-semibold text-gray-600">
                  {MARKET_SHARE_DATA.map((d: any, i: number) => (
                     <div key={i} className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}></div><span className="truncate w-[80px]">{d.name}</span></div>
                        <span className="font-bold text-gray-900">{d.value}%</span>
                     </div>
                  ))}
               </div>
            </div>
            <button className="text-[10px] font-bold text-green-700 mt-0 flex items-center gap-1 hover:text-green-800">
               View exposure details <ArrowUpRight size={10} />
            </button>
         </div>

      </div>

      {/* 4. Bottom Row: Insights, Actions, Watchlist */}
      <div className="grid grid-cols-12 gap-6">
         
         <div className="col-span-4 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-[12px] font-bold text-gray-900 mb-4 flex items-center gap-1">AI Sector Insights</h2>
            <div className="space-y-4">
               {SIGNALS.map((sig, i) => (
                  <div key={i} className="flex items-start justify-between gap-3">
                     <div className="flex items-start gap-2">
                        <sig.icon size={14} className={`${sig.color} mt-0.5 shrink-0`} />
                        <p className="text-[11px] font-medium text-gray-700 leading-snug">{sig.text}</p>
                     </div>
                  </div>
               ))}
            </div>
            <button className="text-[10px] font-bold text-green-700 mt-5 flex items-center gap-1 hover:text-green-800">
               View all insights <ArrowUpRight size={10} />
            </button>
         </div>

         <div className="col-span-4 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-[12px] font-bold text-gray-900 mb-4 flex items-center gap-1">AI Recommended Actions</h2>
            <div className="space-y-4">
               {RECOMMENDATIONS.map((a: any, i: number) => (
                  <div key={i} className="flex items-start justify-between gap-4">
                     <div className="flex items-start gap-2">
                        <Check size={14} className="text-gray-400 mt-0.5 shrink-0" />
                        <span className="text-[11px] font-medium text-gray-700 leading-snug">{a.text}</span>
                     </div>
                     <span className={`text-[9px] font-bold shrink-0 px-2 py-0.5 rounded ${a.pColor}`}>{a.prio}</span>
                  </div>
               ))}
            </div>
            <button className="text-[10px] font-bold text-green-700 mt-5 flex items-center gap-1 hover:text-green-800">
               View all recommendations <ArrowUpRight size={10} />
            </button>
         </div>

         <div className="col-span-4 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-[12px] font-bold text-gray-900 mb-4 flex items-center gap-1">Sector Watchlist</h2>
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-gray-100">
                     <th className="py-2 text-[9px] font-semibold text-gray-500">Sector</th>
                     <th className="py-2 text-[9px] font-semibold text-gray-500 text-center">Risk Index</th>
                     <th className="py-2 text-[9px] font-semibold text-gray-500 text-center">Trend</th>
                     <th className="py-2 text-[9px] font-semibold text-gray-500 text-right">Reason</th>
                  </tr>
               </thead>
               <tbody>
                  {WATCHLIST_DATA.map((w, i) => (
                     <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                        <td className="py-2.5 text-[10px] font-bold text-gray-700">{w.sector}</td>
                        <td className="py-2.5 text-[10px] font-bold text-gray-900 text-center">{w.risk}</td>
                        <td className={`py-2.5 text-center flex justify-center mt-0.5 ${w.tColor}`}>
                           {w.trend === 'up' ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                        </td>
                        <td className="py-2.5 text-[10px] font-medium text-gray-600 text-right">{w.reason}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
            <button className="text-[10px] font-bold text-green-700 mt-2 flex items-center gap-1 hover:text-green-800">
               View full watchlist <ArrowUpRight size={10} />
            </button>
         </div>

      </div>

      {/* 5. Sector Overview */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
         <h2 className="text-[13px] font-bold text-gray-900 mb-4">Sector Overview <span className="font-normal text-gray-500">(Maharashtra)</span></h2>
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="border-b border-gray-100">
                  <th className="py-2 text-[10px] font-semibold text-gray-500">Sector</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500 text-center">Enterprises</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500 text-center">Growth (YoY)</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500 text-center">Credit Exposure (₹ Cr)</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500 text-center">Repayment Rate</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500 text-center">Risk Index</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500 text-center">Trend</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500 text-center">Opportunity Score</th>
               </tr>
            </thead>
            <tbody>
               {SECTORS_DATA.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                     <td className="py-3 text-[11px] font-bold text-gray-700">{row.sector}</td>
                     <td className="py-3 text-[11px] font-semibold text-gray-600 text-center">{row.ent}</td>
                     <td className="py-3 text-[11px] font-semibold text-gray-600 text-center">{row.growth}</td>
                     <td className="py-3 text-[11px] font-semibold text-gray-600 text-center">{row.credit}</td>
                     <td className="py-3 text-[11px] font-semibold text-gray-600 text-center">{row.repRate}</td>
                     <td className="py-3 text-[11px] font-semibold text-gray-600 text-center">{row.risk}</td>
                     <td className="py-3 text-center">
                        <div className={`flex justify-center ${row.rColor}`}>
                           {row.rTrend === 'down' ? <ArrowDown size={12} /> : <ArrowUp size={12} />}
                        </div>
                     </td>
                     <td className={`py-3 text-[11px] font-bold text-center ${row.oColor}`}>{row.opp}</td>
                  </tr>
               ))}
            </tbody>
         </table>
         <div className="flex justify-end mt-4">
            <button className="text-[10px] font-bold text-green-700 flex items-center gap-1 hover:text-green-800">
               View full sector data <ArrowUpRight size={10} />
            </button>
         </div>
      </div>

    </div>
  );
}
