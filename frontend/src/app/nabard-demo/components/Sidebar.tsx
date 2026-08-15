"use client";

import React, { useState } from 'react';
import { Screen } from '../GramPulseApp';
import {
  Home, FolderHeart, Sparkles, Activity, Settings, TrendingUp, FileText, ChevronRight, ChevronUp, LayoutDashboard
} from 'lucide-react';

interface SidebarProps {
  currentScreen: Screen;
  setCurrentScreen: (s: Screen) => void;
  unreadAlerts?: number;
  onProfileClick?: () => void;
}

const NAV_ITEMS = [
  { icon: Home,          label: 'Home',           screen: 'overview',     hasSub: false },
  { icon: FolderHeart,   label: 'Portfolio',      screen: 'portfolio',    hasSub: false },
  { icon: Sparkles,      label: 'AI Copilot',     badge: 'New', screen: 'copilot',      hasSub: true, subItems: [
    { label: 'Decision Copilot', screen: 'copilot' },
    { label: 'Scenario Simulator', screen: 'copilot_scenario' },
    { label: 'Policy Simulator', screen: 'copilot_policy' }
  ] },
  { icon: Activity,      label: 'Intelligence',   screen: 'analytics',    hasSub: true, subItems: [
    { label: 'Climate', screen: 'intelligence_climate' },
    { label: 'Market', screen: 'intelligence_market' },
    { label: 'Behaviour', screen: 'intelligence_behaviour' },
    { label: 'Sector', screen: 'intelligence_sector' },
    { label: 'Early Warning', screen: 'intelligence_warning' }
  ] },
  { icon: Settings,      label: 'Operations',     screen: 'notifications',hasSub: true, subItems: [
    { label: 'Interventions', screen: 'interventions' },
    { label: 'Field Officers', screen: 'operations_field_officers' },
    { label: 'Tasks', screen: 'operations_tasks' },
    { label: 'Approvals', screen: 'operations_approvals' },
    { label: 'Offline Collection', screen: 'operations_offline' },
    { label: 'Documents', screen: 'operations_docs' },
    { label: 'Notifications', screen: 'notifications' }
  ] },
  { icon: TrendingUp,    label: 'Forecasting',    screen: 'forecast',     hasSub: true, subItems: [
    { label: 'Forecast Center', screen: 'forecast' },
    { label: 'Cashflow Forecast', screen: 'forecast_cashflow' },
    { label: 'NPA Forecast', screen: 'forecast_npa' },
    { label: 'Climate Forecast', screen: 'forecast_climate' },
    { label: 'Scenario Analysis', screen: 'forecast_scenario' }
  ] },
  { icon: FileText,      label: 'Reports',        screen: 'reports',      hasSub: false },
  { icon: Settings,      label: 'Administration', screen: 'settings',     hasSub: true },
];

