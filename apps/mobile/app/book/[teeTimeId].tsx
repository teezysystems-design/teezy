/**
 * Booking Flow — Streamlined 2-Step + Celebration
 *
 * Steps:
 *   1. Select Party Size (1–4 golfers, no pricing)
 *   2. Confirm & Done (review + celebration view with animations)
 *
 * Golfers book tee times for FREE. The course gets billed monthly by PAR-Tee.
 */
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useAppStore } from '../../src/store/useAppStore';

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
};

type Step = 'select' | 'confirm' | 'celebration';

// ─── Step 1: Select Party Size ───────────────────────────────────────────────

function SelectPartyStep({
  partySize,
  maxPlayers,
  courseName,
  startsAt,
  onSelect,
  onContinue,
}: {
  partySize: number;
  maxPlayers: number;
  courseName: string;
  startsAt: string;
  onSelect: (n: number) => void;
  onContinue: () => void;
}) {
  const maxAllowed = Math.min(maxPlayers, 4);
  const dateStr = new Date(startsAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = new Date(startsAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.selectContent}>
      {/* Header with course info */}
      <View style={s.courseHeader}>
        <TouchableOpacity onPress={() => {}} style={s.closeBtn}>
          <Text style={s.closeBtnText}>×</Text>
        </TouchableOpacity>
        <View style={s.courseInfo}>
          <Text style={s.courseName}>{courseName}</Text>
          <Text style={s.courseDateTime}>
            {dateStr} at {timeStr}
          </Text>
        </View>
      </View>

      {/* Party size selection */}
      <View style={s.selectContainer}>
        <Text style={s.selectHeading}>How many players?</Text>
        <Text style={s.selectSub}>
          Choose the number of golfers in your party.
        </Text>

        <View style={s.partyGrid}>
          {Array.from({ length: maxAllowed }, (_, i) => i + 1).map((n) => (
            <TouchableOpacity
              key={n}
              style={[s.partyChip, partySize === n && s.partyChipActive]}
              onPress={() => onSelect(n)}
              activeOpacity={0.75}
            >
              <Text
                style={[s.partyChipNum, partySize === n && s.partyChipNumActive]}
              >
                {n}
              </Text>
              <Text
                style={[
                  s.partyChipLabel,
                  partySize === n && s.partyChipLabelActive,
                ]}
              >
                {n === 1 ? 'golfer' : 'golfers'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Continue button */}
      <View style={s.selectFooter}>
        <TouchableOpacity style={s.primaryBtn} onPress={onContinue} activeOpacity={0.85}>
          <Text style={s.primaryBtnText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ─── Step 2: Confirm Booking ─────────────────────────────────────────────────

function ConfirmStep({
  partySize,
  courseName,
  startsAt,
  onBack,
  onConfirm,
  loading,
}: {
  partySize: number;
  courseName: string;
  startsAt: string;
  onBack: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  const [policyAgreed, setPolicyAgreed] = useState(false);

  const dateStr = new Date(startsAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = new Date(startsAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.confirmContent}>
      <View style={s.confirmContainer}>
        {/* Header */}
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Text style={s.backBtnText}>← Change party size</Text>
        </TouchableOpacity>

        {/* Review card */}
        <View style={s.reviewCard}>
          <Text style={s.reviewHeading}>Your booking</Text>

          <View style={s.reviewRow}>
            <Text style={s.reviewLabel}>Course</Text>
            <Text style={s.reviewValue}>{courseName}</Text>
          </View>

          <View style={s.reviewRow}>
            <Text style={s.reviewLabel}>Date & Time</Text>
            <Text style={s.reviewValue}>
              {dateStr} at {timeStr}
            </Text>
          </View>

          <View style={s.reviewRow}>
            <Text style={s.reviewLabel}>Party Size</Text>
            <Text style={s.reviewValue}>
              {partySize} {partySize === 1 ? 'golfer' : 'golfers'}
            </Text>
          </View>
        </View>

        {/* Policy checkbox */}
        <TouchableOpacity
          style={s.policyRow}
          onPress={() => setPolicyAgreed(!policyAgreed)}
          activeOpacity={0.7}
        >
          <View style={[s.checkbox, policyAgreed && s.checkboxChecked]}>
            {policyAgreed && <Text style={s.checkmark}>✓</Text>}
          </View>
          <Text style={s.policyText}>
            I understand the course's cancellation policy
          </Text>
        </TouchableOpacity>

        {/* Confirm button */}
        <TouchableOpacity
          style={[s.primaryBtn, (!policyAgreed || loading) && s.primaryBtnDisabled]}
          onPress={onConfirm}
          disabled={!policyAgreed || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={C.white} />
          ) : (
            <Text style={s.primaryBtnText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ─── Step 3: Celebration ─────────────────────────────────────────────────────

function CelebrationStep({
  bookingId,
  partySize,
  courseName,
  startsAt,
  onInviteFriends,
  onDiscover,
}: {
  bookingId: string;
  partySize: number;
  courseName: string;
  startsAt: string;
  onInviteFriends: () => void;
  onDiscover: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, fadeAnim]);

  const dateStr = new Date(startsAt).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = new Date(startsAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <View style={s.celebrationContainer}>
      {/* Animated checkmark */}
      <Animated.View
        style={[
          s.checkmarkContainer,
          { transform: [{ scale: scaleAnim }], opacity: fadeAnim },
        ]}
      >
        <Text style={s.checkmarkEmoji}>✓</Text>
      </Animated.View>

      {/* Success heading */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={s.celebrationHeading}>You're booked!</Text>

        {/* Booking details */}
        <View style={s.celebrationDetails}>
          <Text style={s.detailCourse}>{courseName}</Text>
          <Text style={s.detailDateTime}>
            {dateStr} at {timeStr}
          </Text>
          <Text style={s.detailParty}>
            {partySize} {partySize === 1 ? 'golfer' : 'golfers'}
          </Text>

          {/* Booking reference */}
          <View style={s.refCard}>
            <Text style={s.refLabel}>Booking reference</Text>
            <Text style={s.refId}>{bookingId.slice(0, 8).toUpperCase()}</Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={s.celebrationActions}>
          <TouchableOpacity
            style={s.primaryBtn}
            onPress={onInviteFriends}
            activeOpacity={0.85}
          >
            <Text style={s.primaryBtnText}>Invite Friends to Party</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.secondaryBtn}
            onPress={onDiscover}
            activeOpacity={0.75}
          >
            <Text style={s.secondaryBtnText}>Back to Discover</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function BookingScreen() {
  const { teeTimeId } = useLocalSearchParams<{ teeTimeId: string }>();
  const { session } = useAuth();
  const router = useRouter();
  const { pendingBooking, clearPendingBooking } = useAppStore();

  const [step, setStep] = useState<Step>('select');
  const [partySize, setPartySize] = useState(1);
  const [confirming, setConfirming] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const booking = pendingBooking;

  if (!booking) {
    return (
      <View style={s.centered}>
        <Text style={s.errorText}>No tee time selected.</Text>
        <TouchableOpacity style={s.primaryBtn} onPress={() => router.back()}>
          <Text style={s.primaryBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleConfirm = async () => {
    if (!session) return;
    setConfirming(true);
    try {
      const res = await fetch(`${API_URL}/v1/bookings`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teeTimeId: booking.teeTimeId,
          partySize,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body?.error?.message ?? 'Booking failed');
      }

      const json = await res.json();
      setBookingId(json.data?.id ?? json.id ?? 'unknown');
      setStep('celebration');
    } catch (err: unknown) {
      Alert.alert(
        'Booking failed',
        err instanceof Error ? err.message : 'Please try again.'
      );
    } finally {
      setConfirming(false);
    }
  };

  const handleInviteFriends = () => {
    clearPendingBooking();
    if (bookingId) {
      router.replace(`/party/create?bookingId=${bookingId}`);
    } else {
      router.replace('/');
    }
  };

  const handleDiscover = () => {
    clearPendingBooking();
    router.replace('/(tabs)');
  };

  return (
    <>
      {step === 'select' && (
        <SelectPartyStep
          partySize={partySize}
          maxPlayers={booking.maxPlayers}
          courseName={booking.courseName}
          startsAt={booking.startsAt}
          onSelect={setPartySize}
          onContinue={() => setStep('confirm')}
        />
      )}

      {step === 'confirm' && (
        <ConfirmStep
          partySize={partySize}
          courseName={booking.courseName}
          startsAt={booking.startsAt}
          onBack={() => setStep('select')}
          onConfirm={handleConfirm}
          loading={confirming}
        />
      )}

      {step === 'celebration' && bookingId && (
        <CelebrationStep
          bookingId={bookingId}
          partySize={partySize}
          courseName={booking.courseName}
          startsAt={booking.startsAt}
          onInviteFriends={handleInviteFriends}
          onDiscover={handleDiscover}
        />
      )}
    </>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.white },
  selectContent: { flexGrow: 1, paddingBottom: 32 },
  confirmContent: { flexGrow: 1, paddingBottom: 32 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  errorText: { fontSize: 16, color: C.gray400 },

  // Select step
  courseHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  closeBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  closeBtnText: { fontSize: 28, color: C.gray600 },
  courseInfo: { flex: 1 },
  courseName: { fontSize: 18, fontWeight: '800', color: C.gray900 },
  courseDateTime: { fontSize: 14, color: C.gray600, marginTop: 4 },

  selectContainer: { paddingHorizontal: 20, gap: 12 },
  selectHeading: {
    fontSize: 28,
    fontWeight: '800',
    color: C.gray900,
    marginBottom: 8,
  },
  selectSub: { fontSize: 15, color: C.gray600, lineHeight: 22, marginBottom: 24 },

  partyGrid: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 40,
  },
  partyChip: {
    width: 88,
    height: 88,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.white,
  },
  partyChipActive: {
    borderColor: C.primary,
    backgroundColor: C.primaryLight,
  },
  partyChipNum: {
    fontSize: 32,
    fontWeight: '800',
    color: C.gray400,
  },
  partyChipNumActive: { color: C.primary },
  partyChipLabel: { fontSize: 12, color: C.gray400, marginTop: 4, fontWeight: '600' },
  partyChipLabelActive: { color: C.primary },

  selectFooter: { paddingHorizontal: 20 },

  // Confirm step
  confirmContainer: { paddingHorizontal: 20, paddingTop: 16 },
  backBtn: { marginBottom: 24 },
  backBtnText: { fontSize: 15, color: C.primary, fontWeight: '600' },

  reviewCard: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 20,
    marginBottom: 24,
    backgroundColor: C.gray50,
  },
  reviewHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: C.gray900,
    marginBottom: 16,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  reviewLabel: { fontSize: 14, color: C.gray600 },
  reviewValue: { fontSize: 14, fontWeight: '600', color: C.gray900, flex: 1, textAlign: 'right' },

  policyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 28,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: { backgroundColor: C.primary, borderColor: C.primary },
  checkmark: { color: C.white, fontSize: 14, fontWeight: '800' },
  policyText: { flex: 1, fontSize: 14, color: C.gray600, lineHeight: 20, fontWeight: '500' },

  // Buttons
  primaryBtn: {
    backgroundColor: C.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: C.white, fontSize: 16, fontWeight: '600' },

  secondaryBtn: {
    backgroundColor: C.white,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  secondaryBtnText: { color: C.primary, fontSize: 16, fontWeight: '600' },

  // Celebration
  celebrationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
    backgroundColor: C.white,
  },
  checkmarkContainer: {
    marginBottom: 32,
  },
  checkmarkEmoji: {
    fontSize: 72,
    color: C.primary,
  },

  celebrationHeading: {
    fontSize: 32,
    fontWeight: '800',
    color: C.gray900,
    textAlign: 'center',
    marginBottom: 24,
  },

  celebrationDetails: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  detailCourse: {
    fontSize: 18,
    fontWeight: '700',
    color: C.gray900,
  },
  detailDateTime: {
    fontSize: 14,
    color: C.gray600,
  },
  detailParty: {
    fontSize: 14,
    color: C.gray600,
    marginBottom: 12,
  },

  refCard: {
    backgroundColor: C.primaryLight,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  refLabel: {
    fontSize: 11,
    color: C.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  refId: {
    fontSize: 18,
    fontWeight: '800',
    color: C.primary,
    letterSpacing: 2,
    marginTop: 4,
  },

  celebrationActions: {
    width: '100%',
  },
});
