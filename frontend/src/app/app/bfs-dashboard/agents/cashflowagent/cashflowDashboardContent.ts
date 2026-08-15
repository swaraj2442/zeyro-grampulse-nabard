import { AgentContent } from '../../agentDashboardContent';

export const cashflowAgentContent: AgentContent = {
  DATA: {
    subtitle: 'Cashflow Sources',
    description: 'View portfolio-wide connections or drill down into specific accounts to see their data pipelines.',
    items: [
      "Active bank feeds",
      "Balance history records"
    ],
    sources: [
      { name: 'Active bank feeds', status: 'Connected · 1,200 active portfolios', isOk: true },
      { name: 'Balance history records', status: 'Updated 2m ago · 365 days history sequence', isOk: true }
    ],
    customElement: 'cashflow_data'
  },
  INPUT: {
    subtitle: 'Cashflow Triggers',
    description: 'Manually request statement pulls, trigger pipeline runs, or upload offline PDFs.',
    items: [
      "Minimum average balance settings",
      "Volatile swing trigger setup"
    ],
    formType: 'cashflow'
  },
  OUTPUT: {
    subtitle: 'Engineered Features',
    description: 'View the processed risk variables, bounce probabilities, and calculated metrics sent downstream.',
    title: '',
    metrics: [],
    customElement: 'cashflow_output'
  },
  REPORTS: {
    subtitle: 'Generated Reports',
    description: 'View and download detailed diagnostic reports for specific accounts.',
    list: [
      { name: 'Balance Trajectory Report', desc: 'Aggregate view of balance timelines across active cohorts.' },
      { name: 'Volatility Warning Analysis', desc: 'Identifies accounts triggering swing volatility limits.' }
    ],
    actions: ['Download PDF', 'Export CSV'],
    customElement: 'cashflow_report'
  },
  INSIGHTS: {
    subtitle: 'Agent Findings',
    description: 'High-level anomalies and patterns detected across the portfolio.',
    list: [
      "Volatility swings rising on gig worker segments. Monitor risk closely."
    ],
    customElement: 'cashflow_insights'
  },
  OTHER: {
    subtitle: 'Pipeline Configuration',
    description: 'Manage ML model parameters and threshold settings.',
    sections: [
      { title: 'Archiver Config', content: 'Sync timeline schedules and database archive triggers are active under sandbox v1.2 policies.' }
    ]
  }
};
