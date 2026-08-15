"use client";

import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, ResponsiveContainer } from 'recharts';
import farm_satellite_bg from '../../../assests/images/farm_satellite_bg.png';
import { MapPin, ChevronRight } from 'lucide-react';

const HEALTH_TREND = [
  { month: 'Aug', score: 70 }, { month: 'Sep', score: 72 }, { month: 'Oct', score: 69 },
  { month: 'Nov', score: 64 }, { month: 'Dec', score: 62 }, { month: 'Jan', score: 65 },
  { month: 'Feb', score: 66 }, { month: 'Mar', score: 66 }, { month: 'Apr', score: 67 },
  { month: 'May', score: 65 },
];

const SECTOR_PIE = [
  { name: 'Dairy',       value: 42, color: '#16a34a' },
  { name: 'Poultry',     value: 19, color: '#f59e0b' },
  { name: 'Retail',      value: 18, color: '#3b82f6' },
  { name: 'Agriculture', value: 12, color: '#8b5cf6' },
  { name: 'Others',      value: 9,  color: '#d1d5db' },
];

// District data generator for state drill-down
const STATE_DISTRICTS: Record<string, Array<{ name: string; health: number; critical: number; trend: string }>> = {
  "Maharashtra": [
    { name: 'Nashik',      health: 81, critical: 18, trend: 'down' },
    { name: 'Pune',        health: 86, critical: 12, trend: 'up' },
    { name: 'Ahmednagar',  health: 72, critical: 15, trend: 'flat' },
    { name: 'Thane',       health: 78, critical: 8,  trend: 'up' },
    { name: 'Nagpur',      health: 65, critical: 22, trend: 'down' },
    { name: 'Solapur',     health: 68, critical: 14, trend: 'flat' },
  ],
  "Gujarat": [
    { name: 'Ahmedabad',   health: 84, critical: 10, trend: 'up' },
    { name: 'Surat',       health: 82, critical: 14, trend: 'up' },
    { name: 'Vadodara',    health: 76, critical: 11, trend: 'flat' },
    { name: 'Rajkot',      health: 73, critical: 16, trend: 'down' },
    { name: 'Kutch',       health: 62, critical: 24, trend: 'down' },
  ],
  "Rajasthan": [
    { name: 'Jaipur',      health: 75, critical: 14, trend: 'up' },
    { name: 'Jodhpur',     health: 68, critical: 18, trend: 'flat' },
    { name: 'Udaipur',     health: 70, critical: 15, trend: 'up' },
    { name: 'Kota',        health: 62, critical: 20, trend: 'down' },
  ],
  "Madhya Pradesh": [
    { name: 'Indore',      health: 79, critical: 12, trend: 'up' },
    { name: 'Bhopal',      health: 74, critical: 15, trend: 'flat' },
    { name: 'Gwalior',     health: 61, critical: 22, trend: 'down' },
    { name: 'Ujjain',      health: 67, critical: 18, trend: 'flat' },
  ],
};

const DEFAULT_DISTRICTS = [
  { name: 'Central District', health: 74, critical: 12, trend: 'up' },
  { name: 'North District',   health: 68, critical: 16, trend: 'flat' },
  { name: 'South District',   health: 62, critical: 21, trend: 'down' },
  { name: 'East District',    health: 79, critical: 9,  trend: 'up' },
];

