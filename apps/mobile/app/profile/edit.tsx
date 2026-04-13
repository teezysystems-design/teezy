/**
 * Profile Edit Screen — Edit profile details
 *
 * Layout:
 *   1. Header — "Edit Profile" title + back button + save button
 *   2. Avatar Section — avatar circle with initials + "Change photo" button
 *   3. Form Fields:
 *      - Display Name (max 80 chars)
 *      - Bio (max 300 chars with counter)
 *      - Handicap (0-54, decimal)
 *      - Home Course (disabled, placeholder "Coming soon")
 *      - Golf Moods (toggleable chips)
 *      - Privacy Toggle (switch with explanation)
 *   4. Bottom Buttons — Save Changes + Cancel
 */

import { useCallback, useEffect, useState } from 'react';
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
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { MOODS } from '@par-tee/shared';
import type { Mood } from '@par-tee/shared';

const API_URL = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:4000';
const PRIMARY_GREEN = '#1B6B3A';

interface UserProfile {
  id: string;
  name: string;
  displayName: string | null;
  email: string;
  bio: string | null;
  isPrivate: boolean;
  handicap: number | null;
  moodPreferences: Mood[];
  avatarUrl: string | null;
  homeCourseId: string | null;
}

export default function EditProfileScreen() {
  const { session } = useAuth();
  const router = useRouter();

  // Loading & saving states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form field states
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [handicap, setHandicap] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedMoods, setSelectedMoods] = useState<Mood[]>([]);

  // Avatar initial for display
  const [avatarInitial, setAvatarInitial] = useState('?');

  // Load current profile data on mount
  useEffect(() => {
    if (!session) return;
    fetchProfileData();
  }, [session]);

  const fetchProfileData = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/v1/users/me`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to load profile');
      }

      const json = await res.json();
      const profile: UserProfile = json.data;

      // Pre-populate form fields
      setDisplayName(profile.displayName || profile.name || '');
      setBio(profile.bio || '');
      setHandicap(profile.handicap ? String(profile.handicap) : '');
      setIsPrivate(profile.isPrivate || false);
      setSelectedMoods((profile.moodPreferences as Mood[]) || []);
      setAvatarInitial((profile.displayName || profile.name || '?').charAt(0).toUpperCase());
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not load profile');
    } finally {
      setLoading(false);
    }
  }, [session]);

  const toggleMood = (mood: Mood) => {
    setSelectedMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  };

  const validateForm = (): boolean => {
    if (!displayName.trim()) {
      Alert.alert('Validation Error', 'Display name is required.');
      return false;
    }

    if (displayName.trim().length > 80) {
      Alert.alert('Validation Error', 'Display name must be 80 characters or less.');
      return false;
    }

    if (bio.length > 300) {
      Alert.alert('Validation Error', 'Bio must be 300 characters or less.');
      return false;
    }

    // Validate handicap if provided
    if (handicap.trim()) {
      const handicapNum = parseFloat(handicap.trim());
      if (isNaN(handicapNum) || handicapNum < 0 || handicapNum > 54) {
        Alert.alert('Validation Error', 'Handicap must be a number between 0 and 54.');
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    if (!session) {
      Alert.alert('Error', 'Not authenticated.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        displayName: displayName.trim(),
        bio: bio.trim() || null,
        handicap: handicap.trim() ? parseFloat(handicap.trim()) : null,
        isPrivate,
        moodPreferences: selectedMoods,
      };

      const res = await fetch(`${API_URL}/v1/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData?.error?.message || 'Failed to save profile'
        );
      }

      Alert.alert('Success', 'Profile updated successfully.');
      router.back();
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={PRIMARY_GREEN} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} scrollEnabled={true}>
        {/* ─── Header ─────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ─── Avatar Section ─────────────────────────────────────────── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{avatarInitial}</Text>
          </View>
          <TouchableOpacity style={styles.changePhotoButton} disabled>
            <Text style={styles.changePhotoButtonText}>📷 Change photo</Text>
          </TouchableOpacity>
          <Text style={styles.changePhotoHint}>(coming soon)</Text>
        </View>

        {/* ─── Form Fields ────────────────────────────────────────────── */}

        {/* Display Name */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor="#9ca3af"
            value={displayName}
            onChangeText={setDisplayName}
            maxLength={80}
            autoCapitalize="words"
          />
          <Text style={styles.charCount}>{displayName.length}/80</Text>
        </View>

        {/* Bio */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            placeholder="Tell golfers about yourself..."
            placeholderTextColor="#9ca3af"
            value={bio}
            onChangeText={setBio}
            maxLength={300}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{bio.length}/300</Text>
        </View>

        {/* Handicap */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Handicap</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 18.4"
            placeholderTextColor="#9ca3af"
            value={handicap}
            onChangeText={setHandicap}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Home Course (disabled placeholder) */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Home Course</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            placeholder="Coming soon"
            placeholderTextColor="#d1d5db"
            editable={false}
            value=""
          />
        </View>

        {/* Golf Moods */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Golf Moods</Text>
          <View style={styles.moodsGrid}>
            {MOODS.map((mood) => (
              <TouchableOpacity
                key={mood.key}
                style={[
                  styles.moodChip,
                  selectedMoods.includes(mood.key) && styles.moodChipSelected,
                ]}
                onPress={() => toggleMood(mood.key)}
              >
                <Text
                  style={[
                    styles.moodChipText,
                    selectedMoods.includes(mood.key) && styles.moodChipTextSelected,
                  ]}
                >
                  {`${mood.emoji} ${mood.label}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Privacy Toggle */}
        <View style={styles.formGroup}>
          <View style={styles.privacyRow}>
            <View style={styles.privacyTextContainer}>
              <Text style={styles.label}>Private Profile</Text>
              <Text style={styles.privacyHint}>
                Only approved friends can see your stats and rounds
              </Text>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: '#e5e7eb', true: PRIMARY_GREEN }}
              thumbColor="#fff"
              style={styles.switch}
            />
          </View>
        </View>

        {/* ─── Bottom Buttons ─────────────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.primaryButton, saving && styles.primaryButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        {/* Bottom padding for keyboard */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },

  // ─── Header ──────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 8,
  },
  backButton: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIMARY_GREEN,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: PRIMARY_GREEN,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },

  // ─── Avatar Section ──────────────────────────────────────────────────
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: PRIMARY_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: '800',
    color: '#fff',
  },
  changePhotoButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  changePhotoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  changePhotoHint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 6,
  },

  // ─── Form Groups ─────────────────────────────────────────────────────
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: '#111',
    backgroundColor: '#f9fafb',
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 11,
  },
  disabledInput: {
    backgroundColor: '#f3f4f6',
    color: '#9ca3af',
  },
  charCount: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'right',
  },

  // ─── Moods Grid ──────────────────────────────────────────────────────
  moodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  moodChipSelected: {
    backgroundColor: PRIMARY_GREEN,
    borderColor: PRIMARY_GREEN,
  },
  moodChipText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  moodChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },

  // ─── Privacy Row ─────────────────────────────────────────────────────
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  privacyTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  privacyHint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    lineHeight: 16,
  },
  switch: {
    marginLeft: 8,
  },

  // ─── Buttons ─────────────────────────────────────────────────────────
  primaryButton: {
    backgroundColor: PRIMARY_GREEN,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: PRIMARY_GREEN,
  },
});
