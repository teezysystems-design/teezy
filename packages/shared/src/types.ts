// ============================================================
// Core Domain Types — shared across mobile, web, and API
// ============================================================

export type Mood =
  | 'competitive'
  | 'relaxed'
  | 'beginner'
  | 'advanced'
  | 'fast-paced'
  | 'social'
  | 'scenic'
  | 'challenging'
  | 'family_friendly'
  | 'walkable'
  | 'night_golf'
  | 'practice_facility';

export interface User {
  id: string;
  email: string;
  name: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  accountType: 'golfer' | 'course_admin';
  isPrivate: boolean;
  handicap: number | null;
  homeCourseId: string | null;
  moodPreferences: Mood[];
  location: GeoPoint | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

// ─── Pricing tiers ───────────────────────────────────────────────────────────
export type PricingTier = 'standard' | 'basic_promotion' | 'active_promotion' | 'tournament' | 'founding';

export const PRICING_TIERS: { tier: PricingTier; label: string; feeCents: number; description: string }[] = [
  { tier: 'standard',         label: 'Standard',           feeCents: 275, description: 'Base rate per completed booking' },
  { tier: 'basic_promotion',  label: 'Basic Promotion',    feeCents: 225, description: 'PAR-Tee listed on your website/booking page' },
  { tier: 'active_promotion', label: 'Active Promotion',   feeCents: 200, description: 'Signage on course + staff mentions to players' },
  { tier: 'tournament',       label: 'Tournament Partner', feeCents: 175, description: 'Run mini tournament + social media promotion' },
  { tier: 'founding',         label: 'Founding Course',    feeCents: 150, description: 'Founding partner rate — locked forever' },
];

export type StaffRole = 'pro_shop' | 'manager' | 'owner';

export interface CourseStaff {
  id: string;
  courseId: string;
  userId: string;
  role: StaffRole;
  createdAt: Date;
}

export interface CourseEvent {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  eventDate: Date;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  name: string;
  description: string | null;
  location: GeoPoint;
  address: string;
  moodTags: Mood[];
  amenities: string[];
  photoUrls: string[];
  rating: number | null;
  reviewCount: number;
  holeCount: 9 | 18 | 27 | 36;
  parScore: number;
  websiteUrl: string | null;
  phoneNumber: string | null;
  stripeAccountId: string | null;
  pricingTier: PricingTier;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeeTimeSlot {
  id: string;
  courseId: string;
  startsAt: Date;
  capacity: number;
  bookedCount: number;
  priceInCents: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type GameMode = 'solo' | 'match_1v1' | 'match_2v2' | 'tournament' | 'casual';

export interface Booking {
  id: string;
  userId: string;
  slotId: string;
  courseId: string;
  status: BookingStatus;
  roundMode: GameMode | null;
  partySize: number;
  bookingFeeCents: number;
  billedAt: Date | null;
  checkedInAt: Date | null;
  noShow: boolean;
  notes: string | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type FriendshipStatus = 'pending' | 'accepted' | 'declined' | 'blocked';

export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: FriendshipStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  createdByUserId: string;
  memberIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Round {
  id: string;
  userId: string;
  courseId: string;
  bookingId: string | null;
  playedAt: Date;
  mode: GameMode | null;
  scoreCard: HoleScore[];
  totalScore: number | null;
  scoreDifferential: number | null;
  verified: boolean;
  moodRating: number | null;
  completedAt: Date | null;
  isShared: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface HoleScore {
  hole: number;
  par: number;
  strokes: number | null;
  fairwayHit: boolean | null;
  greenInRegulation: boolean | null;
  putts: number | null;
}

// ============================================================
// Competitive Feature Types (V2)
// ============================================================

export type RankTier =
  | 'bronze_1'
  | 'bronze_2'
  | 'bronze_3'
  | 'silver_1'
  | 'silver_2'
  | 'silver_3'
  | 'gold_1'
  | 'gold_2'
  | 'gold_3'
  | 'platinum_1'
  | 'platinum_2'
  | 'platinum_3'
  | 'diamond_1'
  | 'diamond_2'
  | 'diamond_3'
  | 'master'
  | 'grandmaster'
  | 'unreal';

export interface RankInfo {
  tier: RankTier;
  label: string;
  icon: string;
  minPoints: number;
  maxPoints: number | null;
}

export const RANK_TIERS: RankInfo[] = [
  { tier: 'bronze_1',     label: 'Bronze 1',     icon: '🥉', minPoints: 0,      maxPoints: 99 },
  { tier: 'bronze_2',     label: 'Bronze 2',     icon: '🥉', minPoints: 100,    maxPoints: 249 },
  { tier: 'bronze_3',     label: 'Bronze 3',     icon: '🥉', minPoints: 250,    maxPoints: 499 },
  { tier: 'silver_1',     label: 'Silver 1',     icon: '🥈', minPoints: 500,    maxPoints: 749 },
  { tier: 'silver_2',     label: 'Silver 2',     icon: '🥈', minPoints: 750,    maxPoints: 999 },
  { tier: 'silver_3',     label: 'Silver 3',     icon: '🥈', minPoints: 1000,   maxPoints: 1499 },
  { tier: 'gold_1',       label: 'Gold 1',       icon: '🥇', minPoints: 1500,   maxPoints: 1999 },
  { tier: 'gold_2',       label: 'Gold 2',       icon: '🥇', minPoints: 2000,   maxPoints: 2749 },
  { tier: 'gold_3',       label: 'Gold 3',       icon: '🥇', minPoints: 2750,   maxPoints: 3499 },
  { tier: 'platinum_1',   label: 'Platinum 1',   icon: '💎', minPoints: 3500,   maxPoints: 4499 },
  { tier: 'platinum_2',   label: 'Platinum 2',   icon: '💎', minPoints: 4500,   maxPoints: 5499 },
  { tier: 'platinum_3',   label: 'Platinum 3',   icon: '💎', minPoints: 5500,   maxPoints: 6999 },
  { tier: 'diamond_1',    label: 'Diamond 1',    icon: '💠', minPoints: 7000,   maxPoints: 8499 },
  { tier: 'diamond_2',    label: 'Diamond 2',    icon: '💠', minPoints: 8500,   maxPoints: 9999 },
  { tier: 'diamond_3',    label: 'Diamond 3',    icon: '💠', minPoints: 10000,  maxPoints: 12499 },
  { tier: 'master',       label: 'Master',       icon: '🔮', minPoints: 12500,  maxPoints: 14999 },
  { tier: 'grandmaster',  label: 'Grandmaster',  icon: '👑', minPoints: 15000,  maxPoints: 19999 },
  { tier: 'unreal',       label: 'Unreal',       icon: '⚡', minPoints: 20000,  maxPoints: null },
];

export interface PlayerRanking {
  userId: string;
  userName: string;
  avatarUrl: string | null;
  tier: RankTier;
  points: number;
  rank: number;
  roundsPlayed: number;
  avgScore: number | null;
  winRate: number | null;
}

export type LeaderboardType = 'main' | '1v1' | '2v2';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatarUrl: string | null;
  tier: RankTier;
  points: number;
  wins: number;
  losses: number;
  avgScore: number | null;
}

export type LeagueStatus = 'recruiting' | 'active' | 'playoffs' | 'completed';

export interface League {
  id: string;
  name: string;
  description: string | null;
  createdByUserId: string;
  status: LeagueStatus;
  maxMembers: number;
  currentMembers: number;
  seasonStartDate: Date | null;
  seasonEndDate: Date | null;
  courseId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeagueStanding {
  rank: number;
  userId: string;
  userName: string;
  avatarUrl: string | null;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  matchesPlayed: number;
}

export interface BracketMatch {
  id: string;
  round: number;
  matchNumber: number;
  player1Id: string | null;
  player2Id: string | null;
  player1Name: string | null;
  player2Name: string | null;
  winnerId: string | null;
  scheduledAt: Date | null;
  score1: number | null;
  score2: number | null;
}

export type TournamentStatus = 'upcoming' | 'registration' | 'live' | 'completed';
export type TournamentFormat = 'stroke_play' | 'match_play' | 'stableford';

export interface Tournament {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  format: TournamentFormat;
  status: TournamentStatus;
  startDate: Date;
  endDate: Date | null;
  maxEntrants: number;
  currentEntrants: number;
  entryFeeInCents: number;
  prizePoolInCents: number;
  isOptedIn: boolean;
  createdAt: Date;
}

export interface TournamentLeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatarUrl: string | null;
  totalScore: number;
  holesCompleted: number;
  scoreToPar: number;
  roundScores: number[];
}

// ============================================================
// Phase 3: Availability Calendar & Social Feed Types
// ============================================================

/** ISO weekday numbers: 0=Sun 1=Mon … 6=Sat */
export interface UserAvailability {
  userId: string;
  availableDays: number[];
  updatedAt: Date;
}

export type FeedPostType =
  | 'round_score'
  | 'swing_video'
  | 'rank_up'
  | 'tournament_result'
  | 'league_result';

export interface RoundScorePayload {
  courseId: string;
  courseName: string;
  totalScore: number;
  scoreToPar: number;
  holes: number;
}

export interface SwingVideoPayload {
  videoUrl: string;
  thumbnailUrl: string | null;
  caption: string | null;
}

export interface RankUpPayload {
  fromTier: RankTier;
  toTier: RankTier;
  points: number;
}

export interface TournamentResultPayload {
  tournamentId: string;
  tournamentName: string;
  rank: number;
  totalScore: number;
}

export interface LeagueResultPayload {
  leagueId: string;
  leagueName: string;
  wins: number;
  losses: number;
  rank: number;
}

export type FeedPostPayload =
  | RoundScorePayload
  | SwingVideoPayload
  | RankUpPayload
  | TournamentResultPayload
  | LeagueResultPayload;

export interface FeedPost {
  id: string;
  userId: string;
  type: FeedPostType;
  payload: FeedPostPayload;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  author: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  createdAt: Date;
}

export interface PostComment {
  id: string;
  postId: string;
  body: string;
  author: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  createdAt: Date;
}

// ============================================================
// API Request/Response shapes
// ============================================================

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    hasNext: boolean;
  };
}

export interface DiscoverQuery {
  mood?: Mood;
  lat: number;
  lng: number;
  radiusKm?: number;
  page?: number;
  pageSize?: number;
}
