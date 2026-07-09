import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/screen';
import { ScreenHeader } from '@/components/layout/screen-header';
import { getNotifications, markNotificationRead } from '@/services/notifications';
import type { Notification } from '@/types';
import { Palette, Spacing, Typography } from '@/constants/theme';

const TYPE_ICONS: Record<Notification['type'], keyof typeof Ionicons.glyphMap> = {
  message: 'chatbubble',
  connection: 'people',
  housing: 'home',
  ride: 'car',
  event: 'calendar',
  system: 'information-circle',
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    getNotifications().then(setNotifications);
  }, []);

  const handlePress = async (notif: Notification) => {
    await markNotificationRead(notif._id);
    setNotifications((prev) =>
      prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n)),
    );
    if (notif.type === 'message' && notif.relatedId) {
      router.push(`/chat/${notif.relatedId}`);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader showBack title="Notifications" />
      <Screen scroll={false}>
        {notifications.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={Palette.textTertiary} />
            <Text style={styles.emptyTitle}>All caught up</Text>
          </View>
        ) : (
          notifications.map((notif) => (
            <Pressable
              key={notif._id}
              style={[styles.row, !notif.read && styles.unread]}
              onPress={() => handlePress(notif)}>
              <View style={[styles.iconWrap, { backgroundColor: Palette.primary + '12' }]}>
                <Ionicons name={TYPE_ICONS[notif.type]} size={20} color={Palette.primary} />
              </View>
              <View style={styles.content}>
                <Text style={styles.title}>{notif.title}</Text>
                <Text style={styles.body} numberOfLines={2}>{notif.body}</Text>
                <Text style={styles.time}>
                  {new Date(notif.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              {!notif.read && <View style={styles.dot} />}
            </Pressable>
          ))
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  emptyTitle: { ...Typography.h3, color: Palette.text },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderLight,
  },
  unread: { backgroundColor: Palette.primary + '06' },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1 },
  title: { ...Typography.bodySmall, fontWeight: '600', color: Palette.text },
  body: { ...Typography.caption, color: Palette.textSecondary, marginTop: 2 },
  time: { ...Typography.caption, color: Palette.textTertiary, marginTop: 4 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.primary,
    marginTop: 6,
  },
});
