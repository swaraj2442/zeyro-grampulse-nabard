// Configuration file for all book data.
// Update these values to effortlessly change the content of the flipbook in the future!

export const bookData = {
  // Page 1: Cover
  cover: {
    title: "The 2026 Fleet Guide",
    subtitle: "Transforming logistics with AI-driven insights and real-time visibility.",
    metrics: [
      { label: 'Connected Vehicles', value: 1.2, suffix: 'M', decimals: 1 },
      { label: 'Miles Tracked', value: 8.5, suffix: 'B', decimals: 1 },
      { label: 'Active Fleets', value: 5000, suffix: '+', decimals: 0 },
      { label: 'Uptime', value: 99.9, suffix: '%', decimals: 1 },
    ]
  },

  // Page 2: State of Logistics
  stateOfLogistics: {
    title: "State of Logistics",
    stats: [
      { label: 'Fuel Cost Increase', val: '24%' },
      { label: 'Driver Shortage', val: '80K' },
      { label: 'Downtime Costs', val: '₹8B' },
      { label: 'Compliance Fines', val: '₹2B' }
    ],
    chartTitle: "Industry Challenges (Severity)",
    chartData: [
      { name: 'Fuel', uv: 9.5 },
      { name: 'Maint.', uv: 8.2 },
      { name: 'Labor', uv: 7.8 },
      { name: 'Safety', uv: 6.4 },
      { name: 'Routing', uv: 5.1 },
      { name: 'Idle', uv: 4.0 },
    ]
  },

  // Page 3: Intelligent Tracking
  intelligentTracking: {
    title: "Intelligent Tracking",
    steps: [
      { label: "Hardware", sub: "OBD-II / CAN bus", highlight: false },
      { label: "Connectivity", sub: "5G Global SIMs", highlight: false },
      { label: "Ingestion", sub: "Sub-second Latency", highlight: false },
      { label: "Processing", sub: "Real-time Stream", highlight: false },
      { label: "AI Analysis", sub: "Anomaly Detection", highlight: false },
      { label: "Visibility", sub: "Live Dashboard", highlight: true }
    ]
  },

  // Page 4: Predictive Maintenance
  predictiveMaintenance: {
    title: "Predictive Maintenance",
    totalFeatures: "35% Reduction",
    stats: [
      { label: 'Engine', val: 940 },
      { label: 'Brakes', val: 1200 },
      { label: 'Battery', val: 3100 },
      { label: 'Tires', val: 850 },
      { label: 'Transmission', val: 420 },
      { label: 'Emissions', val: 610 },
    ],
    radarData: [
      { subject: 'Engine', A: 140, fullMark: 150 },
      { subject: 'Tires', A: 110, fullMark: 150 },
      { subject: 'Brakes', A: 95, fullMark: 150 },
      { subject: 'Battery', A: 130, fullMark: 150 },
      { subject: 'Transmission', A: 85, fullMark: 150 },
      { subject: 'Coolant', A: 70, fullMark: 150 },
    ]
  },

  // Page 5: Route Optimization
  routeOptimization: {
    title: "Route Optimization",
    modelInfo: [
      { label: 'Algorithm', val: 'Dynamic VRP' },
      { label: 'Live Traffic', val: 'Every 30s' },
      { label: 'Weather Data', val: 'Integrated' },
      { label: 'Vehicle Types', val: 'Multi-class' },
      { label: 'Fuel Saved', val: 'Up to 18%' },
      { label: 'On-Time Rate', val: '98.5%' },
    ]
  },

  // Page 6: Driver Safety
  driverSafety: {
    title: "Driver Safety",
    gauges: [
      { label: 'Safety Score', val: 94.2 },
      { label: 'Eco-Driving', val: 88.5 },
      { label: 'Compliance', val: 99.1 },
      { label: 'Engagement', val: 91.0 },
    ],
    chartTitle: "Safety Incidents (Per 1M Miles)",
    lineData: [
      { name: 'Jan', acc: 45 },
      { name: 'Feb', acc: 38 },
      { name: 'Mar', acc: 29 },
      { name: 'Apr', acc: 22 },
      { name: 'May', acc: 15 },
      { name: 'Jun', acc: 8 },
    ]
  },

  // Page 7: Security & Compliance
  securityCompliance: {
    title: "Security & Compliance",
    kpis: [
      { label: 'Data Encryption', val: 256, suffix: '-bit', subtext: 'AES End-to-End', decimals: 0 },
      { label: 'Uptime SLA', val: 99.99, suffix: '%', subtext: 'Multi-region Redundancy', decimals: 2 },
      { label: 'Compliance', val: 100, suffix: '%', subtext: 'ELD, GDPR, SOC2', decimals: 0 },
    ]
  },

  // Page 8: Business Impact
  businessImpact: {
    title: "Business Impact",
    metrics: [
      { label: 'Fleet Utilization', val: 28, up: true },
      { label: 'Unplanned Downtime', val: 35, up: false },
      { label: 'Fuel Consumption', val: 18, up: false },
      { label: 'On-Time Deliveries', val: 14, up: true },
      { label: 'Insurance Costs', val: 22, up: false },
      { label: 'Maintenance Cost', val: 31, up: false },
    ]
  },

  // Page 9: Future Roadmap
  futureRoadmap: {
    title: "Future Roadmap",
    steps: [
      { label: "Q3 2026", sub: "EV Fleet Integration", highlight: false },
      { label: "Q4 2026", sub: "Autonomous Dispatch", highlight: false },
      { label: "Q1 2027", sub: "Drone Deliveries", highlight: false },
      { label: "Q2 2027", sub: "Predictive Supply Chain", highlight: true }
    ]
  },

  // Page 10 & 11: Global Coverage Spread
  globalCoverage: {
    title: "Global Coverage",
    stats: [
      { label: 'Countries', val: '42' },
      { label: 'Vehicles', val: '1.2M' },
      { label: 'Daily Events', val: '4.5B' },
      { label: 'Global Offices', val: '18' },
    ]
  },

  // Page 12: Final Page
  final: {
    tagline: "Drive Your Fleet Into The Future",
    company: "ZEYRO",
    category: "Intell",
    year: "© 2026"
  }
};
