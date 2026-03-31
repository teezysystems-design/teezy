/**
 * Availability Calendar Screen — V2 Phase 3
 *
 * Players set which days of the week they are available to play.
 * Friends can view each other's availability. When creating a tee-time
 * party the app suggests days where all invitees overlap.
 *
 * This screen lets you:
 *   - Toggle available days for the current week
 *   - See friend availability overlap for a selected group
 */
import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

const API_URL = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:4000';
const PRIMARY = '#1a7f4b';

/** 0=Sun 1=Mon … 6=Sat */
const DAYS = [
  { index: 0, short: 'Sun', long: 'Sunday' },
  { index: 1, short: 'Mon', long: 'Monday' },
  { index: 2, short: 'Tue', long: 'Tuesday' },
  { index: 3, short: 'Wed', long: 'Wednesday' },
  { index: 4, short: 'Thu', long: 'Thursday' },
  { index: 5, short: 'Fri', long: 'Friday' },
  { index: 6, short: 'Sat', long: 'Saturday' },
];

interface Friend {
  id: string;
  name: string;
  handicap: string | null;
}

interface FriendAvailability {
  friendId: string;
  friendName: string;
  availableDays: number[];
}

export default function AvailabilityScreen() {
  const { session } = useAuth();
  const router = useRouter();

  const [myDays, setMyDays] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  const [friendAvailability, setFriendAvailability] = useState<FriendAvailability[]>([]);
  const [loadingFriendAvail, setLoadingFriendAvail] = useState(false);

  // Fetch my availability + friends list
  const fetchInitial = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const [availRes, friendsRes] = await Promise.all([
        fetch(`${API_URL}/v1/social/availability/me`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch(`${API_URL}/v1/social/friends`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
      ]);

      if (availRes.ok) {
        const json = await availRes.json();
        setMyDays(new Set(json.data?.availableDays ?? []));
      }
      if (friendsRes.ok) {
        const json = await friendsRes.json();
        setFriends(
          (json.data ?? []).map((r: { friend: Friend }) => r.friend)
        );
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => { fetchInitial(); }, [fetchInitial]);

  const toggleDay = (day: number) => {
    setMyDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const saveAvailability = async () => {
    if (!session) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/v1/social/availability/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ availableDays: [...myDays] }),
      });
      if (!res.ok) throw new Error();
      Alert.alert('Saved!', 'Your availability has been updated.');
    } catch {
      Alert.alert('Error', 'Could not save availability. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends((prev) => {
      const next = new Set(prev);
      if (next.has(friendId)) next.delete(friendId);
      else next.add(friendId);
      return next;
    });
  };

  // Fetch availability for selected friends
  const fetchFriendAvailability = async () => {
    if (!session || selectedFriends.size === 0) return;
    setLoadingFriendAvail(true);
    try {
      const results: FriendAvailability[] = [];
      for (const friendId of selectedFriends) {
        const res = await fetch(`${API_URL}/v1/social/availability/${friendId}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const json = await res.json();
          const friend = friends.find((f) => f.id === friendId);
          results.push({
            friendId,
            friendName: friend?.name ?? 'Friend',
            availableDays: json.data?.availableDays ?? [],
          });
        }
      }
      setFriendAvailability(results);
    } catch {
      Alert.alert('Error', 'Could not load friend availability.');
    } finally {
      setLoadingFriendAvail(false);
    }
  };

  // Compute overlap between me + selected friends
  const getOverlapDays = (): number[] => {
    if (friendAvailability.length === 0) return [...myDays];
    const allSets = [myDays, ...friendAvailability.map((fa) => new Set(fa.availableDays))];
    const intersection = [...allSets[0]].filter((day) => allSets.every((s) => s.has(day)));
    return intersection.sort();
  };

  const overlapDays = getOverlapDays();

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ paddingBottom: 48 }}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backBtnText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>Availability</Text>
        <Text style={s.subtitle}>Set your available days each week</Text>
      </View>

      {/* My weekly availability */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>My Available Days</Text>
        <Text style={s.sectionHint}>Tap days you're free to play this week</Text>
        <View style={s.daysGrid}>
          {DAYS.map((day) => {
            const selected = myDays.has(day.index);
            // Highlight if in overlap
            const inOverlap = overlapDays.includes(day.index);
            return (
              <TouchableOpacity
                key={day.index}
                style={[
                  s.dayBtn,
                  selected && s.dayBtnSelected,
                  inOverlap && friendAvailability.length > 0 && s.dayBtnOverlap,
                ]}
                onPress={() => toggleDay(day.index)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    s.dayShort,
                    selected && s.dayShortSelected,
                  ]}
                >
                  {day.short}
                </Text>
                {selected && (
                  <View style={[s.dayDot, inOverlap && friendAvailability.length > 0 && s.dayDotOverlap]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[s.saveBtn, saving && s.saveBtnDisabled]}
          onPress={saveAvailability}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={s.saveBtnText}>Save Availability</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Friend overlap */}
      {friends.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Find Best Days Together</Text>
          <Text style={s.sectionHint}>Select friends to see shared availability</Text>

          <View style={s.friendsList}>
            {friends.map((friend) => {
              const picked = selectedFriends.has(friend.id);
              return (
                <TouchableOpacity
                  key={friend.id}
                  style={[s.friendChip, picked && s.friendChipSelected]}
                  onPress={() => toggleFriendSelection(friend.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[s.friendChipText, picked && s.friendChipTextSelected]}>
                    {friend.name}
                  </Text>
                  {friend.handicap != null && (
                    <Text style={[s.friendChipHcp, picked && { color: '#a7f3d0' }]}>
                      {Number(friend.handicap).toFixed(1)}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedFriends.size > 0 && (
            <TouchableOpacity
              style={[s.checkBtn, loadingFriendAvail && s.saveBtnDisabled]}
              onPress={fetchFriendAvailability}
              disabled={loadingFriendAvail}
            >
              {loadingFriendAvail ? (
                <ActivityIndicator color={PRIMARY} size="small" />
              ) : (
                <Text style={s.checkBtnText}>Check Overlap</Text>
              )}
            </TouchableOpacity>
          )}

          {/* Overlap result */}
          {friendAvailability.length > 0 && (
            <View style={s.overlapResult}>
              <Text style={s.overlapTitle}>
                {overlapDays.length > 0
                  ? `Everyone's free on:`
                  : 'No shared availability found'}
              </Text>
              {overlapDays.length > 0 ? (
                <View style={s.overlapDays}>
                  {overlapDays.map((day) => (
                    <View key={day} style={s.overlapDayBadge}>
                      <Text style={s.overlapDayText}>{DAYS[day].long}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={s.overlapNoneHint}>
                  Try adjusting your available days or check with your friends.
                </Text>
              )}
              <Text style={s.overlapTip}>
                Tip: When creating a tee-time party, the app suggests these days automatically.
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backBtn: { marginBottom: 12 },
  backBtnText: { fontSize: 16, color: PRIMARY, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '900', color: '#111' },
  subtitle: { fontSize: 14, color: '#9ca3af', marginTop: 4 },

  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#111', marginBottom: 4 },
  sectionHint: { fontSize: 13, color: '#9ca3af', marginBottom: 16 },

  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  dayBtn: {
    width: 56,
    height: 64,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  dayBtnSelected: {
    borderColor: PRIMARY,
    backgroundColor: '#e8f5ee',
  },
  dayBtnOverlap: {
    borderColor: '#f59e0b',
    backgroundColor: '#fffbeb',
  },
  dayShort: { fontSize: 14, fontWeight: '700', color: '#9ca3af' },
  dayShortSelected: { color: PRIMARY },
  dayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PRIMARY,
  },
  dayDotOverlap: { backgroundColor: '#f59e0b' },

  saveBtn: {
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  friendsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  friendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  friendChipSelected: { borderColor: PRIMARY, backgroundColor: PRIMARY },
  friendChipText: { fontSize: 13, fontWeight: '700', color: '#374151' },
  friendChipTextSelected: { color: '#fff' },
  friendChipHcp: { fontSize: 11, color: '#9ca3af' },

  checkBtn: {
    borderWidth: 1.5,
    borderColor: PRIMARY,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  checkBtnText: { fontSize: 14, fontWeight: '700', color: PRIMARY },

  overlapResult: {
    backgroundColor: '#f0fdf4',
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  overlapTitle: { fontSize: 15, fontWeight: '800', color: '#166534', marginBottom: 10 },
  overlapDays: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  overlapDayBadge: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  overlapDayText: { fontSize: 13, color: '#fff', fontWeight: '700' },
  overlapNoneHint: { fontSize: 13, color: '#6b7280', marginBottom: 10 },
  overlapTip: { fontSize: 12, color: '#6b7280', fontStyle: 'italic' },
});