export default function Sidebar({ currentScreen, setCurrentScreen, onProfileClick }: SidebarProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>('Intelligence');

  return (
    <aside className={`shrink-0 h-full bg-white rounded-3xl flex flex-col py-6 shadow-sm border border-gray-100 transition-all duration-300 ${isMinimized ? 'w-[85px] items-center' : 'w-[240px]'}`}>
      
      {/* Logo Area */}
      <div 
        className={`mb-8 flex items-center gap-3 cursor-pointer select-none transition-all ${isMinimized ? 'px-0' : 'px-6'}`}
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="w-8 h-8 rounded-lg bg-[#16a34a] flex items-center justify-center shrink-0">
          <div className="grid grid-cols-2 gap-[2px]">
             <div className="w-[6px] h-[6px] bg-white rounded-full"></div>
             <div className="w-[6px] h-[6px] bg-white rounded-full"></div>
             <div className="w-[6px] h-[6px] bg-white rounded-full"></div>
             <div className="w-[6px] h-[6px] bg-white rounded-full"></div>
          </div>
        </div>
        {!isMinimized && (
          <div className="whitespace-nowrap overflow-hidden transition-all">
            <div className="text-[16px] font-extrabold text-gray-900 leading-none mb-1">GramPulse</div>
            <div className="text-[10px] font-bold text-gray-500 leading-none">by Zeyro</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={`flex-1 w-full overflow-y-auto flex flex-col gap-1 transition-all ${isMinimized ? 'px-2 items-center' : 'px-4'}`}>
        {NAV_ITEMS.map(({ icon: Icon, label, badge, screen, hasSub, subItems }) => {
          const isActive = currentScreen === screen || 
                           (label === 'Home' && currentScreen === 'overview');
          const isExpanded = expandedMenu === label;
          
          return (
            <div key={label} className="flex flex-col">
              <button
                onClick={() => {
                   if (hasSub) {
                     setExpandedMenu(isExpanded ? null : label);
                   } else {
                     setCurrentScreen(screen as Screen);
                   }
                   if (hasSub && subItems && subItems[0]) {
                     setCurrentScreen(subItems[0].screen as Screen);
                   }
                }}
                title={isMinimized ? label : undefined}
                className={`flex items-center rounded-xl transition-all ${
                  isMinimized ? 'w-[48px] h-[48px] justify-center p-0' : 'w-full justify-between px-4 py-3.5'
                } ${
                  isActive || isExpanded
                    ? 'bg-[#f0fdf4] text-[#16a34a]'
                    : 'text-[#4b5563] hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon size={20} strokeWidth={isActive || isExpanded ? 2.5 : 2} className={isActive || isExpanded ? 'text-[#16a34a]' : 'text-gray-500'} />
                  {!isMinimized && (
                    <div className="flex items-center gap-2">
                       <span className={`text-[14px] whitespace-nowrap ${isActive || isExpanded ? 'font-bold' : 'font-semibold'}`}>{label}</span>
                       {badge && (
                         <span className="bg-[#f3e8ff] text-[#9333ea] text-[10px] font-bold px-1.5 py-0.5 rounded leading-none">{badge}</span>
                       )}
                    </div>
                  )}
                </div>
                {!isMinimized && hasSub && (
                  isExpanded ? (
                    <ChevronUp size={16} strokeWidth={2} className="text-[#16a34a]" />
                  ) : (
                    <ChevronRight size={16} strokeWidth={2} className={isActive ? 'text-[#16a34a]' : 'text-gray-400'} />
                  )
                )}
              </button>

              {!isMinimized && isExpanded && subItems && (
                <div className="flex flex-col gap-0.5 mt-1 mb-2 px-1">
                   {subItems.map(sub => {
                      const isSubActive = currentScreen === sub.screen;
                      return (
                         <button
                           key={sub.label}
                           onClick={() => setCurrentScreen(sub.screen as Screen)}
                           className={`text-left px-11 py-2.5 rounded-lg text-[13px] font-semibold transition-colors ${
                             isSubActive ? 'bg-[#f0fdf4] text-[#16a34a]' : 'text-[#4b5563] hover:bg-gray-50 hover:text-gray-900'
                           }`}
                         >
                           {sub.label}
                         </button>
                      )
                   })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer User Profile */}
      <div className={`mt-auto transition-all ${isMinimized ? 'px-0' : 'px-4'}`}>
         <div 
           onClick={onProfileClick}
           className={`flex items-center rounded-xl hover:bg-gray-50 transition-all cursor-pointer border border-transparent hover:border-gray-100 ${isMinimized ? 'p-2 justify-center w-[48px] h-[48px]' : 'w-full justify-between px-3 py-3'}`}
         >
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-[#dcfce7] flex items-center justify-center text-[#16a34a] font-bold text-sm shrink-0">
               R
             </div>
             {!isMinimized && (
               <div className="text-left whitespace-nowrap overflow-hidden">
                 <div className="text-[13px] font-bold text-gray-900 leading-tight mb-0.5">Rohit Deshmukh</div>
                 <div className="text-[10px] font-bold text-gray-500">Regional Manager</div>
               </div>
             )}
           </div>
           {!isMinimized && <ChevronUp size={14} className="text-gray-400 shrink-0" />}
         </div>
      </div>

    </aside>
  );
}
