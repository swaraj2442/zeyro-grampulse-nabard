-- Migration: 0007_underwriting_schema.sql
-- Description: Complete schema for Underwriting Agent Workspace in z-b2b

-- Custom ENUM Types
CREATE TYPE application_stage AS ENUM (
    'draft',
    'submitted',
    'documents_pending',
    'documents_processing',
    'review_ready',
    'under_review',
    'additional_information_required',
    'conditionally_approved',
    'approved',
    'rejected',
    'withdrawn',
    'cancelled'
);

CREATE TYPE application_status AS ENUM (
    'pending',
    'approved',
    'approved_with_conditions',
    'rejected',
    'escalated',
    'withdrawn'
);

CREATE TYPE entity_type AS ENUM (
    'individual',
    'corporate'
);

CREATE TYPE applicant_segment AS ENUM (
    'salaried',
    'self_employed',
    'msme',
    'gig'
);

CREATE TYPE risk_tier AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);

CREATE TYPE recommendation_type AS ENUM (
    'approve',
    'approve_with_conditions',
    'reject',
    'escalate'
);

CREATE TYPE decision_type AS ENUM (
    'approved',
    'conditionally_approved',
    'rejected',
    'escalated',
    'returned_for_information'
);

CREATE TYPE doc_type AS ENUM (
    'bank_statement',
    'cibil_report',
    'experian_report',
    'itr',
    'gst_return',
    'salary_slips',
    'kyc',
    'sanction_letter',
    'other'
);

CREATE TYPE doc_source AS ENUM (
    'aa_feed',
    'cibil_api',
    'experian_api',
    'findoc_upload',
    'applicant_upload',
    'officer_upload'
);

CREATE TYPE doc_status AS ENUM (
    'verified',
    'analysing',
    'missing',
    'flagged',
    'not_required'
);

CREATE TYPE flag_type AS ENUM (
    'missing_document',
    'income_mismatch',
    'enquiry_spike',
    'dpd_history',
    'fraud_alert',
    'custom_warning'
);

CREATE TYPE severity_level AS ENUM (
    'info',
    'warning',
    'critical'
);

CREATE TYPE job_status AS ENUM (
    'queued',
    'processing',
    'retry_scheduled',
    'completed',
    'failed',
    'cancelled'
);

CREATE TYPE condition_status AS ENUM (
    'pending',
    'met',
    'waived'
);

CREATE TYPE outcome_90d AS ENUM (
    'on_time',
    'missed_payment',
    'npa',
    'pending'
);

CREATE TYPE sender_type AS ENUM (
    'agent',
    'officer',
    'applicant',
    'system'
);

-- 1. applications
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    app_number VARCHAR(64) NOT NULL UNIQUE,
    applicant_name VARCHAR(255) NOT NULL,
    entity_type entity_type NOT NULL DEFAULT 'individual',
    applicant_segment applicant_segment NOT NULL DEFAULT 'salaried',
    loan_amount NUMERIC(15, 2) NOT NULL,
    tenure_months INT NOT NULL,
    assigned_officer_id UUID,
    stage application_stage NOT NULL DEFAULT 'draft',
    status application_status NOT NULL DEFAULT 'pending',
    progress_percentage INT NOT NULL DEFAULT 0,
    bfs_score INT,
    risk_tier risk_tier,
    recommendation recommendation_type,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_applications_tenant ON applications(tenant_id);
CREATE INDEX idx_applications_stage ON applications(stage);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_officer ON applications(assigned_officer_id);

-- 2. application_parties
CREATE TABLE IF NOT EXISTS application_parties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    party_type VARCHAR(50) NOT NULL, -- borrower, co_applicant, guarantor
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    pan_masked VARCHAR(20),
    aadhaar_masked VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. application_financials
CREATE TABLE IF NOT EXISTS application_financials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    gross_monthly_income NUMERIC(15, 2),
    net_monthly_income NUMERIC(15, 2),
    existing_monthly_emi NUMERIC(15, 2),
    declared_itr_income NUMERIC(15, 2),
    aa_derived_monthly_inflow NUMERIC(15, 2),
    bank_nsf_count INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. application_timeline