const STATES = [
  { id: 'MH', geoName: 'Maharashtra',          score: 72, enterprises: 18562, healthy: 2341, critical: 1056 },
  { id: 'GJ', geoName: 'Gujarat',              score: 78, enterprises: 14200, healthy: 3200, critical: 680  },
  { id: 'RJ', geoName: 'Rajasthan',            score: 64, enterprises: 12100, healthy: 1800, critical: 1200 },
  { id: 'MP', geoName: 'Madhya Pradesh',       score: 61, enterprises: 16400, healthy: 1600, critical: 1800 },
  { id: 'UP', geoName: 'Uttar Pradesh',        score: 58, enterprises: 22100, healthy: 2100, critical: 2800 },
  { id: 'BR', geoName: 'Bihar',               score: 52, enterprises: 18200, healthy: 1400, critical: 3100 },
  { id: 'OR', geoName: 'Odisha',              score: 67, enterprises: 9800,  healthy: 1700, critical: 900  },
  { id: 'KA', geoName: 'Karnataka',           score: 75, enterprises: 13400, healthy: 2800, critical: 720  },
  { id: 'TN', geoName: 'Tamil Nadu',          score: 71, enterprises: 11200, healthy: 2100, critical: 820  },
  { id: 'AP', geoName: 'Andhra Pradesh',      score: 66, enterprises: 10800, healthy: 1900, critical: 1100 },
  { id: 'TS', geoName: 'Telangana',           score: 69, enterprises: 9200,  healthy: 1800, critical: 980  },
  { id: 'WB', geoName: 'West Bengal',         score: 59, enterprises: 15600, healthy: 1700, critical: 2200 },
  { id: 'HR', geoName: 'Haryana',             score: 73, enterprises: 8900,  healthy: 1900, critical: 680  },
  { id: 'PB', geoName: 'Punjab',              score: 76, enterprises: 7800,  healthy: 1800, critical: 520  },
  { id: 'JK', geoName: 'Jammu and Kashmir',   score: 63, enterprises: 4200,  healthy: 900,  critical: 680  },
  { id: 'LA', geoName: 'Ladakh',              score: 66, enterprises: 800,   healthy: 200,  critical: 120  },
  { id: 'HP', geoName: 'Himachal Pradesh',    score: 74, enterprises: 3100,  healthy: 820,  critical: 310  },
  { id: 'UK', geoName: 'Uttarakhand',         score: 70, enterprises: 4800,  healthy: 1100, critical: 480  },
  { id: 'JH', geoName: 'Jharkhand',           score: 55, enterprises: 6200,  healthy: 980,  critical: 1200 },
  { id: 'CG', geoName: 'Chhattisgarh',        score: 58, enterprises: 7400,  healthy: 1100, critical: 1400 },
  { id: 'KL', geoName: 'Kerala',              score: 77, enterprises: 8600,  healthy: 2200, critical: 480  },
  { id: 'AS', geoName: 'Assam',               score: 60, enterprises: 5800,  healthy: 1000, critical: 1100 },
  { id: 'MN', geoName: 'Manipur',             score: 54, enterprises: 1200,  healthy: 280,  critical: 320  },
  { id: 'ML', geoName: 'Meghalaya',           score: 62, enterprises: 1400,  healthy: 340,  critical: 280  },
  { id: 'NL', geoName: 'Nagaland',            score: 56, enterprises: 980,   healthy: 210,  critical: 260  },
  { id: 'TR', geoName: 'Tripura',             score: 61, enterprises: 1100,  healthy: 240,  critical: 240  },
  { id: 'MZ', geoName: 'Mizoram',             score: 59, enterprises: 720,   healthy: 160,  critical: 190  },
  { id: 'AR', geoName: 'Arunachal Pradesh',   score: 57, enterprises: 860,   healthy: 180,  critical: 210  },
  { id: 'SK', geoName: 'Sikkim',              score: 68, enterprises: 420,   healthy: 110,  critical: 80   },
  { id: 'DL', geoName: 'Delhi',               score: 65, enterprises: 5200,  healthy: 1100, critical: 820  },
  { id: 'GA', geoName: 'Goa',                 score: 71, enterprises: 980,   healthy: 240,  critical: 120  },
];

type StateEntry = (typeof STATES)[0];

const STATE_BY_GEONAME: Record<string, StateEntry> = {};
STATES.forEach(s => { STATE_BY_GEONAME[s.geoName] = s; });

function scoreToFill(score: number | undefined, isSelected: boolean) {
  if (isSelected) return '#15803d'; // Highlight selected state in dark green
  if (score === undefined) return '#e2e8f0';
  if (score >= 75) return '#bbf7d0';
  if (score >= 65) return '#86efac';
  if (score >= 55) return '#fde68a';
  if (score >= 45) return '#fca5a5';
  return '#f87171';
}

function scoreToHover(score: number | undefined) {
  if (score === undefined) return '#cbd5e1';
  if (score >= 75) return '#4ade80';
  if (score >= 65) return '#22c55e';
  if (score >= 55) return '#f59e0b';
  if (score >= 45) return '#f97316';
  return '#ef4444';
}

