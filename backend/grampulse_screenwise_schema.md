# Screenwise Schema for Grampulse

This document provides a detailed mapping of all screens in the application, their expected parameters, and the data models they utilize.

## SplashScreen
- **Route Path**: `/`
- **File**: `...\lib\features\onboarding\screens\splash_screen.dart`
- **Parameters**: None
- **Data Models Used**: None explicitly detected.

## IntroScreen
- **Route Path**: `/intro`
- **File**: `...\lib\features\onboarding\screens\intro_screen.dart`
- **Parameters**: None
- **Data Models Used**: None explicitly detected.

## LanguageScreen
- **Route Path**: `/language`
- **File**: `...\lib\features\onboarding\screens\language_screen.dart`
- **Parameters**: None
- **Data Models Used**: None explicitly detected.

## LoginScreen
- **Route Path**: `/login`
- **File**: `...\lib\features\auth\screens\login_screen.dart`
- **Parameters**: None
- **Data Models Used**: None explicitly detected.

## BusinessSetupStep1Screen
- **Route Path**: `/business-setup-1`
- **File**: `...\lib\features\onboarding\screens\business_setup_step1_screen.dart`
- **Parameters**: None
- **Data Models Used**: None explicitly detected.

## BusinessSetupStep2Screen
- **Route Path**: `/business-setup-2`
- **File**: `...\lib\features\onboarding\screens\business_setup_step2_screen.dart`
- **Parameters**: None
- **Data Models Used**: None explicitly detected.

## HomeDashboard
- **Route Path**: `/home`
- **Status**: Screen file not found automatically.

## AiRecommendationsScreen
- **Route Path**: `/ai-recommendations`
- **File**: `...\lib\features\insights\screens\ai_recommendations_screen.dart`
- **Parameters**: None
- **Data Models Used**:
  - `CashOutlookData`
    - `title: String`
    - `expectedInflowSub: String`
    - `expectedOutflowSub: String`
    - `projectedClosingSub: String`
    - `yLabels: List<String>`
    - `xLabels: List<String>`
    - `inflow: List<double>`
    - `outflow: List<double>`
    - `line: List<double>`
    - `highlightIndex: int?`
    - `lowestCashAmount: String`
    - `lowestCashMonth: String`
    - `highestCashAmount: String`
    - `highestCashMonth: String`

## RiskTimelineScreen
- **Route Path**: `/risk-timeline`
- **File**: `...\lib\features\insights\screens\risk_timeline_screen.dart`
- **Parameters**: None
- **Data Models Used**: None explicitly detected.

## SizedBox
- **Route Path**: `/dummy`
- **Status**: Screen file not found automatically.

## AiAssistantScreen
- **Route Path**: `/ai-assistant`
- **File**: `...\lib\features\ai_assistant\screens\ai_assistant_screen.dart`
- **Parameters**: initialMessage
- **Data Models Used**: None explicitly detected.

## ProfileScreen
- **Route Path**: `/profile`
- **File**: `...\lib\features\profile\screens\profile_screen.dart`
- **Parameters**: None
- **Data Models Used**:
  - `_MenuItem`
    - `icon: IconData`
    - `title: String`
    - `onTap: VoidCallback`

## BusinessHealthScreen
- **Route Path**: `/business-health`
- **File**: `...\lib\features\insights\screens\business_health_screen.dart`
- **Parameters**: None
- **Data Models Used**:
  - `_AnimatedItem`
    - `controller: AnimationController`
    - `index: int`
    - `child: Widget`

## InsightsExplanationScreen
- **Route Path**: `/insights-explanation`
- **File**: `...\lib\features\insights\screens\insights_explanation_screen.dart`
- **Parameters**: None
- **Data Models Used**: None explicitly detected.

## BusinessSignalsScreen
- **Route Path**: `/business-signals`
- **File**: `...\lib\features\insights\screens\business_signals_screen.dart`
- **Parameters**: None
- **Data Models Used**:
  - `BusinessSignalGraphData`
    - `categoryTitle: String`
    - `categoryColor: Color`
    - `trendLabel: String`
    - `trendBgColor: Color`
    - `trendTextColor: Color`
    - `iconPath: String`
    - `mainTitle: String`
    - `mainValue: String`
    - `mainValueColor: Color`
    - `subtitle: String`
    - `subtitleColor: Color`
    - `chartColor: Color`
    - `chartValues: List<double>`
    - `chartLabels: List<String>`
    - `chartYLabels: List<String>`
    - `footerText: String`

## WhatTodoScreen
- **Route Path**: `/what-todo`
- **File**: `...\lib\features\insights\screens\what_todo_screen.dart`
- **Parameters**: None
- **Data Models Used**: None explicitly detected.

## AddIncomeScreen
- **Route Path**: `/add-income`
- **File**: `...\lib\features\finance\screens\add_income_screen.dart`
- **Parameters**: None
- **Data Models Used**: None explicitly detected.

## AddExpenseScreen
- **Route Path**: `/add-expense`
- **File**: `...\lib\features\finance\screens\add_expense_screen.dart`
- **Parameters**: None
- **Data Models Used**: None explicitly detected.

## QuickEntryScreen
- **Route Path**: `/quick-entry`
- **File**: `...\lib\features\finance\screens\quick_entry_screen.dart`
- **Parameters**: None
- **Data Models Used**: None explicitly detected.

