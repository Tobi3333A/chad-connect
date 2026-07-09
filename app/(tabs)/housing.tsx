import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/screen';
import { Chip } from '@/components/ui/chip';
import { HousingCard } from '@/components/housing/housing-card';
import { useHousing } from '@/hooks/use-housing';
import type { HousingType } from '@/types';
import { Palette, Spacing, Typography } from '@/constants/theme';

const FILTERS: { label: string; value?: HousingType }[] = [
  { label: 'All' },
  { label: 'Seeking Roommate', value: 'seeking-roommate' },
  { label: 'Offering Spot', value: 'offering-spot' },
  { label: 'Looking for Place', value: 'looking-for-place' },
];

export default function HousingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<HousingType | undefined>();
  const { posts, loading } = useHousing({ type: activeFilter });

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View>
          <Text style={styles.title}>Housing</Text>
          <Text style={styles.subtitle}>Find roommates & split rent</Text>
        </View>
        <Pressable style={styles.addBtn} onPress={() => router.push('/create/housing')}>
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
              color={Palette.housing}
            />
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color={Palette.housing} style={styles.loader} />
        ) : posts.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="home-outline" size={48} color={Palette.textTertiary} />
            <Text style={styles.emptyTitle}>No housing posts yet</Text>
            <Text style={styles.emptyDesc}>Be the first to post in your area.</Text>
          </View>
        ) : (
          posts.map((post) => <HousingCard key={post._id} post={post} />)
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
    backgroundColor: Palette.housing,
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
