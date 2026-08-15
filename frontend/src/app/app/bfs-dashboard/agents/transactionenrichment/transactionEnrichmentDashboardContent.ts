import { AgentContent } from '../../agentDashboardContent';

export const transactionEnrichmentAgentContent: AgentContent = {
  DATA: {
    subtitle: 'Enrichment Sources',
    description: 'View portfolio-wide connections or drill down into specific accounts to see their enrichment pipelines.',
    items: [
      "Active UPI feeds",
      "AA Bank Statement records"
    ],
    sources: [
      { name: 'Active UPI feeds', status: 'Connected · 8,400 active VPAs', isOk: true },
      { name: 'AA Bank Statement records', status: 'Updated 10m ago · Processing stream', isOk: true }
    ],
    customElement: 'transaction_enrichment_data'
  },
  INPUT: {
    subtitle: 'Enrichment Triggers',
    description: 'Manually request statement pulls, trigger pipeline runs, or upload offline PDFs.',
    items: [
      "Confidence threshold settings",
      "Entity resolution trigger setup"
    ],
    customElement: 'transaction_enrichment_input'
  },
  OUTPUT: {
    subtitle: 'Enriched Features',
    description: 'View the processed risk variables, merchant tiers, and calculated behavioral metrics sent downstream.',
    title: '',
    metrics: [],
    customElement: 'transaction_enrichment_output'
  },
  REPORTS: {
    subtitle: 'Generated Reports',
    description: 'View and download detailed diagnostic reports for specific accounts.',
    list: [
      { name: 'Merchant Spend Distribution', desc: 'Aggregate view of category spend across active cohorts.' },
      { name: 'Anomaly Detection Analysis', desc: 'Identifies accounts triggering velocity and round-trip limits.' }
    ],
    actions: ['Download PDF', 'Export CSV'],
    customElement: 'transaction_enrichment_report'
  },
  INSIGHTS: {
    subtitle: 'Agent Findings',
    description: 'High-level anomalies and patterns detected across the portfolio.',
    list: [
      "P2P Velocity spikes detected on gig worker segments. Monitor risk closely."
    ],
    customElement: 'transaction_enrichment_insights'
  },
  OTHER: {
    subtitle: 'Pipeline Configuration',
    description: 'Manage ML model parameters and threshold settings.',
    sections: [
      { title: 'Archiver Config', content: 'Sync timeline schedules and database archive triggers are active under sandbox v1.2 policies.' }
    ]
  }
};
