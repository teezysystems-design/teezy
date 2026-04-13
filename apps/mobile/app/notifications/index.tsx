/**
 * Notifications Inbox Screen — Feature 8
 *
 * List of user's notifications with tap-to-read, swipe-to-delete, mark all read.
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
  Alert,
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { router } from 'expo-router';

const API_URL = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:4000';
const PRIMARY = '#1B6B3A';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

function formatRelative(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const TYPE_ICONS: Record<string, string> = {
  friend_request: '👋',
  friend_accepted: '🎉',
  party_invite: '⛳',
  party_starting: '🏁',
  round_finished: '📊',
  rank_up: '⬆️',
  rank_down: '⬇️',
  league_invite: '🏅',
  league_match_result: '⚔️',
  tournament_starting: '🏆',
  tournament_result: '🏆',
  social_like: '❤️',
  social_comment: '💬',
  booking_confirmed: '✅',
  booking_reminder: '⏰',
  booking_cancelled: '❌',
};

function NotificationRow({
  notif,
  onPress,
  onDelete,
}: {
  notif: Notification;
  onPress: () => void;
  onDelete: () => void;
}) {
  const icon = TYPE_ICONS[notif.type] ?? '🔔';
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={() => {
        Alert.alert('Notification', 'Delete this notification?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: onDelete },
        ]);
      }}
      activeOpacity={0.7}
      style={[s.row, !notif.read && s.rowUnread]}
    >
      <View style={s.iconContainer}>
        <Text style={s.icon}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={s.title} numberOfLines={1}>{notif.title}</Text>
          {!notif.read && <View style={s.unreadDot} />}
        </View>
        <Text style={s.body} numberOfLines={2}>{notif.body}</Text>
        <Text style={s.time}>{formatRelative(notif.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const { session } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async (silent = false) => {
    if (!session) return;
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`${API_URL}/v1/notifications`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.data ?? []);
      }
    } catch {} finally { setLoading(false); setRefreshing(false); }
  }, [session]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleTap = async (notif: Notification) => {
    // Mark as read
    if (!notif.read && session) {
      fetch(`${API_URL}/v1/notifications/${notif.id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      }).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)),
      );
    }

    // Deep link
    switch (notif.type) {
      case 'friend_request':
      case 'friend_accepted':
      case 'social_like':
      case 'social_comment':
        router.push('/(tabs)/social');
        break;
      case 'party_invite':
      case 'party_starting':
        if (notif.data['partyId']) router.push(`/party/${notif.data['partyId']}` as any);
        break;
      case 'round_finished':
      case 'rank_up':
      case 'rank_down':
        router.push('/(tabs)/compete');
        break;
      case 'league_invite':
      case 'league_match_result':
        router.push('/leagues' as any);
        break;
      case 'tournament_starting':
      case 'tournament_result':
        router.push('/tournaments' as any);
        break;
      case 'booking_confirmed':
      case 'booking_reminder':
      case 'booking_cancelled':
        router.push('/(tabs)/bookings' as any);
        break;
    }
  };

  const handleDelete = async (id: string) => {
    if (!session) return;
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    fetch(`${API_URL}/v1/notifications/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.access_token}` },
    }).catch(() => {});
  };

  const handleMarkAllRead = async () => {
    if (!session) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    fetch(`${API_URL}/v1/notifications/mark-all-read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
    }).catch(() => {});
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={s.screen}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={() => router.push('/notifications/preferences' as any)}>
          <Text style={s.settings}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {unreadCount > 0 && (
        <TouchableOpacity style={s.markAllBtn} onPress={handleMarkAllRead}>
          <Text style={s.markAllText}>Mark all as read ({unreadCount})</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <View style={s.centered}><ActivityIndicator size="large" color={PRIMARY} /></View>
      ) : notifications.length === 0 ? (
        <View style={s.emptyState}>
          <Text style={s.emptyEmoji}>🔔</Text>
          <Text style={s.emptyTitle}>All caught up</Text>
          <Text style={s.emptySub}>
            You'll see friend requests, party invites, and round results here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationRow
              notif={item}
              onPress={() => handleTap(item)}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchNotifications(true); }}
              tintColor={PRIMARY}
            />
          }
          ItemSeparatorComponent={() => <View style={s.separator} />}
        />
      )}
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
  settings: { fontSize: 22 },
  markAllBtn: {
    backgroundColor: '#fff', paddingVertical: 10, alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  markAllText: { fontSize: 13, color: PRIMARY, fontWeight: '700' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: 19, fontWeight: '700', color: '#111', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 21 },
  row: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff',
  },
  rowUnread: { backgroundColor: '#f0fdf4' },
  iconContainer: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#f3f4f6',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  icon: { fontSize: 22 },
  title: { fontSize: 15, fontWeight: '700', color: '#111', flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: PRIMARY },
  body: { fontSize: 13, color: '#6b7280', marginTop: 2, lineHeight: 18 },
  time: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  separator: { height: 1, backgroundColor: '#f3f4f6' },
});
