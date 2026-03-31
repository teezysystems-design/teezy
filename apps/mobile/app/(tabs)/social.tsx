/**
 * Social Screen — V2 Phase 3
 *
 * Tabs:
 *   Feed     — rich activity posts (score cards, videos, rank-ups, tournament/league results)
 *   Friends  — accepted friends list + add friend + pending requests
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

const API_URL = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:4000';

const C = {
  primary: '#1a7f4b',
  primaryLight: '#e8f5ee',
  white: '#fff',
  gray50: '#f7f7f7',
  gray100: '#f3f4f6',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray600: '#6b7280',
  gray900: '#111827',
  border: '#e5e7eb',
  red: '#ef4444',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  amber: '#f59e0b',
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Author {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface FeedPost {
  id: string;
  type: 'round_score' | 'swing_video' | 'rank_up' | 'tournament_result' | 'league_result';
  payload: Record<string, unknown>;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  author: Author;
  createdAt: string;
}

interface Friend {
  id: string;
  name: string;
  avatarUrl: string | null;
  handicap: string | null;
  moodPreferences: string[];
}

interface FriendRequest {
  id: string;
  requesterId: string;
  requester: {
    id: string;
    name: string;
    avatarUrl: string | null;
    handicap: string | null;
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MOOD_EMOJIS: Record<string, string> = {
  relaxed: '😌', competitive: '🏆', social: '👥', scenic: '🌅',
  beginner: '🌱', advanced: '🔥', 'fast-paced': '⚡', challenging: '💪',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initial = (name ?? '?').charAt(0).toUpperCase();
  return (
    <View style={[av.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[av.text, { fontSize: size * 0.4 }]}>{initial}</Text>
    </View>
  );
}

const av = StyleSheet.create({
  circle: { backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  text: { color: C.white, fontWeight: '700' },
});

// ─── Feed Post Card ──────────────────────────────────────────────────────────

function PostTypeChip({ type }: { type: FeedPost['type'] }) {
  const map: Record<FeedPost['type'], { label: string; color: string; bg: string }> = {
    round_score:        { label: '⛳ Round',       color: C.primary, bg: C.primaryLight },
    swing_video:        { label: '🎥 Swing',       color: C.blue,    bg: '#eff6ff' },
    rank_up:            { label: '🚀 Rank Up',     color: C.purple,  bg: '#f5f3ff' },
    tournament_result:  { label: '🏆 Tournament',  color: C.amber,   bg: '#fffbeb' },
    league_result:      { label: '🏅 League',      color: '#0891b2', bg: '#ecfeff' },
  };
  const cfg = map[type];
  return (
    <View style={[pc.chip, { backgroundColor: cfg.bg }]}>
      <Text style={[pc.chipText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

const pc = StyleSheet.create({
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  chipText: { fontSize: 11, fontWeight: '700' },
});

function PostPayloadBody({ post }: { post: FeedPost }) {
  const p = post.payload;
  switch (post.type) {
    case 'round_score': {
      const diff = p['scoreToPar'] as number;
      const diffStr = diff === 0 ? 'E' : diff > 0 ? `+${diff}` : `${diff}`;
      const diffColor = diff < 0 ? C.primary : diff === 0 ? C.gray900 : C.red;
      return (
        <View style={pb.roundRow}>
          <Text style={[pb.bigScore, { color: diffColor }]}>{diffStr}</Text>
          <View style={{ marginLeft: 12 }}>
            <Text style={pb.total}>{p['totalScore'] as number} total</Text>
            <Text style={pb.sub}>{p['courseName'] as string} · {p['holes'] as number} holes</Text>
          </View>
        </View>
      );
    }
    case 'swing_video':
      return (
        <View style={pb.videoBox}>
          <Text style={pb.videoPlaceholder}>🎥  Swing video</Text>
          {p['caption'] ? <Text style={pb.caption}>{p['caption'] as string}</Text> : null}
        </View>
      );
    case 'rank_up':
      return (
        <Text style={pb.rankUp}>
          Ranked up from <Text style={{ fontWeight: '800' }}>{p['fromTier'] as string}</Text> → <Text style={{ fontWeight: '800', color: C.purple }}>{p['toTier'] as string}</Text>  🎉
        </Text>
      );
    case 'tournament_result':
      return (
        <Text style={pb.sub}>
          Finished <Text style={{ fontWeight: '800' }}>#{p['rank'] as number}</Text> in{' '}
          <Text style={{ fontWeight: '600' }}>{p['tournamentName'] as string}</Text>
        </Text>
      );
    case 'league_result':
      return (
        <Text style={pb.sub}>
          League rank <Text style={{ fontWeight: '800' }}>#{p['rank'] as number}</Text> — {p['wins'] as number}W {p['losses'] as number}L in{' '}
          <Text style={{ fontWeight: '600' }}>{p['leagueName'] as string}</Text>
        </Text>
      );
    default:
      return null;
  }
}

const pb = StyleSheet.create({
  roundRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  bigScore: { fontSize: 36, fontWeight: '900', lineHeight: 40 },
  total: { fontSize: 16, fontWeight: '700', color: C.gray900 },
  sub: { fontSize: 13, color: C.gray600, marginTop: 2 },
  videoBox: {
    backgroundColor: C.gray100,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  videoPlaceholder: { fontSize: 16, color: C.gray600 },
  caption: { fontSize: 13, color: C.gray600, marginTop: 6, textAlign: 'center' },
  rankUp: { fontSize: 15, color: C.gray900, marginTop: 8 },
});

function FeedPostCard({
  post,
  onLike,
}: {
  post: FeedPost;
  onLike: (postId: string, liked: boolean) => void;
}) {
  return (
    <View style={fp.card}>
      {/* Author row */}
      <View style={fp.authorRow}>
        <Avatar name={post.author.name} size={38} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={fp.authorName}>{post.author.name}</Text>
          <Text style={fp.timestamp}>{timeAgo(post.createdAt)}</Text>
        </View>
        <PostTypeChip type={post.type} />
      </View>

      {/* Payload body */}
      <PostPayloadBody post={post} />

      {/* Like / comment bar */}
      <View style={fp.actions}>
        <TouchableOpacity
          style={fp.actionBtn}
          onPress={() => onLike(post.id, post.likedByMe)}
          activeOpacity={0.7}
        >
          <Text style={[fp.actionIcon, post.likedByMe && { color: C.red }]}>
            {post.likedByMe ? '❤️' : '🤍'}
          </Text>
          <Text style={[fp.actionCount, post.likedByMe && { color: C.red }]}>
            {post.likeCount}
          </Text>
        </TouchableOpacity>
        <View style={fp.actionBtn}>
          <Text style={fp.actionIcon}>💬</Text>
          <Text style={fp.actionCount}>{post.commentCount}</Text>
        </View>
      </View>
    </View>
  );
}

