"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('../components/LeafletMap'), { ssr: false });

const STATES = [
  { id: 'MH', geoName: 'Maharashtra', score: 68 },
  { id: 'GJ', geoName: 'Gujarat', score: 78 },
  { id: 'MP', geoName: 'Madhya Pradesh', score: 55 },
  { id: 'KA', geoName: 'Karnataka', score: 45 },
];
const STATE_BY_GEONAME: Record<string, any> = {};
STATES.forEach(s => { STATE_BY_GEONAME[s.geoName] = s; });

const STATE_DISTRICTS: Record<string, any[]> = {
  "Maharashtra": [
    { name: 'Nashik', health: 42 },
    { name: 'Pune', health: 65 },
    { name: 'Aurangabad', health: 30 },
    { name: 'Beed', health: 25 },
  ]
};

function scoreToFill(score) {
  if (score === undefined) return '#e2e8f0';
  if (score >= 75) return '#22c55e';
  if (score >= 60) return '#facc15';
  if (score >= 40) return '#fb923c';
  return '#ef4444';
}

function scoreToHover(score) {
  if (score === undefined) return '#cbd5e1';
  if (score >= 75) return '#16a34a'; 
  if (score >= 60) return '#eab308'; 
  if (score >= 40) return '#f97316'; 
  return '#dc2626'; 
}

import { 
  Filter, Download, RefreshCw, User, MapPin, BellRing, CheckCircle, Shield, 
  Activity, Users, ListTodo, CheckSquare, Clock, Target, MoreVertical, 
  AlertTriangle, Calendar, Map, Check, TrendingUp, UserPlus, FileText, ArrowRight
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Screen } from '../GramPulseApp';

interface Props {
  navigateTo: (s: Screen, ent?: string) => void;
}

// --- MOCK DATA ---
const SPARKLINE_DATA_1 = [{val: 20}, {val: 25}, {val: 22}, {val: 30}, {val: 28}, {val: 35}];
const SPARKLINE_DATA_2 = [{val: 40}, {val: 35}, {val: 50}, {val: 45}, {val: 60}, {val: 55}];
const SPARKLINE_DATA_3 = [{val: 10}, {val: 15}, {val: 12}, {val: 18}, {val: 15}, {val: 20}];

const OFFICER_PROFILES = [
  { name: 'Rahul More', loc: 'Kolhapur', status: 'On Visit', color: 'bg-green-100 text-green-700', ent: 18, vis: 7, tasks: 3, prod: 82, sla: 94, rating: 'A', rColor: 'text-green-600 border-green-200 bg-green-50' },
  { name: 'Sneha Jadhav', loc: 'Pune', status: 'Available', color: 'bg-blue-100 text-blue-700', ent: 22, vis: 6, tasks: 4, prod: 76, sla: 90, rating: 'B', rColor: 'text-blue-600 border-blue-200 bg-blue-50' },
  { name: 'Anil Patil', loc: 'Satara', status: 'Offline', color: 'bg-gray-100 text-gray-700', ent: 16, vis: 2, tasks: 6, prod: 58, sla: 72, rating: 'C', rColor: 'text-orange-600 border-orange-200 bg-orange-50' },
  { name: 'Priya S.', loc: 'Solapur', status: 'On Visit', color: 'bg-green-100 text-green-700', ent: 20, vis: 8, tasks: 2, prod: 87, sla: 96, rating: 'A', rColor: 'text-green-600 border-green-200 bg-green-50' },
];

const TERRITORY_DATA = [
  { dist: 'Kolhapur', off: 24, ent: '1,248', cov: '92%', risk: 'Low', rColor: 'text-green-600' },
  { dist: 'Pune', off: 36, ent: '2,104', cov: '88%', risk: 'Low', rColor: 'text-green-600' },
  { dist: 'Satara', off: 18, ent: '892', cov: '76%', risk: 'Medium', rColor: 'text-orange-500' },
  { dist: 'Solapur', off: 20, ent: '1,132', cov: '70%', risk: 'Medium', rColor: 'text-orange-500' },
  { dist: 'Sangli', off: 16, ent: '784', cov: '62%', risk: 'High', rColor: 'text-red-500' },
  { dist: 'Beed', off: 12, ent: '512', cov: '58%', risk: 'High', rColor: 'text-red-500' },
  { dist: 'Latur', off: 10, ent: '468', cov: '54%', risk: 'High', rColor: 'text-red-500' },
  { dist: 'Others', off: 110, ent: '3,248', cov: '68%', risk: 'Medium', rColor: 'text-orange-500' },
];