CREATE TABLE IF NOT EXISTS application_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    previous_stage application_stage,
    new_stage application_stage,
    actor_id UUID,
    actor_type TEXT NOT NULL DEFAULT 'user',
    reason TEXT,
    metadata JSONB NOT NULL DEFAULT '{}',
    request_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_timeline_app ON application_timeline(application_id);

-- 5. documents
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    doc_type doc_type NOT NULL,
    source doc_source NOT NULL,
    status doc_status NOT NULL DEFAULT 'analysing',
    confidence_score NUMERIC(5, 2) DEFAULT 0.0,
    file_name VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_app ON documents(application_id);

-- 6. document_versions
CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    storage_key VARCHAR(512) NOT NULL,
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    file_hash VARCHAR(128),
    uploaded_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. document_extractions
CREATE TABLE IF NOT EXISTS document_extractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    document_version_id UUID NOT NULL REFERENCES document_versions(id) ON DELETE CASCADE,
    extractor_name VARCHAR(100) NOT NULL, -- e.g. findoc-v2.1, aa-parser
    extractor_version VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'completed',
    raw_payload JSONB DEFAULT '{}',
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. extracted_fields
CREATE TABLE IF NOT EXISTS extracted_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    extraction_id UUID NOT NULL REFERENCES document_extractions(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    field_key VARCHAR(100) NOT NULL,
    field_label VARCHAR(255) NOT NULL,
    field_value TEXT NOT NULL,
    numeric_value NUMERIC(15, 2),
    confidence NUMERIC(5, 4) NOT NULL DEFAULT 1.0,
    page_number INT,
    bounding_box JSONB, -- {"x": 0.21, "y": 0.43, "width": 0.19, "height": 0.04}
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_extracted_fields_doc ON extracted_fields(document_id);

-- 9. flags
CREATE TABLE IF NOT EXISTS flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    flag_type flag_type NOT NULL,
    severity severity_level NOT NULL DEFAULT 'warning',
    title VARCHAR(255) NOT NULL,
    consequence_description TEXT,
    downstream_impact JSONB DEFAULT '{}',
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_by UUID,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. bfs_policy_versions
CREATE TABLE IF NOT EXISTS bfs_policy_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    policy_name VARCHAR(100) NOT NULL,
    policy_version VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    atp_weight NUMERIC(4, 3) NOT NULL DEFAULT 0.35,
    rps_weight NUMERIC(4, 3) NOT NULL DEFAULT 0.30,
    bcs_weight NUMERIC(4, 3) NOT NULL DEFAULT 0.20,
    fds_weight NUMERIC(4, 3) NOT NULL DEFAULT 0.15,
    min_pass_score INT NOT NULL DEFAULT 650,
    auto_approve_threshold INT NOT NULL DEFAULT 750,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. bfs_scores
CREATE TABLE IF NOT EXISTS bfs_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    policy_version_id UUID NOT NULL REFERENCES bfs_policy_versions(id),
    engine_version VARCHAR(50) NOT NULL DEFAULT 'bfs-underwriting-v2.0.0',
    composite_score INT NOT NULL,
    risk_tier risk_tier NOT NULL,
    confidence_level NUMERIC(5, 2) NOT NULL DEFAULT 90.0,
    input_snapshot JSONB NOT NULL DEFAULT '{}',
    calculation_reason TEXT,
    previous_score_id UUID REFERENCES bfs_scores(id),
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bfs_scores_app ON bfs_scores(application_id);

-- 12. bfs_score_components
CREATE TABLE IF NOT EXISTS bfs_score_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bfs_score_id UUID NOT NULL REFERENCES bfs_scores(id) ON DELETE CASCADE,
    component_name VARCHAR(50) NOT NULL, -- atp, rps, bcs, fds
    raw_score INT NOT NULL,
    weight NUMERIC(4, 3) NOT NULL,
    weighted_contribution NUMERIC(5, 2) NOT NULL,
    metrics JSONB NOT NULL DEFAULT '{}'
);

-- 13. bfs_signals
CREATE TABLE IF NOT EXISTS bfs_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bfs_score_id UUID NOT NULL REFERENCES bfs_scores(id) ON DELETE CASCADE,
    signal_type VARCHAR(20) NOT NULL, -- positive, risk
    signal_text TEXT NOT NULL,
    extracted_field_id UUID REFERENCES extracted_fields(id) ON DELETE SET NULL,
    citation_metadata JSONB DEFAULT '{}'
);

