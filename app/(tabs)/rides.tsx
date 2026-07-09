import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/screen';
import { Chip } from '@/components/ui/chip';
import { RideCard } from '@/components/rides/ride-card';
import { useRides } from '@/hooks/use-rides';
import type { RideType } from '@/types';
import { Palette, Spacing, Typography } from '@/constants/theme';

const FILTERS: { label: string; value?: RideType }[] = [
  { label: 'All' },
  { label: 'Offering', value: 'offering' },
  { label: 'Requesting', value: 'requesting' },
];

export default function RidesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<RideType | undefined>();
  const { rides, loading } = useRides({ type: activeFilter });

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View>
          <Text style={styles.title}>Rides</Text>
          <Text style={styles.subtitle}>Share Uber, Lyft & road trips</Text>
        </View>
        <Pressable style={styles.addBtn} onPress={() => router.push('/create/ride')}>
          <Ionicons name="add" size={24} color={Palette.white} />
        </Pressable>
      </View>

      <Screen>
        <View style={styles.filters}>
          {FILTERS.map((f) => (
            <Chip
              key={f.label}
              label={f.label}
              selected={
                (activeFilter === f.value && f.value !== undefined) ||
                (!activeFilter && f.label === 'All')
              }
              onPress={() => setActiveFilter(f.value)}
              color={Palette.rides}
            />
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color={Palette.rides} style={styles.loader} />
        ) : rides.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="car-outline" size={48} color={Palette.textTertiary} />
            <Text style={styles.emptyTitle}>No rides posted</Text>
            <Text style={styles.emptyDesc}>Offer or request a ride to get started.</Text>
          </View>
        ) : (
          rides.map((ride) => <RideCard key={ride._id} ride={ride} />)
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    ...Typography.h1,
    color: Palette.text,
  },
  subtitle: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Palette.rides,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  loader: {
    marginTop: Spacing.xl,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Palette.text,
  },
  emptyDesc: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
  },
});