const INSIGHTS = [
  { text: 'Kolhapur and Satara districts need additional officers to improve coverage.', conf: '92%', impact: 'High', iColor: 'text-red-600 bg-red-50' },
  { text: 'Rahul More has high workload. Consider redistributing 4 enterprises.', conf: '88%', impact: 'Medium', iColor: 'text-orange-600 bg-orange-50' },
  { text: '12 interventions are delayed due to pending follow-ups.', conf: '85%', impact: 'High', iColor: 'text-red-600 bg-red-50' },
  { text: 'Route optimization can save 18% travel time across 6 districts.', conf: '83%', impact: 'Medium', iColor: 'text-orange-600 bg-orange-50' },
  { text: 'SLA risk predicted for 35 cases in next 7 days.', conf: '80%', impact: 'High', iColor: 'text-red-600 bg-red-50' },
  { text: 'Anil Patil productivity can improve with targeted training.', conf: '76%', impact: 'Low', iColor: 'text-green-600 bg-green-50' },
];

const DIRECTORY_DATA = [
  { name: 'Rahul More', id: 'OF-00124', dist: 'Kolhapur', ent: 18, tasks: 3, vis: 7, prod: 82, sla: '94%', sync: '10 min ago', status: 'On Visit', sColor: 'text-green-700 bg-green-50' },
  { name: 'Sneha Jadhav', id: 'OF-00137', dist: 'Pune', ent: 22, tasks: 4, vis: 6, prod: 76, sla: '90%', sync: '8 min ago', status: 'Available', sColor: 'text-blue-700 bg-blue-50' },
  { name: 'Anil Patil', id: 'OF-00142', dist: 'Satara', ent: 16, tasks: 6, vis: 2, prod: 58, sla: '72%', sync: '45 min ago', status: 'Offline', sColor: 'text-gray-700 bg-gray-50' },
  { name: 'Priya S.', id: 'OF-00158', dist: 'Solapur', ent: 20, tasks: 2, vis: 8, prod: 87, sla: '96%', sync: '12 min ago', status: 'On Visit', sColor: 'text-green-700 bg-green-50' },
  { name: 'Mahesh K.', id: 'OF-00167', dist: 'Ahmednagar', ent: 25, tasks: 5, vis: 7, prod: 74, sla: '89%', sync: '15 min ago', status: 'Available', sColor: 'text-blue-700 bg-blue-50' },
  { name: 'Vijay Patil', id: 'OF-00171', dist: 'Beed', ent: 14, tasks: 3, vis: 5, prod: 64, sla: '75%', sync: '30 min ago', status: 'Offline', sColor: 'text-gray-700 bg-gray-50' },
  { name: 'Sagar B.', id: 'OF-00185', dist: 'Latur', ent: 12, tasks: 4, vis: 3, prod: 52, sla: '68%', sync: '1 hr ago', status: 'Offline', sColor: 'text-gray-700 bg-gray-50' },
];

