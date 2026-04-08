/**
 * Accept/Decline Party Invite Screen — Section 08
 *
 * - Displayed when user taps push notification or opens invite link
 * - Shows party details: course, date/time, host, party composition
 * - Accept → joined party, navigate to party view
 * - Decline → politely decline and return home
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Animated,
  useAnimatedValue,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';

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
  red: '#ef4444',
  redLight: '#fee2e2',
};

interface InviteDetail {
  id: string;
  partyId: string;
  status: 'pending' | 'accepted' | 'declined';
  party: {
    id: string;
    gameMode: 'chill' | 'fun' | 'competitive';
    courseName: string;
    startsAt: string;
    hostName: string;
    memberCount: number;
    maxPlayers: number;
    members: { name: string; status: string }[];
  };
}

const GAME_MODE_INFO: Record<string, { emoji: string; label: string; desc: string }> = {
  chill: { emoji: '😎', label: 'Chill Round', desc: 'Casual, no ranking impact' },
  fun: { emoji: '🎉', label: 'Fun Mode', desc: 'Counts toward ranking, relaxed vibe' },
  competitive: { emoji: '🏆', label: 'Competitive', desc: 'Full ranking mode' },
};

function MemberPip({ name, status }: { name: string; status: string }) {
  const statusEmoji = status === 'accepted' ? '✅' : status === 'declined' ? '❌' : '⏳';
  return (
    <View style={m.pip}>
      <View style={m.avatar}>
        <Text style={m.avatarInitial}>{name.charAt(0).toUpperCase()}</Text>
      </View>
      <Text style={m.name} numberOfLines={1}>{name}</Text>
      <Text style={m.status}>{statusEmoji}</Text>
    </View>
  );
}

const m = StyleSheet.create({
  pip: { alignItems: 'center', width: 60 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { color: C.white, fontSize: 18, fontWeight: '800' },
  name: { fontSize: 11, fontWeight: '600', color: C.gray900, marginTop: 4, textAlign: 'center' },
  status: { fontSize: 12, marginTop: 2 },
});

export default function InviteScreen() {
  const { inviteId } = useLocalSearchParams<{ inviteId: string }>();
  const { session } = useAuth();
  const router = useRouter();

  const [invite, setInvite] = useState<InviteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<'accept' | 'decline' | null>(null);
  const [done, setDone] = useState(false);

  const fadeAnim = useAnimatedValue(0);

  const load = useCallback(async () => {
    if (!session || !inviteId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/v1/parties/invites/${inviteId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setInvite(json.data ?? json);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }
  }, [session, inviteId, fadeAnim]);

  useEffect(() => { load(); }, [load]);

  const respond = async (action: 'accept' | 'decline') => {
    if (!session || !inviteId) return;
    setResponding(action);
    try {
      const res = await fetch(`${API_URL}/v1/parties/invites/${inviteId}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body?.error?.message ?? 'Failed');
      }
      setDone(true);
      if (action === 'accept' && invite?.partyId) {
        router.replace(`/party/${invite.partyId}`);
      } else {
        router.replace('/');
      }
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not respond to invite');
    } finally {
      setResponding(null);
    }
  };

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  if (!invite) {
    return (
      <View style={s.centered}>
        <Text style={s.notFoundEmoji}>🏌️</Text>
        <Text style={s.notFoundTitle}>Invite not found</Text>
        <Text style={s.notFoundSub}>This invite may have expired or been cancelled.</Text>
        <TouchableOpacity style={s.homeBtn} onPress={() => router.replace('/')}>
          <Text style={s.homeBtnText}>Go home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (invite.status !== 'pending') {
    const alreadyAccepted = invite.status === 'accepted';
    return (
      <View style={s.centered}>
        <Text style={s.notFoundEmoji}>{alreadyAccepted ? '✅' : '❌'}</Text>
        <Text style={s.notFoundTitle}>
          {alreadyAccepted ? "You're already in!" : 'Invite declined'}
        </Text>
        {alreadyAccepted && (
          <TouchableOpacity
            style={s.homeBtn}
            onPress={() => router.replace(`/party/${invite.partyId}`)}
          >
            <Text style={s.homeBtnText}>View party →</Text>
          </TouchableOpacity>
        )}
        {!alreadyAccepted && (
          <TouchableOpacity style={s.homeBtn} onPress={() => router.replace('/')}>
            <Text style={s.homeBtnText}>Go home</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const party = invite.party;
  const modeInfo = GAME_MODE_INFO[party.gameMode] ?? GAME_MODE_INFO['fun'];
  const dateStr = new Date(party.startsAt).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
  const timeStr = new Date(party.startsAt).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
  });

  return (
    <Animated.ScrollView
      style={[s.screen, { opacity: fadeAnim }]}
      contentContainerStyle={s.content}
    >
      {/* Invite badge */}
      <View style={s.badge}>
        <Text style={s.badgeEmoji}>🏌️</Text>
        <Text style={s.badgeTitle}>You're invited to a round!</Text>
        <Text style={s.badgeSub}>
          <Text style={s.hostName}>{party.hostName}</Text> wants you to join
        </Text>
      </View>

      {/* Course & time */}
      <View style={s.courseCard}>
        <Text style={s.courseName}>{party.courseName}</Text>
        <Text style={s.dateTime}>{dateStr}</Text>
        <Text style={s.dateTime}>{timeStr}</Text>
      </View>

      {/* Game mode */}
      <View style={s.modeCard}>
        <Text style={s.modeEmoji}>{modeInfo.emoji}</Text>
        <View style={s.modeInfo}>
          <Text style={s.modeLabel}>{modeInfo.label}</Text>
          <Text style={s.modeDesc}>{modeInfo.desc}</Text>
        </View>
      </View>

      {/* Party composition */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>
          Party ({party.memberCount}/{party.maxPlayers})
        </Text>
        <View style={s.membersRow}>
          {party.members.map((mem, i) => (
            <MemberPip key={i} name={mem.name} status={mem.status} />
          ))}
          {/* Empty slots */}
          {Array.from({ length: Math.max(0, party.maxPlayers - party.members.length) }, (_, i) => (
            <View key={`empty-${i}`} style={m.pip}>
              <View style={[m.avatar, { backgroundColor: C.gray100 }]}>
                <Text style={{ fontSize: 20 }}>?</Text>
              </View>
              <Text style={[m.name, { color: C.gray400 }]}>Open</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Accept / Decline */}
      <View style={s.actions}>
        <TouchableOpacity
          style={[s.acceptBtn, responding !== null && s.btnDisabled]}
          onPress={() => respond('accept')}
          disabled={responding !== null || done}
          activeOpacity={0.85}
        >
          {responding === 'accept'
            ? <ActivityIndicator color={C.white} />
            : <Text style={s.acceptBtnText}>Accept ✅</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.declineBtn, responding !== null && s.btnDisabled]}
          onPress={() => {
            Alert.alert(
              'Decline invite?',
              `${party.hostName} will be notified you can't make it.`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Decline', style: 'destructive', onPress: () => respond('decline') },
              ]
            );
          }}
          disabled={responding !== null || done}
          activeOpacity={0.85}
        >
          {responding === 'decline'
            ? <ActivityIndicator color={C.red} />
            : <Text style={s.declineBtnText}>Decline</Text>}
        </TouchableOpacity>
      </View>
    </Animated.ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.white },
  content: { flexGrow: 1, paddingBottom: 48 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },

  badge: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    backgroundColor: C.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: '#b2dfcc',
  },
  badgeEmoji: { fontSize: 64, marginBottom: 12 },
  badgeTitle: { fontSize: 24, fontWeight: '900', color: C.gray900, textAlign: 'center' },
  badgeSub: { fontSize: 15, color: C.gray600, marginTop: 6, textAlign: 'center' },
  hostName: { fontWeight: '700', color: C.primary },

  courseCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  courseName: { fontSize: 20, fontWeight: '800', color: C.gray900, marginBottom: 6 },
  dateTime: { fontSize: 14, color: C.gray600 },

  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 14,
    backgroundColor: C.gray50,
    borderWidth: 1,
    borderColor: C.border,
  },
  modeEmoji: { fontSize: 32 },
  modeInfo: { flex: 1 },
  modeLabel: { fontSize: 15, fontWeight: '800', color: C.gray900 },
  modeDesc: { fontSize: 13, color: C.gray600, marginTop: 2 },

  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: C.gray600, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  membersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },

  actions: { paddingHorizontal: 20, gap: 12 },
  acceptBtn: {
    backgroundColor: C.primary, paddingVertical: 16,
    borderRadius: 14, alignItems: 'center',
  },
  acceptBtnText: { color: C.white, fontSize: 17, fontWeight: '700' },
  declineBtn: {
    paddingVertical: 14, borderRadius: 14, alignItems: 'center',
    borderWidth: 1.5, borderColor: '#fca5a5', backgroundColor: C.redLight,
  },
  declineBtnText: { color: C.red, fontSize: 15, fontWeight: '700' },
  btnDisabled: { opacity: 0.5 },

  notFoundEmoji: { fontSize: 64 },
  notFoundTitle: { fontSize: 20, fontWeight: '800', color: C.gray900 },
  notFoundSub: { fontSize: 14, color: C.gray400, textAlign: 'center' },
  homeBtn: { backgroundColor: C.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  homeBtnText: { color: C.white, fontWeight: '700', fontSize: 15 },
});
