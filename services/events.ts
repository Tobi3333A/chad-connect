import type { CreateEventInput, Event } from '@/types';
import { eventRowToEvent } from '@/lib/mappers';
import { supabase } from '@/lib/supabase';

export async function getEvents(filters?: {
  type?: string;
  city?: string;
  query?: string;
}): Promise<Event[]> {
  let query = supabase.from('events').select('*').order('start_date', { ascending: true });

  if (filters?.type) {
    query = query.eq('type', filters.type as Event['type']);
  }
  if (filters?.city) {
    query = query.ilike('city', filters.city);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let results = (data ?? []).map(eventRowToEvent);

  if (filters?.query) {
    const q = filters.query.toLowerCase();
    results = results.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.organization.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }

  return results;
}

export async function getEventById(id: string): Promise<Event | null> {
  const { data, error } = await supabase.from('events').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return eventRowToEvent(data);
}

export async function createEvent(input: CreateEventInput): Promise<Event> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('events')
    .insert({
      title: input.title,
      type: input.type,
      organization: input.organization,
      city: input.city,
      country: input.country,
      start_date: input.startDate.slice(0, 10),
      end_date: input.endDate.slice(0, 10),
      description: input.description,
      tags: input.tags,
      created_by: authData.user.id,
      attendee_count: 0,
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);

  const { error: joinError } = await supabase.from('event_attendees').insert({
    event_id: data.id,
    user_id: authData.user.id,
  });

  if (joinError && joinError.code !== '23505') {
    throw new Error(joinError.message);
  }

  const refreshed = await getEventById(data.id);
  return refreshed ?? eventRowToEvent(data);
}

export async function joinEvent(eventId: string): Promise<{ success: boolean }> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new Error('Not authenticated');

  const { error } = await supabase.from('event_attendees').insert({
    event_id: eventId,
    user_id: authData.user.id,
  });

  if (error) {
    if (error.code === '23505') return { success: true };
    throw new Error(error.message);
  }

  return { success: true };
}
