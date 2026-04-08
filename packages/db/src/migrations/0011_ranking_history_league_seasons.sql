-- Migration 0011: Ranking points event log + league seasons

-- Ranking point change events — every award/deduction is logged here
CREATE TYPE ranking_event_type AS ENUM (
  'round_completed',
  'match_won',
  'match_lost',
  'match_drawn',
  'tournament_placement',
  'season_bonus',
  'decay',
  'manual_adjustment'
);

CREATE TABLE ranking_points (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  leaderboard_type  leaderboard_type NOT NULL DEFAULT 'main',
  event_type        ranking_event_type NOT NULL,
  points_delta      INTEGER NOT NULL,               -- positive = award, negative = deduction
  points_after      INTEGER NOT NULL,               -- snapshot of total after this event
  tier_before       rank_tier NOT NULL,
  tier_after        rank_tier NOT NULL,
  reference_id      UUID,                           -- booking_id / match_id / tournament_entry_id
  reference_table   TEXT,                           -- 'bookings' | 'league_matches' | 'tournament_entries'
  note              TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ranking_points_user ON ranking_points(user_id, created_at DESC);
CREATE INDEX idx_ranking_points_leaderboard ON ranking_points(leaderboard_type, created_at DESC);

-- League seasons — each league can run multiple seasons
CREATE TABLE league_seasons (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id     UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL DEFAULT 1,
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  winner_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (league_id, season_number)
);

CREATE INDEX idx_league_seasons_league ON league_seasons(league_id);
CREATE INDEX idx_league_seasons_active ON league_seasons(league_id) WHERE is_active = TRUE;
