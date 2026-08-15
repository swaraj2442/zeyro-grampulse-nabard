"use client";

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginScreen from './screens/LoginScreen';
import DashboardShell from './components/DashboardShell';

import { GramPulseProvider } from './store/GramPulseContext';

export type Screen =
  | 'overview' | 'geography' | 'portfolio' | 'explorer' | 'twin'
  | 'sectors' | 'climate' | 'market' | 'forecast' | 'forecast_cashflow' | 'forecast_climate' | 'forecast_npa' | 'forecast_scenario'
  | 'interventions' | 'operations_field_officers' | 'operations_tasks' | 'operations_approvals' | 'operations_docs' | 'operations_offline' | 'intelligence_climate' | 'intelligence_warning' | 'intelligence_market' | 'intelligence_behaviour' | 'intelligence_sector' | 'copilot' | 'copilot_policy' | 'copilot_scenario' | 'reports' | 'alerts' | 'credit'
  | 'settings' | 'District Overview' | 'profile' | 'analytics' | 'notifications';

const queryClient = new QueryClient();

export default function GramPulseApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('overview');
  const [selectedEnterprise, setSelectedEnterprise] = useState<string | null>(null);
  const [previousScreen, setPreviousScreen] = useState<Screen>('explorer');
  const [userRole, setUserRole] = useState<string>('Regional Manager');

  const navigateTo = (screen: Screen, enterprise?: string) => {
    if (screen === 'twin' && enterprise) {
      setSelectedEnterprise(enterprise);
      setPreviousScreen(currentScreen);
    }
    setCurrentScreen(screen);
  };

  const handleLogin = (role: string) => {
    setUserRole(role);
    setIsLoggedIn(true);

    if (role === 'Regional Manager') {
      navigateTo('overview');
    } else if (role === 'Field Officer') {
      navigateTo('explorer');
    } else if (role === 'Enterprise Owner') {
      navigateTo('twin', 'ENT-00124');
    } else {
      navigateTo('overview');
    }
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const isDemo = (process.env.NEXT_PUBLIC_DATA_MODE || 'demo') === 'demo';

  return (
    <QueryClientProvider client={queryClient}>
      <GramPulseProvider>
        {isDemo && (
          <div className="fixed bottom-4 left-4 z-50 pointer-events-none">
            <div className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-1 rounded shadow-sm text-[10px] font-bold tracking-wide flex items-center gap-1.5 opacity-80 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
              DEMO DATA
            </div>
          </div>
        )}
        <DashboardShell
          currentScreen={currentScreen}
          setCurrentScreen={(s: Screen) => navigateTo(s)}
          navigateTo={navigateTo}
          selectedEnterprise={selectedEnterprise}
          previousScreen={previousScreen}
        />
      </GramPulseProvider>
    </QueryClientProvider>
  );
}
