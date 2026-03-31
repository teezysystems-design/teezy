-- Chat messages for group real-time chat (used with Supabase Realtime)
CREATE TABLE chat_messages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id   UUID NOT NULL REFERENCES groups (id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_group ON chat_messages (group_id, created_at DESC);
CREATE INDEX idx_chat_messages_user ON chat_messages (user_id);

-- Enable Supabase Realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
