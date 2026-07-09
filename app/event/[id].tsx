import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/screen';
import { ScreenHeader } from '@/components/layout/screen-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getEventById, joinEvent } from '@/services/events';
import type { Event } from '@/types';
import { EVENT_TYPE_LABELS, Palette, Spacing, Typography } from '@/constants/theme';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (id) {
      getEventById(id).then((e) => {
        setEvent(e);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={Palette.primary} size="large" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.loader}>
        <Text>Event not found</Text>
      </View>
    );
  }

  const handleJoin = async () => {
    await joinEvent(event._id);
    setJoined(true);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader showBack title="Event" />
      <Screen padded={false}>
        {event.imageUrl && (
          <Image source={{ uri: event.imageUrl }} style={styles.image} contentFit="cover" />
        )}
        <View style={styles.body}>
          <Badge label={EVENT_TYPE_LABELS[event.type]} variant="events" />
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.org}>{event.organization}</Text>

          <Card style={styles.infoCard}>
            <InfoRow icon="location-outline" label="Location" value={`${event.location.city}, ${event.location.state}`} />
            <InfoRow
              icon="calendar-outline"
              label="Dates"
              value={`${new Date(event.startDate).toLocaleDateString()} – ${new Date(event.endDate).toLocaleDateString()}`}
            />
            <InfoRow icon="people-outline" label="Students" value={`${event.attendeeCount} joined`} />
          </Card>

          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{event.description}</Text>

          <View style={styles.tags}>
            {event.tags.map((tag) => (
              <Badge key={tag} label={`#${tag}`} variant="outline" />
            ))}
          </View>

          <View style={styles.actions}>
            <Button
              title={joined ? 'Joined ✓' : 'Join Event'}
              onPress={handleJoin}
              fullWidth
              disabled={joined}
            />
            <Button
              title="Find Housing"
              variant="secondary"
              fullWidth
              onPress={() => router.push(`/(tabs)/housing`)}
            />
            <Button
              title="Find Rides"
              variant="outline"
              fullWidth
              onPress={() => router.push(`/(tabs)/rides`)}
            />
          </View>
        </View>
      </Screen>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={Palette.textTertiary} />
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: 200, backgroundColor: Palette.borderLight },
  body: { padding: Spacing.md, gap: Spacing.sm },
  title: { ...Typography.h1, color: Palette.text, marginTop: Spacing.sm },
  org: { ...Typography.body, color: Palette.textSecondary },
  infoCard: { marginVertical: Spacing.md, gap: Spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  infoLabel: { ...Typography.caption, color: Palette.textTertiary },
  infoValue: { ...Typography.bodySmall, fontWeight: '500', color: Palette.text },
  sectionTitle: { ...Typography.h3, color: Palette.text, marginTop: Spacing.md },
  description: { ...Typography.body, color: Palette.textSecondary, lineHeight: 24 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },
  actions: { gap: Spacing.sm, marginTop: Spacing.lg },
});
