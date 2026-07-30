import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/layout/screen';
import { ScreenHeader } from '@/components/layout/screen-header';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { getUserById } from '@/services/auth';
import {
  acceptConnection,
  declineConnection,
  getConnectionWith,
  requestConnection,
} from '@/services/connections';
import type { Connection, User } from '@/types';
import { NEED_LABELS, Palette, Spacing, Typography } from '@/constants/theme';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user: me } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const profile = await getUserById(id);
      setUser(profile);
      setError(profile ? '' : 'Student not found');

      if (profile && me && profile._id !== me._id) {
        const existing = await getConnectionWith(profile._id);
        setConnection(existing);
      } else {
        setConnection(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load profile');
      setUser(null);
      setConnection(null);
    } finally {
      setLoading(false);
    }
  }, [id, me]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRequest = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      const created = await requestConnection(user._id);
      setConnection(created);
    } catch (e) {
      Alert.alert('Could not connect', e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!connection) return;
    setActionLoading(true);
    try {
      const updated = await acceptConnection(connection._id);
      setConnection(updated);
    } catch (e) {
      Alert.alert('Could not accept', e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!connection) return;
    setActionLoading(true);
    try {
      const updated = await declineConnection(connection._id);
      setConnection(updated);
    } catch (e) {
      Alert.alert('Could not decline', e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setActionLoading(false);
    }
  };

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

  const isSelf = me?._id === user._id;
  const isIncomingPending =
    connection?.status === 'pending' && connection.addresseeId === me?._id;
  const isOutgoingPending =
    connection?.status === 'pending' && connection.requesterId === me?._id;
  const isAccepted = connection?.status === 'accepted';
  const isDeclined = connection?.status === 'declined';

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

        {!isSelf && (
          <View style={styles.actions}>
            {isAccepted && (
              <Button title="Connected" fullWidth disabled />
            )}
            {isOutgoingPending && (
              <Button title="Request sent" fullWidth disabled />
            )}
            {isIncomingPending && (
              <>
                <Button
                  title={actionLoading ? 'Accepting...' : 'Accept connection'}
                  fullWidth
                  onPress={handleAccept}
                  disabled={actionLoading}
                />
                <Button
                  title="Decline"
                  variant="outline"
                  fullWidth
                  onPress={handleDecline}
                  disabled={actionLoading}
                />
              </>
            )}
            {(!connection || isDeclined) && (
              <Button
                title={actionLoading ? 'Sending...' : 'Connect'}
                fullWidth
                onPress={handleRequest}
                disabled={actionLoading}
              />
            )}
            <Button
              title="Send Message"
              variant="outline"
              fullWidth
              onPress={() =>
                Alert.alert('Coming soon', 'Messaging will be wired in the chat feature.')
              }
            />
          </View>
        )}
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
  actions: { marginTop: Spacing.xl, gap: Spacing.sm },
});
