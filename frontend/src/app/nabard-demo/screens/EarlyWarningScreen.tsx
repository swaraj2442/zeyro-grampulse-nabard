"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  Filter, Download, RefreshCw, Bell, AlertTriangle, ArrowUpRight, ArrowDownRight, 
  Map, Clock, Zap, TrendingDown, ArrowUp, ArrowDown, Check, Globe, Map as MapIcon, Mountain
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Screen } from '../GramPulseApp';
import { formatCurrency } from '../utils/formatters';

const LeafletMap = dynamic(() => import('../components/LeafletMap'), { ssr: false });

const STATES = [
  { id: 'MH', geoName: 'Maharashtra', score: 68 },
  { id: 'GJ', geoName: 'Gujarat', score: 78 },
  { id: 'MP', geoName: 'Madhya Pradesh', score: 55 },
  { id: 'KA', geoName: 'Karnataka', score: 45 },
];

const STATE_DISTRICTS: Record<string, any[]> = {
  "Maharashtra": [
    { name: 'Nashik', health: 42 },
    { name: 'Pune', health: 65 },
    { name: 'Aurangabad', health: 30 },
    { name: 'Beed', health: 25 },
    { name: 'Solapur', health: 40 },
    { name: 'Jalgaon', health: 50 },
    { name: 'Ahmednagar', health: 35 },
  ]
};

const STATE_BY_GEONAME: Record<string, any> = {};
STATES.forEach(s => { STATE_BY_GEONAME[s.geoName] = s; });

const ALL_INDIA = {
  id: 'IN',
  geoName: 'All India',
  score: 68
};

function scoreToFill(score: number | undefined) {
  if (score === undefined) return '#e2e8f0';
  if (score >= 75) return '#22c55e'; // Minimal Risk
  if (score >= 60) return '#facc15'; // Low Risk
  if (score >= 40) return '#fb923c'; // Moderate Risk
  return '#ef4444'; // High Risk
}

function scoreToHover(score: number | undefined) {
  if (score === undefined) return '#cbd5e1';
  if (score >= 75) return '#4ade80';
  if (score >= 60) return '#fde047';
  if (score >= 40) return '#fdba74';
  return '#f87171';
}

interface Props {
  navigateTo: (s: Screen, ent?: string) => void;
}

// --- MOCK DATA ---
const MINI_CHART_DATA_1 = [{val: 20}, {val: 25}, {val: 22}, {val: 30}, {val: 28}, {val: 35}];
const MINI_CHART_DATA_2 = [{val: 40}, {val: 35}, {val: 50}, {val: 45}, {val: 60}, {val: 55}];
const MINI_CHART_DATA_3 = [{val: 50}, {val: 45}, {val: 40}, {val: 30}, {val: 25}, {val: 20}];

const RISK_TREND_DATA = [
  { date: 'May 13', high: 30, medium: 45, low: 20 },
  { date: 'May 14', high: 32, medium: 42, low: 22 },
  { date: 'May 15', high: 35, medium: 40, low: 25 },
  { date: 'May 16', high: 34, medium: 38, low: 28 },
  { date: 'May 17', high: 38, medium: 42, low: 30 },
  { date: 'May 18', high: 36, medium: 40, low: 32 },
];

const TRIGGER_DATA = [
  { name: 'Repayment Stress', val: 18, perc: '40%', fill: '#ef4444' },
  { name: 'Cashflow Decline', val: 15, perc: '33%', fill: '#f97316' },
  { name: 'Income Instability', val: 9,  perc: '20%', fill: '#10b981' },
  { name: 'Climate Stress',   val: 7,  perc: '16%', fill: '#3b82f6' },
  { name: 'Overdraft Usage',  val: 5,  perc: '11%', fill: '#a855f7' }
];

const PIE_DATA = [
  { name: 'High', value: 18, color: '#ef4444' },
  { name: 'Medium', value: 17, color: '#f97316' },
  { name: 'Low', value: 11, color: '#10b981' },
];

