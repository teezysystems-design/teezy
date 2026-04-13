import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';

const API_URL = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:4000';

const COLORS = {
  primary: '#1B6B3A',
  primaryLight: '#e8f5ee',
  white: '#fff',
  gray50: '#f7f7f7',
  gray400: '#aaa',
  gray600: '#666',
  gray900: '#111',
  border: '#e0e0e0',
  error: '#ef4444',
  gold: '#FFD700',
};

const GAME_MODE_LABELS: Record<string, string> = {
  casual: '😎 Casual',
  solo: '🏌️ Solo',
  match_1v1: '⚔️ 1v1 Match',
  match_2v2: '🤝 2v2 Scramble',
  tournament: '🏆 Tournament',
};

const STATUS_COLORS: Record<string, string> = {
  invited: '#f59e0b',
  accepted: COLORS.primary,
  declined: COLORS.error,
};

interface PartyMember {
  id: string;
  userId: string;
  status: 'invited' | 'accepted' | 'declined';
  role: 'host' | 'member';
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  handicap: number | null;
}

interface Party {
  id: string;
  bookingId: string;
  createdByUserId: string;
  gameMode: string;
  status: string;
  maxSize: number;
  members: PartyMember[];
  courses?: { name: string; hole_count: number; par_score: number };
}