const MiniSparkline = ({ data, color }: any) => (
  <div className="h-6 w-16">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line type="monotone" dataKey="val" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const ALL_INDIA = {
  id: 'IN',
  geoName: 'All India',
  score: 68
};

export default function FieldOfficersScreen({ navigateTo }: Props) {
  const [selected, setSelected] = useState(ALL_INDIA);
  const [tooltip, setTooltip] = useState(null);

  return (
    <div className="space-y-6 pb-12 w-full max-w-[1600px] mx-auto overflow-x-hidden">
      
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold text-gray-500 mb-1 flex items-center gap-1">
             Operations <span className="text-gray-300">{">"}</span> <span className="text-gray-900">Field Officers</span>
          </div>
          <h1 className="text-[22px] font-bold text-gray-900 mb-1">Field Officers</h1>
          <p className="text-[12px] text-gray-500">Monitor field force performance, workloads and operational effectiveness.</p>
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

      {/* 1. AI Workforce Summary */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
         <h2 className="text-[13px] font-bold text-gray-900 mb-4">1. AI Workforce Summary</h2>
         <div className="grid grid-cols-6 gap-4">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100"><User size={16} className="text-purple-600" /></div>
               <div>
                  <div className="text-[10px] font-semibold text-gray-500 mb-0.5">Active Field Officers</div>
                  <div className="text-[16px] font-bold text-gray-900 leading-none mb-1">246</div>
                  <div className="text-[10px] font-bold text-green-600">87% <span className="font-semibold text-gray-500">of total</span></div>
               </div>
            </div>
            <div className="flex items-center gap-3 border-l border-gray-100 pl-4">
               <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100"><MapPin size={16} className="text-blue-600" /></div>
               <div>
                  <div className="text-[10px] font-semibold text-gray-500 mb-0.5">Field Visits Today</div>
                  <div className="text-[16px] font-bold text-gray-900 leading-none mb-1">1,842</div>
                  <div className="text-[10px] font-bold text-green-600">↑ 156 <span className="font-semibold text-gray-500">vs yesterday</span></div>
               </div>
            </div>
            <div className="flex items-center gap-3 border-l border-gray-100 pl-4">
               <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 border border-red-100"><BellRing size={16} className="text-red-600" /></div>
               <div>
                  <div className="text-[10px] font-semibold text-gray-500 mb-0.5">Pending Assignments</div>
                  <div className="text-[16px] font-bold text-gray-900 leading-none mb-1">312</div>
                  <div className="text-[10px] font-bold text-red-500">↓ 24 <span className="font-semibold text-gray-500">vs yesterday</span></div>
               </div>
            </div>
            <div className="flex items-center gap-3 border-l border-gray-100 pl-4">
               <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0 border border-green-100"><CheckCircle size={16} className="text-green-600" /></div>
               <div>
                  <div className="text-[10px] font-semibold text-gray-500 mb-0.5">Avg. Productivity Score</div>
                  <div className="text-[16px] font-bold text-gray-900 leading-none mb-1">78.4</div>
                  <div className="text-[10px] font-bold text-green-600">↑ 4.6 pts <span className="font-semibold text-gray-500">vs last week</span></div>
               </div>
            </div>
            <div className="flex items-center gap-3 border-l border-gray-100 pl-4">
               <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100"><Shield size={16} className="text-blue-600" /></div>
               <div>
                  <div className="text-[10px] font-semibold text-gray-500 mb-0.5">SLA Achievement</div>
                  <div className="text-[16px] font-bold text-gray-900 leading-none mb-1">92.3%</div>
                  <div className="text-[10px] font-bold text-green-600">↑ 3.7 pts <span className="font-semibold text-gray-500">vs last week</span></div>
               </div>
            </div>
            <div className="flex items-center gap-3 border-l border-gray-100 pl-4">
               <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100"><Activity size={16} className="text-emerald-600" /></div>
               <div>
                  <div className="text-[10px] font-semibold text-gray-500 mb-0.5">AI Workforce Health</div>
                  <div className="text-[16px] font-bold text-emerald-600 leading-none mb-1">Good</div>
                  <div className="text-[10px] font-semibold text-gray-500">Score: <span className="font-bold text-gray-900">82</span>/100</div>
               </div>
            </div>
         </div>
      </div>

      {/* 2. Field Officer Directory */}

      {/* 2. Field Officer Directory */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
         <div className="flex items-center justify-between mb-4">
            <h2 className="text-[13px] font-bold text-gray-900">2. Field Officer Directory</h2>
            <div className="flex items-center gap-3">
               <button className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 hover:text-gray-800"><Filter size={12}/> Filters</button>
               <button className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 hover:text-gray-800"><Download size={12}/> Export</button>
               <MoreVertical size={14} className="text-gray-400 cursor-pointer" />
            </div>
         </div>
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="border-b border-gray-200">
                  
                  <th className="py-2 text-[11px] font-bold text-gray-500">Officer Name</th>
                  <th className="py-2 text-[11px] font-bold text-gray-500">Employee ID</th>
                  <th className="py-2 text-[11px] font-bold text-gray-500">District</th>
                  <th className="py-2 text-[11px] font-bold text-gray-500 text-center">Assigned Enterprises</th>
                  <th className="py-2 text-[11px] font-bold text-gray-500 text-center">Active Tasks</th>
                  <th className="py-2 text-[11px] font-bold text-gray-500 text-center">Visits Completed</th>
                  <th className="py-2 text-[11px] font-bold text-gray-500 text-center">Productivity Score</th>
                  <th className="py-2 text-[11px] font-bold text-gray-500 text-center">SLA %</th>
                  <th className="py-2 text-[11px] font-bold text-gray-500">Last Sync</th>
                  <th className="py-2 text-[11px] font-bold text-gray-500 text-center">Status</th>
                  <th className="py-2 w-8"></th>
               </tr>
            </thead>
            <tbody>
               {DIRECTORY_DATA.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                     
                     <td className="py-3 flex items-center gap-2">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt={row.name} className="w-6 h-6 rounded-full" />
                        <span className="text-[11px] font-bold text-gray-900">{row.name}</span>
                     </td>
                     <td className="py-3 text-[11px] font-semibold text-gray-600">{row.id}</td>
                     <td className="py-3 text-[11px] font-semibold text-gray-600">{row.dist}</td>
                     <td className="py-3 text-[11px] font-semibold text-gray-600 text-center">{row.ent}</td>
                     <td className="py-3 text-[11px] font-semibold text-gray-600 text-center">{row.tasks}</td>
                     <td className="py-3 text-[11px] font-semibold text-gray-600 text-center">{row.vis}</td>
                     <td className="py-3 text-[11px] font-bold text-green-600 text-center">{row.prod}</td>
                     <td className="py-3 text-[11px] font-bold text-green-600 text-center">{row.sla}</td>
                     <td className="py-3 text-[10px] font-medium text-gray-500">{row.sync}</td>
                     <td className="py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${row.sColor}`}>{row.status}</span>
                     </td>
                     <td className="py-3 text-right"><MoreVertical size={14} className="text-gray-400 cursor-pointer hover:text-gray-700" /></td>
                  </tr>
               ))}
            </tbody>
         </table>
         <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4">
               
               <span className="text-[11px] font-medium text-gray-400">Showing 1 to 7 of 246 officers</span>
            </div>
            <div className="flex items-center gap-1">
               <button className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded text-gray-400 hover:bg-gray-50">{"<"}</button>
               <button className="w-6 h-6 flex items-center justify-center border border-indigo-200 bg-indigo-50 rounded text-indigo-700 text-[10px] font-bold">1</button>
               <button className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded text-gray-600 hover:bg-gray-50 text-[10px] font-bold">2</button>
               <button className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded text-gray-600 hover:bg-gray-50 text-[10px] font-bold">3</button>
               <span className="px-1 text-gray-400">...</span>
               <button className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded text-gray-600 hover:bg-gray-50 text-[10px] font-bold">36</button>
               <button className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded text-gray-600 hover:bg-gray-50">{">"}</button>
               <div className="ml-2 flex items-center gap-1 border border-gray-200 rounded px-2 py-1 cursor-pointer hover:bg-gray-50">
                  <span className="text-[10px] font-bold text-gray-600">10 / page</span>
                  <span className="text-[8px] text-gray-400">▼</span>
               </div>
            </div>
         </div>
      

      {/* Middle Split: Sections 3 & 4 */}
      <div className="grid grid-cols-12 gap-6 items-start">

         {/* 3. Territory Coverage */}
         <div className="col-span-12 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-[13px] font-bold text-gray-900 mb-4">3. Territory Coverage</h2>
            <div className="flex gap-4">
               {/* Map Component */}
               <div className="flex-1 flex flex-col items-center pr-6">
                  <div className="w-full h-[400px] bg-gray-50 border border-gray-100 rounded-xl relative overflow-hidden mb-4">
                     <LeafletMap 
                       selected={selected}
                       setSelected={setSelected}
                       setTooltip={setTooltip}
                       scoreToFill={scoreToFill}
                       scoreToHover={scoreToHover}
                       STATES={STATES}
                       STATE_BY_GEONAME={STATE_BY_GEONAME}
                       STATE_DISTRICTS={STATE_DISTRICTS}
                     />
                     {tooltip && (
                        <div 
                          className="fixed bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-lg pointer-events-none z-[9999] font-bold flex items-center gap-2"
                          style={{ left: tooltip.x + 15, top: tooltip.y + 15 }}
                        >
                          {tooltip.content}
                        </div>
                     )}
                  </div>
                  <div className="flex items-center gap-3 text-[9px] font-bold">
                     <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-red-500"></div><span className="text-gray-600">High Risk</span></div>
                     <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-orange-400"></div><span className="text-gray-600">Medium Risk</span></div>
                     <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-green-500"></div><span className="text-gray-600">Low Risk</span></div>
                  </div>
               </div>
               
               {/* Data Table */}
               <div className="flex-1">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="border-b border-gray-100">
                           <th className="py-2 text-[10px] font-semibold text-gray-400">District</th>
                           <th className="py-2 text-[10px] font-semibold text-gray-400 text-center">Officers</th>
                           <th className="py-2 text-[10px] font-semibold text-gray-400 text-center">Enterprises</th>
                           <th className="py-2 text-[10px] font-semibold text-gray-400 text-center">Coverage %</th>
                           <th className="py-2 text-[10px] font-semibold text-gray-400 text-right">AI Coverage Risk</th>
                        </tr>
                     </thead>
                     <tbody>
                        {TERRITORY_DATA.map((d, i) => (
                           <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                              <td className="py-1.5 text-[10px] font-bold text-gray-700">{d.dist}</td>
                              <td className="py-1.5 text-[10px] font-semibold text-gray-600 text-center">{d.off}</td>
                              <td className="py-1.5 text-[10px] font-semibold text-gray-600 text-center">{d.ent}</td>
                              <td className="py-1.5 text-[10px] font-bold text-gray-900 text-center">{d.cov}</td>
                              <td className={`py-1.5 text-[10px] font-bold text-right ${d.rColor}`}>{d.risk}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
            <button className="text-[11px] font-bold text-green-700 mt-4 flex items-center gap-1 hover:text-green-800">
               View full coverage analysis <ArrowRight size={12} />
            </button>
         </div>
      </div>

      {/* Lower Split: Sections 5 & 6 */}
      <div className="grid grid-cols-12 gap-6 items-start">
         
         {/* 5. AI Insights */}
         <div className="col-span-6 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-[13px] font-bold text-gray-900 mb-4">4. AI Workforce Insights</h2>
            <div className="flex items-center text-[10px] font-semibold text-gray-400 border-b border-gray-100 pb-2 mb-2">
               <div className="flex-1"></div>
               <div className="w-[60px] text-center">Confidence</div>
               <div className="w-[60px] text-center">Impact</div>
            </div>
            <div className="space-y-2.5">
               {INSIGHTS.map((ins, i) => (
                  <div key={i} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
                     <div className="flex-1 flex items-start gap-2">
                        <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
                        <span className="text-[11px] font-medium text-gray-700 leading-snug">{ins.text}</span>
                     </div>
                     <div className="w-[60px] text-center text-[11px] font-bold text-green-600">{ins.conf}</div>
                     <div className="w-[60px] flex justify-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${ins.iColor}`}>{ins.impact}</span>
                     </div>
                  </div>
               ))}
            </div>
            <button className="text-[11px] font-bold text-indigo-700 mt-4 flex items-center gap-1 hover:text-indigo-800">
               View all insights <ArrowRight size={12} />
            </button>
         </div>

         {/* 5. Recommended Actions */}
         <div className="col-span-6 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-[13px] font-bold text-gray-900 mb-4">5. Recommended Actions</h2>
            <div className="grid grid-cols-2 gap-4">
               <button className="border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:border-green-300 hover:bg-green-50/30 transition-all text-left">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0 border border-green-100"><UserPlus size={16} className="text-green-600" /></div>
                  <div className="text-[12px] font-bold text-gray-900">Assign Officer</div>
               </button>
               <button className="border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:border-blue-300 hover:bg-blue-50/30 transition-all text-left">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100"><RefreshCw size={16} className="text-blue-600" /></div>
                  <div className="text-[12px] font-bold text-gray-900">Rebalance Workload</div>
               </button>
               <button className="border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-left">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100"><Calendar size={16} className="text-indigo-600" /></div>
                  <div className="text-[12px] font-bold text-gray-900">Schedule Field Visits</div>
               </button>
               <button className="border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:border-purple-300 hover:bg-purple-50/30 transition-all text-left">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100"><Map size={16} className="text-purple-600" /></div>
                  <div className="text-[12px] font-bold text-gray-900">Create Route Plan</div>
               </button>
               <button className="border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:border-blue-300 hover:bg-blue-50/30 transition-all text-left">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100"><Check size={16} className="text-blue-600" /></div>
                  <div className="text-[12px] font-bold text-gray-900">Approve Travel Request</div>
               </button>
               <button className="border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:border-gray-300 hover:bg-gray-50/80 transition-all text-left">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200"><TrendingUp size={16} className="text-gray-600" /></div>
                  <div className="text-[12px] font-bold text-gray-900">View Officer Performance</div>
               </button>
            </div>
            <button className="text-[11px] font-bold text-gray-500 mt-6 flex items-center gap-1 hover:text-gray-800">
               View all actions <ArrowRight size={12} />
            </button>
         </div>

      </div></div>

    </div>
  );
}
