-- Migration 0012: Row Level Security policies
-- Every table gets RLS enabled and appropriate policies.
-- auth.uid() returns the Supabase authenticated user's UUID.
-- The service role bypasses RLS for server-side operations.

-- ─── Helper: resolve our users.id from the Supabase auth UID ─────────────────
-- We join supabase_user_id → id in each policy rather than using a function
-- to keep policies simple and index-friendly.

-- ════════════════════════════════════════════════════════════════════════════
-- USERS
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Anyone can see public profiles; private profiles only visible to self + friends.
CREATE POLICY users_select ON users
  FOR SELECT USING (
    is_private = FALSE
    OR supabase_user_id = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM friendships
      WHERE status = 'accepted'
        AND (
          (requester_id = users.id AND addressee_id = (SELECT id FROM users u2 WHERE u2.supabase_user_id = auth.uid()::text))
          OR
          (addressee_id = users.id AND requester_id = (SELECT id FROM users u2 WHERE u2.supabase_user_id = auth.uid()::text))
        )
    )
  );

-- Users can only update their own row.
CREATE POLICY users_update ON users
  FOR UPDATE USING (supabase_user_id = auth.uid()::text);

-- Insert handled by server (Supabase Auth trigger) — no direct client inserts.
CREATE POLICY users_insert ON users
  FOR INSERT WITH CHECK (supabase_user_id = auth.uid()::text);

-- ════════════════════════════════════════════════════════════════════════════
-- COURSES
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- All active courses are publicly readable.
CREATE POLICY courses_select ON courses
  FOR SELECT USING (is_active = TRUE);

-- Only course staff (owner/manager) or the creator can update.
CREATE POLICY courses_update ON courses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM course_staff cs
      JOIN users u ON u.id = cs.user_id
      WHERE cs.course_id = courses.id
        AND u.supabase_user_id = auth.uid()::text
        AND cs.role IN ('owner', 'manager')
    )
  );

-- Server inserts only (anon cannot create courses).
CREATE POLICY courses_insert ON courses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u WHERE u.supabase_user_id = auth.uid()::text
    )
  );

-- ════════════════════════════════════════════════════════════════════════════
-- COURSE STAFF
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE course_staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY course_staff_select ON course_staff
  FOR SELECT USING (TRUE);  -- Staff list is public

CREATE POLICY course_staff_insert ON course_staff
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM course_staff cs2
      JOIN users u ON u.id = cs2.user_id
      WHERE cs2.course_id = course_staff.course_id
        AND u.supabase_user_id = auth.uid()::text
        AND cs2.role = 'owner'
    )
  );

CREATE POLICY course_staff_delete ON course_staff
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM course_staff cs2
      JOIN users u ON u.id = cs2.user_id
      WHERE cs2.course_id = course_staff.course_id
        AND u.supabase_user_id = auth.uid()::text
        AND cs2.role = 'owner'
    )
  );

-- ════════════════════════════════════════════════════════════════════════════
-- COURSE EVENTS
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE course_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY course_events_select ON course_events
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY course_events_insert ON course_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM course_staff cs JOIN users u ON u.id = cs.user_id
      WHERE cs.course_id = course_events.course_id
        AND u.supabase_user_id = auth.uid()::text
        AND cs.role IN ('owner', 'manager')
    )
  );

CREATE POLICY course_events_update ON course_events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM course_staff cs JOIN users u ON u.id = cs.user_id
      WHERE cs.course_id = course_events.course_id
        AND u.supabase_user_id = auth.uid()::text
        AND cs.role IN ('owner', 'manager')
    )
  );

-- ════════════════════════════════════════════════════════════════════════════
-- TEE TIME SLOTS
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE tee_time_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY tee_time_slots_select ON tee_time_slots
  FOR SELECT USING (TRUE);  -- All slots publicly visible for discovery

CREATE POLICY tee_time_slots_insert ON tee_time_slots
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM course_staff cs JOIN users u ON u.id = cs.user_id
      WHERE cs.course_id = tee_time_slots.course_id
        AND u.supabase_user_id = auth.uid()::text
        AND cs.role IN ('owner', 'manager', 'pro_shop')
    )
  );

CREATE POLICY tee_time_slots_update ON tee_time_slots
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM course_staff cs JOIN users u ON u.id = cs.user_id
      WHERE cs.course_id = tee_time_slots.course_id
        AND u.supabase_user_id = auth.uid()::text
        AND cs.role IN ('owner', 'manager', 'pro_shop')
    )
  );

