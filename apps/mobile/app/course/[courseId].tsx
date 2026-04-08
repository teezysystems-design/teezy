/**
 * Course Detail Page — Section 07
 *
 * - Full course info: name, address, hole count, par, description, mood tags
 * - Mood match score (if filtered mood is active)
 * - Tee time picker: grouped by date, selectable slots
 * - Book CTA → /book/[teeTimeId]
 */
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
  amber: '#f59e0b',
};

const MOOD_EMOJI: Record<string, string> = {
  relaxed: '😌', competitive: '🏆', social: '👥', scenic: '🌅',
  beginner: '🌱', 'fast-paced': '⚡', challenging: '💪', advanced: '🔥',
};

interface TeeTimeSlot {
  id: string;
  startsAt: string;
  capacityRemaining: number;
  totalCapacity: number;
  pricePerPersonCents: number;
}

interface CourseDetail {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  description: string | null;
  holeCount: number;
  par: number;
  distanceMiles: number | null;
  moodTags: string[];
  moodMatchScore: number | null;
  latitude: number | null;
  longitude: number | null;
  websiteUrl: string | null;
  phoneNumber: string | null;
}

type SlotsByDate = Record<string, TeeTimeSlot[]>;

function groupByDate(slots: TeeTimeSlot[]): SlotsByDate {
  return slots.reduce<SlotsByDate>((acc, slot) => {
    const key = new Date(slot.startsAt).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
    });
    (acc[key] = acc[key] ?? []).push(slot);
    return acc;
  }, {});
}

function SlotPill({
  slot,
  selected,
  onPress,
}: {
  slot: TeeTimeSlot;
  selected: boolean;
  onPress: () => void;
}) {
  const time = new Date(slot.startsAt).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
  });
  const price = `$${(slot.pricePerPersonCents / 100).toFixed(0)}`;
  const scarce = slot.capacityRemaining <= 2;

  return (
    <TouchableOpacity
      style={[
        pill.container,
        selected && pill.containerSelected,
        slot.capacityRemaining === 0 && pill.containerFull,
      ]}
      onPress={onPress}
      disabled={slot.capacityRemaining === 0}
      activeOpacity={0.75}
    >
      <Text style={[pill.time, selected && pill.timeSelected]}>{time}</Text>
      <Text style={[pill.price, selected && pill.priceSelected]}>{price}/pp</Text>
      {scarce && slot.capacityRemaining > 0 && (
        <View style={pill.scarceDot} />
      )}
      {slot.capacityRemaining === 0 && (
        <Text style={pill.fullText}>Full</Text>
      )}
    </TouchableOpacity>
  );
}