function TrendArrow({ trend }: { trend: string }) {
  if (trend === 'up')   return <span className="text-green-600 font-bold">↑</span>;
  if (trend === 'down') return <span className="text-red-500 font-bold">↓</span>;
  return <span className="text-gray-400 font-bold">→</span>;
}

function HealthBar({ score }: { score: number }) {
  const color = score >= 70 ? '#16a34a' : score >= 55 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-center gap-2">
      <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-[11px] font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

export default function GeographyScreen() {
  const [selected, setSelected] = useState<StateEntry>(STATES[0]);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; score?: number } | null>(null);

  const activeDistricts = STATE_DISTRICTS[selected.geoName] || DEFAULT_DISTRICTS;

  return (
    <div className="space-y-4">
      {/* HERO BANNER */}
      <div className="relative w-full rounded-[24px] overflow-hidden p-8 flex flex-col justify-between shadow-sm mb-6"
           style={{ 
             backgroundImage: `url(${farm_satellite_bg.src})`, 
             backgroundSize: 'cover', 
             backgroundPosition: 'center center',
             minHeight: '200px' 
           }}>
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]"></div>
        <div className="relative z-10 w-[70%] max-w-[950px]">
          <h1 className="text-[28px] font-bold text-gray-900 mb-1">Regional Distribution</h1>
          <p className="text-[14px] text-gray-800 font-medium mb-8">Geospatial risk mapping and district-level exposure analysis.</p>
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/50 p-5 flex items-center gap-4 w-fit">
             <div className="bg-blue-100 p-2 rounded-xl"><MapPin size={20} className="text-blue-600" /></div>
             <div>
               <div className="text-[14px] font-bold text-gray-900">Highest Exposure</div>
               <div className="text-[12px] text-gray-600 font-medium">Nashik district represents 38% of total portfolio exposure.</div>
             </div>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex items-center justify-end mb-4">
        <div className="flex gap-2">
          <select 
            className="border border-gray-100 rounded-xl px-3 py-1.5 text-[12px] text-gray-700 bg-white focus:outline-none cursor-pointer"
            value={selected.geoName}
            onChange={(e) => {
              const st = STATE_BY_GEONAME[e.target.value];
              if (st) setSelected(st);
            }}
          >
            {STATES.map(s => <option key={s.geoName} value={s.geoName}>{s.geoName}</option>)}
          </select>
          <select className="border border-gray-100 rounded-xl px-3 py-1.5 text-[12px] text-gray-700 bg-white focus:outline-none">
            <option>Health Score</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left Panel: Whole India Map */}
        <div className="col-span-7 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden relative" style={{ minHeight: 460 }}>
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 1050, center: [82.5, 22.5] }}
            style={{ width: '100%', height: '100%' }}
            height={460}
          >
            <Geographies geography="/india-states.topojson">
              {({ geographies }) =>
                geographies.map((geo) => {
                  const name: string = geo.properties.name;
                  const state = STATE_BY_GEONAME[name];
                  const isSelected = selected.geoName === name;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => { if (state) setSelected(state); }}
                      onMouseEnter={(e: React.MouseEvent<SVGPathElement>) => {
                        const svg = (e.target as SVGElement).closest('svg');
                        if (!svg) return;
                        const rect = svg.getBoundingClientRect();
                        setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, name, score: state?.score });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      style={{
                        default: { fill: scoreToFill(state?.score, isSelected), stroke: '#fff', strokeWidth: 0.6, outline: 'none' },
                        hover:   { fill: isSelected ? '#15803d' : scoreToHover(state?.score), stroke: '#fff', strokeWidth: 0.6, outline: 'none', cursor: state ? 'pointer' : 'default' },
                        pressed: { fill: '#15803d', outline: 'none' },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>

          {/* Hover Tooltip */}
          {tooltip && (
            <div
              className="pointer-events-none absolute z-20 bg-gray-900 text-white text-[11px] rounded-xl px-3 py-2 shadow-xl"
              style={{ left: tooltip.x + 14, top: tooltip.y - 14 }}
            >
              <div className="font-semibold">{tooltip.name}</div>
              {tooltip.score !== undefined
                ? <div className="text-gray-300 text-[10px]">Health: <span className="text-white font-bold">{tooltip.score}</span></div>
                : <div className="text-gray-400 text-[10px]">No NABARD data</div>
              }
            </div>
          )}

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-xl border border-gray-100 shadow-sm px-3 py-2.5">
            <div className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Health Score</div>
            {[
              { color: '#15803d', label: 'Selected State' },
              { color: '#22c55e', label: '75 – 100' },
              { color: '#86efac', label: '65 – 75'  },
              { color: '#fde68a', label: '55 – 65'  },
              { color: '#fca5a5', label: '45 – 55'  },
              { color: '#f87171', label: '0 – 45'   },
              { color: '#e2e8f0', label: 'No data'  },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2 mb-0.5">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: color }} />
                <span className="text-[10px] text-gray-600">{label}</span>
              </div>
            ))}
          </div>

          <div className="absolute bottom-4 right-4 flex flex-col gap-1">
            <button className="w-7 h-7 bg-white rounded border border-gray-100 text-gray-600 text-sm flex items-center justify-center shadow-sm hover:bg-gray-50">+</button>
            <button className="w-7 h-7 bg-white rounded border border-gray-100 text-gray-600 text-sm flex items-center justify-center shadow-sm hover:bg-gray-50">−</button>
          </div>
        </div>

        {/* Right Panel: District-level Data for Selected State */}
        <div className="col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] text-gray-400">India</span>
              <ChevronRight size={10} className="text-gray-300" />
              <span className="text-[11px] font-bold text-gray-800">{selected.geoName}</span>
            </div>
            <div className="text-[15px] font-bold text-gray-900 mb-3">{selected.geoName} Overview</div>
            <div className="grid grid-cols-2 gap-2.5 mb-3">
              {[
                { label: 'Enterprises',      value: selected.enterprises.toLocaleString() },
                { label: 'Avg. Health Score',value: String(selected.score), sub: '↑ 2.3% vs last month', subColor: 'text-green-600' },
                { label: 'Healthy',          value: selected.healthy.toLocaleString() },
                { label: 'Critical',         value: selected.critical.toLocaleString(), valueColor: 'text-red-600' },
              ].map((item: any) => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-2.5">
                  <div className="text-[10px] text-gray-400">{item.label}</div>
                  <div className={`text-[18px] font-bold mt-0.5 ${item.valueColor || 'text-gray-900'}`}>{item.value}</div>
                  {item.sub && <div className={`text-[9px] mt-0.5 ${item.subColor}`}>{item.sub}</div>}
                </div>
              ))}
            </div>
            <div className="text-[11px] font-medium text-gray-600 mb-1.5">Health Trend (Last 10 Months)</div>
            <ResponsiveContainer width="100%" height={65}>
              <LineChart data={HEALTH_TREND} margin={{ top: 2, right: 4, bottom: 0, left: -30 }}>
                <XAxis dataKey="month" tick={{ fontSize: 8, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Line type="monotone" dataKey="score" stroke="#16a34a" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="text-[12px] font-bold text-gray-800 mb-3">Sector Distribution in {selected.geoName}</div>
            <div className="flex items-center gap-3">
              <PieChart width={90} height={90}>
                <Pie data={SECTOR_PIE} cx={40} cy={40} outerRadius={38} innerRadius={22} dataKey="value" stroke="none">
                  {SECTOR_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
              <div className="flex-1 space-y-1.5">
                {SECTOR_PIE.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="text-[10px] text-gray-600 flex-1">{d.name}</span>
                    <span className="text-[10px] font-bold text-gray-800">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* District Level Data Panel for Selected State */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="text-[12px] font-bold text-gray-800">Districts in {selected.geoName}</div>
              <span className="text-[10px] text-gray-400 font-medium">{activeDistricts.length} Districts</span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  {['District', 'Health Score', 'Critical', 'Trend'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-[9px] font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activeDistricts.map(dist => (
                  <tr key={dist.name} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-[11px] font-medium text-gray-800">{dist.name}</td>
                    <td className="px-3 py-2"><HealthBar score={dist.health} /></td>
                    <td className="px-3 py-2 text-[11px] font-bold text-red-500">{dist.critical}</td>
                    <td className="px-3 py-2"><TrendArrow trend={dist.trend} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2.5 border-t border-gray-100">
              <button className="text-[11px] text-green-700 font-semibold hover:underline flex items-center gap-1">
                View all districts in {selected.geoName} <ChevronRight size={11} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
