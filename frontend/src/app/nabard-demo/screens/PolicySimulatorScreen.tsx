"use client";

import React, { useState } from 'react';
import { 
  Filter, Download, RefreshCw, Briefcase, ShieldAlert, Clock, IndianRupee, Sparkles, 
  Percent, ShieldCheck, CalendarDays, TrendingUp, GraduationCap, Cpu, 
  ArrowRight, Shield, AlertTriangle, Building, CloudRain, DownloadCloud, CheckCircle2
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip, CartesianGrid } from 'recharts';
import { Screen } from '../GramPulseApp';

interface Props {
  navigateTo: (s: Screen, ent?: string) => void;
}

// --- MOCK DATA ---
const MINI_CHART_DATA = [
  { time: 'Now', base: 91, scenario: 91, baseECL: 18.6, scenECL: 18.6, baseHR: 685, scenHR: 685, baseCS: 1126, scenCS: 1126 },
  { time: '+3M', base: 92, scenario: 96, baseECL: 16.2, scenECL: 14.5, baseHR: 640, scenHR: 580, baseCS: 1050, scenCS: 900 },
  { time: '+6M', base: 91, scenario: 102.4, baseECL: 18.6, scenECL: 11.8, baseHR: 685, scenHR: 475, baseCS: 1126, scenCS: 742 },
];

const DISTRICTS_DATA = [
  { dist: 'Solapur', risk: '+ 18 pts', rep: '↑ 13.2 pts', ecl: '↓ 1.46 Cr', ent: 255 },
  { dist: 'Kolhapur', risk: '+ 16 pts', rep: '↑ 11.6 pts', ecl: '↓ 1.21 Cr', ent: 232 },
  { dist: 'Beed', risk: '+ 15 pts', rep: '↑ 10.8 pts', ecl: '↓ 1.02 Cr', ent: 188 },
  { dist: 'Ahmednagar', risk: '+ 14 pts', rep: '↑ 9.7 pts', ecl: '↓ 0.96 Cr', ent: 162 },
  { dist: 'Latur', risk: '+ 13 pts', rep: '↑ 9.1 pts', ecl: '↓ 0.81 Cr', ent: 154 },
];

const SCENARIO_DATA = [
  { metric: 'Overall Risk Score (/100)', base: '68', s1: '54', s2: '49', s3: '42', best: 'Scenario 3' },
  { metric: 'Avg. Repayment Rate (%)', base: '91%', s1: '102.4%', s2: '105.6%', s3: '107.8%', best: 'Scenario 3' },
  { metric: 'Expected Credit Loss (₹ Cr)', base: '₹18.6 Cr', s1: '₹11.8 Cr', s2: '₹9.6 Cr', s3: '₹8.3 Cr', best: 'Scenario 3' },
  { metric: 'High Risk Enterprises (No.)', base: '685', s1: '475', s2: '382', s3: '328', best: 'Scenario 3' },
  { metric: 'Cashflow Stressed (No.)', base: '1,126', s1: '742', s2: '621', s3: '512', best: 'Scenario 3' },
  { metric: 'Default Probability (Avg.)', base: '12.6%', s1: '8.7%', s2: '7.1%', s3: '6.2%', best: 'Scenario 3' },
];

// Reusable slider row component
const SliderRow = ({ icon: Icon, color, label, sub, base, input, change, isPositive }: any) => (
  <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
     <div className="flex items-center gap-3 w-[240px]">
        <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${color.bg} ${color.text}`}>
           <Icon size={12} />
        </div>
        <div>
           <div className="text-[11px] font-bold text-gray-900 leading-tight">{label}</div>
           <div className="text-[9px] text-gray-500">{sub}</div>
        </div>
     </div>
     <div className="w-[80px] text-center text-[11px] font-bold text-gray-900">{base}</div>
     
     <div className="flex-1 px-4 flex items-center gap-3">
        <div className="flex-1 h-1 bg-gray-100 rounded-full relative">
           <div className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-green-500 rounded-full" style={{ width: '40%' }}></div>
           <div className="absolute top-1/2 -translate-y-1/2 left-[40%] w-3 h-3 bg-white border-2 border-green-500 rounded-full cursor-pointer shadow-sm -ml-1.5"></div>
        </div>
        <div className="w-[60px] h-6 border border-gray-200 rounded flex items-center justify-center text-[11px] font-bold text-gray-900 bg-white">
           {input}
        </div>
     </div>

     <div className={`w-[80px] text-right text-[11px] font-bold ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
        {change}
     </div>
  </div>
);

