package messaging

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type ChatChannel string

const (
	ChannelPortal   ChatChannel = "Portal"
	ChannelEmail    ChatChannel = "Email"
	ChannelSMS      ChatChannel = "SMS"
	ChannelWhatsApp ChatChannel = "WhatsApp"
)

type MessageDirection string

const (
	DirectionOutbound MessageDirection = "outbound"
	DirectionInbound  MessageDirection = "inbound"
)

type OutboundMessage struct {
	ID            uuid.UUID   `json:"id"`
	ApplicationID uuid.UUID   `json:"applicationId"`
	TenantID      uuid.UUID   `json:"tenantId"`
	Channel       ChatChannel `json:"channel"`
	SenderName    string      `json:"senderName"`
	SenderEmail   string      `json:"senderEmail,omitempty"`
	SenderType    string      `json:"senderType"`
	MessageText   string      `json:"messageText"`
	AIDraftMode   string      `json:"aiDraftMode"`
	Recipient     string      `json:"recipient,omitempty"`
}

type InboundMessage struct {
	ID             uuid.UUID   `json:"id"`
	ApplicationID  uuid.UUID   `json:"applicationId"`
	TenantID       uuid.UUID   `json:"tenantId"`
	Channel        ChatChannel `json:"channel"`
	SenderName     string      `json:"senderName"`
	MessageText    string      `json:"messageText"`
	AttachmentName string      `json:"attachmentName,omitempty"`
	AttachmentURL  string      `json:"attachmentUrl,omitempty"`
	ReceivedAt     time.Time   `json:"receivedAt"`
}

type SendResult struct {
	ProviderMessageID string    `json:"providerMessageId"`
	DeliveryStatus    string    `json:"deliveryStatus"` // "sent", "queued", "delivered"
	SentAt            time.Time `json:"sentAt"`
}

type WebhookRequest struct {
	Headers map[string]string `json:"headers"`
	Body    []byte            `json:"body"`
	Query   map[string]string `json:"query"`
}

type MessagingProvider interface {
	Channel() ChatChannel
	Send(ctx context.Context, message OutboundMessage) (SendResult, error)
	VerifyWebhook(req WebhookRequest) error
	ParseInbound(req WebhookRequest) (InboundMessage, error)
}