const fp = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 10,
  },
  authorRow: { flexDirection: 'row', alignItems: 'center' },
  authorName: { fontSize: 14, fontWeight: '700', color: C.gray900 },
  timestamp: { fontSize: 12, color: C.gray400, marginTop: 1 },
  actions: { flexDirection: 'row', gap: 16, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.gray100 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionIcon: { fontSize: 16 },
  actionCount: { fontSize: 13, color: C.gray600, fontWeight: '600' },
});

// ─── Friend card ─────────────────────────────────────────────────────────────

function FriendCard({ friend }: { friend: Friend }) {
  const moods = (friend.moodPreferences ?? []).slice(0, 3);
  return (
    <View style={fc.card}>
      <Avatar name={friend.name} size={44} />
      <View style={fc.info}>
        <Text style={fc.name}>{friend.name}</Text>
        {friend.handicap != null && (
          <Text style={fc.hcp}>HCP {Number(friend.handicap).toFixed(1)}</Text>
        )}
        {moods.length > 0 && (
          <View style={fc.moods}>
            {moods.map((m) => (
              <Text key={m} style={fc.mood}>{MOOD_EMOJIS[m] ?? '⛳'}</Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const fc = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    gap: 12,
    marginBottom: 10,
  },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: C.gray900 },
  hcp: { fontSize: 13, color: C.gray600, marginTop: 2 },
  moods: { flexDirection: 'row', gap: 4, marginTop: 6 },
  mood: { fontSize: 15 },
});

// ─── Feed Tab ─────────────────────────────────────────────────────────────────

function FeedTab() {
  const { session } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeed = useCallback(
    async (silent = false) => {
      if (!session) return;
      if (!silent) setLoading(true);
      try {
        const res = await fetch(`${API_URL}/v1/social/feed`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) throw new Error();
        const json = await res.json();
        setPosts(json.data ?? []);
      } catch {
        // silent
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [session]
  );

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  const handleLike = async (postId: string, currentlyLiked: boolean) => {
    if (!session) return;
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likedByMe: !currentlyLiked, likeCount: p.likeCount + (currentlyLiked ? -1 : 1) }
          : p
      )
    );
    try {
      const method = currentlyLiked ? 'DELETE' : 'POST';
      await fetch(`${API_URL}/v1/social/feed/${postId}/like`, {
        method,
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
    } catch {
      // Revert on error
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, likedByMe: currentlyLiked, likeCount: p.likeCount + (currentlyLiked ? 1 : -1) }
            : p
        )
      );
    }
  };

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View style={s.emptyState}>
        <Text style={s.emptyEmoji}>📰</Text>
        <Text style={s.emptyTitle}>No posts yet</Text>
        <Text style={s.emptySub}>Add friends to see their rounds, rank-ups, and tournament results here.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <FeedPostCard post={item} onLike={handleLike} />}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); fetchFeed(true); }}
          tintColor={C.primary}
        />
      }
    />
  );
}

