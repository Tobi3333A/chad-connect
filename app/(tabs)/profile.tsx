import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/screen';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { NEED_LABELS, Palette, Spacing, Typography } from '@/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();

  const MENU_ITEMS = [
    { icon: 'create-outline' as const, label: 'Edit Profile', route: '/edit-profile' },
    { icon: 'calendar-outline' as const, label: 'My Events', route: '/(tabs)/explore' },
    { icon: 'home-outline' as const, label: 'My Housing Posts', route: '/(tabs)/housing' },
    { icon: 'car-outline' as const, label: 'My Rides', route: '/(tabs)/rides' },
    { icon: 'settings-outline' as const, label: 'Settings', route: '/settings' },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/welcome');
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.meta}>Loading your profile…</Text>
        <Button title="Sign Out" variant="outline" onPress={handleSignOut} style={styles.signOut} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <Screen>
        <Card style={styles.profileCard}>
          <Avatar
            uri={user.avatarUrl}
            name={user.name || 'Student'}
            size={80}
            showBadge={user.isVerified}
          />
          <Text style={styles.name}>{user.name || 'Complete your profile'}</Text>
          <Text style={styles.university}>{user.university || '—'}</Text>
          <Text style={styles.meta}>
            {user.major || '—'} · Class of {user.graduationYear}
          </Text>
          {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
          <View style={styles.needs}>
            {user.needs.map((need) => (
              <Badge key={need} label={NEED_LABELS[need]} variant="outline" />
            ))}
          </View>
        </Card>

        <View style={styles.menu}>
          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.label}
              style={styles.menuItem}
              onPress={() => router.push(item.route as never)}>
              <Ionicons name={item.icon} size={22} color={Palette.textSecondary} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={Palette.textTertiary} />
            </Pressable>
          ))}
        </View>

        <Button
          title="Sign Out"
          variant="outline"
          fullWidth
          onPress={handleSignOut}
          style={styles.signOut}
        />
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    ...Typography.h1,
    color: Palette.text,
  },
  profileCard: {
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  name: {
    ...Typography.h2,
    color: Palette.text,
    marginTop: Spacing.sm,
  },
  university: {
    ...Typography.bodySmall,
    color: Palette.primary,
    fontWeight: '600',
  },
  meta: {
    ...Typography.caption,
    color: Palette.textTertiary,
  },
  bio: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  needs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  menu: {
    backgroundColor: Palette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    marginBottom: Spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderLight,
  },
  menuLabel: {
    ...Typography.body,
    color: Palette.text,
    flex: 1,
  },
  signOut: {
    marginBottom: Spacing.lg,
  },
});