## CashFlowScreen
- **Route Path**: `/cash-flow`
- **File**: `...\lib\features\finance\screens\cash_flow_screen.dart`
- **Parameters**: None
- **Data Models Used**: None explicitly detected.

## PendingActionsScreen
- **Route Path**: `/pending-actions`
- **File**: `...\lib\features\home\screens\pending_actions_screen.dart`
- **Parameters**: None
- **Data Models Used**: None explicitly detected.

## DocumentCentreScreen
- **Route Path**: `/document-centre`
- **File**: `...\lib\features\documents\screens\document_centre_screen.dart`
- **Parameters**: None
- **Data Models Used**:
  - `_AnimatedItem`
    - `controller: AnimationController`
    - `index: int`
    - `child: Widget`

## UpdateDocumentScreen
- **Route Path**: `/update-document`
- **File**: `...\lib\features\documents\screens\update_document_screen.dart`
- **Parameters**: document
- **Data Models Used**:
  - `_AnimatedItem`
    - `controller: AnimationController`
    - `index: int`
    - `child: Widget`
  - `DocumentModel`
    - `id: String`
    - `title: String`
    - `type: DocumentType`
    - `status: DocumentStatus`
    - `requestedDate: String`
    - `dueDate: String?`
    - `verifiedDate: String?`
    - `provider: String?`
    - `documentNumber: String?`
    - `icon: IconData`
    - `iconColor: Color`

## ViewDocumentScreen
- **Route Path**: `/view-document`
- **File**: `...\lib\features\documents\screens\view_document_screen.dart`
- **Parameters**: document
- **Data Models Used**:
  - `_AnimatedItem`
    - `controller: AnimationController`
    - `index: int`
    - `child: Widget`
  - `DocumentModel`
    - `id: String`
    - `title: String`
    - `type: DocumentType`
    - `status: DocumentStatus`
    - `requestedDate: String`
    - `dueDate: String?`
    - `verifiedDate: String?`
    - `provider: String?`
    - `documentNumber: String?`
    - `icon: IconData`
    - `iconColor: Color`

## UploadDocumentScreen
- **Route Path**: `/upload-document`
- **File**: `...\lib\features\documents\screens\upload_document_screen.dart`
- **Parameters**: document
- **Data Models Used**:
  - `_AnimatedItem`
    - `controller: AnimationController`
    - `index: int`
    - `child: Widget`
  - `DocumentModel`
    - `id: String`
    - `title: String`
    - `type: DocumentType`
    - `status: DocumentStatus`
    - `requestedDate: String`
    - `dueDate: String?`
    - `verifiedDate: String?`
    - `provider: String?`
    - `documentNumber: String?`
    - `icon: IconData`
    - `iconColor: Color`

## EnterpriseDetailsScreen
- **Route Path**: `/enterprise-details`
- **File**: `...\lib\features\profile\screens\enterprise_details_screen.dart`
- **Parameters**: None
- **Data Models Used**: None explicitly detected.

## VisitInformationScreen
- **Route Path**: `/visit-information`
- **Status**: Screen file not found automatically.

## UpdatesScreen
- **Route Path**: `/updates`
- **File**: `...\lib\features\home\screens\updates_screen.dart`
- **Parameters**: None
- **Data Models Used**:
  - `_AnimatedItem`
    - `controller: AnimationController`
    - `index: int`
    - `child: Widget`

## OfficerRequestsScreen
- **Route Path**: `/officer-requests`
- **File**: `...\lib\features\officer\screens\officer_requests_screen.dart`
- **Parameters**: None
- **Data Models Used**:
  - `_AnimatedItem`
    - `controller: AnimationController`
    - `index: int`
    - `child: Widget`

## OfficerContactScreen
- **Route Path**: `/officer-contact`
- **File**: `...\lib\features\officer\screens\officer_contact_screen.dart`
- **Parameters**: None
- **Data Models Used**: None explicitly detected.

## SchemesScreen
- **Route Path**: `/schemes`
- **File**: `...\lib\features\profile\screens\schemes_screen.dart`
- **Parameters**: None
- **Data Models Used**:
  - `_AnimatedItem`
    - `controller: AnimationController`
    - `index: int`
    - `child: Widget`
  - `SchemeModel`
    - `id: String`
    - `name: String`
    - `description: String`
    - `eligibilityCriteria: String`
    - `benefits: String`
    - `targetSector: String`
  - `SchemeApplicationModel`
    - `id: String`
    - `scheme: SchemeModel`
    - `status: String`
    - `appliedOn: String`
    - `lastUpdate: String`
    - `expectedUpdate: String`
    - `currentStep: int`
    - `steps: List<String>`

## SchemeDetailsScreen
- **Route Path**: `/scheme-details`
- **File**: `...\lib\features\profile\screens\scheme_details_screen.dart`
- **Parameters**: scheme
- **Data Models Used**:
  - `SchemeModel`
    - `id: String`
    - `name: String`
    - `description: String`
    - `eligibilityCriteria: String`
    - `benefits: String`
    - `targetSector: String`

## SchemeTrackerDetailsScreen
- **Route Path**: `/scheme-tracker-details`
- **File**: `...\lib\features\profile\screens\scheme_tracker_details_screen.dart`
- **Parameters**: application
- **Data Models Used**:
  - `SchemeApplicationModel`
    - `id: String`
    - `scheme: SchemeModel`
    - `status: String`
    - `appliedOn: String`
    - `lastUpdate: String`
    - `expectedUpdate: String`
    - `currentStep: int`
    - `steps: List<String>`

