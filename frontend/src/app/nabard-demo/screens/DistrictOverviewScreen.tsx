"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { ChevronRight, ArrowUpRight, Calendar } from 'lucide-react';

const HEALTH_TREND = [
  { month: 'Jul', value: 25 }, { month: 'Aug', value: 38 }, { month: 'Sep', value: 42 },
  { month: 'Oct', value: 45 }, { month: 'Nov', value: 50 }, { month: 'Dec', value: 58 },
  { month: 'Jan', value: 55 }, { month: 'Feb', value: 57 }, { month: 'Mar', value: 66 },
  { month: 'Apr', value: 72 }, { month: 'May', value: 78 }, { month: 'Jun', value: 76 },
];

const SECTOR_DIST = [
  { name: 'Poultry',      value: 28, color: '#4f46e5' },
  { name: 'Dairy',        value: 24, color: '#3b82f6' },
  { name: 'Horticulture', value: 18, color: '#10b981' },
  { name: 'Agriculture',  value: 16, color: '#f59e0b' },
  { name: 'Others',       value: 14, color: '#f43f5e' },
];

const VILLAGES = [
  { name: 'Pimpalgaon (B)', score: 58, level: 'Low',    levelColor: 'bg-green-100 text-green-700', hhs: 12 },
  { name: 'Surgana',        score: 54, level: 'Medium', levelColor: 'bg-yellow-100 text-yellow-700', hhs: 18 },
  { name: 'Nandgaon',       score: 47, level: 'Low',    levelColor: 'bg-green-100 text-green-700', hhs: 15 },
  { name: 'Deola',          score: 35, level: 'High',   levelColor: 'bg-red-100 text-red-700', hhs: 24 },
  { name: 'Dindori',        score: 29, level: 'High',   levelColor: 'bg-red-100 text-red-700', hhs: 28 },
];

const METRICS = [
  { metric: 'Women-led Enterprises (%)', current: '18%',   lastM: '+ 2.3%', lastMUp: true, lastQ: '+ 4.6%', lastQUp: true, lastY: '+ 6.2%', lastYUp: true },
  { metric: 'Avg. Ticket Size (₹)',      current: '18,562', lastM: '+ 4.2%', lastMUp: true, lastQ: '+ 7.1%', lastQUp: true, lastY: '+ 9.3%', lastYUp: true },
  { metric: 'NPA (%)',                   current: '8%',    lastM: '- 0.6%', lastMUp: true, lastQ: '- 1.2%', lastQUp: true, lastY: '- 2.0%', lastYUp: true },
  { metric: 'Active Borrowers',          current: '2,341',  lastM: '+ 3.8%', lastMUp: true, lastQ: '+ 6.6%', lastQUp: true, lastY: '+ 11.5%', lastYUp: true },
  { metric: 'Delinquency Rate (%)',      current: '4.1%',  lastM: '+ 0.4%', lastMUp: false, lastQ: '- 0.3%', lastQUp: true, lastY: '- 0.7%', lastYUp: true },
];

const SCHEMES = [
  { name: 'JLG Scheme',            hhs: '1,248', cov: '53%', trend: '+ 5.2%' },
  { name: 'PMEGP',                 hhs: '842',   cov: '36%', trend: '+ 3.1%' },
  { name: 'Dairy Entrepreneurship',hhs: '512',   cov: '22%', trend: '+ 2.8%' },
  { name: 'Poultry Vikas Yojana',  hhs: '421',   cov: '18%', trend: '+ 1.9%' },
  { name: 'Watershed Development', hhs: '312',   cov: '13%', trend: '+ 1.4%' },
];

