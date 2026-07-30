import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import type { Conversation } from '@/types';
import { Palette, Spacing, Typography } from '@/constants/theme';

interface ConversationRowProps {
  conversation: Conversation;
}

export function ConversationRow({ conversation }: ConversationRowProps) {
  const router = useRouter();
  const { user } = useAuth();

  const otherUser = conversation.participants?.find((p) => p._id !== user?._id);
  const time = conversation.updatedAt
    ? new Date(conversation.updatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <Pressable
      style={styles.row}
      onPress={() => router.push(`/chat/${conversation._id}`)}>
      <Avatar
        uri={otherUser?.avatarUrl}
        name={otherUser?.name ?? 'User'}
        size={52}
        showBadge={otherUser?.isVerified}
      />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.name}>{otherUser?.name ?? 'Unknown'}</Text>
          <Text style={styles.time}>{time}</Text>
        </View>
        {conversation.contextLabel && (
          <Badge label={conversation.contextLabel} variant="outline" style={styles.contextBadge} />
        )}
        <Text style={styles.preview} numberOfLines={1}>
          {conversation.lastMessage?.content ?? 'Start a conversation'}
        </Text>
      </View>
      {conversation.unreadCount > 0 && (
        <View style={styles.unread}>
          <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderLight,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Palette.text,
  },
  time: {
    ...Typography.caption,
    color: Palette.textTertiary,
  },
  contextBadge: {
    alignSelf: 'flex-start',
  },
  preview: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
  },
  unread: {
    backgroundColor: Palette.primary,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    ...Typography.caption,
    color: Palette.white,
    fontWeight: '700',
  },
});
