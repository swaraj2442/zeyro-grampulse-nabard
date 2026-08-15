"use client";

import React, { useState } from 'react';
import { 
  Filter, Download, Plus, Search, Sparkles, CheckCircle2, ArrowUp, ArrowDown, 
  ArrowRight, ShieldAlert, AlertTriangle, Wallet, Eye, SlidersHorizontal, ChevronLeft, ChevronRight
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Screen } from '../GramPulseApp';
import { useQuery } from '@tanstack/react-query';
import { useGramPulseStore } from '../store/useGramPulseStore';
import apiClient from '../services/apiClient';

interface PortfolioScreenProps {
  navigateTo?: (s: Screen, ent?: string) => void;
}

// --- MOCK DATA ---

// Sparkline datasets for KPI Cards
const SPARK_ENTERPRISES = [{ val: 3100 }, { val: 3150 }, { val: 3180 }, { val: 3200 }, { val: 3220 }, { val: 3250 }];
const SPARK_HEALTH = [{ val: 75 }, { val: 76 }, { val: 78 }, { val: 79 }, { val: 80 }, { val: 81 }];
const SPARK_RISK = [{ val: 23 }, { val: 21 }, { val: 20 }, { val: 19 }, { val: 18 }, { val: 18 }];
const SPARK_NPA = [{ val: 3.3 }, { val: 3.1 }, { val: 3.0 }, { val: 2.9 }, { val: 2.8 }, { val: 2.7 }];
const SPARK_CASHFLOW = [{ val: 2.2 }, { val: 2.3 }, { val: 2.35 }, { val: 2.4 }, { val: 2.45 }, { val: 2.48 }];
const SPARK_INTERVENTIONS = [{ val: 21 }, { val: 23 }, { val: 24 }, { val: 25 }, { val: 26 }, { val: 27 }];

// Fallback Data if API fails or returns empty
const FALLBACK_ENTERPRISES_LIST = [
  { id: 'ENT-00124', name: 'Krishna Dairy Farm', sector: 'Dairy', sectorBg: 'bg-blue-50 text-blue-600', district: 'Satara', score: 89, risk: 'Low', riskBg: 'bg-emerald-50 text-emerald-600 border-emerald-100', barColor: 'bg-emerald-500', prob: '96%', cashflow: '+₹1.45 L', cashflowType: 'Surplus', npa: '1.2%', trend: [{v:12},{v:15},{v:14},{v:18},{v:20}], trendColor: '#10b981' },
  { id: 'ENT-000325', name: 'Shivam Poultry', sector: 'Poultry', sectorBg: 'bg-orange-50 text-orange-600', district: 'Pune', score: 67, risk: 'Medium', riskBg: 'bg-amber-50 text-amber-600 border-amber-100', barColor: 'bg-amber-500', prob: '88%', cashflow: '-₹38 K', cashflowType: 'Deficit', npa: '3.8%', trend: [{v:20},{v:18},{v:15},{v:14},{v:12}], trendColor: '#ef4444' },
  { id: 'ENT-000567', name: 'Sai Food Processing', sector: 'Food Proc.', sectorBg: 'bg-emerald-50 text-emerald-600', district: 'Kolhapur', score: 74, risk: 'Medium', riskBg: 'bg-amber-50 text-amber-600 border-amber-100', barColor: 'bg-amber-500', prob: '91%', cashflow: '+₹22 K', cashflowType: 'Surplus', npa: '2.3%', trend: [{v:15},{v:16},{v:18},{v:17},{v:19}], trendColor: '#10b981' },
  { id: 'ENT-000789', name: 'Maa Retail Stores', sector: 'Rural Retail', sectorBg: 'bg-purple-50 text-purple-600', district: 'Sangli', score: 82, risk: 'Low', riskBg: 'bg-emerald-50 text-emerald-600 border-emerald-100', barColor: 'bg-emerald-500', prob: '94%', cashflow: '+₹85 K', cashflowType: 'Surplus', npa: '1.6%', trend: [{v:10},{v:12},{v:15},{v:18},{v:22}], trendColor: '#10b981' },
  { id: 'ENT-000912', name: 'Ganesh Dairy', sector: 'Dairy', sectorBg: 'bg-blue-50 text-blue-600', district: 'Solapur', score: 58, risk: 'High', riskBg: 'bg-red-50 text-red-600 border-red-100', barColor: 'bg-red-500', prob: '72%', cashflow: '-₹1.12 L', cashflowType: 'Deficit', npa: '5.6%', trend: [{v:25},{v:22},{v:18},{v:15},{v:10}], trendColor: '#ef4444' },
];

