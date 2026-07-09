import type { CreateHousingInput, HousingPost } from '@/types';
import { enrichWithUser, mockHousingPosts } from '@/data/mock';
import { simulateDelay } from './api';

export async function getHousingPosts(filters?: {
  type?: string;
  city?: string;
  eventId?: string;
}): Promise<HousingPost[]> {
  // TODO: GET /api/housing?type=&city=&eventId=
  let results = enrichWithUser([...mockHousingPosts]);
  if (filters?.type) {
    results = results.filter((h) => h.type === filters.type);
  }
  if (filters?.city) {
    results = results.filter(
      (h) => h.location.city.toLowerCase() === filters.city!.toLowerCase(),
    );
  }
  if (filters?.eventId) {
    results = results.filter((h) => h.eventId === filters.eventId);
  }
  return simulateDelay(results);
}

export async function getHousingById(id: string): Promise<HousingPost | null> {
  // TODO: GET /api/housing/:id
  const post = mockHousingPosts.find((h) => h._id === id);
  if (!post) return simulateDelay(null);
  return simulateDelay(enrichWithUser([post])[0]);
}

export async function createHousingPost(input: CreateHousingInput): Promise<HousingPost> {
  // TODO: POST /api/housing
  const post: HousingPost = {
    _id: `housing-${Date.now()}`,
    ...input,
    location: { city: input.city, country: input.country },
    authorId: 'user-001',
    createdAt: new Date().toISOString(),
  };
  return simulateDelay(enrichWithUser([post])[0]);
}
