package token

import (
	"time"

	"github.com/google/uuid"
)

// Payload represents the structure of the token payload for Zeyro B2B partners.
type Payload struct {
	Id        uuid.UUID `json:"id"`         // Unique token ID
	PartnerID string    `json:"partner_id"` // Partner ID
	Scopes    []string  `json:"scopes"`     // Partner API scopes
	IssuedAt  time.Time `json:"iat"`        // Issued at timestamp
	ExpiresAt time.Time `json:"exp"`        // Expiration timestamp
}

func newPayload(p *Payload, duration time.Duration) *Payload {
	return &Payload{
		Id:        uuid.New(),
		PartnerID: p.PartnerID,
		Scopes:    p.Scopes,
		IssuedAt:  time.Now(),
		ExpiresAt: time.Now().Add(duration),
	}
}
