import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { MOODS, COLORS, RANK_COLORS } from '@par-tee/shared';

const API_URL = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:4000';

// Brand colors
const BRAND_GREEN = '#1B6B3A';
const BRAND_GOLD = '#FFD700';
const BRAND_BRONZE = '#CD7F32';

type Step = 'username' | 'profile' | 'celebration';
type MoodKey = (typeof MOODS)[number]['key'];

interface UsernameValidation {
  state: 'idle' | 'checking' | 'valid' | 'taken' | 'invalid';
}

// Confetti particle component
const ConfettiParticle = ({ delay }: { delay: number }) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 1200 + delay * 100,
      useNativeDriver: true,
    }).start();
  }, [animValue, delay]);

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 400],
  });

  const translateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [(delay % 2 === 0 ? -1 : 1) * (50 + delay * 20), 0],
  });

  const opacity = animValue.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [1, 1, 0],
  });

  const colors = [BRAND_GREEN, BRAND_GOLD, BRAND_BRONZE, '#4CAF50', '#87CEEB'];

  return (
    <Animated.View
      style={[
        styles.confettiDot,
        {
          transform: [{ translateY }, { translateX }],
          opacity,
          backgroundColor: colors[delay % colors.length],
        },
      ]}
    />
  );
};

export default function OnboardingScreen() {
  const { session } = useAuth();
  const [step, setStep] = useState<Step>('username');

  // Step 1: Username
  const [username, setUsername] = useState('');
  const [usernameValidation, setUsernameValidation] = useState<UsernameValidation>({
    state: 'idle',
  });
  const usernameCheckTimeout = useRef<NodeJS.Timeout>();

  // Step 2: Profile
  const [name, setName] = useState('');
  const [handicap, setHandicap] = useState('');
  const [bio, setBio] = useState('');
  const [selectedMoods, setSelectedMoods] = useState<MoodKey[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);

  // Step 3: Celebration
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pointsAnim = useRef(new Animated.Value(0)).current;

  // Initialize celebration animations
  useEffect(() => {
    if (step === 'celebration') {
      // Badge scales up
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Text fades in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: 300,
        useNativeDriver: true,
      }).start();

      // Points counter (0 → 0, stays at 0)
      Animated.timing(pointsAnim, {
        toValue: 0,
        duration: 1000,
        delay: 600,
        useNativeDriver: false,
      }).start();
    }
  }, [step]);

  // Username validation with debounce
  const validateUsername = (value: string) => {
    setUsername(value.toLowerCase());

    // Clear timeout
    if (usernameCheckTimeout.current) {
      clearTimeout(usernameCheckTimeout.current);
    }

    // Client-side validation
    const clientValid =
      value.length >= 3 &&
      value.length <= 20 &&
      /^[a-z][a-z0-9_]*$/.test(value.toLowerCase());

    if (!clientValid) {
      setUsernameValidation({
        state: value.length === 0 ? 'idle' : 'invalid',
      });
      return;
    }

    // Server-side check
    setUsernameValidation({ state: 'checking' });

    usernameCheckTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/v1/users/check-username/${value.toLowerCase()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token ?? ''}`,
          },
        });

        if (!res.ok) throw new Error('Check failed');

        const data = await res.json();
        setUsernameValidation({
          state: data.available ? 'valid' : 'taken',
        });
      } catch (err) {
        setUsernameValidation({ state: 'invalid' });
      }
    }, 300);
  };

  const toggleMood = (moodKey: MoodKey) => {
    setSelectedMoods((prev) =>
      prev.includes(moodKey) ? prev.filter((m) => m !== moodKey) : [...prev, moodKey]
    );
  };

  const handleContinueFromUsername = () => {
    if (usernameValidation.state !== 'valid') {
      Alert.alert('Invalid username', 'Please choose a valid, available username.');
      return;
    }
    setStep('profile');
  };

  const handleContinueFromProfile = async () => {
    if (!session) return;

    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }

    const handicapNum = handicap.trim() ? parseFloat(handicap.trim()) : null;
    if (handicapNum !== null && (isNaN(handicapNum) || handicapNum < 0 || handicapNum > 54)) {
      Alert.alert('Invalid handicap', 'Handicap must be between 0 and 54.');
      return;
    }

    setProfileLoading(true);

    try {
      const res = await fetch(`${API_URL}/v1/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          username: username.toLowerCase(),
          name: name.trim(),
          handicap: handicapNum,
          moodPreferences: selectedMoods.length > 0 ? selectedMoods : undefined,
          bio: bio.trim().length > 0 ? bio.trim() : undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body?.error?.message ?? 'Failed to create profile');
      }

      // Proceed to celebration
      setStep('celebration');
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not save profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const usernameIsValid = usernameValidation.state === 'valid';
  const nameIsValid = name.trim().length > 0;
  const bioLength = bio.length;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        scrollEnabled={step !== 'celebration'}
        bounces={false}
      >
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${((step === 'username' ? 1 : step === 'profile' ? 2 : 3) / 3) * 100}%` }]} />
        </View>

        {/* Screen 1: Choose Username */}
        {step === 'username' && (
          <View style={styles.screenContainer}>
            <Text style={styles.emoji}>🚩</Text>
            <Text style={styles.title}>Choose your username</Text>
            <Text style={styles.subtitle}>This is your @handle — other golfers will find you by it</Text>

            <View style={styles.usernameInputContainer}>
              <Text style={styles.usernamePrefix}>@</Text>
              <TextInput
                style={styles.usernameInput}
                placeholder="username"
                placeholderTextColor="#999"
                value={username}
                onChangeText={validateUsername}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={20}
              />
              {usernameValidation.state === 'checking' && (
                <ActivityIndicator color={BRAND_GREEN} size="small" />
              )}
              {usernameValidation.state === 'valid' && (
                <Text style={styles.validIcon}>✓</Text>
              )}
              {usernameValidation.state === 'taken' && (
                <Text style={styles.invalidIcon}>✕</Text>
              )}
              {usernameValidation.state === 'invalid' && username.length > 0 && (
                <Text style={styles.invalidIcon}>✕</Text>
              )}
            </View>

            {username.length > 0 && usernameValidation.state === 'invalid' && (
              <Text style={styles.errorText}>
                3-20 characters, start with letter, only a-z, 0-9, and _
              </Text>
            )}
            {usernameValidation.state === 'taken' && (
              <Text style={styles.errorText}>This username is taken. Try another!</Text>
            )}

            <Text style={styles.charCount}>
              {username.length}/20
            </Text>

            <TouchableOpacity
              style={[styles.primaryBtn, !usernameIsValid && styles.primaryBtnDisabled]}
              onPress={handleContinueFromUsername}
              disabled={!usernameIsValid}
            >
              <Text style={styles.primaryBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Screen 2: Profile Info */}
        {step === 'profile' && (
          <View style={styles.screenContainer}>
            <Text style={styles.emoji}>👤</Text>
            <Text style={styles.title}>Tell us about yourself</Text>
            <Text style={styles.subtitle}>Help the community know who you are</Text>

            {/* Name Input */}
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
            />

            {/* Handicap Input */}
            <Text style={styles.inputLabel}>Handicap (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 18.4"
              placeholderTextColor="#999"
              value={handicap}
              onChangeText={setHandicap}
              keyboardType="decimal-pad"
            />

            {/* Mood Preferences */}
            <Text style={styles.inputLabel}>Your golf moods</Text>
            <Text style={styles.moodsSubtitle}>Pick all that apply</Text>
            <View style={styles.moodsGrid}>
              {MOODS.map((mood) => {
                const selected = selectedMoods.includes(mood.key);
                return (
                  <TouchableOpacity
                    key={mood.key}
                    style={[styles.moodChip, selected && styles.moodChipSelected]}
                    onPress={() => toggleMood(mood.key)}
                  >
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    <Text style={[styles.moodLabel, selected && styles.moodLabelSelected]}>
                      {mood.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Bio Input */}
            <Text style={styles.inputLabel}>Bio (optional)</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder="Tell us about your golf style..."
              placeholderTextColor="#999"
              value={bio}
              onChangeText={setBio}
              maxLength={300}
              multiline
              numberOfLines={3}
            />
            <Text style={styles.charCount}>
              {bioLength}/300
            </Text>

            {/* Buttons */}
            <TouchableOpacity
              style={[styles.primaryBtn, !nameIsValid && styles.primaryBtnDisabled]}
              onPress={handleContinueFromProfile}
              disabled={profileLoading}
            >
              {profileLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>Create Profile</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setStep('username')}>
              <Text style={styles.secondaryBtnText}>← Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Screen 3: Bronze 1 Celebration */}
        {step === 'celebration' && (
          <View style={styles.celebrationContainer}>
            <Text style={styles.celebrationEmoji}>🎉</Text>

            {/* Badge */}
            <Animated.View
              style={[
                styles.badgeContainer,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <View style={styles.bronzeBadge}>
                <Text style={styles.badgeIcon}>🥉</Text>
              </View>
            </Animated.View>

            {/* Rank text */}
            <Animated.View style={{ opacity: fadeAnim }}>
              <Text style={styles.rankTitle}>Bronze 1</Text>
              <Text style={styles.rankSubtitle}>Welcome to the ranks!</Text>
            </Animated.View>

            {/* Confetti */}
            <View style={styles.confettiContainer} pointerEvents="none">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <ConfettiParticle key={i} delay={i} />
              ))}
            </View>

            {/* Points counter */}
            <Animated.View style={styles.pointsContainer}>
              <Text style={styles.pointsLabel}>Starting Points</Text>
              <Text style={styles.pointsValue}>0</Text>
            </Animated.View>

            {/* Description */}
            <Text style={styles.celebrationDesc}>
              You're starting as Bronze 1. Play rounds, win matches, and climb the ladder to unlock higher tiers and exclusive rewards!
            </Text>

            {/* CTA Button */}
            <TouchableOpacity
              style={styles.celebrationBtn}
              onPress={() => router.replace('/(tabs)')}
            >
              <Text style={styles.celebrationBtnText}>Let's go!</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    backgroundColor: '#fff',
  },

  // Progress bar
  progressContainer: {
    height: 3,
    backgroundColor: '#f0f0f0',
    borderRadius: 1.5,
    overflow: 'hidden',
    marginBottom: 32,
  },
  progressBar: {
    height: '100%',
    backgroundColor: BRAND_GREEN,
    borderRadius: 1.5,
  },

  // Common screen layout
  screenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 600,
  },

  emoji: {
    fontSize: 56,
    marginBottom: 20,
    textAlign: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },

  // Username screen styles
  usernameInputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingLeft: 16,
    paddingRight: 12,
    backgroundColor: '#fafafa',
    marginBottom: 12,
    minHeight: 52,
  },

  usernamePrefix: {
    fontSize: 18,
    fontWeight: '600',
    color: BRAND_GREEN,
    marginRight: 8,
  },

  usernameInput: {
    flex: 1,
    fontSize: 16,
    color: '#111',
    paddingVertical: 12,
  },

  validIcon: {
    fontSize: 18,
    color: '#4CAF50',
    marginLeft: 8,
    fontWeight: '700',
  },

  invalidIcon: {
    fontSize: 18,
    color: '#ef4444',
    marginLeft: 8,
    fontWeight: '700',
  },

  errorText: {
    fontSize: 13,
    color: '#ef4444',
    marginBottom: 12,
    width: '100%',
  },

  charCount: {
    fontSize: 12,
    color: '#999',
    alignSelf: 'flex-end',
    marginBottom: 20,
  },

  // Input styles
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 20,
    color: '#111',
    backgroundColor: '#fafafa',
  },

  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingVertical: 12,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },

  moodsSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },

  // Mood grid
  moodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
    width: '100%',
    justifyContent: 'flex-start',
  },

  moodChip: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 'auto',
  },

  moodChipSelected: {
    backgroundColor: BRAND_GREEN,
    borderColor: BRAND_GREEN,
  },

  moodEmoji: {
    fontSize: 18,
    marginBottom: 4,
  },

  moodLabel: {
    fontSize: 12,
    color: '#444',
    fontWeight: '500',
    textAlign: 'center',
  },

  moodLabelSelected: {
    color: '#fff',
    fontWeight: '600',
  },

  // Button styles
  primaryBtn: {
    width: '100%',
    backgroundColor: BRAND_GREEN,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: BRAND_GREEN,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },

  primaryBtnDisabled: {
    backgroundColor: '#a8d5be',
  },

  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  secondaryBtnText: {
    color: BRAND_GREEN,
    fontSize: 15,
    fontWeight: '600',
  },

  // Celebration screen styles
  celebrationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 600,
    paddingVertical: 40,
  },

  celebrationEmoji: {
    fontSize: 48,
    marginBottom: 24,
  },

  badgeContainer: {
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bronzeBadge: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFF8F0',
    borderWidth: 3,
    borderColor: BRAND_BRONZE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BRAND_BRONZE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },

  badgeIcon: {
    fontSize: 64,
  },

  rankTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: BRAND_BRONZE,
    textAlign: 'center',
    marginBottom: 8,
  },

  rankSubtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    marginBottom: 32,
  },

  confettiContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },

  confettiDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
    alignSelf: 'center',
  },

  pointsContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    minWidth: 180,
  },

  pointsLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },

  pointsValue: {
    fontSize: 32,
    fontWeight: '800',
    color: BRAND_GOLD,
  },

  celebrationDesc: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 12,
  },

  celebrationBtn: {
    backgroundColor: BRAND_GREEN,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: BRAND_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  celebrationBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
