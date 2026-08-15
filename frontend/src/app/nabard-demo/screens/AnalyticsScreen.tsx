"use client";

import React from 'react';
import { 
  Menu, Download, SlidersHorizontal, Filter, Search, Columns, ArrowUpDown, MoreVertical,
  Building2, CheckCircle2, FileText, PieChart, AlertTriangle, ChevronDown, Activity
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import GM_card from '../../../assests/images/GM_card.png';

const KPIS = [
  { title: 'Total Enterprises', value: '4,321', delta: '6.2%', isUp: true, icon: Building2, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
  { title: 'Active Enterprises', value: '3,652', delta: '5.8%', isUp: true, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  { title: 'Avg. Loan Amount', value: '₹12.65 Lakh', delta: '3.4%', isUp: true, icon: FileText, color: 'text-amber-500 bg-amber-50 border-amber-100' },
  { title: 'High Risk Enterprises', value: '356', delta: '4.1%', isUp: false, icon: PieChart, color: 'text-purple-600 bg-purple-50 border-purple-100' },
  { title: 'Delinquent Enterprises', value: '245', delta: '2.7%', isUp: false, isBadUp: true, icon: AlertTriangle, color: 'text-red-500 bg-red-50 border-red-100' },
];

const ENTERPRISES = [
  { name: 'Krishna Dairy Farm', village: 'Pimpalgaon (B)', sector: 'Dairy', owner: 'Suresh Patil', loan: '₹25,00,000', score: 81, risk: 'Low', npa: 'Standard', date: '20 May 2025' },
  { name: 'Shakti Poultry Farm', village: 'Surgana', sector: 'Poultry', owner: 'Anita More', loan: '₹18,50,000', score: 72, risk: 'Medium', npa: 'Standard', date: '20 May 2025' },
  { name: 'Green Valley Produce', village: 'Nandgaon', sector: 'F&V', owner: 'Ramesh Jadhav', loan: '₹12,30,000', score: 65, risk: 'Medium', npa: 'Standard', date: '20 May 2025' },
  { name: 'Sai Grains & Flour Mill', village: 'Deola', sector: 'Food Processing', owner: 'Vijay Shinde', loan: '₹45,00,000', score: 48, risk: 'High', npa: 'Watchlist', date: '20 May 2025' },
  { name: 'Om Sai Agri Equipments', village: 'Dindori', sector: 'Agri Services', owner: 'Mahesh Pawar', loan: '₹8,75,000', score: 39, risk: 'High', npa: 'Sub-standard', date: '20 May 2025' },
  { name: 'Yashodeep Handlooms', village: 'Igatpuri', sector: 'Handloom', owner: 'Sunita Gaikwad', loan: '₹6,20,000', score: 74, risk: 'Low', npa: 'Standard', date: '20 May 2025' },
  { name: 'Rudra Agro Inputs', village: 'Trimbakeshwar', sector: 'Agri Input', owner: 'Prakash Borse', loan: '₹9,10,000', score: 67, risk: 'Medium', npa: 'Standard', date: '20 May 2025' },
  { name: 'Mahalaxmi Dairy', village: 'Yeola', sector: 'Dairy', owner: 'Kailas Sonawane', loan: '₹22,40,000', score: 83, risk: 'Low', npa: 'Standard', date: '20 May 2025' },
  { name: 'Navjeevan Bakery', village: 'Nashik', sector: 'Food Processing', owner: 'Harshal Patil', loan: '₹15,00,000', score: 59, risk: 'Medium', npa: 'Watchlist', date: '20 May 2025' },
  { name: 'Shree Ganesh Traders', village: 'Peint', sector: 'Retail', owner: 'Ganesh Thakur', loan: '₹7,80,000', score: 76, risk: 'Low', npa: 'Standard', date: '20 May 2025' },
];

function MiniSparkline({ color }: { color: string }) {
  const data = Array.from({length: 10}, () => ({ v: Math.random() * 100 }));
  return (
    <div className="w-16 h-5">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function getRiskColor(risk: string) {
  if (risk === 'Low') return 'text-emerald-600 bg-emerald-50';
  if (risk === 'Medium') return 'text-amber-500 bg-amber-50';
  return 'text-red-500 bg-red-50';
}

function getNpaColor(npa: string) {
  if (npa === 'Standard') return 'text-emerald-600 bg-emerald-50';
  if (npa === 'Watchlist') return 'text-amber-500 bg-amber-50';
  return 'text-red-500 bg-red-50';
}

function getSparkColor(risk: string) {
  if (risk === 'Low') return '#10b981';
  if (risk === 'Medium') return '#f59e0b';
  return '#ef4444';
}

function ScoreBadge({ score }: { score: number }) {
  let color = 'text-red-600';
  if (score >= 70) color = 'text-emerald-600';
  else if (score >= 50) color = 'text-amber-500';
  
  return <span className={`font-bold ${color}`}>{score}</span>;
}

export default function AnalyticsScreen() {
  return (
    <div className="space-y-5 pb-10">
      {/* HERO BANNER */}
      <div className="relative w-full rounded-[24px] overflow-hidden p-8 flex flex-col justify-between shadow-sm mb-2"
           style={{ 
             backgroundImage: `url(${GM_card.src})`, 
             backgroundSize: 'cover', 
             backgroundPosition: 'right center',
             minHeight: '200px' 
           }}>
        <div className="relative z-10 w-[70%] max-w-[950px]">
          <h1 className="text-[28px] font-bold text-gray-900 mb-1">Performance Insights</h1>
          <p className="text-[14px] text-gray-700 font-medium mb-8">Deep dive into sector performance, yields, and growth trends.</p>
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/50 p-5 flex items-center gap-4 w-fit">
             <div className="bg-green-100 p-2 rounded-xl"><Activity size={20} className="text-green-600" /></div>
             <div>
               <div className="text-[14px] font-bold text-gray-900">Sector Growth Trend</div>
               <div className="text-[12px] text-gray-600 font-medium">Dairy sector showing 12% YoY growth despite recent climate challenges.</div>
             </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Dropdowns */}
          {[
            { label: 'State', value: 'Maharashtra' },
            { label: 'District', value: 'Nashik' },
            { label: 'Sector', value: 'All Sectors' },
            { label: 'Risk Level', value: 'All' },
            { label: 'Loan Amount', value: 'All' },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-1.5 shadow-sm">
              <span className="text-[11px] font-medium text-gray-500">{f.label}</span>
              <select className="text-[12px] font-medium text-gray-900 bg-transparent focus:outline-none appearance-none cursor-pointer pr-4 hover:text-indigo-600 transition-colors"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '8px auto' }}
              >
                <option>{f.value}</option>
              </select>
            </div>
          ))}
          
          <button className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-xl px-3 py-1.5 text-[12px] font-medium text-gray-700 shadow-sm hover:bg-gray-50">
            <SlidersHorizontal size={14} className="text-gray-400" /> Filters
          </button>
          
          <button className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-1.5 text-[12px] font-medium text-indigo-700 shadow-sm hover:bg-indigo-100">
            <Filter size={14} className="text-indigo-600" /> Filters
          </button>
        </div>
        
        <button className="flex items-center gap-1.5 bg-white border border-indigo-200 rounded-xl px-4 py-1.5 text-[12px] font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50">
          <Download size={14} /> Export
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-5 gap-4">
        {KPIS.map((kpi, idx) => (
          idx === 0 ? (
            <div key={kpi.title} className="bg-gradient-to-br from-indigo-950 to-indigo-900 rounded-[20px] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-50/50 flex flex-col justify-between h-[130px]">
              <div className="text-[13px] font-semibold text-indigo-200 mb-1">
                {kpi.title}
              </div>
              <div className="flex items-end justify-between mt-auto">
                <div>
                  <div className="text-[28px] font-bold text-white leading-none mb-3 tracking-tight">{kpi.value}</div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 font-bold text-[11px] rounded-md ${kpi.isBadUp ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                      {kpi.isUp || kpi.isBadUp ? '↑' : '↓'} {kpi.delta}
                    </span>
                    <span className="text-[11px] font-medium text-indigo-300">vs last month</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div key={kpi.title} className="bg-white rounded-[20px] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-50/50 flex flex-col justify-between h-[130px]">
              <div className="text-[13px] font-semibold text-gray-500 mb-1">
                {kpi.title}
              </div>
              <div className="flex items-end justify-between mt-auto">
                <div>
                  <div className="text-[28px] font-bold text-gray-900 leading-none mb-3 tracking-tight">{kpi.value}</div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 font-bold text-[11px] rounded-md ${kpi.isBadUp ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                      {kpi.isUp || kpi.isBadUp ? '↑' : '↓'} {kpi.delta}
                    </span>
                    <span className="text-[11px] font-medium text-gray-400">vs last month</span>
                  </div>
                </div>
              </div>
            </div>
          )
        ))}
      </div>

      {/* Main Table Area */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        {/* Table Header Controls */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-[14px] font-bold text-gray-900">Enterprise List</h2>
            <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full">4,321</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search in table..." className="w-[200px] pl-8 pr-3 py-1.5 text-[11px] border border-gray-100 rounded-xl text-gray-700 focus:outline-none focus:border-indigo-300" />
            </div>
            
            <button className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-xl px-3 py-1.5 text-[11px] font-medium text-gray-700 shadow-sm hover:bg-gray-50">
              <Columns size={12} className="text-gray-400" /> Columns <ChevronDown size={10} className="text-gray-400" />
            </button>
            <button className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-xl px-3 py-1.5 text-[11px] font-medium text-gray-700 shadow-sm hover:bg-gray-50">
              <ArrowUpDown size={12} className="text-gray-400" /> Sort <ChevronDown size={10} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-3 px-4 w-10 text-center"><input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /></th>
                <th className="py-3 px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Enterprise Name</th>
                <th className="py-3 px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Village</th>
                <th className="py-3 px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Sector</th>
                <th className="py-3 px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="py-3 px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Loan Amount</th>
                <th className="py-3 px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Health Score</th>
                <th className="py-3 px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Risk Level</th>
                <th className="py-3 px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">NPA Status</th>
                <th className="py-3 px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Trend (30 Days)</th>
                <th className="py-3 px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Last Updated</th>
                <th className="py-3 px-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ENTERPRISES.map((ent, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-center"><input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /></td>
                  <td className="py-3 px-2 text-[12px] font-bold text-gray-900">{ent.name}</td>
                  <td className="py-3 px-2 text-[12px] text-gray-600">{ent.village}</td>
                  <td className="py-3 px-2 text-[12px] text-gray-600">{ent.sector}</td>
                  <td className="py-3 px-2 text-[12px] text-gray-600">{ent.owner}</td>
                  <td className="py-3 px-2 text-[12px] font-medium text-gray-900">{ent.loan}</td>
                  <td className="py-3 px-2 text-[12px] text-center"><ScoreBadge score={ent.score} /></td>
                  <td className="py-3 px-2 text-[11px]">
                    <span className={`px-2 py-0.5 rounded font-semibold ${getRiskColor(ent.risk)}`}>{ent.risk}</span>
                  </td>
                  <td className="py-3 px-2 text-[11px]">
                    <span className={`px-2 py-0.5 rounded font-semibold ${getNpaColor(ent.npa)}`}>{ent.npa}</span>
                  </td>
                  <td className="py-3 px-2">
                    <MiniSparkline color={getSparkColor(ent.risk)} />
                  </td>
                  <td className="py-3 px-2 text-[11px] text-gray-500">{ent.date}</td>
                  <td className="py-3 px-4 text-center">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <div className="text-[11px] text-gray-500">
            Showing <span className="font-bold text-gray-900">1 to 10</span> of <span className="font-bold text-gray-900">4,321</span> enterprises
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <select className="border border-gray-100 rounded-md px-2 py-1 text-[11px] text-gray-700 bg-white focus:outline-none">
                <option>10 per page</option>
              </select>
            </div>
            
            <div className="flex items-center gap-1">
              <button className="w-7 h-7 rounded border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50">«</button>
              <button className="w-7 h-7 rounded border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50">‹</button>
              <button className="w-7 h-7 rounded border border-indigo-600 bg-indigo-50 text-indigo-600 font-medium text-[11px] flex items-center justify-center">1</button>
              <button className="w-7 h-7 rounded border border-gray-100 text-gray-600 font-medium text-[11px] flex items-center justify-center hover:bg-gray-50">2</button>
              <button className="w-7 h-7 rounded border border-gray-100 text-gray-600 font-medium text-[11px] flex items-center justify-center hover:bg-gray-50">3</button>
              <button className="w-7 h-7 rounded border border-gray-100 text-gray-600 font-medium text-[11px] flex items-center justify-center hover:bg-gray-50">4</button>
              <button className="w-7 h-7 rounded border border-gray-100 text-gray-600 font-medium text-[11px] flex items-center justify-center hover:bg-gray-50">5</button>
              <span className="px-1 text-gray-400">...</span>
              <button className="w-7 h-7 rounded border border-gray-100 text-gray-600 font-medium text-[11px] flex items-center justify-center hover:bg-gray-50">433</button>
              <button className="w-7 h-7 rounded border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-50">›</button>
              <button className="w-7 h-7 rounded border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-50">»</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
