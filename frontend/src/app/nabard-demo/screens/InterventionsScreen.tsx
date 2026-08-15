"use client";

import React from 'react';
import { 
  Filter, Download, RefreshCw, ClipboardList, Users, AlertTriangle, 
  CheckCircle2, Clock, Flag, Star, ShieldCheck, Target, Sparkles, 
  UserCheck, Loader2, Check, ArrowRight, ArrowUpRight, ArrowUp, 
  ArrowDown, UserPlus, CalendarCheck, AlertCircle, CheckSquare, 
  FileText, LayoutTemplate, MoreVertical, Search
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Screen } from '../GramPulseApp';

// --- MOCK DATA ---
const MINI_CHART_DATA_1 = [{val: 20}, {val: 25}, {val: 22}, {val: 30}, {val: 28}, {val: 35}];
const MINI_CHART_DATA_2 = [{val: 40}, {val: 35}, {val: 50}, {val: 45}, {val: 60}, {val: 55}];
const MINI_CHART_DATA_3 = [{val: 50}, {val: 45}, {val: 40}, {val: 30}, {val: 25}, {val: 20}];

const PIPELINE = [
  {
    title: 'AI Recommended', count: 335, icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100',
    cards: [
      { ent: 'Shivam Milk Producer Co.', loc: 'Satara', risk: 'High', date: 'May 24, 2024', conf: 92, tagColor: 'text-red-500 bg-red-50' },
      { ent: 'Patil Dairy Farm', loc: 'Pune', risk: 'Medium', date: 'May 25, 2024', conf: 86, tagColor: 'text-orange-500 bg-orange-50' },
    ]
  },
  {
    title: 'Assigned', count: 612, icon: UserCheck, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100',
    cards: [
      { ent: 'Gokul Dairy', loc: 'Kolhapur', off: 'Anil Patil', date: 'May 23, 2024', conf: 89, tag: 'High', tagColor: 'text-red-500' },
      { ent: 'Krishna Agro Producer Co.', loc: 'Solapur', off: 'Sneha Jadhav', date: 'May 24, 2024', conf: 84, tag: 'Medium', tagColor: 'text-orange-500' },
    ]
  },
  {
    title: 'In Progress', count: 528, icon: Loader2, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100',
    cards: [
      { ent: 'Warana Dairy', loc: 'Kolhapur', off: 'Rahul More', date: 'May 22, 2024', conf: 88, tag: 'Medium', tagColor: 'text-orange-500' },
      { ent: 'Latur Agro Services', loc: 'Latur', off: 'Mahesh K.', date: 'May 23, 2024', conf: 76, tag: 'Low', tagColor: 'text-green-500' },
    ]
  },
  {
    title: 'Completed', count: 1286, icon: Check, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100',
    cards: [
      { ent: 'Beed Farmers Coop.', loc: 'Beed', off: 'Priya S.', date: 'May 18, 2024', out: 'Successful', tag: 'Low', tagColor: 'text-green-500' },
      { ent: 'Ahmednagar Agro Mills', loc: 'Ahmednagar', off: 'Sagar B.', date: 'May 17, 2024', out: 'Successful', tag: 'Medium', tagColor: 'text-orange-500' },
    ]
  },
  {
    title: 'Escalated', count: 142, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100',
    cards: [
      { ent: 'Maha Grains Traders', loc: 'Nashik', off: '-', date: 'May 20, 2024', reason: 'Repayment Stress', tag: 'High', tagColor: 'text-red-500' },
      { ent: 'Green Valley Foods', loc: 'Dhule', off: '-', date: 'May 21, 2024', reason: 'Cashflow Stress', tag: 'High', tagColor: 'text-red-500' },
    ]
  },
];

const QUEUE = [
  { id: 1, ent: 'Shivam Milk Producer Co.', loc: 'Satara', risk: 'High', conf: 92, reason: 'Rising repayment stress detected', driver: 'Cashflow decline (22%)', action: 'Financial restructuring support', impact: 'Reduce risk score by 28%', succ: 71 },
  { id: 2, ent: 'Patil Dairy Farm', loc: 'Pune', risk: 'Medium', conf: 86, reason: 'Irregular repayments', driver: 'Income instability', action: 'Working capital support', impact: 'Improve repayment rate by 10%', succ: 68 },
  { id: 3, ent: 'Gokul Dairy', loc: 'Kolhapur', risk: 'Medium', conf: 84, reason: 'Market price volatility impact', driver: 'Commodity price fluctuation', action: 'Price risk advisory', impact: 'Stabilize cashflows', succ: 64 },
];

