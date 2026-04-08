/**
 * Notification Preferences Screen — Section 18
 *
 * Lets users toggle which push notification types they receive.
 * Max 2 notifications/day/user is enforced server-side.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

const API_URL = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:4000';
const PRIMARY = '#1a7f4b';

interface NotifPref {
  key: string;
  label: string;
  description: string;
  icon: string;
  enabled: boolean;
}

const DEFAULT_PREFS: Omit<NotifPref, 'enabled'>[] = [
  {
    key: 'rank_up',
    label: 'Rank Up',
    description: 'When you reach a new tier',
    icon: '🏆',
  },
  {
    key: 'round_submitted',
    label: 'Round Submitted',
    description: 'Confirmation after your score is logged',
    icon: '⛳',
  },
  {
    key: 'party_invite',
    label: 'Party Invites',
    description: 'When a friend invites you to a tee time',
    icon: '🎉',
  },
  {
    key: 'friend_request',
    label: 'Friend Requests',
    description: 'When someone sends you a friend request',
    icon: '🤝',
  },
  {
    key: 'league_match',
    label: 'League Match Scheduled',
    description: 'When your next head-to-head match is set',
    icon: '🏅',
  },
  {
    key: 'tournament_start',
    label: 'Tournament Starting',
    description: 'When a tournament you entered begins',
    icon: '🎖️',
  },
  {
    key: 'social_like',
    label: 'Likes & Comments',
    description: 'When someone reacts to your feed post',
    icon: '❤️',
  },
  {
    key: 'availability_reminder',
    label: 'Weekly Availability',
    description: 'Monday reminder to update your availability',
    icon: '📅',
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [prefs, setPrefs] = useState<NotifPref[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchPrefs = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/v1/notifications/preferences`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const { data } = await res.json();
        const enabledKeys: string[] = data?.enabledTypes ?? DEFAULT_PREFS.map((p) => p.key);
        setPrefs(DEFAULT_PREFS.map((d) => ({ ...d, enabled: enabledKeys.includes(d.key) })));
      } else {
        // Fallback: all enabled
        setPrefs(DEFAULT_PREFS.map((d) => ({ ...d, enabled: true })));
      }
    } catch {
      setPrefs(DEFAULT_PREFS.map((d) => ({ ...d, enabled: true })));
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => { fetchPrefs(); }, [fetchPrefs]);

  const togglePref = async (key: string, value: boolean) => {
    if (!session?.access_token) return;

    // Optimistic update
    setPrefs((prev) => prev.map((p) => p.key === key ? { ...p, enabled: value } : p));
    setSaving(key);

    try {
      const next = prefs.map((p) => p.key === key ? { ...p, enabled: value } : p);
      const enabledTypes = next.filter((p) => p.enabled).map((p) => p.key);
      const res = await fetch(`${API_URL}/v1/notifications/preferences`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabledTypes }),
      });
      if (!res.ok) throw new Error('save failed');
    } catch {
      // Revert
      setPrefs((prev) => prev.map((p) => p.key === key ? { ...p, enabled: !value } : p));
      Alert.alert('Error', 'Could not save preference. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  return (
    <View style={st.screen}>
      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity onPress={() => router.back()} style={st.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={st.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={st.title}>Notifications</Text>
        <View style={{ width: 56 }} />
      </View>

      {loading ? (
        <View style={st.centered}><ActivityIndicator color={PRIMARY} size="large" /></View>
      ) : (
        <ScrollView contentContainerStyle={st.content}>
          <View style={st.info}>
            <Text style={st.infoText}>
              You receive at most <Text style={st.infoBold}>2 notifications per day</Text>. Toggle which types are most important to you.
            </Text>
          </View>

          <View style={st.section}>
            {prefs.map((pref, idx) => (
              <View
                key={pref.key}
                style={[st.row, idx < prefs.length - 1 && st.rowBorder]}
              >
                <View style={st.rowIcon}>
                  <Text style={{ fontSize: 22 }}>{pref.icon}</Text>
                </View>
                <View style={st.rowText}>
                  <Text style={st.rowLabel}>{pref.label}</Text>
                  <Text style={st.rowDesc}>{pref.description}</Text>
                </View>
                {saving === pref.key ? (
                  <ActivityIndicator color={PRIMARY} size="small" />
                ) : (
                  <Switch
                    value={pref.enabled}
                    onValueChange={(v) => togglePref(pref.key, v)}
                    trackColor={{ false: '#d1d5db', true: '#86efac' }}
                    thumbColor={pref.enabled ? PRIMARY : '#f3f4f6'}
                    ios_backgroundColor="#d1d5db"
                  />
                )}
              </View>
            ))}
          </View>

          <Text style={st.footnote}>
            Notifications are delivered via Expo Push. You can also manage system-level permissions in your device Settings.
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f9fafb' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backBtn: { width: 56 },
  backText: { fontSize: 17, color: PRIMARY, fontWeight: '500' },
  title: { fontSize: 18, fontWeight: '700', color: '#111' },

  content: { padding: 16, paddingBottom: 40 },

  info: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  infoText: { fontSize: 13, color: '#166534', lineHeight: 18 },
  infoBold: { fontWeight: '700' },

  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '600', color: '#111' },
  rowDesc: { fontSize: 12, color: '#9ca3af', marginTop: 2 },

  footnote: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 16,
  },
});
