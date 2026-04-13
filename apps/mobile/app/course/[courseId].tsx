/**
 * Course Detail Page — Section 07
 *
 * - Full course info: name, address, hole count, par, description, mood tags, course rating/slope
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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MOODS, COLORS } from '@par-tee/shared';
import { useAuth } from '../../src/context/AuthContext';
import { useAppStore } from '../../src/store/useAppStore';

const API_URL = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:4000';

const C = {
  primary: COLORS.primary,
  primaryLight: COLORS.primaryPale,
  white: COLORS.white,
  gray50: COLORS.gray50,
  gray100: COLORS.gray100,
  gray400: COLORS.gray400,
  gray600: COLORS.gray500,
  gray900: COLORS.gray900,
  border: COLORS.gray200,
  amber: COLORS.warning,
};

interface TeeTimeSlot {
  id: string;
  startsAt: string;
  capacityRemaining: number;
  totalCapacity: number;
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
  courseRating?: number | null;
  slopeRating?: number | null;
  distanceMiles: number | null;
  moodTags: string[];
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
  const scarce = slot.capacityRemaining <= 2;
  const remaining = slot.capacityRemaining;

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
      <Text style={[pill.spots, selected && pill.spotsSelected]}>
        {remaining > 0 ? `${remaining} left` : 'Full'}
      </Text>
      {scarce && slot.capacityRemaining > 0 && (
        <View style={pill.scarceDot} />
      )}
    </TouchableOpacity>
  );
}

export default function CourseDetailScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const { session } = useAuth();
  const router = useRouter();
  const { setPendingBooking } = useAppStore();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [slots, setSlots] = useState<TeeTimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TeeTimeSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(
    async (silent = false) => {
      if (!session || !courseId) return;
      if (!silent) setLoading(true);
      try {
        const [courseRes, slotsRes] = await Promise.all([
          fetch(`${API_URL}/v1/courses/${courseId}`, {
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
    [session, courseId]
  );

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleBook = () => {
    if (!selectedSlot || !course) return;
    setPendingBooking({
      teeTimeId: selectedSlot.id,
      courseId: course.id,
      courseName: course.name,
      startsAt: selectedSlot.startsAt,
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
    <View style={{ flex: 1 }}>
      <ScrollView
        style={s.screen}
        contentContainerStyle={s.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchData(true); }}
            tintColor={C.primary}
          />
        }
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
          {(course.courseRating || course.slopeRating) && (
            <View style={s.ratingRow}>
              {course.courseRating && (
                <View style={s.ratingChip}>
                  <Text style={s.ratingLabel}>Rating</Text>
                  <Text style={s.ratingValue}>{course.courseRating.toFixed(1)}</Text>
                </View>
              )}
              {course.slopeRating && (
                <View style={s.ratingChip}>
                  <Text style={s.ratingLabel}>Slope</Text>
                  <Text style={s.ratingValue}>{course.slopeRating.toFixed(0)}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Mood tags */}
        {course.moodTags.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Vibes</Text>
            <View style={s.tagsRow}>
              {course.moodTags.map((tag) => {
                const moodObj = MOODS.find((m) => m.key === tag);
                return (
                  <View key={tag} style={s.tag}>
                    <Text style={s.tagText}>{moodObj?.emoji ?? '⛳'} {tag}</Text>
                  </View>
                );
              })}
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

      {/* Sticky booking footer */}
      {selectedSlot && (
        <View style={f.footer}>
          <View style={f.info}>
            <Text style={f.dateTime}>
              {new Date(selectedSlot.startsAt).toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric',
              })} · {new Date(selectedSlot.startsAt).toLocaleTimeString('en-US', {
                hour: 'numeric', minute: '2-digit',
              })}
            </Text>
          </View>
          <TouchableOpacity style={f.btn} onPress={handleBook} activeOpacity={0.85}>
            <Text style={f.btnText}>Book Now →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.white },
  content: { paddingBottom: 20 },
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

  ratingRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  ratingChip: { flexDirection: 'column', alignItems: 'center', backgroundColor: C.primaryLight, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  ratingLabel: { fontSize: 11, color: C.primary, fontWeight: '600' },
  ratingValue: { fontSize: 16, color: C.primary, fontWeight: '800', marginTop: 2 },

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
  spots: { fontSize: 11, color: C.gray400, marginTop: 2 },
  spotsSelected: { color: C.primary },
  scarceDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.amber,
  },
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
  btn: {
    backgroundColor: C.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  btnText: { color: C.white, fontWeight: '700', fontSize: 15 },
});
