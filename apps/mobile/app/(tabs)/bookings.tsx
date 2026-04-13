/**
 * My Bookings Screen
 *
 * Displays upcoming and past bookings with:
 * - Segmented control for filtering
 * - Pull-to-refresh
 * - Cancel button for confirmed bookings
 * - Status badges
 * - Loading and error states
 *
 * Golfers book tee times for FREE.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';

const API_URL = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:4000';

const C = {
  primary: '#1B6B3A',
  primaryLight: '#E8F5EE',
  white: '#FFFFFF',
  gray50: '#F7F7F7',
  gray100: '#F0F0F0',
  gray400: '#9CA3AF',
  gray600: '#6B7280',
  gray900: '#111827',
  border: '#E5E7EB',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
};

interface Booking {
  id: string;
  teeTimeId: string;
  courseName: string;
  startsAt: string;
  partySize: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

type FilterTab = 'upcoming' | 'past';

function getStatusColor(status: Booking['status']): string {
  switch (status) {
    case 'confirmed':
      return C.success;
    case 'cancelled':
      return C.danger;
    case 'completed':
      return C.gray400;
    default:
      return C.gray600;
  }
}

function getStatusLabel(status: Booking['status']): string {
  switch (status) {
    case 'confirmed':
      return 'Confirmed';
    case 'cancelled':
      return 'Cancelled';
    case 'completed':
      return 'Completed';
    default:
      return status;
  }
}

function isUpcoming(booking: Booking): boolean {
  return new Date(booking.startsAt) > new Date() && booking.status === 'confirmed';
}

function BookingCard({
  booking,
  onCancel,
}: {
  booking: Booking;
  onCancel: (bookingId: string, courseName: string) => void;
}) {
  const date = new Date(booking.startsAt);
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const upcoming = isUpcoming(booking);

  return (
    <View style={s.card}>
      {/* Card header with course name and status */}
      <View style={s.cardHeader}>
        <Text style={s.courseName}>{booking.courseName}</Text>
        <Text style={[s.statusBadge, { color: getStatusColor(booking.status) }]}>
          {getStatusLabel(booking.status)}
        </Text>
      </View>

      {/* Date, time, party size */}
      <View style={s.cardMeta}>
        <View style={s.metaItem}>
          <Text style={s.metaLabel}>Date</Text>
          <Text style={s.metaValue}>{dateStr}</Text>
        </View>
        <View style={s.metaDivider} />
        <View style={s.metaItem}>
          <Text style={s.metaLabel}>Time</Text>
          <Text style={s.metaValue}>{timeStr}</Text>
        </View>
        <View style={s.metaDivider} />
        <View style={s.metaItem}>
          <Text style={s.metaLabel}>Party</Text>
          <Text style={s.metaValue}>
            {booking.partySize} {booking.partySize === 1 ? 'golfer' : 'golfers'}
          </Text>
        </View>
      </View>

      {/* Footer with action button */}
      {upcoming && (
        <View style={s.cardFooter}>
          <TouchableOpacity
            style={s.cancelBtn}
            onPress={() => onCancel(booking.id, booking.courseName)}
            activeOpacity={0.7}
          >
            <Text style={s.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function SegmentedControl({
  value,
  onChange,
}: {
  value: FilterTab;
  onChange: (tab: FilterTab) => void;
}) {
  return (
    <View style={s.segmentContainer}>
      <TouchableOpacity
        style={[s.segmentBtn, value === 'upcoming' && s.segmentBtnActive]}
        onPress={() => onChange('upcoming')}
        activeOpacity={0.8}
      >
        <Text style={[s.segmentBtnText, value === 'upcoming' && s.segmentBtnTextActive]}>
          Upcoming
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[s.segmentBtn, value === 'past' && s.segmentBtnActive]}
        onPress={() => onChange('past')}
        activeOpacity={0.8}
      >
        <Text style={[s.segmentBtnText, value === 'past' && s.segmentBtnTextActive]}>
          Past
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={s.emptyState}>
      <Text style={s.emptyEmoji}>⛳</Text>
      <Text style={s.emptyTitle}>No bookings yet</Text>
      <Text style={s.emptySub}>
        Head to Discover to find tee times and book your next round.
      </Text>
    </View>
  );
}

function LoadingState() {
  return (
    <View style={s.loadingState}>
      <ActivityIndicator size="large" color={C.primary} />
      <Text style={s.loadingText}>Loading bookings...</Text>
    </View>
  );
}

function ErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <View style={s.errorState}>
      <Text style={s.errorEmoji}>!</Text>
      <Text style={s.errorTitle}>Oops</Text>
      <Text style={s.errorSub}>{error}</Text>
      <TouchableOpacity style={s.retryBtn} onPress={onRetry} activeOpacity={0.85}>
        <Text style={s.retryBtnText}>Try again</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function BookingsScreen() {
  const { session } = useAuth();
  const router = useRouter();

  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<FilterTab>('upcoming');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredBookings = allBookings.filter((b) => {
    if (filter === 'upcoming') {
      return isUpcoming(b);
    } else {
      return !isUpcoming(b);
    }
  });

  const fetchBookings = useCallback(
    async (silent = false) => {
      if (!session) return;

      if (!silent) {
        setLoading(true);
      }
      setError(null);

      try {
        const res = await fetch(`${API_URL}/v1/bookings`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          throw new Error('Failed to load bookings');
        }

        const json = await res.json();
        setAllBookings(json.data ?? []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not load bookings';
        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [session]
  );

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings(true);
  };

  const handleCancel = (bookingId: string, courseName: string) => {
    Alert.alert(
      'Cancel booking?',
      `Are you sure you want to cancel your booking at ${courseName}?`,
      [
        { text: 'Keep booking', style: 'cancel' },
        {
          text: 'Cancel booking',
          style: 'destructive',
          onPress: () => performCancel(bookingId),
        },
      ]
    );
  };

  const performCancel = async (bookingId: string) => {
    if (!session) return;

    try {
      const res = await fetch(`${API_URL}/v1/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Failed to cancel booking');
      }

      Alert.alert('Booking cancelled', 'Your booking has been cancelled.');
      fetchBookings(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not cancel booking';
      Alert.alert('Error', message);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => fetchBookings()} />;
  }

  return (
    <SafeAreaView style={s.screen}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>My Bookings</Text>
        <Text style={s.headerSub}>
          {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Filter tabs */}
      <SegmentedControl value={filter} onChange={setFilter} />

      {/* Bookings list */}
      {filteredBookings.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BookingCard
              booking={item}
              onCancel={handleCancel}
            />
          )}
          contentContainerStyle={s.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={C.primary}
            />
          }
          ItemSeparatorComponent={() => <View style={s.itemSeparator} />}
          scrollEnabled={true}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.white,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: C.gray900,
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 14,
    color: C.gray600,
    fontWeight: '500',
  },

  // Segmented control
  segmentContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: C.gray50,
    borderWidth: 1,
    borderColor: C.border,
  },
  segmentBtnActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  segmentBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.gray600,
  },
  segmentBtnTextActive: {
    color: C.white,
  },

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: 24,
  },
  itemSeparator: {
    height: 12,
  },

  // Card
  card: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  courseName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: C.gray900,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
  },

  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: C.border,
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 11,
    color: C.gray600,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: C.gray900,
  },
  metaDivider: {
    width: 1,
    height: 20,
    backgroundColor: C.border,
  },

  cardFooter: {
    alignItems: 'flex-end',
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.danger,
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.gray900,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 15,
    color: C.gray600,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Loading state
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: C.gray600,
    fontWeight: '500',
  },

  // Error state
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.gray900,
  },
  errorSub: {
    fontSize: 15,
    color: C.gray600,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  retryBtn: {
    backgroundColor: C.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryBtnText: {
    color: C.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
