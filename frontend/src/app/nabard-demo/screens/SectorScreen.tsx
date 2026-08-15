"use client";

import React from 'react';

const SECTORS = [
  { name: 'Dairy',           score: 78, trend: [65, 68, 72, 74, 76, 78], alerts: 3, enterprises: 18400, color: '#16a34a' },
  { name: 'Poultry',         score: 43, trend: [72, 68, 61, 55, 48, 43], alerts: 7, enterprises: 9200,  color: '#ef4444' },
  { name: 'Retail',          score: 71, trend: [68, 70, 71, 69, 71, 71], alerts: 1, enterprises: 22100, color: '#16a34a' },
  { name: 'Agriculture',     score: 68, trend: [65, 67, 66, 67, 68, 68], alerts: 2, enterprises: 31200, color: '#f59e0b' },
  { name: 'Fishery',         score: 66, trend: [60, 62, 64, 65, 66, 66], alerts: 0, enterprises: 6800,  color: '#f59e0b' },
  { name: 'Food Processing', score: 74, trend: [68, 70, 72, 72, 74, 74], alerts: 0, enterprises: 8400,  color: '#16a34a' },
];

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80, h = 28;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SectorScreen() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900">Sector Dashboard</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">Sector-wise health comparison · Maharashtra</p>
        </div>
        <select className="border border-gray-100 rounded-xl px-3 py-1.5 text-[12px] text-gray-700 bg-white">
          <option>This Quarter</option><option>Last Month</option><option>Last Quarter</option><option>YTD</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {SECTORS.map(s => {
          const isAlert = s.score < 55;
          return (
            <div key={s.name}
              className={`bg-white rounded-xl border shadow-sm p-4 relative ${isAlert ? 'border-red-200' : 'border-gray-100'}`}>
              {/* Left border accent */}
              <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r" style={{ background: s.color }} />

              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-[13px] font-bold text-gray-900">{s.name}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{s.enterprises.toLocaleString()} enterprises</div>
                </div>
                {s.alerts > 0 && (
                  <span className="text-[9px] font-bold bg-red-500 text-white rounded-full px-2 py-0.5">
                    {s.alerts} alerts
                  </span>
                )}
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[10px] text-gray-400 mb-0.5">Avg. Health</div>
                  <div className="text-[32px] font-bold leading-none" style={{ color: s.color }}>{s.score}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Sparkline data={s.trend} color={s.color} />
                  <div className="text-[9px] font-medium" style={{ color: s.color }}>
                    {s.trend[s.trend.length - 1] > s.trend[0] ? '↑ Improving' : s.trend[s.trend.length - 1] < s.trend[0] ? '↓ Declining' : '→ Stable'}
                  </div>
                </div>
              </div>

              {/* Health mini bar */}
              <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${s.score}%`, background: s.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