const TABLE_DATA = [
  { ent: 'Shivam Milk Producer Co.', dist: 'Satara', type: 'Financial Support', off: 'Anil Patil', stat: 'Assigned', sColor: 'text-blue-600', prio: 'High', pColor: 'text-red-500', due: 'May 23, 2024', rec: 92, prog: 0, last: 'May 19, 08:30 AM' },
  { ent: 'Patil Dairy Farm', dist: 'Pune', type: 'Repayment Support', off: 'Sneha Jadhav', stat: 'In Progress', sColor: 'text-orange-600', prio: 'Medium', pColor: 'text-orange-500', due: 'May 24, 2024', rec: 86, prog: 45, last: 'May 19, 07:45 AM' },
  { ent: 'Gokul Dairy', dist: 'Kolhapur', type: 'Working Capital', off: 'Rahul More', stat: 'In Progress', sColor: 'text-orange-600', prio: 'Medium', pColor: 'text-orange-500', due: 'May 22, 2024', rec: 88, prog: 60, last: 'May 19, 09:15 AM' },
  { ent: 'Krishna Agro Producer Co.', dist: 'Solapur', type: 'Market Advisory', off: 'Mahesh K.', stat: 'Assigned', sColor: 'text-blue-600', prio: 'Medium', pColor: 'text-orange-500', due: 'May 24, 2024', rec: 84, prog: 10, last: 'May 19, 08:05 AM' },
  { ent: 'Warana Dairy', dist: 'Kolhapur', type: 'Financial Support', off: 'Priya S.', stat: 'Completed', sColor: 'text-green-600', prio: 'Low', pColor: 'text-green-500', due: 'May 18, 2024', rec: 81, prog: 100, last: 'May 18, 05:20 PM' },
  { ent: 'Beed Farmers Coop.', dist: 'Beed', type: 'Capacity Building', off: 'Sagar B.', stat: 'Completed', sColor: 'text-green-600', prio: 'Low', pColor: 'text-green-500', due: 'May 17, 2024', rec: 78, prog: 100, last: 'May 17, 04:40 PM' },
  { ent: 'Ahmednagar Agro Mills', dist: 'Ahmednagar', type: 'Risk Mitigation', off: 'Vijay Patil', stat: 'In Progress', sColor: 'text-orange-600', prio: 'High', pColor: 'text-red-500', due: 'May 23, 2024', rec: 90, prog: 35, last: 'May 19, 09:05 AM' },
  { ent: 'Maha Grains Traders', dist: 'Nashik', type: 'Recovery Support', off: '-', stat: 'Escalated', sColor: 'text-red-600', prio: 'High', pColor: 'text-red-500', due: 'May 20, 2024', rec: 91, prog: 0, last: 'May 19, 06:50 AM' },
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

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import { useGramPulseStore } from '../store/useGramPulseStore';

export default function InterventionsScreen() {
  const { selectedState, selectedDistrict } = useGramPulseStore();
  const queryClient = useQueryClient();

  const { data: interventionsData, isLoading } = useQuery({
    queryKey: ['interventions', selectedState, selectedDistrict],
    queryFn: () => apiClient.getInterventions({ state: selectedState, district: selectedDistrict }).then(res => res.data)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => apiClient.updateIntervention(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
    }
  });

  const tableData = (interventionsData as any)?.interventions || TABLE_DATA;

  return (
    <div className="space-y-6 pb-12 w-full max-w-[1600px] mx-auto overflow-x-hidden">
      
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold text-gray-500 mb-1 flex items-center gap-1">
             Operations <span className="text-gray-300">{">"}</span> <span className="text-gray-900">Interventions</span>
          </div>
          <h1 className="text-[22px] font-bold text-gray-900 mb-1">Interventions</h1>
          <div className="text-[11px] text-gray-500 font-medium">Manage AI-recommended interventions and track execution across field teams.</div>
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

      {/* 1. Global KPIs */}
      <div className="grid grid-cols-5 gap-4">
         <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0 text-purple-600"><ClipboardList size={20} /></div>
            <div>
               <div className="text-[11px] font-bold text-gray-500 mb-0.5">Pending Interventions</div>
               <div className="text-[20px] font-bold text-gray-900 leading-none mb-1">1,742</div>
               <div className="text-[10px] font-bold text-green-500 flex items-center gap-0.5"><ArrowUp size={10}/> 132 <span className="text-gray-400 font-medium">vs last week</span></div>
            </div>
         </div>
         <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-blue-600"><Users size={20} /></div>
            <div>
               <div className="text-[11px] font-bold text-gray-500 mb-0.5">Active Field Visits</div>
               <div className="text-[20px] font-bold text-gray-900 leading-none mb-1">658</div>
               <div className="text-[10px] font-bold text-green-500 flex items-center gap-0.5"><ArrowUp size={10}/> 56 <span className="text-gray-400 font-medium">vs last week</span></div>
            </div>
         </div>
         <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 text-red-500"><AlertTriangle size={20} /></div>
            <div>
               <div className="text-[11px] font-bold text-gray-500 mb-0.5">Critical Enterprises</div>
               <div className="text-[20px] font-bold text-gray-900 leading-none mb-1">475</div>
               <div className="text-[10px] font-bold text-green-500 flex items-center gap-0.5"><ArrowUp size={10}/> 28 <span className="text-gray-400 font-medium">vs last week</span></div>
            </div>
         </div>
         <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0 text-green-600"><CheckCircle2 size={20} /></div>
            <div>
               <div className="text-[11px] font-bold text-gray-500 mb-0.5">Completed This Week</div>
               <div className="text-[20px] font-bold text-gray-900 leading-none mb-1">1,286</div>
               <div className="text-[10px] font-bold text-green-500 flex items-center gap-0.5"><ArrowUp size={10}/> 214 <span className="text-gray-400 font-medium">vs last week</span></div>
            </div>
         </div>
         <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0 text-orange-500"><Clock size={20} /></div>
            <div>
               <div className="text-[11px] font-bold text-gray-500 mb-0.5">Avg. Resolution Time</div>
               <div className="text-[20px] font-bold text-gray-900 leading-none mb-1">6.2 <span className="text-[12px] text-gray-500">Days</span></div>
               <div className="text-[10px] font-bold text-green-500 flex items-center gap-0.5"><ArrowDown size={10}/> 0.8 days <span className="text-gray-400 font-medium">vs last week</span></div>
            </div>
         </div>
      </div>

      {/* 2. Intervention KPIs */}
      <div>
         <h2 className="text-[13px] font-bold text-gray-900 mb-3 flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">2</span> Intervention KPIs</h2>
         <div className="grid grid-cols-6 gap-4">
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[90px]">
               <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-5 h-5 rounded bg-red-50 flex items-center justify-center text-red-500"><Flag size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">High Priority Cases</span>
               </div>
               <div className="flex items-end justify-between">
                  <div>
                     <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">685</div>
                     <div className="text-[9px] font-bold text-gray-500">27.8% of total</div>
                  </div>
                  <MiniSparkline data={MINI_CHART_DATA_1} color="#ef4444" />
               </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[90px]">
               <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-5 h-5 rounded bg-orange-50 flex items-center justify-center text-orange-500"><Flag size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">Medium Priority Cases</span>
               </div>
               <div className="flex items-end justify-between">
                  <div>
                     <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">742</div>
                     <div className="text-[9px] font-bold text-gray-500">30.3% of total</div>
                  </div>
                  <MiniSparkline data={MINI_CHART_DATA_2} color="#f97316" />
               </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[90px]">
               <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-5 h-5 rounded bg-green-50 flex items-center justify-center text-green-500"><Flag size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">Low Priority Cases</span>
               </div>
               <div className="flex items-end justify-between">
                  <div>
                     <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">1,256</div>
                     <div className="text-[9px] font-bold text-gray-500">51.6% of total</div>
                  </div>
                  <MiniSparkline data={MINI_CHART_DATA_3} color="#10b981" />
               </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[90px]">
               <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-5 h-5 rounded bg-purple-50 flex items-center justify-center text-purple-500"><Star size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">AI Success Rate</span>
               </div>
               <div className="flex items-end justify-between">
                  <div>
                     <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">78.6%</div>
                     <div className="text-[9px] font-bold text-green-500 flex items-center gap-0.5"><ArrowUp size={10}/> 6.4% <span className="text-gray-400 font-semibold">vs last week</span></div>
                  </div>
                  <MiniSparkline data={MINI_CHART_DATA_1} color="#a855f7" />
               </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[90px]">
               <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center text-blue-500"><ShieldCheck size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">SLA Compliance</span>
               </div>
               <div className="flex items-end justify-between">
                  <div>
                     <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">92.3%</div>
                     <div className="text-[9px] font-bold text-green-500 flex items-center gap-0.5"><ArrowUp size={10}/> 3.8% <span className="text-gray-400 font-semibold">vs last week</span></div>
                  </div>
                  <MiniSparkline data={MINI_CHART_DATA_2} color="#3b82f6" />
               </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[90px]">
               <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-5 h-5 rounded bg-green-50 flex items-center justify-center text-green-500"><Target size={12} /></div>
                  <span className="text-[10px] font-bold text-gray-600">Intervention Effectiveness</span>
               </div>
               <div className="flex items-end justify-between">
                  <div>
                     <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">68.4%</div>
                     <div className="text-[9px] font-bold text-green-500 flex items-center gap-0.5"><ArrowUp size={10}/> 5.2% <span className="text-gray-400 font-semibold">vs last week</span></div>
                  </div>
                  <MiniSparkline data={MINI_CHART_DATA_3} color="#10b981" />
               </div>
            </div>
         </div>
      </div>

      {/* 3. Intervention Pipeline */}
      <div>
         <h2 className="text-[13px] font-bold text-gray-900 mb-3 flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">3</span> Intervention Pipeline</h2>
         <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {PIPELINE.map((col, i) => (
               <React.Fragment key={i}>
                  <div className="min-w-[280px] w-[280px] shrink-0 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col snap-center">
                     <div className={`px-4 py-3 border-b ${col.border} flex items-center justify-between ${col.bg} rounded-t-xl`}>
                        <div className="flex items-center gap-2">
                           <col.icon size={14} className={col.color} />
                           <span className="text-[12px] font-bold text-gray-900">{col.title}</span>
                        </div>
                        <span className="text-[11px] font-bold text-gray-600">{col.count}</span>
                     </div>
                     <div className="p-3 flex-1 bg-gray-50/50 space-y-3">
                        {col.cards.map((card, j) => (
                           <div key={j} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                              <div className="flex justify-between items-start mb-2">
                                 <div>
                                    <div className="text-[11px] font-bold text-gray-900 leading-tight">{card.ent}</div>
                                    <div className="text-[9px] font-medium text-gray-500 mt-0.5">{card.loc}</div>
                                 </div>
                                 {card.tagColor?.includes('bg-') ? (
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${card.tagColor}`}>{(card as any).risk}</span>
                                 ) : (
                                    <span className={`text-[9px] font-bold ${card.tagColor}`}>{(card as any).tag}</span>
                                 )}
                              </div>
                              <div className="space-y-1.5 mb-3">
                                 {(card as any).off && <div className="flex justify-between items-center text-[9px]"><span className="text-gray-500 font-semibold">Officer:</span><span className="font-bold text-gray-800">{(card as any).off}</span></div>}
                                 {(card as any).reason && <div className="flex justify-between items-center text-[9px]"><span className="text-gray-500 font-semibold">Reason:</span><span className="font-bold text-gray-800 truncate max-w-[120px] text-right">{(card as any).reason}</span></div>}
                                 <div className="flex justify-between items-center text-[9px]"><span className="text-gray-500 font-semibold">{col.title === 'Completed' ? 'Completed:' : 'Due:'}</span><span className="font-bold text-gray-800">{(card as any).date}</span></div>
                                 {(card as any).out && <div className="flex justify-between items-center text-[9px]"><span className="text-gray-500 font-semibold">Outcome:</span><span className="font-bold text-green-600">{(card as any).out}</span></div>}
                              </div>
                              {!(card as any).out && !(card as any).reason && (
                                 <div>
                                    <div className="flex justify-between items-center text-[9px] mb-1">
                                       <span className="font-semibold text-gray-600">AI Confidence</span>
                                       <span className="font-bold text-gray-900">{(card as any).conf}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                       <div className="h-full bg-green-500 rounded-full" style={{width: `${(card as any).conf}%`}}></div>
                                    </div>
                                 </div>
                              )}
                           </div>
                        ))}
                        <button className="w-full text-center text-[10px] font-bold text-indigo-600 hover:text-indigo-800 mt-2 flex items-center justify-center gap-1">
                           View all ({col.count}) <ArrowRight size={10} />
                        </button>
                     </div>
                  </div>
                  {i < PIPELINE.length - 1 && (
                     <div className="flex items-center justify-center text-gray-300">
                        <ArrowRight size={16} />
                     </div>
                  )}
               </React.Fragment>
            ))}
         </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-12 gap-6 items-start">
         
         {/* 4. AI Prioritized Queue */}
         <div className="col-span-4 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-[13px] font-bold text-gray-900 mb-4 flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">4</span> AI Prioritized Intervention Queue</h2>
            <div className="space-y-4">
               {QUEUE.map((q) => (
                  <div key={q.id} className="flex gap-3">
                     <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-1 ${q.id === 1 ? 'bg-red-100 text-red-600' : q.id === 2 ? 'bg-orange-100 text-orange-600' : 'bg-yellow-100 text-yellow-600'}`}>
                        {q.id}
                     </div>
                     <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                           <div className="flex items-center gap-1.5">
                              <AlertTriangle size={12} className="text-red-500 shrink-0" />
                              <div>
                                 <div className="text-[11px] font-bold text-gray-900 leading-tight">{q.ent}</div>
                                 <div className="text-[9px] font-medium text-gray-500">{q.loc}</div>
                              </div>
                           </div>
                           <div className="text-right">
                              <span className={`text-[9px] font-bold ${q.risk === 'High' ? 'text-red-500' : 'text-orange-500'}`}>{q.risk}</span>
                              <div className="text-[10px] font-bold text-gray-900 leading-none mt-1">{q.conf}% <span className="text-[8px] font-semibold text-gray-400 block">Confidence</span></div>
                           </div>
                        </div>
                        <div className="space-y-1.5 text-[9px] bg-gray-50 p-2 rounded-lg border border-gray-100 relative">
                           <ArrowRight size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300" />
                           <div className="flex items-center gap-1 pr-4"><span className="font-semibold text-gray-500 w-[70px] shrink-0">Reason:</span><span className="font-bold text-gray-800">{q.reason}</span></div>
                           <div className="flex items-center gap-1 pr-4"><span className="font-semibold text-gray-500 w-[70px] shrink-0">Risk Driver:</span><span className="font-bold text-gray-800">{q.driver}</span></div>
                           <div className="flex items-center gap-1 pr-4"><span className="font-semibold text-gray-500 w-[70px] shrink-0">Suggested Action:</span><span className="font-bold text-indigo-600">{q.action}</span></div>
                           <div className="flex items-center gap-1 pr-4 mb-2"><span className="font-semibold text-gray-500 w-[70px] shrink-0">Expected Impact:</span><span className="font-bold text-green-600">{q.impact}</span></div>
                           <div className="pt-1 flex items-center gap-2">
                              <span className="font-semibold text-green-600">Success rate: {q.succ}%</span>
                              <div className="flex-1 bg-green-100 h-1 rounded-full"><div className="bg-green-500 h-full rounded-full" style={{width: `${q.succ}%`}}></div></div>
                           </div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
            <button className="text-[10px] font-bold text-indigo-600 mt-4 flex items-center gap-1 hover:text-indigo-800">
               View full prioritized queue <ArrowRight size={10} />
            </button>
         </div>

         {/* 5. Recommended Actions */}
         <div className="col-span-3 space-y-6">
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
               <h2 className="text-[13px] font-bold text-gray-900 mb-4 flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">5</span> Recommended Actions</h2>
               <div className="grid grid-cols-2 gap-3">
                  <button 
                     onClick={() => updateMutation.mutate({ id: 'INT-001', status: 'Assigned' })}
                     disabled={updateMutation.isPending}
                     className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-left disabled:opacity-50">
                     <div className="w-6 h-6 rounded bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                        {updateMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={12}/>}
                     </div>
                     <span className="text-[10px] font-bold text-gray-700 leading-tight">
                        {updateMutation.isPending ? 'Assigning...' : 'Assign Field Officer'}
                     </span>
                  </button>
                  <button className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-left">
                     <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><CheckSquare size={12}/></div>
                     <span className="text-[10px] font-bold text-gray-700 leading-tight">Approve Intervention</span>
                  </button>
                  <button className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-left">
                     <div className="w-6 h-6 rounded bg-purple-50 text-purple-600 flex items-center justify-center shrink-0"><CalendarCheck size={12}/></div>
                     <span className="text-[10px] font-bold text-gray-700 leading-tight">Schedule Visit</span>
                  </button>
                  <button className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-left">
                     <div className="w-6 h-6 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><FileText size={12}/></div>
                     <span className="text-[10px] font-bold text-gray-700 leading-tight">Generate Task</span>
                  </button>
                  <button className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-left">
                     <div className="w-6 h-6 rounded bg-red-50 text-red-600 flex items-center justify-center shrink-0"><AlertCircle size={12}/></div>
                     <span className="text-[10px] font-bold text-gray-700 leading-tight">Escalate Case</span>
                  </button>
                  <button className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-left">
                     <div className="w-6 h-6 rounded bg-sky-50 text-sky-600 flex items-center justify-center shrink-0"><LayoutTemplate size={12}/></div>
                     <span className="text-[10px] font-bold text-gray-700 leading-tight">View Enterprise Twin</span>
                  </button>
               </div>
               <button className="w-full text-[10px] font-bold text-gray-500 mt-3 flex items-center justify-center gap-1 hover:text-gray-700">
                  More actions <ArrowDown size={10} />
               </button>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl p-5 shadow-sm relative overflow-hidden">
               <Sparkles size={60} className="absolute -right-4 -top-4 text-indigo-100/50" />
               <h3 className="text-[12px] font-bold text-indigo-900 mb-2 flex items-center gap-1.5"><Sparkles size={14} className="text-indigo-600"/> AI Recommendation Insight</h3>
               <p className="text-[11px] font-medium text-indigo-800/80 leading-relaxed relative z-10">
                  Intervening in the top 10 enterprises in this queue can reduce overall portfolio risk by 14.2% and improve repayment rate by 11.6%.
               </p>
               <button className="text-[10px] font-bold text-indigo-600 mt-3 flex items-center gap-1 hover:text-indigo-800">
                  View AI explanation <ArrowRight size={10} />
               </button>
            </div>
         </div>

         {/* 6. Detailed Intervention Table */}
         <div className="col-span-5 bg-white border border-gray-100 rounded-xl p-5 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-[13px] font-bold text-gray-900 flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">6</span> Detailed Intervention Table</h2>
               <div className="flex items-center gap-2">
                  <div className="relative">
                     <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                     <input type="text" placeholder="Search interventions..." className="pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg text-[10px] font-medium w-[150px] focus:outline-none focus:border-indigo-500" />
                  </div>
                  <button className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"><Filter size={12}/></button>
                  <button className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"><Download size={12}/></button>
                  <button className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"><MoreVertical size={12}/></button>
               </div>
            </div>
            
            <div className="flex-1 overflow-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="border-b border-gray-100">
                        <th className="py-2 pl-1 pr-2"><input type="checkbox" className="rounded border-gray-300" /></th>
                        <th className="py-2 px-2 text-[9px] font-semibold text-gray-500">Enterprise</th>
                        <th className="py-2 px-2 text-[9px] font-semibold text-gray-500">District</th>
                        <th className="py-2 px-2 text-[9px] font-semibold text-gray-500">Intervention Type</th>
                        <th className="py-2 px-2 text-[9px] font-semibold text-gray-500">Assigned Officer</th>
                        <th className="py-2 px-2 text-[9px] font-semibold text-gray-500 text-center">Status</th>
                        <th className="py-2 px-2 text-[9px] font-semibold text-gray-500 text-center">Priority</th>
                        <th className="py-2 px-2 text-[9px] font-semibold text-gray-500">Due Date</th>
                        <th className="py-2 px-2 text-[9px] font-semibold text-gray-500 text-center">AI Rec.</th>
                        <th className="py-2 px-2 text-[9px] font-semibold text-gray-500">Progress</th>
                        <th className="py-2 pl-2 text-[9px] font-semibold text-gray-500">Last Updated</th>
                     </tr>
                  </thead>
                  <tbody>
                     {tableData.map((row: any, i: number) => (
                        <tr key={row.id || i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                           <td className="py-2.5 pl-1 pr-2"><input type="checkbox" className="rounded border-gray-300" /></td>
                           <td className="py-2.5 px-2 text-[10px] font-bold text-gray-700 truncate max-w-[120px]">{row.name || row.ent}</td>
                           <td className="py-2.5 px-2 text-[10px] font-semibold text-gray-600">{row.district || row.dist}</td>
                           <td className="py-2.5 px-2 text-[10px] font-semibold text-gray-600">{row.type}</td>
                           <td className="py-2.5 px-2 text-[10px] font-semibold text-gray-600">{row.assignedOfficer || row.off}</td>
                           <td className="py-2.5 px-2 text-center">
                              <span className={`text-[9px] font-bold ${row.status === 'Completed' ? 'text-green-600' : row.status === 'Escalated' ? 'text-red-600' : row.status === 'Assigned' ? 'text-blue-600' : 'text-orange-600'}`}>{row.status || row.stat}</span>
                           </td>
                           <td className="py-2.5 px-2 text-center">
                              <span className={`text-[9px] font-bold ${row.priority === 'High' ? 'text-red-500' : row.priority === 'Medium' ? 'text-orange-500' : 'text-green-500'}`}>{row.priority || row.prio}</span>
                           </td>
                           <td className="py-2.5 px-2 text-[9px] font-semibold text-gray-600 whitespace-nowrap">{row.dueDate || row.due}</td>
                           <td className="py-2.5 px-2 text-[10px] font-bold text-green-600 text-center">{row.aiRecommendationScore || row.rec}%</td>
                           <td className="py-2.5 px-2">
                              <div className="flex items-center gap-1.5 w-[50px]">
                                 <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-green-500 h-full rounded-full" style={{width: `${row.progress ?? row.prog ?? 0}%`}}></div>
                                 </div>
                                 <span className="text-[8px] font-bold text-gray-600">{row.progress ?? row.prog ?? 0}%</span>
                              </div>
                           </td>
                           <td className="py-2.5 pl-2 text-[9px] font-medium text-gray-500 whitespace-nowrap">{row.lastUpdated || row.last}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
            
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
               <div className="text-[10px] font-medium text-gray-500">Showing 1 to 8 of 1,742 interventions</div>
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                     <button className="w-5 h-5 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50">{'<'}</button>
                     <button className="w-5 h-5 rounded border-transparent flex items-center justify-center text-[10px] font-bold text-indigo-600 bg-indigo-50">1</button>
                     <button className="w-5 h-5 rounded border-transparent flex items-center justify-center text-[10px] font-semibold text-gray-600 hover:bg-gray-50">2</button>
                     <button className="w-5 h-5 rounded border-transparent flex items-center justify-center text-[10px] font-semibold text-gray-600 hover:bg-gray-50">3</button>
                     <span className="text-gray-400 mx-1">...</span>
                     <button className="w-7 h-5 rounded border-transparent flex items-center justify-center text-[10px] font-semibold text-gray-600 hover:bg-gray-50">219</button>
                     <button className="w-5 h-5 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50">{'>'}</button>
                  </div>
                  <select className="border border-gray-200 rounded bg-white text-[10px] font-semibold text-gray-600 px-2 py-0.5 outline-none">
                     <option>10 / page</option>
                  </select>
               </div>
            </div>
         </div>

      </div>

    </div>
  );
}
