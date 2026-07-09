import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Event } from '@/types';
import { EVENT_TYPE_LABELS, Palette, Spacing, Typography } from '@/constants/theme';

interface EventCardProps {
  event: Event;
  compact?: boolean;
}

export function EventCard({ event, compact = false }: EventCardProps) {
  const router = useRouter();

  const formatDate = (start: string, end: string) => {
    const s = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const e = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${s} – ${e}`;
  };

  if (compact) {
    return (
      <Pressable onPress={() => router.push(`/event/${event._id}`)}>
        <Card style={styles.compactCard}>
          <View style={styles.compactRow}>
            <View style={[styles.typeDot, { backgroundColor: Palette.events }]} />
            <View style={styles.compactContent}>
              <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
              <Text style={styles.meta}>{event.location.city} · {event.attendeeCount} students</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Palette.textTertiary} />
          </View>
        </Card>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={() => router.push(`/event/${event._id}`)}>
      <Card style={styles.card} padded={false}>
        {event.imageUrl && (
          <Image source={{ uri: event.imageUrl }} style={styles.image} contentFit="cover" />
        )}
        <View style={styles.body}>
          <View style={styles.badgeRow}>
            <Badge label={EVENT_TYPE_LABELS[event.type]} variant="events" />
            <Text style={styles.attendees}>{event.attendeeCount} students</Text>
          </View>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.org}>{event.organization}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={Palette.textTertiary} />
            <Text style={styles.meta}>{event.location.city}, {event.location.state}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color={Palette.textTertiary} />
            <Text style={styles.meta}>{formatDate(event.startDate, event.endDate)}</Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: Palette.borderLight,
  },
  body: {
    padding: Spacing.md,
    gap: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendees: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
  title: {
    ...Typography.h3,
    color: Palette.text,
  },
  org: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    ...Typography.caption,
    color: Palette.textTertiary,
  },
  compactCard: {
    marginBottom: Spacing.sm,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  compactContent: {
    flex: 1,
  },
});
