import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/button';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

const FEATURES = [
  { icon: 'home' as const, title: 'Find Roommates', desc: 'Connect with interns & students heading to the same place' },
  { icon: 'car' as const, title: 'Share Rides', desc: 'Split Uber costs to airports, events, and campuses' },
  { icon: 'people' as const, title: 'Build Your Network', desc: 'Meet students at hackathons, conferences & more' },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + Spacing.lg }]}>
      <LinearGradient
        colors={[Palette.gradientStart, Palette.gradientEnd]}
        style={[styles.hero, { paddingTop: insets.top + Spacing.xl }]}
      >
        <View style={styles.logoWrap}>
          <Ionicons name="people-circle" size={48} color={Palette.white} />
        </View>
        <Text style={styles.brand}>ChadConnect</Text>
        <Text style={styles.tagline}>
          Connect with students for housing, rides, and events — all in one place.
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon} size={20} color={Palette.primary} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Button
            title="Get Started with .edu Email"
            onPress={() => router.push('/(auth)/login')}
            fullWidth
            size="lg"
          />
          <Text style={styles.footer}>
            Verified students only · Your .edu email keeps our community safe
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: Radius.xl * 2,
    borderBottomRightRadius: Radius.xl * 2,
  },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  brand: {
    fontSize: 36,
    fontWeight: '800',
    color: Palette.white,
    letterSpacing: -1,
    lineHeight: 44,
  },
  tagline: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    justifyContent: 'space-between',
  },
  features: {
    gap: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Palette.surface,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.borderLight,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Palette.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Palette.text,
  },
  featureDesc: {
    ...Typography.caption,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  actions: {
    gap: Spacing.md,
    alignItems: 'center',
  },
  footer: {
    ...Typography.caption,
    color: Palette.textTertiary,
    textAlign: 'center',
  },
});