function Sparkline() {
  const data = Array.from({length: 12}, () => Math.random() * 100);
  return (
    <svg width="60" height="20" viewBox="0 0 60 20">
      <path
        d={`M0,${20 - (data[0]/100)*20} ${data.map((d, i) => `L${(i/11)*60},${20 - (d/100)*20}`).join(' ')}`}
        fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DistrictOverviewScreen() {
  return (
    <div className="space-y-4 pb-10">
      {/* Header Area */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-1">
            <span className="cursor-pointer hover:text-gray-900">Maharashtra</span>
            <ChevronRight size={12} />
            <span className="font-bold text-gray-900">Nashik</span>
          </div>
          <h1 className="text-[22px] font-bold text-gray-900">Nashik District Overview</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-1.5 shadow-sm text-[12px] text-gray-700 cursor-pointer hover:bg-gray-50">
            <Calendar size={14} className="text-gray-400" />
            20 May 2025 - 20 Jun 2025
            <ChevronRight size={12} className="rotate-90 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2">
        {['Nashik', 'Health Score', 'All Sectors'].map((f) => (
          <select key={f} className="border border-gray-100 rounded-xl px-3 py-1.5 text-[12px] font-medium text-gray-700 bg-white shadow-sm focus:outline-none appearance-none pr-6 cursor-pointer hover:bg-gray-50"
            style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '8px auto' }}
          >
            <option>{f}</option>
          </select>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-gradient-to-br from-indigo-950 to-indigo-900 rounded-[20px] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-50/50 flex flex-col justify-between h-[130px]">
          <div className="text-[13px] font-semibold text-indigo-200 mb-1">Total Households</div>
          <div className="flex items-end justify-between mt-auto">
            <div>
              <div className="text-[28px] font-bold text-white leading-none mb-3 tracking-tight">2,341</div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 font-bold text-[11px] rounded-md">↑ 4.6%</span>
                <span className="text-[11px] font-medium text-indigo-300">vs last month</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* KPI 2 */}
        <div className="bg-white rounded-[20px] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-50/50 flex flex-col justify-between h-[130px]">
          <div className="text-[13px] font-semibold text-gray-500 mb-1">Avg. Health Score</div>
          <div className="flex items-end justify-between mt-auto">
            <div>
              <div className="text-[28px] font-bold text-gray-900 leading-none mb-3 tracking-tight">72</div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-green-50 text-green-600 font-bold text-[11px] rounded-md">↑ 2.3%</span>
                <span className="text-[11px] font-medium text-gray-400">vs last month</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* KPI 3 */}
        <div className="bg-white rounded-[20px] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-50/50 flex flex-col justify-between h-[130px]">
          <div className="text-[13px] font-semibold text-gray-500 mb-1">Villages</div>
          <div className="flex items-end justify-between mt-auto">
            <div>
              <div className="text-[28px] font-bold text-gray-900 leading-none mb-3 tracking-tight">412</div>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-[20px] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-50/50 flex flex-col justify-between h-[130px]">
          <div className="text-[13px] font-semibold text-gray-500 mb-1">Critical Households</div>
          <div className="flex items-end justify-between mt-auto">
            <div>
              <div className="text-[28px] font-bold text-gray-900 leading-none mb-3 tracking-tight">156</div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-red-50 text-red-500 font-bold text-[11px] rounded-md">↑ 6.1%</span>
                <span className="text-[11px] font-medium text-gray-400">vs last month</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-12 gap-4">
        {/* Health Trend */}
        <div className="col-span-5 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-bold text-gray-900">Health Trend (Last 12 Months)</h3>
            <select className="border border-gray-100 bg-gray-50 rounded px-2 py-1 text-[11px] text-gray-600 focus:outline-none cursor-pointer">
              <option>Monthly</option>
            </select>
          </div>
          
          <div className="relative h-48 w-full mt-2">
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[9px] text-gray-400 z-10 pointer-events-none">
              <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
            </div>
            <div className="ml-5 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={HEALTH_TREND} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} dy={5} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#healthGrad)" activeDot={{ r: 4, strokeWidth: 0, fill: '#6d28d9' }} dot={{ r: 2.5, fill: '#8b5cf6', strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex justify-center items-center gap-1.5 mt-2">
            <div className="w-3 h-0.5 bg-[#8b5cf6] rounded-full"></div>
            <span className="text-[10px] text-gray-500 font-medium">Health Score</span>
          </div>
        </div>

        {/* Sector Distribution */}
        <div className="col-span-3 bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col relative">
          <h3 className="text-[13px] font-bold text-gray-900 mb-4">Sector Distribution</h3>
          
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <div className="w-full flex justify-center -ml-4">
              <PieChart width={140} height={140}>
                <Pie data={SECTOR_DIST} cx={70} cy={70} innerRadius={35} outerRadius={60} stroke="none" dataKey="value" paddingAngle={1}>
                  {SECTOR_DIST.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
            </div>
            
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-2.5">
              {SECTOR_DIST.map(s => (
                <div key={s.name} className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 w-16">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }}></div>
                    <span className="text-[10px] font-medium text-gray-600">{s.name}</span>
                  </div>
                  <span className="text-[10px] font-medium text-gray-900 text-right w-6">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center text-[11px] text-gray-500 mt-2 font-medium">
            Total: 2,341 Households
          </div>
        </div>

        {/* Top 5 Villages by Risk */}
        <div className="col-span-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col">
          <h3 className="text-[13px] font-bold text-gray-900 mb-4">Top 5 Villages by Risk</h3>
          
          <div className="grid grid-cols-12 text-[10px] font-semibold text-gray-400 mb-2 border-b border-gray-50 pb-2">
            <div className="col-span-4">Village</div>
            <div className="col-span-2 text-center">Health Score</div>
            <div className="col-span-3 text-center">Risk Level</div>
            <div className="col-span-2 text-right">Critical HHs</div>
            <div className="col-span-1 text-right">Trend</div>
          </div>
          
          <div className="flex-1 space-y-3 mt-1">
            {VILLAGES.map((v) => (
              <div key={v.name} className="grid grid-cols-12 items-center text-[11px] border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                <div className="col-span-4 font-medium text-gray-700 truncate pr-2">{v.name}</div>
                <div className="col-span-2 text-center font-bold text-gray-900">{v.score}</div>
                <div className="col-span-3 text-center">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${v.levelColor}`}>{v.level}</span>
                </div>
                <div className="col-span-2 text-right font-medium text-gray-900">{v.hhs}</div>
                <div className="col-span-1 flex justify-end">
                  <ArrowUpRight size={12} className="text-red-500" />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-auto pt-3 border-t border-gray-100">
            <button className="text-[12px] font-bold text-indigo-600 hover:text-indigo-700 w-full text-left flex justify-between items-center">
              View all villages <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-12 gap-4">
        {/* Key District Metrics */}
        <div className="col-span-8 bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col">
          <h3 className="text-[13px] font-bold text-gray-900 mb-4">Key District Metrics</h3>
          
          <div className="grid grid-cols-12 text-[10px] font-semibold text-gray-400 mb-3 border-b border-gray-50 pb-2">
            <div className="col-span-3">Metric</div>
            <div className="col-span-2 text-center">Current</div>
            <div className="col-span-2 text-center">vs Last Month</div>
            <div className="col-span-2 text-center">vs Last Quarter</div>
            <div className="col-span-2 text-center">vs Last Year</div>
            <div className="col-span-1 text-center">Trend (12M)</div>
          </div>
          
          <div className="space-y-4">
            {METRICS.map((m) => (
              <div key={m.metric} className="grid grid-cols-12 items-center text-[12px] border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <div className="col-span-3 font-medium text-gray-700">{m.metric}</div>
                <div className="col-span-2 text-center font-bold text-gray-900">{m.current}</div>
                <div className={`col-span-2 text-center font-medium ${m.lastMUp ? 'text-green-600' : 'text-red-500'}`}>{m.lastMUp ? '↑' : '↓'} {m.lastM.replace(/^[+-]\s/,'')}</div>
                <div className={`col-span-2 text-center font-medium ${m.lastQUp ? 'text-green-600' : 'text-red-500'}`}>{m.lastQUp ? '↑' : '↓'} {m.lastQ.replace(/^[+-]\s/,'')}</div>
                <div className={`col-span-2 text-center font-medium ${m.lastYUp ? 'text-green-600' : 'text-red-500'}`}>{m.lastYUp ? '↑' : '↓'} {m.lastY.replace(/^[+-]\s/,'')}</div>
                <div className="col-span-1 flex justify-center">
                  <Sparkline />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Schemes by Reach */}
        <div className="col-span-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col">
          <h3 className="text-[13px] font-bold text-gray-900 mb-4">Top 5 Schemes by Reach</h3>
          
          <div className="grid grid-cols-12 text-[10px] font-semibold text-gray-400 mb-3 border-b border-gray-50 pb-2">
            <div className="col-span-5">Scheme</div>
            <div className="col-span-3 text-right">Households</div>
            <div className="col-span-2 text-right">Coverage %</div>
            <div className="col-span-2 text-right">vs Last Month</div>
          </div>
          
          <div className="space-y-4">
            {SCHEMES.map((s) => (
              <div key={s.name} className="grid grid-cols-12 items-center text-[11px] border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <div className="col-span-5 font-medium text-gray-700 leading-tight pr-2">{s.name}</div>
                <div className="col-span-3 text-right font-medium text-gray-900">{s.hhs}</div>
                <div className="col-span-2 text-right font-medium text-gray-900">{s.cov}</div>
                <div className="col-span-2 text-right font-medium text-green-600">↑ {s.trend.replace('+ ','')}</div>
              </div>
            ))}
          </div>
          
          <div className="mt-auto pt-4 border-t border-gray-100">
            <button className="text-[12px] font-bold text-indigo-600 hover:text-indigo-700 w-full text-left flex justify-between items-center">
              View all schemes <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
