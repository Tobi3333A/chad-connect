import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { sendVerificationCode, verifyCode } from '@/services/auth';
import { Palette, Spacing, Typography } from '@/constants/theme';

export default function VerifyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { refreshProfile } = useAuth();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    setError('');
    if (code.length < 6) {
      setError('Enter the 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const user = await verifyCode(email ?? '', code);
      await refreshProfile();
      if (!user.name?.trim()) {
        router.replace('/(auth)/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setError('');
    setResending(true);
    try {
      await sendVerificationCode(email);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.lg }]}>
      <View style={styles.content}>
        <Text style={styles.title}>Check your inbox</Text>
        <Text style={styles.subtitle}>
          We sent a verification code to{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>

        <Input
          label="Verification Code"
          placeholder="000000"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
          error={error}
        />

        <Button
          title={loading ? 'Verifying...' : 'Verify & Continue'}
          onPress={handleVerify}
          fullWidth
          disabled={loading}
        />

        <Pressable onPress={handleResend} disabled={resending}>
          <Text style={styles.resend}>
            {resending ? 'Sending...' : 'Did not receive it? Resend code'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
    paddingHorizontal: Spacing.lg,
  },
  content: {
    flex: 1,
    gap: Spacing.lg,
    paddingTop: Spacing.xxl,
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
  email: {
    fontWeight: '600',
    color: Palette.text,
  },
  resend: {
    ...Typography.bodySmall,
    color: Palette.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
});
