-- Migration 0007: Leagues system

CREATE TYPE league_status AS ENUM ('recruiting', 'active', 'playoffs', 'completed');

CREATE TYPE league_member_status AS ENUM ('invited', 'active', 'removed');

CREATE TABLE leagues (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  description         TEXT,
  created_by_user_id  UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  course_id           UUID REFERENCES courses(id) ON DELETE SET NULL,
  status              league_status NOT NULL DEFAULT 'recruiting',
  max_members         INTEGER NOT NULL DEFAULT 8,
  season_start_date   TIMESTAMPTZ,
  season_end_date     TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE league_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id   UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status      league_member_status NOT NULL DEFAULT 'active',
  wins        INTEGER NOT NULL DEFAULT 0,
  losses      INTEGER NOT NULL DEFAULT 0,
  draws       INTEGER NOT NULL DEFAULT 0,
  points      INTEGER NOT NULL DEFAULT 0,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (league_id, user_id)
);

CREATE TABLE league_matches (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id     UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  player1_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  player2_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  winner_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  score1        INTEGER,
  score2        INTEGER,
  round         INTEGER NOT NULL DEFAULT 1,
  match_number  INTEGER NOT NULL DEFAULT 1,
  is_playoff    BOOLEAN NOT NULL DEFAULT FALSE,
  scheduled_at  TIMESTAMPTZ,
  played_at     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leagues_status ON leagues(status);
CREATE INDEX idx_league_members_league ON league_members(league_id);
CREATE INDEX idx_league_members_user ON league_members(user_id);
CREATE INDEX idx_league_matches_league ON league_matches(league_id);
