import { useCallback, useEffect, useState } from 'react';
import type { RideRequest } from '@/types';
import { getRideRequests } from '@/services/rides';

export function useRides(filters?: { type?: string; eventId?: string }) {
  const [rides, setRides] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRideRequests(filters);
      setRides(data);
    } finally {
      setLoading(false);
    }
  }, [filters?.type, filters?.eventId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { rides, loading, refresh };
}