const INSIGHTS = [
  { text: 'Repayment stress detected in 12 enterprises due to delayed EMIs.', icon: Zap, color: 'text-blue-500' },
  { text: 'Cashflow has declined for 18 enterprises in the last 30 days.', icon: TrendingDown, color: 'text-orange-500' },
  { text: 'Income instability increasing in 9 enterprises across 3 districts.', icon: AlertTriangle, color: 'text-yellow-500' },
  { text: 'Climate stress likely to impact 7 blocks in the next 2 weeks.', icon: Map, color: 'text-green-500' },
];

const ACTIONS = [
  { text: 'Prioritize outreach for 9 high-risk enterprises', prio: 'High', pColor: 'text-red-500 bg-red-50' },
  { text: 'Schedule repayment review for stressed accounts', prio: 'High', pColor: 'text-red-500 bg-red-50' },
  { text: 'Provide cashflow support to 15 medium-risk enterprises', prio: 'Medium', pColor: 'text-orange-500 bg-orange-50' },
  { text: 'Monitor climate-impacted blocks closely', prio: 'Medium', pColor: 'text-orange-500 bg-orange-50' },
  { text: 'Share financial discipline resources with low-risk accounts', prio: 'Low', pColor: 'text-green-500 bg-green-50' },
];

const WATCHLIST_DATA = [
  { ent: 'Shivam Milk Producer Co.', dist: 'Satara', score: 86, trigger: 'Repayment Stress', trend: 'up', tColor: 'text-red-500', alert: 'Today' },
  { ent: 'Patil Dairy Farm', dist: 'Pune', score: 82, trigger: 'Cashflow Decline', trend: 'up', tColor: 'text-red-500', alert: 'Today' },
  { ent: 'Gokul Dairy', dist: 'Kolhapur', score: 76, trigger: 'Income Instability', trend: 'down', tColor: 'text-green-500', alert: 'Yesterday' },
  { ent: 'Krishna Agro Producer Co.', dist: 'Solapur', score: 71, trigger: 'Climate Stress', trend: 'up', tColor: 'text-red-500', alert: 'Yesterday' },
  { ent: 'Warana Dairy', dist: 'Kolhapur', score: 68, trigger: 'Overdraft Usage', trend: 'up', tColor: 'text-orange-500', alert: '2 Days Ago' },
];

const ENTERPRISE_TABLE_DATA = [
  { ent: 'Shivam Milk Producer Co.', dist: 'Satara', score: 86, level: 'High', lColor: 'text-red-600 bg-red-50 border-red-100', trigger: 'Repayment Stress', rep: '68%', repD: 'down', cash: '42%', cashD: 'down', inc: '18%', incD: 'down', clim: 'Normal', climC: 'text-gray-500', hist: 5, last: 'Today' },
  { ent: 'Patil Dairy Farm', dist: 'Pune', score: 82, level: 'High', lColor: 'text-red-600 bg-red-50 border-red-100', trigger: 'Cashflow Decline', rep: '55%', repD: 'down', cash: '48%', cashD: 'down', inc: '12%', incD: 'down', clim: 'Normal', climC: 'text-gray-500', hist: 4, last: 'Today' },
  { ent: 'Gokul Dairy', dist: 'Kolhapur', score: 76, level: 'High', lColor: 'text-red-600 bg-red-50 border-red-100', trigger: 'Income Instability', rep: '32%', repD: 'up', cash: '35%', cashD: 'down', inc: '28%', incD: 'up', clim: 'High', climC: 'text-red-500', hist: 3, last: 'Yesterday' },
  { ent: 'Krishna Agro Producer Co.', dist: 'Solapur', score: 71, level: 'Medium', lColor: 'text-orange-600 bg-orange-50 border-orange-100', trigger: 'Climate Stress', rep: '20%', repD: 'down', cash: '22%', cashD: 'up', inc: '10%', incD: 'down', clim: 'High', climC: 'text-red-500', hist: 2, last: 'Yesterday' },
  { ent: 'Warana Dairy', dist: 'Kolhapur', score: 68, level: 'Medium', lColor: 'text-orange-600 bg-orange-50 border-orange-100', trigger: 'Overdraft Usage', rep: '16%', repD: 'up', cash: '15%', cashD: 'down', inc: '8%', incD: 'down', clim: 'Normal', climC: 'text-gray-500', hist: 2, last: '2 Days Ago' },
];


