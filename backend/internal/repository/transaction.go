package repository

import (
	"context"

	"github.com/arthazeyro/zeyro-b2b/internal/domain"
)

// TransactionRepository provides access to transaction data stores.
type TransactionRepository interface {
	// SaveRawTransaction persists a raw ingested transaction before enrichment.
	SaveRawTransaction(ctx context.Context, tx domain.RawUPITransaction) error
}
