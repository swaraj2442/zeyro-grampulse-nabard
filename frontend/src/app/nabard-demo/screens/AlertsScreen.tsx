"use client";

import React, { useState } from 'react';
import { Screen } from '../GramPulseApp';
import { CheckCheck } from 'lucide-react';
import { useGramPulse } from '../store/GramPulseContext';

interface Props { navigateTo: (s: Screen, enterprise?: string) => void; }

interface AlertItem {
  id: string;
  enterpriseId?: string;
  severity: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  status: string;
}

const STATIC_ALERTS: AlertItem[] = [
  { id: 'STATIC-1', severity: 'Critical', title: 'Nashik District Rainfall',          desc: 'Rainfall 32% below normal in Nashik.',              time: '10:32 AM',  unread: true, status: 'Active'  },
  { id: 'STATIC-2', severity: 'High',     title: 'Milk Price Drop',             desc: 'Milk price decreased 9% in the last 24 hours.',           time: '10:15 AM',  unread: true, status: 'Active'  },
  { id: 'STATIC-3', severity: 'Critical', title: 'Cash Deficit Risk',           desc: 'High risk cluster detected in Nashik block.',             time: '08:45 AM',  unread: true, status: 'Active'  },
  { id: 'STATIC-4', severity: 'High',     title: 'Repayment Delay Increased',   desc: 'Avg. repayment delay increased by 3%.',                   time: 'Yesterday', unread: false, status: 'Active' },
  { id: 'STATIC-5', severity: 'Medium',   title: 'Feed Cost Spike — Poultry',   desc: 'Poultry feed cost up 12%. 890 enterprises affected.',     time: 'Yesterday', unread: false, status: 'Active' },
  { id: 'STATIC-6', severity: 'Low',      title: 'District Health Improved',    desc: 'Pune Rural district health score improved by 4 points.',  time: '2 days ago',unread: false, status: 'Active' },
];

const SEV_CONFIG: Record<string, { border: string; dot: string; text: string; tab: string }> = {
  Critical: { border: 'border-l-red-400',   dot: '🔴', text: 'text-red-600',   tab: 'Critical' },
  High:     { border: 'border-l-amber-400', dot: '🟠', text: 'text-amber-600', tab: 'High'     },
  Medium:   { border: 'border-l-yellow-400',dot: '🟡', text: 'text-yellow-600',tab: 'Medium'   },
  Low:      { border: 'border-l-green-400', dot: '🟢', text: 'text-green-600', tab: 'Low'      },
};

const TABS = ['All', 'Critical', 'High', 'Medium', 'Low'];

export default function AlertsScreen({ navigateTo }: Props) {
  const { state, dispatch } = useGramPulse();
  const [activeTab, setActiveTab] = useState('All');
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // Merge context alerts with static alerts
  const contextAlerts = Object.values(state.alerts).filter(a => a.status === 'Active');
  
  // Format context alerts to match the UI expectations
  const formattedContextAlerts: AlertItem[] = contextAlerts.map(a => ({
    id: a.id,
    enterpriseId: a.enterpriseId,
    severity: a.riskLevel === 'Critical' ? 'Critical' : a.riskLevel === 'High' ? 'High' : a.riskLevel === 'Amber' ? 'Medium' : 'Low',
    title: a.title,
    desc: a.description,
    time: 'Just now',
    unread: true,
    status: a.status
  }));

  const allAlerts = [...formattedContextAlerts, ...STATIC_ALERTS];

  const filtered = activeTab === 'All'
    ? allAlerts
    : allAlerts.filter(a => a.severity === activeTab);

  const markRead = (id: string) => setReadIds(prev => new Set([...prev, id]));
  const markAll  = () => setReadIds(new Set(allAlerts.map(a => a.id)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900">GramPulse Recommender</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">AI Risk & Actionable Recommendations Feed · Real-time · NABARD Maharashtra</p>
        </div>
        <button onClick={markAll}
          className="flex items-center gap-1.5 border border-gray-100 rounded-xl px-3 py-1.5 text-[12px] text-gray-600 bg-white hover:bg-gray-50 transition-colors">
          <CheckCheck size={13} /> Mark all as read
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-gray-100">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-[12px] font-medium border-b-2 transition-colors ${
              activeTab === tab ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Alert cards */}
      <div className="space-y-2">
        {filtered.map(alert => {
          const c = SEV_CONFIG[alert.severity] || SEV_CONFIG['Low'];
          const isRead = readIds.has(alert.id) || !alert.unread;
          return (
            <div key={alert.id}
              className={`bg-white rounded-xl border border-l-4 ${c.border} border-r-gray-100 border-t-gray-100 border-b-gray-100 p-4 shadow-sm transition-all ${isRead ? 'opacity-70' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2.5">
                  <span className="text-[16px] mt-0.5">{c.dot}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[13px] font-semibold ${c.text}`}>{alert.title}</span>
                      {alert.unread && !readIds.has(alert.id) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      )}
                    </div>
                    <p className="text-[12px] text-gray-500 mt-0.5">{alert.desc}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button 
                        onClick={() => {
                          if ('enterpriseId' in alert && alert.enterpriseId) {
                            navigateTo('twin', alert.enterpriseId);
                          } else {
                            navigateTo('portfolio');
                          }
                        }}
                        className="text-[11px] text-green-700 font-medium hover:underline">
                        → {'enterpriseId' in alert ? 'View enterprise' : 'View affected enterprises'}
                      </button>
                      <button onClick={() => markRead(alert.id)}
                        className="text-[11px] text-gray-400 hover:text-gray-600">
                        ✓ Mark as read
                      </button>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0 ml-4">{alert.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
