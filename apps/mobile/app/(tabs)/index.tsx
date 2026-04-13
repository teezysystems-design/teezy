/**
 * Discover Screen — Sections 07 + 19
 *
 * - Map / list view toggle
 * - Mood tag multi-select filter bar (tag-based filtering only)
 * - Course cards: name, city, distance, mood tags, next available tee time
 * - Navigates to /course/[courseId] for full detail + booking
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
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

interface CourseCard {
  id: string;
  name: string;
  city: string;
  state: string;
  distanceMiles: number | null;
  moodTags: string[];
  holeCount: number;
  par: number;
  nextTeeTime: string | null;
  nextTeeTimeId: string | null;
  latitude: number | null;
  longitude: number | null;
}

// ─── Course list card ────────────────────────────────────────────────────────

function CourseListCard({ course, onPress }: { course: CourseCard; onPress: () => void }) {
  const nextTime = course.nextTeeTime
    ? new Date(course.nextTeeTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : null;
  const nextDate = course.nextTeeTime
    ? new Date(course.nextTeeTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : null;

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.85}>
      <View style={s.cardHeader}>
        <View style={s.cardTitleWrap}>
          <Text style={s.cardName} numberOfLines={1}>{course.name}</Text>
          <Text style={s.cardLocation}>{course.city}, {course.state}</Text>
        </View>
        {course.distanceMiles != null && (
          <View style={s.distancePill}>
            <Text style={s.distanceText}>{course.distanceMiles.toFixed(1)} mi</Text>
          </View>
        )}
      </View>

      {course.moodTags.length > 0 && (
        <View style={s.tagsRow}>
          {course.moodTags.slice(0, 4).map((tag) => {
            const moodObj = MOODS.find((m) => m.key === tag);
            return (
              <View key={tag} style={s.tag}>
                <Text style={s.tagText}>{moodObj?.emoji ?? '⛳'} {tag}</Text>
              </View>
            );
          })}
        </View>
      )}

      <View style={s.cardFooter}>
        <View style={s.nextTimeWrap}>
          {nextTime ? (
            <>
              <Text style={s.nextTimeLabel}>Next available</Text>
              <Text style={s.nextTimeText}>{nextDate} · {nextTime}</Text>
            </>
          ) : (
            <Text style={s.noTimesText}>No upcoming tee times</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Map view ────────────────────────────────────────────────────────────────

function MapViewContent({ courses, onCoursePress }: { courses: CourseCard[]; onCoursePress: (c: CourseCard) => void }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [RNMap, setRNMap] = useState<any>(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') { setMapError(true); return; }
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      setRNMap(require('react-native-maps'));
    } catch {
      setMapError(true);
    }
  }, []);

  if (mapError) {
    return (
      <View style={s.mapFallback}>
        <Text style={s.mapFallbackEmoji}>🗺️</Text>
        <Text style={s.mapFallbackTitle}>Map unavailable</Text>
        <Text style={s.mapFallbackSub}>Map view requires a native build. Use list view to browse courses.</Text>
      </View>
    );
  }

  if (!RNMap) {
    return <View style={s.centered}><ActivityIndicator color={C.primary} /></View>;
  }

  const MapComponent = RNMap.default;
  const Marker = RNMap.Marker;
  const withCoords = courses.filter((c) => c.latitude != null && c.longitude != null);
  const center = withCoords[0]
    ? { latitude: withCoords[0].latitude!, longitude: withCoords[0].longitude! }
    : { latitude: 37.09, longitude: -95.71 };

  return (
    <MapComponent
      style={s.map}
      initialRegion={{ ...center, latitudeDelta: 0.5, longitudeDelta: 0.5 }}
    >
      {withCoords.map((course) => (
        <Marker
          key={course.id}
          coordinate={{ latitude: course.latitude!, longitude: course.longitude! }}
          onPress={() => onCoursePress(course)}
        >
          <View style={s.mapPin}>
            <Text style={s.mapPinText}>⛳</Text>
          </View>
        </Marker>
      ))}
    </MapComponent>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function DiscoverScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const { discoverView, setDiscoverView, selectedMood, setSelectedMood } = useAppStore();
  const [courses, setCourses] = useState<CourseCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCourses = useCallback(
    async (silent = false) => {
      if (!session) return;
      if (!silent) setLoading(true);
      Keyboard.dismiss();
      try {
        const moodParam = selectedMood === 'all' ? '' : `&mood=${selectedMood}`;
        const res = await fetch(`${API_URL}/v1/courses?includeNextTeeTime=true${moodParam}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) throw new Error('fetch failed');
        const json = await res.json();
        setCourses(json.data ?? []);
      } catch {
        setCourses([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [session, selectedMood]
  );

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const onRefresh = () => { setRefreshing(true); fetchCourses(true); };
  const handleCoursePress = (course: CourseCard) => router.push(`/course/${course.id}`);

  // Mood chips: "All" + all 12 moods
  const moodChips = [
    { key: 'all' as const, label: '✨ All' },
    ...MOODS.map((m) => ({ key: m.key, label: `${m.emoji} ${m.label}` })),
  ];

  return (
    <View style={s.screen}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Discover</Text>
          <Text style={s.headerSub}>Find courses that match your mood</Text>
        </View>
        <View style={s.viewToggle}>
          <TouchableOpacity
            style={[s.toggleBtn, discoverView === 'list' && s.toggleBtnActive]}
            onPress={() => setDiscoverView('list')}
          >
            <Text style={[s.toggleBtnText, discoverView === 'list' && s.toggleBtnTextActive]}>☰ List</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.toggleBtn, discoverView === 'map' && s.toggleBtnActive]}
            onPress={() => setDiscoverView('map')}
          >
            <Text style={[s.toggleBtnText, discoverView === 'map' && s.toggleBtnTextActive]}>🗺 Map</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Mood filter */}
      <View style={s.filterBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={moodChips}
          keyExtractor={(item) => item.key}
          contentContainerStyle={s.filterList}
          renderItem={({ item }) => {
            const active = selectedMood === item.key;
            return (
              <TouchableOpacity
                style={[s.chip, active && s.chipActive]}
                onPress={() => setSelectedMood(item.key as any)}
                activeOpacity={0.7}
              >
                <Text style={[s.chipText, active && s.chipTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Content */}
      {loading ? (
        <View style={s.centered}><ActivityIndicator size="large" color={C.primary} /></View>
      ) : discoverView === 'map' ? (
        <MapViewContent courses={courses} onCoursePress={handleCoursePress} />
      ) : courses.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>⛳</Text>
          <Text style={s.emptyTitle}>No courses found</Text>
          <Text style={s.emptySub}>
            {selectedMood === 'all'
              ? 'Courses will appear here once added.'
              : 'Try a different mood to see more options.'}
          </Text>
          {selectedMood !== 'all' && (
            <TouchableOpacity style={s.clearBtn} onPress={() => setSelectedMood('all' as any)}>
              <Text style={s.clearBtnText}>Show all courses</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CourseListCard course={item} onPress={() => handleCoursePress(item)} />
          )}
          contentContainerStyle={s.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
          }
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.gray50 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    backgroundColor: C.white,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: C.gray900 },
  headerSub: { fontSize: 13, color: C.gray600, marginTop: 2 },

  viewToggle: { flexDirection: 'row', borderRadius: 10, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: C.white },
  toggleBtnActive: { backgroundColor: C.primary },
  toggleBtnText: { fontSize: 13, color: C.gray600, fontWeight: '600' },
  toggleBtnTextActive: { color: C.white },

  filterBar: { backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border },
  filterList: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, borderColor: C.border, backgroundColor: C.gray50,
  },
  chipActive: { backgroundColor: C.primary, borderColor: C.primary },
  chipText: { fontSize: 13, color: C.gray600, fontWeight: '500' },
  chipTextActive: { color: C.white, fontWeight: '600' },

  list: { padding: 16 },

  card: { backgroundColor: C.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  cardTitleWrap: { flex: 1, marginRight: 8 },
  cardName: { fontSize: 16, fontWeight: '700', color: C.gray900 },
  cardLocation: { fontSize: 13, color: C.gray600, marginTop: 2 },
  distancePill: { backgroundColor: C.gray100, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  distanceText: { fontSize: 12, color: C.gray600, fontWeight: '600' },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tag: { backgroundColor: C.gray100, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { fontSize: 11, color: C.gray600, textTransform: 'capitalize' },

  cardFooter: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  nextTimeWrap: { flex: 1 },
  nextTimeLabel: { fontSize: 11, color: C.gray400, fontWeight: '600', marginBottom: 2 },
  nextTimeText: { fontSize: 13, color: C.gray900, fontWeight: '600' },
  noTimesText: { fontSize: 13, color: C.gray400 },

  map: { flex: 1 },
  mapPin: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: C.white,
    borderWidth: 2, borderColor: C.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, elevation: 3,
  },
  mapPinText: { fontSize: 18 },
  mapFallback: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: C.gray50 },
  mapFallbackEmoji: { fontSize: 56, marginBottom: 16 },
  mapFallbackTitle: { fontSize: 20, fontWeight: '700', color: C.gray900, marginBottom: 8 },
  mapFallbackSub: { fontSize: 14, color: C.gray600, textAlign: 'center', lineHeight: 20 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: C.gray900, marginBottom: 8 },
  emptySub: { fontSize: 15, color: C.gray600, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  clearBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: C.primary, borderRadius: 10 },
  clearBtnText: { color: C.white, fontWeight: '600', fontSize: 14 },
});
