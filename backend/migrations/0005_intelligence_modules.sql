CREATE TABLE intelligence_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO intelligence_modules (name, description) VALUES
    ('Underwriting', 'Credit underwriting and risk analysis'),
    ('Transaction Enrichment', 'Enhance and categorize transaction data'),
    ('Cashflow Monitoring', 'Real-time cashflow analytics and alerts'),
    ('Device and behavioural Intelligence', 'Fraud prevention via device telemetry'),
    ('AI Agent Suite', 'Intelligent agents for automated tasks'),
    ('Findoc Analyser', 'Document extraction and financial analysis');
