/**
 * Notification Preferences Screen — Feature 8
 *
 * Toggle push categories, set quiet hours.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { router } from 'expo-router';

const API_URL = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:4000';
const PRIMARY = '#1B6B3A';

interface Preferences {
  pushFriendRequests: boolean;
  pushPartyInvites: boolean;
  pushRoundResults: boolean;
  pushLeagueMatches: boolean;
  pushTournamentUpdates: boolean;
  pushRankChanges: boolean;
  pushSocialLikes: boolean;
  pushSocialComments: boolean;
  pushBookingReminders: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

const TOGGLES: { key: keyof Preferences; label: string; desc: string }[] = [
  { key: 'pushFriendRequests', label: 'Friend requests', desc: 'When someone wants to connect' },
  { key: 'pushPartyInvites', label: 'Party invites', desc: 'When friends invite you to a round' },
  { key: 'pushRoundResults', label: 'Round results', desc: 'When you finish a round' },
  { key: 'pushRankChanges', label: 'Rank changes', desc: 'When you rank up or down' },
  { key: 'pushLeagueMatches', label: 'League activity', desc: 'Invites and match results' },
  { key: 'pushTournamentUpdates', label: 'Tournament updates', desc: 'Results and upcoming events' },
  { key: 'pushSocialComments', label: 'Comments on your posts', desc: 'When friends comment' },
  { key: 'pushSocialLikes', label: 'Likes on your posts', desc: 'When friends like your posts' },
  { key: 'pushBookingReminders', label: 'Booking reminders', desc: 'Confirmations and reminders' },
];

export default function PreferencesScreen() {
  const { session } = useAuth();
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPrefs = useCallback(async () => {
    if (!session) return;
    try {
      const res = await fetch(`${API_URL}/v1/notifications/preferences`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setPrefs(json.data);
      }
    } catch {} finally { setLoading(false); }
  }, [session]);

  useEffect(() => { fetchPrefs(); }, [fetchPrefs]);

  const updatePref = async (key: keyof Preferences, value: boolean | string) => {
    if (!prefs || !session) return;
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);

    setSaving(true);
    try {
      await fetch(`${API_URL}/v1/notifications/preferences`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ [key]: value }),
      });
    } catch {} finally { setSaving(false); }
  };

  if (loading) {
    return <View style={s.centered}><ActivityIndicator size="large" color={PRIMARY} /></View>;
  }
  if (!prefs) {
    return <View style={s.centered}><Text>Could not load preferences</Text></View>;
  }

  return (
    <View style={s.screen}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Notifications</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={s.section}>
          <Text style={s.sectionTitle}>Push Notifications</Text>
          <Text style={s.sectionSub}>
            Choose which activities send a push notification to your device.
          </Text>

          {TOGGLES.map((t, i) => (
            <View key={t.key} style={[s.row, i === TOGGLES.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1, paddingRight: 16 }}>
                <Text style={s.rowLabel}>{t.label}</Text>
                <Text style={s.rowDesc}>{t.desc}</Text>
              </View>
              <Switch
                value={prefs[t.key] as boolean}
                onValueChange={(v) => updatePref(t.key, v)}
                trackColor={{ false: '#e5e7eb', true: PRIMARY }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Quiet Hours</Text>
          <Text style={s.sectionSub}>
            Pause push notifications during specific hours (default 10 PM to 8 AM).
          </Text>

          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.rowLabel}>Enable quiet hours</Text>
              <Text style={s.rowDesc}>
                {prefs.quietHoursEnabled
                  ? `${prefs.quietHoursStart.slice(0, 5)} — ${prefs.quietHoursEnd.slice(0, 5)}`
                  : 'Off'}
              </Text>
            </View>
            <Switch
              value={prefs.quietHoursEnabled}
              onValueChange={(v) => updatePref('quietHoursEnabled', v)}
              trackColor={{ false: '#e5e7eb', true: PRIMARY }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {saving && (
          <Text style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 12 }}>
            Saving...
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb',
  },
  back: { fontSize: 15, color: PRIMARY, fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' },
  section: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16,
    borderRadius: 16, padding: 20,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111', marginBottom: 4 },
  sectionSub: { fontSize: 13, color: '#6b7280', marginBottom: 16, lineHeight: 18 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  rowLabel: { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 2 },
  rowDesc: { fontSize: 12, color: '#9ca3af' },
});
