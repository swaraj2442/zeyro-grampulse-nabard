CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_code TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE partner_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    key_hash TEXT NOT NULL UNIQUE,
    key_prefix TEXT NOT NULL,
    scopes TEXT[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

CREATE TABLE consent_artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id),
    user_ref_hash TEXT NOT NULL,
    consent_handle_enc TEXT,
    status TEXT NOT NULL,
    purpose_code TEXT NOT NULL,
    data_from DATE,
    data_to DATE,
    expires_at TIMESTAMPTZ,
    data_pulled_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consent_artifacts_partner_user
    ON consent_artifacts (partner_id, user_ref_hash);

CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id),
    consent_id UUID REFERENCES consent_artifacts(id),
    partner_ref_id TEXT,
    user_ref_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    requested_products TEXT[] NOT NULL DEFAULT '{}',
    score_version TEXT,
    overall_signal TEXT,
    response_json JSONB,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_assessments_partner_status
    ON assessments (partner_id, status, requested_at DESC);

CREATE TABLE merchant_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_vpa TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    gstin TEXT,
    mcc_equivalent TEXT NOT NULL,
    business_type TEXT NOT NULL,
    tier TEXT NOT NULL,
    verified_at TIMESTAMPTZ,
    source_signals TEXT[] NOT NULL DEFAULT '{}',
    transaction_count BIGINT NOT NULL DEFAULT 0,
    last_seen TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_merchant_entities_business_type
    ON merchant_entities (business_type, tier);

CREATE TABLE enriched_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    txn_id TEXT NOT NULL,
    partner_id UUID NOT NULL REFERENCES partners(id),
    user_ref_hash TEXT NOT NULL,
    txn_timestamp TIMESTAMPTZ NOT NULL,
    amount_inr NUMERIC(18, 2) NOT NULL,
    direction TEXT NOT NULL,
    counterparty_vpa_enc TEXT,
    merchant_entity_id UUID REFERENCES merchant_entities(id),
    merchant_name TEXT,
    business_type TEXT NOT NULL,
    sub_category TEXT,
    confidence NUMERIC(5, 4) NOT NULL DEFAULT 0,
    entity_tier TEXT NOT NULL,
    data_source TEXT NOT NULL,
    raw_description_enc TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (partner_id, user_ref_hash, txn_id)
);

CREATE INDEX idx_enriched_transactions_user_timestamp
    ON enriched_transactions (user_ref_hash, txn_timestamp DESC);

CREATE TABLE feature_vectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_ref_hash TEXT NOT NULL,
    feature_window TEXT NOT NULL,
    feature_group TEXT NOT NULL,
    feature_name TEXT NOT NULL,
    feature_value_json JSONB NOT NULL,
    computed_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_ref_hash, feature_window, feature_group, feature_name)
);

CREATE INDEX idx_feature_vectors_user_window
    ON feature_vectors (user_ref_hash, feature_window, computed_at DESC);

CREATE TABLE consortium_outcomes (
    assessment_id UUID PRIMARY KEY REFERENCES assessments(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES partners(id),
    user_ref_hash TEXT NOT NULL,
    score_version TEXT NOT NULL,
    css_score INT,
    rps_label TEXT,
    outcome_label TEXT,
    outcome_reported_at TIMESTAMPTZ,
    loan_amount_inr NUMERIC(18, 2),
    loan_tenor_days INT,
    product_type TEXT,
    feature_vector_id UUID REFERENCES feature_vectors(id)
);

CREATE INDEX idx_consortium_outcomes_partner_outcome
    ON consortium_outcomes (partner_id, outcome_label, outcome_reported_at DESC);

CREATE TABLE audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    partner_id UUID,
    actor_type TEXT NOT NULL,
    actor_ref TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_ref TEXT NOT NULL,
    status TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::JSONB,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_events_partner_time
    ON audit_events (partner_id, occurred_at DESC);

CREATE INDEX idx_audit_events_type_time
    ON audit_events (event_type, occurred_at DESC);
