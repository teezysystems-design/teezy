/**
 * My Rounds History — Section 12
 *
 * - Full list of the user's submitted rounds
 * - Sortable by date, score
 * - Each row: course, date, score vs par, game mode, ranking delta
 */
import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

const API_URL = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:4000';

const C = {
  primary: '#1a7f4b',
  primaryLight: '#e8f5ee',
  white: '#fff',
  gray50: '#f7f7f7',
  gray100: '#f0f0f0',
  gray400: '#9ca3af',
  gray600: '#6b7280',
  gray900: '#111827',
  border: '#e5e7eb',
  purple: '#7c3aed',
  green: '#16a34a',
  amber: '#d97706',
  red: '#dc2626',
};

interface Round {
  id: string;
  courseName: string;
  courseId: string;
  startedAt: string;
  completedAt: string;
  totalScore: number;
  scoreToPar: number;
  holeCount: number;
  gameMode: 'chill' | 'fun' | 'competitive';
  rankPointsDelta: number | null;
  holesInOne: number;
  eagles: number;
  birdies: number;
}

type SortKey = 'date' | 'score';

function scoreLabel(diff: number): { text: string; color: string; bg: string } {
  if (diff <= -2) return { text: `${diff}`, color: C.purple, bg: '#ede9fe' };
  if (diff === -1) return { text: '-1', color: C.green, bg: '#dcfce7' };
  if (diff === 0)  return { text: 'E', color: C.gray600, bg: C.gray100 };
  if (diff === 1)  return { text: '+1', color: C.amber, bg: '#fef3c7' };
  if (diff === 2)  return { text: '+2', color: C.red, bg: '#fee2e2' };
  return { text: `+${diff}`, color: '#7f1d1d', bg: '#fca5a5' };
}

const GAME_MODE_BADGE: Record<string, string> = {
  chill: '😎 Chill',
  fun: '🎉 Fun',
  competitive: '🏆 Competitive',
};

