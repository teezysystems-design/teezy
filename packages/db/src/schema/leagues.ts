import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';
import { courses } from './courses';

export const leagueStatusEnum = pgEnum('league_status', [
  'recruiting',
  'active',
  'playoffs',
  'completed',
]);

export const leagueMemberStatusEnum = pgEnum('league_member_status', [
  'invited',
  'active',
  'removed',
]);

export const leagues = pgTable('leagues', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  createdByUserId: uuid('created_by_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  courseId: uuid('course_id').references(() => courses.id, { onDelete: 'set null' }),
  status: leagueStatusEnum('status').notNull().default('recruiting'),
  maxMembers: integer('max_members').notNull().default(8),
  seasonStartDate: timestamp('season_start_date', { withTimezone: true }),
  seasonEndDate: timestamp('season_end_date', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const leagueMembers = pgTable('league_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  leagueId: uuid('league_id')
    .notNull()
    .references(() => leagues.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  status: leagueMemberStatusEnum('status').notNull().default('active'),
  wins: integer('wins').notNull().default(0),
  losses: integer('losses').notNull().default(0),
  draws: integer('draws').notNull().default(0),
  points: integer('points').notNull().default(0),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
});

export const leagueMatches = pgTable('league_matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  leagueId: uuid('league_id')
    .notNull()
    .references(() => leagues.id, { onDelete: 'cascade' }),
  player1Id: uuid('player1_id').references(() => users.id, { onDelete: 'set null' }),
  player2Id: uuid('player2_id').references(() => users.id, { onDelete: 'set null' }),
  winnerId: uuid('winner_id').references(() => users.id, { onDelete: 'set null' }),
  score1: integer('score1'),
  score2: integer('score2'),
  round: integer('round').notNull().default(1),
  matchNumber: integer('match_number').notNull().default(1),
  isPlayoff: boolean('is_playoff').notNull().default(false),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  playedAt: timestamp('played_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
