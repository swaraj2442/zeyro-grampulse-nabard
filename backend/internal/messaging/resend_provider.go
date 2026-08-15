package messaging

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/google/uuid"
)

// ResendProvider implements MessagingProvider for Resend Email service
type ResendProvider struct {
	apiKey    string
	fromEmail string
	client    *http.Client
}

func NewResendProvider() *ResendProvider {
	apiKey := os.Getenv("RESEND_API_KEY")
	fromEmail := os.Getenv("RESEND_FROM_EMAIL")
	if fromEmail == "" {
		fromEmail = "Zeyro Underwriting <underwriting@resend.dev>"
	}
	return &ResendProvider{
		apiKey:    apiKey,
		fromEmail: fromEmail,
		client:    &http.Client{Timeout: 10 * time.Second},
	}
}

func (r *ResendProvider) Channel() ChatChannel {
	return ChannelEmail
}

type resendSendPayload struct {
	From    string   `json:"from"`
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	Text    string   `json:"text"`
	ReplyTo string   `json:"reply_to,omitempty"`
}

type resendSendResponse struct {
	ID    string `json:"id"`
	Error string `json:"message,omitempty"`
}

func (r *ResendProvider) Send(ctx context.Context, message OutboundMessage) (SendResult, error) {
	if r.apiKey == "" {
		// Mock mode if RESEND_API_KEY is not configured yet
		return SendResult{
			ProviderMessageID: "resend_mock_" + message.ID.String(),
			DeliveryStatus:    "sent",
			SentAt:            time.Now(),
		}, nil
	}

	recipient := message.Recipient
	if recipient == "" {
		recipient = "applicant@example.com"
	}

	fromHeader := r.fromEmail
	if message.SenderEmail != "" {
		if message.SenderName != "" {
			fromHeader = fmt.Sprintf("%s <%s>", message.SenderName, message.SenderEmail)
		} else {
			fromHeader = message.SenderEmail
		}
	} else if message.SenderName != "" {
		fromHeader = fmt.Sprintf("%s <%s>", message.SenderName, r.fromEmail)
	}

	replyTo := fmt.Sprintf("reply+%s@reply.zeyro.in", message.ApplicationID.String())

	payload := resendSendPayload{
		From:    fromHeader,
		To:      []string{recipient},
		Subject: fmt.Sprintf("Update regarding Loan Application #%s", message.ApplicationID.String()),
		Text:    message.MessageText,
		ReplyTo: replyTo,
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return SendResult{}, fmt.Errorf("resend marshal error: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.resend.com/emails", bytes.NewBuffer(bodyBytes))
	if err != nil {
		return SendResult{}, fmt.Errorf("resend request creation failed: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+r.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := r.client.Do(req)
	if err != nil {
		return SendResult{}, fmt.Errorf("resend HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	var resData resendSendResponse
	if err := json.NewDecoder(resp.Body).Decode(&resData); err != nil {
		return SendResult{}, fmt.Errorf("failed to decode resend response: %w", err)
	}

	if resp.StatusCode >= 400 {
		return SendResult{
			DeliveryStatus: "failed",
		}, fmt.Errorf("resend API error HTTP %d: %s", resp.StatusCode, resData.Error)
	}

	return SendResult{
		ProviderMessageID: resData.ID,
		DeliveryStatus:    "sent",
		SentAt:            time.Now(),
	}, nil
}

func (r *ResendProvider) VerifyWebhook(req WebhookRequest) error {
	return nil
}

func (r *ResendProvider) ParseInbound(req WebhookRequest) (InboundMessage, error) {
	var payload struct {
		Type string `json:"type"`
		Data struct {
			From    string   `json:"from"`
			To      []string `json:"to"`
			Subject string   `json:"subject"`
			Text    string   `json:"text"`
		} `json:"data"`
	}

	if err := json.Unmarshal(req.Body, &payload); err != nil {
		return InboundMessage{}, fmt.Errorf("failed to unmarshal resend webhook: %w", err)
	}

	var appID uuid.UUID
	if len(payload.Data.To) > 0 {
		var strAppID string
		_, _ = fmt.Sscanf(payload.Data.To[0], "reply+%s@", &strAppID)
		if parsed, err := uuid.Parse(strAppID); err == nil {
			appID = parsed
		}
	}

	return InboundMessage{
		ID:            uuid.New(),
		ApplicationID: appID,
		Channel:       ChannelEmail,
		SenderName:    payload.Data.From,
		MessageText:   payload.Data.Text,
		ReceivedAt:    time.Now(),
	}, nil
}
