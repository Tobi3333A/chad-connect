import type { CreateRideInput, RideRequest } from '@/types';
import { enrichWithUser, mockRideRequests } from '@/data/mock';
import { simulateDelay } from './api';

export async function getRideRequests(filters?: {
  type?: string;
  eventId?: string;
}): Promise<RideRequest[]> {
  // TODO: GET /api/rides?type=&eventId=
  let results = enrichWithUser([...mockRideRequests]);
  if (filters?.type) {
    results = results.filter((r) => r.type === filters.type);
  }
  if (filters?.eventId) {
    results = results.filter((r) => r.eventId === filters.eventId);
  }
  return simulateDelay(results);
}

export async function getRideById(id: string): Promise<RideRequest | null> {
  // TODO: GET /api/rides/:id
  const ride = mockRideRequests.find((r) => r._id === id);
  if (!ride) return simulateDelay(null);
  return simulateDelay(enrichWithUser([ride])[0]);
}

export async function createRideRequest(input: CreateRideInput): Promise<RideRequest> {
  // TODO: POST /api/rides
  const ride: RideRequest = {
    _id: `ride-${Date.now()}`,
    ...input,
    authorId: 'user-001',
    createdAt: new Date().toISOString(),
  };
  return simulateDelay(enrichWithUser([ride])[0]);
}