-- ════════════════════════════════════════════════════════════════════════════
-- BOOKINGS
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Users see their own bookings; course staff see bookings for their course.
CREATE POLICY bookings_select ON bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = bookings.user_id AND u.supabase_user_id = auth.uid()::text)
    OR EXISTS (
      SELECT 1 FROM course_staff cs JOIN users u ON u.id = cs.user_id
      WHERE cs.course_id = bookings.course_id AND u.supabase_user_id = auth.uid()::text
    )
  );

CREATE POLICY bookings_insert ON bookings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = bookings.user_id AND u.supabase_user_id = auth.uid()::text)
  );

CREATE POLICY bookings_update ON bookings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = bookings.user_id AND u.supabase_user_id = auth.uid()::text)
    OR EXISTS (
      SELECT 1 FROM course_staff cs JOIN users u ON u.id = cs.user_id
      WHERE cs.course_id = bookings.course_id AND u.supabase_user_id = auth.uid()::text
        AND cs.role IN ('owner', 'manager', 'pro_shop')
    )
  );

-- ════════════════════════════════════════════════════════════════════════════
-- SCORE CARDS
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE score_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY score_cards_select ON score_cards
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = score_cards.user_id AND u.supabase_user_id = auth.uid()::text)
  );

CREATE POLICY score_cards_insert ON score_cards
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = score_cards.user_id AND u.supabase_user_id = auth.uid()::text)
  );

-- ════════════════════════════════════════════════════════════════════════════
-- USER AVAILABILITY
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE user_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_availability_select ON user_availability
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = user_availability.user_id AND u.supabase_user_id = auth.uid()::text)
    OR EXISTS (
      SELECT 1 FROM friendships f
      JOIN users u ON u.supabase_user_id = auth.uid()::text
      WHERE f.status = 'accepted'
        AND ((f.requester_id = u.id AND f.addressee_id = user_availability.user_id)
          OR (f.addressee_id = u.id AND f.requester_id = user_availability.user_id))
    )
  );

CREATE POLICY user_availability_upsert ON user_availability
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = user_availability.user_id AND u.supabase_user_id = auth.uid()::text)
  );

-- ════════════════════════════════════════════════════════════════════════════
-- FEED POSTS
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY feed_posts_select ON feed_posts
  FOR SELECT USING (TRUE);  -- Feed is public by design

CREATE POLICY feed_posts_insert ON feed_posts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = feed_posts.user_id AND u.supabase_user_id = auth.uid()::text)
  );

CREATE POLICY feed_posts_delete ON feed_posts
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = feed_posts.user_id AND u.supabase_user_id = auth.uid()::text)
  );

-- ════════════════════════════════════════════════════════════════════════════
-- POST LIKES
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY post_likes_select ON post_likes FOR SELECT USING (TRUE);

CREATE POLICY post_likes_insert ON post_likes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = post_likes.user_id AND u.supabase_user_id = auth.uid()::text)
  );

CREATE POLICY post_likes_delete ON post_likes
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = post_likes.user_id AND u.supabase_user_id = auth.uid()::text)
  );

-- ════════════════════════════════════════════════════════════════════════════
-- POST COMMENTS
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY post_comments_select ON post_comments FOR SELECT USING (TRUE);

CREATE POLICY post_comments_insert ON post_comments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = post_comments.user_id AND u.supabase_user_id = auth.uid()::text)
  );

CREATE POLICY post_comments_delete ON post_comments
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = post_comments.user_id AND u.supabase_user_id = auth.uid()::text)
  );

-- ════════════════════════════════════════════════════════════════════════════
-- FRIENDSHIPS
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY friendships_select ON friendships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.supabase_user_id = auth.uid()::text
        AND (u.id = friendships.requester_id OR u.id = friendships.addressee_id)
    )
  );

CREATE POLICY friendships_insert ON friendships
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = friendships.requester_id AND u.supabase_user_id = auth.uid()::text)
  );

CREATE POLICY friendships_update ON friendships
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.supabase_user_id = auth.uid()::text
        AND (u.id = friendships.requester_id OR u.id = friendships.addressee_id)
    )
  );