-- 14. credit_memos
CREATE TABLE IF NOT EXISTS credit_memos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    active_version_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. credit_memo_versions
CREATE TABLE IF NOT EXISTS credit_memo_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    credit_memo_id UUID NOT NULL REFERENCES credit_memos(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    llm_provider VARCHAR(50) NOT NULL,
    llm_model VARCHAR(100) NOT NULL,
    prompt_version VARCHAR(50) NOT NULL,
    temperature NUMERIC(3, 2) NOT NULL DEFAULT 0.2,
    input_hash VARCHAR(128) NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. credit_memo_sections
CREATE TABLE IF NOT EXISTS credit_memo_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memo_version_id UUID NOT NULL REFERENCES credit_memo_versions(id) ON DELETE CASCADE,
    section_key VARCHAR(100) NOT NULL, -- executive_summary, financial_analysis, risk_assessment, mitigants, recommendation
    content TEXT NOT NULL,
    edited_by UUID,
    edited_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. credit_memo_citations
CREATE TABLE IF NOT EXISTS credit_memo_citations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memo_version_id UUID NOT NULL REFERENCES credit_memo_versions(id) ON DELETE CASCADE,
    chip_id VARCHAR(50) NOT NULL,
    claim_text TEXT NOT NULL,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    source_line VARCHAR(100)
);

-- 18. decision_logs
CREATE TABLE IF NOT EXISTS decision_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    officer_id UUID NOT NULL,
    officer_role VARCHAR(100) NOT NULL,
    original_system_recommendation recommendation_type NOT NULL,
    final_decision decision_type NOT NULL,
    override_occurred BOOLEAN NOT NULL DEFAULT FALSE,
    override_reason_code VARCHAR(100),
    override_justification TEXT,
    conditions_summary JSONB DEFAULT '[]',
    outcome_90d outcome_90d NOT NULL DEFAULT 'pending',
    source_ip VARCHAR(50),
    request_id VARCHAR(100),
    previous_event_hash VARCHAR(128),
    event_hash VARCHAR(128) NOT NULL,
    decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_decision_logs_app ON decision_logs(application_id);

-- 19. conditions
CREATE TABLE IF NOT EXISTS conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    condition_code VARCHAR(50),
    description TEXT NOT NULL,
    status condition_status NOT NULL DEFAULT 'pending',
    assigned_officer_id UUID,
    met_at TIMESTAMPTZ,
    waived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. chat_threads
CREATE TABLE IF NOT EXISTS chat_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 21. chat_messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    sender_type sender_type NOT NULL,
    sender_id VARCHAR(100) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    message_text TEXT NOT NULL,
    attachment_doc_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    is_auto_outreach BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 22. processing_jobs
CREATE TABLE IF NOT EXISTS processing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    job_type VARCHAR(100) NOT NULL, -- aa_sync, findoc_extraction, bfs_recalculate, memo_generate, pdf_export
    status job_status NOT NULL DEFAULT 'queued',
    payload JSONB NOT NULL DEFAULT '{}',
    result JSONB DEFAULT '{}',
    attempt_count INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 3,
    available_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    locked_at TIMESTAMPTZ,
    locked_by VARCHAR(100),
    heartbeat_at TIMESTAMPTZ,
    last_error TEXT,
    idempotency_key VARCHAR(128),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jobs_status_available ON processing_jobs(status, available_at);

-- 23. outbox_events
CREATE TABLE IF NOT EXISTS outbox_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    aggregate_type VARCHAR(100) NOT NULL,
    aggregate_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    sequence_number BIGSERIAL,
    published_at TIMESTAMPTZ,
    delivery_attempts INT NOT NULL DEFAULT 0,
    last_delivery_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_outbox_published ON outbox_events(published_at, sequence_number);

-- 24. agent_logs
CREATE TABLE IF NOT EXISTS agent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    trace_id VARCHAR(100),
    severity VARCHAR(20) NOT NULL DEFAULT 'INFO',
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
