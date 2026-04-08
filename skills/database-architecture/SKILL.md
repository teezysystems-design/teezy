---
name: database-architecture
description: >
  PAR-Tee database design and migration skill. Use when creating Supabase migrations,
  designing new tables, adding PostGIS location queries, writing RLS policies,
  creating RPCs, or optimizing PostgreSQL queries.
---

# Database Architecture — PAR-Tee

Supabase/PostgreSQL schema design, migrations, and query optimization for PAR-Tee.

## Stack

- **Database**: Supabase (PostgreSQL 15 + PostGIS extension)
- **Client**: Supabase JS v2 (`packages/db/`)
- **Auth**: Supabase Auth (RLS ties to `auth.uid()`)
- **Realtime**: Supabase Realtime for live leaderboards and feed

## Core Tables

| Table | Purpose |
|-------|---------|
| `users` | Profile, handicap, mood_preferences, notification_preferences |
| `courses` | Golf courses with PostGIS location, mood_tags, amenities |
| `tee_times` | Available slots with capacity |
| `bookings` | Tee time reservations with party composition |
| `rounds` | Completed rounds with hole-by-hole scores |
| `player_rankings` | Current tier, total_points per user |
| `ranking_points` | Point history with tier_after |
| `leagues` | 1v1 and 2v2 league definitions |
| `league_members` | League membership |
| `league_matches` | Head-to-head pairings and results |
| `tournaments` | Course-created mini-tournaments |
| `tournament_entries` | Golfer opt-in |
| `tournament_scores` | Leaderboard entries |
| `social_posts` | Activity feed items |
| `post_likes` | Like/react records |
| `post_comments` | Comment thread |
| `friendships` | Bidirectional friend graph |
| `friend_requests` | Pending requests |
| `notifications` | Push notification records |
| `availability` | Weekly availability toggles |

## Migration Convention

Migrations live in `supabase/migrations/`. File naming: `YYYYMMDDHHMMSS_description.sql`.

```sql
-- Example: add new column with default
ALTER TABLE courses ADD COLUMN IF NOT EXISTS avg_rating NUMERIC(3,1) DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_courses_avg_rating ON courses(avg_rating DESC NULLS LAST);
```

## RLS Patterns

```sql
-- Users can read their own row
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = id);

-- Public read for courses
CREATE POLICY "courses_public_read" ON courses FOR SELECT USING (is_active = true);

-- Bookings: own only
CREATE POLICY "bookings_own" ON bookings FOR ALL USING (auth.uid() = user_id);
```

## PostGIS Patterns

```sql
-- Nearby courses (within radiusKm)
SELECT * FROM courses
WHERE ST_DWithin(
  location::geography,
  ST_MakePoint($lng, $lat)::geography,
  $radiusKm * 1000
)
ORDER BY location <-> ST_MakePoint($lng, $lat)::geography;
```

## Supabase Realtime Pattern

```typescript
// Live tournament leaderboard
const channel = supabase
  .channel(`tournament:${tournamentId}`)
  .on('postgres_changes', {
    event: '*', schema: 'public', table: 'tournament_scores',
    filter: `tournament_id=eq.${tournamentId}`,
  }, (payload) => { /* update state */ })
  .subscribe();
```

## Performance Rules

- Always add indexes for foreign keys and common filter columns
- Use `count: 'exact'` sparingly — expensive on large tables
- Prefer `select('id, name, ...')` over `select('*')` in API routes
- Use RPCs for complex multi-step operations (e.g. `calculate_ranking_points`)
