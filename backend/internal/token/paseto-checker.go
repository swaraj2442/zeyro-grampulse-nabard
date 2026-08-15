package token

import (
	"encoding/json"
	"errors"

	"aidanwoods.dev/go-paseto"
)

var (
	ErrExpiredToken = errors.New("token has expired")
	ErrInvalidToken = errors.New("token is invalid")
)

type PasetoChecker struct {
	parser    paseto.Parser
	publicKey paseto.V4AsymmetricPublicKey
}

var checker *PasetoChecker

// VerifyToken validates the token and returns the payload
func VerifyToken(token string) (*Payload, error) {
	if checker == nil {
		return nil, errors.New("checker not initialized")
	}

	parsedToken, err := checker.parser.ParseV4Public(checker.publicKey, token, nil)
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

// InitPasetoChecker initializes the global checker instance with a public key
func InitPasetoChecker(hexPublicKey string) error {
	publicKey, err := paseto.NewV4AsymmetricPublicKeyFromHex(hexPublicKey)
	if err != nil {
		return err
	}

	checker = &PasetoChecker{
		parser:    paseto.NewParser(),
		publicKey: publicKey,
	}

	return nil
}