function RoundRow({ round }: { round: Round }) {
  const { text, color, bg } = scoreLabel(round.scoreToPar);
  const date = new Date(round.completedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
  const highlights = [
    round.holesInOne > 0 && `${round.holesInOne} hole-in-one`,
    round.eagles > 0 && `${round.eagles} eagle${round.eagles !== 1 ? 's' : ''}`,
    round.birdies > 0 && `${round.birdies} birdie${round.birdies !== 1 ? 's' : ''}`,
  ].filter(Boolean) as string[];

  return (
    <View style={r.row}>
      {/* Score badge */}
      <View style={[r.scoreBadge, { backgroundColor: bg }]}>
        <Text style={[r.scoreToPar, { color }]}>{text}</Text>
        <Text style={[r.totalScore, { color }]}>{round.totalScore}</Text>
      </View>

      {/* Info */}
      <View style={r.info}>
        <Text style={r.courseName} numberOfLines={1}>{round.courseName}</Text>
        <Text style={r.date}>{date} · {round.holeCount} holes</Text>
        <View style={r.metaRow}>
          <Text style={r.modeTag}>{GAME_MODE_BADGE[round.gameMode] ?? round.gameMode}</Text>
          {round.rankPointsDelta != null && round.gameMode !== 'chill' && (
            <Text style={[r.rankDelta, { color: round.rankPointsDelta >= 0 ? C.green : C.red }]}>
              {round.rankPointsDelta >= 0 ? '+' : ''}{round.rankPointsDelta} pts
            </Text>
          )}
        </View>
        {highlights.length > 0 && (
          <Text style={r.highlights}>{highlights.join(' · ')}</Text>
        )}
      </View>
    </View>
  );
}

const r = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: C.white,
    padding: 16,
    alignItems: 'flex-start',
  },
  scoreBadge: {
    width: 64,
    height: 64,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreToPar: { fontSize: 13, fontWeight: '700' },
  totalScore: { fontSize: 22, fontWeight: '900', lineHeight: 26 },
  info: { flex: 1 },
  courseName: { fontSize: 15, fontWeight: '700', color: C.gray900 },
  date: { fontSize: 13, color: C.gray400, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  modeTag: { fontSize: 12, color: C.gray600, backgroundColor: C.gray100, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  rankDelta: { fontSize: 13, fontWeight: '700' },
  highlights: { fontSize: 12, color: C.primary, marginTop: 4, fontWeight: '600' },
});

export default function RoundsHistoryScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>('date');

  const fetchRounds = useCallback(
    async (silent = false) => {
      if (!session) return;
      if (!silent) setLoading(true);
      try {
        const res = await fetch(`${API_URL}/v1/rounds/me`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const json = await res.json();
          setRounds(json.data ?? []);
        }
      } catch {
        setRounds([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [session]
  );

  useEffect(() => { fetchRounds(); }, [fetchRounds]);

  const sorted = [...rounds].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
    }
    return a.scoreToPar - b.scoreToPar;
  });

  const avgScore = rounds.length > 0
    ? (rounds.reduce((s, r) => s + r.totalScore, 0) / rounds.length).toFixed(1)
    : '—';
  const bestToPar = rounds.length > 0
    ? Math.min(...rounds.map((r) => r.scoreToPar))
    : null;

  return (
    <View style={s.screen}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Rounds</Text>
      </View>

      {/* Stats summary */}
      {rounds.length > 0 && (
        <View style={s.statsRow}>
          <View style={s.statItem}>
            <Text style={s.statValue}>{rounds.length}</Text>
            <Text style={s.statLabel}>Total</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statValue}>{avgScore}</Text>
            <Text style={s.statLabel}>Avg Score</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={[s.statValue, { color: bestToPar != null && bestToPar < 0 ? C.green : C.gray900 }]}>
              {bestToPar == null ? '—' : bestToPar === 0 ? 'E' : bestToPar > 0 ? `+${bestToPar}` : `${bestToPar}`}
            </Text>
            <Text style={s.statLabel}>Best</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statValue}>
              {rounds.filter((r) => r.gameMode === 'competitive').length}
            </Text>
            <Text style={s.statLabel}>Ranked</Text>
          </View>
        </View>
      )}

      {/* Sort controls */}
      <View style={s.sortRow}>
        <Text style={s.sortLabel}>Sort by</Text>
        {(['date', 'score'] as SortKey[]).map((key) => (
          <TouchableOpacity
            key={key}
            style={[s.sortChip, sortBy === key && s.sortChipActive]}
            onPress={() => setSortBy(key)}
          >
            <Text style={[s.sortChipText, sortBy === key && s.sortChipTextActive]}>
              {key === 'date' ? '📅 Date' : '🏌️ Score'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {loading ? (
        <View style={s.centered}><ActivityIndicator size="large" color={C.primary} /></View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RoundRow round={item} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRounds(true); }} tintColor={C.primary} />
          }
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: C.border }} />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>⛳</Text>
              <Text style={s.emptyTitle}>No rounds yet</Text>
              <Text style={s.emptySub}>Complete a round to see your history here.</Text>
              <TouchableOpacity style={s.discoverBtn} onPress={() => router.push('/')}>
                <Text style={s.discoverBtnText}>Find a tee time</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.gray50 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backArrow: { fontSize: 22, color: C.primary },
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.gray900 },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingVertical: 14,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: C.border },
  statValue: { fontSize: 20, fontWeight: '800', color: C.gray900 },
  statLabel: { fontSize: 11, color: C.gray400, marginTop: 2 },

  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  sortLabel: { fontSize: 13, color: C.gray400, marginRight: 4 },
  sortChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: C.border, backgroundColor: C.gray50,
  },
  sortChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  sortChipText: { fontSize: 13, color: C.gray600, fontWeight: '500' },
  sortChipTextActive: { color: C.white, fontWeight: '600' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 48, gap: 8 },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: C.gray900 },
  emptySub: { fontSize: 14, color: C.gray400, textAlign: 'center' },
  discoverBtn: { marginTop: 8, backgroundColor: C.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  discoverBtnText: { color: C.white, fontWeight: '700', fontSize: 15 },
});
