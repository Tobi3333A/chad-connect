import type { CreateEventInput, Event } from '@/types';
import { mockEvents } from '@/data/mock';
import { simulateDelay } from './api';

export async function getEvents(filters?: {
  type?: string;
  city?: string;
  query?: string;
}): Promise<Event[]> {
  // TODO: GET /api/events?type=&city=&q=
  let results = [...mockEvents];
  if (filters?.type) {
    results = results.filter((e) => e.type === filters.type);
  }
  if (filters?.city) {
    results = results.filter(
      (e) => e.location.city.toLowerCase() === filters.city!.toLowerCase(),
    );
  }
  if (filters?.query) {
    const q = filters.query.toLowerCase();
    results = results.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.organization.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }
  return simulateDelay(results);
}

export async function getEventById(id: string): Promise<Event | null> {
  // TODO: GET /api/events/:id
  return simulateDelay(mockEvents.find((e) => e._id === id) ?? null);
}

export async function createEvent(input: CreateEventInput): Promise<Event> {
  // TODO: POST /api/events
  const event: Event = {
    _id: `event-${Date.now()}`,
    ...input,
    location: { city: input.city, country: input.country },
    attendeeCount: 1,
    createdBy: 'user-001',
    createdAt: new Date().toISOString(),
  };
  return simulateDelay(event);
}

export async function joinEvent(eventId: string): Promise<{ success: boolean }> {
  // TODO: POST /api/events/:id/join
  return simulateDelay({ success: true });
}
