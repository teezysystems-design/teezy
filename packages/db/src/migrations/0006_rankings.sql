-- Migration 0006: Player ranking system

CREATE TYPE rank_tier AS ENUM (
  'rookie', 'amateur', 'club_player', 'scratch', 'pro', 'elite', 'champion', 'unreal'
);

CREATE TYPE leaderboard_type AS ENUM ('main', '1v1', '2v2');

CREATE TABLE player_rankings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  leaderboard_type leaderboard_type NOT NULL DEFAULT 'main',
  points          INTEGER NOT NULL DEFAULT 0,
  tier            rank_tier NOT NULL DEFAULT 'rookie',
  rank            INTEGER,
  wins            INTEGER NOT NULL DEFAULT 0,
  losses          INTEGER NOT NULL DEFAULT 0,
  draws           INTEGER NOT NULL DEFAULT 0,
  rounds_played   INTEGER NOT NULL DEFAULT 0,
  avg_score       DOUBLE PRECISION,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, leaderboard_type)
);

CREATE INDEX idx_player_rankings_user ON player_rankings(user_id);
CREATE INDEX idx_player_rankings_points ON player_rankings(leaderboard_type, points DESC);
