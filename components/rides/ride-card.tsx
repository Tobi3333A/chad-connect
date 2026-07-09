import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { RideRequest } from '@/types';
import { RIDE_TYPE_LABELS, Palette, Spacing, Typography } from '@/constants/theme';

interface RideCardProps {
  ride: RideRequest;
}

export function RideCard({ ride }: RideCardProps) {
  const router = useRouter();

  const time = new Date(ride.departureTime).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <Pressable onPress={() => router.push(`/ride/${ride._id}`)}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Badge
            label={RIDE_TYPE_LABELS[ride.type]}
            variant={ride.type === 'offering' ? 'rides' : 'outline'}
          />
          {ride.costPerPerson && (
            <Text style={styles.cost}>${ride.costPerPerson}/person</Text>
          )}
        </View>
        <View style={styles.route}>
          <View style={styles.routePoint}>
            <View style={styles.dotStart} />
            <Text style={styles.location}>{ride.from}</Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routePoint}>
            <View style={styles.dotEnd} />
            <Text style={styles.location}>{ride.to}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={14} color={Palette.textTertiary} />
          <Text style={styles.meta}>{time}</Text>
          {ride.seatsAvailable && (
            <Text style={styles.seats}>{ride.seatsAvailable} seats</Text>
          )}
        </View>
        {ride.eventTitle && (
          <Text style={styles.event}>{ride.eventTitle}</Text>
        )}
        {ride.author && (
          <View style={styles.authorRow}>
            <Avatar uri={ride.author.avatarUrl} name={ride.author.name} size={32} showBadge />
            <Text style={styles.authorName}>{ride.author.name}</Text>
          </View>
        )}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cost: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Palette.rides,
  },
  route: {
    gap: 4,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dotStart: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Palette.rides,
  },
  dotEnd: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: Palette.primary,
  },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: Palette.border,
    marginLeft: 4,
  },
  location: {
    ...Typography.bodySmall,
    fontWeight: '500',
    color: Palette.text,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    ...Typography.caption,
    color: Palette.textTertiary,
    flex: 1,
  },
  seats: {
    ...Typography.caption,
    color: Palette.rides,
    fontWeight: '600',
  },
  event: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Palette.borderLight,
  },
  authorName: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Palette.text,
  },
});
