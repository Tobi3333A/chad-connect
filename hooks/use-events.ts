import { useCallback, useEffect, useState } from 'react';
import type { Event } from '@/types';
import { getEvents } from '@/services/events';

export function useEvents(filters?: { type?: string; city?: string; query?: string }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEvents(filters);
      setEvents(data);
    } finally {
      setLoading(false);
    }
  }, [filters?.type, filters?.city, filters?.query]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { events, loading, refresh };
}
