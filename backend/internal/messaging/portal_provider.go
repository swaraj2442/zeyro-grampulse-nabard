package messaging

import (
	"context"
	"time"
)

// PortalProvider implements MessagingProvider for direct in-app applicant portal messaging
type PortalProvider struct{}

func NewPortalProvider() *PortalProvider {
	return &PortalProvider{}
}

func (p *PortalProvider) Channel() ChatChannel {
	return ChannelPortal
}

func (p *PortalProvider) Send(ctx context.Context, message OutboundMessage) (SendResult, error) {
	// Portal channel is direct database insert + SSE broadcast to applicant portal and underwriter workspace
	return SendResult{
		ProviderMessageID: "portal_" + message.ID.String(),
		DeliveryStatus:    "delivered",
		SentAt:            time.Now(),
	}, nil
}

func (p *PortalProvider) VerifyWebhook(req WebhookRequest) error {
	return nil
}

func (p *PortalProvider) ParseInbound(req WebhookRequest) (InboundMessage, error) {
	return InboundMessage{}, nil
}
