-- Migration 0008: Tournaments system

CREATE TYPE tournament_status AS ENUM ('upcoming', 'registration', 'live', 'completed');

CREATE TYPE tournament_format AS ENUM ('stroke_play', 'match_play', 'stableford');

CREATE TABLE tournaments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  course_id             UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  created_by_user_id    UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  format                tournament_format NOT NULL DEFAULT 'stroke_play',
  status                tournament_status NOT NULL DEFAULT 'upcoming',
  start_date            TIMESTAMPTZ NOT NULL,
  end_date              TIMESTAMPTZ,
  max_entrants          INTEGER NOT NULL DEFAULT 64,
  entry_fee_in_cents    INTEGER NOT NULL DEFAULT 0,
  prize_pool_in_cents   INTEGER NOT NULL DEFAULT 0,
  prize_name            TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tournament_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id   UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_score     INTEGER,
  holes_completed INTEGER NOT NULL DEFAULT 0,
  score_to_par    INTEGER,
  round_scores    JSONB NOT NULL DEFAULT '[]',
  final_rank      INTEGER,
  entered_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tournament_id, user_id)
);

CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_course ON tournaments(course_id);
CREATE INDEX idx_tournament_entries_tournament ON tournament_entries(tournament_id);
CREATE INDEX idx_tournament_entries_user ON tournament_entries(user_id);
