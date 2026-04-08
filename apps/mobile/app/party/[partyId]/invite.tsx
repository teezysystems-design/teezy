/**
 * Party Invite Screen — Section 08
 *
 * - Search friends by name/username
 * - Select multiple friends to invite
 * - Send push notifications to invitees via API
 * - Shows party composition (already accepted members)
 */
import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';

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
};

interface Friend {
  id: string;
  name: string;
  avatarUrl: string | null;
  handicap: string | null;
}

interface PartyMember {
  userId: string;
  name: string;
  status: 'host' | 'accepted' | 'pending' | 'declined';
}

function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  return (
    <View style={[av.wrap, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[av.initial, { fontSize: size * 0.38 }]}>{name.charAt(0).toUpperCase()}</Text>
    </View>
  );
}

const av = StyleSheet.create({
  wrap: { backgroundColor: '#1a7f4b', alignItems: 'center', justifyContent: 'center' },
  initial: { color: '#fff', fontWeight: '800' },
});

export default function PartyInviteScreen() {
  const { partyId } = useLocalSearchParams<{ partyId: string }>();
  const { session } = useAuth();
  const router = useRouter();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [members, setMembers] = useState<PartyMember[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadData = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const [friendsRes, partyRes] = await Promise.all([
        fetch(`${API_URL}/v1/social/friends`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch(`${API_URL}/v1/parties/${partyId}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
      ]);
      if (friendsRes.ok) {
        const json = await friendsRes.json();
        setFriends(json.data ?? []);
      }
      if (partyRes.ok) {
        const json = await partyRes.json();
        setMembers(json.data?.members ?? []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [session, partyId]);

  useEffect(() => { loadData(); }, [loadData]);

  const toggleFriend = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sendInvites = async () => {
    if (!session || selected.size === 0) return;
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/v1/parties/${partyId}/invites`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds: Array.from(selected) }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body?.error?.message ?? 'Failed to send invites');
      }
      Alert.alert(
        'Invites sent! 🎉',
        `${selected.size} friend${selected.size !== 1 ? 's' : ''} will receive a push notification.`,
        [{ text: 'Done', onPress: () => router.replace(`/party/${partyId}`) }]
      );
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not send invites');
    } finally {
      setSending(false);
    }
  };

  const filteredFriends = friends.filter(
    (f) =>
      !members.some((m) => m.userId === f.id) &&
      f.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <View style={s.screen}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Invite Friends</Text>
      </View>

      {/* Party composition */}
      {members.length > 0 && (
        <View style={s.membersSection}>
          <Text style={s.sectionTitle}>Who's coming ({members.length})</Text>
          <View style={s.membersRow}>
            {members.map((m) => (
              <View key={m.userId} style={s.memberChip}>
                <Avatar name={m.name} size={32} />
                <Text style={s.memberName} numberOfLines={1}>{m.name}</Text>
                <Text style={s.memberStatus}>
                  {m.status === 'host' ? '👑' : m.status === 'accepted' ? '✅' : m.status === 'pending' ? '⏳' : '❌'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Search */}
      <View style={s.searchBar}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search friends..."
          placeholderTextColor={C.gray400}
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={s.clearSearch}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Friends list */}
      <FlatList
        data={filteredFriends}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyText}>
              {search ? 'No friends match your search.' : 'No friends to invite yet.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isSelected = selected.has(item.id);
          return (
            <TouchableOpacity
              style={[s.friendRow, isSelected && s.friendRowSelected]}
              onPress={() => toggleFriend(item.id)}
              activeOpacity={0.75}
            >
              <Avatar name={item.name} size={44} />
              <View style={s.friendInfo}>
                <Text style={s.friendName}>{item.name}</Text>
                {item.handicap != null && (
                  <Text style={s.friendHcp}>HCP {Number(item.handicap).toFixed(1)}</Text>
                )}
              </View>
              <View style={[s.selectCircle, isSelected && s.selectCircleActive]}>
                {isSelected && <Text style={s.selectCheck}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: C.border }} />}
      />

      {/* Send button */}
      {selected.size > 0 && (
        <View style={s.footer}>
          <TouchableOpacity
            style={[s.sendBtn, sending && s.sendBtnDisabled]}
            onPress={sendInvites}
            disabled={sending}
            activeOpacity={0.85}
          >
            {sending
              ? <ActivityIndicator color={C.white} />
              : <Text style={s.sendBtnText}>
                  Send {selected.size} invite{selected.size !== 1 ? 's' : ''} 🔔
                </Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* Skip */}
      <TouchableOpacity style={s.skipBtn} onPress={() => router.replace(`/party/${partyId}`)}>
        <Text style={s.skipBtnText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.white },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backArrow: { fontSize: 22, color: C.primary },
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.gray900 },

  membersSection: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: C.gray600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  membersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  memberChip: { alignItems: 'center', width: 64 },
  memberName: { fontSize: 11, color: C.gray900, fontWeight: '600', marginTop: 4, textAlign: 'center' },
  memberStatus: { fontSize: 12, marginTop: 2 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.gray50,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15, color: C.gray900 },
  clearSearch: { fontSize: 16, color: C.gray400, paddingHorizontal: 4 },

  list: { paddingBottom: 120 },

  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
    backgroundColor: C.white,
  },
  friendRowSelected: { backgroundColor: C.primaryLight },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 15, fontWeight: '600', color: C.gray900 },
  friendHcp: { fontSize: 13, color: C.gray400, marginTop: 2 },
  selectCircle: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  selectCircleActive: { backgroundColor: C.primary, borderColor: C.primary },
  selectCheck: { color: C.white, fontSize: 13, fontWeight: '800' },

  empty: { padding: 32, alignItems: 'center' },
  emptyText: { fontSize: 14, color: C.gray400, textAlign: 'center' },

  footer: {
    position: 'absolute',
    bottom: 48,
    left: 16,
    right: 16,
  },
  sendBtn: {
    backgroundColor: C.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { color: C.white, fontSize: 16, fontWeight: '700' },

  skipBtn: { position: 'absolute', bottom: 16, alignSelf: 'center' },
  skipBtnText: { fontSize: 14, color: C.gray400 },
});
