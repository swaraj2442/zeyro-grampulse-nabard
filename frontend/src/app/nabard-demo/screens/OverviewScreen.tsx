"use client";

import React from 'react';
import { Screen } from '../GramPulseApp';
import { AreaChart, Area, PieChart, Pie, LineChart, Line, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { 
  ArrowRight, AlertTriangle, Sparkles, CheckCircle2, Leaf, 
  RefreshCw, Activity, HeartPulse, Building2, TrendingUp, TrendingDown,
  ShieldCheck, AlertCircle, Eye, Info, Search, Menu, ChevronDown, Check,
  Clock, CheckCircle, Database, ShieldAlert, Users, MapPin, CloudRain, Map, ArrowUp
} from 'lucide-react';
import GM_card from '../../../assests/images/GM_card.png';
import apiClient from '../services/apiClient';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { useQuery } from '@tanstack/react-query';
import { useGramPulseStore } from '../store/useGramPulseStore';

interface OverviewScreenProps {
  navigateTo: (s: Screen, enterprise?: string) => void;
}


function MiniSparkline({ data, color }: { data: number[], color: string }) {
  const chartData = data.map((v, i) => ({ val: v, i }));
  return (
    <div className="w-16 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line type="monotone" dataKey="val" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function OverviewScreen({ navigateTo }: OverviewScreenProps) {
  const { selectedState, selectedDistrict, dateRange } = useGramPulseStore();
  
  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['overview', selectedState, selectedDistrict, dateRange],
    queryFn: () => apiClient.getOverviewSummary({ 
      state: selectedState, 
      district: selectedDistrict, 
      from: dateRange.from, 
      to: dateRange.to 
    }).then(res => res.data)
  });

  const { data: cashflowData = [] } = useQuery({
    queryKey: ['overview-cashflow', selectedState, selectedDistrict, dateRange],
    queryFn: () => apiClient.getOverviewCashflow({ state: selectedState, district: selectedDistrict }).then(res => res.data)
  });

  const { data: creditData = [] } = useQuery({
    queryKey: ['overview-credit', selectedState, selectedDistrict, dateRange],
    queryFn: () => apiClient.getOverviewCredit({ state: selectedState, district: selectedDistrict }).then(res => res.data)
  });

  const { data: timelineData = [] } = useQuery({
    queryKey: ['overview-timeline', selectedState, selectedDistrict, dateRange],
    queryFn: () => apiClient.getOverviewTimeline({ state: selectedState, district: selectedDistrict }).then(res => res.data)
  });

  const { data: contextData } = useQuery({
    queryKey: ['overview-context'],
    queryFn: () => apiClient.getOverviewContext().then(res => res.data)
  });

  const { data: climateData } = useQuery({
    queryKey: ['overview-climate'],
    queryFn: () => apiClient.getClimateImpact().then(res => res.data)
  });

  const { data: marketData } = useQuery({
    queryKey: ['overview-market'],
    queryFn: () => apiClient.getMarketSignals().then(res => res.data)
  });

  const totalEnt = summary?.total || 3250;
  const highRisk = summary?.high || 18;
  const interventions = summary?.activeInterventions || 27;
  const healthScore = summary ? Math.round((summary.healthy / totalEnt) * 100) : 81;
  const repProb = summary ? Math.round(((totalEnt - highRisk - (summary?.watchlist || 0)) / totalEnt) * 100) : 92;
  const npaForecast = summary ? (highRisk / totalEnt) * 100 : 2.7;

  return (
    <div className="space-y-6 pb-12 w-full max-w-[1400px] mx-auto">
      
      {/* 1. TOP BANNER */}
      <div className="relative w-full rounded-[24px] overflow-hidden p-8 flex flex-col justify-between shadow-sm mb-2"
           style={{ 
             backgroundImage: `url(${GM_card.src})`, 
             backgroundSize: 'cover', 
             backgroundPosition: 'right center',
             minHeight: '260px' 
           }}>
        
        <div className="relative z-10 w-[70%] max-w-[950px]">
          <h1 className="text-[28px] font-bold text-gray-900 mb-1">Good morning, {contextData?.userName || 'Rohit'} 👋</h1>
          <p className="text-[14px] text-gray-700 font-medium mb-8">Here's what's happening across your portfolio today.</p>
          
          {/* MERGED AI SUMMARY & TOP RECOMMENDATION CARD */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-white/50 flex w-full">
            
            {/* Left: AI Summary */}
            <div className="p-5 flex-1 border-r border-gray-200/50">
               <div className="flex items-center gap-2 mb-3">
                 <div className="bg-[#dcfce7] p-1.5 rounded-lg"><Sparkles size={16} className="text-[#16a34a]" /></div>
                 <h3 className="text-[14px] font-bold text-gray-900">AI Summary</h3>
               </div>
               <div className="flex items-start gap-4 mb-4">
                 <p className="text-[13px] text-gray-700 leading-relaxed flex-1 font-medium pr-4">
                   {contextData?.aiSummary || 'Loading AI summary...'}
                 </p>
                 <div className="border border-gray-100 rounded-xl p-3 flex items-center gap-3 bg-white shrink-0 shadow-sm">
                   <div className="relative w-10 h-10 flex items-center justify-center">
                     <svg className="w-10 h-10 transform -rotate-90">
                       <circle cx="20" cy="20" r="16" stroke="#f1f5f9" strokeWidth="3" fill="none" />
                       <circle cx="20" cy="20" r="16" stroke="#16a34a" strokeWidth="3" fill="none" strokeDasharray="100" strokeDashoffset={100 - (contextData?.aiConfidence || 92)} />
                     </svg>
                     <span className="absolute text-[10px] font-bold text-gray-900">{contextData?.aiConfidence || 92}%</span>
                   </div>
                   <div>
                     <div className="text-[10px] font-bold text-gray-500">Confidence</div>
                     <div className="text-[10px] font-medium text-[#16a34a]">High</div>
                   </div>
                 </div>
               </div>
            </div>

            {/* Right: Top Recommendation */}
            <div className="p-5 flex-1 flex flex-col justify-center">
               <div className="text-[11px] font-bold text-[#16a34a] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  Top Recommendation
               </div>
               <p className="text-[14px] font-semibold text-gray-900 leading-snug mb-3">
                 {contextData?.topRecommendation || 'Loading recommendation...'}
               </p>
              <button 
                onClick={() => navigateTo('portfolio')}
                className="w-full bg-[#16a34a] hover:bg-[#15803d] transition-colors text-white text-[13px] font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm">
                View Details <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. KPI ROW (6 Cards) */}
      <div className="grid grid-cols-6 gap-4">
        
        {/* KPI 1 */}
        <div className="bg-gradient-to-br from-[#16a34a] to-[#15803d] rounded-[20px] p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-green-500/30 flex flex-col justify-between h-[120px]">
           <div className="text-[12px] font-medium text-green-100 truncate">
             Portfolio Health Score
           </div>
           <div className="text-[26px] font-bold text-white leading-none tracking-tight">
             {healthScore}<span className="text-[13px] text-green-200 font-medium ml-1">/ 100</span>
           </div>
           <div className="flex items-center gap-1.5 overflow-hidden">
             <span className="px-1.5 py-0.5 bg-white/20 text-white font-bold text-[10px] rounded shrink-0">Live</span>
           </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-[20px] p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-50/50 flex flex-col justify-between h-[120px]">
           <div className="text-[12px] font-medium text-gray-500 truncate">
             Enterprises Monitored
           </div>
           <div className="text-[26px] font-bold text-gray-900 leading-none tracking-tight">
             {new Intl.NumberFormat('en-IN').format(totalEnt)}
           </div>
           <div className="flex items-center gap-1.5 overflow-hidden">
             <span className="px-1.5 py-0.5 bg-green-50 text-green-600 font-bold text-[10px] rounded shrink-0">Active</span>
           </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-[20px] p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-50/50 flex flex-col justify-between h-[120px]">
           <div className="text-[12px] font-medium text-gray-500 truncate">
             At Risk (Next 60 Days)
           </div>
           <div className="text-[26px] font-bold text-gray-900 leading-none tracking-tight">
             {new Intl.NumberFormat('en-IN').format(highRisk)}
           </div>
           <div className="flex items-center gap-1.5 overflow-hidden">
             <span className="px-1.5 py-0.5 bg-red-50 text-red-500 font-bold text-[10px] rounded shrink-0">Action Req</span>
           </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-[20px] p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-50/50 flex flex-col justify-between h-[120px]">
           <div className="text-[12px] font-medium text-gray-500 truncate">
             Repayment Probability
           </div>
           <div className="text-[26px] font-bold text-gray-900 leading-none tracking-tight">
             {repProb}%
           </div>
           <div className="flex items-center gap-1.5 overflow-hidden">
             <span className="px-1.5 py-0.5 bg-green-50 text-green-600 font-bold text-[10px] rounded shrink-0">Healthy</span>
           </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-white rounded-[20px] p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-50/50 flex flex-col justify-between h-[120px]">
           <div className="text-[12px] font-medium text-gray-500 truncate">
             Forecast Deficit
           </div>
           <div className="text-[24px] font-bold text-gray-900 leading-none tracking-tight">
             {summary ? formatCurrency(summary.forecastDeficitExposure) : '₹12.4 Cr'}
           </div>
           <div className="flex items-center gap-1.5 overflow-hidden">
             <span className="px-1.5 py-0.5 bg-red-50 text-red-500 font-bold text-[10px] rounded shrink-0">Exposure</span>
           </div>
        </div>

        {/* KPI 6 */}
        <div className="bg-white rounded-[20px] p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-50/50 flex flex-col justify-between h-[120px]">
           <div className="text-[12px] font-medium text-gray-500 truncate">
             Interventions Pending
           </div>
           <div className="text-[26px] font-bold text-gray-900 leading-none tracking-tight">
             {interventions}
           </div>
           <div className="flex items-center gap-1.5 overflow-hidden">
             <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 font-bold text-[10px] rounded shrink-0">Active</span>
           </div>
        </div>

      </div>

      {/* 3. ANALYTICS ROW 1 (Forecast & Credit) */}
      <div className="grid grid-cols-12 gap-5 h-[420px]">
        
        {/* Left: Cash Flow Forecast */}
        <div className="col-span-8 bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col h-full relative">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-[15px] font-bold text-gray-900 flex items-center gap-1.5 mb-2.5">
                Cash-flow Forecast (Portfolio) <Info size={14} className="text-gray-400" />
              </h2>
              <div className="flex items-center gap-4 text-[11px] font-medium text-gray-500 flex-wrap">
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" /> Inflow (₹ Cr)</div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" /> Outflow (₹ Cr)</div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /> Net Cash-flow (₹ Cr)</div>
                <div className="flex items-center gap-1.5"><span className="w-4 border-b-2 border-dashed border-red-300" /> Forecast Phase</div>
              </div>
            </div>
            <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 flex items-center gap-1.5 cursor-pointer hover:bg-gray-100 text-[12px] font-medium text-gray-700 shrink-0">
              Next 6 Months <ChevronDown size={14} />
            </div>
          </div>
          
          <div className="flex-1 w-full relative">
            
            {/* Projected Deficit Alert Box positioned inside the chart */}
            <div className="absolute top-[5%] right-[25px] z-10 bg-red-50 border border-red-100 px-3 py-2 rounded-lg flex items-center gap-2 shadow-sm">
               <AlertTriangle size={14} className="text-red-500" />
               <div className="text-[11px] font-bold text-red-700 leading-tight">Projected deficit<br/>from Jun'24</div>
            </div>
            
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashflowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} ticks={[-20, 0, 20, 40, 60, 80]} />
                <Tooltip 
                  cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '5 5' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: '12px', fontWeight: 'bold', padding: '12px' }}
                  itemStyle={{ padding: '2px 0' }}
                />
                
                {/* Reference line at 0 for negative net values */}
                <ReferenceLine y={0} stroke="#e5e7eb" />
                
                <Area 
                  type="monotone" 
                  dataKey="inflow" 
                  name="Inflow (₹ Cr)"
                  stroke="#22c55e" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorInflow)" 
                  activeDot={{ r: 6, fill: "#22c55e", stroke: "#fff", strokeWidth: 2 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="outflow" 
                  name="Outflow (₹ Cr)"
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorOutflow)" 
                  activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="net" 
                  name="Net Cash-flow (₹ Cr)"
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorNet)" 
                  activeDot={{ r: 6, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Shaded Area for Forecast */}
            <div className="absolute top-0 right-[25px] bottom-[30px] w-[21%] bg-red-50/30 border-l border-dashed border-red-200 pointer-events-none" />
          </div>

          <div className="mt-4 bg-[#f0fdf4] rounded-lg px-4 py-2.5 flex items-center justify-between">
             <span className="text-[12px] font-medium text-gray-700">18 enterprises likely to face cash-flow deficit in next 60 days.</span>
             <button className="text-[12px] font-bold text-[#16a34a] hover:text-[#15803d] flex items-center gap-1 transition-colors" onClick={() => navigateTo('portfolio')}>View at-risk list <ArrowRight size={14} /></button>
          </div>
        </div>

        {/* Right: Credit Health */}
        <div className="col-span-4 bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col h-full">
           <h2 className="text-[14px] font-bold text-gray-900 flex items-center gap-1.5 mb-2">Credit Health <Info size={14} className="text-gray-400" /></h2>
           <div className="flex-1 flex flex-col items-center w-full">
             
             {/* Top: Ring Chart */}
             <div className="w-[140px] h-[140px] relative shrink-0 mb-4 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={creditData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {creditData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
                  <span className="text-[24px] font-bold text-gray-900 leading-none mb-1">96%</span>
                  <span className="text-[10px] text-gray-500 font-medium leading-tight text-center">On-time</span>
                </div>
             </div>
             
             {/* Bottom: Legends Grid */}
             <div className="w-full flex flex-col">
               
               {/* Top Block */}
               <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4 px-2">
                 <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded bg-green-50 flex items-center justify-center shrink-0">
                     <ShieldCheck size={14} className="text-green-600" />
                   </div>
                   <div className="text-[12px] font-medium text-gray-500">Total Accounts</div>
                 </div>
                 <div className="text-[16px] font-bold text-gray-900 leading-none">3,250</div>
               </div>
               
               {/* 2x2 Grid */}
               <div className="grid grid-cols-2 gap-x-2 gap-y-4 px-2">
                 <div>
                   <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-1"><span className="w-2.5 h-2.5 rounded-full bg-[#16a34a]"/> Current</div>
                   <div className="text-[15px] font-bold text-gray-900">2,984</div>
                 </div>
                 <div>
                   <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-1"><span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"/> 1-15 Days</div>
                   <div className="text-[15px] font-bold text-gray-900">148</div>
                 </div>
                 <div>
                   <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-1"><span className="w-2.5 h-2.5 rounded-full bg-[#f97316]"/> 16-30 Days</div>
                   <div className="text-[15px] font-bold text-gray-900">68</div>
                 </div>
                 <div>
                   <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-1"><span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"/> &gt;30 Days</div>
                   <div className="text-[15px] font-bold text-gray-900">50</div>
                 </div>
               </div>

             </div>
           </div>
        </div>
      </div>

      {/* 3.5 ANALYTICS ROW 2 (Climate & Market) */}
      <div className="grid grid-cols-12 gap-5 h-[220px]">
        {/* Left: Climate Impact */}
        <div className="col-span-6 bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col hover:shadow-md transition-shadow">
           <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
             <h2 className="text-[12px] font-bold text-gray-900 flex items-center gap-1.5"><CloudRain size={14} className="text-blue-500" /> Climate Impact</h2>
             <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Geospatial</span>
           </div>
           
           <div className="space-y-4">
              <div className="flex items-center justify-between group">
                <span className="text-[11px] font-medium text-gray-500 flex items-center gap-2"><CloudRain size={12} className="text-blue-500"/> Rainfall Deficit</span>
                <span className="text-[12px] font-bold text-red-600">{climateData?.rainfallDeficit || '-24%'}</span>
              </div>
              <div className="flex items-center justify-between group">
                <span className="text-[11px] font-medium text-gray-500 flex items-center gap-2"><Map size={12} className="text-orange-500"/> Districts Affected</span>
                <span className="text-[12px] font-bold text-gray-900">{climateData?.districtsAffected || '12/36'}</span>
              </div>
              <div className="flex items-center justify-between group">
                <span className="text-[11px] font-medium text-gray-500 flex items-center gap-2"><AlertTriangle size={12} className="text-red-500"/> Heatwave Alerts</span>
                <span className="text-[12px] font-bold text-gray-900">{climateData?.heatwaveAlerts || 5}</span>
              </div>
           </div>
           <button className="w-full mt-4 bg-gray-50 hover:bg-gray-100 text-[#16a34a] text-[11px] font-bold py-2.5 rounded-lg border border-gray-200 transition-colors" onClick={() => navigateTo('geography')}>
              View Heatmap
           </button>
        </div>

        {/* Right: Market Signals */}
        <div className="col-span-6 bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
           <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <h3 className="text-[12px] font-bold text-gray-900 flex items-center gap-1.5"><TrendingUp size={14} className="text-[#16a34a]" /> Market Signals</h3>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Commodities</span>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-medium text-gray-500 block mb-0.5">Milk (Avg)</span>
                <span className="text-[13px] font-bold text-[#16a34a]">{marketData?.milk || '₹42/L'}</span>
              </div>
              <div>
                <span className="text-[10px] font-medium text-gray-500 block mb-0.5">Feed Index</span>
                <span className="text-[13px] font-bold text-red-600 flex items-center gap-1"><ArrowUp size={10} /> {marketData?.feedIndex || '145'}</span>
              </div>
              <div>
                <span className="text-[10px] font-medium text-gray-500 block mb-0.5">Maize</span>
                <span className="text-[12px] font-bold text-red-600">{marketData?.maize || '+12%'}</span>
              </div>
              <div>
                <span className="text-[10px] font-medium text-gray-500 block mb-0.5">Soybean</span>
                <span className="text-[12px] font-bold text-red-600">{marketData?.soybean || '+8%'}</span>
              </div>
           </div>
           <button className="w-full mt-4 bg-gray-50 hover:bg-gray-100 text-[#16a34a] text-[11px] font-bold py-2.5 rounded-lg border border-gray-200 transition-colors" onClick={() => navigateTo('market')}>
              View Insights
           </button>
        </div>
      </div>

      {/* 4. ACTIONS & TIMELINE ROW */}
      <div className="grid grid-cols-12 gap-5">
         
         {/* Left: Recommended Actions */}
         <div className="col-span-5 bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col relative overflow-hidden">
            <h2 className="text-[14px] font-bold text-gray-900 flex items-center gap-1.5 mb-4">Recommended Actions <Info size={14} className="text-gray-400" /></h2>
            
            <div className="grid grid-cols-2 gap-3 flex-1">
               <div className="border border-gray-100 rounded-xl p-3 flex flex-col justify-between hover:border-red-200 transition-colors cursor-pointer group">
                 <div className="flex items-center gap-2 mb-1">
                   <div className="p-1 rounded bg-red-50"><HeartPulse size={12} className="text-red-500" /></div>
                   <span className="text-[14px] font-bold text-gray-900">{highRisk}</span>
                 </div>
                 <p className="text-[10px] font-medium text-gray-500 leading-snug">High-risk enterprises need immediate attention</p>
                 <div className="text-[10px] font-bold text-[#16a34a] group-hover:text-[#15803d] flex items-center gap-1 mt-2">Review Now <ArrowRight size={10} /></div>
               </div>
               
               <div className="border border-gray-100 rounded-xl p-3 flex flex-col justify-between hover:border-orange-200 transition-colors cursor-pointer group">
                 <div className="flex items-center gap-2 mb-1">
                   <div className="p-1 rounded bg-orange-50"><Activity size={12} className="text-orange-500" /></div>
                   <span className="text-[14px] font-bold text-gray-900">{summary?.watchlist || 12}</span>
                 </div>
                 <p className="text-[10px] font-medium text-gray-500 leading-snug">Enterprises need proactive financial advice</p>
                 <div className="text-[10px] font-bold text-[#16a34a] group-hover:text-[#15803d] flex items-center gap-1 mt-2">Assign Officer <ArrowRight size={10} /></div>
               </div>

               <div className="border border-gray-100 rounded-xl p-3 flex flex-col justify-between hover:border-purple-200 transition-colors cursor-pointer group">
                 <div className="flex items-center gap-2 mb-1">
                   <div className="p-1 rounded bg-purple-50"><CheckCircle size={12} className="text-purple-600" /></div>
                   <span className="text-[14px] font-bold text-gray-900">{interventions}</span>
                 </div>
                 <p className="text-[10px] font-medium text-gray-500 leading-snug">Interventions pending approval</p>
                 <div className="text-[10px] font-bold text-[#16a34a] group-hover:text-[#15803d] flex items-center gap-1 mt-2">Approve <ArrowRight size={10} /></div>
               </div>

               <div className="border border-gray-100 rounded-xl p-3 flex flex-col justify-between hover:border-blue-200 transition-colors cursor-pointer group">
                 <div className="flex items-center gap-2 mb-1">
                   <div className="p-1 rounded bg-blue-50"><MapPin size={12} className="text-blue-500" /></div>
                   <span className="text-[14px] font-bold text-gray-900">{summary?.fieldVisitsToday || 5}</span>
                 </div>
                 <p className="text-[10px] font-medium text-gray-500 leading-snug">Field visits scheduled today</p>
                 <div className="text-[10px] font-bold text-[#16a34a] group-hover:text-[#15803d] flex items-center gap-1 mt-2">View Schedule <ArrowRight size={10} /></div>
               </div>
            </div>
            
            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-[10px] font-medium text-gray-500">
                 <ShieldCheck size={14} className="text-[#16a34a]" />
                 <div>
                   <div className="font-bold text-gray-700">Secure. Compliant. Trusted.</div>
                   <div>Bank-grade security with data privacy and regulatory compliance.</div>
                 </div>
              </div>
            </div>
         </div>

         {/* Right: Timeline Preview */}
         <div className="col-span-7 bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-[14px] font-bold text-gray-900 flex items-center gap-1.5">Timeline Preview <Info size={14} className="text-gray-400" /></h2>
               <div className="text-[10px] font-medium text-gray-400 flex items-center gap-1">Last updated: {contextData?.lastUpdated || 'May 21, 2024 01:15 PM'} <RefreshCw size={10} /></div>
            </div>

            <div className="flex items-start justify-between relative px-2">
               {/* Horizontal line */}
               <div className="absolute top-[12px] left-[20px] right-[20px] h-0.5 bg-gray-100 z-0"></div>

               {timelineData.map((item: any) => {
                 let IconComponent = Sparkles;
                 if (item.icon === 'Users') IconComponent = Users;
                 if (item.icon === 'MapPin') IconComponent = MapPin;
                 if (item.icon === 'CheckCircle') IconComponent = CheckCircle;
                 if (item.icon === 'Database') IconComponent = Database;
                 
                 return (
                   <div key={item.id} className="relative z-10 flex flex-col items-center w-[120px]">
                     <div className={`w-6 h-6 rounded-full ${item.bgColor} flex items-center justify-center mb-3 border ${item.borderColor}`}>
                       <IconComponent size={12} className={item.iconColor} />
                     </div>
                     <div className="text-[11px] font-bold text-gray-900 text-center leading-snug mb-1">{item.title}</div>
                     <div className="text-[9px] text-gray-400 font-medium">{item.time}</div>
                   </div>
                 );
               })}
             </div>
          </div>

      </div>

    </div>
  );
}
