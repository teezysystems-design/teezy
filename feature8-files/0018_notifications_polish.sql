-- ═══════════════════════════════════════════════════════════════════════════
-- Feature 8: Notifications + Polish
-- Migration 0018 — Notifications table updates, push tokens, preferences
-- ═══════════════════════════════════════════════════════════════════════════

-- Ensure notifications table has all required columns
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS notification_type TEXT,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS body TEXT,
  ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sent_via_push BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, read_at)
  WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON notifications(user_id, created_at DESC);

-- ─── Push tokens table ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expo_push_token TEXT NOT NULL,
  device_type TEXT, -- 'ios' | 'android'
  device_name TEXT,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, expo_push_token)
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user_active
  ON push_tokens(user_id) WHERE is_active = true;

-- ─── Notification preferences table ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  -- Push notification toggles
  push_friend_requests BOOLEAN DEFAULT true,
  push_party_invites BOOLEAN DEFAULT true,
  push_round_results BOOLEAN DEFAULT true,
  push_league_matches BOOLEAN DEFAULT true,
  push_tournament_updates BOOLEAN DEFAULT true,
  push_rank_changes BOOLEAN DEFAULT true,
  push_social_likes BOOLEAN DEFAULT false,
  push_social_comments BOOLEAN DEFAULT true,
  push_booking_reminders BOOLEAN DEFAULT true,
  -- Quiet hours
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create preferences row when user is created
CREATE OR REPLACE FUNCTION create_default_notification_prefs()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_notification_prefs_trigger ON users;
CREATE TRIGGER create_notification_prefs_trigger
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_default_notification_prefs();

-- Backfill existing users
INSERT INTO notification_preferences (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;

-- ─── RLS policies ───────────────────────────────────────────────────────────

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS push_tokens_owner ON push_tokens;
CREATE POLICY push_tokens_owner ON push_tokens
  FOR ALL USING (
    user_id IN (SELECT id FROM users WHERE supabase_user_id = auth.uid())
  );

DROP POLICY IF EXISTS notif_prefs_owner ON notification_preferences;
CREATE POLICY notif_prefs_owner ON notification_preferences
  FOR ALL USING (
    user_id IN (SELECT id FROM users WHERE supabase_user_id = auth.uid())
  );

-- Enable realtime for notifications (for live updates in mobile app)
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

COMMIT;
