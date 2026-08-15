"use client";

import React, { useState } from 'react';
import { Screen } from '../GramPulseApp';
import Sidebar from './Sidebar';
import Header from './Header';

// Screens
import OverviewScreen from '../screens/OverviewScreen';
import GeographyScreen from '../screens/GeographyScreen';
import DistrictOverviewScreen from '../screens/DistrictOverviewScreen';
import PortfolioScreen from '../screens/PortfolioScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import EnterpriseExplorerScreen from '../screens/EnterpriseExplorerScreen';
import EnterpriseTwinScreen from '../screens/EnterpriseTwinScreen';
import SectorScreen from '../screens/SectorScreen';
import ClimateScreen from '../screens/ClimateScreen';
import MarketScreen from '../screens/MarketScreen';
import ForecastScreen from '../screens/ForecastScreen';
import InterventionsScreen from '../screens/InterventionsScreen';
import FieldOfficersScreen from '../screens/FieldOfficersScreen';
import CashflowForecastScreen from '../screens/CashflowForecastScreen';
import ClimateForecastScreen from '../screens/ClimateForecastScreen';
import NpaForecastScreen from '../screens/NpaForecastScreen';
import ApprovalsScreen from '../screens/ApprovalsScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import OfflineCollectionScreen from '../screens/OfflineCollectionScreen';
import TasksScreen from '../screens/TasksScreen';
import ScenarioAnalysisScreen from '../screens/ScenarioAnalysisScreen';
import ClimateIntelligenceScreen from '../screens/ClimateIntelligenceScreen';
import EarlyWarningScreen from '../screens/EarlyWarningScreen';
import MarketIntelligenceScreen from '../screens/MarketIntelligenceScreen';
import SectorIntelligenceScreen from '../screens/SectorIntelligenceScreen';
import BehaviourIntelligenceScreen from '../screens/BehaviourIntelligenceScreen';
import CopilotScreen from '../screens/CopilotScreen';
import PolicySimulatorScreen from '../screens/PolicySimulatorScreen';
import ScenarioSimulatorScreen from '../screens/ScenarioSimulatorScreen';
import ReportsScreen from '../screens/ReportsScreen';
import AlertsScreen from '../screens/AlertsScreen';
import CreditScreen from '../screens/CreditScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

interface DashboardShellProps {
  currentScreen: Screen;
  setCurrentScreen: (s: Screen) => void;
  navigateTo: (s: Screen, enterprise?: string) => void;
  selectedEnterprise: string | null;
  previousScreen: Screen;
}

export default function DashboardShell({
  currentScreen, setCurrentScreen, navigateTo, selectedEnterprise, previousScreen
}: DashboardShellProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'overview': return <OverviewScreen navigateTo={navigateTo} />;
      case 'geography': return <GeographyScreen />;
      case 'District Overview': return <DistrictOverviewScreen />;
      case 'portfolio': return <PortfolioScreen navigateTo={navigateTo} />;
      case 'analytics': return <AnalyticsScreen />;
      case 'explorer': return <EnterpriseExplorerScreen navigateTo={navigateTo} />;
      case 'twin': return <EnterpriseTwinScreen enterprise={selectedEnterprise} onBack={() => setCurrentScreen(previousScreen)} />;
      case 'sectors': return <SectorScreen />;
      case 'climate': return <ClimateScreen />;
      case 'market': return <MarketScreen />;
      case 'forecast': return <ForecastScreen enterprise={selectedEnterprise} navigateTo={navigateTo} />;
      case 'forecast_cashflow': return <CashflowForecastScreen navigateTo={navigateTo} />;
      case 'forecast_climate': return <ClimateForecastScreen navigateTo={navigateTo} />;
      case 'forecast_npa': return <NpaForecastScreen navigateTo={navigateTo} />;
      case 'forecast_scenario': return <ScenarioAnalysisScreen navigateTo={navigateTo} />;
      case 'interventions': return <InterventionsScreen />;
      case 'operations_field_officers': return <FieldOfficersScreen navigateTo={navigateTo} />;
      case 'operations_tasks': return <TasksScreen navigateTo={navigateTo} />;
      case 'operations_approvals': return <ApprovalsScreen navigateTo={navigateTo} />;
      case 'operations_docs': return <DocumentsScreen navigateTo={navigateTo} />;
      case 'operations_offline': return <OfflineCollectionScreen navigateTo={navigateTo} />;
      case 'intelligence_climate': return <ClimateIntelligenceScreen navigateTo={navigateTo} />;
      case 'intelligence_warning': return <EarlyWarningScreen navigateTo={navigateTo} />;
      case 'intelligence_market': return <MarketIntelligenceScreen navigateTo={navigateTo} />;
      case 'intelligence_behaviour': return <BehaviourIntelligenceScreen navigateTo={navigateTo} />;
      case 'intelligence_sector': return <SectorIntelligenceScreen navigateTo={navigateTo} />;
      case 'copilot': return <CopilotScreen navigateTo={navigateTo} />;
      case 'copilot_policy': return <PolicySimulatorScreen navigateTo={navigateTo} />;
      case 'copilot_scenario': return <ScenarioSimulatorScreen navigateTo={navigateTo} />;
      case 'reports': return <ReportsScreen />;
      case 'alerts': return <AlertsScreen navigateTo={navigateTo} />;
      case 'credit': return <CreditScreen />;
      case 'settings': return <SettingsScreen />;
      case 'profile': return <ProfileScreen />;
      case 'notifications': return <NotificationsScreen />;
      default: return <OverviewScreen navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f4f5f7] font-sans overflow-hidden p-4 gap-4">
      <Sidebar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} onProfileClick={() => setIsProfileOpen(true)} />
      <div className="flex-1 flex flex-col overflow-hidden bg-transparent">
        <Header currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} navigateTo={navigateTo} onProfileClick={() => setIsProfileOpen(true)} />
        <main className="flex-1 overflow-y-auto pt-2 pb-5 px-1 relative">
          {renderScreen()}
          {isProfileOpen && <ProfileScreen onClose={() => setIsProfileOpen(false)} />}
        </main>
      </div>
    </div>
  );
}
