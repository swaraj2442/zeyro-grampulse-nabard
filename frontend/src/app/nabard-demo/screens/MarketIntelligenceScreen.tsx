"use client";

import React from 'react';
import { 
  Filter, Download, RefreshCw, TrendingUp, ArrowUpRight, ArrowDownRight, 
  Map, Clock, CloudRain, AlertTriangle, ShieldCheck, Zap, Droplets, Check,
  ArrowUp, ArrowDown
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ComposedChart } from 'recharts';
import { Screen } from '../GramPulseApp';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import { useGramPulseStore } from '../store/useGramPulseStore';

interface Props {
  navigateTo: (s: Screen, ent?: string) => void;
}

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
    case 'CloudRain': return CloudRain;
    case 'TrendingUp': return TrendingUp;
    case 'ShieldCheck': return ShieldCheck;
    case 'Zap': return Zap;
    default: return AlertTriangle;
  }
};

export default function MarketIntelligenceScreen({ navigateTo }: Props) {
  const { selectedState, selectedDistrict } = useGramPulseStore();

  const { data, isLoading } = useQuery({
    queryKey: ['market-intelligence', selectedState, selectedDistrict],
    queryFn: () => apiClient.getMarketIntelligence({ state: selectedState, district: selectedDistrict }).then(res => res.data)
  });

  const MINI_CHART_DATA_1 = data?.miniCharts?.chart1 || data?.details?.MINI_CHART_DATA_1 || [];
  const MINI_CHART_DATA_2 = data?.miniCharts?.chart2 || data?.details?.MINI_CHART_DATA_2 || [];
  const MINI_CHART_DATA_3 = data?.miniCharts?.chart3 || data?.details?.MINI_CHART_DATA_3 || [];
  
  const COMMODITY_PRICE_DATA = data?.commodityPriceData || data?.details?.COMMODITY_PRICE_DATA || [];
  const DEMAND_SUPPLY_DATA = data?.demandSupplyData || data?.details?.DEMAND_SUPPLY_DATA || [];
  const FORECAST_DATA = data?.forecastData || data?.details?.FORECAST_DATA || [];
  const PIE_DATA = data?.pieData || data?.details?.PIE_DATA || [];
  
  const SIGNALS = (data?.signals || data?.details?.SIGNALS || []).map((s: any) => ({
    ...s,
    icon: getIcon(s.iconType || s.icon)
  }));
  
  const RECOMMENDATIONS = data?.recommendations || data?.details?.RECOMMENDATIONS || [];
  const OPPORTUNITY_DATA = data?.opportunityData || data?.details?.OPPORTUNITY_DATA || [];
  const MARKETS_DATA = data?.marketsData || [];

  const ACTIONS = [
    { text: 'Advise early harvest for Soybean in Latur', prio: 'High', pColor: 'bg-red-50 text-red-600' },
    { text: 'Monitor Maize prices closely next 2 weeks', prio: 'Med', pColor: 'bg-orange-50 text-orange-600' },
    { text: 'Delay input purchases for Wheat cluster', prio: 'Low', pColor: 'bg-blue-50 text-blue-600' }
  ];

  const WATCHLIST_DATA = [
    { comm: 'Soybean', price: '4,600', trend: 'down', tColor: 'text-red-500', change: '-1.3%' },
    { comm: 'Maize', price: '2,200', trend: 'up', tColor: 'text-emerald-600', change: '+2.1%' },
    { comm: 'Wheat', price: '2,400', trend: 'stable', tColor: 'text-gray-500', change: '0.0%' },
    { comm: 'Cotton', price: '6,800', trend: 'up', tColor: 'text-emerald-600', change: '+1.5%' }
  ];

  return (
    <div className="space-y-6 pb-12 w-full max-w-[1600px] mx-auto overflow-x-hidden">
      
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold text-gray-500 mb-1 flex items-center gap-1">
             Intelligence <span className="text-gray-300">{">"}</span> <span className="text-gray-900">Market Intelligence</span>
          </div>
          <h1 className="text-[22px] font-bold text-gray-900 mb-1">Market Intelligence</h1>
          <div className="flex items-center gap-4 text-[11px] text-gray-500 font-medium">
             <div className="flex items-center gap-1"><Map size={12}/> Market Overview</div>
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

      {/* 1. AI Market Summary */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
         <div className="grid grid-cols-12 gap-6 items-center">
            
            <div className="col-span-5 flex gap-4">
               <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100"><TrendingUp size={20} className="text-purple-600" /></div>
               <div>
                  <h2 className="text-[12px] font-bold text-gray-900 mb-2">AI Market Summary</h2>
                  <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                     Milk prices are stable with slight upward trend in key markets. Demand is steady across Maharashtra with festive season preparation driving moderate growth. Feed prices are expected to remain stable in the short term.
                  </p>
               </div>
            </div>

            <div className="col-span-3 border-l border-gray-100 pl-6 flex items-center gap-6">
               <div className="relative w-20 h-20">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                     <path className="text-gray-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                     <path className="text-green-500" strokeDasharray="68, 100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-[16px] font-bold text-gray-900 leading-none">68</span>
                     <span className="text-[9px] font-semibold text-green-600">Moderate</span>
                  </div>
               </div>
               <div>
                  <div className="text-[10px] font-bold text-gray-900 mb-1">Market Opportunity Score</div>
                  <div className="flex items-center gap-4">
                     <div>
                        <div className="flex items-center gap-1 text-green-500 font-bold text-[11px]"><ArrowUpRight size={12}/> 6 pts</div>
                        <div className="text-[9px] text-gray-400 font-semibold">vs last week</div>
                     </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                     <span className="text-[9px] text-gray-400 font-semibold">Market Trend</span>
                  </div>
               </div>
            </div>

            <div className="col-span-4 border-l border-gray-100 pl-6">
               <h3 className="text-[11px] font-bold text-gray-900 mb-2">Key Takeaways</h3>
               <ul className="space-y-1.5">
                  <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 shrink-0"/><span className="text-[10px] font-medium text-gray-600">Milk prices increased in 3 major markets</span></li>
                  <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 shrink-0"/><span className="text-[10px] font-medium text-gray-600">Demand expected to rise by 8% next month</span></li>
                  <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 shrink-0"/><span className="text-[10px] font-medium text-gray-600">Feed prices likely to remain stable</span></li>
                  <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 shrink-0"/><span className="text-[10px] font-medium text-gray-600">Good market window for milk producers</span></li>
               </ul>
               <div className="text-right mt-1">
                  <button className="text-[10px] font-bold text-green-700 hover:text-green-800 flex items-center justify-end gap-1 ml-auto">View AI Explanation <ArrowUpRight size={10}/></button>
               </div>
            </div>

         </div>
      </div>

      {/* 2. Top KPIs */}
      <div className="grid grid-cols-5 gap-4">
         <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[90px]">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-purple-50 flex items-center justify-center text-purple-500"><TrendingUp size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">Avg. Milk Price (₹/L)</span>
               </div>
            </div>
            <div className="flex items-end justify-between">
               <div>
                  <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">₹38.6</div>
                  <div className="text-[9px] font-bold text-green-500 flex items-center gap-0.5"><ArrowUp size={10}/> 4.8% <span className="text-gray-400 font-semibold ml-0.5">vs last week</span></div>
               </div>
            </div>
         </div>
         <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[90px]">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center text-blue-500"><Droplets size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">Milk Demand Index</span>
               </div>
            </div>
            <div className="flex items-end justify-between">
               <div>
                  <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">124</div>
                  <div className="text-[9px] font-bold text-green-500 flex items-center gap-0.5"><ArrowUp size={10}/> 6.2% <span className="text-gray-400 font-semibold ml-0.5">vs last week</span></div>
               </div>
            </div>
         </div>
         <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[90px]">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-orange-50 flex items-center justify-center text-orange-500"><AlertTriangle size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">Feed Price Index</span>
               </div>
            </div>
            <div className="flex items-end justify-between">
               <div>
                  <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">108</div>
                  <div className="text-[9px] font-bold text-green-500 flex items-center gap-0.5"><ArrowUp size={10}/> 1.6% <span className="text-gray-400 font-semibold ml-0.5">vs last week</span></div>
               </div>
            </div>
         </div>
         <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[90px]">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-green-50 flex items-center justify-center text-green-500"><ShieldCheck size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">Market Volatility</span>
               </div>
            </div>
            <div className="flex items-end justify-between">
               <div>
                  <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">Low</div>
                  <div className="text-[9px] font-bold text-green-500 flex items-center gap-0.5"><ArrowDown size={10}/> 8 pts <span className="text-gray-400 font-semibold ml-0.5">vs last week</span></div>
               </div>
            </div>
         </div>
         <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[90px]">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-purple-50 flex items-center justify-center text-purple-500"><TrendingUp size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">Trade Activity</span>
               </div>
            </div>
            <div className="flex items-end justify-between">
               <div>
                  <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">High</div>
                  <div className="text-[9px] font-bold text-green-500 flex items-center gap-0.5"><ArrowUp size={10}/> 12% <span className="text-gray-400 font-semibold ml-0.5">vs last week</span></div>
               </div>
            </div>
         </div>
      </div>

      {/* 3. Middle Row: Charts */}
      <div className="grid grid-cols-4 gap-6">
         
         <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-[12px] font-bold text-gray-900 mb-4">Commodity Prices (₹/L)</h2>
            <div className="flex items-center gap-4 mb-4 text-[9px] font-bold text-gray-500">
               <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-green-500"></div>Current Week</div>
               <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-gray-400" style={{clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'}}></div>Last Week</div>
            </div>
            <div className="h-[150px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <ComposedChart data={COMMODITY_PRICE_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} />
                   <Bar dataKey="current" fill="#10b981" radius={[2, 2, 0, 0]} barSize={12} />
                   <Line type="monotone" dataKey="last" stroke="#9ca3af" strokeWidth={2} strokeDasharray="4 4" dot={{r:3, fill:"#9ca3af", strokeWidth:0}} />
                 </ComposedChart>
               </ResponsiveContainer>
            </div>
            <button className="text-[10px] font-bold text-green-700 mt-2 flex items-center gap-1 hover:text-green-800">
               View price trends <ArrowUpRight size={10} />
            </button>
         </div>

         <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-[12px] font-bold text-gray-900 mb-4">Demand & Supply (Milk - Thousand Liters/Day)</h2>
            <div className="flex items-center gap-4 mb-4 text-[9px] font-bold text-gray-500">
               <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-blue-500"></div>Demand</div>
               <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-green-500"></div>Supply</div>
               <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"></div>Gap</div>
            </div>
            <div className="h-[150px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <ComposedChart data={DEMAND_SUPPLY_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                   <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} />
                   <Bar dataKey="demand" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={8} />
                   <Bar dataKey="supply" fill="#10b981" radius={[2, 2, 0, 0]} barSize={8} />
                   <Line type="monotone" dataKey="gap" stroke="#a855f7" strokeWidth={2} dot={{r:3, fill:"#a855f7", strokeWidth:0}} />
                 </ComposedChart>
               </ResponsiveContainer>
            </div>
            <button className="text-[10px] font-bold text-green-700 mt-2 flex items-center gap-1 hover:text-green-800">
               View demand supply analysis <ArrowUpRight size={10} />
            </button>
         </div>

         <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-[12px] font-bold text-gray-900 mb-4">Market Forecast (Next 4 Weeks)</h2>
            <div className="flex items-center gap-4 mb-4 text-[9px] font-bold text-gray-500">
               <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-purple-500"></div>Price (₹/L)</div>
               <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-green-500"></div>Demand Index</div>
            </div>
            <div className="h-[150px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <ComposedChart data={FORECAST_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                   <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} />
                   <Bar dataKey="bg" fill="#f3f4f6" radius={[4, 4, 0, 0]} barSize={40} isAnimationActive={false} />
                   <Line type="monotone" dataKey="price" stroke="#a855f7" strokeWidth={2} dot={{r:3, fill:"#a855f7", strokeWidth:0}} />
                   <Line type="monotone" dataKey="demand" stroke="#10b981" strokeWidth={2} dot={{r:3, fill:"#10b981", strokeWidth:0}} />
                 </ComposedChart>
               </ResponsiveContainer>
            </div>
            <button className="text-[10px] font-bold text-green-700 mt-2 flex items-center gap-1 hover:text-green-800">
               View full forecast <ArrowUpRight size={10} />
            </button>
         </div>

         <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-[12px] font-bold text-gray-900 mb-4">Buyer Trends (Top Buyers)</h2>
            <div className="h-[180px] w-full flex items-center gap-4">
               <div className="w-[120px] h-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie data={PIE_DATA} innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value" stroke="none">
                           {PIE_DATA.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                        </Pie>
                     </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-[9px] font-semibold text-gray-500">Total Buyers</span>
                     <span className="text-[18px] font-bold text-gray-900 leading-none">1,248</span>
                  </div>
               </div>
               <div className="flex-1 flex flex-col gap-3 text-[9px] font-semibold text-gray-600">
                  {PIE_DATA.map((d, i) => (
                     <div key={i} className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}></div><span className="truncate w-[70px]">{d.name}</span></div>
                        <span className="font-bold text-gray-900">{d.value}%</span>
                     </div>
                  ))}
               </div>
            </div>
            <button className="text-[10px] font-bold text-green-700 mt-2 flex items-center gap-1 hover:text-green-800">
               View buyer insights <ArrowUpRight size={10} />
            </button>
         </div>

      </div>

      {/* 4. Bottom Row: Insights, Actions, Watchlist */}
      <div className="grid grid-cols-12 gap-6">
         
         <div className="col-span-4 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-[12px] font-bold text-gray-900 mb-4 flex items-center gap-1">AI Market Signals</h2>
            <div className="space-y-4">
               {SIGNALS.map((sig, i) => (
                  <div key={i} className="flex items-start justify-between gap-3">
                     <div className="flex items-start gap-2">
                        <sig.icon size={14} className={`${sig.color} mt-0.5 shrink-0`} />
                        <p className="text-[11px] font-medium text-gray-700 leading-snug">{sig.text}</p>
                     </div>
                     <span className={`text-[9px] font-bold shrink-0 px-2 py-0.5 rounded ${sig.bColor}`}>{sig.badge}</span>
                  </div>
               ))}
            </div>
            <button className="text-[10px] font-bold text-green-700 mt-5 flex items-center gap-1 hover:text-green-800">
               View all signals <ArrowUpRight size={10} />
            </button>
         </div>

         <div className="col-span-4 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-[12px] font-bold text-gray-900 mb-4 flex items-center gap-1">AI Recommended Actions</h2>
            <div className="space-y-4">
               {ACTIONS.map((a, i) => (
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
            <h2 className="text-[12px] font-bold text-gray-900 mb-4 flex items-center gap-1">Market Watchlist</h2>
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-gray-100">
                     <th className="py-2 text-[9px] font-semibold text-gray-500">Commodity</th>
                     <th className="py-2 text-[9px] font-semibold text-gray-500 text-center">Current Price (₹)</th>
                     <th className="py-2 text-[9px] font-semibold text-gray-500 text-center">Trend</th>
                     <th className="py-2 text-[9px] font-semibold text-gray-500 text-center">Change (WoW)</th>
                  </tr>
               </thead>
               <tbody>
                  {WATCHLIST_DATA.map((w, i) => (
                     <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                        <td className="py-2.5 text-[10px] font-bold text-gray-700">{w.comm}</td>
                        <td className="py-2.5 text-[10px] font-bold text-gray-900 text-center">{w.price}</td>
                        <td className={`py-2.5 text-center flex justify-center mt-0.5 ${w.tColor}`}>
                           {w.trend === 'up' ? <ArrowUp size={10} /> : (w.trend === 'down' ? <ArrowDown size={10} /> : <ArrowUpRight size={10} />)}
                        </td>
                        <td className={`py-2.5 text-[10px] font-bold text-center ${w.tColor}`}>{w.change}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
            <button className="text-[10px] font-bold text-green-700 mt-2 flex items-center gap-1 hover:text-green-800">
               View full watchlist <ArrowUpRight size={10} />
            </button>
         </div>

      </div>

      {/* 5. Market Price Movement (Top Markets) */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
         <h2 className="text-[13px] font-bold text-gray-900 mb-4">Market Price Movement (Top Markets)</h2>
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="border-b border-gray-100">
                  <th className="py-2 text-[10px] font-semibold text-gray-500">Market</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500">State</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500 text-center border-l border-gray-100 pl-2">Current</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500 text-center">Last Week</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500 text-center">Change (%)</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500 text-center border-l border-gray-100 pl-2">Current</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500 text-center">Change (%)</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500 text-center border-l border-gray-100 pl-2">Current</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500 text-center">Change (%)</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500 text-center">Market Sentiment</th>
               </tr>
               <tr className="border-b border-gray-100">
                  <th colSpan={2}></th>
                  <th colSpan={3} className="py-1 text-[9px] font-semibold text-gray-400 text-center border-l border-gray-100 pl-2">Milk Price (₹/L)</th>
                  <th colSpan={2} className="py-1 text-[9px] font-semibold text-gray-400 text-center border-l border-gray-100 pl-2">Demand Index</th>
                  <th colSpan={2} className="py-1 text-[9px] font-semibold text-gray-400 text-center border-l border-gray-100 pl-2">Supply (K L/Day)</th>
                  <th></th>
               </tr>
            </thead>
            <tbody>
               {MARKETS_DATA.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                     <td className="py-2.5 text-[11px] font-bold text-gray-700">{row.market}</td>
                     <td className="py-2.5 text-[11px] font-semibold text-gray-600">{row.state}</td>
                     
                     <td className="py-2.5 text-[11px] font-bold text-gray-900 text-center border-l border-gray-100 pl-2">{row.pCur}</td>
                     <td className="py-2.5 text-[11px] font-medium text-gray-500 text-center">{row.pLast}</td>
                     <td className="py-2.5 text-center">
                        <div className={`flex items-center justify-center gap-0.5 text-[11px] font-bold ${row.pChgD === 'down' ? 'text-red-500' : 'text-green-500'}`}>
                           {row.pChgD === 'down' ? <ArrowDown size={10} /> : <ArrowUp size={10} />} {row.pChg}
                        </div>
                     </td>

                     <td className="py-2.5 text-[11px] font-bold text-gray-900 text-center border-l border-gray-100 pl-2">{row.dCur}</td>
                     <td className="py-2.5 text-center">
                        <div className={`flex items-center justify-center gap-0.5 text-[11px] font-bold ${row.dChgD === 'down' ? 'text-red-500' : 'text-green-500'}`}>
                           {row.dChgD === 'down' ? <ArrowDown size={10} /> : <ArrowUp size={10} />} {row.dChg}
                        </div>
                     </td>

                     <td className="py-2.5 text-[11px] font-bold text-gray-900 text-center border-l border-gray-100 pl-2">{row.sCur}</td>
                     <td className="py-2.5 text-center">
                        <div className={`flex items-center justify-center gap-0.5 text-[11px] font-bold ${row.sChgD === 'down' ? 'text-red-500' : 'text-green-500'}`}>
                           {row.sChgD === 'down' ? <ArrowDown size={10} /> : <ArrowUp size={10} />} {row.sChg}
                        </div>
                     </td>
                     
                     <td className="py-2.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${row.sColor}`}>{row.sent}</span>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
         <div className="flex justify-start mt-4">
            <button className="text-[10px] font-bold text-green-700 flex items-center gap-1 hover:text-green-800">
               View all market data <ArrowUpRight size={10} />
            </button>
         </div>
      </div>

    </div>
  );
}
