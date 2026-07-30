import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/layout/screen';
import { ScreenHeader } from '@/components/layout/screen-header';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { startConversation } from '@/services/chat';
import { getRideById } from '@/services/rides';
import type { RideRequest } from '@/types';
import { RIDE_TYPE_LABELS, Palette, Spacing, Typography } from '@/constants/theme';

export default function RideDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [ride, setRide] = useState<RideRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [messaging, setMessaging] = useState(false);

  useEffect(() => {
    if (!id) return;
    getRideById(id)
      .then(setRide)
      .catch(() => setRide(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={Palette.rides} size="large" />
      </View>
    );
  }

  if (!ride) {
    return (
      <View style={styles.loader}>
        <Text>Ride not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader showBack title="Ride" />
      <Screen>
        <Badge label={RIDE_TYPE_LABELS[ride.type]} variant="rides" />
        {ride.eventTitle && <Text style={styles.event}>{ride.eventTitle}</Text>}

        <Card style={styles.routeCard}>
          <View style={styles.routePoint}>
            <View style={styles.dotStart} />
            <View>
              <Text style={styles.routeLabel}>From</Text>
              <Text style={styles.routeValue}>{ride.from}</Text>
            </View>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routePoint}>
            <View style={styles.dotEnd} />
            <View>
              <Text style={styles.routeLabel}>To</Text>
              <Text style={styles.routeValue}>{ride.to}</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.details}>
          <DetailItem
            label="Departure"
            value={new Date(ride.departureTime).toLocaleString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          />
          {ride.seatsAvailable && (
            <DetailItem label="Seats Available" value={String(ride.seatsAvailable)} />
          )}
          {ride.costPerPerson && (
            <DetailItem label="Cost per Person" value={`$${ride.costPerPerson}`} />
          )}
        </Card>

        <Text style={styles.sectionTitle}>Details</Text>
        <Text style={styles.description}>{ride.description}</Text>

        {ride.author && (
          <Card style={styles.authorCard}>
            <Avatar uri={ride.author.avatarUrl} name={ride.author.name} size={48} showBadge />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{ride.author.name}</Text>
              <Text style={styles.authorUni}>{ride.author.university}</Text>
            </View>
          </Card>
        )}

        {ride.author && ride.authorId !== user?._id && (
          <Button
            title={messaging ? 'Opening...' : 'Message About Ride'}
            fullWidth
            disabled={messaging}
            style={styles.cta}
            onPress={async () => {
              setMessaging(true);
              try {
                const conversationId = await startConversation(ride.authorId, {
                  type: 'ride',
                  id: ride._id,
                  label: `${ride.from} → ${ride.to}`,
                });
                router.push(`/chat/${conversationId}`);
              } catch (e) {
                Alert.alert(
                  'Could not start chat',
                  e instanceof Error ? e.message : 'Something went wrong',
                );
              } finally {
                setMessaging(false);
              }
            }}
          />
        )}
      </Screen>
    </View>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  event: { ...Typography.bodySmall, color: Palette.rides, fontWeight: '500', marginTop: Spacing.sm },
  routeCard: { marginVertical: Spacing.md, gap: Spacing.sm },
  routePoint: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  dotStart: { width: 12, height: 12, borderRadius: 6, backgroundColor: Palette.rides },
  dotEnd: { width: 12, height: 12, borderRadius: 3, backgroundColor: Palette.primary },
  routeLine: { width: 2, height: 24, backgroundColor: Palette.border, marginLeft: 5 },
  routeLabel: { ...Typography.caption, color: Palette.textTertiary },
  routeValue: { ...Typography.body, fontWeight: '600', color: Palette.text },
  details: { gap: Spacing.md },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { ...Typography.bodySmall, color: Palette.textSecondary },
  detailValue: { ...Typography.bodySmall, fontWeight: '600', color: Palette.text },
  sectionTitle: { ...Typography.h3, color: Palette.text, marginTop: Spacing.lg },
  description: { ...Typography.body, color: Palette.textSecondary, lineHeight: 24 },
  authorCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginTop: Spacing.lg },
  authorInfo: { flex: 1 },
  authorName: { ...Typography.body, fontWeight: '600', color: Palette.text },
  authorUni: { ...Typography.caption, color: Palette.textTertiary },
  cta: { marginTop: Spacing.lg },
});