// Mini Line Chart Component
const MiniImpactChart = ({ dataKeyBase, dataKeyScen, colorStr }: any) => (
  <div className="h-[90px] w-full mt-2">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={MINI_CHART_DATA} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
        <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f3f4f6" />
        <Line type="monotone" dataKey={dataKeyBase} stroke="#9ca3af" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
        <Line type="monotone" dataKey={dataKeyScen} stroke={colorStr} strokeWidth={2} dot={{ r: 2.5, fill: colorStr, strokeWidth: 0 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);


export default function PolicySimulatorScreen({ navigateTo }: Props) {
  const [hasRun, setHasRun] = useState(false);
  
  return (
    <div className="space-y-6 pb-12 w-full max-w-[1600px] mx-auto overflow-x-hidden">
      
      {/* 1. Header Area */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold text-gray-500 mb-1 flex items-center gap-1">
             AI Copilot <span className="text-gray-300">{">"}</span> <span className="text-gray-900">Policy Simulator</span>
          </div>
          <h1 className="text-[22px] font-bold text-gray-900 mb-1">Policy Simulator</h1>
          <p className="text-[12px] text-gray-500">Simulate policy interventions and evaluate portfolio-wide impact before implementation.</p>
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

      {/* 2. Top Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3 shadow-sm">
           <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0"><Briefcase size={16} className="text-emerald-600" /></div>
           <div>
             <div className="text-[10px] font-semibold text-gray-500 mb-0.5">Base Portfolio</div>
             <div className="text-[14px] font-bold text-gray-900 leading-none mb-0.5">2,458 <span className="text-[10px] font-bold text-gray-500">Enterprises</span></div>
             <div className="text-[9px] text-gray-400">Across 18 districts</div>
           </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3 shadow-sm">
           <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100"><ShieldAlert size={16} className="text-orange-500" /></div>
           <div>
             <div className="text-[10px] font-semibold text-gray-500 mb-0.5">Overall Risk (Base)</div>
             <div className="text-[14px] font-bold text-gray-900 leading-none mb-0.5">68 <span className="text-[10px] font-bold text-gray-500">/100</span></div>
             <div className="text-[9px] text-gray-400">Moderate Risk</div>
           </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3 shadow-sm">
           <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0"><Clock size={16} className="text-purple-600" /></div>
           <div>
             <div className="text-[10px] font-semibold text-gray-500 mb-0.5">Avg. Repayment Rate (Base)</div>
             <div className="text-[14px] font-bold text-gray-900 leading-none mb-0.5">91%</div>
             <div className="text-[9px] text-gray-400">Healthy</div>
           </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3 shadow-sm">
           <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100"><IndianRupee size={16} className="text-blue-600" /></div>
           <div>
             <div className="text-[10px] font-semibold text-gray-500 mb-0.5">Expected Credit Loss (Base)</div>
             <div className="text-[14px] font-bold text-gray-900 leading-none mb-0.5">₹18.6 Cr</div>
             <div className="text-[9px] text-gray-400">12.4% of portfolio</div>
           </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3 shadow-sm">
           <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center shrink-0 border border-pink-100"><Sparkles size={16} className="text-pink-600" /></div>
           <div>
             <div className="text-[10px] font-semibold text-gray-500 mb-0.5">Policy Simulation</div>
             <div className="text-[14px] font-bold text-gray-900 leading-none mb-0.5">Today, 08:30 AM</div>
             <div className="text-[9px] text-gray-400">AI Model v3.2.1</div>
           </div>
        </div>
      </div>

      {/* Main Two-Column Split */}
      <div className="grid grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Input & Config (7 cols) */}
        <div className="col-span-7 space-y-6">
           
           {/* Section 1: Select Intervention */}
           <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h2 className="text-[13px] font-bold text-gray-900 mb-4">1. Select Policy Intervention Type</h2>
              <div className="grid grid-cols-3 gap-3">
                 <div className="border-2 border-green-500 rounded-xl p-3 bg-green-50/50 relative cursor-pointer">
                    <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white"><CheckCircle2 size={10} /></div>
                    <Percent size={18} className="text-green-600 mb-2" />
                    <div className="text-[11px] font-bold text-gray-900 mb-1">Interest Subvention</div>
                    <div className="text-[9px] text-gray-500 leading-tight">Reduce interest rate for eligible enterprises</div>
                 </div>
                 <div className="border border-gray-100 rounded-xl p-3 hover:border-green-200 cursor-pointer transition-colors">
                    <ShieldCheck size={18} className="text-emerald-500 mb-2" />
                    <div className="text-[11px] font-bold text-gray-900 mb-1">Credit Guarantee</div>
                    <div className="text-[9px] text-gray-500 leading-tight">Provide guarantee cover to reduce risk</div>
                 </div>
                 <div className="border border-gray-100 rounded-xl p-3 hover:border-green-200 cursor-pointer transition-colors">
                    <CalendarDays size={18} className="text-purple-500 mb-2" />
                    <div className="text-[11px] font-bold text-gray-900 mb-1">Moratorium / Repayment Holiday</div>
                    <div className="text-[9px] text-gray-500 leading-tight">Provide temporary repayment relief</div>
                 </div>
                 <div className="border border-gray-100 rounded-xl p-3 hover:border-green-200 cursor-pointer transition-colors">
                    <TrendingUp size={18} className="text-blue-500 mb-2" />
                    <div className="text-[11px] font-bold text-gray-900 mb-1">Working Capital Support</div>
                    <div className="text-[9px] text-gray-500 leading-tight">Increase working capital limit</div>
                 </div>
                 <div className="border border-gray-100 rounded-xl p-3 hover:border-green-200 cursor-pointer transition-colors">
                    <GraduationCap size={18} className="text-orange-500 mb-2" />
                    <div className="text-[11px] font-bold text-gray-900 mb-1">Capacity Building</div>
                    <div className="text-[9px] text-gray-500 leading-tight">Skill & training support for enterprises</div>
                 </div>
                 <div className="border border-gray-100 rounded-xl p-3 hover:border-green-200 cursor-pointer transition-colors">
                    <Cpu size={18} className="text-pink-500 mb-2" />
                    <div className="text-[11px] font-bold text-gray-900 mb-1">Technology Upgrade</div>
                    <div className="text-[9px] text-gray-500 leading-tight">Support for technology adoption</div>
                 </div>
              </div>
           </div>

           {/* Section 2: Configure Parameters */}
           <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h2 className="text-[13px] font-bold text-gray-900 mb-4">2. Configure Policy Parameters</h2>
              
              <div className="flex items-center text-[10px] font-semibold text-gray-400 border-b border-gray-100 pb-2 mb-2">
                 <div className="w-[240px]">Parameter</div>
                 <div className="w-[80px] text-center">Current (Base)</div>
                 <div className="flex-1 text-center">Policy Input</div>
                 <div className="w-[80px] text-right">Change</div>
              </div>

              <SliderRow icon={Percent} color={{bg:'bg-blue-50', text:'text-blue-600'}} label="Interest Rate Reduction" sub="Subvention on interest rate" base="0%" input="3.0%" change="-3.0%" isPositive={true} />
              <SliderRow icon={ShieldCheck} color={{bg:'bg-emerald-50', text:'text-emerald-600'}} label="Guarantee Coverage" sub="% of loan amount covered" base="0%" input="75%" change="+75%" isPositive={true} />
              <SliderRow icon={CalendarDays} color={{bg:'bg-purple-50', text:'text-purple-600'}} label="Moratorium Duration" sub="Repayment holiday duration" base="0 months" input="3 months" change="+3 months" isPositive={true} />
              <SliderRow icon={TrendingUp} color={{bg:'bg-orange-50', text:'text-orange-600'}} label="Working Capital Increase" sub="Increase in WC limit" base="0%" input="20%" change="+20%" isPositive={true} />
              <SliderRow icon={GraduationCap} color={{bg:'bg-pink-50', text:'text-pink-600'}} label="Training Coverage" sub="% enterprises covered" base="0%" input="30%" change="+30%" isPositive={true} />

              <div className="flex items-center justify-end gap-3 mt-6">
                 <button onClick={() => setHasRun(false)} className="text-[11px] font-bold text-gray-500 hover:text-gray-900 transition-colors border border-gray-200 rounded-lg px-4 py-2">Reset to Base</button>
                 <button onClick={() => setHasRun(true)} className="text-[11px] font-bold text-white bg-green-700 hover:bg-green-800 transition-colors rounded-lg px-6 py-2 shadow-sm flex items-center gap-1">Run Policy Simulation <ArrowRight size={12}/></button>
              </div>
           </div>

           {/* Section 3: AI Policy Summary */}
           {hasRun && (
             <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <div className="flex items-center gap-2 mb-3">
                 <Sparkles size={16} className="text-blue-600" />
                 <h2 className="text-[13px] font-bold text-gray-900">AI Policy Summary</h2>
              </div>
              <p className="text-[12px] text-gray-700 mb-3 font-medium">This policy combination is projected to significantly improve portfolio health and reduce risk.</p>
              <ul className="space-y-1.5 mb-4">
                 <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0" /><span className="text-[11px] text-gray-600">Expected repayment rate improvement of <strong className="text-gray-800">11.4%</strong>.</span></li>
                 <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0" /><span className="text-[11px] text-gray-600">Credit loss reduction of <strong className="text-gray-800">₹6.8 Cr (36.6%)</strong>.</span></li>
                 <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0" /><span className="text-[11px] text-gray-600">High risk enterprises expected to reduce by 32%.</span></li>
                 <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0" /><span className="text-[11px] text-gray-600">Effective coverage of 1,742 enterprises (70.9% of portfolio).</span></li>
              </ul>
              <div className="text-right">
                 <button className="text-[11px] font-bold text-blue-700 hover:text-blue-800 flex items-center justify-end gap-1 ml-auto">View AI Explanation <ArrowRight size={12}/></button>
              </div>
           </div>
           )}

        </div>

        {/* RIGHT COLUMN: Output & Impact (5 cols) */}
        {hasRun ? (
          <div className="col-span-5 space-y-6">
           
           {/* Section 4: Policy Impact Overview */}
           <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h2 className="text-[13px] font-bold text-gray-900 mb-4 flex items-center gap-1">4. Policy Impact Overview <span className="text-[11px] font-semibold text-gray-400">(vs Base)</span></h2>
              <div className="grid grid-cols-2 gap-3">
                 <div className="border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-6 h-6 rounded bg-indigo-50 flex items-center justify-center text-indigo-600"><Shield size={12} /></div>
                       <span className="text-[10px] font-semibold text-gray-600">Overall Risk Score</span>
                    </div>
                    <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">54 <span className="text-[12px] font-semibold text-gray-400">/100</span></div>
                    <div className="text-[10px] font-bold text-green-600 flex items-center gap-0.5">↓ 14 pts (Improved)</div>
                 </div>
                 <div className="border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-6 h-6 rounded bg-emerald-50 flex items-center justify-center text-emerald-600"><Clock size={12} /></div>
                       <span className="text-[10px] font-semibold text-gray-600">Avg. Repayment Rate</span>
                    </div>
                    <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">102.4%</div>
                    <div className="text-[10px] font-bold text-green-600 flex items-center gap-0.5">↑ 11.4 pts</div>
                 </div>
                 <div className="border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-6 h-6 rounded bg-orange-50 flex items-center justify-center text-orange-600"><IndianRupee size={12} /></div>
                       <span className="text-[10px] font-semibold text-gray-600">Expected Credit Loss</span>
                    </div>
                    <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">₹11.8 Cr</div>
                    <div className="text-[10px] font-bold text-green-600 flex items-center gap-0.5">↓ ₹6.8 Cr (36.6%)</div>
                 </div>
                 <div className="border border-red-100 rounded-lg p-3 bg-red-50/30">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-6 h-6 rounded bg-red-100 flex items-center justify-center text-red-600"><AlertTriangle size={12} /></div>
                       <span className="text-[10px] font-semibold text-gray-600">High Risk Enterprises</span>
                    </div>
                    <div className="text-[18px] font-bold text-red-600 leading-none mb-1">475</div>
                    <div className="text-[10px] font-bold text-green-600 flex items-center gap-0.5">↓ 210 (32%)</div>
                 </div>
                 <div className="border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-6 h-6 rounded bg-purple-50 flex items-center justify-center text-purple-600"><Building size={12} /></div>
                       <span className="text-[10px] font-semibold text-gray-600">Cashflow Stressed</span>
                    </div>
                    <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">742</div>
                    <div className="text-[10px] font-bold text-green-600 flex items-center gap-0.5">↓ 384 (34%)</div>
                 </div>
                 <div className="border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center text-blue-600"><CloudRain size={12} /></div>
                       <span className="text-[10px] font-semibold text-gray-600">Default Probability (Avg.)</span>
                    </div>
                    <div className="text-[18px] font-bold text-gray-900 leading-none mb-1">8.7%</div>
                    <div className="text-[10px] font-bold text-green-600 flex items-center gap-0.5">↓ 3.9 pts</div>
                 </div>
              </div>
           </div>

           {/* Section 5: Impact by Dimension Charts */}
           <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h2 className="text-[13px] font-bold text-gray-900 mb-4">5. Impact by Dimension</h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                 <div>
                    <div className="text-[10px] font-bold text-gray-700 text-center mb-1">Repayment Rate (%)</div>
                    <MiniImpactChart dataKeyBase="base" dataKeyScen="scenario" colorStr="#10b981" />
                    <div className="flex items-center justify-between mt-1 px-4 text-[8px] text-gray-400 font-semibold">
                      <span>Now</span><span>+6M</span>
                    </div>
                 </div>
                 <div>
                    <div className="text-[10px] font-bold text-gray-700 text-center mb-1">Expected Credit Loss (₹ Cr)</div>
                    <MiniImpactChart dataKeyBase="baseECL" dataKeyScen="scenECL" colorStr="#10b981" />
                    <div className="flex items-center justify-between mt-1 px-4 text-[8px] text-gray-400 font-semibold">
                      <span>Now</span><span>+6M</span>
                    </div>
                 </div>
                 <div>
                    <div className="text-[10px] font-bold text-gray-700 text-center mb-1">High Risk Enterprises (No.)</div>
                    <MiniImpactChart dataKeyBase="baseHR" dataKeyScen="scenHR" colorStr="#10b981" />
                    <div className="flex items-center justify-between mt-1 px-4 text-[8px] text-gray-400 font-semibold">
                      <span>Now</span><span>+6M</span>
                    </div>
                 </div>
                 <div>
                    <div className="text-[10px] font-bold text-gray-700 text-center mb-1">Cashflow Stressed (No.)</div>
                    <MiniImpactChart dataKeyBase="baseCS" dataKeyScen="scenCS" colorStr="#10b981" />
                    <div className="flex items-center justify-between mt-1 px-4 text-[8px] text-gray-400 font-semibold">
                      <span>Now</span><span>+6M</span>
                    </div>
                 </div>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                 <div className="flex items-center gap-1.5"><div className="w-3 border-t-2 border-dashed border-gray-400"></div><span className="text-[9px] font-medium text-gray-500">Base</span></div>
                 <div className="flex items-center gap-1.5"><div className="w-3 border-t-2 border-solid border-green-500"></div><span className="text-[9px] font-medium text-gray-900">Scenario</span></div>
              </div>
           </div>

           {/* Section 6: Top Districts */}
           <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h2 className="text-[13px] font-bold text-gray-900 mb-3">6. Top Districts Benefiting</h2>
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b border-gray-100">
                       <th className="py-2 text-[10px] font-semibold text-gray-400">District</th>
                       <th className="py-2 text-[10px] font-semibold text-gray-400 text-center">Risk Change</th>
                       <th className="py-2 text-[10px] font-semibold text-gray-400 text-center">Repayment Rate Change</th>
                       <th className="py-2 text-[10px] font-semibold text-gray-400 text-center">ECL Change (₹ Cr)</th>
                       <th className="py-2 text-[10px] font-semibold text-gray-400 text-right">Enterprises Benefiting</th>
                    </tr>
                 </thead>
                 <tbody>
                    {DISTRICTS_DATA.map((d, i) => (
                      <tr key={i} className="border-b border-gray-50 last:border-0">
                         <td className="py-1.5 text-[11px] font-semibold text-gray-900">{d.dist}</td>
                         <td className="py-1.5 text-[11px] font-bold text-green-600 text-center">↓ {d.risk.replace('+ ','')}</td>
                         <td className="py-1.5 text-[11px] font-bold text-green-600 text-center">{d.rep}</td>
                         <td className="py-1.5 text-[11px] font-bold text-green-600 text-center">{d.ecl}</td>
                         <td className="py-1.5 text-[11px] font-bold text-gray-900 text-right">{d.ent}</td>
                      </tr>
                    ))}
                 </tbody>
              </table>
              <button className="text-[10px] font-bold text-green-700 mt-2 flex items-center gap-1 hover:text-green-800">
                 View full district impact <ArrowRight size={10} />
              </button>
           </div>

        </div>
        ) : (
          <div className="col-span-5 flex flex-col items-center justify-center bg-gray-50/50 border border-dashed border-gray-200 rounded-xl min-h-[400px]">
            <Sparkles size={32} className="text-gray-300 mb-3" />
            <div className="text-[13px] font-bold text-gray-500 mb-1">Awaiting Simulation</div>
            <div className="text-[11px] text-gray-400 text-center max-w-[200px]">Configure policy parameters and run simulation to see AI-projected portfolio impact.</div>
          </div>
        )}

      </div>

      {/* 7. Bottom Table */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm mt-6">
         <h2 className="text-[13px] font-bold text-gray-900 mb-4">7. Policy Scenario Comparison</h2>
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="border-b border-gray-200">
                  <th className="py-2 px-4 text-[11px] font-bold text-gray-900 w-1/5">Metric</th>
                  <th className="py-2 px-4 text-[11px] font-bold text-gray-900 text-center">Base (Current)</th>
                  <th className="py-2 px-4 text-center">
                     <div className="text-[11px] font-bold text-gray-900">Scenario 1</div>
                     <div className="text-[9px] font-semibold text-gray-500">Interest Subvention (3%)</div>
                  </th>
                  <th className="py-2 px-4 text-center">
                     <div className="text-[11px] font-bold text-gray-900">Scenario 2</div>
                     <div className="text-[9px] font-semibold text-gray-500">Subvention + Guarantee (75%)</div>
                  </th>
                  <th className="py-2 px-4 text-center border-x border-green-100 bg-green-50/30 rounded-t-lg">
                     <div className="text-[11px] font-bold text-green-700">Scenario 3</div>
                     <div className="text-[9px] font-semibold text-green-600">Comprehensive Policy</div>
                  </th>
                  <th className="py-2 px-4 text-[11px] font-bold text-gray-900 text-center">Best Impact</th>
               </tr>
            </thead>
            <tbody>
               {SCENARIO_DATA.map((row, i) => (
                 <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-[11px] font-semibold text-gray-700">{row.metric}</td>
                    <td className="py-3 px-4 text-[11px] font-bold text-gray-900 text-center">{row.base}</td>
                    <td className="py-3 px-4 text-[11px] font-bold text-green-600 text-center">{row.s1}</td>
                    <td className="py-3 px-4 text-[11px] font-bold text-green-600 text-center">{row.s2}</td>
                    <td className="py-3 px-4 text-[11px] font-bold text-green-700 text-center border-x border-green-100 bg-green-50/30">{row.s3}</td>
                    <td className="py-3 px-4 text-[10px] font-bold text-green-600 text-center">
                      <span className="bg-green-100 px-2 py-1 rounded text-green-700">{row.best}</span>
                    </td>
                 </tr>
               ))}
            </tbody>
         </table>
         <div className="mt-4">
            <button className="text-[11px] font-bold text-indigo-700 flex items-center gap-1.5 hover:text-indigo-800">
               Download comparison <DownloadCloud size={12} />
            </button>
         </div>
      </div>

    </div>
  );
}
