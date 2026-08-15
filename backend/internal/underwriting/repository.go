package underwriting

import (
	"context"

	"github.com/arthazeyro/zeyro-b2b/internal/repository/postgres/gen"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	pool    *pgxpool.Pool
	queries *gen.Queries
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{
		pool:    pool,
		queries: gen.New(pool),
	}
}

func (r *Repository) Queries() *gen.Queries {
	return r.queries
}

func (r *Repository) Pool() *pgxpool.Pool {
	return r.pool
}

// ExecTx executes a function inside a database transaction
func (r *Repository) ExecTx(ctx context.Context, fn func(*gen.Queries) error) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	q := gen.New(tx)
	if err := fn(q); err != nil {
		_ = tx.Rollback(ctx)
		return err
	}
	return tx.Commit(ctx)
}
