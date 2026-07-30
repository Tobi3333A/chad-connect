import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Chip } from '@/components/ui/chip';
import { useAuth } from '@/contexts/auth-context';
import { completeOnboarding } from '@/services/auth';
import type { NeedType } from '@/types';
import { NEED_LABELS, Palette, Spacing, Typography } from '@/constants/theme';

const NEED_OPTIONS: NeedType[] = ['housing', 'rides', 'study', 'networking', 'general'];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { refreshProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [gradYear, setGradYear] = useState('2027');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [needs, setNeeds] = useState<NeedType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleNeed = (need: NeedType) => {
    setNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need],
    );
  };

  const handleFinish = async () => {
    setError('');
    setLoading(true);
    try {
      await completeOnboarding({
        name,
        university,
        major,
        graduationYear: parseInt(gradYear, 10),
        bio,
        needs,
        city,
        country: 'USA',
      });
      await refreshProfile();
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.lg }]}>
      <View style={styles.progress}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
        ))}
      </View>

      {step === 0 && (
        <View style={styles.step}>
          <Text style={styles.title}>Tell us about yourself</Text>
          <Text style={styles.subtitle}>This helps other students find and trust you.</Text>
          <Input label="Full Name" placeholder="Alex Chen" value={name} onChangeText={setName} />
          <Input label="University" placeholder="Stanford University" value={university} onChangeText={setUniversity} />
          <Input label="Major" placeholder="Computer Science" value={major} onChangeText={setMajor} />
          <Input label="Graduation Year" placeholder="2027" value={gradYear} onChangeText={setGradYear} keyboardType="number-pad" />
        </View>
      )}

      {step === 1 && (
        <View style={styles.step}>
          <Text style={styles.title}>What are you looking for?</Text>
          <Text style={styles.subtitle}>Select all that apply — we will personalize your feed.</Text>
          <View style={styles.chips}>
            {NEED_OPTIONS.map((need) => (
              <Chip
                key={need}
                label={NEED_LABELS[need]}
                selected={needs.includes(need)}
                onPress={() => toggleNeed(need)}
              />
            ))}
          </View>
          <Input label="Current / Upcoming City" placeholder="Mountain View, CA" value={city} onChangeText={setCity} />
          <Input
            label="Bio (optional)"
            placeholder="SWE intern @ Google this summer..."
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />
        </View>
      )}

      {step === 2 && (
        <View style={styles.step}>
          <Text style={styles.title}>You are all set!</Text>
          <Text style={styles.subtitle}>
            Welcome to ChadConnect, {name || 'friend'}. Start exploring events, housing posts, and ride shares near you.
          </Text>
          <View style={styles.summary}>
            <Text style={styles.summaryLabel}>University</Text>
            <Text style={styles.summaryValue}>{university || '—'}</Text>
            <Text style={styles.summaryLabel}>Looking for</Text>
            <Text style={styles.summaryValue}>
              {needs.length ? needs.map((n) => NEED_LABELS[n]).join(', ') : '—'}
            </Text>
          </View>
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        {step < 2 ? (
          <Button
            title="Continue"
            onPress={() => setStep(step + 1)}
            fullWidth
            disabled={step === 0 && !name}
          />
        ) : (
          <Button title={loading ? 'Setting up...' : 'Enter ChadConnect'} onPress={handleFinish} fullWidth disabled={loading} />
        )}
        {step > 0 && step < 2 && (
          <Button title="Back" variant="ghost" onPress={() => setStep(step - 1)} fullWidth />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    flexGrow: 1,
  },
  progress: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  dot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Palette.border,
  },
  dotActive: {
    backgroundColor: Palette.primary,
  },
  step: {
    flex: 1,
    gap: Spacing.md,
  },
  title: {
    ...Typography.h1,
    color: Palette.text,
  },
  subtitle: {
    ...Typography.body,
    color: Palette.textSecondary,
    marginBottom: Spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  summary: {
    backgroundColor: Palette.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    gap: Spacing.sm,
  },
  summaryLabel: {
    ...Typography.caption,
    color: Palette.textTertiary,
    marginTop: Spacing.sm,
  },
  summaryValue: {
    ...Typography.body,
    color: Palette.text,
    fontWeight: '500',
  },
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  error: {
    ...Typography.bodySmall,
    color: Palette.error,
    marginTop: Spacing.md,
  },
});
