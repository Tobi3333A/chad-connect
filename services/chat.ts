import type { Conversation, Message } from '@/types';
import { enrichConversations, mockMessages } from '@/data/mock';
import { simulateDelay } from './api';

export async function getConversations(): Promise<Conversation[]> {
  // TODO: GET /api/conversations
  return simulateDelay(enrichConversations(
    (await import('@/data/mock')).mockConversations,
  ));
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  // TODO: GET /api/conversations/:id/messages
  return simulateDelay(mockMessages[conversationId] ?? []);
}

export async function sendMessage(
  conversationId: string,
  content: string,
  senderId: string,
): Promise<Message> {
  // TODO: POST /api/conversations/:id/messages { content }
  const message: Message = {
    _id: `msg-${Date.now()}`,
    conversationId,
    senderId,
    content,
    createdAt: new Date().toISOString(),
    read: false,
  };
  if (!mockMessages[conversationId]) {
    mockMessages[conversationId] = [];
  }
  mockMessages[conversationId].push(message);
  return simulateDelay(message);
}

export async function startConversation(
  participantIds: string[],
  context?: { type: string; id: string; label: string },
): Promise<Conversation> {
  // TODO: POST /api/conversations { participantIds, context }
  const conversation: Conversation = {
    _id: `conv-${Date.now()}`,
    participantIds,
    unreadCount: 0,
    contextType: context?.type as Conversation['contextType'],
    contextId: context?.id,
    contextLabel: context?.label,
    updatedAt: new Date().toISOString(),
  };
  return simulateDelay(conversation);
}
