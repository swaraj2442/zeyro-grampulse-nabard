"use client";

import React from 'react';
import { RefreshCw, Copy, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const COMMODITIES = [
  { name: 'Milk (per Ltr)',        price: '₹42.5',  change: '+9%',  trend: 'up',   impact: 'Positive', impactFor: 'Dairy sellers'  },
  { name: 'Cattle Feed (per kg)',  price: '₹28.0',  change: '+12%', trend: 'up',   impact: 'Negative', impactFor: 'Dairy buyers'   },
  { name: 'Rice (per qt)',         price: '₹36.0',  change: '-3%',  trend: 'down', impact: 'Positive', impactFor: 'Food processors' },
  { name: 'Cotton (per kg)',       price: '₹68.0',  change: '+5%',  trend: 'up',   impact: 'Positive', impactFor: 'Cotton sellers' },
  { name: 'Turnip (per kg)',       price: '₹148.0', change: '+13%', trend: 'up',   impact: 'Negative', impactFor: 'Food processors' },
  { name: 'Vegetables (Index)',    price: '₹103.0', change: '-2%',  trend: 'down', impact: 'Neutral',  impactFor: 'Retail'         },
];

const THIS_MONTH = [
  { icon: '🐄', text: 'Milk prices up 9% — positive for dairy sellers, negative margin pressure on dairy buyers.' },
  { icon: '🌾', text: 'Feed cost spike (+12%) is squeezing poultry margins across Nashik cluster.' },
  { icon: '🌽', text: 'Rice prices eased 3% — relief for food processors.' },
  { icon: '⚠️', text: '2,341 enterprises directly exposed to adverse commodity movements this month.' },
];

const IMPACT_STYLE: Record<string, string> = {
  Positive: 'text-green-700 font-semibold',
  Negative: 'text-red-600 font-semibold',
  Neutral:  'text-gray-400',
};

const TREND_ICONS: Record<string, React.ReactNode> = {
  up:   <TrendingUp  size={13} className="text-red-400" />,
  down: <TrendingDown size={13} className="text-green-500" />,
  flat: <Minus size={13} className="text-gray-400" />,
};

export default function MarketScreen() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900">Market Intelligence</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">Commodity prices & enterprise impact · Live AGMARKNET</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 border border-gray-100 rounded-xl px-3 py-1.5 text-[12px] text-gray-600 bg-white hover:bg-gray-50 transition-colors">
            <RefreshCw size={13} /> Refresh
          </button>
          <button className="flex items-center gap-1.5 border border-gray-100 rounded-xl px-3 py-1.5 text-[12px] text-gray-600 bg-white hover:bg-gray-50 transition-colors">
            <Copy size={13} /> Copy
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Commodities Table */}
        <div className="col-span-8 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Commodity', 'Current Price', 'Change', 'Trend', 'Impact on Enterprises'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {COMMODITIES.map(c => (
                <tr key={c.name} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-[12px] font-bold text-gray-900">{c.name}</div>
                    <div className="text-[10px] text-gray-400">{c.impactFor}</div>
                  </td>
                  <td className="px-4 py-3 text-[13px] font-bold text-gray-900">{c.price}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[12px] font-bold ${c.change.startsWith('+') ? 'text-red-500' : 'text-green-600'}`}>
                      {c.change}
                    </span>
                  </td>
                  <td className="px-4 py-3">{TREND_ICONS[c.trend]}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[12px] ${IMPACT_STYLE[c.impact]}`}>{c.impact}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2.5 border-t border-gray-100 text-[10px] text-gray-400">
            Source: AGMARKNET · Updated 30 May 2026 · 9:00 AM
          </div>
        </div>

        {/* This Month panel */}
        <div className="col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="text-[12px] font-bold text-gray-800 mb-3 uppercase tracking-wide text-[10px] text-gray-400">THIS MONTH</div>
            <div className="space-y-3">
              {THIS_MONTH.map((item, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-xl">
                  <span className="text-[14px] shrink-0">{item.icon}</span>
                  <p className="text-[11px] text-gray-600 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key price movement */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <div className="text-[11px] font-bold text-amber-700 mb-2">Biggest Movement</div>
            <div className="flex items-end gap-2">
              <div>
                <div className="text-[10px] text-gray-500">Turnip</div>
                <div className="text-[28px] font-bold text-red-500">+13%</div>
              </div>
              <div className="text-[10px] text-gray-400 pb-1">↑ highest spike this month</div>
            </div>
            <div className="mt-2 text-[10px] text-amber-800">Affects 3,200 food processing enterprises</div>
          </div>
        </div>
      </div>
    </div>
  );
}
