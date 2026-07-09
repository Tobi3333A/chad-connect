import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/screen';
import { ConversationRow } from '@/components/chat/conversation-row';
import { useConversations } from '@/hooks/use-conversations';
import { Palette, Spacing, Typography } from '@/constants/theme';

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const { conversations, loading } = useConversations();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Text style={styles.title}>Messages</Text>
      </View>

      <Screen scroll={false} style={styles.list}>
        {loading ? (
          <ActivityIndicator color={Palette.primary} style={styles.loader} />
        ) : conversations.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={48} color={Palette.textTertiary} />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptyDesc}>
              Connect with students from housing, rides, or events to start chatting.
            </Text>
          </View>
        ) : (
          conversations.map((conv) => (
            <ConversationRow key={conv._id} conversation={conv} />
          ))
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
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    ...Typography.h1,
    color: Palette.text,
  },
  list: {
    flex: 1,
  },
  loader: {
    marginTop: Spacing.xxl,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Palette.text,
  },
  emptyDesc: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    textAlign: 'center',
  },
});
