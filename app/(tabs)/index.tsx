import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/screen';
import { FeedCard } from '@/components/feed/feed-card';
import { EventCard } from '@/components/events/event-card';
import { HeroBanner, QuickActions } from '@/components/home/quick-actions';
import { SectionHeader, SuggestedUserCard } from '@/components/home/suggested-user-card';
import { useFeed } from '@/hooks/use-feed';
import { useEvents } from '@/hooks/use-events';
import { useUnreadNotifications } from '@/hooks/use-notifications';
import { getCurrentUser } from '@/services/auth';
import { getSuggestedConnections } from '@/services/feed';
import type { User } from '@/types';
import { CURRENT_USER_ID, mockUsers } from '@/data/mock';
import { Palette, Spacing, Typography } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, loading: feedLoading } = useFeed();
  const { events } = useEvents();
  const { count: unreadCount } = useUnreadNotifications();
  const [user, setUser] = useState<User | null>(null);
  const [suggested, setSuggested] = useState<User[]>([]);

  useEffect(() => {
    getCurrentUser().then(setUser);
    getSuggestedConnections().then(setSuggested);
  }, []);

  const displayUser = user ?? mockUsers.find((u) => u._id === CURRENT_USER_ID)!;

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.sm }]}>
        <View>
          <Text style={styles.logo}>ChadConnect</Text>
        </View>
        <Pressable onPress={() => router.push('/notifications')} style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={24} color={Palette.text} />
          {unreadCount > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifCount}>{unreadCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <Screen>
        <HeroBanner userName={displayUser.name} />
        <QuickActions />

        <SectionHeader
          title="Suggested for you"
          actionLabel="See all"
          onAction={() => router.push('/(tabs)/explore')}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {suggested.map((u) => (
            <SuggestedUserCard key={u._id} user={u} />
          ))}
        </ScrollView>

        <SectionHeader title="Your Feed" />
        {feedLoading ? (
          <ActivityIndicator color={Palette.primary} style={styles.loader} />
        ) : (
          items.map((item) => <FeedCard key={item._id} item={item} />)
        )}

        <SectionHeader
          title="Trending Events"
          actionLabel="Explore"
          onAction={() => router.push('/(tabs)/explore')}
        />
        {events.slice(0, 2).map((event) => (
          <EventCard key={event._id} event={event} compact />
        ))}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Palette.background,
  },
  logo: {
    ...Typography.h3,
    color: Palette.primary,
    fontWeight: '800',
  },
  notifBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Palette.error,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifCount: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.white,
  },
  horizontalScroll: {
    marginBottom: Spacing.sm,
  },
  loader: {
    marginVertical: Spacing.lg,
  },
});