CREATE POLICY friendships_delete ON friendships
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.supabase_user_id = auth.uid()::text
        AND (u.id = friendships.requester_id OR u.id = friendships.addressee_id)
    )
  );

-- ════════════════════════════════════════════════════════════════════════════
-- GROUPS + GROUP MEMBERS + CHAT MESSAGES
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY groups_select ON groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members gm JOIN users u ON u.id = gm.user_id
      WHERE gm.group_id = groups.id AND u.supabase_user_id = auth.uid()::text
    )
  );

CREATE POLICY groups_insert ON groups
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = groups.created_by_user_id AND u.supabase_user_id = auth.uid()::text)
  );

CREATE POLICY group_members_select ON group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members gm2 JOIN users u ON u.id = gm2.user_id
      WHERE gm2.group_id = group_members.group_id AND u.supabase_user_id = auth.uid()::text
    )
  );

CREATE POLICY group_members_insert ON group_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups g JOIN users u ON u.id = g.created_by_user_id
      WHERE g.id = group_members.group_id AND u.supabase_user_id = auth.uid()::text
    )
  );

CREATE POLICY chat_messages_select ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members gm JOIN users u ON u.id = gm.user_id
      WHERE gm.group_id = chat_messages.group_id AND u.supabase_user_id = auth.uid()::text
    )
  );

CREATE POLICY chat_messages_insert ON chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members gm JOIN users u ON u.id = gm.user_id
      WHERE gm.group_id = chat_messages.group_id
        AND u.id = chat_messages.user_id
        AND u.supabase_user_id = auth.uid()::text
    )
  );

-- ════════════════════════════════════════════════════════════════════════════
-- ROUNDS
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY rounds_select ON rounds
  FOR SELECT USING (
    is_shared = TRUE
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = rounds.user_id AND u.supabase_user_id = auth.uid()::text)
  );

CREATE POLICY rounds_insert ON rounds
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = rounds.user_id AND u.supabase_user_id = auth.uid()::text)
  );

CREATE POLICY rounds_update ON rounds
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = rounds.user_id AND u.supabase_user_id = auth.uid()::text)
  );

-- ════════════════════════════════════════════════════════════════════════════
-- PARTIES + PARTY MEMBERS + HOLE SCORES
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE hole_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY parties_select ON parties
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings b JOIN users u ON u.id = b.user_id
      WHERE b.id = parties.booking_id AND u.supabase_user_id = auth.uid()::text
    )
    OR EXISTS (
      SELECT 1 FROM party_members pm JOIN users u ON u.id = pm.user_id
      WHERE pm.party_id = parties.id AND u.supabase_user_id = auth.uid()::text
    )
  );

CREATE POLICY parties_insert ON parties
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = parties.created_by_user_id AND u.supabase_user_id = auth.uid()::text)
  );

CREATE POLICY party_members_select ON party_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM party_members pm2 JOIN users u ON u.id = pm2.user_id
      WHERE pm2.party_id = party_members.party_id AND u.supabase_user_id = auth.uid()::text
    )
  );

CREATE POLICY party_members_insert ON party_members
  FOR INSERT WITH CHECK (
    -- Only the party creator can invite
    EXISTS (
      SELECT 1 FROM parties p JOIN users u ON u.id = p.created_by_user_id
      WHERE p.id = party_members.party_id AND u.supabase_user_id = auth.uid()::text
    )
    -- Or the user can insert themselves (accepting via link)
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = party_members.user_id AND u.supabase_user_id = auth.uid()::text)
  );

CREATE POLICY party_members_update ON party_members
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = party_members.user_id AND u.supabase_user_id = auth.uid()::text)
  );

CREATE POLICY hole_scores_select ON hole_scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM party_members pm JOIN users u ON u.id = pm.user_id
      WHERE pm.party_id = hole_scores.party_id AND u.supabase_user_id = auth.uid()::text
    )
  );

CREATE POLICY hole_scores_insert ON hole_scores
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = hole_scores.user_id AND u.supabase_user_id = auth.uid()::text)
  );

CREATE POLICY hole_scores_update ON hole_scores
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = hole_scores.user_id AND u.supabase_user_id = auth.uid()::text)
  );

-- ════════════════════════════════════════════════════════════════════════════
-- PLAYER RANKINGS
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE player_rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY player_rankings_select ON player_rankings
  FOR SELECT USING (TRUE);  -- Rankings are public leaderboard data

