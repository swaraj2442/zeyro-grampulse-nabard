import React from 'react';
import { cashflowAgentContent } from './agents/cashflowagent/cashflowDashboardContent';
import { transactionEnrichmentAgentContent } from './agents/transactionenrichment/transactionEnrichmentDashboardContent';

export interface AgentContent {
  DATA: {
    subtitle: string;
    description: string;
    items: string[];
    sources: { name: string; status: string; isOk: boolean; isWarning?: boolean }[];
    customElement?: 'cashflow_data' | 'transaction_enrichment_data';
  };
  INPUT: {
    subtitle: string;
    description: string;
    items: string[];
    formType?: 'underwriting' | 'enrichment' | 'findoc' | 'cashflow' | 'device' | 'suite';
    customElement?: 'cashflow_input' | 'transaction_enrichment_input';
  };
  OUTPUT: {
    subtitle: string;
    description: string;
    title: string;
    meta?: string;
    metrics: { label: string; value: string; badge?: { text: string; type: 'success' | 'warning' | 'normal' } }[];
    breakdownTitle?: string;
    breakdown?: { label: string; value: string }[];
    lists?: { title: string; type: 'success' | 'warning'; items: string[] }[];
    customElement?: 'enrichment_distribution' | 'findoc_mismatch' | 'cashflow_api_response' | 'cashflow_engineered_features' | 'cashflow_output' | 'transaction_enrichment_output';
  };
  REPORTS: {
    subtitle: string;
    description: string;
    list: { name: string; desc: string }[];
    actions?: string[];
    customElement?: 'cashflow_report' | 'transaction_enrichment_report';
  };
  INSIGHTS: {
    subtitle: string;
    description: string;
    list: string[];
    customElement?: 'cashflow_insights' | 'transaction_enrichment_insights';
  };
  OTHER: {
    subtitle: string;
    description: string;
    sections: {
      title: string;
      content: { label: string; value: string; isAction?: boolean }[] | string;
      customElement?: 'scoring_thresholds' | 'enrichment_rules' | 'findoc_rules';
    }[];
  };
}

