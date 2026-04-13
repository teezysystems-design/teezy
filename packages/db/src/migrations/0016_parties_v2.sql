-- 0016_parties_v2.sql
-- Upgrades party system for Feature 3:
--   1. Update game_mode enum → spec values (solo, match_1v1, match_2v2, tournament, casual)
--   2. Add missing columns to parties (course_id, max_size, notes, role on members)
--   3. Par column on hole_scores already added in 0015
-- ============================================================================

-- ════════════════════════════════════════════════════════════════════════════
-- 1. GAME MODE ENUM — replace old chill/fun/competitive with spec values
-- ════════════════════════════════════════════════════════════════════════════

-- Rename old enum
ALTER TYPE game_mode RENAME TO game_mode_old;

-- Create new enum with spec values
CREATE TYPE game_mode AS ENUM ('solo', 'match_1v1', 'match_2v2', 'tournament', 'casual');

-- Migrate parties.game_mode
ALTER TABLE parties ALTER COLUMN game_mode DROP DEFAULT;
ALTER TABLE parties ALTER COLUMN game_mode TYPE game_mode
  USING CASE
    WHEN game_mode::text = 'chill'       THEN 'casual'::game_mode
    WHEN game_mode::text = 'fun'         THEN 'solo'::game_mode
    WHEN game_mode::text = 'competitive' THEN 'match_1v1'::game_mode
    ELSE 'casual'::game_mode
  END;
ALTER TABLE parties ALTER COLUMN game_mode SET DEFAULT 'casual';

-- Migrate bookings.round_mode if it references old enum
-- (round_mode was added in 0015 as game_mode type)
DO $$ BEGIN
  ALTER TABLE bookings ALTER COLUMN round_mode TYPE game_mode
    USING CASE
      WHEN round_mode::text = 'chill'       THEN 'casual'::game_mode
      WHEN round_mode::text = 'fun'         THEN 'solo'::game_mode
      WHEN round_mode::text = 'competitive' THEN 'match_1v1'::game_mode
      WHEN round_mode::text IS NULL         THEN NULL
      ELSE round_mode::text::game_mode
    END;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Migrate rounds.mode if it exists
DO $$ BEGIN
  ALTER TABLE rounds ALTER COLUMN mode TYPE game_mode
    USING CASE
      WHEN mode::text = 'chill'       THEN 'casual'::game_mode
      WHEN mode::text = 'fun'         THEN 'solo'::game_mode
      WHEN mode::text = 'competitive' THEN 'match_1v1'::game_mode
      WHEN mode::text IS NULL         THEN NULL
      ELSE mode::text::game_mode
    END;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Drop old enum
DROP TYPE game_mode_old;

-- ════════════════════════════════════════════════════════════════════════════
-- 2. PARTIES TABLE — add missing columns
-- ════════════════════════════════════════════════════════════════════════════

-- Course reference (denormalized from booking for faster queries)
ALTER TABLE parties ADD COLUMN IF NOT EXISTS course_id uuid REFERENCES courses(id) ON DELETE SET NULL;

-- Max party size (from booking party_size)
ALTER TABLE parties ADD COLUMN IF NOT EXISTS max_size integer DEFAULT 4 CHECK (max_size BETWEEN 1 AND 4);

-- Notes (rename from singular 'note' if it exists)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parties' AND column_name = 'note') THEN
    ALTER TABLE parties RENAME COLUMN note TO notes;
  ELSE
    ALTER TABLE parties ADD COLUMN IF NOT EXISTS notes text;
  END IF;
END $$;

-- Backfill course_id from bookings
UPDATE parties p
SET course_id = b.course_id
FROM bookings b
WHERE p.booking_id = b.id
  AND p.course_id IS NULL;

-- ════════════════════════════════════════════════════════════════════════════
-- 3. PARTY MEMBERS — add role column
-- ════════════════════════════════════════════════════════════════════════════

ALTER TABLE party_members ADD COLUMN IF NOT EXISTS role text DEFAULT 'member' CHECK (role IN ('host', 'member'));

-- Backfill: party creator is 'host'
UPDATE party_members pm
SET role = 'host'
FROM parties p
WHERE pm.party_id = p.id
  AND pm.user_id = p.created_by_user_id
  AND pm.role = 'member';

-- ════════════════════════════════════════════════════════════════════════════
-- 4. INDEXES for new query patterns
-- ════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS parties_course_id_idx ON parties(course_id);
CREATE INDEX IF NOT EXISTS parties_status_idx ON parties(status);
CREATE INDEX IF NOT EXISTS party_members_user_status_idx ON party_members(user_id, status);

-- ════════════════════════════════════════════════════════════════════════════
-- 5. RLS policies for parties
-- ════════════════════════════════════════════════════════════════════════════

ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE hole_scores ENABLE ROW LEVEL SECURITY;

-- Parties: members can read, host can write
DO $$ BEGIN
  DROP POLICY IF EXISTS "parties_select" ON parties;
  CREATE POLICY "parties_select" ON parties FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM party_members pm
      JOIN users u ON u.id = pm.user_id
      WHERE pm.party_id = parties.id
        AND u.supabase_user_id = auth.uid()
        AND pm.status IN ('accepted', 'invited')
    )
    OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = parties.created_by_user_id
        AND u.supabase_user_id = auth.uid()
    )
  );

  DROP POLICY IF EXISTS "parties_insert" ON parties;
  CREATE POLICY "parties_insert" ON parties FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = created_by_user_id AND u.supabase_user_id = auth.uid()
    )
  );

  DROP POLICY IF EXISTS "parties_update" ON parties;
  CREATE POLICY "parties_update" ON parties FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = created_by_user_id AND u.supabase_user_id = auth.uid()
    )
  );
EXCEPTION WHEN others THEN NULL;
END $$;

-- Hole scores: own scores writable, party members can read all
DO $$ BEGIN
  DROP POLICY IF EXISTS "hole_scores_select" ON hole_scores;
  CREATE POLICY "hole_scores_select" ON hole_scores FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM party_members pm
      JOIN users u ON u.id = pm.user_id
      WHERE pm.party_id = hole_scores.party_id
        AND u.supabase_user_id = auth.uid()
        AND pm.status = 'accepted'
    )
  );

  DROP POLICY IF EXISTS "hole_scores_insert" ON hole_scores;
  CREATE POLICY "hole_scores_insert" ON hole_scores FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = user_id AND u.supabase_user_id = auth.uid()
    )
  );

  DROP POLICY IF EXISTS "hole_scores_update" ON hole_scores;
  CREATE POLICY "hole_scores_update" ON hole_scores FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = user_id AND u.supabase_user_id = auth.uid()
    )
  );
EXCEPTION WHEN others THEN NULL;
END $$;
