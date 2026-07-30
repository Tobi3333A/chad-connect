import type { CreateRideInput, RideRequest } from '@/types';
import { profileRowToUser, rideRowToRequest } from '@/lib/mappers';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/supabase/types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type RideRow = Database['public']['Tables']['ride_requests']['Row'];

type RideWithRelations = RideRow & {
  author: ProfileRow | null;
  event: { title: string } | null;
};

function mapRide(row: RideWithRelations): RideRequest {
  return rideRowToRequest(
    row,
    row.author ? profileRowToUser(row.author) : undefined,
    row.event?.title,
  );
}

const RIDE_SELECT = `
  *,
  author:profiles!ride_requests_author_id_fkey(*),
  event:events!ride_requests_event_id_fkey(title)
`;

export async function getRideRequests(filters?: {
  type?: string;
  eventId?: string;
}): Promise<RideRequest[]> {
  let query = supabase
    .from('ride_requests')
    .select(RIDE_SELECT)
    .order('departure_time', { ascending: true });

  if (filters?.type) {
    query = query.eq('type', filters.type as RideRequest['type']);
  }
  if (filters?.eventId) {
    query = query.eq('event_id', filters.eventId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as RideWithRelations[]).map(mapRide);
}

export async function getRideById(id: string): Promise<RideRequest | null> {
  const { data, error } = await supabase
    .from('ride_requests')
    .select(RIDE_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapRide(data as unknown as RideWithRelations);
}

export async function createRideRequest(input: CreateRideInput): Promise<RideRequest> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('ride_requests')
    .insert({
      type: input.type,
      event_id: input.eventId ?? null,
      from_text: input.from,
      to_text: input.to,
      departure_time: input.departureTime,
      seats_available: input.seatsAvailable ?? null,
      cost_per_person: input.costPerPerson ?? null,
      description: input.description,
      author_id: authData.user.id,
    })
    .select(RIDE_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return mapRide(data as unknown as RideWithRelations);
}
