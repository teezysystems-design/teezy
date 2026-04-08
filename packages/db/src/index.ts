export * from './client';
export * from './schema';

// ── Inferred row types ────────────────────────────────────────────────────────
// Import these in apps/packages instead of using the table objects directly.
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type {
  users, courses, courseStaff, courseEvents, teeTimeSlots,
  bookings, scoreCards, userAvailability,
  feedPosts, postLikes, postComments, friendships,
  groups, groupMembers, chatMessages, rounds,
  parties, partyMembers, holeScores,
  playerRankings, rankingPoints,
  leagues, leagueMembers, leagueMatches, leagueSeasons,
  tournaments, tournamentEntries,
  billingRates, invoices, invoiceLineItems,
  notifications, waitlist,
} from './schema';

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type Course = InferSelectModel<typeof courses>;
export type NewCourse = InferInsertModel<typeof courses>;
export type CourseStaff = InferSelectModel<typeof courseStaff>;
export type CourseEvent = InferSelectModel<typeof courseEvents>;
export type TeeTimeSlot = InferSelectModel<typeof teeTimeSlots>;
export type Booking = InferSelectModel<typeof bookings>;
export type NewBooking = InferInsertModel<typeof bookings>;
export type ScoreCard = InferSelectModel<typeof scoreCards>;
export type UserAvailability = InferSelectModel<typeof userAvailability>;
export type FeedPost = InferSelectModel<typeof feedPosts>;
export type NewFeedPost = InferInsertModel<typeof feedPosts>;
export type PostLike = InferSelectModel<typeof postLikes>;
export type PostComment = InferSelectModel<typeof postComments>;
export type NewPostComment = InferInsertModel<typeof postComments>;
export type Friendship = InferSelectModel<typeof friendships>;
export type NewFriendship = InferInsertModel<typeof friendships>;
export type Group = InferSelectModel<typeof groups>;
export type GroupMember = InferSelectModel<typeof groupMembers>;
export type ChatMessage = InferSelectModel<typeof chatMessages>;
export type NewChatMessage = InferInsertModel<typeof chatMessages>;
export type Round = InferSelectModel<typeof rounds>;
export type NewRound = InferInsertModel<typeof rounds>;
export type Party = InferSelectModel<typeof parties>;
export type NewParty = InferInsertModel<typeof parties>;
export type PartyMember = InferSelectModel<typeof partyMembers>;
export type NewPartyMember = InferInsertModel<typeof partyMembers>;
export type HoleScore = InferSelectModel<typeof holeScores>;
export type NewHoleScore = InferInsertModel<typeof holeScores>;
export type PlayerRanking = InferSelectModel<typeof playerRankings>;
export type RankingPoint = InferSelectModel<typeof rankingPoints>;
export type NewRankingPoint = InferInsertModel<typeof rankingPoints>;
export type League = InferSelectModel<typeof leagues>;
export type NewLeague = InferInsertModel<typeof leagues>;
export type LeagueMember = InferSelectModel<typeof leagueMembers>;
export type LeagueMatch = InferSelectModel<typeof leagueMatches>;
export type LeagueSeason = InferSelectModel<typeof leagueSeasons>;
export type Tournament = InferSelectModel<typeof tournaments>;
export type NewTournament = InferInsertModel<typeof tournaments>;
export type TournamentEntry = InferSelectModel<typeof tournamentEntries>;
export type NewTournamentEntry = InferInsertModel<typeof tournamentEntries>;
export type BillingRate = InferSelectModel<typeof billingRates>;
export type Invoice = InferSelectModel<typeof invoices>;
export type NewInvoice = InferInsertModel<typeof invoices>;
export type InvoiceLineItem = InferSelectModel<typeof invoiceLineItems>;
export type NewInvoiceLineItem = InferInsertModel<typeof invoiceLineItems>;
export type Notification = InferSelectModel<typeof notifications>;
export type NewNotification = InferInsertModel<typeof notifications>;
export type Waitlist = InferSelectModel<typeof waitlist>;
