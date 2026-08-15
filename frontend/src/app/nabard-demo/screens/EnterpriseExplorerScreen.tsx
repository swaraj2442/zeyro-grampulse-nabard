"use client";

import React, { useState } from 'react';
import { Screen } from '../GramPulseApp';
import { Search, Filter, Download } from 'lucide-react';
import { useGramPulse } from '../store/GramPulseContext';
import { selectAllEnterprises, selectEnterpriseWarning } from '../store/gramPulseSelectors';

interface EnterpriseExplorerProps {
  navigateTo: (s: Screen, enterprise?: string) => void;
}

const STATIC_ENTERPRISES = [
  { id: 'E-001', name: 'Ramesh Dairy',        village: 'Borgaon',    district: 'Nashik',  sector: 'Dairy',        type: 'SHG',        health: 81, risk: 'Low',    loan: '₹2,50,000', officer: 'Priya S.'   },
  { id: 'E-002', name: 'Shiv Poultry Farm',   village: 'Borgaon',    district: 'Nashik',  sector: 'Poultry',      type: 'FPO',        health: 43, risk: 'High',   loan: '₹1,80,000', officer: 'Priya S.'   },
  { id: 'E-003', name: 'Lakshmi Handicrafts', village: 'Nimgon',     district: 'Nashik',  sector: 'Handicrafts',  type: 'SHG',        health: 62, risk: 'Medium', loan: '₹1,30,000', officer: 'Amit P.'    },
  { id: 'E-004', name: 'Ganesh Retail Store', village: 'Nashik',     district: 'Nashik',  sector: 'Retail',       type: 'Individual', health: 69, risk: 'Low',    loan: '₹80,000',   officer: 'Priya S.'   },
  { id: 'E-005', name: 'Sita Fishery',        village: 'Pimgalpur',  district: 'Nashik',  sector: 'Fishery',      type: 'FPO',        health: 55, risk: 'Medium', loan: '₹1,10,000', officer: 'Amit P.'    },
  { id: 'E-006', name: 'Sunil Vegetables',    village: 'Yeola',      district: 'Nashik',  sector: 'Retail',       type: 'Individual', health: 70, risk: 'Low',    loan: '₹80,000',   officer: 'Sandeep K.' },
  { id: 'E-007', name: 'Patil Agriculture',   village: 'Dindori',    district: 'Nashik',  sector: 'Agriculture',  type: 'FPO',        health: 36, risk: 'High',   loan: '₹1,50,000', officer: 'Sandeep K.' },
  { id: 'E-008', name: 'Meena Tailoring',     village: 'Sinnar',     district: 'Nashik',  sector: 'Tailoring',    type: 'SHG',        health: 64, risk: 'Medium', loan: '₹60,000',   officer: 'Amit P.'    },
];

const RISK_CONFIG: Record<string, { bg: string; text: string }> = {
  Low:    { bg: 'bg-green-100',  text: 'text-green-800'  },
  Medium: { bg: 'bg-amber-100',  text: 'text-amber-800'  },
  Amber:  { bg: 'bg-amber-100',  text: 'text-amber-800'  },
  High:   { bg: 'bg-red-100',    text: 'text-red-700'    },
  Critical: { bg: 'bg-red-200',  text: 'text-red-900'    },
};

function HealthBar({ score }: { score: number }) {
  const color = score >= 70 ? '#16a34a' : score >= 55 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-center gap-2">
      <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-[11px] font-bold tabular-nums" style={{ color }}>{score}</span>
    </div>
  );
}

export default function EnterpriseExplorerScreen({ navigateTo }: EnterpriseExplorerProps) {
  const { state } = useGramPulse();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Map context enterprises
  const contextEnterprises = selectAllEnterprises(state).map(ent => {
    const warning = selectEnterpriseWarning(state, ent.id);
    return {
      id: ent.id,
      name: ent.name,
      village: ent.block, // approximate
      district: ent.district,
      sector: ent.sector,
      type: ent.enterpriseType,
      health: Math.min(100, Math.max(0, 100 - (warning?.riskScore || 20))),
      risk: warning?.riskLevel || 'Low',
      loan: '₹2,00,000', // Mock loan for context enterprises
      officer: 'Rohan D.'
    };
  });

  const allEnterprises = [...contextEnterprises, ...STATIC_ENTERPRISES];

  const filtered = allEnterprises.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.village.toLowerCase().includes(search.toLowerCase()) ||
    e.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900">Enterprise Twin</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">Find and filter enterprises · Showing Nashik district</p>
        </div>
        <button className="flex items-center gap-1.5 border border-gray-100 rounded-xl px-3 py-1.5 text-[12px] text-gray-600 bg-white hover:bg-gray-50 transition-colors">
          <Download size={13} /> Export
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by enterprise name, village, or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-[12px] bg-white border border-gray-100 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
          />
        </div>
        <button className="flex items-center gap-1.5 border border-gray-100 rounded-xl px-3 py-2 text-[12px] text-gray-600 bg-white hover:bg-gray-50 transition-colors">
          <Filter size={13} /> Filters
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['Enterprise', 'Entity Type', 'Village', 'District', 'Sector', 'Health', 'Risk', 'Loan Amt.', 'Officer'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(e => {
              const rc = RISK_CONFIG[e.risk] || RISK_CONFIG['Low'];
              return (
                <tr
                  key={e.id}
                  onClick={() => navigateTo('twin', e.id)}
                  className="hover:bg-green-50 cursor-pointer transition-colors group"
                >
                  <td className="px-4 py-3">
                    <div className="text-[12px] font-bold text-gray-900 group-hover:text-green-800">{e.name}</div>
                    <div className="text-[10px] text-gray-400">{e.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                      {e.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-gray-600">{e.village}</td>
                  <td className="px-4 py-3 text-[12px] text-gray-600">{e.district}</td>
                  <td className="px-4 py-3 text-[12px] text-gray-600">{e.sector}</td>
                  <td className="px-4 py-3"><HealthBar score={e.health} /></td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${rc.bg} ${rc.text}`}>
                      {e.risk}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-gray-700 font-medium">{e.loan}</td>
                  <td className="px-4 py-3 text-[11px] text-gray-500">{e.officer}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] text-gray-400">Showing 1 to {filtered.length} of 2,341</span>
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-md text-[11px] font-medium transition-colors ${page === p ? 'bg-green-700 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                {p}
              </button>
            ))}
            <span className="text-gray-300 px-1">...</span>
            <button className="w-7 h-7 rounded-md text-[11px] text-gray-500 hover:bg-gray-100">293</button>
          </div>
        </div>
      </div>
    </div>
  );
}
