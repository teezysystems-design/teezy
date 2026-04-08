import { boolean, jsonb, pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const notificationTypeEnum = pgEnum('notification_type', [
  'booking_confirmed',
  'booking_cancelled',
  'party_invite',
  'party_accepted',
  'party_declined',
  'friend_request',
  'friend_accepted',
  'league_invite',
  'league_match_scheduled',
  'league_match_result',
  'tournament_starting',
  'tournament_result',
  'rank_up',
  'rank_down',
  'invoice_due',
  'invoice_paid',
]);

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: notificationTypeEnum('type').notNull(),
  payload: jsonb('payload').notNull().default({}),
  isRead: boolean('is_read').notNull().default(false),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
