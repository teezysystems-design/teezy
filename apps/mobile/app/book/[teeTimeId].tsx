/**
 * Booking Confirmation Flow — Section 07
 *
 * Steps:
 *   1. Select players (1–4)
 *   2. Review & confirm (cost breakdown, T&C acknowledgement)
 *   3. Confirmation screen (booking ID, "Invite Friends" CTA)
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
  useAnimatedValue,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useAppStore } from '../../src/store/useAppStore';

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
  green: '#22c55e',
  red: '#ef4444',
};

type Step = 'players' | 'confirm' | 'done';

// ─── Step 1: Select players ──────────────────────────────────────────────────

function SelectPlayersStep({
  playerCount,
  maxPlayers,
  onSelect,
  onNext,
  pricePerPersonCents,
}: {
  playerCount: number;
  maxPlayers: number;
  onSelect: (n: number) => void;
  onNext: () => void;
  pricePerPersonCents: number;
}) {
  const maxAllowed = Math.min(maxPlayers, 4);
  const total = (playerCount * pricePerPersonCents) / 100;

  return (
    <View style={s.stepContainer}>
      <Text style={s.stepHeading}>How many players?</Text>
      <Text style={s.stepSub}>Select the number of golfers for this tee time.</Text>

      <View style={s.playersGrid}>
        {Array.from({ length: maxAllowed }, (_, i) => i + 1).map((n) => (
          <TouchableOpacity
            key={n}
            style={[s.playerChip, playerCount === n && s.playerChipActive]}
            onPress={() => onSelect(n)}
            activeOpacity={0.75}
          >
            <Text style={[s.playerChipNum, playerCount === n && s.playerChipNumActive]}>{n}</Text>
            <Text style={[s.playerChipLabel, playerCount === n && s.playerChipLabelActive]}>
              {n === 1 ? 'player' : 'players'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.totalRow}>
        <Text style={s.totalLabel}>Total</Text>
        <Text style={s.totalAmount}>${total.toFixed(2)}</Text>
      </View>
      <Text style={s.totalSub}>${(pricePerPersonCents / 100).toFixed(2)}/person × {playerCount}</Text>

      <TouchableOpacity style={s.primaryBtn} onPress={onNext} activeOpacity={0.85}>
        <Text style={s.primaryBtnText}>Continue →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Step 2: Review & confirm ────────────────────────────────────────────────

function ConfirmStep({
  courseName,
  startsAt,
  playerCount,
  pricePerPersonCents,
  onBack,
  onConfirm,
  loading,
}: {
  courseName: string;
  startsAt: string;
  playerCount: number;
  pricePerPersonCents: number;
  onBack: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  const [agreed, setAgreed] = useState(false);
  const dateStr = new Date(startsAt).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
  const timeStr = new Date(startsAt).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
  });
  const subtotal = (playerCount * pricePerPersonCents) / 100;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <View style={s.stepContainer}>
      <Text style={s.stepHeading}>Review booking</Text>

      <View style={s.reviewCard}>
        <Text style={s.reviewCourseName}>{courseName}</Text>
        <Text style={s.reviewDateTime}>{dateStr}</Text>
        <Text style={s.reviewDateTime}>{timeStr}</Text>

        <View style={s.divider} />

        <View style={s.lineRow}>
          <Text style={s.lineLabel}>{playerCount} player{playerCount !== 1 ? 's' : ''} × ${(pricePerPersonCents / 100).toFixed(2)}</Text>
          <Text style={s.lineValue}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={s.lineRow}>
          <Text style={s.lineLabel}>Tax & fees (10%)</Text>
          <Text style={s.lineValue}>${tax.toFixed(2)}</Text>
        </View>

        <View style={s.divider} />

        <View style={s.lineRow}>
          <Text style={[s.lineLabel, s.totalLineLabel]}>Total</Text>
          <Text style={[s.lineValue, s.totalLineValue]}>${total.toFixed(2)}</Text>
        </View>
      </View>

      {/* T&C toggle */}
      <TouchableOpacity style={s.tcRow} onPress={() => setAgreed(!agreed)} activeOpacity={0.7}>
        <View style={[s.checkbox, agreed && s.checkboxChecked]}>
          {agreed && <Text style={s.checkmark}>✓</Text>}
        </View>
        <Text style={s.tcText}>
          I agree to the cancellation policy and terms of service.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[s.primaryBtn, (!agreed || loading) && s.primaryBtnDisabled]}
        onPress={onConfirm}
        disabled={!agreed || loading}
        activeOpacity={0.85}
      >
        {loading
          ? <ActivityIndicator color={C.white} />
          : <Text style={s.primaryBtnText}>Confirm & Pay ${total.toFixed(2)}</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={s.textBtn} onPress={onBack}>
        <Text style={s.textBtnText}>← Change players</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Step 3: Confirmation ────────────────────────────────────────────────────

function DoneStep({
  bookingId,
  courseName,
  startsAt,
  playerCount,
  onInviteFriends,
  onHome,
}: {
  bookingId: string;
  courseName: string;
  startsAt: string;
  playerCount: number;
  onInviteFriends: () => void;
  onHome: () => void;
}) {
  const fadeAnim = useAnimatedValue(0);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const timeStr = new Date(startsAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const dateStr = new Date(startsAt).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });

  return (
    <Animated.View style={[s.doneContainer, { opacity: fadeAnim }]}>
      <View style={s.successIcon}>
        <Text style={s.successEmoji}>✅</Text>
      </View>
      <Text style={s.doneTitle}>Booking confirmed!</Text>
      <Text style={s.doneSub}>
        You're all set for {playerCount} player{playerCount !== 1 ? 's' : ''} at
      </Text>
      <Text style={s.doneCourseName}>{courseName}</Text>
      <Text style={s.doneDateTime}>{dateStr} · {timeStr}</Text>

      <View style={s.bookingIdCard}>
        <Text style={s.bookingIdLabel}>Booking reference</Text>
        <Text style={s.bookingIdText}>{bookingId.slice(0, 8).toUpperCase()}</Text>
      </View>

      <TouchableOpacity style={s.primaryBtn} onPress={onInviteFriends} activeOpacity={0.85}>
        <Text style={s.primaryBtnText}>👥 Invite Friends</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.textBtn} onPress={onHome}>
        <Text style={s.textBtnText}>Back to Discover</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main flow ────────────────────────────────────────────────────────────────

export default function BookingScreen() {
  const { teeTimeId } = useLocalSearchParams<{ teeTimeId: string }>();
  const { session } = useAuth();
  const router = useRouter();
  const { pendingBooking, clearPendingBooking } = useAppStore();

  const [step, setStep] = useState<Step>('players');
  const [playerCount, setPlayerCount] = useState(2);
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
          playerCount,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body?.error?.message ?? 'Booking failed');
      }

      const json = await res.json();
      setBookingId(json.data?.id ?? json.id ?? 'unknown');
      setStep('done');
    } catch (err: unknown) {
      Alert.alert('Booking failed', err instanceof Error ? err.message : 'Please try again.');
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

  const handleHome = () => {
    clearPendingBooking();
    router.replace('/');
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      {/* Header */}
      {step !== 'done' && (
        <View style={s.header}>
          <TouchableOpacity onPress={() => (step === 'confirm' ? setStep('players') : router.back())}>
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>
            {step === 'players' ? 'Select Players' : 'Confirm Booking'}
          </Text>
          <View style={s.stepIndicator}>
            <View style={[s.stepDot, step === 'players' ? s.stepDotActive : s.stepDotDone]} />
            <View style={[s.stepLine, step === 'confirm' && s.stepLineDone]} />
            <View style={[s.stepDot, step === 'confirm' && s.stepDotActive]} />
          </View>
        </View>
      )}

      {step === 'players' && (
        <SelectPlayersStep
          playerCount={playerCount}
          maxPlayers={booking.maxPlayers}
          onSelect={setPlayerCount}
          onNext={() => setStep('confirm')}
          pricePerPersonCents={booking.pricePerPersonCents}
        />
      )}

      {step === 'confirm' && (
        <ConfirmStep
          courseName={booking.courseName}
          startsAt={booking.startsAt}
          playerCount={playerCount}
          pricePerPersonCents={booking.pricePerPersonCents}
          onBack={() => setStep('players')}
          onConfirm={handleConfirm}
          loading={confirming}
        />
      )}

      {step === 'done' && bookingId && (
        <DoneStep
          bookingId={bookingId}
          courseName={booking.courseName}
          startsAt={booking.startsAt}
          playerCount={playerCount}
          onInviteFriends={handleInviteFriends}
          onHome={handleHome}
        />
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.white },
  content: { flexGrow: 1, paddingBottom: 48 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  errorText: { fontSize: 16, color: C.gray400 },

  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 12,
  },
  backArrow: { fontSize: 22, color: C.primary },
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.gray900 },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.border },
  stepDotActive: { backgroundColor: C.primary },
  stepDotDone: { backgroundColor: C.green },
  stepLine: { flex: 1, height: 2, backgroundColor: C.border },
  stepLineDone: { backgroundColor: C.green },

  stepContainer: { padding: 24, gap: 0 },
  stepHeading: { fontSize: 24, fontWeight: '800', color: C.gray900, marginBottom: 8 },
  stepSub: { fontSize: 14, color: C.gray600, marginBottom: 28 },

  playersGrid: { flexDirection: 'row', gap: 12, marginBottom: 28, flexWrap: 'wrap' },
  playerChip: {
    width: 80, height: 80, borderRadius: 20, borderWidth: 2, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center', backgroundColor: C.white,
  },
  playerChipActive: { borderColor: C.primary, backgroundColor: C.primaryLight },
  playerChipNum: { fontSize: 28, fontWeight: '800', color: C.gray400 },
  playerChipNumActive: { color: C.primary },
  playerChipLabel: { fontSize: 11, color: C.gray400, marginTop: 2 },
  playerChipLabelActive: { color: C.primary },

  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: C.gray900 },
  totalAmount: { fontSize: 28, fontWeight: '900', color: C.primary },
  totalSub: { fontSize: 13, color: C.gray400, marginBottom: 28 },

  reviewCard: {
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    gap: 8,
  },
  reviewCourseName: { fontSize: 18, fontWeight: '800', color: C.gray900 },
  reviewDateTime: { fontSize: 14, color: C.gray600 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 4 },
  lineRow: { flexDirection: 'row', justifyContent: 'space-between' },
  lineLabel: { fontSize: 14, color: C.gray600 },
  lineValue: { fontSize: 14, color: C.gray900, fontWeight: '600' },
  totalLineLabel: { fontWeight: '800', color: C.gray900, fontSize: 16 },
  totalLineValue: { fontWeight: '800', color: C.primary, fontSize: 18 },

  tcRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 24 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  checkboxChecked: { backgroundColor: C.primary, borderColor: C.primary },
  checkmark: { color: C.white, fontSize: 13, fontWeight: '800' },
  tcText: { flex: 1, fontSize: 13, color: C.gray600, lineHeight: 18 },

  primaryBtn: {
    backgroundColor: C.primary, paddingVertical: 16, borderRadius: 14,
    alignItems: 'center', marginBottom: 12,
  },
  primaryBtnDisabled: { opacity: 0.4 },
  primaryBtnText: { color: C.white, fontSize: 16, fontWeight: '700' },
  textBtn: { alignItems: 'center', paddingVertical: 8 },
  textBtnText: { color: C.primary, fontSize: 15 },

  // Done step
  doneContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8,
  },
  successIcon: { marginBottom: 8 },
  successEmoji: { fontSize: 72 },
  doneTitle: { fontSize: 28, fontWeight: '900', color: C.gray900, textAlign: 'center' },
  doneSub: { fontSize: 15, color: C.gray600, textAlign: 'center' },
  doneCourseName: { fontSize: 18, fontWeight: '800', color: C.primary, textAlign: 'center' },
  doneDateTime: { fontSize: 14, color: C.gray600, marginBottom: 16 },
  bookingIdCard: {
    backgroundColor: C.gray50, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 14,
    alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: C.border,
  },
  bookingIdLabel: { fontSize: 11, color: C.gray400, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  bookingIdText: { fontSize: 22, fontWeight: '900', color: C.gray900, letterSpacing: 3, marginTop: 4 },
});
