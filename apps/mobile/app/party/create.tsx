import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import type { GameMode } from '@par-tee/shared/types';

const API_URL = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:4000';

const COLORS = {
  primary: '#1B6B3A',
  primaryLight: '#e8f5ee',
  white: '#fff',
  gray50: '#f7f7f7',
  gray100: '#f0f0f0',
  gray600: '#666',
  gray900: '#111',
  border: '#e0e0e0',
};

const GAME_MODES: { value: GameMode; label: string; emoji: string; desc: string }[] = [
  { value: 'casual', label: 'Casual', emoji: '😎', desc: 'Relaxed round — no ranking impact' },
  { value: 'solo', label: 'Solo', emoji: '🏌️', desc: 'Track your own score, earn ranking points' },
  { value: 'match_1v1', label: '1v1 Match', emoji: '⚔️', desc: 'Head-to-head, 1.5× ranking points' },
  { value: 'match_2v2', label: '2v2 Scramble', emoji: '🤝', desc: 'Team format, best ball — 1.3× points' },
  { value: 'tournament', label: 'Tournament', emoji: '🏆', desc: 'Full competitive mode — 2× points' },
];

export default function CreatePartyScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { session } = useAuth();
  const router = useRouter();

  const [gameMode, setGameMode] = useState<GameMode>('solo');
  const [loading, setLoading] = useState(false);

  const createParty = async () => {
    if (!session || !bookingId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/v1/parties`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId, gameMode }),
      });
      const json = await res.json();
      if (!res.ok) {
        Alert.alert('Error', json.error?.message ?? 'Could not create party');
        return;
      }
      router.replace({ pathname: '/party/[partyId]/index', params: { partyId: json.data.id } });
    } catch {
      Alert.alert('Error', 'Could not create party. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Start a Party</Text>
      <Text style={styles.headingSub}>Choose how you want to play today</Text>

      <Text style={styles.sectionTitle}>Game Mode</Text>
      <Text style={styles.sectionSub}>This determines how ranking points are calculated</Text>
      <View style={styles.optionGroup}>
        {GAME_MODES.map((m) => (
          <TouchableOpacity
            key={m.value}
            style={[styles.optionCard, gameMode === m.value && styles.optionCardSelected]}
            onPress={() => setGameMode(m.value)}
            activeOpacity={0.8}
          >
            <Text style={styles.optionEmoji}>{m.emoji}</Text>
            <View style={styles.optionText}>
              <Text style={[styles.optionLabel, gameMode === m.value && styles.optionLabelSelected]}>
                {m.label}
              </Text>
              <Text style={styles.optionDesc}>{m.desc}</Text>
            </View>
            {gameMode === m.value && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>

      {/* Points multiplier info */}
      {gameMode !== 'casual' && (
        <View style={styles.pointsInfo}>
          <Text style={styles.pointsIcon}>⭐</Text>
          <Text style={styles.pointsText}>
            {gameMode === 'solo' && '10 pts/hole + under-par bonuses'}
            {gameMode === 'match_1v1' && '1.5× multiplier — 15 pts/hole + bonuses'}
            {gameMode === 'match_2v2' && '1.3× multiplier — 13 pts/hole + bonuses'}
            {gameMode === 'tournament' && '2× multiplier — 20 pts/hole + bonuses'}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.createBtn, loading && { opacity: 0.6 }]}
        onPress={createParty}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.createBtnText}>Create Party →</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.gray50 },
  content: { padding: 20, paddingBottom: 48 },
  heading: { fontSize: 24, fontWeight: '800', color: COLORS.gray900, marginBottom: 4 },
  headingSub: { fontSize: 15, color: COLORS.gray600, marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.gray900, marginBottom: 4 },
  sectionSub: { fontSize: 14, color: COLORS.gray600, marginBottom: 16 },
  optionGroup: { gap: 10 },
  optionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: 12,
  },
  optionCardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  optionEmoji: { fontSize: 28 },
  optionText: { flex: 1 },
  optionLabel: { fontSize: 16, fontWeight: '600', color: COLORS.gray900 },
  optionLabelSelected: { color: COLORS.primary },
  optionDesc: { fontSize: 13, color: COLORS.gray600, marginTop: 2 },
  checkmark: { fontSize: 18, color: COLORS.primary, fontWeight: '700' },
  pointsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF0',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  pointsIcon: { fontSize: 20 },
  pointsText: { flex: 1, fontSize: 13, color: '#B8860B', fontWeight: '500' },
  createBtn: {
    marginTop: 32,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  createBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});