export const agentDashboardContent: Record<string, AgentContent> = {
  'Underwriting': {
    DATA: {
      subtitle: 'Ingested Data & Connected Sources',
      description: 'Incoming credit applications, bank consents, and credit bureau snapshots.',
      items: [
        "Live application queue pulled from NBFC's LOS (Loan Origination System)",
        "AA-fetched bank statements (12 months) per applicant",
        "Bureau snapshot at time of application (CIBIL / Experian)",
        "Findoc-parsed ITR, salary slips, GST filings",
        "Historical decision log (all past approvals, rejections, escalations)"
      ],
      sources: [
        { name: 'Account Aggregator (Sahamati)', status: 'Live · Last sync 2m ago', isOk: true },
        { name: 'CIBIL Bureau', status: 'Live · Last pull 4m ago', isOk: true },
        { name: 'Findoc Parser', status: 'Live · 89 docs processed today', isOk: true },
        { name: 'LOS Integration', status: 'Live · 342 applications ingested', isOk: true },
        { name: 'Experian', status: 'Disconnected · Reconnect →', isOk: false, isWarning: true }
      ]
    },
    INPUT: {
      subtitle: 'Input Interface',
      description: 'Submit manual payloads, trigger credit auth, or adjust scoring overrides.',
      items: [
        "New application payload (name, loan amount, type, applicant category)",
        "AA consent token (triggers 12-month statement pull)",
        "Bureau pull authorization",
        "Manual document upload (PDF bank statement, ITR, salary slip)",
        "Loan officer override instruction (approve / reject / escalate)",
        "Scoring threshold configuration (min BFS to auto-approve)"
      ],
      formType: 'underwriting'
    },
    OUTPUT: {
      subtitle: 'Output Payload & Decisions',
      description: 'Decision summary, BFS score breakdowns, risk indices and compliance signatures.',
      title: 'Application #2847 — Underwriting Output',
      meta: 'Token: ZY-UW-20260718-2847',
      metrics: [
        { label: 'BFS Composite Score', value: '78 / 100' },
        { label: 'Risk Tier', value: 'Low', badge: { text: 'Low', type: 'success' } },
        { label: 'Recommended Action', value: 'Approve' },
        { label: 'Max Recommended EMI', value: '₹18,400 / month' },
        { label: 'Loan Amount Approved', value: '₹4,20,000' },
        { label: 'Confidence Level', value: '91%' },
        { label: 'Decision Time', value: '3.8 seconds' },
        { label: 'Action Taken', value: 'Auto-approved', badge: { text: 'Auto-approved', type: 'success' } }
      ],
      breakdownTitle: 'Score Breakdown',
      breakdown: [
        { label: 'RPS (Repayment Propensity)', value: '81 / 100' },
        { label: 'BFS (Behavioural)', value: '76 / 100' },
        { label: 'ATP (Ability to Pay)', value: '74 / 100' }
      ],
      lists: [
        {
          title: 'Positive Factors',
          type: 'success',
          items: [
            'Consistent salary credit last 12 months',
            'EMI obligation ratio 34% (below 40% threshold)',
            'Zero DPD in bureau history',
            'Savings rate 22%'
          ]
        },
        {
          title: 'Risk Flags',
          type: 'warning',
          items: [
            '2 bureau enquiries in last 30 days',
            'Discretionary spend spike — October'
          ]
        }
      ]
    },
    REPORTS: {
      subtitle: 'Reports Library',
      description: 'Select a generated underwriting performance report to download or export.',
      list: [
        { name: 'Daily Underwriting Summary', desc: 'Total applications reviewed; Auto-approved / auto-rejected / escalated split; Avg BFS score of approved vs rejected cohort; Loan officer override count and direction (approved overrides vs rejected overrides); Turnaround time distribution.' },
        { name: 'Risk Tier Distribution Report', desc: 'Portfolio breakdown: Low / Medium / High / Critical; Week-on-week shift in tier distribution; Segment breakdown: salaried vs self-employed vs MSME.' },
        { name: 'Override Analysis Report', desc: 'All human overrides in selected period; BFS score at time of override; Outcome tracking (did overridden approvals repay?).' },
        { name: 'Threshold Performance Report', desc: 'How many applications fell in the 45–62 grey zone; How current thresholds are performing vs NPA outcomes.' }
      ],
      actions: ['Download PDF', 'Export CSV', 'Schedule weekly email']
    },
    INSIGHTS: {
      subtitle: 'Auto-Generated Insights',
      description: 'Insights dynamically compiled by Credit Sentinel + Underwriting Agent.',
      list: [
        "This week's approval rate dropped 4% vs last week. Primary driver: increase in self-employed applicants with Q3 income dips. Consider temporary threshold adjustment or document waiver for ITR-filed MSME segment.",
        "Loan officer overrides are trending up — 14 this week vs 6 last week. 11 of 14 were approvals on BFS 50–62 range. Monitor repayment behaviour on this cohort over next 90 days.",
        "Applications from Tier 2 cities showing higher avg BFS (71.4) than Tier 1 (68.2) this month. Opportunity to expand underwriting appetite in this segment.",
        "Avg decision time increased 0.8s today. No impact on accuracy — likely AA latency spike at 10:30 AM."
      ]
    },
    OTHER: {
      subtitle: 'Configuration & Controls',
      description: 'Scoring thresholds, notification routing and compliance settings.',
      sections: [
        { title: 'SCORING THRESHOLDS', content: '', customElement: 'scoring_thresholds' },
        {
          title: 'NOTIFICATION RULES',
          content: [
            { label: 'Alert loan officer if', value: 'BFS between 45–62' },
            { label: 'Alert credit head if', value: 'BFS < 35 or loan > ₹25L' },
            { label: 'Daily digest', value: '8:00 AM to [email]' }
          ]
        },
        {
          title: 'AUDIT & COMPLIANCE',
          content: 'Every decision logged with data sources used, score at time of decision, agent version, timestamp, and loan officer if overridden.'
        }
      ]
    }
  },
  'Transaction Enrichment': transactionEnrichmentAgentContent,
  'Findoc Analyser': {
    DATA: {
      subtitle: 'Document Repositories',
      description: 'Audited statements document vaults, GST portals, and cross-validation status registers.',
      items: [
        "Uploaded document store (PDF bank statements, ITR, GST, salary slips)",
        "Extraction results per document (structured field-value pairs)",
        "Income mismatch log (AA-derived vs ITR-declared)",
        "Failed parse queue (low confidence, corrupted, password-protected)",
        "Document version history per applicant"
      ],
      sources: [
        { name: 'Document Upload API', status: 'Live · 89 docs today', isOk: true },
        { name: 'AA Statement Feed', status: 'Live · Used for cross-validation', isOk: true },
        { name: 'GST Portal (sandbox)', status: 'Sandbox · Not live in production', isOk: true },
        { name: 'Zeyro Findoc Engine v2.1', status: 'Live · 94.2% extraction accuracy', isOk: true }
      ]
    },
    INPUT: {
      subtitle: 'Upload Interface',
      description: 'Ingest new document packages, set tags, or trigger parser diagnostics.',
      items: [
        "PDF upload (bank statement, ITR, GST filing, salary slip, Form 16)",
        "Applicant ID to link document to scoring profile",
        "Document type tag (agent auto-detects but can be overridden)",
        "Re-parse instruction (on updated document)",
        "Manual field correction (loan officer can fix a misread value)"
      ],
      formType: 'findoc'
    },
    OUTPUT: {
      subtitle: 'Extraction Yield & Cross-Validation',
      description: 'OCR text field extraction records and accounts variance calculations.',
      title: 'Document DOC-3018 — Extraction Output',
      meta: 'Confidence: 81%',
      metrics: [
        { label: 'Document Type', value: 'ITR AY2024-25', badge: { text: 'ITR AY2024-25', type: 'normal' } },
        { label: 'Applicant', value: '#2831' },
        { label: 'Engine Version', value: 'Findoc v2.1' },
        { label: 'Parsed at', value: '18 Jul 2026, 09:12 AM IST' }
      ],
      customElement: 'findoc_mismatch'
    },
    REPORTS: {
      subtitle: 'Diagnostic Reports',
      description: 'Choose a parsing diagnostic or validation report.',
      list: [
        { name: 'Daily Ingestion & Parse Report', desc: 'Total documents uploaded; success rate; password failure counts; average extraction confidence.' },
        { name: 'Income Mismatch Variance Report', desc: 'Identifies discrepancies between declared documents (ITR/salary slips) vs automated statements (AA feeds).' },
        { name: 'Parse Latency & Queue Status', desc: 'Distribution of processing timelines by document size and pages count.' }
      ],
      actions: ['Download PDF', 'Export CSV', 'Schedule weekly email']
    },
    INSIGHTS: {
      subtitle: 'Parser Insights',
      description: 'Insights dynamically compiled by Findoc OCR Engine.',
      list: [
        "Document mismatch alert: Self-declared ITR income exceeds AA bank statements by >20% in 18% of files this week. Monitor credit metrics carefully.",
        "Password-protected document queue is growing. 8 failed parses due to missing passwords today. Consider requesting bypass.",
        "Income statements from Tier 2 companies show 4% higher OCR confidence after engine update v2.1."
      ]
    },
    OTHER: {
      subtitle: 'Engine Parameters',
      description: 'Manage auto-detection models, OCR limits and bypass conditions.',
      sections: [
        {
          title: 'Parser Settings', content: [
            { label: 'Auto-detection model', value: 'LayoutLMv3 (Active)' },
            { label: 'OCR confidence threshold', value: '[80%]' }
          ]
        },
        {
          title: 'Mismatch Alerts',
          content: '',
          customElement: 'findoc_rules'
        }
      ]
    }
  },
  'Cashflow Monitoring': cashflowAgentContent,
  'Device and behavioural Intelligence': {
    DATA: {
      subtitle: 'Device Log Registries',
      description: 'Session parameters, geolocation metrics, and fingerprint data stores.',
      items: [
        "Biometric signatures",
        "Telemetry trackers"
      ],
      sources: [
        { name: 'Biometric signatures', status: 'Live · 540 active sessions', isOk: true },
        { name: 'Telemetry trackers', status: 'Connected · geofence rules active', isOk: true }
      ]
    },
    INPUT: {
      subtitle: 'Device Security Inputs',
      description: 'Configure biometric limits and geofencing triggers.',
      items: [
        "Biometric verification limit rules",
        "Geofence lockout settings"
      ],
      formType: 'device'
    },
    OUTPUT: {
      subtitle: 'Risk Metrics Output',
      description: 'Session trust ratings and location warning triggers.',
      title: 'Current Telemetry Risk Assessment',
      metrics: [
        { label: 'Average Risk Score Index', value: '0.02 (Low)', badge: { text: '0.02 (Low)', type: 'success' } },
        { label: 'Verified Devices Rate', value: '98.9%' }
      ]
    },
    REPORTS: {
      subtitle: 'Telemetry Reports',
      description: 'Login telemetry logs and biometric verify outcomes.',
      list: [
        { name: 'Failed Biometric Logs', desc: 'Traces logins missing device verification hashes.' },
        { name: 'Location Swings Summary', desc: 'Lists accounts exceeding distance swing constraints.' }
      ],
      actions: ['Download PDF']
    },
    INSIGHTS: {
      subtitle: 'Telemetry Insights',
      description: 'Insights dynamically compiled by Device Security Agent.',
      list: [
        "Increase in rooted device login attempts from Tier 2 cities this week."
      ]
    },
    OTHER: {
      subtitle: 'Advanced Policies',
      description: 'Governed under security policy settings.',
      sections: [
        { title: 'Security Rules', content: 'Advanced telemetry filters are governed under security policy settings.' }
      ]
    }
  },
  'AI Agent Suite': {
    DATA: {
      subtitle: 'Orchestration Logs',
      description: 'Trigger events, pipeline queues, and active thread states.',
      items: [
        "Orchestrator queue state",
        "Agent threads state"
      ],
      sources: [
        { name: 'Orchestrator queue', status: 'Running · active job bus', isOk: true },
        { name: 'Agent threads', status: '2 active (Sentinel + Underwriter)', isOk: true }
      ]
    },
    INPUT: {
      subtitle: 'Suite Parameters',
      description: 'Adjust execution concurrency and set thread limits.',
      items: [
        "Max concurrency settings",
        "Pipeline mode switches"
      ],
      formType: 'suite'
    },
    OUTPUT: {
      subtitle: 'Suite Output Metrics',
      description: 'Recent orchestration success rate and latency averages.',
      title: 'Pipeline Health & Statistics',
      metrics: [
        { label: 'Average Lifecycle Success Rate', value: '98.4%' },
        { label: 'Pipeline Latency Average', value: '2,450ms' }
      ]
    },
    REPORTS: {
      subtitle: 'Suite Ledgers',
      description: 'Pipeline execution ledgers and job completion stats.',
      list: [
        { name: 'Execution Ledger Log', desc: 'Lists job executions, trace durations and states.' },
        { name: 'Orchestrator performance', desc: 'Traces loop bottlenecks and thread wait times.' }
      ],
      actions: ['Download PDF']
    },
    INSIGHTS: {
      subtitle: 'Suite Insights',
      description: 'Insights dynamically compiled by Pipeline Agent.',
      list: [
        "Average orchestrator latency decreased by 120ms after LayoutLM updates."
      ]
    },
    OTHER: {
      subtitle: 'Lifecycle Configurations',
      description: 'Orchestrator retry controls and timeouts.',
      sections: [
        { title: 'Core Lifecycle Controls', content: 'Orchestration scheduler tasks are governed under core lifecycle parameters.' }
      ]
    }
  }
};
