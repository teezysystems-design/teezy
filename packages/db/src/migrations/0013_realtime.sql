-- Migration 0013: Enable Supabase Realtime on live-feature tables
-- These three tables power the real-time features in the spec:
--   • tournament_entries  → live leaderboard during active tournaments
--   • party_members       → live party composition as friends accept invites
--   • feed_posts          → new post notifications in the social feed

ALTER PUBLICATION supabase_realtime ADD TABLE tournament_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE party_members;
ALTER PUBLICATION supabase_realtime ADD TABLE feed_posts;

-- Also add notifications so clients can receive push-style in-app alerts
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