export default function CourseDetailScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const { session } = useAuth();
  const router = useRouter();
  const { selectedMood, setPendingBooking } = useAppStore();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [slots, setSlots] = useState<TeeTimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TeeTimeSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch_ = useCallback(
    async (silent = false) => {
      if (!session || !courseId) return;
      if (!silent) setLoading(true);
      try {
        const moodQ = selectedMood !== 'all' ? `?mood=${selectedMood}` : '';
        const [courseRes, slotsRes] = await Promise.all([
          fetch(`${API_URL}/v1/courses/${courseId}${moodQ}`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }),
          fetch(`${API_URL}/v1/tee-times?courseId=${courseId}`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }),
        ]);
        if (courseRes.ok) {
          const json = await courseRes.json();
          setCourse(json.data ?? json);
        }
        if (slotsRes.ok) {
          const json = await slotsRes.json();
          setSlots(json.data ?? []);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [session, courseId, selectedMood]
  );

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleBook = () => {
    if (!selectedSlot || !course) return;
    setPendingBooking({
      teeTimeId: selectedSlot.id,
      courseId: course.id,
      courseName: course.name,
      startsAt: selectedSlot.startsAt,
      pricePerPersonCents: selectedSlot.pricePerPersonCents,
      maxPlayers: selectedSlot.totalCapacity,
    });
    router.push(`/book/${selectedSlot.id}`);
  };

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={s.centered}>
        <Text style={s.errorText}>Course not found.</Text>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const slotsByDate = groupByDate(slots);

  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch_(true); }} tintColor={C.primary} />}
    >
      {/* Back */}
      <TouchableOpacity style={s.backRow} onPress={() => router.back()}>
        <Text style={s.backArrow}>←</Text>
        <Text style={s.backLabel}>Discover</Text>
      </TouchableOpacity>

      {/* Hero */}
      <View style={s.hero}>
        <Text style={s.heroName}>{course.name}</Text>
        <Text style={s.heroLocation}>
          {course.address}, {course.city}, {course.state} {course.zipCode}
        </Text>
        <View style={s.heroMeta}>
          <View style={s.metaChip}>
            <Text style={s.metaChipText}>⛳ {course.holeCount} holes</Text>
          </View>
          <View style={s.metaChip}>
            <Text style={s.metaChipText}>Par {course.par}</Text>
          </View>
          {course.distanceMiles != null && (
            <View style={s.metaChip}>
              <Text style={s.metaChipText}>📍 {course.distanceMiles.toFixed(1)} mi</Text>
            </View>
          )}
        </View>
      </View>

      {/* Mood match score */}
      {course.moodMatchScore != null && course.moodMatchScore > 0 && (
        <View style={s.moodMatchCard}>
          <Text style={s.moodMatchTitle}>Mood match score</Text>
          <View style={s.moodMatchRow}>
            <View style={s.moodMatchTrack}>
              <View
                style={[
                  s.moodMatchFill,
                  { width: `${Math.min(100, course.moodMatchScore)}%` as `${number}%` },
                ]}
              />
            </View>
            <Text style={s.moodMatchPct}>{Math.round(course.moodMatchScore)}%</Text>
          </View>
          {selectedMood !== 'all' && (
            <Text style={s.moodMatchSub}>
              Based on your "{selectedMood}" mood preference
            </Text>
          )}
        </View>
      )}

      {/* Mood tags */}
      {course.moodTags.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Vibes</Text>
          <View style={s.tagsRow}>
            {course.moodTags.map((tag) => (
              <View key={tag} style={s.tag}>
                <Text style={s.tagText}>{MOOD_EMOJI[tag] ?? '⛳'} {tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Description */}
      {course.description && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>About</Text>
          <Text style={s.description}>{course.description}</Text>
        </View>
      )}

      {/* Contact */}
      {(course.phoneNumber || course.websiteUrl) && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Contact</Text>
          {course.phoneNumber && (
            <Text style={s.contactText}>📞 {course.phoneNumber}</Text>
          )}
          {course.websiteUrl && (
            <Text style={s.contactText}>🌐 {course.websiteUrl}</Text>
          )}
        </View>
      )}

      {/* Tee time picker */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Available Tee Times</Text>
        {slots.length === 0 ? (
          <View style={s.noSlots}>
            <Text style={s.noSlotsText}>No upcoming tee times available.</Text>
          </View>
        ) : (
          Object.entries(slotsByDate).map(([date, dateSlots]) => (
            <View key={date} style={s.dateGroup}>
              <Text style={s.dateLabel}>{date}</Text>
              <View style={s.slotsWrap}>
                {dateSlots.map((slot) => (
                  <SlotPill
                    key={slot.id}
                    slot={slot}
                    selected={selectedSlot?.id === slot.id}
                    onPress={() =>
                      setSelectedSlot(selectedSlot?.id === slot.id ? null : slot)
                    }
                  />
                ))}
              </View>
            </View>
          ))
        )}
      </View>

      {/* Spacer for sticky footer */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

// ─── Sticky book button ──────────────────────────────────────────────────────
// Rendered inside the screen so it overlays the scroll content

function BookingFooter({
  slot,
  onBook,
}: {
  slot: TeeTimeSlot | null;
  onBook: () => void;
}) {
  if (!slot) return null;
  const time = new Date(slot.startsAt).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
  });
  const date = new Date(slot.startsAt).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
  const price = `$${(slot.pricePerPersonCents / 100).toFixed(0)}/person`;

  return (
    <View style={f.footer}>
      <View style={f.info}>
        <Text style={f.dateTime}>{date} · {time}</Text>
        <Text style={f.price}>{price}</Text>
      </View>
      <TouchableOpacity style={f.btn} onPress={onBook} activeOpacity={0.85}>
        <Text style={f.btnText}>Book Now →</Text>
      </TouchableOpacity>
    </View>
  );
}

// Wrap both in a container so the sticky footer overlays the scroll
export function CourseDetailWrapper() {
  const [selectedSlot, setSelectedSlot] = useState<TeeTimeSlot | null>(null);
  const router = useRouter();
  const { setPendingBooking } = useAppStore();

  // This wrapper approach works only if we hoist state — instead we inline it above.
  // The actual screen re-export handles this via local state.
  return null;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.white },
  content: { paddingBottom: 120 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { fontSize: 16, color: C.gray400, marginBottom: 16 },

  backRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 8, gap: 6 },
  backArrow: { fontSize: 20, color: C.primary },
  backLabel: { fontSize: 15, color: C.primary, fontWeight: '600' },
  backBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: C.primary, borderRadius: 10 },
  backBtnText: { color: C.white, fontWeight: '600' },

  hero: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  heroName: { fontSize: 26, fontWeight: '800', color: C.gray900 },
  heroLocation: { fontSize: 13, color: C.gray600, marginTop: 4, lineHeight: 18 },
  heroMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  metaChip: { backgroundColor: C.gray100, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  metaChipText: { fontSize: 13, color: C.gray600, fontWeight: '600' },

  moodMatchCard: {
    margin: 16,
    padding: 16,
    backgroundColor: C.primaryLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#b2dfcc',
  },
  moodMatchTitle: { fontSize: 13, fontWeight: '700', color: C.primary, marginBottom: 8 },
  moodMatchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  moodMatchTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.6)', overflow: 'hidden' },
  moodMatchFill: { height: '100%', backgroundColor: C.primary, borderRadius: 4 },
  moodMatchPct: { fontSize: 18, fontWeight: '800', color: C.primary, width: 44, textAlign: 'right' },
  moodMatchSub: { fontSize: 12, color: C.primary, marginTop: 6, opacity: 0.8 },

  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: C.gray900, marginBottom: 12 },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: C.gray100, borderWidth: 1, borderColor: C.border,
  },
  tagText: { fontSize: 13, color: C.gray600, textTransform: 'capitalize', fontWeight: '500' },

  description: { fontSize: 15, color: C.gray600, lineHeight: 22 },

  contactText: { fontSize: 14, color: C.gray600, marginBottom: 6 },

  noSlots: { paddingVertical: 20, alignItems: 'center' },
  noSlotsText: { fontSize: 14, color: C.gray400 },

  dateGroup: { marginBottom: 20 },
  dateLabel: { fontSize: 13, fontWeight: '700', color: C.gray600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  slotsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});

