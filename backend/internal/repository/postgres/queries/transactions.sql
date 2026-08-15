-- name: SaveRawTransaction :exec
INSERT INTO raw_upi_transactions (
    partner_id, user_ref_hash, txn_id, txn_timestamp, amount_inr,
    direction, counterparty_vpa_enc, raw_description_enc, data_source
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9
) ON CONFLICT (partner_id, user_ref_hash, txn_id) DO NOTHING;
