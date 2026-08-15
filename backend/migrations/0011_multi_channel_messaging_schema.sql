-- Migration: 0011_multi_channel_messaging_schema.sql
-- Extends chat_messages with multi-channel and AI draft properties
-- Creates message_deliveries table for provider status tracking

ALTER TABLE chat_messages
  ADD COLUMN IF NOT EXISTS channel VARCHAR(50) DEFAULT 'Portal',
  ADD COLUMN IF NOT EXISTS direction VARCHAR(20) DEFAULT 'outbound',
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'sent',
  ADD COLUMN IF NOT EXISTS ai_draft_mode VARCHAR(50) DEFAULT 'off',
  ADD COLUMN IF NOT EXISTS attachment_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS attachment_url TEXT,
  ADD COLUMN IF NOT EXISTS citation TEXT;

CREATE TABLE IF NOT EXISTS message_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    tenant_id UUID,
    provider VARCHAR(50) NOT NULL,
    provider_message_id VARCHAR(255),
    channel VARCHAR(50) NOT NULL,
    delivery_status VARCHAR(50) NOT NULL,
    error_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON chat_messages(channel);
CREATE INDEX IF NOT EXISTS idx_message_deliveries_msg ON message_deliveries(message_id);
CREATE INDEX IF NOT EXISTS idx_message_deliveries_provider ON message_deliveries(provider_message_id);