import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import { useGramPulseStore } from '../store/useGramPulseStore';

export default function EarlyWarningScreen({ navigateTo }: Props) {
  const { selectedState, selectedDistrict } = useGramPulseStore();
  
  const [selected, setSelected] = useState<any>({ id: 'MH', geoName: 'Maharashtra', score: 68 });
  const [tooltip, setTooltip] = useState<any>(null);
  const [mapMode, setMapMode] = useState<'map' | 'satellite' | 'terrain'>('map');
  
  // Sync Map with Global Filter
  React.useEffect(() => {
    if (selectedState && selectedState !== 'All States') {
      const match = STATES.find(s => s.geoName === selectedState);
      if (match) setSelected(match);
    } else {
      setSelected(ALL_INDIA);
    }
  }, [selectedState]);
  
  const { data: watchlistData, isLoading } = useQuery({
    queryKey: ['earlyWarningWatchlist', selectedState, selectedDistrict],
    queryFn: () => apiClient.getEarlyWarningWatchlist({ state: selectedState, district: selectedDistrict }).then(res => res.data)
  });

  const { data: clusterData } = useQuery({
    queryKey: ['clusterAlerts', selectedState, selectedDistrict],
    queryFn: () => apiClient.getClusterAlerts().then(res => res.data)
  });

  const topRisk = watchlistData?.enterprises || [];
  const clusterAlerts = clusterData?.clusterAlerts || [];

  return (
    <div className="space-y-6 pb-12 w-full max-w-[1600px] mx-auto overflow-x-hidden">
      
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold text-gray-500 mb-1 flex items-center gap-1">
             Intelligence <span className="text-gray-300">{">"}</span> <span className="text-gray-900">Early Warning</span>
          </div>
          <h1 className="text-[22px] font-bold text-gray-900 mb-1">Early Warning</h1>
          <div className="flex items-center gap-4 text-[11px] text-gray-500 font-medium">
             <div className="flex items-center gap-1"><Map size={12}/> Portfolio View</div>
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

      {/* 1. AI Early Warning Summary */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
         <div className="grid grid-cols-12 gap-6 items-center">
            
            <div className="col-span-5 flex gap-4">
               <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0 border border-red-100"><Bell size={20} className="text-red-500" /></div>
               <div>
                  <h2 className="text-[12px] font-bold text-gray-900 mb-2">AI Early Warning Summary</h2>
                  <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                     27 enterprises show early signs of stress. Repayment stress and cashflow decline are the top triggers this week. Timely interventions can prevent future defaults.
                  </p>
               </div>
            </div>

            <div className="col-span-3 border-l border-gray-100 pl-6 flex items-center gap-6">
               <div className="relative w-20 h-20">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                     <path className="text-green-500" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                     <path className="text-red-500" strokeDasharray="25, 100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-[16px] font-bold text-gray-900 leading-none">27</span>
                     <span className="text-[9px] font-semibold text-red-500">At Risk</span>
                  </div>
               </div>
               <div>
                  <div className="text-[10px] font-bold text-gray-900 mb-1">Early Warning Score</div>
                  <div className="flex items-center gap-4">
                     <div>
                        <div className="flex items-center gap-1 text-red-500 font-bold text-[11px]"><ArrowUpRight size={12}/> 5 pts</div>
                        <div className="text-[9px] text-gray-400 font-semibold">vs last week</div>
                     </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                     {/* Trend removed */}
                  </div>
               </div>
            </div>

            <div className="col-span-4 border-l border-gray-100 pl-6">
               <h3 className="text-[11px] font-bold text-gray-900 mb-2">Key Takeaways</h3>
               <ul className="space-y-1.5">
                  <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 shrink-0"/><span className="text-[10px] font-medium text-gray-600">Repayment stress increased in 12 enterprises</span></li>
                  <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 shrink-0"/><span className="text-[10px] font-medium text-gray-600">Cashflow decline detected in 18 enterprises</span></li>
                  <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 shrink-0"/><span className="text-[10px] font-medium text-gray-600">Climate stress rising in 7 blocks</span></li>
                  <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 shrink-0"/><span className="text-[10px] font-medium text-gray-600">Immediate attention needed for high-risk accounts</span></li>
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
                  <div className="w-5 h-5 rounded bg-red-50 flex items-center justify-center text-red-500"><Bell size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">Enterprises at Risk</span>
               </div>
            </div>
            <div className="flex items-end justify-between">
               <div>
                  <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">27 <span className="text-[10px] font-semibold text-gray-400">/2,458</span></div>
                  <div className="text-[9px] font-bold text-red-500 flex items-center gap-0.5"><ArrowUp size={10}/> 9 <span className="text-gray-400 font-semibold ml-0.5">vs last week</span></div>
               </div>
            </div>
         </div>
         <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[90px]">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-red-50 flex items-center justify-center text-red-500"><AlertTriangle size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">High Risk</span>
               </div>
            </div>
            <div className="flex items-end justify-between">
               <div>
                  <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">9 <span className="text-[10px] font-semibold text-gray-400">/2,458</span></div>
                  <div className="text-[9px] font-bold text-red-500 flex items-center gap-0.5"><ArrowUp size={10}/> 3 <span className="text-gray-400 font-semibold ml-0.5">vs last week</span></div>
               </div>
            </div>
         </div>
         <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[90px]">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-orange-50 flex items-center justify-center text-orange-500"><Bell size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">Medium Risk</span>
               </div>
            </div>
            <div className="flex items-end justify-between">
               <div>
                  <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">18 <span className="text-[10px] font-semibold text-gray-400">/2,458</span></div>
                  <div className="text-[9px] font-bold text-orange-500 flex items-center gap-0.5"><ArrowUp size={10}/> 6 <span className="text-gray-400 font-semibold ml-0.5">vs last week</span></div>
               </div>
            </div>
         </div>
         <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[90px]">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-purple-50 flex items-center justify-center text-purple-500"><ArrowUpRight size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">Risk Escalated</span>
               </div>
            </div>
            <div className="flex items-end justify-between">
               <div>
                  <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">11</div>
                  <div className="text-[9px] font-bold text-purple-500 flex items-center gap-0.5"><ArrowUp size={10}/> 4 <span className="text-gray-400 font-semibold ml-0.5">vs last week</span></div>
               </div>
            </div>
         </div>
         <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[90px]">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-green-50 flex items-center justify-center text-green-500"><ArrowDownRight size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">Risk Improved</span>
               </div>
            </div>
            <div className="flex items-end justify-between">
               <div>
                  <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">14</div>
                  <div className="text-[9px] font-bold text-green-500 flex items-center gap-0.5"><ArrowUp size={10}/> 5 <span className="text-gray-400 font-semibold ml-0.5">vs last week</span></div>
               </div>
            </div>
         </div>
         <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[90px]">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-red-50 flex items-center justify-center text-red-500"><Bell size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">Alerts Triggered (7 Days)</span>
               </div>
            </div>
            <div className="flex items-end justify-between">
               <div>
                  <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">46</div>
                  <div className="text-[9px] font-bold text-red-500 flex items-center gap-0.5"><ArrowUp size={10}/> 12 <span className="text-gray-400 font-semibold ml-0.5">vs last week</span></div>
               </div>
            </div>
         </div>
      </div>

      {/* 3. Middle Row: Charts and Map */}
      <div className="grid grid-cols-4 gap-6">
         
         <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-[12px] font-bold text-gray-900 mb-4">Risk Trend Over Time</h2>
            <div className="flex items-center gap-4 mb-4 text-[9px] font-bold text-gray-500">
               <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div>High Risk</div>
               <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-400"></div>Medium Risk</div>
               <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div>Low Risk</div>
            </div>
            <div className="h-[150px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={RISK_TREND_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                   <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} />
                   <Line type="monotone" dataKey="high" stroke="#ef4444" strokeWidth={2} dot={{r:2.5, fill:"#ef4444", strokeWidth:0}} />
                   <Line type="monotone" dataKey="medium" stroke="#f97316" strokeWidth={2} dot={{r:2.5, fill:"#f97316", strokeWidth:0}} />
                   <Line type="monotone" dataKey="low" stroke="#10b981" strokeWidth={2} dot={{r:2.5, fill:"#10b981", strokeWidth:0}} />
                 </LineChart>
               </ResponsiveContainer>
            </div>
            <button className="text-[10px] font-bold text-green-700 mt-2 flex items-center gap-1 hover:text-green-800">
               View trend analysis <ArrowUpRight size={10} />
            </button>
         </div>

         <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-[12px] font-bold text-gray-900 mb-4">Risk by Trigger (Top 5)</h2>
            <div className="h-[180px] w-full flex flex-col justify-between">
               {TRIGGER_DATA.map((t, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px]">
                     <span className="text-gray-700 font-semibold w-24 truncate">{t.name}</span>
                     <div className="flex-1 mx-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${t.val * 3}%`, backgroundColor: t.fill }}></div>
                     </div>
                     <span className="text-gray-900 font-bold w-12 text-right">{t.val} ({t.perc})</span>
                  </div>
               ))}
            </div>
            <button className="text-[10px] font-bold text-green-700 mt-2 flex items-center gap-1 hover:text-green-800">
               View all triggers <ArrowUpRight size={10} />
            </button>
         </div>

         <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col">
            <h2 className="text-[12px] font-bold text-gray-900 mb-4">Risk by Geography (District Level)</h2>
            <div className="flex-1 flex gap-2">
               <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl relative overflow-hidden min-h-[220px]">
                  <div className="absolute top-2 right-2 z-[1000] flex bg-white/95 backdrop-blur border border-gray-200 rounded-lg shadow-sm p-0.5">
                    <button 
                      onClick={() => setMapMode('map')}
                      className={`px-2 py-1 text-[9px] font-semibold rounded flex items-center gap-1 transition-colors ${mapMode === 'map' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                      <MapIcon size={10} className={mapMode === 'map' ? 'text-blue-600' : ''} />
                      Map
                    </button>
                    <button 
                      onClick={() => setMapMode('satellite')}
                      className={`px-2 py-1 text-[9px] font-semibold rounded flex items-center gap-1 transition-colors ${mapMode === 'satellite' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                      <Globe size={10} className={mapMode === 'satellite' ? 'text-green-600' : ''} />
                      Sat
                    </button>
                  </div>
                  <LeafletMap 
                    selected={selected}
                    setSelected={setSelected}
                    setTooltip={setTooltip}
                    scoreToFill={scoreToFill}
                    scoreToHover={scoreToHover}
                    STATES={STATES}
                    STATE_BY_GEONAME={STATE_BY_GEONAME}
                    STATE_DISTRICTS={STATE_DISTRICTS}
                    mapMode={mapMode}
                  />
                  {tooltip && (
                    <div 
                      className="absolute z-[2000] bg-white text-gray-900 text-[10px] px-2 py-1.5 rounded shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-[120%]"
                      style={{ left: tooltip.x, top: tooltip.y }}
                    >
                      <div className="font-semibold">{tooltip.name}</div>
                      {tooltip.score !== undefined && (
                        <div className="text-gray-500 mt-0.5 text-[9px]">Score: {tooltip.score}</div>
                      )}
                    </div>
                  )}
               </div>
               <div className="w-[80px] flex flex-col justify-center gap-2 text-[9px] font-semibold text-gray-600">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div>High Risk</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-400"></div>Medium Risk</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div>Low Risk</div>
               </div>
            </div>
            <button className="text-[10px] font-bold text-green-700 mt-4 flex items-center gap-1 hover:text-green-800">
               View district heatmap <ArrowUpRight size={10} />
            </button>
         </div>

         <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-[12px] font-bold text-gray-900 mb-4">Alerts by Severity</h2>
            <div className="h-[180px] w-full flex items-center gap-4">
               <div className="w-1/2 h-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie data={PIE_DATA} innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value" stroke="none">
                           {PIE_DATA.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                        </Pie>
                     </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-[20px] font-bold text-gray-900 leading-none">46</span>
                     <span className="text-[9px] font-semibold text-gray-500">Total Alerts</span>
                  </div>
               </div>
               <div className="w-1/2 flex flex-col gap-4 text-[10px] font-semibold text-gray-700">
                  <div className="flex justify-between items-center"><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div>High</div><span className="font-bold text-gray-900">18 (39%)</span></div>
                  <div className="flex justify-between items-center"><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500"></div>Medium</div><span className="font-bold text-gray-900">17 (37%)</span></div>
                  <div className="flex justify-between items-center"><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div>Low</div><span className="font-bold text-gray-900">11 (24%)</span></div>
               </div>
            </div>
            <button className="text-[10px] font-bold text-green-700 mt-2 flex items-center gap-1 hover:text-green-800">
               View all alerts <ArrowUpRight size={10} />
            </button>
         </div>

      </div>

      {/* 4. Bottom Row: Insights, Actions, Watchlist */}
      <div className="grid grid-cols-12 gap-6">
         
         <div className="col-span-4 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-[12px] font-bold text-gray-900 mb-4 flex items-center gap-1"><Zap size={14} className="text-purple-500" /> AI Early Warning Insights</h2>
            <div className="space-y-4">
               {INSIGHTS.map((ins, i) => (
                  <div key={i} className="flex items-start gap-3">
                     <ins.icon size={14} className={`${ins.color} mt-0.5 shrink-0`} />
                     <p className="text-[11px] font-medium text-gray-700 leading-snug">{ins.text}</p>
                  </div>
               ))}
            </div>
            <button className="text-[10px] font-bold text-green-700 mt-5 flex items-center gap-1 hover:text-green-800">
               View all insights <ArrowUpRight size={10} />
            </button>
         </div>

         <div className="col-span-4 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-[12px] font-bold text-gray-900 mb-4 flex items-center gap-1"><Zap size={14} className="text-blue-500" /> AI Recommended Actions</h2>
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
            <h2 className="text-[12px] font-bold text-gray-900 mb-4 flex items-center gap-1"><Check size={14} className="text-green-500" /> Early Warning Watchlist</h2>
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-gray-100">
                     <th className="py-2 text-[9px] font-semibold text-gray-500">Enterprise</th>
                     <th className="py-2 text-[9px] font-semibold text-gray-500 text-center">District</th>
                     <th className="py-2 text-[9px] font-semibold text-gray-500 text-center">Risk Score</th>
                     <th className="py-2 text-[9px] font-semibold text-gray-500">Primary Trigger</th>
                     <th className="py-2 text-[9px] font-semibold text-gray-500 text-center">Trend</th>
                     <th className="py-2 text-[9px] font-semibold text-gray-500 text-center">Last Alert</th>
                  </tr>
               </thead>
               <tbody>
                  {WATCHLIST_DATA.map((w, i) => (
                     <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                        <td className="py-2 text-[10px] font-bold text-gray-700">{w.ent}</td>
                        <td className="py-2 text-[9px] font-semibold text-gray-600 text-center">{w.dist}</td>
                        <td className="py-2 text-[10px] font-bold text-gray-900 text-center">{w.score}</td>
                        <td className="py-2 text-[9px] font-semibold text-gray-600">{w.trigger}</td>
                        <td className={`py-2 text-center flex justify-center ${w.tColor}`}>
                           {w.trend === 'up' ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                        </td>
                        <td className="py-2 text-[9px] font-semibold text-gray-500 text-center">{w.alert}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
            <button className="text-[10px] font-bold text-green-700 mt-2 flex items-center gap-1 hover:text-green-800">
               View full watchlist <ArrowUpRight size={10} />
            </button>
         </div>

      </div>

      {/* 5. Enterprises with Early Warning Signals */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
         <h2 className="text-[13px] font-bold text-gray-900 mb-4">Enterprises with Early Warning Signals</h2>
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="border-b border-gray-100">
                  <th className="py-2 text-[10px] font-semibold text-gray-500">Enterprise</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500 text-center">District</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500 text-center">Risk Score</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500 text-center">Risk Level</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500">Primary Trigger</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500 text-center border-l border-gray-100 pl-2">Repayment (7D)</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500 text-center">Cashflow (30D)</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500 text-center">Income (30D)</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500 text-center">Climate (7D)</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500 text-center border-l border-gray-100 pl-2">Alert History (30D)</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500 text-center">Last Alert</th>
               </tr>
            </thead>
            <tbody>
               {topRisk.length > 0 ? topRisk.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigateTo('twin', row.entity_id)}>
                     <td className="py-2.5 text-[11px] font-bold text-gray-700">{row.name}</td>
                     <td className="py-2.5 text-[11px] font-semibold text-gray-600 text-center">{row.district}</td>
                     <td className="py-2.5 text-[11px] font-bold text-gray-900 text-center">{row.riskScore}</td>
                     <td className="py-2.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${row.riskLevel === 'High' ? 'text-red-600 bg-red-50 border-red-100' : 'text-orange-600 bg-orange-50 border-orange-100'}`}>{row.riskLevel}</span>
                     </td>
                     <td className="py-2.5 text-[11px] font-semibold text-gray-600">Forecast Deficit</td>
                     <td className="py-2.5 text-center border-l border-gray-100 pl-2">
                        <div className="flex items-center justify-center gap-0.5 text-[11px] font-bold text-red-500">
                           <ArrowDown size={10} /> {formatCurrency(row.forecastDeficit)}
                        </div>
                     </td>
                     <td className="py-2.5 text-center">
                        <div className="flex items-center justify-center gap-0.5 text-[11px] font-bold text-orange-500">
                           {row.warningLeadTimeDays} Days
                        </div>
                     </td>
                     <td className="py-2.5 text-center">
                        <div className="flex items-center justify-center gap-0.5 text-[11px] font-bold text-gray-500">
                           {row.sector}
                        </div>
                     </td>
                     <td className={`py-2.5 text-[11px] font-bold text-center text-gray-500`}>Normal</td>
                     <td className="py-2.5 text-[11px] font-semibold text-gray-600 text-center border-l border-gray-100 pl-2">2</td>
                     <td className="py-2.5 text-[10px] font-medium text-gray-500 text-center">Today</td>
                  </tr>
               )) : ENTERPRISE_TABLE_DATA.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                     <td className="py-2.5 text-[11px] font-bold text-gray-700">{row.ent}</td>
                     <td className="py-2.5 text-[11px] font-semibold text-gray-600 text-center">{row.dist}</td>
                     <td className="py-2.5 text-[11px] font-bold text-gray-900 text-center">{row.score}</td>
                     <td className="py-2.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${row.lColor}`}>{row.level}</span>
                     </td>
                     <td className="py-2.5 text-[11px] font-semibold text-gray-600">{row.trigger}</td>
                     <td className="py-2.5 text-center border-l border-gray-100 pl-2">
                        <div className={`flex items-center justify-center gap-0.5 text-[11px] font-bold ${row.repD === 'down' ? 'text-red-500' : 'text-green-500'}`}>
                           {row.repD === 'down' ? <ArrowDown size={10} /> : <ArrowUp size={10} />} {row.rep}
                        </div>
                     </td>
                     <td className="py-2.5 text-center">
                        <div className={`flex items-center justify-center gap-0.5 text-[11px] font-bold ${row.cashD === 'down' ? 'text-red-500' : 'text-green-500'}`}>
                           {row.cashD === 'down' ? <ArrowDown size={10} /> : <ArrowUp size={10} />} {row.cash}
                        </div>
                     </td>
                     <td className="py-2.5 text-center">
                        <div className={`flex items-center justify-center gap-0.5 text-[11px] font-bold ${row.incD === 'down' ? 'text-red-500' : 'text-green-500'}`}>
                           {row.incD === 'down' ? <ArrowDown size={10} /> : <ArrowUp size={10} />} {row.inc}
                        </div>
                     </td>
                     <td className={`py-2.5 text-[11px] font-bold text-center ${row.climC}`}>{row.clim}</td>
                     <td className="py-2.5 text-[11px] font-semibold text-gray-600 text-center border-l border-gray-100 pl-2">{row.hist}</td>
                     <td className="py-2.5 text-[10px] font-medium text-gray-500 text-center">{row.last}</td>
                  </tr>
               ))}
            </tbody>
         </table>
         <div className="flex justify-start mt-4">
            <button className="text-[10px] font-bold text-green-700 flex items-center gap-1 hover:text-green-800">
               View all early warning data <ArrowUpRight size={10} />
            </button>
         </div>
      </div>

    </div>
  );
}
