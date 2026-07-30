import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/layout/screen';
import { ScreenHeader } from '@/components/layout/screen-header';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getUserById } from '@/services/auth';
import type { User } from '@/types';
import { NEED_LABELS, Palette, Spacing, Typography } from '@/constants/theme';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getUserById(id)
      .then((profile) => {
        setUser(profile);
        setError(profile ? '' : 'Student not found');
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Could not load profile');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={Palette.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <ScreenHeader showBack title="Student Profile" />
        <View style={styles.loader}>
          <Text style={styles.error}>{error || 'Student not found'}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader showBack title="Student Profile" />
      <Screen>
        <Card style={styles.profileCard}>
          <Avatar uri={user.avatarUrl} name={user.name} size={88} showBadge={user.isVerified} />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.university}>{user.university}</Text>
          <Text style={styles.meta}>
            {user.major} · Class of {user.graduationYear}
          </Text>
          {user.location && (
            <Text style={styles.location}>
              {user.location.city}
              {user.location.state ? `, ${user.location.state}` : ''}
            </Text>
          )}
        </Card>

        {user.bio && (
          <>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{user.bio}</Text>
          </>
        )}

        <Text style={styles.sectionTitle}>Looking for</Text>
        <View style={styles.needs}>
          {user.needs.map((need) => (
            <Badge key={need} label={NEED_LABELS[need]} variant="outline" />
          ))}
        </View>

        <Button
          title="Send Message"
          fullWidth
          onPress={() =>
            Alert.alert('Coming soon', 'Messaging will be wired in the chat feature.')
          }
          style={styles.cta}
        />
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { ...Typography.body, color: Palette.textSecondary },
  profileCard: { alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
  name: { ...Typography.h2, color: Palette.text, marginTop: Spacing.sm },
  university: { ...Typography.bodySmall, color: Palette.primary, fontWeight: '600' },
  meta: { ...Typography.caption, color: Palette.textTertiary },
  location: { ...Typography.caption, color: Palette.textSecondary },
  sectionTitle: {
    ...Typography.h3,
    color: Palette.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  bio: { ...Typography.body, color: Palette.textSecondary, lineHeight: 24 },
  needs: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  cta: { marginTop: Spacing.xl },
});
