"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { 
  Filter, Download, RefreshCw, CloudRain, ShieldCheck, AlertTriangle, Droplets, 
  Leaf, Map, ArrowRight, TrendingDown, ThermometerSun, Zap, ArrowUpRight, ArrowDownRight,
  TrendingUp, Globe, Map as MapIcon, Mountain
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, BarChart, Bar, XAxis, CartesianGrid, ComposedChart } from 'recharts';
import { Screen } from '../GramPulseApp';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import { useGramPulseStore } from '../store/useGramPulseStore';

const LeafletMap = dynamic(() => import('../components/LeafletMap'), { ssr: false });

interface Props {
  navigateTo: (s: Screen, ent?: string) => void;
}

const MiniSparkline = ({ data, color, type = 'line' }: any) => (
  <div className="h-6 w-16">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line type="monotone" dataKey="val" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

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

// Helper to resolve icon component from string name
const getIcon = (name: string) => {
  switch (name) {
    case 'CloudRain': return CloudRain;
    case 'ThermometerSun': return ThermometerSun;
    case 'Zap': return Zap;
    case 'Droplets': return Droplets;
    default: return AlertTriangle;
  }
};

export default function ClimateIntelligenceScreen({ navigateTo }: Props) {
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

  const { data, isLoading } = useQuery({
    queryKey: ['climate-intelligence', selectedState, selectedDistrict],
    queryFn: () => apiClient.getClimateIntelligence({ state: selectedState, district: selectedDistrict }).then(res => res.data)
  });

  const MINI_CHART_DATA = data?.miniChartData || data?.details?.MINI_CHART_DATA || [];
  const RAINFALL_TREND_DATA = data?.rainfallTrendData || data?.details?.RAINFALL_TREND_DATA || [];
  const NDVI_TREND_DATA = data?.ndviTrendData || data?.details?.NDVI_TREND_DATA || [];
  
  // Map icon strings back to actual Lucide components
  const FACTORS = (data?.factors || data?.details?.FACTORS || []).map((f: any) => ({
    ...f,
    icon: getIcon(f.iconType || f.icon)
  }));
  
  const RECOMMENDATIONS = data?.recommendations || data?.details?.RECOMMENDATIONS || [];
  const TABLE_DATA = data?.tableData || data?.details?.TABLE_DATA || [];

  return (
    <div className="space-y-6 pb-12 w-full max-w-[1600px] mx-auto overflow-x-hidden">
      
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold text-gray-500 mb-1 flex items-center gap-1">
             Intelligence <span className="text-gray-300">{">"}</span> <span className="text-gray-900">Climate Intelligence</span>
          </div>
          <h1 className="text-[22px] font-bold text-gray-900 mb-1">Climate Intelligence</h1>
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

      {/* 1. AI Climate Summary */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
         <div className="grid grid-cols-12 gap-6 items-center">
            
            <div className="col-span-5 flex gap-4">
               <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0 border border-green-100"><CloudRain size={20} className="text-green-600" /></div>
               <div>
                  <h2 className="text-[12px] font-bold text-gray-900 mb-2">AI Climate Summary</h2>
                  <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                     Rainfall is above normal in 3 districts and below normal in 2. NDVI shows healthy vegetation across most regions. Climate risk is moderate with localised high-risk pockets. Monitor monsoon progression and water stress areas.
                  </p>
               </div>
            </div>

            <div className="col-span-3 border-l border-gray-100 pl-6 flex items-center gap-6">
               <div className="relative w-20 h-20">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                     <path className="text-gray-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                     <path className="text-orange-500" strokeDasharray="64, 100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-[16px] font-bold text-gray-900 leading-none">64</span>
                     <span className="text-[9px] font-semibold text-orange-500">Moderate</span>
                  </div>
               </div>
               <div>
                  <div className="text-[10px] font-bold text-gray-900 mb-1">Climate Risk Score</div>
                  <div className="flex items-center gap-4">
                     <div>
                        <div className="flex items-center gap-1 text-green-600 font-bold text-[11px]"><TrendingDown size={12}/> 6 pts</div>
                        <div className="text-[9px] text-gray-400 font-semibold">Risk Trend</div>
                     </div>
                     <div>
                        <div className="flex items-center gap-1 text-green-600 font-bold text-[11px]"><TrendingDown size={12}/> 6 pts</div>
                        <div className="text-[9px] text-gray-400 font-semibold">vs last week</div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="col-span-4 border-l border-gray-100 pl-6">
               <h3 className="text-[11px] font-bold text-gray-900 mb-2">Key Takeaways</h3>
               <ul className="space-y-1.5">
                  <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 shrink-0"/><span className="text-[10px] font-medium text-gray-600">Southwest monsoon has progressed to 78% of the state</span></li>
                  <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 shrink-0"/><span className="text-[10px] font-medium text-gray-600">Rainfall deficit expected in Marathwada next 2 weeks</span></li>
                  <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 shrink-0"/><span className="text-[10px] font-medium text-gray-600">NDVI improved in Vidarbha and Western Maharashtra</span></li>
                  <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 shrink-0"/><span className="text-[10px] font-medium text-gray-600">Water stress rising in 12 blocks, watch closely</span></li>
               </ul>
               <div className="text-right mt-1">
                  <button className="text-[10px] font-bold text-green-700 hover:text-green-800 flex items-center justify-end gap-1 ml-auto">View AI Explanation <ArrowRight size={10}/></button>
               </div>
            </div>

         </div>
      </div>

      {/* 2. Top KPIs */}
      <div className="grid grid-cols-6 gap-4">
         <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[90px]">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center text-blue-500"><CloudRain size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">Rainfall (7 Days)</span>
               </div>
            </div>
            <div className="flex items-end justify-between">
               <div>
                  <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">112 <span className="text-[10px] font-semibold text-gray-400">mm</span></div>
                  <div className="text-[9px] font-bold text-green-600 flex items-center gap-0.5"><TrendingUp size={10}/> 18% <span className="text-gray-400 font-semibold ml-0.5">vs last week</span></div>
               </div>
            </div>
         </div>
         <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[90px]">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center text-blue-500"><CloudRain size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">Rainfall Deviation</span>
               </div>
            </div>
            <div className="flex items-end justify-between">
               <div>
                  <div className="text-[18px] font-bold text-green-600 leading-none mb-1">+12%</div>
                  <div className="text-[9px] font-bold text-gray-600">Above Normal</div>
               </div>
            </div>
         </div>
         <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[90px]">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-purple-50 flex items-center justify-center text-purple-500"><CloudRain size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">Monsoon Progress</span>
               </div>
            </div>
            <div className="flex items-end justify-between">
               <div>
                  <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">78%</div>
                  <div className="text-[9px] font-bold text-gray-600">State Progress</div>
               </div>
            </div>
         </div>
         <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[90px]">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-emerald-50 flex items-center justify-center text-emerald-500"><ShieldCheck size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">NDVI (Avg)</span>
               </div>
            </div>
            <div className="flex items-end justify-between">
               <div>
                  <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">0.64</div>
                  <div className="text-[9px] font-bold text-gray-600">Healthy</div>
               </div>
            </div>
         </div>
         <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[90px]">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-red-50 flex items-center justify-center text-red-500"><AlertTriangle size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">Climate Risk Areas</span>
               </div>
            </div>
            <div className="flex items-end justify-between">
               <div>
                  <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">24</div>
                  <div className="text-[9px] font-bold text-red-500">High Risk Blocks</div>
               </div>
            </div>
         </div>
         <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[90px]">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center text-blue-500"><Droplets size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">Water Stress Areas</span>
               </div>
            </div>
            <div className="flex items-end justify-between">
               <div>
                  <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">12</div>
                  <div className="text-[9px] font-bold text-gray-600">Rising</div>
               </div>
            </div>
         </div>
      </div>

      {/* 3. Middle Row: Charts and Map */}
      <div className="grid grid-cols-3 gap-6">
         
         <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-[12px] font-bold text-gray-900 mb-4">Rainfall Trends (mm)</h2>
            <div className="flex items-center gap-4 mb-4 text-[9px] font-bold text-gray-500">
               <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-blue-500"></div>Actual</div>
               <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-gray-200"></div>Normal</div>
               <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-blue-400"></div>Forecast</div>
            </div>
            <div className="h-[180px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <ComposedChart data={RAINFALL_TREND_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                   <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} dy={10} />
                   <Bar dataKey="normal" fill="#e5e7eb" radius={[2, 2, 0, 0]} barSize={16} />
                   <Bar dataKey="actual" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={16} />
                   <Line type="monotone" dataKey="forecast" stroke="#60a5fa" strokeWidth={2} strokeDasharray="4 4" dot={{r:3, fill:"#60a5fa", strokeWidth:0}} />
                 </ComposedChart>
               </ResponsiveContainer>
            </div>
            <button className="text-[10px] font-bold text-green-700 mt-2 flex items-center gap-1 hover:text-green-800">
               View detailed rainfall analysis <ArrowRight size={10} />
            </button>
         </div>

         <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-[12px] font-bold text-gray-900 mb-6">NDVI Trend (Last 12 Weeks)</h2>
            <div className="h-[180px] w-full mb-4">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={NDVI_TREND_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                   <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} dy={10} />
                   <Line type="monotone" dataKey="val" stroke="#10b981" strokeWidth={2} dot={{r:3, fill:"#10b981", strokeWidth:0}} />
                 </LineChart>
               </ResponsiveContainer>
            </div>
            <button className="text-[10px] font-bold text-green-700 mt-2 flex items-center gap-1 hover:text-green-800">
               View NDVI analysis <ArrowRight size={10} />
            </button>
         </div>

         <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col">
            <h2 className="text-[12px] font-bold text-gray-900 mb-4">Climate Risk Heatmap (District Level)</h2>
            <div className="flex-1 flex gap-4">
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
               <div className="w-[100px] flex flex-col justify-center gap-3 text-[10px] font-semibold text-gray-600">
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-red-500"></div>High Risk</div>
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-orange-400"></div>Moderate Risk</div>
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-yellow-400"></div>Low Risk</div>
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-green-500"></div>Minimal Risk</div>
               </div>
            </div>
            <button className="text-[10px] font-bold text-green-700 mt-4 flex items-center gap-1 hover:text-green-800">
               View full heatmap <ArrowRight size={10} />
            </button>
         </div>

      </div>

      {/* 4. Bottom Row: Insights & Actions */}
      <div className="grid grid-cols-3 gap-6">
         
         <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-[12px] font-bold text-gray-900 mb-4">AI Climate Insights</h2>
            <div className="space-y-4">
               <div className="flex gap-3">
                  <CloudRain size={14} className="text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] font-medium text-gray-700 leading-snug">Rainfall is 12% above normal this week, beneficial for Kharif sowing.</p>
               </div>
               <div className="flex gap-3">
                  <AlertTriangle size={14} className="text-orange-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] font-medium text-gray-700 leading-snug">Marathwada region may face rainfall deficit next 2 weeks.</p>
               </div>
               <div className="flex gap-3">
                  <Leaf size={14} className="text-green-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] font-medium text-gray-700 leading-snug">NDVI improvement of 8% in Vidarbha indicating healthy crop growth.</p>
               </div>
               <div className="flex gap-3">
                  <Droplets size={14} className="text-red-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] font-medium text-gray-700 leading-snug">Water stress rising in 12 blocks, monitor irrigation and water availability.</p>
               </div>
            </div>
            <button className="text-[10px] font-bold text-green-700 mt-5 flex items-center gap-1 hover:text-green-800">
               View all insights <ArrowRight size={10} />
            </button>
         </div>

         <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-[12px] font-bold text-gray-900 mb-4">Climate Risk by Factor</h2>
            <div className="space-y-3">
               {FACTORS.map((f, i) => (
                  <div key={i} className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <f.icon size={12} className="text-gray-400" />
                        <span className="text-[11px] font-bold text-gray-700">{f.name}</span>
                     </div>
                     <div className="flex gap-6">
                        <span className={`text-[10px] font-bold w-16 ${f.sColor}`}>{f.sev}</span>
                        <span className="text-[10px] font-medium text-gray-500 w-24">Impact: {f.imp}</span>
                     </div>
                  </div>
               ))}
            </div>
            <button className="text-[10px] font-bold text-green-700 mt-5 flex items-center gap-1 hover:text-green-800">
               View risk factor analysis <ArrowRight size={10} />
            </button>
         </div>

         <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-[12px] font-bold text-gray-900 mb-4">AI Recommended Actions</h2>
            <div className="space-y-4">
               {RECOMMENDATIONS.map((r, i) => (
                  <div key={i} className="flex items-start justify-between gap-4">
                     <div className="flex items-start gap-2">
                        <Zap size={12} className="text-yellow-500 mt-0.5 shrink-0" fill="currentColor" />
                        <span className="text-[11px] font-medium text-gray-700 leading-snug">{r.text}</span>
                     </div>
                     <span className={`text-[10px] font-bold shrink-0 ${r.pColor}`}>{r.prio}</span>
                  </div>
               ))}
            </div>
            <button className="text-[10px] font-bold text-green-700 mt-5 flex items-center gap-1 hover:text-green-800">
               View all recommendations <ArrowRight size={10} />
            </button>
         </div>

      </div>

      {/* 5. High Climate Risk Blocks Table */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
         <h2 className="text-[13px] font-bold text-gray-900 mb-4">High Climate Risk Blocks</h2>
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="border-b border-gray-100">
                  <th className="py-2 text-[10px] font-semibold text-gray-500">District</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500">Block</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500 text-center">Climate Risk Score</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500 text-center">Risk Factors</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500 text-center">Rainfall Deviation</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500 text-center">NDVI</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500 text-center">Water Stress</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500 text-center">Trend</th>
                  <th className="py-2 text-[10px] font-semibold text-gray-500 text-center">Last 7 Days</th>
               </tr>
            </thead>
            <tbody>
               {TABLE_DATA.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                     <td className="py-2.5 text-[11px] font-bold text-gray-700">{row.dist}</td>
                     <td className="py-2.5 text-[11px] font-semibold text-gray-600">{row.block}</td>
                     <td className="py-2.5 text-[11px] font-bold text-red-500 text-center">{row.score}</td>
                     <td className="py-2.5 flex justify-center gap-1 text-gray-400">
                        <CloudRain size={12}/> <Droplets size={12}/> <Zap size={12}/>
                     </td>
                     <td className="py-2.5 text-[11px] font-bold text-red-500 text-center">{row.rain}</td>
                     <td className="py-2.5 text-[11px] font-bold text-orange-500 text-center">{row.ndvi}</td>
                     <td className={`py-2.5 text-[11px] font-bold text-center ${row.wColor}`}>{row.ws}</td>
                     <td className="py-2.5 text-center">
                        {row.trend === 'down' ? <ArrowDownRight size={12} className="text-red-500 mx-auto"/> : <ArrowUpRight size={12} className="text-green-500 mx-auto"/>}
                     </td>
                     <td className="py-2.5 text-center flex justify-center">
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
         <div className="flex justify-end mt-4">
            <button className="text-[10px] font-bold text-green-700 flex items-center gap-1 hover:text-green-800">
               View full risk table <ArrowRight size={10} />
            </button>
         </div>
      </div>

    </div>
  );
}

// Ensure dummy component for missing import
const Clock = ({size}:any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
