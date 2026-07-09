import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MessageBubble } from '@/components/chat/message-bubble';
import { Avatar } from '@/components/ui/avatar';
import { getMessages, sendMessage } from '@/services/chat';
import { enrichConversations, mockConversations, CURRENT_USER_ID } from '@/data/mock';
import type { Message } from '@/types';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const conversation = enrichConversations(mockConversations).find((c) => c._id === id);
  const otherUser = conversation?.participants?.find((p) => p._id !== CURRENT_USER_ID);

  useEffect(() => {
    if (id) {
      getMessages(id).then((msgs) => {
        setMessages(msgs);
        setLoading(false);
      });
    }
  }, [id]);

  const handleSend = async () => {
    if (!input.trim() || !id) return;
    setSending(true);
    try {
      const msg = await sendMessage(id, input.trim(), CURRENT_USER_ID);
      setMessages((prev) => [...prev, msg]);
      setInput('');
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={Palette.text} />
        </Pressable>
        {otherUser && (
          <>
            <Avatar uri={otherUser.avatarUrl} name={otherUser.name} size={40} showBadge />
            <View style={styles.headerInfo}>
              <Text style={styles.headerName}>{otherUser.name}</Text>
              {conversation?.contextLabel && (
                <Text style={styles.headerContext}>{conversation.contextLabel}</Text>
              )}
            </View>
          </>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={Palette.primary} style={styles.loader} />
      ) : (
        <ScrollView
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}>
          {messages.map((msg) => (
            <MessageBubble key={msg._id} message={msg} />
          ))}
        </ScrollView>
      )}

      <View style={[styles.inputBar, { paddingBottom: insets.bottom + Spacing.sm }]}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor={Palette.textTertiary}
          multiline
        />
        <Pressable
          style={[styles.sendBtn, !input.trim() && styles.sendDisabled]}
          onPress={handleSend}
          disabled={sending || !input.trim()}>
          <Ionicons name="send" size={20} color={Palette.white} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderLight,
    backgroundColor: Palette.surface,
  },
  headerInfo: { flex: 1 },
  headerName: { ...Typography.body, fontWeight: '600', color: Palette.text },
  headerContext: { ...Typography.caption, color: Palette.textTertiary },
  loader: { flex: 1 },
  messages: { flex: 1 },
  messagesContent: { padding: Spacing.md, paddingBottom: Spacing.lg },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Palette.borderLight,
    backgroundColor: Palette.surface,
  },
  input: {
    flex: 1,
    backgroundColor: Palette.background,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
    color: Palette.text,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.4 },
});
