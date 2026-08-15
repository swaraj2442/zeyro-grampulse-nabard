package domain

import "time"

type RawUPITransaction struct {
	PartnerID       string    `json:"partner_id"`
	UserRef         string    `json:"user_ref"`
	TxnID           string    `json:"txn_id"`
	Timestamp       time.Time `json:"timestamp"`
	AmountINR       float64   `json:"amount_inr"`
	Direction       string    `json:"direction"`
	CounterpartyVPA string    `json:"counterparty_vpa,omitempty"`
	RawDescription  string    `json:"raw_description,omitempty"`
	DataSource      string    `json:"data_source"`
}

type IngestAcceptedResponse struct {
	Status     string    `json:"status"`
	TxnID      string    `json:"txn_id"`
	ReceivedAt time.Time `json:"received_at"`
}
