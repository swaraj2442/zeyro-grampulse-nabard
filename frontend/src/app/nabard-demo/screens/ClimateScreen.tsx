"use client";

import React, { useState } from 'react';

const DISTRICTS = [
  { name: 'Nashik',      risk: 'High Deficit', color: '#ef4444', bg: '#fef2f2', enterprises: 2341 },
  { name: 'Jalgaon',     risk: 'Deficit',      color: '#f59e0b', bg: '#fffbeb', enterprises: 1876 },
  { name: 'Aurangabad',  risk: 'Deficit',      color: '#f59e0b', bg: '#fffbeb', enterprises: 2104 },
  { name: 'Dhule',       risk: 'Normal',        color: '#3b82f6', bg: '#eff6ff', enterprises: 1432 },
  { name: 'Ahmednagar',  risk: 'Normal',        color: '#3b82f6', bg: '#eff6ff', enterprises: 1987 },
  { name: 'Pune Rural',  risk: 'High Surplus',  color: '#16a34a', bg: '#f0fdf4', enterprises: 2540 },
  { name: 'Satara',      risk: 'Surplus',       color: '#22c55e', bg: '#f0fdf4', enterprises: 1123 },
  { name: 'Solapur',     risk: 'Deficit',       color: '#f59e0b', bg: '#fffbeb', enterprises: 1654 },
];

const TOGGLE_OPTIONS = ['Rainfall Anomaly', 'Temperature', 'Flood Risk', 'Drought Index'];
const TIME_OPTIONS   = ['Next 16 Days', 'Next Month', 'Seasonal (3 months)'];

export default function ClimateScreen() {
  const [activeToggle, setActiveToggle] = useState('Rainfall Anomaly');
  const [activeTime, setActiveTime]     = useState('Next 16 Days');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900">Climate Intelligence</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">Rainfall anomaly & district risk · Maharashtra</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="border border-gray-100 rounded-xl px-3 py-1.5 text-[12px] text-gray-700 bg-white"
            value={activeToggle} onChange={e => setActiveToggle(e.target.value)}>
            {TOGGLE_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
          <select className="border border-gray-100 rounded-xl px-3 py-1.5 text-[12px] text-gray-700 bg-white"
            value={activeTime} onChange={e => setActiveTime(e.target.value)}>
            {TIME_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Impacted Enterprises',              value: '2,857', color: 'text-gray-900'  },
          { label: 'High Risk (Rainfall Deficit)',      value: '1,043', color: 'text-red-600'   },
          { label: 'Moderate Risk',                     value: '1,614', color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-100/40 rounded-[24px] p-4 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
            <div className="text-[11px] text-gray-400 mb-1">{s.label}</div>
            <div className={`text-[26px] font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* District map/list */}
        <div className="col-span-8 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="text-[12px] font-bold text-gray-800">Maharashtra Districts — {activeToggle}</div>
            <div className="flex items-center gap-3">
              {[['#16a34a', 'High Surplus'], ['#3b82f6', 'Normal'], ['#f59e0b', 'Deficit'], ['#ef4444', 'High Deficit']].map(([color, label]) => (
                <div key={label} className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
                  <span className="text-[9px] text-gray-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 p-4">
            {DISTRICTS.map(d => (
              <div key={d.name} className="rounded-xl p-3 border transition-all cursor-pointer hover:shadow-md"
                style={{ borderColor: d.color, background: d.bg }}>
                <div className="text-[12px] font-bold text-gray-900 mb-1">{d.name}</div>
                <div className="text-[10px] font-medium" style={{ color: d.color }}>{d.risk}</div>
                <div className="text-[9px] text-gray-400 mt-1">{d.enterprises.toLocaleString()} enterprises</div>
              </div>
            ))}
          </div>
        </div>

        {/* IMD Data panel */}
        <div className="col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="text-[12px] font-bold text-gray-800 mb-3">IMD Forecast — Next 16 Days</div>
            <div className="space-y-2.5">
              {[
                { label: 'Nashik',     anomaly: '-32%', level: 'High Deficit',  color: 'text-red-600',   bar: 'bg-red-400'   },
                { label: 'Jalgaon',    anomaly: '-18%', level: 'Deficit',       color: 'text-amber-600', bar: 'bg-amber-400' },
                { label: 'Aurangabad', anomaly: '-12%', level: 'Deficit',       color: 'text-amber-600', bar: 'bg-amber-400' },
                { label: 'Dhule',      anomaly: '+2%',  level: 'Normal',        color: 'text-blue-600',  bar: 'bg-blue-400'  },
                { label: 'Pune Rural', anomaly: '+14%', level: 'Surplus',       color: 'text-green-600', bar: 'bg-green-400' },
              ].map(r => (
                <div key={r.label} className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-700 w-20 font-medium">{r.label}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${r.bar}`}
                      style={{ width: `${Math.abs(parseInt(r.anomaly)) * 2 + 10}%` }} />
                  </div>
                  <span className={`text-[10px] font-bold ${r.color} w-10 text-right`}>{r.anomaly}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <div className="text-[11px] font-bold text-red-700 mb-2">⚠ NDMA Alerts</div>
            <div className="space-y-1.5">
              <p className="text-[11px] text-red-800">IMD: Moderate rainfall deficit forecast — Aug 2026</p>
              <p className="text-[11px] text-gray-500">No active flood/drought warning</p>
              <p className="text-[11px] text-gray-500">Post-monsoon lean period for dairy begins Sep</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
