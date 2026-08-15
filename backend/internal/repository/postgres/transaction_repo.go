package postgres

import (
	"context"
	"fmt"

	"github.com/arthazeyro/zeyro-b2b/internal/crypto"
	"github.com/arthazeyro/zeyro-b2b/internal/domain"
	"github.com/arthazeyro/zeyro-b2b/internal/repository/postgres/gen"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type transactionRepository struct {
	queries *gen.Queries
}

// NewTransactionRepository creates a new postgres-backed transaction repository.
func NewTransactionRepository(db *pgxpool.Pool) *transactionRepository {
	return &transactionRepository{
		queries: gen.New(db),
	}
}

func (r *transactionRepository) SaveRawTransaction(ctx context.Context, tx domain.RawUPITransaction) error {
	var partnerID pgtype.UUID
	if err := partnerID.Scan(tx.PartnerID); err != nil {
		return fmt.Errorf("invalid partner id: %w", err)
	}

	var amount pgtype.Numeric
	if err := amount.Scan(fmt.Sprintf("%f", tx.AmountINR)); err != nil {
		return fmt.Errorf("invalid amount: %w", err)
	}

	var counterpartyVPA pgtype.Text
	if tx.CounterpartyVPA != "" {
		counterpartyVPA = pgtype.Text{String: tx.CounterpartyVPA, Valid: true}
	}

	var rawDescription pgtype.Text
	if tx.RawDescription != "" {
		rawDescription = pgtype.Text{String: tx.RawDescription, Valid: true}
	}

	params := gen.SaveRawTransactionParams{
		PartnerID:          partnerID,
		UserRefHash:        crypto.SHA256Hex(tx.UserRef),
		TxnID:              tx.TxnID,
		TxnTimestamp:       pgtype.Timestamptz{Time: tx.Timestamp, Valid: true},
		AmountInr:          amount,
		Direction:          tx.Direction,
		CounterpartyVpaEnc: counterpartyVPA,
		RawDescriptionEnc:  rawDescription,
		DataSource:         tx.DataSource,
	}

	if err := r.queries.SaveRawTransaction(ctx, params); err != nil {
		return fmt.Errorf("failed to save raw transaction: %w", err)
	}
	return nil
}
