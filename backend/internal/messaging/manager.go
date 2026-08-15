package messaging

import (
	"context"
	"fmt"
	"sync"
)

// Manager manages registered messaging providers and routes outbound messages to the target channel
type Manager struct {
	mu        sync.RWMutex
	providers map[ChatChannel]MessagingProvider
}

func NewManager() *Manager {
	m := &Manager{
		providers: make(map[ChatChannel]MessagingProvider),
	}
	// Register default Portal and Resend Email providers
	m.RegisterProvider(NewPortalProvider())
	m.RegisterProvider(NewResendProvider())
	return m
}

func (m *Manager) RegisterProvider(provider MessagingProvider) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.providers[provider.Channel()] = provider
}

func (m *Manager) GetProvider(channel ChatChannel) (MessagingProvider, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	p, ok := m.providers[channel]
	return p, ok
}

func (m *Manager) Send(ctx context.Context, msg OutboundMessage) (SendResult, error) {
	provider, ok := m.GetProvider(msg.Channel)
	if !ok {
		// Fallback to Portal provider if channel is unconfigured
		provider, ok = m.GetProvider(ChannelPortal)
		if !ok {
			return SendResult{}, fmt.Errorf("no provider registered for channel: %s", msg.Channel)
		}
	}
	return provider.Send(ctx, msg)
}
