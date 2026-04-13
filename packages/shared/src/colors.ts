/**
 * PAR-Tee Design Tokens — shared color palette used across web and mobile.
 *
 * Web usage:  import { COLORS } from '@par-tee/shared/colors'
 * Mobile:     import { COLORS } from '@par-tee/shared/colors'
 *
 * NOTE: Mobile StyleSheet values must be plain strings (no CSS variables).
 * Use these tokens directly in both React and React Native style objects.
 */

export const COLORS = {
  // Brand greens
  primary: '#1a7f4b',
  primaryDark: '#155f38',
  primaryLight: '#2db870',
  primaryPale: '#e8f5ee',
  primaryPale2: '#f0faf4',

  // Neutrals
  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',

  // Semantic
  success: '#1a7f4b',
  warning: '#f59e0b',
  error: '#ef4444',
  errorLight: '#fca5a5',

  // Mobile-specific aliases (slightly higher contrast for small screens)
  mobileText: '#111111',
  mobileSubtext: '#666666',
  mobileBorder: '#e0e0e0',
  mobileDisabled: '#a8d5be',
} as const;

export type ColorKey = keyof typeof COLORS;

/** MOODS constant — single source of truth for mood keys and display labels */
export const MOODS = [
  { key: 'relaxed', emoji: '😌', label: 'Relaxed', desc: 'Leisurely pace, no pressure' },
  { key: 'competitive', emoji: '🏆', label: 'Competitive', desc: 'Match play, keep score' },
  { key: 'social', emoji: '👥', label: 'Social', desc: 'Great for groups & friends' },
  { key: 'scenic', emoji: '🌅', label: 'Scenic', desc: 'Beautiful views, take it in' },
  { key: 'beginner', emoji: '🌱', label: 'Beginner-friendly', desc: 'Learning-friendly courses' },
  { key: 'advanced', emoji: '🔥', label: 'Advanced', desc: 'Challenging play for skilled golfers' },
  { key: 'fast-paced', emoji: '⚡', label: 'Fast-paced', desc: 'Quick rounds, efficient play' },
  { key: 'challenging', emoji: '💪', label: 'Challenging', desc: 'Tough conditions, test yourself' },
  { key: 'family_friendly', emoji: '👨‍👩‍👧', label: 'Family-Friendly', desc: 'Great for all ages' },
  { key: 'walkable', emoji: '🚶', label: 'Walkable', desc: 'Easy to walk the course' },
  { key: 'night_golf', emoji: '🌙', label: 'Night Golf', desc: 'Play under the lights' },
  { key: 'practice_facility', emoji: '🎯', label: 'Practice Facility', desc: 'Driving range & putting green' },
] as const;

export type MoodKey = (typeof MOODS)[number]['key'];

/** Rank tier visual tokens — bg, text, border colors per tier */
export const RANK_COLORS = {
  bronze_1:      { bg: '#FFF8F0', text: '#CD7F32', border: '#CD7F32', glow: 'transparent' },
  bronze_2:      { bg: '#FFF8F0', text: '#CD7F32', border: '#CD7F32', glow: 'transparent' },
  bronze_3:      { bg: '#FFF8F0', text: '#CD7F32', border: '#CD7F32', glow: 'transparent' },
  silver_1:      { bg: '#F8F8F8', text: '#808080', border: '#C0C0C0', glow: 'transparent' },
  silver_2:      { bg: '#F8F8F8', text: '#808080', border: '#C0C0C0', glow: 'transparent' },
  silver_3:      { bg: '#F8F8F8', text: '#808080', border: '#C0C0C0', glow: 'transparent' },
  gold_1:        { bg: '#FFFDF0', text: '#B8860B', border: '#FFD700', glow: 'transparent' },
  gold_2:        { bg: '#FFFDF0', text: '#B8860B', border: '#FFD700', glow: 'transparent' },
  gold_3:        { bg: '#FFFDF0', text: '#B8860B', border: '#FFD700', glow: 'transparent' },
  platinum_1:    { bg: '#F5F5F5', text: '#666666', border: '#E5E4E2', glow: 'transparent' },
  platinum_2:    { bg: '#F5F5F5', text: '#666666', border: '#E5E4E2', glow: 'transparent' },
  platinum_3:    { bg: '#F5F5F5', text: '#666666', border: '#E5E4E2', glow: 'transparent' },
  diamond_1:     { bg: '#F0FEFF', text: '#0077B6', border: '#B9F2FF', glow: 'transparent' },
  diamond_2:     { bg: '#F0FEFF', text: '#0077B6', border: '#B9F2FF', glow: 'transparent' },
  diamond_3:     { bg: '#F0FEFF', text: '#0077B6', border: '#B9F2FF', glow: 'transparent' },
  master:        { bg: '#F3E8FF', text: '#7C3AED', border: '#9B59B6', glow: '#7C3AED' },
  grandmaster:   { bg: '#FEE2E2', text: '#DC2626', border: '#E74C3C', glow: '#DC2626' },
  unreal:        { bg: '#0f0f1a', text: '#e9d5ff', border: '#7c3aed', glow: '#7c3aed' },
} as const;

export type RankTierKey = keyof typeof RANK_COLORS;
