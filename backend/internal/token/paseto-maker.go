package token

import (
	"encoding/json"
	"errors"
	"time"

	"aidanwoods.dev/go-paseto"
)

type PasetoMaker struct {
	secretKey paseto.V4AsymmetricSecretKey
}

func (maker *PasetoMaker) CreateToken(p *Payload, duration time.Duration) (string, error) {
	payload := newPayload(p, duration)

	token := paseto.NewToken()
	token.SetIssuedAt(payload.IssuedAt)
	token.SetNotBefore(time.Now())
	token.SetExpiration(payload.ExpiresAt)

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return "", errors.New("failed to marshal payload")
	}

	token.SetString("payload", string(jsonData))

	// Sign the token using the V4 asymmetric secret key
	return token.V4Sign(maker.secretKey, nil), nil
}

// VerifyToken validates the token and returns the payload
func (maker *PasetoMaker) VerifyToken(token string) (*Payload, error) {
	parser := paseto.NewParser()
	parsedToken, err := parser.ParseV4Public(maker.secretKey.Public(), token, nil)
	if err != nil {
		if err.Error() == "this token has expired" {
			return nil, ErrExpiredToken
		}
		return nil, ErrInvalidToken
	}

	p, err := parsedToken.GetString("payload")
	if err != nil {
		return nil, ErrInvalidToken
	}

	var payload Payload
	err = json.Unmarshal([]byte(p), &payload)
	if err != nil {
		return nil, ErrInvalidToken
	}

	return &payload, nil
}

// NewPasetoMaker creates a new Maker instance
func NewPasetoMaker(hexSecretKey string) (Maker, error) {
	secretKey, err := paseto.NewV4AsymmetricSecretKeyFromHex(hexSecretKey)
	if err != nil {
		return nil, err
	}

	return &PasetoMaker{
		secretKey: secretKey,
	}, nil
}