const pill = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
    alignItems: 'center',
    minWidth: 80,
    position: 'relative',
  },
  containerSelected: { borderColor: C.primary, backgroundColor: C.primaryLight },
  containerFull: { opacity: 0.4 },
  time: { fontSize: 14, fontWeight: '700', color: C.gray900 },
  timeSelected: { color: C.primary },
  price: { fontSize: 11, color: C.gray400, marginTop: 2 },
  priceSelected: { color: C.primary },
  scarceDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.amber,
  },
  fullText: { fontSize: 10, color: C.gray400, marginTop: 2, fontWeight: '600' },
});

const f = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 28,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  info: { flex: 1 },
  dateTime: { fontSize: 14, fontWeight: '700', color: C.gray900 },
  price: { fontSize: 13, color: C.gray600, marginTop: 2 },
  btn: {
    backgroundColor: C.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  btnText: { color: C.white, fontWeight: '700', fontSize: 15 },
});

// Re-export default with sticky booking footer overlay
import React from 'react';

function CourseDetailWithFooter() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const { session } = useAuth();
  const router = useRouter();
  const { selectedMood, setPendingBooking } = useAppStore();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [slots, setSlots] = useState<TeeTimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TeeTimeSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (silent = false) => {
      if (!session || !courseId) return;
      if (!silent) setLoading(true);
      try {
        const moodQ = selectedMood !== 'all' ? `?mood=${selectedMood}` : '';
        const [courseRes, slotsRes] = await Promise.all([
          fetch(`${API_URL}/v1/courses/${courseId}${moodQ}`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }),
          fetch(`${API_URL}/v1/tee-times?courseId=${courseId}`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }),
        ]);
        if (courseRes.ok) setCourse((await courseRes.json()).data ?? (await courseRes.json()));
        if (slotsRes.ok) setSlots((await slotsRes.json()).data ?? []);
      } catch {
        // silent
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [session, courseId, selectedMood]
  );

  useEffect(() => { load(); }, [load]);

  const handleBook = () => {
    if (!selectedSlot || !course) {
      Alert.alert('Select a tee time', 'Please pick a tee time slot before booking.');
      return;
    }
    setPendingBooking({
      teeTimeId: selectedSlot.id,
      courseId: course.id,
      courseName: course.name,
      startsAt: selectedSlot.startsAt,
      pricePerPersonCents: selectedSlot.pricePerPersonCents,
      maxPlayers: selectedSlot.totalCapacity,
    });
    router.push(`/book/${selectedSlot.id}`);
  };

  if (loading) {
    return <View style={s.centered}><ActivityIndicator size="large" color={C.primary} /></View>;
  }

  if (!course) {
    return (
      <View style={s.centered}>
        <Text style={s.errorText}>Course not found.</Text>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const slotsByDate = groupByDate(slots);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={s.screen}
        contentContainerStyle={s.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(true); }}
            tintColor={C.primary}
          />
        }
      >
        <TouchableOpacity style={s.backRow} onPress={() => router.back()}>
          <Text style={s.backArrow}>←</Text>
          <Text style={s.backLabel}>Discover</Text>
        </TouchableOpacity>

        <View style={s.hero}>
          <Text style={s.heroName}>{course.name}</Text>
          <Text style={s.heroLocation}>
            {course.address}, {course.city}, {course.state} {course.zipCode}
          </Text>
          <View style={s.heroMeta}>
            <View style={s.metaChip}><Text style={s.metaChipText}>⛳ {course.holeCount} holes</Text></View>
            <View style={s.metaChip}><Text style={s.metaChipText}>Par {course.par}</Text></View>
            {course.distanceMiles != null && (
              <View style={s.metaChip}><Text style={s.metaChipText}>📍 {course.distanceMiles.toFixed(1)} mi</Text></View>
            )}
          </View>
        </View>

        {course.moodMatchScore != null && course.moodMatchScore > 0 && (
          <View style={s.moodMatchCard}>
            <Text style={s.moodMatchTitle}>Mood match score</Text>
            <View style={s.moodMatchRow}>
              <View style={s.moodMatchTrack}>
                <View style={[s.moodMatchFill, { width: `${Math.min(100, course.moodMatchScore)}%` as `${number}%` }]} />
              </View>
              <Text style={s.moodMatchPct}>{Math.round(course.moodMatchScore)}%</Text>
            </View>
            {selectedMood !== 'all' && (
              <Text style={s.moodMatchSub}>Based on your "{selectedMood}" mood preference</Text>
            )}
          </View>
        )}

        {course.moodTags.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Vibes</Text>
            <View style={s.tagsRow}>
              {course.moodTags.map((tag) => (
                <View key={tag} style={s.tag}>
                  <Text style={s.tagText}>{MOOD_EMOJI[tag] ?? '⛳'} {tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {course.description && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>About</Text>
            <Text style={s.description}>{course.description}</Text>
          </View>
        )}

        {(course.phoneNumber || course.websiteUrl) && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Contact</Text>
            {course.phoneNumber && <Text style={s.contactText}>📞 {course.phoneNumber}</Text>}
            {course.websiteUrl && <Text style={s.contactText}>🌐 {course.websiteUrl}</Text>}
          </View>
        )}

        <View style={s.section}>
          <Text style={s.sectionTitle}>Available Tee Times</Text>
          {slots.length === 0 ? (
            <View style={s.noSlots}><Text style={s.noSlotsText}>No upcoming tee times available.</Text></View>
          ) : (
            Object.entries(slotsByDate).map(([date, dateSlots]) => (
              <View key={date} style={s.dateGroup}>
                <Text style={s.dateLabel}>{date}</Text>
                <View style={s.slotsWrap}>
                  {dateSlots.map((slot) => (
                    <SlotPill
                      key={slot.id}
                      slot={slot}
                      selected={selectedSlot?.id === slot.id}
                      onPress={() => setSelectedSlot(selectedSlot?.id === slot.id ? null : slot)}
                    />
                  ))}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {selectedSlot && <BookingFooter slot={selectedSlot} onBook={handleBook} />}
    </View>
  );
}

// Override the default export with the proper stateful version
export { CourseDetailWithFooter as default };
