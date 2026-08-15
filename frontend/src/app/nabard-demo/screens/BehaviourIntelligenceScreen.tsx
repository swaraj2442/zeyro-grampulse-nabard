"use client";

import React from 'react';
import { 
  Filter, Download, RefreshCw, Users, ShieldAlert, Sparkles, TrendingUp, TrendingDown,
  ArrowUp, ArrowDown, ArrowRight, Wallet, Activity, Percent, ArrowUpRight, ArrowDownRight,
  Clock, Map, Check, AlertCircle, AlertTriangle
} from 'lucide-react';
import { 
  LineChart, Line, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Tooltip 
} from 'recharts';
import { Screen } from '../GramPulseApp';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import { useGramPulseStore } from '../store/useGramPulseStore';

interface Props {
  navigateTo?: (s: Screen, ent?: string) => void;
}

const MiniSparkline = ({ data, color }: { data: any[]; color: string }) => (
  <div className="h-6 w-16">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line type="monotone" dataKey="val" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default function BehaviourIntelligenceScreen({ navigateTo }: Props) {
  const { selectedState, selectedDistrict } = useGramPulseStore();

  const { data, isLoading } = useQuery({
    queryKey: ['behaviour-intelligence', selectedState, selectedDistrict],
    queryFn: () => apiClient.getBehaviourIntelligence({ state: selectedState, district: selectedDistrict }).then(res => res.data)
  });

  const REPAYMENT_SPARK = data?.sparks?.repayment || [];
  const CASHFLOW_SPARK = data?.sparks?.cashflow || [];
  const SAVINGS_SPARK = data?.sparks?.savings || [];
  const STABILITY_SPARK = data?.sparks?.stability || [];
  const RISK_SPARK = data?.sparks?.risk || [];
  const HIGH_RISK_SPARK = data?.sparks?.highRisk || [];

  const REPAYMENT_TIME_DATA = data?.repaymentTimeData || data?.details?.REPAYMENT_TIME_DATA || [];
  const CASHFLOW_BEHAVIOUR_DATA = data?.cashflowBehaviourData || data?.details?.CASHFLOW_BEHAVIOUR_DATA || [];
  const SAVINGS_DISTRIBUTION_DATA = data?.savingsDistributionData || data?.details?.SAVINGS_DISTRIBUTION_DATA || [];
  const INCOME_STABILITY_DATA = data?.incomeStabilityData || data?.details?.INCOME_STABILITY_DATA || [];
  
  const AI_INSIGHTS = data?.aiInsights || data?.details?.AI_INSIGHTS || [];
  const AI_RECOMMENDED_ACTIONS = data?.aiRecommendedActions || data?.details?.AI_RECOMMENDED_ACTIONS || [];
  const WATCHLIST_DATA = data?.watchlistData || data?.details?.WATCHLIST_DATA || [];
  const DISTRICT_METRICS = data?.districtMetrics || data?.details?.DISTRICT_METRICS || [];

  return (
    <div className="space-y-6 pb-12 w-full max-w-[1600px] mx-auto overflow-x-hidden">
      
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold text-gray-500 mb-1 flex items-center gap-1">
             Intelligence <span className="text-gray-300">{">"}</span> <span className="text-gray-900 font-medium">Behaviour Intelligence</span>
          </div>
          <h1 className="text-[22px] font-bold text-gray-900 mb-1">Behaviour Intelligence</h1>
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
          <button className="flex items-center gap-1.5 border border-transparent rounded-xl px-4 py-2 text-[12px] font-semibold text-white bg-[#16a34a] hover:bg-[#16a34a]/90 shadow-sm transition-colors">
            <Sparkles size={14} /> Generate Report
          </button>
        </div>
      </div>

      {/* 1. AI Behaviour Summary & Overview Banner */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-12 gap-6 items-center">
          
          {/* AI Summary */}
          <div className="col-span-5 border-r border-gray-100 pr-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Users size={22} />
            </div>
            <div>
              <div className="text-[12px] font-bold text-gray-900 mb-1">AI Behaviour Summary</div>
              <p className="text-[12px] text-gray-600 leading-relaxed">
                Repayment behaviour is strong across most enterprises.<br />
                Cashflow stability has improved in 6 districts.<br />
                Savings behaviour is moderate and can be improved.<br />
                Income stability is good with low volatility.
              </p>
            </div>
          </div>

          {/* Behaviour Risk Score Gauge / Gauge Card */}
          <div className="col-span-3 border-r border-gray-100 px-6 flex items-center justify-center gap-6">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { value: 72, fill: '#16a34a' },
                      { value: 28, fill: '#f3f4f6' },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={40}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[20px] font-extrabold text-gray-900 leading-none">72</span>
                <span className="text-[10px] font-bold text-emerald-600 mt-0.5">Good</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-gray-500 mb-1">Behaviour Risk Score</div>
              <div className="flex items-center gap-1 text-[12px] font-bold text-emerald-600">
                <ArrowDown size={14} /> 6 pts
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">vs last week</div>
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="col-span-4 pl-2 flex flex-col justify-between h-full">
            <div>
              <div className="text-[12px] font-bold text-gray-900 mb-2">Key Takeaways</div>
              <ul className="space-y-1.5 text-[11px] text-gray-600 font-medium">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  78% enterprises paid on time in the last cycle
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  Cashflow regularity improved in 5 districts
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  Savings rate is healthy among dairy enterprises
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  Low income volatility across major blocks
                </li>
              </ul>
            </div>
            <button className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-3">
              View AI Explanation <ArrowRight size={12} />
            </button>
          </div>

        </div>
      </div>

      {/* 2. Top Metric Cards (6 KPI Cards) */}
      <div className="grid grid-cols-6 gap-4">
        
        {/* Card 1: On-time Repayment Rate */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Percent size={14} />
            </div>
          </div>
          <div className="text-[10px] font-semibold text-gray-500 mb-0.5">On-time Repayment Rate</div>
          <div className="text-[20px] font-extrabold text-gray-900 mb-1">78%</div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <ArrowUp size={12} /> 5 pts <span className="text-gray-400 font-normal">vs last week</span>
          </div>
        </div>

        {/* Card 2: Cashflow Regularity */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Activity size={14} />
            </div>
          </div>
          <div className="text-[10px] font-semibold text-gray-500 mb-0.5">Cashflow Regularity</div>
          <div className="text-[20px] font-extrabold text-gray-900 mb-1">83%</div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <ArrowUp size={12} /> 6 pts <span className="text-gray-400 font-normal">vs last week</span>
          </div>
        </div>

        {/* Card 3: Savings Rate (Avg.) */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet size={14} />
            </div>
          </div>
          <div className="text-[10px] font-semibold text-gray-500 mb-0.5">Savings Rate (Avg.)</div>
          <div className="text-[20px] font-extrabold text-gray-900 mb-1">24%</div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <ArrowUp size={12} /> 3 pts <span className="text-gray-400 font-normal">vs last week</span>
          </div>
        </div>

        {/* Card 4: Income Stability */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <TrendingUp size={14} />
            </div>
          </div>
          <div className="text-[10px] font-semibold text-gray-500 mb-0.5">Income Stability</div>
          <div className="text-[20px] font-extrabold text-gray-900 mb-1">0.72</div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <ArrowUp size={12} /> 0.05 <span className="text-gray-400 font-normal">vs last week</span>
          </div>
        </div>

        {/* Card 5: Behaviour Risk Score */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldAlert size={14} />
            </div>
          </div>
          <div className="text-[10px] font-semibold text-gray-500 mb-0.5">Behaviour Risk Score</div>
          <div className="text-[20px] font-extrabold text-gray-900 mb-1">72 <span className="text-[12px] text-gray-400 font-semibold">/100</span></div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <ArrowDown size={12} /> 6 pts <span className="text-gray-400 font-normal">vs last week</span>
          </div>
        </div>

        {/* Card 6: High Behaviour Risk */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
              <AlertTriangle size={14} />
            </div>
          </div>
          <div className="text-[10px] font-semibold text-gray-500 mb-0.5">High Behaviour Risk</div>
          <div className="text-[20px] font-extrabold text-gray-900 mb-1">18%</div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <ArrowDown size={12} /> 4 pts <span className="text-gray-400 font-normal">vs last week</span>
          </div>
        </div>

      </div>

      {/* 3. 4-Grid Charts Row */}
      <div className="grid grid-cols-4 gap-4">
        
        {/* Chart 1: Repayment Behaviour Over Time */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-[13px] font-bold text-gray-900 mb-4">Repayment Behaviour Over Time</div>
            
            {/* Custom Legend */}
            <div className="flex items-center gap-4 text-[10px] font-medium text-gray-500 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> On-time (%)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span> Late (%)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Default (%)
              </div>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={REPAYMENT_TIME_DATA} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Line type="monotone" dataKey="onTime" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
                  <Line type="monotone" dataKey="late" stroke="#fb923c" strokeWidth={2} dot={{ r: 3, fill: '#fb923c' }} />
                  <Line type="monotone" dataKey="default" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <button className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-4">
            View repayment analysis <ArrowRight size={12} />
          </button>
        </div>

        {/* Chart 2: Cashflow Behaviour (Regular vs Irregular) */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-[13px] font-bold text-gray-900 mb-4">Cashflow Behaviour (Regular vs Irregular)</div>
            
            {/* Custom Legend */}
            <div className="flex items-center gap-4 text-[10px] font-medium text-gray-500 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Regular
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Irregular
              </div>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CASHFLOW_BEHAVIOUR_DATA} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Bar dataKey="regular" stackId="a" fill="#10b981" barSize={12} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="irregular" stackId="a" fill="#ef4444" barSize={12} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <button className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-4">
            View cashflow analysis <ArrowRight size={12} />
          </button>
        </div>

        {/* Chart 3: Savings Behaviour Distribution */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-[13px] font-bold text-gray-900 mb-2">Savings Behaviour Distribution</div>
            
            <div className="flex items-center gap-2">
              {/* Donut Chart */}
              <div className="relative w-32 h-32 shrink-0 my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={SAVINGS_DISTRIBUTION_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={34}
                      outerRadius={48}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {SAVINGS_DISTRIBUTION_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[13px] font-bold text-gray-900 leading-tight">1,248</span>
                  <span className="text-[9px] text-gray-400 leading-none">Enterprises</span>
                </div>
              </div>

              {/* Custom Legend List */}
              <div className="space-y-1.5 text-[10px]">
                {SAVINGS_DISTRIBUTION_DATA.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-bold text-gray-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-4">
            View savings insights <ArrowRight size={12} />
          </button>
        </div>

        {/* Chart 4: Income Stability (Volatility Index) */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-[13px] font-bold text-gray-900 mb-4">Income Stability (Volatility Index)</div>
            
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={INCOME_STABILITY_DATA} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 1.0]} ticks={[0.0, 0.2, 0.4, 0.6, 0.8, 1.0]} tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Bar dataKey="index" fill="#10b981" barSize={16} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <button className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-4">
            View income stability <ArrowRight size={12} />
          </button>
        </div>

      </div>

      {/* 4. Bottom 3 Columns: Insights, Recommended Actions, Watchlist */}
      <div className="grid grid-cols-12 gap-4">
        
        {/* Col 1: AI Behaviour Insights */}
        <div className="col-span-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-[13px] font-bold text-gray-900 mb-4">AI Behaviour Insights</div>
            <div className="space-y-3">
              {AI_INSIGHTS.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles size={12} />
                  </div>
                  <p className="text-[11px] text-gray-600 leading-normal">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
          <button className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-5">
            View all insights <ArrowRight size={12} />
          </button>
        </div>

        {/* Col 2: AI Recommended Actions */}
        <div className="col-span-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-[13px] font-bold text-gray-900 mb-4">AI Recommended Actions</div>
            <div className="space-y-3">
              {AI_RECOMMENDED_ACTIONS.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-gray-700 leading-normal">{item.text}</span>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${item.color}`}>
                    {item.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-5">
            View all recommendations <ArrowRight size={12} />
          </button>
        </div>

        {/* Col 3: Behaviour Watchlist */}
        <div className="col-span-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-[13px] font-bold text-gray-900 mb-4">Behaviour Watchlist</div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] text-gray-400 font-semibold">
                    <th className="pb-2">Enterprise</th>
                    <th className="pb-2">District</th>
                    <th className="pb-2 text-center">Behaviour Risk</th>
                    <th className="pb-2 text-center">Repayment Trend</th>
                    <th className="pb-2 text-center">Cashflow Regularity</th>
                    <th className="pb-2 text-center">Alert</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-[10px]">
                  {WATCHLIST_DATA.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="py-2.5 font-semibold text-gray-800">{row.enterprise}</td>
                      <td className="py-2.5 text-gray-500">{row.district}</td>
                      <td className="py-2.5 text-center font-bold text-gray-800">{row.risk}</td>
                      <td className="py-2.5 text-center">
                        {row.riskTrend === 'down' ? (
                          <ArrowDown size={12} className="text-red-500 mx-auto" />
                        ) : row.riskTrend === 'up' ? (
                          <ArrowUp size={12} className="text-emerald-500 mx-auto" />
                        ) : (
                          <ArrowRight size={12} className="text-gray-400 mx-auto" />
                        )}
                      </td>
                      <td className="py-2.5 text-center text-gray-600 font-medium">{row.cashflow}</td>
                      <td className="py-2.5 text-center">
                        <AlertCircle size={12} className="text-gray-400 mx-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <button className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-4">
            View full watchlist <ArrowRight size={12} />
          </button>
        </div>

      </div>

      {/* 5. Behaviour Metrics by District Table */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="text-[14px] font-bold text-gray-900 mb-4">Behaviour Metrics by District</div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">District</th>
                <th className="pb-3 text-center">Enterprises</th>
                <th className="pb-3 text-center">On-time Repayment (%)</th>
                <th className="pb-3 text-center">Cashflow Regularity (%)</th>
                <th className="pb-3 text-center">Savings Rate (%)</th>
                <th className="pb-3 text-center">Income Stability (Index)</th>
                <th className="pb-3 text-center">Behaviour Risk Score</th>
                <th className="pb-3 text-right">Trend (vs Last Week)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-[11px]">
              {DISTRICT_METRICS.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50">
                  <td className="py-3 font-semibold text-gray-900">{row.district}</td>
                  <td className="py-3 text-center text-gray-600 font-medium">{row.enterprises}</td>
                  <td className="py-3 text-center font-bold text-gray-800">{row.onTime}</td>
                  <td className="py-3 text-center text-gray-700 font-medium">{row.cashflow}</td>
                  <td className="py-3 text-center text-gray-700 font-medium">{row.savings}</td>
                  <td className="py-3 text-center text-gray-700 font-medium">{row.stability}</td>
                  <td className="py-3 text-center font-extrabold text-gray-900">{row.riskScore}</td>
                  <td className="py-3 text-right font-semibold text-emerald-600">
                    {row.trend}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-4">
          <button className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            View full behaviour data <ArrowRight size={12} />
          </button>
        </div>
      </div>

    </div>
  );
}
