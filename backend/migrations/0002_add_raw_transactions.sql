CREATE TABLE raw_upi_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id),
    user_ref_hash TEXT NOT NULL,
    txn_id TEXT NOT NULL,
    txn_timestamp TIMESTAMPTZ NOT NULL,
    amount_inr NUMERIC(18, 2) NOT NULL,
    direction TEXT NOT NULL,
    counterparty_vpa_enc TEXT,
    raw_description_enc TEXT,
    data_source TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (partner_id, user_ref_hash, txn_id)
);

CREATE INDEX idx_raw_upi_transactions_user_time
    ON raw_upi_transactions (user_ref_hash, txn_timestamp DESC);
