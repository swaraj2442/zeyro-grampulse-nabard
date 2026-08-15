package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/arthazeyro/zeyro-b2b/internal/token"
)

type contextKey string

const payloadKey contextKey = "auth_payload"

// RequirePASETOAuth is a middleware that verifies the PASETO token in the Authorization header.
func RequirePASETOAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			WriteError(w, http.StatusUnauthorized, "missing authorization header")
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") || parts[1] == "" {
			WriteError(w, http.StatusUnauthorized, "invalid authorization header")
			return
		}

		payload, err := token.VerifyToken(parts[1])
		if err != nil {
			WriteError(w, http.StatusUnauthorized, err.Error())
			return
		}

		// Inject payload into context
		ctx := context.WithValue(r.Context(), payloadKey, payload)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}

// GetAuthPayload extracts the PASETO payload from the request context.
func GetAuthPayload(ctx context.Context) *token.Payload {
	payload, ok := ctx.Value(payloadKey).(*token.Payload)
	if !ok {
		return nil
	}
	return payload
}