export default function PartyLobbyScreen() {
  const { partyId } = useLocalSearchParams<{ partyId: string }>();
  const { session } = useAuth();
  const router = useRouter();

  const [party, setParty] = useState<Party | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inviteInput, setInviteInput] = useState('');
  const [inviting, setInviting] = useState(false);
  const [starting, setStarting] = useState(false);

  const fetchParty = useCallback(
    async (silent = false) => {
      if (!session || !partyId) return;
      if (!silent) setLoading(true);
      try {
        const res = await fetch(`${API_URL}/v1/parties/${partyId}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const json = await res.json();
        if (res.ok) setParty(json.data);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [session, partyId]
  );

  useEffect(() => {
    fetchParty();
  }, [fetchParty]);

  const inviteFriend = async () => {
    if (!session || !party || !inviteInput.trim()) return;
    setInviting(true);
    try {
      const res = await fetch(`${API_URL}/v1/parties/${party.id}/invite`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: inviteInput.trim().toLowerCase() }),
      });
      const json = await res.json();
      if (!res.ok) {
        Alert.alert('Error', json.error?.message ?? 'Could not invite player');
        return;
      }
      Alert.alert('Invited!', json.data?.message ?? 'Invite sent');
      setInviteInput('');
      fetchParty(true);
    } catch {
      Alert.alert('Error', 'Could not send invite');
    } finally {
      setInviting(false);
    }
  };

  const startRound = async () => {
    if (!session || !party) return;
    setStarting(true);
    try {
      const res = await fetch(`${API_URL}/v1/parties/${party.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'in_progress' }),
      });
      if (!res.ok) {
        Alert.alert('Error', 'Could not start round');
        return;
      }
      router.push({ pathname: '/party/[partyId]/score', params: { partyId: party.id } });
    } catch {
      Alert.alert('Error', 'Could not start round');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!party) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Party not found</Text>
      </View>
    );
  }

  const acceptedCount = party.members.filter((m) => m.status === 'accepted').length;
  const maxSize = party.maxSize || 4;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchParty(true); }} tintColor={COLORS.primary} />
      }
    >
      {/* Course & mode info card */}
      <View style={styles.infoCard}>
        {party.courses && (
          <Text style={styles.courseName}>{party.courses.name}</Text>
        )}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Mode</Text>
          <Text style={styles.infoValue}>{GAME_MODE_LABELS[party.gameMode] ?? party.gameMode}</Text>
        </View>
        <View style={[styles.infoRow, { marginTop: 8 }]}>
          <Text style={styles.infoLabel}>Players</Text>
          <Text style={styles.infoValue}>{acceptedCount} / {maxSize}</Text>
        </View>
        <View style={[styles.infoRow, { marginTop: 8 }]}>
          <Text style={styles.infoLabel}>Status</Text>
          <View style={[styles.statusBadge, party.status === 'in_progress' && styles.statusBadgeActive]}>
            <Text style={[styles.statusText, party.status === 'in_progress' && styles.statusTextActive]}>
              {party.status === 'forming' ? 'Forming' : party.status === 'in_progress' ? 'In Progress' : 'Completed'}
            </Text>
          </View>
        </View>
      </View>

      {/* Members list */}
      <Text style={styles.sectionTitle}>Party Members</Text>
      {party.members.map((member) => (
        <View key={member.id} style={styles.memberRow}>
          <View style={styles.memberAvatar}>
            <Text style={styles.memberAvatarText}>
              {(member.name ?? 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.memberInfo}>
            <View style={styles.memberNameRow}>
              <Text style={styles.memberName}>{member.name ?? 'Unknown player'}</Text>
              {member.role === 'host' && <Text style={styles.hostBadge}>HOST</Text>}
            </View>
            {member.username && (
              <Text style={styles.memberUsername}>@{member.username}</Text>
            )}
            {member.handicap != null && (
              <Text style={styles.memberHcp}>HCP {Number(member.handicap).toFixed(1)}</Text>
            )}
          </View>
          <Text style={[styles.memberStatus, { color: STATUS_COLORS[member.status] ?? COLORS.gray600 }]}>
            {member.status}
          </Text>
        </View>
      ))}

      {/* Invite friend by username */}
      {party.status === 'forming' && party.members.length < maxSize && (
        <View style={styles.inviteBox}>
          <Text style={styles.sectionTitle}>Invite a Friend</Text>
          <Text style={styles.inviteHint}>Enter their PAR-Tee username</Text>
          <View style={styles.inviteRow}>
            <View style={styles.inviteInputWrap}>
              <Text style={styles.atSign}>@</Text>
              <TextInput
                style={styles.inviteInput}
                value={inviteInput}
                onChangeText={setInviteInput}
                placeholder="username"
                placeholderTextColor={COLORS.gray400}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <TouchableOpacity
              style={[styles.inviteBtn, (inviting || !inviteInput.trim()) && { opacity: 0.5 }]}
              onPress={inviteFriend}
              disabled={inviting || !inviteInput.trim()}
            >
              {inviting ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.inviteBtnText}>Invite</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Start Round button */}
      {party.status === 'forming' && (
        <TouchableOpacity
          style={[styles.startBtn, starting && { opacity: 0.6 }]}
          onPress={startRound}
          disabled={starting}
        >
          {starting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.startBtnText}>Tee Off → Start Round</Text>
          )}
        </TouchableOpacity>
      )}

      {/* Resume scoring if already in progress */}
      {party.status === 'in_progress' && (
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => router.push({ pathname: '/party/[partyId]/score', params: { partyId: party.id } })}
        >
          <Text style={styles.startBtnText}>Resume Scoring →</Text>
        </TouchableOpacity>
      )}

      {/* View summary if completed */}
      {party.status === 'completed' && (
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: COLORS.gray900 }]}
          onPress={() => router.push({ pathname: '/party/[partyId]/summary', params: { partyId: party.id } })}
        >
          <Text style={styles.startBtnText}>View Summary →</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.gray50 },
  content: { padding: 20, paddingBottom: 48 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 15, color: COLORS.gray600 },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  courseName: { fontSize: 18, fontWeight: '700', color: COLORS.gray900, marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 14, color: COLORS.gray600 },
  infoValue: { fontSize: 14, fontWeight: '600', color: COLORS.gray900 },
  statusBadge: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusBadgeActive: { backgroundColor: '#FEF3C7' },
  statusText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  statusTextActive: { color: '#D97706' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.gray900, marginBottom: 12 },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  memberInfo: { flex: 1 },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  memberName: { fontSize: 15, color: COLORS.gray900, fontWeight: '600' },
  hostBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.gold,
    backgroundColor: '#FFFDF0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  memberUsername: { fontSize: 13, color: COLORS.gray400, marginTop: 1 },
  memberHcp: { fontSize: 12, color: COLORS.gray600, marginTop: 2 },
  memberStatus: { fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
  inviteBox: { marginTop: 24, marginBottom: 8 },
  inviteHint: { fontSize: 13, color: COLORS.gray600, marginBottom: 10 },
  inviteRow: { flexDirection: 'row', gap: 10 },
  inviteInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
  },
  atSign: { fontSize: 16, color: COLORS.gray400, fontWeight: '600', marginRight: 2 },
  inviteInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.gray900,
  },
  inviteBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  inviteBtnText: { color: COLORS.white, fontWeight: '600' },
  startBtn: {
    marginTop: 28,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});
