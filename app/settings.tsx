import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/screen';
import { ScreenHeader } from '@/components/layout/screen-header';
import { Palette, Spacing, Typography } from '@/constants/theme';

const SETTINGS = [
  { icon: 'notifications-outline' as const, label: 'Push Notifications', section: 'Preferences' },
  { icon: 'mail-outline' as const, label: 'Email Notifications', section: 'Preferences' },
  { icon: 'shield-checkmark-outline' as const, label: 'Privacy', section: 'Account' },
  { icon: 'help-circle-outline' as const, label: 'Help & Support', section: 'Support' },
  { icon: 'document-text-outline' as const, label: 'Terms of Service', section: 'Legal' },
  { icon: 'lock-closed-outline' as const, label: 'Privacy Policy', section: 'Legal' },
];

export default function SettingsScreen() {
  const router = useRouter();

  const sections = [...new Set(SETTINGS.map((s) => s.section))];

  return (
    <View style={styles.container}>
      <ScreenHeader showBack title="Settings" />
      <Screen>
        {sections.map((section) => (
          <View key={section}>
            <Text style={styles.sectionTitle}>{section}</Text>
            <View style={styles.section}>
              {SETTINGS.filter((s) => s.section === section).map((item) => (
                <Pressable key={item.label} style={styles.row}>
                  <Ionicons name={item.icon} size={22} color={Palette.textSecondary} />
                  <Text style={styles.label}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color={Palette.textTertiary} />
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        <Pressable
          style={styles.signOut}
          onPress={() => router.replace('/(auth)/welcome')}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        <Text style={styles.version}>ChadConnect v1.0.0</Text>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  sectionTitle: {
    ...Typography.caption,
    color: Palette.textTertiary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  section: {
    backgroundColor: Palette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.borderLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderLight,
  },
  label: { ...Typography.body, color: Palette.text, flex: 1 },
  signOut: { alignItems: 'center', marginTop: Spacing.xl, padding: Spacing.md },
  signOutText: { ...Typography.body, color: Palette.error, fontWeight: '600' },
  version: { ...Typography.caption, color: Palette.textTertiary, textAlign: 'center', marginTop: Spacing.md },
});
