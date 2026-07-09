import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

interface QuickAction {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
  color: string;
}

const ACTIONS: QuickAction[] = [
  { icon: 'home', label: 'Housing', route: '/(tabs)/housing', color: Palette.housing },
  { icon: 'car', label: 'Rides', route: '/(tabs)/rides', color: Palette.rides },
  { icon: 'calendar', label: 'Events', route: '/(tabs)/explore', color: Palette.events },
  { icon: 'add-circle', label: 'Post', route: '/create/event', color: Palette.primary },
];

export function QuickActions() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {ACTIONS.map((action) => (
        <Pressable
          key={action.label}
          style={styles.action}
          onPress={() => router.push(action.route as never)}>
          <View style={[styles.iconWrap, { backgroundColor: action.color + '15' }]}>
            <Ionicons name={action.icon} size={22} color={action.color} />
          </View>
          <Text style={styles.label}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

interface HeroBannerProps {
  userName: string;
}

export function HeroBanner({ userName }: HeroBannerProps) {
  return (
    <LinearGradient
      colors={[Palette.gradientStart, Palette.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}>
      <Text style={styles.greeting}>Hey, {userName.split(' ')[0]} 👋</Text>
      <Text style={styles.heroSubtitle}>
        Find roommates, ride partners, and connections for your next adventure.
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  action: {
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '500',
  },
  hero: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  greeting: {
    ...Typography.h2,
    color: Palette.white,
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
});
