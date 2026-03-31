import { doublePrecision, integer, pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const rankTierEnum = pgEnum('rank_tier', [
  'rookie',
  'amateur',
  'club_player',
  'scratch',
  'pro',
  'elite',
  'champion',
  'unreal',
]);

export const leaderboardTypeEnum = pgEnum('leaderboard_type', ['main', '1v1', '2v2']);

export const playerRankings = pgTable('player_rankings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  leaderboardType: leaderboardTypeEnum('leaderboard_type').notNull().default('main'),
  points: integer('points').notNull().default(0),
  tier: rankTierEnum('tier').notNull().default('rookie'),
  rank: integer('rank'),
  wins: integer('wins').notNull().default(0),
  losses: integer('losses').notNull().default(0),
  draws: integer('draws').notNull().default(0),
  roundsPlayed: integer('rounds_played').notNull().default(0),
  avgScore: doublePrecision('avg_score'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
