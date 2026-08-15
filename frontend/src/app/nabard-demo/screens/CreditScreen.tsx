"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const CREDIT_DATA = [
  { month: 'Jun', healthy: 480, atRisk: 220, npa: 100 },
  { month: 'Jul', healthy: 500, atRisk: 230, npa: 105 },
  { month: 'Aug', healthy: 530, atRisk: 240, npa: 108 },
  { month: 'Sep', healthy: 560, atRisk: 250, npa: 110 },
  { month: 'Oct', healthy: 590, atRisk: 265, npa: 115 },
  { month: 'Nov', healthy: 620, atRisk: 280, npa: 120 },
  { month: 'Dec', healthy: 660, atRisk: 300, npa: 128 },
  { month: 'Jan', healthy: 710, atRisk: 320, npa: 130 },
  { month: 'Feb', healthy: 770, atRisk: 340, npa: 135 },
  { month: 'Mar', healthy: 830, atRisk: 360, npa: 140 },
  { month: 'Apr', healthy: 890, atRisk: 375, npa: 145 },
  { month: 'May', healthy: 960, atRisk: 390, npa: 148 },
];

const NPA = [
  { name: 'Jalgaon',    pct: 7.3 },
  { name: 'Aurangabad', pct: 6.9 },
  { name: 'Nashik',     pct: 5.2 },
  { name: 'Ahmednagar', pct: 5.8 },
  { name: 'Pune Rural', pct: 4.8 },
];

export default function CreditScreen() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900">Credit Dashboard</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">Credit health and NPA tracking · Maharashtra</p>
        </div>
        <select className="border border-gray-100 rounded-xl px-3 py-1.5 text-[12px] text-gray-700 bg-white">
          <option>This Quarter</option><option>Last Quarter</option><option>YTD</option>
        </select>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Disbursed',   value: '₹456 Cr',  delta: '+5.1%',  good: true  },
          { label: 'Outstanding',       value: '₹1,856 Cr', delta: '+13%',  good: true  },
          { label: 'Repayment Rate',    value: '91%',       delta: '-3%',   good: false },
          { label: 'NPA',               value: '6.8%',      delta: '+1.3%', good: false, bad: true },
        ].map(k => (
          <div key={k.label} className="bg-white border border-gray-100/40 rounded-[24px] p-4 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
            <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">{k.label}</div>
            <div className="text-[24px] font-bold text-gray-900">{k.value}</div>
            <div className={`text-[11px] font-medium mt-1 ${
              k.bad ? 'text-red-600' : k.good ? 'text-green-600' : 'text-red-500'
            }`}>
              {k.delta} vs last quarter
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-12 gap-4">
        {/* Area chart */}
        <div className="col-span-8 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[13px] font-bold text-gray-800">Credit Outstanding Trend (₹ Cr)</div>
            <div className="flex items-center gap-3 text-[10px] text-gray-500">
              <div className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-green-400 inline-block" />Healthy</div>
              <div className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-amber-300 inline-block" />At Risk</div>
              <div className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-red-300 inline-block" />NPA</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={CREDIT_DATA} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
              <defs>
                {[['cHealthy','#16a34a'],['cRisk','#f59e0b'],['cNpa','#ef4444']].map(([id, color]) => (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.03} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }} formatter={(v: any) => [`₹${v}Cr`, '']} />
              <Area type="monotone" dataKey="healthy" stroke="#16a34a" fill="url(#cHealthy)" strokeWidth={2} stackId="1" />
              <Area type="monotone" dataKey="atRisk"  stroke="#f59e0b" fill="url(#cRisk)"   strokeWidth={2} stackId="1" />
              <Area type="monotone" dataKey="npa"     stroke="#ef4444" fill="url(#cNpa)"    strokeWidth={2} stackId="1" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* NPA by district */}
        <div className="col-span-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="text-[13px] font-bold text-gray-800 mb-4">NPA by District</div>
          <div className="space-y-3">
            {NPA.sort((a,b) => b.pct - a.pct).map(d => (
              <div key={d.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-[12px] text-gray-700 font-medium">{d.name}</span>
                  <span className={`text-[12px] font-bold ${d.pct >= 7 ? 'text-red-600' : d.pct >= 5.5 ? 'text-amber-600' : 'text-green-700'}`}>{d.pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${d.pct >= 7 ? 'bg-red-500' : d.pct >= 5.5 ? 'bg-amber-400' : 'bg-green-500'}`}
                    style={{ width: `${d.pct * 10}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
