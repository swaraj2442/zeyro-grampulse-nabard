-- Migration: 0010_underwriting_chat_threads.sql
-- Extends the existing chat_threads and chat_messages tables with
-- underwriting-specific columns (tenant_id, application_id).

ALTER TABLE chat_threads
  ADD COLUMN IF NOT EXISTS tenant_id UUID,
  ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES applications(id) ON DELETE CASCADE;

ALTER TABLE chat_messages
  ADD COLUMN IF NOT EXISTS tenant_id UUID,
  ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS sender_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS message_text TEXT,
  ADD COLUMN IF NOT EXISTS sender_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS is_auto_outreach BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS attachment_doc_id UUID REFERENCES documents(id) ON DELETE SET NULL;

-- Create index for fast lookup by application
CREATE INDEX IF NOT EXISTS idx_chat_threads_app ON chat_threads(application_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread ON chat_messages(thread_id);