// ─── Friends Tab ──────────────────────────────────────────────────────────────

function FriendsTab() {
  const { session } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchAll = useCallback(
    async (silent = false) => {
      if (!session) return;
      if (!silent) setLoading(true);
      try {
        const [fRes, rRes] = await Promise.all([
          fetch(`${API_URL}/v1/social/friends`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }),
          fetch(`${API_URL}/v1/social/friends/requests`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }),
        ]);
        const [fJson, rJson] = await Promise.all([fRes.json(), rRes.json()]);
        setFriends(
          (fJson.data ?? []).map((r: { friend: Friend }) => r.friend)
        );
        setRequests(rJson.data ?? []);
      } catch {
        // silent
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [session]
  );

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSendRequest = async () => {
    const id = searchId.trim();
    if (!id || !session) return;
    setAdding(true);
    try {
      const res = await fetch(`${API_URL}/v1/social/friends`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ addresseeId: id }),
      });
      if (res.status === 409) {
        Alert.alert('Already connected', 'You already have a connection with this player.');
        return;
      }
      if (!res.ok) throw new Error();
      setSearchId('');
      Alert.alert('Request sent!', 'Your friend request has been sent.');
    } catch {
      Alert.alert('Error', 'Could not send friend request. Check the user ID and try again.');
    } finally {
      setAdding(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    if (!session) return;
    try {
      const res = await fetch(`${API_URL}/v1/social/friends/${requestId}/accept`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error();
      fetchAll(true);
    } catch {
      Alert.alert('Error', 'Could not accept request.');
    }
  };

  const handleDecline = async (requestId: string) => {
    if (!session) return;
    try {
      await fetch(`${API_URL}/v1/social/friends/${requestId}/decline`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch {
      Alert.alert('Error', 'Could not decline request.');
    }
  };

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); fetchAll(true); }}
          tintColor={C.primary}
        />
      }
    >
      {/* Add friend by user ID */}
      <View style={fr.addRow}>
        <TextInput
          style={fr.input}
          placeholder="Add by user ID..."
          placeholderTextColor={C.gray400}
          value={searchId}
          onChangeText={setSearchId}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={[fr.addBtn, (!searchId.trim() || adding) && fr.addBtnDisabled]}
          onPress={handleSendRequest}
          disabled={!searchId.trim() || adding}
        >
          {adding ? (
            <ActivityIndicator color={C.white} size="small" />
          ) : (
            <Text style={fr.addBtnText}>Add</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Pending requests */}
      {requests.length > 0 && (
        <>
          <Text style={fr.sectionLabel}>Friend Requests ({requests.length})</Text>
          {requests.map((req) => (
            <View key={req.id} style={fr.requestCard}>
              <Avatar name={req.requester.name} size={40} />
              <View style={fr.reqInfo}>
                <Text style={fr.reqName}>{req.requester.name}</Text>
                {req.requester.handicap != null && (
                  <Text style={fr.reqHcp}>HCP {Number(req.requester.handicap).toFixed(1)}</Text>
                )}
              </View>
              <TouchableOpacity style={fr.acceptBtn} onPress={() => handleAccept(req.id)}>
                <Text style={fr.acceptBtnText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity style={fr.declineBtn} onPress={() => handleDecline(req.id)}>
                <Text style={fr.declineBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}

      {/* Friends list */}
      <Text style={fr.sectionLabel}>
        Friends {friends.length > 0 ? `(${friends.length})` : ''}
      </Text>
      {friends.length === 0 ? (
        <View style={s.emptyState}>
          <Text style={s.emptyEmoji}>👥</Text>
          <Text style={s.emptyTitle}>No friends yet</Text>
          <Text style={s.emptySub}>Add friends by user ID to coordinate tee times.</Text>
        </View>
      ) : (
        friends.map((f) => <FriendCard key={f.id} friend={f} />)
      )}
    </ScrollView>
  );
}

const fr = StyleSheet.create({
  addRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: C.gray900,
    backgroundColor: C.gray50,
  },
  addBtn: {
    backgroundColor: C.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 58,
  },
  addBtnDisabled: { backgroundColor: '#a8d5be' },
  addBtnText: { color: C.white, fontWeight: '700', fontSize: 14 },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: C.gray400, marginBottom: 10, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.6 },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 8,
    gap: 10,
  },
  reqInfo: { flex: 1 },
  reqName: { fontSize: 15, fontWeight: '700', color: C.gray900 },
  reqHcp: { fontSize: 12, color: C.gray600, marginTop: 2 },
  acceptBtn: {
    backgroundColor: C.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  acceptBtnText: { color: C.white, fontWeight: '700', fontSize: 13 },
  declineBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineBtnText: { fontSize: 13, color: C.gray400 },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

type TabKey = 'feed' | 'friends';

export default function SocialScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('feed');

  return (
    <View style={s.screen}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Social</Text>
      </View>

      {/* Tab bar */}
      <View style={s.tabs}>
        {(['feed', 'friends'] as TabKey[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[s.tab, activeTab === tab && s.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
              {tab === 'feed' ? 'Feed' : 'Friends'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'feed' ? <FeedTab /> : <FriendsTab />}
      </View>
    </View>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.gray50 },
  header: {
    backgroundColor: C.white,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 26, fontWeight: '900', color: C.gray900 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2.5,
    borderBottomColor: C.primary,
  },
  tabText: { fontSize: 14, fontWeight: '600', color: C.gray400 },
  tabTextActive: { color: C.primary, fontWeight: '800' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: 19, fontWeight: '700', color: C.gray900, marginBottom: 8 },
  emptySub: { fontSize: 14, color: C.gray600, textAlign: 'center', lineHeight: 21 },
});
