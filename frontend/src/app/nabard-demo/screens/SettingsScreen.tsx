"use client";

import React, { useState } from 'react';
import { User, Users, Bell, Database, Lock, ChevronRight, Edit2, Check, Wheat } from 'lucide-react';

const NAV = [
  { icon: Users,    label: 'Users & Roles',           desc: 'Manage users and permissions'          },
  { icon: Bell,     label: 'Notification Preferences',desc: 'Manage alerts and notifications'       },
  { icon: Database, label: 'Data & Integrations',     desc: 'Manage data sources and integrations'  },
  { icon: Lock,     label: 'Security',                desc: 'Password, 2FA and security settings'   },
];



function IntegrationsPanel() {
  const integrations = [
    { name: 'Account Aggregator (AA)', status: 'Connected', color: 'text-green-600', dot: 'bg-green-500' },
    { name: 'AGMARKNET Commodity',     status: 'Connected', color: 'text-green-600', dot: 'bg-green-500' },
    { name: 'IMD Weather API',         status: 'Connected', color: 'text-green-600', dot: 'bg-green-500' },
    { name: 'Credit Bureau',           status: 'Partial',   color: 'text-amber-600', dot: 'bg-amber-400' },
    { name: 'NDMA Disaster Feed',      status: 'Connected', color: 'text-green-600', dot: 'bg-green-500' },
  ];
  return (
    <div className="space-y-3">
      {integrations.map(i => (
        <div key={i.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <span className="text-[12px] font-medium text-gray-800">{i.name}</span>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${i.dot}`} />
            <span className={`text-[11px] font-medium ${i.color}`}>{i.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

const PANELS: Record<string, React.ReactNode> = {
  'Data & Integrations':      <IntegrationsPanel />,
  'Users & Roles':            <div className="text-[12px] text-gray-500 p-4">User and role management panel. Manage officers, assign districts, set permissions.</div>,
  'Notification Preferences': <div className="text-[12px] text-gray-500 p-4">Toggle alert types, frequency, and delivery channels (in-app / SMS / email).</div>,
  'Security':                 <div className="text-[12px] text-gray-500 p-4">Two-factor authentication, OTP settings, and session management.</div>,
};

export default function SettingsScreen() {
  const [active, setActive] = useState('Users & Roles');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[20px] font-bold text-gray-900">Settings</h1>
        <p className="text-[12px] text-gray-400 mt-0.5">Platform configuration · NABARD Maharashtra</p>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Nav */}
        <div className="col-span-4 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {NAV.map(item => {
            const Icon = item.icon;
            return (
              <button key={item.label} onClick={() => setActive(item.label)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-gray-50 last:border-0 transition-colors relative ${
                  active === item.label ? 'bg-green-50' : 'hover:bg-gray-50'
                }`}>
                {active === item.label && <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-green-700 rounded-r" />}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${active === item.label ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <Icon size={14} className={active === item.label ? 'text-green-700' : 'text-gray-500'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-[12px] font-medium ${active === item.label ? 'text-green-800' : 'text-gray-800'}`}>{item.label}</div>
                  <div className="text-[10px] text-gray-400 truncate">{item.desc}</div>
                </div>
                <ChevronRight size={13} className="text-gray-300" />
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        <div className="col-span-8 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="text-[14px] font-bold text-gray-900 mb-4">{active}</div>
          {PANELS[active]}
        </div>
      </div>
    </div>
  );
}
