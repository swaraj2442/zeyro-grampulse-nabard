-- Migration: 0009b_contract_corrections.sql
-- Description: Schema extensions for contract corrections, concurrency control, policy lifecycle, reminder deliveries, and export artifacts

-- 1. Soft Archive columns on applications
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_by UUID,
  ADD COLUMN IF NOT EXISTS archive_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_applications_tenant_archived
  ON applications (tenant_id, is_archived, created_at DESC);

-- 2. Structured Conditions, Soft Cancellation & Concurrency Control
ALTER TABLE conditions
  ADD COLUMN IF NOT EXISTS condition_type VARCHAR(50) NOT NULL DEFAULT 'document',
  ADD COLUMN IF NOT EXISTS due_date DATE,
  ADD COLUMN IF NOT EXISTS is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_by UUID,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_conditions_tenant_application_status
  ON conditions (tenant_id, application_id, status);

-- 3. Condition Reminders & Per-Channel Deliveries
CREATE TABLE IF NOT EXISTS condition_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    condition_id UUID NOT NULL REFERENCES conditions(id) ON DELETE RESTRICT,
    message_template VARCHAR(100) NOT NULL,
    requested_by UUID NOT NULL,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_condition_reminders_condition
  ON condition_reminders (tenant_id, condition_id, requested_at DESC);

CREATE TABLE IF NOT EXISTS condition_reminder_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    reminder_id UUID NOT NULL REFERENCES condition_reminders(id) ON DELETE CASCADE,
    channel VARCHAR(30) NOT NULL, -- chat, email, sms
    status VARCHAR(30) NOT NULL DEFAULT 'queued', -- queued, processing, sent, delivered, read, failed, cancelled
    provider_message_id TEXT,
    attempt_count INT NOT NULL DEFAULT 0,
    last_error TEXT,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. BFS Policy Lifecycle & Unique Active Index
ALTER TABLE bfs_policy_versions
  ADD COLUMN IF NOT EXISTS product_code VARCHAR(50) NOT NULL DEFAULT 'MSME_UNSECURED',
  ADD COLUMN IF NOT EXISTS segment_code VARCHAR(50),
  ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'active', -- draft, pending_approval, active, retired
  ADD COLUMN IF NOT EXISTS approved_by UUID,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS activation_reason TEXT,
  ADD COLUMN IF NOT EXISTS effective_from TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS effective_until TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS uq_active_bfs_policy
  ON bfs_policy_versions (tenant_id, product_code, COALESCE(segment_code, ''))
  WHERE is_active = TRUE;

-- 5. Export Artifact Metadata
CREATE TABLE IF NOT EXISTS export_artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    job_id UUID REFERENCES processing_jobs(id) ON DELETE SET NULL,
    artifact_type VARCHAR(50) NOT NULL, -- credit_memo_pdf, conditions_pdf, rbi_audit_export
    file_name VARCHAR(255) NOT NULL,
    storage_key VARCHAR(512) NOT NULL,
    sha256 VARCHAR(64) NOT NULL,
    mime_type VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
    size_bytes BIGINT NOT NULL,
    template_version VARCHAR(50),
    source_version_id UUID,
    generated_by UUID NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- 6. Production Access Requests
CREATE TABLE IF NOT EXISTS production_access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    organization_name VARCHAR(255) NOT NULL,
    organization_type VARCHAR(100) NOT NULL,
    expected_monthly_applications INT NOT NULL,
    requested_capabilities JSONB NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_production_access_tenant_status
  ON production_access_requests (tenant_id, status, created_at DESC);