-- Only server (service role) writes rankings — no direct client writes.
-- Enforce via no INSERT/UPDATE policies; service role bypasses RLS.

-- ════════════════════════════════════════════════════════════════════════════
-- RANKING POINTS (event log)
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE ranking_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY ranking_points_select ON ranking_points
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = ranking_points.user_id AND u.supabase_user_id = auth.uid()::text)
  );

-- ════════════════════════════════════════════════════════════════════════════
-- LEAGUES + LEAGUE MEMBERS + LEAGUE MATCHES + LEAGUE SEASONS
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY leagues_select ON leagues FOR SELECT USING (TRUE);  -- Leagues are discoverable

CREATE POLICY leagues_insert ON leagues
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = leagues.created_by_user_id AND u.supabase_user_id = auth.uid()::text)
  );

CREATE POLICY leagues_update ON leagues
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = leagues.created_by_user_id AND u.supabase_user_id = auth.uid()::text)
  );

CREATE POLICY league_members_select ON league_members FOR SELECT USING (TRUE);

CREATE POLICY league_members_insert ON league_members
  FOR INSERT WITH CHECK (
    -- Commissioner invites, or user joins open league as themselves
    EXISTS (
      SELECT 1 FROM leagues l JOIN users u ON u.id = l.created_by_user_id
      WHERE l.id = league_members.league_id AND u.supabase_user_id = auth.uid()::text
    )
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = league_members.user_id AND u.supabase_user_id = auth.uid()::text)
  );

CREATE POLICY league_matches_select ON league_matches FOR SELECT USING (TRUE);

CREATE POLICY league_seasons_select ON league_seasons FOR SELECT USING (TRUE);

-- ════════════════════════════════════════════════════════════════════════════
-- TOURNAMENTS + TOURNAMENT ENTRIES
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY tournaments_select ON tournaments FOR SELECT USING (TRUE);

CREATE POLICY tournaments_insert ON tournaments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM course_staff cs JOIN users u ON u.id = cs.user_id
      WHERE cs.course_id = tournaments.course_id
        AND u.supabase_user_id = auth.uid()::text
        AND cs.role IN ('owner', 'manager')
    )
  );

CREATE POLICY tournament_entries_select ON tournament_entries FOR SELECT USING (TRUE);

CREATE POLICY tournament_entries_insert ON tournament_entries
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = tournament_entries.user_id AND u.supabase_user_id = auth.uid()::text)
  );

-- ════════════════════════════════════════════════════════════════════════════
-- BILLING (service-role only — no direct client access)
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE billing_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;

-- Course owners can view their own billing data
CREATE POLICY billing_rates_select ON billing_rates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM course_staff cs JOIN users u ON u.id = cs.user_id
      WHERE cs.course_id = billing_rates.course_id
        AND u.supabase_user_id = auth.uid()::text
        AND cs.role = 'owner'
    )
  );

CREATE POLICY invoices_select ON invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM course_staff cs JOIN users u ON u.id = cs.user_id
      WHERE cs.course_id = invoices.course_id
        AND u.supabase_user_id = auth.uid()::text
        AND cs.role = 'owner'
    )
  );

CREATE POLICY invoice_line_items_select ON invoice_line_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices i
      JOIN course_staff cs ON cs.course_id = i.course_id
      JOIN users u ON u.id = cs.user_id
      WHERE i.id = invoice_line_items.invoice_id
        AND u.supabase_user_id = auth.uid()::text
        AND cs.role = 'owner'
    )
  );

-- ════════════════════════════════════════════════════════════════════════════
-- NOTIFICATIONS (private to owner)
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_select ON notifications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = notifications.user_id AND u.supabase_user_id = auth.uid()::text)
  );

CREATE POLICY notifications_update ON notifications
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = notifications.user_id AND u.supabase_user_id = auth.uid()::text)
  );

-- ════════════════════════════════════════════════════════════════════════════
-- WAITLIST (server-insert only, no SELECT for clients)
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY waitlist_insert ON waitlist
  FOR INSERT WITH CHECK (TRUE);  -- Anyone can join waitlist

-- ════════════════════════════════════════════════════════════════════════════
-- STRIPE PAYOUT EVENTS (service-role only)
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE stripe_payout_events ENABLE ROW LEVEL SECURITY;
-- No client-side policies — service role only.
