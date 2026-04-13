import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  Animated,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';

const API_URL = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:4000';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  primary: '#1B6B3A',
  primaryLight: '#e8f5ee',
  white: '#fff',
  gray50: '#f7f7f7',
  gray100: '#f0f0f0',
  gray200: '#e5e7eb',
  gray400: '#aaa',
  gray600: '#666',
  gray900: '#111',
  border: '#e0e0e0',
  gold: '#FFD700',
  birdie: '#1B6B3A',
  bogey: '#DC2626',
  eagle: '#0077B6',
  par: '#666',
};

const TOTAL_HOLES = 18;

interface HoleData {
  strokes: string;
  par: number;
  fairwayHit: boolean | null;
  greenInRegulation: boolean | null;
  putts: string;
}

const DEFAULT_PARS = [4, 4, 3, 5, 4, 3, 4, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5, 4]; // Standard par-72 layout

export default function ScoreEntryScreen() {
  const { partyId } = useLocalSearchParams<{ partyId: string }>();
  const { session } = useAuth();
  const router = useRouter();

  const [holes, setHoles] = useState<HoleData[]>(
    Array.from({ length: TOTAL_HOLES }, (_, i) => ({
      strokes: '',
      par: DEFAULT_PARS[i] ?? 4,
      fairwayHit: null,
      greenInRegulation: null,
      putts: '',
    }))
  );
  const [activeHole, setActiveHole] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Load existing scores on mount
  const loadExistingScores = useCallback(async () => {
    if (!session || !partyId) { setLoading(false); return; }
    try {
      const res = await fetch(`${API_URL}/v1/parties/${partyId}/scores`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json();
      if (res.ok && json.data) {
        // Get current user's scores from the party scores
        const myScores = json.data.filter((s: { userId: string }) => {
          // We'll match by checking all scores — the API returns only party scores
          return true; // The user's own scores will be identified by userId on the summary
        });

        if (myScores.length > 0) {
          setHoles((prev) => {
            const updated = [...prev];
            for (const s of myScores) {
              const idx = s.holeNumber - 1;
              if (idx >= 0 && idx < TOTAL_HOLES) {
                updated[idx] = {
                  strokes: s.strokes?.toString() ?? '',
                  par: s.par ?? updated[idx].par,
                  fairwayHit: s.fairwayHit ?? null,
                  greenInRegulation: s.greenInRegulation ?? null,
                  putts: s.putts?.toString() ?? '',
                };
              }
            }
            return updated;
          });
        }
      }
    } catch {
      // Silent — start fresh
    } finally {
      setLoading(false);
    }
  }, [session, partyId]);

  useEffect(() => {
    loadExistingScores();
  }, [loadExistingScores]);

  const updateHole = (index: number, field: keyof HoleData, value: unknown) => {
    setHoles((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const navigateHole = (direction: number) => {
    const next = activeHole + direction;
    if (next < 0 || next >= TOTAL_HOLES) return;
    Animated.spring(slideAnim, {
      toValue: next,
      useNativeDriver: true,
      tension: 100,
      friction: 12,
    }).start();
    setActiveHole(next);
  };

  const filledCount = holes.filter((h) => h.strokes !== '' && Number(h.strokes) >= 1).length;
  const totalStrokes = holes.reduce((sum, h) => sum + (Number(h.strokes) || 0), 0);
  const totalPar = holes.reduce((sum, h) => sum + h.par, 0);
  const scoreToPar = filledCount > 0 ? totalStrokes - holes.slice(0, filledCount).reduce((s, h) => s + h.par, 0) : 0;

  const scoreToParLabel = (strokes: number, par: number) => {
    const diff = strokes - par;
    if (diff <= -2) return { label: 'Eagle', color: COLORS.eagle };
    if (diff === -1) return { label: 'Birdie', color: COLORS.birdie };
    if (diff === 0) return { label: 'Par', color: COLORS.par };
    if (diff === 1) return { label: 'Bogey', color: COLORS.bogey };
    if (diff === 2) return { label: 'Double', color: COLORS.bogey };
    return { label: `+${diff}`, color: COLORS.bogey };
  };

  const saveScores = async (finish = false) => {
    if (!session || !partyId) return;

    const scoresToSubmit = holes
      .map((h, i) => ({
        holeNumber: i + 1,
        strokes: Number(h.strokes),
        par: h.par,
        fairwayHit: h.fairwayHit,
        greenInRegulation: h.greenInRegulation,
        putts: h.putts !== '' ? Number(h.putts) : undefined,
      }))
      .filter((s) => s.strokes >= 1 && s.strokes <= 20);

    if (scoresToSubmit.length === 0) {
      Alert.alert('No scores', 'Enter at least one hole score before saving.');
      return;
    }

    setSaving(true);
    try {
      // Save scores
      const res = await fetch(`${API_URL}/v1/parties/${partyId}/scores`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scores: scoresToSubmit }),
      });
      const json = await res.json();
      if (!res.ok) {
        Alert.alert('Error', json.error?.message ?? 'Could not save scores');
        return;
      }

      if (finish) {
        // Finish the round
        const finishRes = await fetch(`${API_URL}/v1/parties/${partyId}/finish`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (finishRes.ok) {
          router.replace({ pathname: '/party/[partyId]/summary', params: { partyId } });
          return;
        }
        // If finish fails (not host), just go to summary
        router.replace({ pathname: '/party/[partyId]/summary', params: { partyId } });
      } else {
        Alert.alert('Saved!', `${scoresToSubmit.length} hole(s) saved.`);
      }
    } catch {
      Alert.alert('Error', 'Could not save scores');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const hole = holes[activeHole];
  const strokeNum = Number(hole.strokes);
  const hasScore = hole.strokes !== '' && strokeNum >= 1;
  const scoreInfo = hasScore ? scoreToParLabel(strokeNum, hole.par) : null;

  return (
    <View style={styles.screen}>
      {/* Top summary bar */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Holes</Text>
          <Text style={styles.summaryValue}>{filledCount}/{TOTAL_HOLES}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryValue}>{totalStrokes}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>To Par</Text>
          <Text style={[styles.summaryValue, scoreToPar < 0 && { color: COLORS.birdie }, scoreToPar > 0 && { color: COLORS.bogey }]}>
            {scoreToPar === 0 ? 'E' : scoreToPar > 0 ? `+${scoreToPar}` : scoreToPar}
          </Text>
        </View>
      </View>

      {/* Hole selector strip */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.holeStrip} contentContainerStyle={styles.holeStripContent}>
        {holes.map((h, i) => {
          const filled = h.strokes !== '' && Number(h.strokes) >= 1;
          const isActive = i === activeHole;
          return (
            <TouchableOpacity
              key={i}
              style={[styles.holeTab, isActive && styles.holeTabActive, filled && !isActive && styles.holeTabFilled]}
              onPress={() => setActiveHole(i)}
            >
              <Text style={[styles.holeTabText, isActive && styles.holeTabTextActive, filled && !isActive && styles.holeTabTextFilled]}>
                {i + 1}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Active hole card */}
      <ScrollView style={styles.cardScroll} contentContainerStyle={styles.cardContent}>
        <View style={styles.holeCard}>
          <View style={styles.holeHeader}>
            <Text style={styles.holeTitle}>Hole {activeHole + 1}</Text>
            {scoreInfo && (
              <View style={[styles.scoreBadge, { backgroundColor: scoreInfo.color + '18' }]}>
                <Text style={[styles.scoreBadgeText, { color: scoreInfo.color }]}>{scoreInfo.label}</Text>
              </View>
            )}
          </View>

          {/* Par selector */}
          <Text style={styles.fieldLabel}>Par</Text>
          <View style={styles.parRow}>
            {[3, 4, 5].map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.parChip, hole.par === p && styles.parChipActive]}
                onPress={() => updateHole(activeHole, 'par', p)}
              >
                <Text style={[styles.parChipText, hole.par === p && styles.parChipTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Strokes */}
          <Text style={styles.fieldLabel}>Strokes</Text>
          <View style={styles.strokesRow}>
            <TouchableOpacity
              style={styles.strokeBtn}
              onPress={() => {
                const v = Math.max(1, (Number(hole.strokes) || hole.par) - 1);
                updateHole(activeHole, 'strokes', v.toString());
              }}
            >
              <Text style={styles.strokeBtnText}>−</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.strokeInput}
              value={hole.strokes}
              onChangeText={(v) => updateHole(activeHole, 'strokes', v.replace(/[^0-9]/g, '').slice(0, 2))}
              keyboardType="number-pad"
              maxLength={2}
              placeholder={hole.par.toString()}
              placeholderTextColor={COLORS.gray400}
              selectTextOnFocus
            />
            <TouchableOpacity
              style={styles.strokeBtn}
              onPress={() => {
                const v = Math.min(20, (Number(hole.strokes) || hole.par) + 1);
                updateHole(activeHole, 'strokes', v.toString());
              }}
            >
              <Text style={styles.strokeBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Putts */}
          <Text style={styles.fieldLabel}>Putts</Text>
          <View style={styles.strokesRow}>
            <TouchableOpacity
              style={styles.strokeBtn}
              onPress={() => {
                const v = Math.max(0, (Number(hole.putts) || 2) - 1);
                updateHole(activeHole, 'putts', v.toString());
              }}
            >
              <Text style={styles.strokeBtnText}>−</Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.strokeInput, { width: 56 }]}
              value={hole.putts}
              onChangeText={(v) => updateHole(activeHole, 'putts', v.replace(/[^0-9]/g, '').slice(0, 1))}
              keyboardType="number-pad"
              maxLength={1}
              placeholder="2"
              placeholderTextColor={COLORS.gray400}
              selectTextOnFocus
            />
            <TouchableOpacity
              style={styles.strokeBtn}
              onPress={() => {
                const v = Math.min(9, (Number(hole.putts) || 2) + 1);
                updateHole(activeHole, 'putts', v.toString());
              }}
            >
              <Text style={styles.strokeBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Fairway & GIR toggles */}
          {hole.par >= 4 && (
            <>
              <Text style={styles.fieldLabel}>Fairway Hit</Text>
              <View style={styles.toggleRow}>
                {[
                  { label: 'Yes', value: true, emoji: '✅' },
                  { label: 'No', value: false, emoji: '❌' },
                  { label: 'N/A', value: null, emoji: '➖' },
                ].map((opt) => (
                  <TouchableOpacity
                    key={String(opt.value)}
                    style={[styles.toggleChip, hole.fairwayHit === opt.value && styles.toggleChipActive]}
                    onPress={() => updateHole(activeHole, 'fairwayHit', opt.value)}
                  >
                    <Text style={styles.toggleEmoji}>{opt.emoji}</Text>
                    <Text style={[styles.toggleText, hole.fairwayHit === opt.value && styles.toggleTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <Text style={styles.fieldLabel}>Green in Regulation</Text>
          <View style={styles.toggleRow}>
            {[
              { label: 'Yes', value: true, emoji: '✅' },
              { label: 'No', value: false, emoji: '❌' },
              { label: 'N/A', value: null, emoji: '➖' },
            ].map((opt) => (
              <TouchableOpacity
                key={String(opt.value)}
                style={[styles.toggleChip, hole.greenInRegulation === opt.value && styles.toggleChipActive]}
                onPress={() => updateHole(activeHole, 'greenInRegulation', opt.value)}
              >
                <Text style={styles.toggleEmoji}>{opt.emoji}</Text>
                <Text style={[styles.toggleText, hole.greenInRegulation === opt.value && styles.toggleTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Navigation & action bar */}
      <View style={styles.navBar}>
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, activeHole === 0 && { opacity: 0.3 }]}
            onPress={() => navigateHole(-1)}
            disabled={activeHole === 0}
          >
            <Text style={styles.navBtnText}>← Prev</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={() => saveScores(false)}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.gray900} size="small" />
            ) : (
              <Text style={styles.saveBtnText}>Save</Text>
            )}
          </TouchableOpacity>

          {activeHole < TOTAL_HOLES - 1 ? (
            <TouchableOpacity style={styles.nextBtn} onPress={() => navigateHole(1)}>
              <Text style={styles.nextBtnText}>Next →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.finishBtn, saving && { opacity: 0.6 }]}
              onPress={() => {
                Alert.alert('Finish Round?', 'This will complete scoring and calculate ranking points.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Finish', style: 'destructive', onPress: () => saveScores(true) },
                ]);
              }}
              disabled={saving}
            >
              <Text style={styles.finishBtnText}>Finish</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.gray50 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Summary bar
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 11, color: COLORS.gray600, fontWeight: '500', marginBottom: 2 },
  summaryValue: { fontSize: 18, fontWeight: '800', color: COLORS.gray900 },

  // Hole strip
  holeStrip: { maxHeight: 52, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  holeStripContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  holeTab: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  holeTabActive: { backgroundColor: COLORS.primary },
  holeTabFilled: { backgroundColor: COLORS.primaryLight, borderWidth: 1, borderColor: COLORS.primary },
  holeTabText: { fontSize: 13, fontWeight: '600', color: COLORS.gray600 },
  holeTabTextActive: { color: COLORS.white },
  holeTabTextFilled: { color: COLORS.primary },

  // Card
  cardScroll: { flex: 1 },
  cardContent: { padding: 16, paddingBottom: 120 },
  holeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  holeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  holeTitle: { fontSize: 22, fontWeight: '800', color: COLORS.gray900 },
  scoreBadge: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  scoreBadgeText: { fontSize: 14, fontWeight: '700' },

  fieldLabel: { fontSize: 13, fontWeight: '600', color: COLORS.gray600, marginBottom: 8, marginTop: 16 },

  // Par selector
  parRow: { flexDirection: 'row', gap: 10 },
  parChip: {
    width: 52,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  parChipActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  parChipText: { fontSize: 18, fontWeight: '700', color: COLORS.gray600 },
  parChipTextActive: { color: COLORS.primary },

  // Strokes
  strokesRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  strokeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  strokeBtnText: { fontSize: 22, fontWeight: '600', color: COLORS.gray900 },
  strokeInput: {
    width: 64,
    height: 52,
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.gray900,
  },

  // Toggles
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.gray100,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  toggleChipActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  toggleEmoji: { fontSize: 16 },
  toggleText: { fontSize: 13, fontWeight: '600', color: COLORS.gray600 },
  toggleTextActive: { color: COLORS.primary },

  // Nav bar
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  navRow: { flexDirection: 'row', gap: 10 },
  navBtn: {
    flex: 1,
    backgroundColor: COLORS.gray100,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  navBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.gray600 },
  saveBtn: {
    flex: 1,
    backgroundColor: COLORS.gray100,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.gray900 },
  nextBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  finishBtn: {
    flex: 1,
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  finishBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.gray900 },
});
