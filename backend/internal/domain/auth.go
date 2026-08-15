package domain

type TokenRequest struct {
	APIKey string `json:"api_key"`
}

type TokenResponse struct {
	AccessToken string   `json:"access_token"`
	TokenType   string   `json:"token_type"`
	ExpiresIn   int64    `json:"expires_in"`
	PartnerID   string   `json:"partner_id"`
	Scopes      []string `json:"scopes"`
}
