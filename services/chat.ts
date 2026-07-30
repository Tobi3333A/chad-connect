import type { Conversation, Message } from '@/types';
import {
  conversationFromParts,
  messageRowToMessage,
  profileRowToUser,
} from '@/lib/mappers';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/supabase/types';

type ConversationContextType = Database['public']['Enums']['conversation_context_type'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

async function requireAuthUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('Not authenticated');
  return data.user.id;
}

export async function getConversations(): Promise<Conversation[]> {
  const myId = await requireAuthUserId();

  const { data: myRows, error: myError } = await supabase
    .from('conversation_participants')
    .select('conversation_id, unread_count')
    .eq('user_id', myId);

  if (myError) throw new Error(myError.message);
  if (!myRows?.length) return [];

  const conversationIds = myRows.map((r) => r.conversation_id);
  const unreadByConv = new Map(myRows.map((r) => [r.conversation_id, r.unread_count]));

  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select('*')
    .in('id', conversationIds)
    .order('updated_at', { ascending: false });

  if (convError) throw new Error(convError.message);

  const { data: allParticipants, error: partError } = await supabase
    .from('conversation_participants')
    .select('conversation_id, user_id')
    .in('conversation_id', conversationIds);

  if (partError) throw new Error(partError.message);

  const userIds = [...new Set((allParticipants ?? []).map((p) => p.user_id))];
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', userIds);

  if (profileError) throw new Error(profileError.message);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, profileRowToUser(p as ProfileRow)]),
  );

  const { data: recentMessages, error: msgError } = await supabase
    .from('messages')
    .select('*')
    .in('conversation_id', conversationIds)
    .order('created_at', { ascending: false });

  if (msgError) throw new Error(msgError.message);

  const lastByConv = new Map<string, Message>();
  for (const row of recentMessages ?? []) {
    if (!lastByConv.has(row.conversation_id)) {
      lastByConv.set(row.conversation_id, messageRowToMessage(row));
    }
  }

  return (conversations ?? []).map((row) => {
    const participantIds = (allParticipants ?? [])
      .filter((p) => p.conversation_id === row.id)
      .map((p) => p.user_id);

    return conversationFromParts({
      row,
      participantIds,
      participants: participantIds
        .map((id) => profileMap.get(id))
        .filter((u): u is NonNullable<typeof u> => Boolean(u)),
      lastMessage: lastByConv.get(row.id),
      unreadCount: unreadByConv.get(row.id) ?? 0,
    });
  });
}

export async function getConversationById(id: string): Promise<Conversation | null> {
  const conversations = await getConversations();
  return conversations.find((c) => c._id === id) ?? null;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => messageRowToMessage(row));
}

export async function sendMessage(conversationId: string, content: string): Promise<Message> {
  const senderId = await requireAuthUserId();

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content: content.trim(),
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return messageRowToMessage(data, true);
}

export async function markConversationRead(conversationId: string): Promise<void> {
  const myId = await requireAuthUserId();

  const { error } = await supabase
    .from('conversation_participants')
    .update({
      unread_count: 0,
      last_read_at: new Date().toISOString(),
    })
    .eq('conversation_id', conversationId)
    .eq('user_id', myId);

  if (error) throw new Error(error.message);
}

export async function startConversation(
  otherUserId: string,
  context?: {
    type?: ConversationContextType;
    id?: string;
    label?: string;
  },
): Promise<string> {
  const { data, error } = await supabase.rpc('start_conversation', {
    p_other_user_id: otherUserId,
    p_context_type: context?.type ?? 'general',
    p_context_id: context?.id ?? null,
    p_context_label: context?.label ?? null,
  });

  if (error) throw new Error(error.message);
  return data;
}

export function subscribeToMessages(
  conversationId: string,
  onInsert: (message: Message) => void,
) {
  return supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onInsert(messageRowToMessage(payload.new as Database['public']['Tables']['messages']['Row']));
      },
    )
    .subscribe();
}
