import { StyleSheet, Text, View } from 'react-native';
import type { Message } from '@/types';
import { CURRENT_USER_ID } from '@/data/mock';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isOwn = message.senderId === CURRENT_USER_ID;

  return (
    <View style={[styles.wrapper, isOwn && styles.wrapperOwn]}>
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        <Text style={[styles.text, isOwn && styles.textOwn]}>{message.content}</Text>
      </View>
      <Text style={[styles.time, isOwn && styles.timeOwn]}>
        {new Date(message.createdAt).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.sm,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  wrapperOwn: {
    alignSelf: 'flex-end',
  },
  bubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.lg,
  },
  bubbleOwn: {
    backgroundColor: Palette.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    borderBottomLeftRadius: 4,
  },
  text: {
    ...Typography.bodySmall,
    color: Palette.text,
    lineHeight: 20,
  },
  textOwn: {
    color: Palette.white,
  },
  time: {
    ...Typography.caption,
    color: Palette.textTertiary,
    marginTop: 4,
    marginLeft: 4,
  },
  timeOwn: {
    textAlign: 'right',
    marginRight: 4,
  },
});
