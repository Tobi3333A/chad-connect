import type { FeedItem, User } from '@/types';
import { CURRENT_USER_ID, mockFeedItems, mockUsers } from '@/data/mock';
import { simulateDelay } from './api';

export async function getFeedItems(): Promise<FeedItem[]> {
  // TODO: GET /api/feed
  return simulateDelay(
    mockFeedItems.map((item) => ({
      ...item,
      author: mockUsers.find((u) => u._id === item.authorId),
    })),
  );
}

export async function getSuggestedConnections(): Promise<User[]> {
  // TODO: GET /api/users/suggested
  return simulateDelay(
    mockUsers.filter((u) => u._id !== CURRENT_USER_ID).slice(0, 4),
  );
}