const mapEnterpriseData = (apiEnterprise: any) => {
  const isHigh = apiEnterprise.riskLevel === 'High' || apiEnterprise.riskLevel === 'Critical';
  const isAmber = apiEnterprise.riskLevel === 'Amber';
  
  let sectorBg = 'bg-gray-50 text-gray-600';
  if (apiEnterprise.sector === 'Poultry') sectorBg = 'bg-orange-50 text-orange-600';
  if (apiEnterprise.sector === 'Dairy') sectorBg = 'bg-blue-50 text-blue-600';
  if (apiEnterprise.sector === 'Food Processing') sectorBg = 'bg-emerald-50 text-emerald-600';
  if (apiEnterprise.sector === 'Rural Retail') sectorBg = 'bg-purple-50 text-purple-600';

  return {
    id: apiEnterprise.entity_id || apiEnterprise.id,
    name: apiEnterprise.name,
    sector: apiEnterprise.sector,
    sectorBg,
    district: apiEnterprise.district,
    score: apiEnterprise.healthScore || apiEnterprise.riskScore || 70, // Prioritize healthScore
    risk: apiEnterprise.riskLevel || 'Medium',
    riskBg: isHigh ? 'bg-red-50 text-red-600 border-red-100' : (isAmber ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'),
    barColor: isHigh ? 'bg-red-500' : (isAmber ? 'bg-amber-500' : 'bg-emerald-500'),
    prob: apiEnterprise.healthScore ? `${apiEnterprise.healthScore}%` : (isHigh ? '75%' : '92%'),
    cashflow: apiEnterprise.forecastDeficit ? `-₹${(apiEnterprise.forecastDeficit / 1000).toFixed(1)} K` : '+₹12 K',
    cashflowType: apiEnterprise.forecastDeficit ? 'Deficit' : 'Surplus',
    npa: isHigh ? '4.8%' : '1.2%',
    trend: isHigh ? [{v:20},{v:18},{v:16},{v:14},{v:11}] : [{v:12},{v:15},{v:14},{v:18},{v:20}],
    trendColor: isHigh ? '#ef4444' : '#10b981',
    intervention: apiEnterprise.intervention,
    officer: apiEnterprise.officer,
  };
};

// Donut Chart Sector Distribution


const RowSparkline = ({ data, color }: { data: any[]; color: string }) => (
  <div className="h-5 w-14 inline-block">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default function PortfolioScreen({ navigateTo }: PortfolioScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { selectedState, selectedDistrict, dateRange } = useGramPulseStore();
  
  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['portfolioSummary', selectedState, selectedDistrict, dateRange],
    queryFn: () => apiClient.getPortfolioSummary().then(res => res.data)
  });

  const { data: portfolioData, isLoading: isLoadingPortfolio } = useQuery({
    queryKey: ['portfolio', selectedState, selectedDistrict, dateRange],
    queryFn: () => apiClient.getPortfolio({ state: selectedState, district: selectedDistrict }).then(res => res.data)
  });

  const { data: sectorDistribution = [] } = useQuery({
    queryKey: ['portfolioSectors', selectedState, selectedDistrict, dateRange],
    queryFn: () => apiClient.getSectorDistribution().then(res => res.data)
  });

  const { data: portfolioTrends = [] } = useQuery({
    queryKey: ['portfolioTrends', selectedState, selectedDistrict, dateRange],
    queryFn: () => apiClient.getPortfolioTrends().then(res => res.data)
  });

  const displayEnterprises = portfolioData?.enterprises 
    ? portfolioData.enterprises.map(mapEnterpriseData)
    : FALLBACK_ENTERPRISES_LIST;

  return (
    <div className="space-y-6 pb-12 w-full max-w-[1600px] mx-auto overflow-x-hidden">
      
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[22px] font-bold text-gray-900">Portfolio</h1>
            <span className="text-gray-400 text-[18px]">📊</span>
          </div>
          <p className="text-[12px] text-gray-500 font-medium">
            Complete overview of rural micro-enterprise portfolio across selected filters.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-4 py-2 text-[12px] font-semibold text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors">
            <Filter size={14} /> Saved Views
          </button>
          <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-4 py-2 text-[12px] font-semibold text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors">
            <Download size={14} /> Export
          </button>
          <button className="flex items-center gap-1.5 border border-transparent rounded-xl px-4 py-2 text-[12px] font-semibold text-white bg-[#16a34a] hover:bg-[#16a34a]/90 shadow-sm transition-colors">
            <Plus size={14} /> Add Enterprise
          </button>
        </div>
      </div>

      {/* 1. AI Portfolio Summary & Key Insights Card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-12 gap-6 items-center">
          
          {/* AI Summary */}
          <div className="col-span-5 border-r border-gray-100 pr-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Sparkles size={22} />
            </div>
            <div>
              <div className="text-[12px] font-bold text-gray-900 mb-1">AI Portfolio Summary</div>
              <p className="text-[12px] text-gray-600 leading-relaxed">
                <span className="font-bold text-gray-900">18 enterprises need immediate attention.</span> Dairy and Poultry sectors show highest risk due to rainfall deficit and rising feed costs. Timely intervention can prevent potential delinquencies of <span className="font-bold text-gray-900">₹2.48 Cr</span>.
              </p>
            </div>
          </div>

          {/* AI Confidence Badge */}
          <div className="col-span-3 border-r border-gray-100 px-6 flex items-center justify-center">
            <div className="border border-emerald-100 bg-emerald-50/50 rounded-2xl p-4 flex items-center gap-3 w-full max-w-[200px]">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div className="text-[9px] text-gray-500 uppercase tracking-wider font-bold mb-0.5">AI Confidence</div>
                <div className="text-[13px] font-extrabold text-emerald-600">High (92%)</div>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="col-span-4 pl-2 flex flex-col justify-between h-full">
            <div>
              <div className="text-[12px] font-bold text-emerald-600 mb-2">Key Insights</div>
              <ul className="space-y-1.5 text-[11px] text-gray-600 font-medium">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  12 enterprises likely to face cash-flow stress in next 60 days
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  Rainfall deficit impacting 96 enterprises
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  Repayment probability portfolio average at 92%
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  27 interventions pending approval
                </li>
              </ul>
            </div>
            <button className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-3">
              View full brief <ArrowRight size={12} />
            </button>
          </div>

        </div>
      </div>

      {/* 2. Top Metric Cards (6 KPI Cards) */}
      <div className="grid grid-cols-6 gap-4">
        
        {/* Card 1: Total Enterprises */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="text-[14px]">🏢</span>
            </div>
          </div>
          <div className="text-[10px] font-semibold text-gray-500 mb-0.5">Total Enterprises</div>
          <div className="text-[20px] font-extrabold text-gray-900 mb-1">3,250</div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <ArrowUp size={12} /> 120 <span className="text-gray-400 font-normal">vs last week</span>
          </div>
        </div>

        {/* Card 2: Portfolio Health Score */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="text-[14px]">💚</span>
            </div>
          </div>
          <div className="text-[10px] font-semibold text-gray-500 mb-0.5">Portfolio Health Score</div>
          <div className="text-[20px] font-extrabold text-gray-900 mb-1">81 <span className="text-[12px] text-gray-400 font-semibold">/100</span></div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <ArrowUp size={12} /> 6 pts <span className="text-gray-400 font-normal">vs last week</span>
          </div>
        </div>

        {/* Card 3: At Risk (Next 60 Days) */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
              <AlertTriangle size={14} />
            </div>
          </div>
          <div className="text-[10px] font-semibold text-gray-500 mb-0.5">At Risk (Next 60 Days)</div>
          <div className="text-[20px] font-extrabold text-gray-900 mb-1">18</div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-red-500">
            <ArrowDown size={12} /> 5 <span className="text-gray-400 font-normal">vs last week</span>
          </div>
        </div>

        {/* Card 4: Forecast NPA (Next 90 Days) */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
              <ShieldAlert size={14} />
            </div>
          </div>
          <div className="text-[10px] font-semibold text-gray-500 mb-0.5">Forecast NPA (Next 90 Days)</div>
          <div className="text-[20px] font-extrabold text-gray-900 mb-1">2.7%</div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <ArrowDown size={12} /> 0.6% <span className="text-gray-400 font-normal">vs last week</span>
          </div>
        </div>

        {/* Card 5: Cash-flow Deficit (Next 60 Days) */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Wallet size={14} />
            </div>
          </div>
          <div className="text-[10px] font-semibold text-gray-500 mb-0.5">Cash-flow Deficit (Next 60 Days)</div>
          <div className="text-[20px] font-extrabold text-gray-900 mb-1">₹2.48 Cr</div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <ArrowUp size={12} /> 8% <span className="text-gray-400 font-normal">vs last week</span>
          </div>
        </div>

        {/* Card 6: Interventions Pending */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <span className="text-[14px]">👥</span>
            </div>
          </div>
          <div className="text-[10px] font-semibold text-gray-500 mb-0.5">Interventions Pending</div>
          <div className="text-[20px] font-extrabold text-gray-900 mb-1">27</div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <ArrowUp size={12} /> 6 <span className="text-gray-400 font-normal">vs last week</span>
          </div>
        </div>

      </div>

      {/* 3. Main Area: Table (Left 8 Cols) + Right Widgets (Right 4 Cols) */}
      <div className="grid grid-cols-12 gap-4">
        
        {/* Left 8 Cols: Enterprise Portfolio Table */}
        <div className="col-span-8 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            
            {/* Table Header & Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-[14px] font-bold text-gray-900">Enterprise Portfolio</h3>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full">3,250</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search in table..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-xl text-[11px] w-44 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                
                <button className="flex items-center gap-1 border border-gray-200 rounded-xl px-3 py-1.5 text-[11px] font-semibold text-gray-700 bg-white hover:bg-gray-50">
                  Filters <SlidersHorizontal size={12} />
                </button>
                
                <select className="border border-gray-200 rounded-xl px-3 py-1.5 text-[11px] font-semibold text-gray-700 bg-white focus:outline-none cursor-pointer">
                  <option>Health Score</option>
                  <option>Risk Level</option>
                  <option>Repayment Prob.</option>
                </select>

                <button className="p-1.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50">
                  <SlidersHorizontal size={12} />
                </button>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-max text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] text-gray-400 font-semibold whitespace-nowrap">
                    <th className="pb-3 w-8">
                      <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-0" />
                    </th>
                    <th className="pb-3">Enterprise Name</th>
                    <th className="pb-3">Sector</th>
                    <th className="pb-3">District</th>
                    <th className="pb-3">Health Score</th>
                    <th className="pb-3">Risk Level</th>
                    <th className="pb-3">Repayment Prob.</th>
                    <th className="pb-3">Cash-flow (Next 60 Days)</th>
                    <th className="pb-3">Forecast NPA (90 Days)</th>
                    <th className="pb-3">Intervention Status</th>
                    <th className="pb-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-[11px]">
                  {displayEnterprises.map((row: any) => (
                    <tr 
                      key={row.id} 
                      className="hover:bg-gray-50/60 cursor-pointer transition-colors"
                      onClick={() => navigateTo && navigateTo('twin', row.id)}
                    >
                      <td className="py-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-0" />
                      </td>
                      
                      {/* Enterprise Name & ID */}
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] shrink-0 font-bold text-gray-600">
                            {row.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 leading-tight">{row.name}</div>
                            <div className="text-[9px] text-gray-400">{row.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Sector Badge */}
                      <td className="py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap ${row.sectorBg}`}>
                          {row.sector}
                        </span>
                      </td>

                      {/* District */}
                      <td className="py-3 font-medium text-gray-600">{row.district}</td>

                      {/* Health Score + Bar */}
                      <td className="py-3">
                        <div>
                          <span className="font-extrabold text-gray-900">{row.score}</span>
                          <div className="w-14 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                            <div className={`h-full rounded-full ${row.barColor}`} style={{ width: `${row.score}%` }}></div>
                          </div>
                        </div>
                      </td>

                      {/* Risk Level Badge */}
                      <td className="py-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${row.riskBg}`}>
                          {row.risk}
                        </span>
                      </td>

                      {/* Repayment Prob + Sparkline */}
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-gray-800">{row.prob}</span>
                        </div>
                      </td>

                      {/* Cash-flow */}
                      <td className="py-3">
                        <div>
                          <span className={`font-bold ${row.cashflowType === 'Surplus' ? 'text-emerald-600' : 'text-red-500'}`}>
                            {row.cashflow}
                          </span>
                          <span className="text-[9px] text-gray-400 block leading-tight">{row.cashflowType}</span>
                        </div>
                      </td>

                      {/* Forecast NPA + Sparkline */}
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-gray-800">{row.npa}</span>
                        </div>
                      </td>
                      
                      {/* Intervention Status */}
                      <td className="py-3">
                        {row.intervention ? (
                          <div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${row.intervention === 'Assigned' ? 'bg-purple-50 text-purple-600 border border-purple-200' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>
                              {row.intervention}
                            </span>
                            {row.officer && <span className="block text-[9px] text-gray-500 mt-1 pl-1">{row.officer}</span>}
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-medium">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600">
                          <button onClick={() => navigateTo && navigateTo('twin', row.id)} title="View Digital Twin">
                            <Eye size={13} />
                          </button>
                          <button title="Options">
                            <SlidersHorizontal size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* Table Footer Pagination */}
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100 text-[11px] text-gray-500">
            <div>Showing 1 to 8 of 3,250 enterprises</div>
            
            <div className="flex items-center gap-1">
              <button className="p-1 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-40" disabled>
                <ChevronLeft size={14} />
              </button>
              <button className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-[11px]">1</button>
              <button className="w-6 h-6 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50">2</button>
              <button className="w-6 h-6 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50">3</button>
              <span className="px-1 text-gray-400">...</span>
              <button className="w-7 h-6 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50">406</button>
              <button className="p-1 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span>Rows per page</span>
              <select className="border border-gray-200 rounded-lg px-2 py-0.5 text-[11px] font-semibold text-gray-700 bg-white">
                <option>20</option>
                <option>50</option>
                <option>100</option>
              </select>
            </div>
          </div>

        </div>

        {/* Right 4 Cols: Widget Cards Stack */}
        <div className="col-span-4 space-y-4">
          
          {/* Widget 1: Sector Distribution (Donut) */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[13px] font-bold text-gray-900">Sector Distribution</h3>
              <button className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5">
                View details <ArrowRight size={12} />
              </button>
            </div>

            <div className="flex items-center gap-4 py-2">
              <div className="relative w-28 h-28 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sectorDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={44}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {sectorDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[12px] font-bold text-gray-900 leading-tight">3,250</span>
                  <span className="text-[8px] text-gray-400 leading-none">Total</span>
                </div>
              </div>

              <div className="flex-1 space-y-1.5 text-[10px]">
                {sectorDistribution.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <span className="text-gray-600 font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{item.value}%</span>
                      <span className="text-gray-400 font-normal">({item.count})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Widget 2: Health Score Distribution */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-bold text-gray-900">Health Score Distribution</h3>
              <button className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5">
                View details <ArrowRight size={12} />
              </button>
            </div>

            <div className="space-y-3">
              {/* Stacked multi-color progress bar */}
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
                <div className="bg-red-500 h-full" style={{ width: '13%' }}></div>
                <div className="bg-amber-500 h-full" style={{ width: '37%' }}></div>
                <div className="bg-emerald-500 h-full" style={{ width: '50%' }}></div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-[10px]">
                <div>
                  <div className="text-gray-400 font-medium">Low (0-50)</div>
                  <div className="font-bold text-gray-900 text-[12px] mt-0.5">420</div>
                  <div className="text-gray-400">13%</div>
                </div>
                <div>
                  <div className="text-gray-400 font-medium">Medium</div>
                  <div className="font-bold text-gray-900 text-[12px] mt-0.5">1,210</div>
                  <div className="text-gray-400">37%</div>
                </div>
                <div>
                  <div className="text-gray-400 font-medium">High</div>
                  <div className="font-bold text-gray-900 text-[12px] mt-0.5">1,620</div>
                  <div className="text-gray-400">50%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Widget 3: Portfolio Trends (vs last week) */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-bold text-gray-900">Portfolio Trends <span className="text-gray-400 font-normal text-[10px]">(vs last week)</span></h3>
              <button className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5">
                View details <ArrowRight size={12} />
              </button>
            </div>

            <div className="space-y-3 divide-y divide-gray-50">
              {portfolioTrends.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between pt-2 first:pt-0">
                  <div>
                    <div className="text-[11px] font-medium text-gray-600">{item.label}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[12px] font-bold text-gray-900">{item.count}</span>
                      <span className={`text-[10px] font-bold ${item.isGoodDown || (!item.isBadUp && item.isUp) ? 'text-emerald-600' : 'text-red-500'}`}>
                        {item.delta}
                      </span>
                    </div>
                  </div>
                  <RowSparkline data={item.spark} color={item.color} />
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
