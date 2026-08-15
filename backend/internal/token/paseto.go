package token

import "time"

// Maker provides the interface for token generation
type Maker interface {
	CreateToken(p *Payload, duration time.Duration) (string, error)
	VerifyToken(token string) (*Payload, error)
}
