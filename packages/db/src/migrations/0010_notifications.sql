-- Migration 0010: Notifications table

CREATE TYPE notification_type AS ENUM (
  'booking_confirmed',
  'booking_cancelled',
  'party_invite',
  'party_accepted',
  'party_declined',
  'friend_request',
  'friend_accepted',
  'league_invite',
  'league_match_scheduled',
  'league_match_result',
  'tournament_starting',
  'tournament_result',
  'rank_up',
  'rank_down',
  'invoice_due',
  'invoice_paid'
);

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  -- Generic payload keyed to the notification type (booking_id, party_id, etc.)
  payload     JSONB NOT NULL DEFAULT '{}',
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = FALSE;
